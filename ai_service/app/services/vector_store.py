import os
import json
import logging
from typing import List, Dict, Any, Optional
from langchain_postgres import PGVector
from langchain_huggingface import HuggingFaceEmbeddings

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

USERS_FILE = "./app/data/users.json"
TASKS_FILE = "./app/data/tasks.json"

USER_SKILLS = {
    "MANAGER": ["team leadership", "project planning", "risk management", "communication"],
    "DEV_FE": ["React", "Vue", "HTML", "CSS", "JavaScript", "UI optimization", "animation", "responsive layout"],
    "DEV_BE": ["Node.js", "Python", "SQL", "REST API", "authentication", "security", "scalability", "microservices"],
    "DEV_FULLSTACK": ["React", "Node.js", "SQL", "API design", "CI/CD", "testing"],
    "DEV_MOBILE": ["Android", "iOS", "Flutter", "React Native", "mobile UI", "mobile performance"],
    "DEV_OPS": ["Docker", "Kubernetes", "CI/CD", "Linux", "Networking", "Monitoring", "Cloud AWS/GCP"],
    "TESTER": ["manual testing", "automation testing", "Selenium", "QA process"],
    "DESIGNER": ["Figma", "UI/UX", "wireframe", "prototype", "illustration", "design system"],
    "BUSINESS_ANALYST": ["requirements analysis", "diagramming UML/BPMN", "stakeholder communication", "documentation"]
}

def user_role_description(position: str) -> str:
    mapping = {
        "MANAGER": "lãnh đạo nhóm, phân công nhiệm vụ, giám sát tiến độ dự án",
        "DEV_FE": "phát triển giao diện người dùng và tối ưu trải nghiệm",
        "DEV_BE": "xây dựng API, xử lý logic phía server và kết nối cơ sở dữ liệu",
        "DEV_FULLSTACK": "làm việc cả frontend và backend, có khả năng triển khai toàn bộ sản phẩm",
        "DEV_MOBILE": "phát triển ứng dụng di động Android/iOS",
        "DEV_OPS": "quản lý hạ tầng, CI/CD và vận hành hệ thống",
        "TESTER": "kiểm thử phần mềm, đảm bảo chất lượng sản phẩm",
        "DESIGNER": "thiết kế giao diện và trải nghiệm người dùng",
        "BUSINESS_ANALYST": "phân tích yêu cầu nghiệp vụ và kết nối giữa team kỹ thuật và khách hàng",
    }
    return mapping.get(position, "thực hiện các nhiệm vụ phù hợp với vai trò của mình")


class VectorStoreService:
    def __init__(self, connection: Optional[str] = None, device: str = "cpu", init_stores: bool = True):

        self.connection = connection or os.getenv("DB_CONNECT_STRING")
        self.device = device

        self.embedding_adapter = HuggingFaceEmbeddings(
            model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
            model_kwargs={"device": device}
        )

        # Vector stores bắt đầu là None và sẽ được tạo khi cần thiết
        self.users_store = None
        self.tasks_store = None

        # Test với file JSON
        self.users_file = USERS_FILE
        self.tasks_file = TASKS_FILE

        if not self.connection:
            log.warning("DB_CONNECTION_STRING chưa được thiết lập. Vector stores sẽ bị vô hiệu hóa cho đến khi có chuỗi kết nối.")
        elif init_stores:
            # try to initialize stores immediately but tolerate failures
            try:
                self._init_stores()
            except Exception as e:
                log.exception("Failed to initialize PGVector stores at init: %s", e)
                self.users_store = None
                self.tasks_store = None

    def _init_stores(self):
        """ Tạo PGVector instances (ném lỗi nếu thư viện bên dưới thất bại). """
        if not self.connection:
            raise ValueError("DB connection string missing")
        
        # Tạo các PGVector
        self.users_store = PGVector(
            embeddings=self.embedding_adapter,
            collection_name="users",
            connection=self.connection,
        )
        self.tasks_store = PGVector(
            embeddings=self.embedding_adapter,
            collection_name="tasks",
            connection=self.connection,
        )
        log.info("PGVector stores initialized.")

    def ensure_stores(self) -> bool:
        """ Kiểm tra các vector store đã được khởi tạo """
        if self.users_store and self.tasks_store:
            return True
        if not self.connection:
            log.warning("Không thể kết nối Databse: connecton string chưa được cấu hình.")
            return False
        try:
            self._init_stores()
            return True
        except Exception as e:
            log.exception("Lỗi: %s", e)
            return False


    def load_raw_users_tasks(self):
        return self._load_json(self.users_file), self._load_json(self.tasks_file)

    def _load_json(self, path: str) -> List[Dict[str, Any]]:
        if not os.path.exists(path):
            log.warning(f"File not found: {path}")
            return []
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)


    # Hàm kiểm tra document đã tồn tại chưa
    def _document_exists(self, store, original_id: str, query_text: Optional[str] = None) -> bool:
        try:
            q = query_text or ""
            # prefer using a filter if supported
            try:
                res = store.similarity_search(q, k=1, filter={"original_id": original_id})
            except TypeError:
                # fallback if the client doesn't accept filter kwarg
                res = store.similarity_search(q, k=5)
            for r in res:
                meta = getattr(r, "metadata", {}) or {}
                if meta.get("original_id") == original_id:
                    return True
            return False
        except Exception as e:
            log.exception("document existence check failed: %s", e)
            return False

    # Hàm xóa document theo original_id
    def _delete_by_original_id(self, store, original_id: str) -> bool:
        try:
            # try delete(filter=...) which some PGVector clients support
            if hasattr(store, "delete"):
                try:
                    store.delete(filter={"original_id": original_id})
                    return True
                except TypeError:
                    # delete signature different -> fallthrough to attempt alternate strategies
                    log.debug("store.delete(filter=...) not supported, will try alternate deletion methods")
                except Exception:
                    # if delete(filter=...) exists but fails, log and continue to fallback
                    log.exception("store.delete(filter=...) failed for original_id=%s", original_id)

            # fallback: search for docs and attempt delete by ids if available
            try:
                cands = store.similarity_search("", k=50)
            except TypeError:
                cands = store.similarity_search("", k=50)
            ids_to_delete = []
            for r in cands:
                meta = getattr(r, "metadata", {}) or {}
                if meta.get("original_id") == original_id:
                    if hasattr(r, "id"):
                        ids_to_delete.append(r.id)
            if ids_to_delete and hasattr(store, "delete"):
                try:
                    store.delete(ids=ids_to_delete)
                    return True
                except Exception:
                    log.exception("store.delete(ids=...) failed for ids: %s", ids_to_delete)
            log.warning("Could not delete documents for original_id=%s. Client may not support deletion by metadata.", original_id)
        except Exception as e:
            log.exception("delete_by_original_id failed: %s", e)
        return False

    # Tạo/update embeddings
    def create_or_update_embeddings(self, force: bool = False):
        # Ensure stores exist
        if not self.ensure_stores():
            log.warning("Vector stores không khả dụng. Skipping create_or_update_embeddings.")
            return

        users, tasks = self.load_raw_users_tasks()

        # USERS
        if users:
            texts, metadatas = [], []
            for u in users:
                text = f"{u.get('name','')}. Vị trí: {user_role_description(u.get('position',''))}. Kỹ năng: {', '.join(USER_SKILLS.get(u.get('position',''),[]))}. Kinh nghiệm: {u.get('yearOfExperience',0)} năm."

                # If không phải Force = True, bỏ qua user nếu đã tồn tại
                try:
                    if not force and self._document_exists(self.users_store, u['id'], text):
                        log.info("Skipping user %s: đã tồn tại trong vector store", u.get('id'))
                        continue
                    # Nếu Force = True, xóa user hiện tại
                    if force:
                        deleted = self._delete_by_original_id(self.users_store, u['id'])
                        if deleted:
                            log.info("Xóa user %s do force=True", u.get('id'))
                except Exception:
                    log.exception("Lỗi trong quá trình xử lý user: ", u.get('id'))

                texts.append(text)
                metadatas.append({
                    "original_id": u['id'],
                    "name": u.get('name'),
                    "email": u.get('email'),
                    "position": u.get('position'),
                    "year_of_experience": u.get('yearOfExperience'),
                    "type": "user"
                })
            try:
                if texts:
                    self.users_store.add_texts(texts, metadatas)
                    log.info(f"{len(texts)} new users embeddings saved.")
                else:
                    log.info("No new user embeddings to add.")
            except Exception as e:
                log.exception("Failed to add user embeddings: %s", e)

        # TASKS
        if tasks:
            tasks_by_parent = {t['id']: [] for t in tasks}
            for t in tasks:
                if t.get("parentTaskId"):
                    tasks_by_parent.setdefault(t["parentTaskId"], []).append(t)

            parent_tasks = [t for t in tasks if not t.get("parentTaskId")]

            texts, metadatas = [], []
            for t in parent_tasks:
                subtasks = tasks_by_parent.get(t['id'], [])
                subtasks_descriptions = []
                if subtasks:
                    for st in subtasks:
                        subtasks_descriptions.append(f"- {st.get('title','')}: {st.get('description','')}")
                subtasks_full_text = "\n".join(subtasks_descriptions)

                document_text = (
                    f"{t.get('title','')}\n"
                    f"{t.get('description','')}\n"
                    f"Dự án: {t.get('projectId','')}\n"
                    "Các nhiệm vụ con:\n"
                    f"{subtasks_full_text if subtasks_full_text else 'Chưa có bước thực hiện chi tiết.'}"
                ).strip()

                # Bỏ qua nếu đã tồn tại trừ khi ép buộc tạo lại (force=True)
                try:
                    if not force and self._document_exists(self.tasks_store, t['id'], document_text):
                        log.info("Skipping task %s: already exists in vector store", t.get('id'))
                        continue
                    if force:
                        deleted = self._delete_by_original_id(self.tasks_store, t['id'])
                        if deleted:
                            log.info("Deleted existing vectors for task %s due to force=True", t.get('id'))
                except Exception:
                    log.exception("Existence/deletion check failed for task %s; proceeding to add", t.get('id'))

                texts.append(document_text)
                metadatas.append({
                    "original_id": t['id'],
                    "title": t.get('title'),
                    "description": t.get('description'),
                    "status": t.get('status'),
                    "project_id": t.get('projectId'),
                    "implementor_id": t.get('implementorId'),
                    "parent_task_id": t.get('parentTaskId'),
                    "type": "task"
                })
            try:
                if texts:
                    self.tasks_store.add_texts(texts, metadatas)
                    log.info(f"{len(texts)} new tasks embeddings saved.")
                else:
                    log.info("No new task embeddings to add.")
            except Exception as e:
                log.exception("Failed to add task embeddings: %s", e)

    # Hàm tìm kiếm task liên quan
    def retrieve_tasks_for_query(self, query: str, k: int = 5, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if not self.tasks_store:
            log.warning("tasks_store not initialized. retrieve_tasks_for_query returns empty list.")
            return []
        filters = {"project_id": project_id} if project_id else None
        try:
            results = self.tasks_store.similarity_search(query, k=k, filter=filters)
        except TypeError:
            results = self.tasks_store.similarity_search(query, k=k)
        except Exception as e:
            log.exception("similarity_search failed: %s", e)
            return []

        # Loại bỏ các document trùng original_id, giữ kết quả đầu tiên
        seen = set()
        unique = []
        for r in results:
            meta = getattr(r, "metadata", {}) or {}
            orig = meta.get("original_id")
            if orig and orig in seen:
                continue
            if orig:
                seen.add(orig)
            # Trả về page_content (document text) và metadata rõ ràng
            unique.append({"content": r.page_content, "metadata": meta})
            if len(unique) >= k:
                break
        return unique

    # Hàm tìm kiếm task liên quan kèm score
    def retrieve_tasks_with_scores(self, query: str, k: int = 5, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """ Tìm kiếm các task liên quan kèm score (cosine distance - Càng thấp -> Khoảng cách càng ngắn --> Càng giống) tương tự dựa trên truy vấn. """
        if not self.tasks_store:
            log.warning("tasks_store not initialized. retrieve_tasks_with_scores returns empty list.")
            return []
        filters = {"project_id": project_id} if project_id else None
        try:
            results = self.tasks_store.similarity_search_with_score(query, k=k, filter=filters)
        except TypeError:
            results = self.tasks_store.similarity_search_with_score(query, k=k)
        except Exception as e:
            log.exception("similarity_search_with_score failed: %s", e)
            return []

        # results is list of (doc, score)
        seen = set()
        unique = []
        for item in results:
            doc, score = item[0], item[1]
            meta = getattr(doc, "metadata", {}) or {}
            orig = meta.get("original_id")
            if orig and orig in seen:
                continue
            if orig:
                seen.add(orig)
            unique.append({"content": doc.page_content, "metadata": meta, "score": score})
            if len(unique) >= k:
                break
        return unique

    # Hàm lấy các task trong một project
    def retrieve_tasks_for_project(self, project_id: str, k: int = 10) -> List[Dict[str, Any]]:
        if not self.tasks_store:
            log.warning("tasks_store not initialized. retrieve_tasks_for_project returns empty list.")
            return []
        filters = {"project_id": project_id}
        try:
            results = self.tasks_store.similarity_search("", k=k, filter=filters)
        except TypeError:
            results = self.tasks_store.similarity_search("", k=k)
        except Exception as e:
            log.exception("similarity_search failed: %s", e)
            return []
        return [{"content": r.page_content, "metadata": r.metadata} for r in results]
    
    # Hàm lấy các user tham gia trong một projec (Chưa triển khai, hiện tại lấy tất cả từ file)
    def retrieve_users_for_project(self, project_id: str, k: int = 10) -> List[Dict[str, Any]]:
        if not self.users_store:
            log.warning("users_store not initialized. retrieve_users_for_project returns empty list.")
            return []
        filters = {"project_id": project_id}
        try:
            results = self.users_store.similarity_search("", k=k, filter=None)
        except TypeError:
            results = self.users_store.similarity_search("", k=k)
        except Exception as e:
            log.exception("users similarity_search failed: %s", e)
            return []
        return [{"content": f"{r.page_content}. {r.metadata.get('position','')}", "metadata": r.metadata} for r in results]
    
    # Hàm tìm người dùng phù hợp cho văn bản nhiệm vụ
    def retrieve_users_for_query(self, task_text: str, k: int = 5, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if not self.users_store:
            log.warning("users_store not initialized. retrieve_users_for_task_text returns empty list.")
            return []
        # users table doesn't have project_id in your schema, keep None unless you add such a column
        filters = None
        try:
            results = self.users_store.similarity_search(task_text, k=k, filter=filters)
        except TypeError:
            results = self.users_store.similarity_search(task_text, k=k)
        except Exception as e:
            log.exception("users similarity_search failed: %s", e)
            return []
        return [{"content": f"Tên: {r.page_content}. Vị trí: {r.metadata.get('position','')}", "metadata": r.metadata} for r in results]

