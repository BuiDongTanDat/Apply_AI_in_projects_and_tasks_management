import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder

from app.services.llm_service import LLMService
from app.services.vector_store import VectorStoreService 
from app.schema.input import *

log = logging.getLogger(__name__)



# --- KHỞI TẠO SERVICE ---
# Khởi tạo Vector Store instance lúc app khởi động (call instance method)
vector_store_service = VectorStoreService()
try:
    vector_store_service.sync_data(force=False) # Đồng bộ dữ liệu từ DB vào vector store
except Exception as e:
    log.warning("Vector store embedding initialization failed at startup: %s", e)
    
# Initialize LLM service after vector store init and inject vector store instance
llm_service = LLMService(vector_store=vector_store_service)

def get_llm_service():
    return llm_service

def get_vector_store_service():
    return vector_store_service


router = APIRouter(prefix="/ai")

# Tạo các group router để dễ phân biệt
compose_router = APIRouter(
    prefix="/llm", 
    tags=["AI / Compose & Generate"]
)

crud_router = APIRouter(
    prefix="/vector",
    tags=["AI / CRUD (Tasks & Users)"]
)

test_router = APIRouter(
    prefix="/test",
    tags=["AI / Debug & Test"]
)


# ------------------- MAIN ENDPOINT -------------------
# COMPOSE TASK ROUTE
@compose_router.post("/compose")
async def compose_task(
    body: ComposeRequest,
    llm_svc: LLMService = Depends(get_llm_service)
):
    """Tạo một task mới (title, description, subtasks, tags, priority) dựa trên mô tả từ người dùng."""
    try:
        # Gọi hàm tạo task từ LLMService (accept raw dict)
        user_input = body.user_input or ""
        project_id = body.project_id  #nhận projectId từ client
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
@compose_router.post("/assign")
async def assign_task(
    body: AssignRequest,
    llm_svc: LLMService = Depends(get_llm_service)
):
    """Phân công task cho thành viên phù hợp nhất."""
    try:
        # Gọi hàm phân công từ LLMService
        task_payload = body.task or {}
        requirement_text = body.requirement_text or ""
        project_id = body.project_id
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
@compose_router.post("/duplicate")
async def find_duplicates(
    body: DuplicateRequest,
    llm_svc: LLMService = Depends(get_llm_service)
):
    """Tìm các task có nội dung tương tự (trùng lặp) dựa trên semantic search."""
    try:
        # Gọi hàm tìm kiếm trùng lặp từ LLMService
        task_payload = body.task or {}
        project_id = body.project_id  # <-- nhận projectId để giới hạn search
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
@compose_router.post("/estimate_sp")
async def estimate_story_point(
    body: EstimateSPRequest,
    llm_svc: LLMService = Depends(get_llm_service)
):
    """Ước tính Story Point cho task dựa trên Title và Description."""
    
    try:
        title = body.title or ""
        description = body.description or ""
        raw_text = f"{title} {description}"
        # Dự đoán giá trị Story Point thô
        raw_pred = llm_svc.predict_story_point(raw_text)
        
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
@compose_router.post("/summarize")
async def summarize_text(
    body: SummarizeRequest,
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
        tasks = body.tasks
        if not isinstance(tasks, list):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Missing or invalid 'tasks' list in request body."
            )

        use_llm = bool(body.use_llm)

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
@compose_router.post("/generate_task")
async def generate_task(
    body: GenerateTaskRequest,
    llm_svc: LLMService = Depends(get_llm_service)
):
    """Tạo task mới với pipeline đầy đủ: compose, assign, duplicate check, estimate SP."""
    try:
        user_input = body.user_input or ""
        project_id = body.project_id  # <-- nhận projectId từ client
        requirement_text = body.requirement_text or ""


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



# ------------------- CRUD DOCUMENT ROUTES -------------------
@crud_router.get("/tasks/{task_id}")
async def get_task_by_id(
    task_id: str,
    vector_store_svc: VectorStoreService = Depends(get_vector_store_service)
):
    """Lấy thông tin task từ vector store theo task ID."""
    task = vector_store_svc.get_task_by_id(task_id=task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    return task

@crud_router.get("/users/{user_id}")
async def get_user_by_id(
    user_id: str,
    vector_store_svc: VectorStoreService = Depends(get_vector_store_service)
):
    """Lấy thông tin user từ vector store theo user ID."""
    user = vector_store_svc.get_user_by_id(user_id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user

@crud_router.post("/tasks/upsert")
async def upsert_task(
    task_req: UpdateTaskRequest,
    force: bool = True, # Bắt buộc xóa bản cũ để tránh trùng lặp task
    vector_store_svc: VectorStoreService = Depends(get_vector_store_service)
):
    """
    Thêm mới hoặc cập nhật task. BẮT BUỘC phải có task['id']. force=True sẽ xóa bản cũ trước khi insert.
    """
    task_data = jsonable_encoder(task_req)
    success = vector_store_svc.upsert_task(task=task_data, force=force)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to upsert task.")
    updated_task = vector_store_svc.get_task_by_id(task_id=task_req.id)
    return {
            "detail": "Upsert task thành công.", 
            "task": updated_task
            }
   

@crud_router.post("/users/upsert")
async def upsert_user(
    user_req: UpdateUserRequest,
    force: bool = True, # Bắt buộc xóa bản cũ để tránh trùng lặp user
    vector_store_svc: VectorStoreService = Depends(get_vector_store_service)
):
    """
    Thêm mới hoặc cập nhật user. BẮT BUỘC phải có user['id']. force=True sẽ xóa bản cũ trước khi insert.
    """
    user_data = jsonable_encoder(user_req)
    success = vector_store_svc.upsert_user(user=user_data, force=force)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to upsert user.")
    updated_user = vector_store_svc.get_user_by_id(user_id=user_req.id)
    return {
            "detail": "Upsert user thành công.", 
            "user": updated_user
            }
    

@crud_router.delete("/tasks/{task_id}")
async def delete_task_by_id(
    task_id: str,
    vector_store_svc: VectorStoreService = Depends(get_vector_store_service)
):
    """Xoá task khỏi vector store theo task ID."""
    success = vector_store_svc.delete_task_by_id(task_id=task_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found or could not be deleted.")
    task_deleted = vector_store_svc.get_task_by_id(task_id=task_id)
    return {"detail": "Xóa tasks thành công.", "task_deleted": task_deleted}

@crud_router.delete("/users/{user_id}")
async def delete_user_by_id(
    user_id: str,
    vector_store_svc: VectorStoreService = Depends(get_vector_store_service)
):
    """Xoá user khỏi vector store theo user ID."""
    success = vector_store_svc.delete_user_by_id(user_id=user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found or could not be deleted.")
    user_deleted = vector_store_svc.get_user_by_id(user_id=user_id)
    return {"detail": "Xóa user thành công.", "user_deleted": user_deleted}


# DEBUG 
# ------------------- TEST ROUTES -------------------

# Test truy vần task liên quan
@test_router.get("/retrieve_tasks")
async def test_retrieve_tasks(
    query: str,
    project_id: str = None,
    vector_store_svc: VectorStoreService = Depends(get_vector_store_service),
):
    """Test retrieve tasks from vector store by query + optional project_id"""
    tasks = vector_store_svc.retrieve_tasks_by_query(query=query, project_id=project_id)
    return {"query": query, "project_id": project_id, "results": tasks}

# Test truy vần user liên quan
@test_router.get("/retrieve_users")
async def test_retrieve_users(
    query: str,
    project_id: str = None,
    vector_store_svc: VectorStoreService = Depends(get_vector_store_service)
):
    """Test retrieve users from vector store by query + optional project_id"""
    users = vector_store_svc.retrieve_users_by_query(query=query, project_id=project_id)
    return {"query": query, "project_id": project_id, "results": users}

# Test truy vần task kèm score
@test_router.get("/retrieve_with_scores")
async def test_retrieve_with_scores(
    query: str,
    project_id: str = None,
    vector_store_svc: VectorStoreService = Depends(get_vector_store_service),
):
    """Test retrieve tasks with scores (similarity search)"""
    results = vector_store_svc.retrieve_tasks_with_scores(query=query, project_id=project_id)
    return {"query": query, "project_id": project_id, "results": results}

# Test truy vần task chỉ bằng project_id
@test_router.get("/retrieve_tasks_by_project")
async def test_retrieve_task_by_project(
    project_id: str,
    vector_store_svc: VectorStoreService = Depends(get_vector_store_service)
):
    """Test retrieve tasks from vector store by project_id only"""
    tasks = vector_store_svc.retrieve_tasks_by_project(project_id=project_id)
    return {"project_id": project_id, "results": tasks}
   

# Test truy vấn user chỉ bằng project_id
@test_router.get("/retrieve_users_by_project")
async def test_retrieve_users_by_project(
    project_id: str,
    vector_store_svc: VectorStoreService = Depends(get_vector_store_service)
):
    """Test retrieve users from vector store by project_id only"""
    users = vector_store_svc.retrieve_users_by_project(project_id=project_id)
    return {"project_id": project_id, "results": users}


@test_router.get("/retrieve_tasks_by_user")
async def test_retrieve_task_by_user(
    user_id: str,
    project_id: str,
    vector_store_svc: VectorStoreService = Depends(get_vector_store_service)
):
    """Test retrieve tasks assigned to a specific user_id"""
    tasks = vector_store_svc.retrieve_tasks_by_user(user_id=user_id, project_id=project_id)
    return {"user_id": user_id, "project_id": project_id, "results": tasks}

# --- Register grouped routers into main router ---
router.include_router(compose_router)
router.include_router(crud_router)
router.include_router(test_router)