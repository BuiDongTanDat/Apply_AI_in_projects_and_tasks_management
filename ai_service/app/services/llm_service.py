import json
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
import os
import re
import joblib
import pandas as pd
import numpy as np  
from dotenv import load_dotenv
from langdetect import detect 
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.runnables import  RunnablePassthrough, RunnableMap, RunnableLambda, RunnableSequence
from langchain_huggingface import HuggingFaceEmbeddings
from app.services.vector_store import VectorStoreService
from app.schema.output import *
from app.schema.input import *

# Add small imports for date/time calculations
from datetime import datetime

device = "cpu"
print("Current device:", device)

load_dotenv()

# Import config AFTER load_dotenv so config reads .env values at import time
import app.config as config

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

class LLMService:
    def __init__(self, vector_store: Optional[VectorStoreService] = None):
        # Determine if Gemini (Google) should be enabled based on config/API key presence
        gemini_key = getattr(config, "GOOGLE_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
        self.enabled = bool(gemini_key)
        # Choose model name from config or fallback
        self.model_scoring = getattr(
            config, "GEMINI_MODEL_SCORING", getattr(config, "GEMINI_MODEL_GENERIC", "gemini-1.5-flash")) 

        if self.enabled:
            print("[LLM] Gemini enabled with model:", self.model_scoring)
        else:
            print("[LLM] Gemini disabled (missing API key).")

        # Vector store instance (injected or created)
        self.vector_store = vector_store or VectorStoreService()

        # Load LLM chỉ khi enabled; nếu không thì giữ là None để tránh lỗi runtime
        if self.enabled:
            try:
                self.llm = ChatGoogleGenerativeAI(
                    model=getattr(config, "GEMINI_MODEL_GENERIC", "gemini-2.5-flash"),
                    temperature=0.7,
                    max_tokens=None,
                    timeout=None,
                    max_retries=2,
                )
            except Exception as e:
                log.exception("Failed to initialize ChatGoogleGenerativeAI, disabling LLM: %s", e)
                self.llm = None
                self.enabled = False
        else:
            self.llm = None

        # Load embeddings model (HuggingFaceEmbeddings wrapper from langchain)
        try:
            self.embed_model = HuggingFaceEmbeddings(
                model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                model_kwargs={"device": device}
            )
        except Exception as e:
            log.exception("Failed to load HuggingFaceEmbeddings model: %s", e)
            self.embed_model = None


        self.model_dir = Path(__file__).resolve().parent.parent / "models"
        model_path = self.model_dir / "xgb_storypoint.pkl"
        scaler_path = self.model_dir / "scaler.pkl"
        config_path = self.model_dir / "config.json"
        
        # Load models
        try:
            self.xgb_model = joblib.load(model_path)
            if self.xgb_model:
                log.info("Đã load XGBoost model.")
        except FileNotFoundError:
            log.warning(f"Không tìm thấy file model: {model_path}")
            self.xgb_model = None

        try:
            self.scaler = joblib.load(scaler_path)
            if self.scaler:
                log.info("Đã load Scaler.")
        except FileNotFoundError:
            log.warning(f"Không tìm thấy file scaler: {scaler_path}")
            self.scaler = None

        try:
            with open(config_path, "r") as f:
                self.config = json.load(f)
        except FileNotFoundError:
            log.warning(f"Đã load config: {config_path}")
            self.config = {}
        
    # HÀM TẠO TASK (COMPOSITION) - DÙNG RETRIEVER LẤY NGỮ CẢNH
    def compose_with_llm(self, user_input: str, project_id: Optional[str] = None) -> ComposeOut:
        """
        Tạo task mới. **Sử dụng Retriever** để lấy 10 task có ngữ nghĩa liên quan nhất 
        dựa trên user_input làm ngữ cảnh.
        """
        
        lang_name = _detect_language(user_input)
        log.info(f"Phát hiện ngôn ngữ: {lang_name}")

        # 1. Lấy ngữ cảnh bằng Retriever (thực hiện truy vấn trực tiếp)
        # Lưu ý là lấy các tasks trong dự án hiện tại, chứ không phải là các task liên quan đến query không
        retrieved_docs = self.vector_store.retrieve_tasks_for_project(
            k=10,
            project_id=project_id   # <-- giới hạn theo project nếu được cung cấp
        )
        if not retrieved_docs:
            log.info("Không có tài liệu liên quan.")
        else: 
            log.info(f"Đã truy xuất {len(retrieved_docs)} tài liệu liên quan.")
        
        # Build a compact context string from retrieved docs
        context_text = "\n\n".join(
            [f"- {d.get('metadata', {}).get('title', '')}: {d.get('content', '')}" for d in (retrieved_docs or [])]
        ) or "Không có ngữ cảnh liên quan."

        # 2. Tạo prompt 
        template = """
            Bạn là một trợ lý AI chuyên phân tích và chuyển đổi mô tả công việc thành cấu trúc nhiệm vụ chi tiết **dạng JSON**.
            
            Danh sách các nhiệm vụ có liên quan gần nhất của dự án:
            {context}

            Dựa vào danh sách liên quan ở trên để hiểu ngữ cảnh dự án (ví dụ: công nghệ đang dùng, tiến độ hiện tại, dự án đang làm về cái gì,...).

            Nội dung mô tả nhiệm vụ mới:
            {user_input}

            Yêu cầu đầu ra:
            - Tạo một nhiệm vụ mới dựa trên **Nội dung mô tả công việc mới** nhưng phải **phù hợp với Ngữ cảnh Liên Quan (Retrieved Context)**.
            - Viết bằng ngôn ngữ **{lang}** (cho tất cả tiêu đề, mô tả).
            - Trả về **JSON hợp lệ** (đúng theo cấu trúc mẫu).
            - Mỗi nhiệm vụ chính có thể có **từ 0 cho đến tối đa 3 subtasks** phù hợp.
            - Lưu ý: KHÔNG nhất thiết luôn trả về 3 subtasks. Số subtasks có thể là từ 0 đến 3; nếu nhiệm vụ đơn giản thì ưu tiên 0-1 subtasks.
            - **Chỉ trả về JSON thuần túy**, không kèm lời giải thích, markdown (```json).

            Cấu trúc JSON bắt buộc:
                {{
                "title": "string",
                "description": "string (mô tả chi tiết, ưu tiên theo dạng Given–When–Then nhưng viết dưới dạng Ngôn NGữ Tự Nhiên)",
                "tags": ["string"],
                "priority": "HIGH | MEDIUM | LOW",
                "due_date": "YYYY-MM-DD" (Dự kiến ngày hoàn thành, nếu có),
                "subtasks": [
                    {{
                    "title": "string",
                    "description": "string (chi tiết)",
                    "tags": ["string"],
                    "priority": "HIGH | MEDIUM | LOW"
                    }}
                ]
                }}
    """
        prompt = PromptTemplate(template=template, input_variables=["context", "user_input", "lang"])
        
        # Tạo chain
        chain = (
            {
                "context": lambda x: x["context"],
                "user_input": lambda x: x["user_input"],
                "lang": lambda x: x["lang"],
            }
            | prompt
            | self.llm
            | PydanticOutputParser(pydantic_object=ComposeOut)
        )

        # 3. Invoke LLM và Xử lý Kết quả
        response = ""
        try:
            response = chain.invoke({
                "context": context_text,
                "user_input": user_input, 
                "lang": lang_name
            })

            if isinstance(response, ComposeOut):
                log.info("Tạo task thành công (ComposeOut).")
                return response

            if isinstance(response, (dict, list)):
                return response

            try:
                parsed = _extract_and_parse_json(str(response))
                log.info("Tạo task thành công (parsed JSON).")
                return parsed
            except Exception as e:
                log.warning("Cannot parse JSON from LLM response: %s", e)
                return {"raw": response}
        except json.JSONDecodeError:
            log.warning("Không parse được JSON — Trả về raw text.")
            return {"raw": response}
        except Exception as e:
            log.exception("LLM chain.invoke/run failed")
            return {"error": str(e)}

    # HÀM GỢI Ý GÁN NGƯỜI THỰC HIỆN (ASSIGNMENT) 
    def assign_candidate(self, task: dict, project_id: str, requirement_text: Optional[str] = None) -> Dict[str, Any]:
        """
        Gán người dùng phù hợp, sử dụng PydanticOutputParser để đảm bảo cấu trúc.
        Hàm này tự động lấy dữ liệu từ Vector Store.
        """
        lang_name = _detect_language(requirement_text or "vi")

        if not project_id:
            log.warning("Task không có project_id.")
            return {"error": "Missing project_id in task data."}

        try:
            # Lấy dữ liệu ngữ cảnh từ Vector Store
            project_users_docs = self.vector_store.retrieve_users_for_project(project_id=project_id, k=50)
            project_tasks_docs = self.vector_store.retrieve_tasks_for_project(project_id=project_id, k=100)
            users_context = [doc.get("metadata") for doc in project_users_docs]
            tasks_context = [doc.get("metadata") for doc in project_tasks_docs]
            
            # Template và Prompt (không đổi)
            template = """
                    Bạn là một AI có nhiệm vụ phân công người thực hiện phù hợp nhất cho một nhiệm vụ. Bạn nhận vào các dữ liệu sau:
                    - task: là Mô tả nhiệm vụ cần phân công.
                    - users: là Danh sách chứa các thành viên tiềm năng.
                    - tasks: là Danh sách chứa lịch sử các nhiệm vụ đã/đang thực hiện (để tính tải công việc).

                    Yêu cầu phân công bổ sung: {requirement}

                    Hướng dẫn:
                    - Chọn thành viên phù hợp nhất từ danh sách 'users' dựa trên các tiêu chí sau:
                      1) **Mức độ phù hợp vị trí** (role/position khớp với tags/mô tả nhiệm vụ).
                      2) **Tải công việc hiện tại** (số lượng nhiệm vụ TODO/IN_PROGRESS được giao; ưu tiên tải nhẹ, tránh người có >4 task đang hoạt động trừ khi họ có thành tích DONE vượt trội).
                      3) **Năng lực đã chứng minh** (số lượng nhiệm vụ DONE hoàn thành).
                      4) **Số năm kinh nghiệm (yearOfExperience)** (dùng làm yếu tố phá vỡ sự đồng đều).
                    - Trả về **CHỈ MỘT** đối tượng JSON thuần túy (không giải thích bên ngoài JSON) với cấu trúc sau:
                      {{
                            "assignee": {{
                                "id": "string (original_id)",
                                "email": "string",
                                "name": "string",
                                "position": "string"
                            }},
                            "reason": "string"
                        }}
                        "reason": "string (lời giải thích ngắn gọn, liệt kê tải công việc, số task đã DONE, kinh nghiệm, và mức độ phù hợp vị trí **bằng ngôn ngữ {lang}**)"
                      }}
                    - Sử dụng chính xác dữ liệu được cung cấp (task/users/tasks) để tính toán, không tự thêm thông tin bên ngoài.

                    Dữ liệu ngữ cảnh (chỉ để tham khảo):
                    task: {task}
                    users: {users}
                    tasks: {tasks}
                    """
            prompt = PromptTemplate(template=template, input_variables=["task", "users", "tasks", "requirement", "lang"])
            

            chain = prompt | self.llm | PydanticOutputParser(pydantic_object=AssignOut)
            

            llm_assignment_suggestion: AssignOut = chain.invoke({
                "task": json.dumps(task, ensure_ascii=False),
                "users": json.dumps(users_context, ensure_ascii=False),
                "tasks": json.dumps(tasks_context, ensure_ascii=False),
                "requirement": requirement_text or "Không có",
                "lang": lang_name
            })

            # Kiểm tra để chắc chắn parser hoạt động
            if isinstance(llm_assignment_suggestion, AssignOut):
                log.info("Gán người thực hiện thành công (AssignOut).")
            
            # Lấy các user liên quan bằng vector search
            related_users = []
            if requirement_text:
                related_users = self.vector_store.retrieve_users_for_query(requirement_text, k=5)

            # *** KẾT HỢP KẾT QUẢ ***
            # Trả về một dictionary chứa cả kết quả từ LLM (đã được parse) và kết quả từ vector store
            return {
                "assignment": llm_assignment_suggestion.model_dump(),  # Chuyển object Pydantic thành dict
                "related_users": related_users
            }
            
        except Exception as e:
            log.exception("Gán người thực hiện thất bại")
            return {"error": str(e)}
    
    
    # HÀM DUPLICATE FINDER
    def find_duplicate_tasks(self, task: dict, threshold: float = 0.25, k: int = 3, project_id: Optional[str] = None) -> DuplicateTaskOut:
        """
        Tìm các nhiệm vụ trùng lặp dựa trên embedding similarity/distance.
        """
        try:
            
            subtasks_text = " ".join([f"{st.get('title','')} {st.get('description','')}" for st in task.get("subtasks", []) or []])
            assignee_name = (task.get("assignee") or {}).get("name", "")
            tags_text = " ".join(task.get("tags", []))
            priority = task.get("priority", "")
            
            query_text = " ".join([
                task.get("title", ""),
                task.get("description", ""),
                tags_text,
                priority,
                assignee_name,
                subtasks_text
            ])
            log.info(f"Đang kiểm tra duplicate...")
            retrieved = self.vector_store.retrieve_tasks_with_scores(query=query_text, k=k, project_id=project_id)
            #print(json.dumps(retrieved, indent=2, ensure_ascii=False))

            duplicates = []
            for doc in retrieved:
                score = None
                if isinstance(doc, dict):
                    score = doc.get("score", doc.get("similarity", doc.get("distance", None)))
                try:
                    if (score <= threshold):
                        duplicates.append({                
                            "metadata": doc.get("metadata"),
                            "score": score,
                            "content": doc.get("content"),
                            "raw": doc
                        })
                        
                except Exception:
                    # ignore malformed score and continue
                    continue

            return DuplicateTaskOut(
                duplicates=[DuplicateDoc(**d) for d in duplicates],
                query_embedding=retrieved[0].get("embedding", []) if retrieved else [],
                nearest_tasks=retrieved
            )
        except Exception as e:
            log.exception("TÌm kiếm trùng lặp thất bại")
            return {"error": str(e)}
        
    # HÀM DỰ ĐOÁN STORY POINT
    def predict_story_point(self, text: str) -> float:
        """
        Dự đoán story point thô sử dụng XGBRegressor + embeddings + 2 feature scaled.
        - Nhận đầu vào json: 
            {
            text: "string" -- Nhớ combine title + description trước khi truyền vào
            }
        """
        
        if not self.xgb_model or not self.embed_model or not hasattr(self, "scaler"):
            raise RuntimeError("Model, embeddings hoặc scaler chưa được load!")

        # ---- Embedding ----
        # DÙng model embeđing đã load 
        emb_list = self.embed_model.embed_query(text)
        emb = np.array(emb_list, dtype=float)
        # normalize thành vector đơn vị để giống với behavior trước đây
        norm = np.linalg.norm(emb)
        if norm > 0:
            emb = emb / norm

        # Tạo thêm đặc trưng (word count, char count)
        word_count = len(text.split())
        char_count = len(text)
        extra = pd.DataFrame([[word_count, char_count]], columns=["word_count", "char_count"])
        extra_scaled = self.scaler.transform(extra)  # MinMaxScaler transform

        # Kết hợp embedding + extra features 
        X_input = np.hstack([emb.reshape(1, -1), extra_scaled])  # shape (1, 386)

        # Dự đoán
        pred = self.xgb_model.predict(X_input)[0]

        return round(float(pred), 2)

    # HÀM GỢI Ý STORY POINT THEO PLANNING POKER
    def suggest_story_point(self, value: float) -> str:
        """
        Chuyển giá trị thô sang Story Point gần nhất theo chuẩn Planning Poker."""
        STORY_POINTS = [0.5, 1, 2, 3, 5, 8, 13]
        
        diffs = [(abs(value - sp), sp) for sp in STORY_POINTS]
        diffs.sort(key=lambda x: x[0])

        best = diffs[0][1]
        second = diffs[1][1]

        # Nếu giá trị nằm giữa 2 story point gần nhau
        if abs(value - best) < 0.4 and abs(value - second) < 0.4:
            return f"{best} - {second}"
        return str(best)

    # REPORT / METRICS CHAIN & LOCAL CALC
    # --- GENERATE SPRINT REPORT
    def generate_sprint_report(self, tasks: List[Dict[str, Any]], use_llm_summary: bool = True) -> Dict[str, Any]:
        """
        Tạo sprint report: flatten subtasks, tính metrics local, và tóm tắt bằng LLM nếu yêu cầu.
        """
        all_tasks = []

        def flatten(task_list, parent_title=None):
            for t in task_list:
                flat_task = t.copy()
                flat_task['parent_task'] = parent_title
                # parse dates
                for date_field in ['start_date', 'end_date', 'completed_at']:
                    if flat_task.get(date_field):
                        try:
                            flat_task[date_field] = datetime.fromisoformat(flat_task[date_field])
                        except Exception as e:
                            log.warning(f"Cannot parse {date_field}={flat_task[date_field]}: {e}")
                            flat_task[date_field] = None
                    else:
                        flat_task[date_field] = None
                # ensure story_points is numeric
                flat_task['story_points'] = float(flat_task.get('story_points', 0))
                all_tasks.append(flat_task)
                # recursively flatten subtasks
                subtasks = t.get('subtasks', [])
                if subtasks:
                    flatten(subtasks, parent_title=t.get('title'))

        flatten(tasks)

        # --- Metrics Local
        total_tasks = len(all_tasks)
        completed_tasks = len([t for t in all_tasks if str(t.get('status')).lower() == 'done'])
        pending_tasks = total_tasks - completed_tasks
        total_story_points = sum(t['story_points'] for t in all_tasks)
        avg_story_points = total_story_points / total_tasks if total_tasks else 0
        progress_percent = (completed_tasks / total_tasks * 100) if total_tasks else 0

        metrics = {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "total_story_points": total_story_points,
            "average_story_points": round(avg_story_points, 2),
            "progress_percent": round(progress_percent, 2),
        }

        report = {
            "metrics": metrics,
            "tasks": all_tasks
        }

        # --- Optional: LLM Summary of tasks & metrics ---
        if use_llm_summary:
            try:
                report['llm_summary'] = self.summarize_with_llm(all_tasks)
            except Exception as e:
                log.warning(f"LLM summary failed: {e}")
                report['llm_summary'] = "LLM summary failed."

        return report

    # LLM SUMMARY - Test
    def summarize_with_llm(self, text: str) -> Dict[str, Any]:
        """
        Tóm tắt text bằng LLM nếu khả dụng, fallback bằng extractive summarization.
        Luôn trả về dict chuẩn JSON.
        """
        # --- 1) LLM summary ---
        if hasattr(self, "enabled") and self.enabled and hasattr(self, "llm") and self.llm:
            try:
                prompt_template = """
                Bạn là một AI Agile assistant chuyên về quản lý Sprint. 
                Bạn nhận vào dữ liệu các task của một Sprint dưới dạng JSON:
                {text}

                Các yêu cầu khi trả về:
                1. Viết **summary tự nhiên**, ngắn gọn, dễ hiểu cho PM / stakeholder.
                2. Highlight:
                - Trends (xu hướng tiến độ)
                - Risks (rủi ro)
                - Bottlenecks (nút thắt)
                3. Trả về **CHỈ JSON**, KHÔNG kèm markdown hay giải thích nào khác.
                4. JSON phải có cấu trúc sau (bắt buộc):

                {{
                "summary": "string (tóm tắt ngắn gọn về sprint)", 
                "metrics": {{
                    "velocity": number (tổng story points hoàn thành trong sprint),
                    "burndown_status": "string (on track, behind schedule, ahead of schedule)",
                    "average_lead_time": number (nếu có thể tính, phút/giờ/ngày),
                    "average_cycle_time": number (nếu có thể tính, phút/giờ/ngày)
                }},
                "recommendations": "string optional (khuyến nghị cho sprint tiếp theo)"
                }}

                **Lưu ý quan trọng**:
                - Nếu một số giá trị metrics không thể tính, trả về null.
                - Không thêm bất kỳ ký tự, markdown, giải thích hay code block nào xung quanh JSON.
                - Chỉ trả về **JSON hợp lệ**.
                """

                prompt = PromptTemplate(template=prompt_template, input_variables=["text"])
                chain = prompt | self.llm | PydanticOutputParser(pydantic_object=SprintSummary)

                resp = chain.invoke({"text": text})
                return resp
        

                

            except Exception as e:
                log.warning(f"LLM summarization failed: {e}")
                return {"summary": "LLM summary failed.", "metrics": {}, "recommendations": ""}

        else:
            log.warning("LLM not enabled or not set up; skipping LLM summarization.")
            # fallback
            try:
                sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
                return {"summary": " ".join(sentences[:3]), "metrics": {}, "recommendations": ""}
            except Exception as e:
                log.warning(f"Fallback summarization failed: {e}")
                return {"summary": "Summary failed due to internal error.", "metrics": {}, "recommendations": ""}

    # PIPELINE SINH TASK
    def generate_task(
        self,
        user_input: str,
        project_id: Optional[str] = None,
        requirement_text: Optional[str] = None,
        duplicate_threshold: float = 0.25,
        duplicate_k: int = 3,
    ) -> Dict[str, Any]:
        """
        Pipeline hoàn chỉnh để sinh task, từ input của người dùng đến các gợi ý chi tiết.
        Sử dụng LangChain Expression Language (LCEL) để kết nối các bước.
        """

        # ĐỊnh nghĩa các runnable 

        # 1) Tạo task từ input của người dùng
        compose_chain = RunnableLambda(
            lambda x: self.compose_with_llm(
                user_input=x["user_input"],
                project_id=x.get("project_id")
            ).model_dump() # Sử dụng .model_dump() để chuyển Pydantic model thành dict
        )

        # 2) Dự đoán Story Point
        story_point_chain = RunnableLambda(
            lambda x: self.predict_story_point(
                text=_build_full_text(x.get("composed_task"), fallback=x["user_input"])
            )
        )

        # 3) Gợi ý Story Point
        sp_suggest_chain = RunnableLambda(
            lambda x: (
                self.suggest_story_point(float(x["estimated_story_point"]))
                if x.get("estimated_story_point") is not None
                else None
            )
        )
        
        # 4) Tìm kiếm các task trùng lặp
        find_duplicates_chain = RunnableLambda(
            lambda x: self.find_duplicate_tasks(
                task=x.get("composed_task"),
                threshold=duplicate_threshold,
                k=duplicate_k,
                project_id=x.get("project_id")
            ).model_dump() # Sử dụng .dict() nếu DuplicateTaskOut là Pydantic model
        )


        # 5. Gợi ý gán người thực hiện
        assign_chain = RunnableLambda(
            lambda x: self.assign_candidate(
                task=x["composed_task"],
                project_id=x.get("project_id"),
                requirement_text=x.get("requirement_text")
            )
        )

        # --- Xây dựng PIPELINE chính ---
        # Sử dụng RunnablePassthrough và RunnableMap (còn gọi là dictionary comprehension)
        # để truyền dữ liệu qua các bước và thêm kết quả mới vào.
        
        full_chain = (
            # Bước 1: Bắt đầu với input ban đầu và tạo task - đầu ra sẽ có thêm "composed_task" và truyền vào bước sau
            # Output: {"user_input", "project_id", "requirement_text", "composed_task"}
            RunnablePassthrough.assign(composed_task=compose_chain)
            
            # Bước 2: Dựa vào task đã tạo, dự đoán story point
            # Output: thêm key: "estimated_story_point"
            .assign(estimated_story_point=story_point_chain)
            
            # Bước 3: Dựa vào story point đã dự đoán, gợi ý giá trị planning poker
            # Output: thêm key: "story_point_suggestion"
            .assign(story_point_suggestion=sp_suggest_chain)
            
            # Bước 4: Tìm các task trùng lặp
            # Output: thêm key: "duplicates"
            .assign(duplicates=find_duplicates_chain)

            # Bước 5: Gợi ý gán người thực hiện
            # Output: thêm key: "assignment" --> Ta gọi tuần tự để tránh call API LLM liên tục
            .assign(assignment=assign_chain)


        )

        # --- Chạy PIPELINE ---
        input_data = {
            "user_input": user_input,
            "project_id": project_id,
            "requirement_text": requirement_text,
        }

        # result sẽ là một dictionary chứa kết quả từ tất cả các bước
        result = full_chain.invoke(input_data)


        return {
            "user_input": {
                "user_input": user_input,
                "project_id": project_id,
                "requirement_text": requirement_text
            },
            "composed_task": result.get("composed_task"),
            "estimated_story_point": result.get("estimated_story_point"),
            "story_point_suggestion": result.get("story_point_suggestion"),
            "duplicates": result.get("duplicates"),
            "assignment": result.get("assignment"),
        }
    



    # -------------------- DEBUG / TESTING --------------------
    def test_retrieve_tasks(self, query: str, project_id: Optional[str] = None, k: int = 5):
        """
        Test retrieve tasks từ vector store theo project_id
        """
        tasks = self.vector_store.retrieve_tasks_for_query(query=query, k=k, project_id=project_id)
        print(f"Retrieved {len(tasks)} task(s) for project_id={project_id}")
        for t in tasks:
            print(f"- {t['metadata'].get('title')} | projectId={t['metadata'].get('projectId')}")
        return tasks

    def test_retrieve_users(self, query: str, project_id: Optional[str] = None, k: int = 5):
        """
        Test retrieve users từ vector store theo project_id
        """
        users = self.vector_store.retrieve_users_for_query(task_text=query, k=k, project_id=project_id)
        print(f"Retrieved {len(users)} user(s) for project_id={project_id}")
        for u in users:
            print(f"- {u['metadata'].get('name')} | projectId={u['metadata'].get('projectId')}")
        return users

    def test_retrieve_with_scores(self, query: str, project_id: Optional[str] = None, k: int = 5):
        """
        Test similarity_search_with_score và filter theo project_id
        """
        results = self.vector_store.retrieve_tasks_with_scores(query=query, k=k, project_id=project_id)
        print(f"Retrieved {len(results)} task(s) with scores for project_id={project_id}")
        for r in results:
            print(f"- {r['metadata'].get('title')} | score={r['score']} | projectId={r['metadata'].get('projectId')}")
        return results
    
    def test_retrieve_tasks_for_project(self, project_id: str, k: int = 5):
        """
        Test retrieve tasks chỉ theo project_id
        """
        tasks = self.vector_store.retrieve_tasks_for_project(k=k, project_id=project_id)
        print(f"Retrieved {len(tasks)} task(s) for project_id={project_id}")
        for t in tasks:
            print(f"- {t['metadata'].get('title')} | projectId={t['metadata'].get('projectId')}")
        return tasks

    def test_retrieve_users_for_project(self, project_id: str, k: int = 5):
        """
        Test retrieve users chỉ theo project_id
        """
        users = self.vector_store.retrieve_users_for_project(k=k, project_id=project_id)
        print(f"Retrieved {len(users)} user(s) for project_id={project_id}")
        for u in users:
            print(f"- {u['metadata'].get('name')} | projectId={u['metadata'].get('projectId')}")
        return users
    

# ---------------------UTILS HỖ TRỢ---------------------

# Hàm phát hiện ngôn ngữ (dùng langdetect)
def _detect_language(text: str) -> str:
    """Phát hiện ngôn ngữ của text (Vietnamese hoặc English)."""
    try:
        lang_code = detect(text)
        return "Vietnamese" if lang_code.startswith("vi") else "English"
    except Exception:
        return "English"

# Hàm hỗ trợ parse JSON từ text response của LLM
def _extract_and_parse_json(text: str) -> Any:
    """
    - Loại bỏ code fences (```json / ```).
    - Tìm substring bắt đầu với first '{' và kết thúc với last '}'.
    - Loại bỏ trailing commas trước '}' hoặc ']' (simple cleanup).
    - Cố parse bằng json.loads, ném exception nếu không parse được.
    """
    if not text:
        raise ValueError("Empty response")
    s = text.strip()
    # remove code fences
    s = s.replace("```json", "").replace("```", "").strip()
    # Find the outermost JSON object (from first { to last })
    first = s.find("{")
    last = s.rfind("}")
    if first == -1 or last == -1 or last < first:
        raise ValueError("No JSON object found in response")
    candidate = s[first:last+1]
    # Remove trailing commas before } or ]
    candidate = re.sub(r",\s*(\}|])", r"\1", candidate)
    # Optional: collapse control chars that may break json
    # Try parsing
    return json.loads(candidate)


# Hàm hỗ trợ build doc từ task object để truyền vào estimate
def _build_full_text(task: dict, fallback: str = "") -> str:
    """
    Tạo text đầu vào cho model ML bằng cách gom toàn bộ thông tin cần thiết.
    """
    if not task:
        return fallback

    parts = []
    parts.append(task.get("title", ""))
    parts.append(task.get("description", ""))

    tags = task.get("tags", [])
    if tags:
        parts.append("Tags: " + ", ".join(tags))

    priority = task.get("priority")
    if priority:
        parts.append(f"Priority: {priority}")

    # Subtasks
    for st in task.get("subtasks", []):
        st_title = st.get("title", "")
        st_desc = st.get("description", "")
        parts.append(f"Subtask: {st_title} - {st_desc}")

    return " ".join(filter(None, parts)) or fallback
