import logging
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any

from app.services.llm_service import LLMService
from app.services.vector_store import VectorStoreService 

log = logging.getLogger(__name__)

# --- KHỞI TẠO SERVICE ---
# Khởi tạo Vector Store instance lúc app khởi động (call instance method)
vector_store_service = VectorStoreService()
try:
    # create_or_update_embeddings is an instance method — call it on the instance
    vector_store_service.create_or_update_embeddings(force=False)
except Exception as e:
    log.warning("Vector store embedding initialization failed at startup: %s", e)
    
# Initialize LLM service after vector store init and inject vector store instance
llm_service = LLMService(vector_store=vector_store_service)

def get_llm_service():
    return llm_service

def get_vector_store_service():
    return vector_store_service


router = APIRouter(prefix="/ai", tags=["AI Tasks"])


# COMPOSE TASK ROUTE
@router.post("/compose")
async def compose_task(
    body: Dict[str, Any],
    llm_svc: LLMService = Depends(get_llm_service)
):
    """Tạo một task mới (title, description, subtasks, tags, priority) dựa trên mô tả từ người dùng."""
    try:
        # Gọi hàm tạo task từ LLMService (accept raw dict)
        user_input = body.get("userInput") or body.get("user_input") or ""
        project_id = body.get("projectId") or body.get("project_id")  # <-- nhận projectId từ client
        raw_result = llm_svc.compose_with_llm(user_input=user_input, project_id=project_id)
        
        if 'error' in raw_result:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=raw_result['error'])
        if 'raw' in raw_result:
             raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="LLM response was not valid JSON.")
        
        # Return raw dict (no schema enforcement)
        return raw_result

    except (TypeError, ValueError) as e:
        log.error(f"Input/processing error in /compose: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(e))
    except Exception as e:
        log.exception(f"Unexpected error in /compose: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error during task composition.")


# ASSIGN TASK ROUTE
@router.post("/assign")
async def assign_task(
    body: Dict[str, Any],
    llm_svc: LLMService = Depends(get_llm_service)
):
    """Phân công task cho thành viên phù hợp nhất."""
    try:
        # Gọi hàm phân công từ LLMService
        task_payload = body.get("task", {}) 
        requirement_text = body.get("requirement_text") or body.get("requirement") or ""
        project_id = body.get("projectId") or body.get("project_id") 
        raw_result = llm_svc.assign_candidate(
            task=task_payload,
            project_id=project_id,
            requirement_text=requirement_text
        )
 
        if 'error' in raw_result:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=raw_result['error'])
        if 'raw' in raw_result:
             raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="LLM response was not valid JSON for assignment.")
            
        return raw_result
        
    except (TypeError, ValueError) as e:
        log.error(f"Input/processing error in /assign: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(e))
    except Exception as e:
        log.exception(f"Unexpected error in /assign: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error during task assignment.")


# DUPLICATE FINDER TASK ROUTE
@router.post("/duplicate")
async def find_duplicates(
    body: Dict[str, Any],
    llm_svc: LLMService = Depends(get_llm_service)
):
    """Tìm các task có nội dung tương tự (trùng lặp) dựa trên semantic search."""
    try:
        # Gọi hàm tìm kiếm trùng lặp từ LLMService
        task_payload = body.get("task", {})
        project_id = body.get("projectId") or body.get("project_id")  # <-- nhận projectId để giới hạn search
        raw_result = llm_svc.find_duplicate_tasks(
            task=task_payload,
            threshold=0.25, # Euclidean distance threshold
            k=3,
            project_id=project_id
        )
        
        if 'error' in raw_result:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=raw_result['error'])
             
        return raw_result

    except (TypeError, ValueError) as e:
        log.error(f"Input/processing error in /duplicate: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(e))
    except Exception as e:
        log.exception(f"Unexpected error in /duplicate: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error during duplicate check.")
    

# ESTIMATE STORY POINT ROUTE
@router.post("/estimate_sp")
async def estimate_story_point(
    body: Dict[str, Any],
    llm_svc: LLMService = Depends(get_llm_service)
):
    """Ước tính Story Point cho task dựa trên Title và Description."""
    
    try:
        title = body.get("title", "")
        description = body.get("description", "")
        # Dự đoán giá trị Story Point thô
        raw_pred = llm_svc.predict_story_point(title=title, desc=description)
        
        # Gợi ý Story Point theo Planning Poker
        suggested_sp = llm_svc.suggest_story_point(raw_pred)
        
        return {
            "model_estimate": round(raw_pred, 2),
            "suggested_story_point": suggested_sp
        }
        
    except (ValueError, TypeError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        log.exception(f"Error during Story Point estimation: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error during story point estimation.")

# SUMMARIZE ROUTE (UPDATED)
@router.post("/summarize")
async def summarize_text(
    body: Dict[str, Any],
    llm_svc: LLMService = Depends(get_llm_service)
):
    """
    Body:
      {
        "tasks": [ ... ],            # list of task objects (see example)
        "use_llm": true|false        # optional, default true
      }
    Returns sprint report including local metrics and optional LLM summary.
    """
    try:
        tasks = body.get("tasks")
        if not isinstance(tasks, list):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Missing or invalid 'tasks' list in request body."
            )

        use_llm = bool(body.get("use_llm", True))

        # Generate sprint report: local metrics + optional LLM summary
        report = llm_svc.generate_sprint_report(tasks=tasks, use_llm_summary=use_llm)

        return report

    except HTTPException:
        raise
    except Exception as e:
        log.exception(f"Unexpected error in /summarize: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during summarization."
        )

# GENERATE TASK (PIPELINE)
@router.post("/generate_task")
async def generate_task(
    body: Dict[str, Any],
    llm_svc: LLMService = Depends(get_llm_service)
):
    """Tạo task mới với pipeline đầy đủ: compose, assign, duplicate check, estimate SP."""
    try:
        user_input = body.get("userInput") or body.get("user_input") or ""
        project_id = body.get("projectId") or body.get("project_id")  # <-- nhận projectId từ client
        requirement_text = body.get("requirement_text") or body.get("requirement") or ""


        raw_result = llm_svc.generate_task(
            user_input=user_input,
            project_id=project_id,
            requirement_text=requirement_text
        )
        
        if 'error' in raw_result:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=raw_result['error'])
        if 'raw' in raw_result:
             raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="LLM response was not valid JSON during full task generation.")
        
        return raw_result

    except (TypeError, ValueError) as e:
        log.error(f"Input/processing error in /generate_task: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(e))
    except Exception as e:
        log.exception(f"Unexpected error in /generate_task: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Internal server error during full task generation.")

# DEBUG 
# ------------------- TEST ROUTES -------------------

# Test truy vần task liên quan
@router.get("/test/retrieve_tasks")
async def test_retrieve_tasks(
    query: str,
    project_id: str = None,
    llm_svc: LLMService = Depends(get_llm_service)
):
    """Test retrieve tasks from vector store by query + optional project_id"""
    tasks = llm_svc.test_retrieve_tasks(query=query, project_id=project_id)
    return {"query": query, "project_id": project_id, "results": tasks}

# Test truy vần user liên quan
@router.get("/test/retrieve_users")
async def test_retrieve_users(
    query: str,
    project_id: str = None,
    llm_svc: LLMService = Depends(get_llm_service)
):
    """Test retrieve users from vector store by query + optional project_id"""
    users = llm_svc.test_retrieve_users(query=query, project_id=project_id)
    return {"query": query, "project_id": project_id, "results": users}

# Test truy vần task kèm score
@router.get("/test/retrieve_with_scores")
async def test_retrieve_with_scores(
    query: str,
    project_id: str = None,
    llm_svc: LLMService = Depends(get_llm_service)
):
    """Test retrieve tasks with scores (similarity search)"""
    results = llm_svc.test_retrieve_with_scores(query=query, project_id=project_id)
    return {"query": query, "project_id": project_id, "results": results}

# Test truy vần task chỉ bằng project_id
@router.get("/test/retrieve_tasks_by_project")
async def test_retrieve_task_by_project(
    project_id: str,
    llm_svc: LLMService = Depends(get_llm_service)
):
    """Test retrieve tasks from vector store by project_id only"""
    tasks = llm_svc.test_retrieve_tasks_for_project(project_id=project_id)
    return {"project_id": project_id, "results": tasks}

# Test truy vấn user chỉ bằng project_id
@router.get("/test/retrieve_users_by_project")
async def test_retrieve_users_by_project(
    project_id: str,
    llm_svc: LLMService = Depends(get_llm_service)
):
    """Test retrieve users from vector store by project_id only"""
    users = llm_svc.test_retrieve_users_for_project(project_id=project_id, k=20)
    return {"project_id": project_id, "results": users}