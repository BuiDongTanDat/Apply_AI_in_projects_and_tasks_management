import os
import json
import logging
from typing import List, Dict, Any, Optional
from langchain_postgres import PGVector
from langchain_huggingface import HuggingFaceEmbeddings
import uuid

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



    def make_user_document(self, user):
        text = (
            f"Tên: {user.get('name')}. "
            f"Vị trí: {user_role_description(user.get('position'))}. "
            f"Kỹ năng: {', '.join(USER_SKILLS.get(user.get('position'), []))}. "
            f"Kinh nghiệm: {user.get('yearOfExperience', 0)} năm."
        )

        meta = {
            "user_id": user["id"],
            "email": user.get("email"),
            "name": user.get("name"),
            "position": user.get("position"),
            "year_of_experience": user.get("yearOfExperience", 0),
            "avatar": user.get("avatar"),
            "created_at": user.get("createdAt"),
            "type": "user"
        }
        return text, meta

    def make_task_document(self, task):
        subtasks_text = "Không có subtasks."
        if task.get("subtasks"):
            subtasks_text = "\n".join([f"- {s['title']}: {s['description']}" for s in task["subtasks"]])

        text = (
            f"{task.get('title')}\n"
            f"{task.get('description')}\n"
            f"Trạng thái: {task.get('status')}\n"
            f"Ưu tiên: {task.get('priority')}\n"
            f"Dự án: {task.get('projectId')}\n"
            f"Nhiệm vụ con:\n{subtasks_text}"
        )

        meta = {
            "task_id": task["id"],
            "title": task.get("title"),
            "description": task.get("description"),
            "status": task.get("status"),
            "priority": task.get("priority"),
            "project_id": task.get("projectId"),
            "implementor_id": task.get("implementorId"),
            "reviewer_id": task.get("reviewerId"),
            "due_date": task.get("dueDate"),
            "estimate_effort": task.get("estimateEffort"),
            "actual_effort": task.get("actualEffort"),
            "created_at": task.get("createdAt"),
            "updated_at": task.get("updatedAt"),
            "parent_task_id": task.get("parentTaskId"),
            "is_deleted": False,
            "type": "task"
        }
        return text, meta

    # Hàm lấy document IDs theo metadata key-value
    def _get_document_ids_by_metadata(self, store, key: str, value: str) -> List[str]:
        """
        Lấy tất cả document ID trong vector store có metadata[key] == value.
        """
        if not store:
            return []

        ids = []
        try:
            # Lấy candidate documents (k đủ lớn để bao quát)
            candidates = store.similarity_search("", k=200)
            for doc in candidates:
                meta = getattr(doc, "metadata", {}) or {}
                if meta.get(key) == value and hasattr(doc, "id"):
                    ids.append(doc.id)
        except Exception as e:
            log.exception(f"_get_document_ids_by_metadata failed for {key}={value}: {e}")
        return ids

    # Hàm xóa document theo id_key (thử xóa, nếu không được -> ghi tombstone với is_deleted=True)
    def _delete_by_id(self, store, id_key: str, id_value: str, tombstone_type: str = "task") -> bool:
        """
        Xóa document theo metadata[id_key] = id_value.
        Nếu không xóa được, tạo tombstone.
        """
        if not store:
            return False

        try:
            ids_to_delete = self._get_document_ids_by_metadata(store, id_key, id_value)
            if ids_to_delete:
                store.delete(ids=ids_to_delete)
                log.info(f"Deleted documents for {id_key}={id_value}")
                return True

            # Nếu không có document, tạo tombstone
            tomb_meta = {id_key: id_value, "is_deleted": True, "type": tombstone_type}
            store.add_texts([""], [tomb_meta])
            log.info(f"Added tombstone for {id_key}={id_value}")
            return True
        except Exception as e:
            log.exception(f"_delete_by_id failed for {id_key}={id_value}: {e}")
            return False


    # Tạo/update embeddings (đã chuẩn hóa metadata: user_id/task_id và is_deleted=False)
    def create_or_update_embeddings(self, force: bool = False):
        if not self.ensure_stores():
            log.warning("Vector stores không khả dụng. Bỏ qua create_or_update_embeddings.")
            return

        users, tasks = self.load_raw_users_tasks()

        # USERS
        if users:
            for u in users:
                try:
                    if not force and self.get_user_by_id(u["id"]):
                        log.info(f"User {u['id']} đã tồn tại, bỏ qua upsert.")
                        continue
                    self.upsert_user(u, force=force)
                except Exception:
                    log.exception("Upsert user thất bại: %s", u.get("id"))
        # TASKS 
        if tasks:
            # Tạo một dictionary để nhóm các subtask theo parentTaskId
            subtasks_by_parent = {}
            for task in tasks:
                parent_id = task.get("parentTaskId")
                if parent_id:
                    if parent_id not in subtasks_by_parent:
                        subtasks_by_parent[parent_id] = []
                    subtasks_by_parent[parent_id].append(task)

            # Lặp qua tất cả các task. Nếu là task cha, đính kèm các subtask đã nhóm vào.
            parent_tasks_with_subtasks = []
            for task in tasks:
                if not task.get("parentTaskId"):
                    # Đây là task cha, lấy danh sách subtask của nó từ dictionary đã tạo
                    task_id = task.get("id")
                    subtasks = subtasks_by_parent.get(task_id, [])
                    task['subtasks'] = subtasks  # Thêm subtasks vào đối tượng task cha
                    parent_tasks_with_subtasks.append(task)
            
            # upsert các task cha đã được bổ sung đầy đủ thông tin
            for t in parent_tasks_with_subtasks:
                try:
                    if not force and self.get_task_by_id(t["id"]):
                        log.info(f"Task {t['id']} đã tồn tại, bỏ qua upsert.")
                        continue
                    self.upsert_task(t, force=force)
                except Exception:
                    log.exception("Upsert task thất bại: %s", t.get("id"))



    # TRUY VẤN ------------------

    # Hàm tìm kiếm task liên quan (bỏ qua tài liệu tombstone is_deleted=True)
    def retrieve_tasks_for_query(self, query: str, k: int = 5, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if not self.tasks_store:
            log.warning("tasks_store not initialized. retrieve_tasks_for_query returns empty list.")
            return []
        # try to include project_id filter; still use metadata-level filtering afterward to remove tombstones
        filters = {"project_id": project_id} if project_id else None
        try:
            results = self.tasks_store.similarity_search(query, k=k, filter=filters)
        except TypeError:
            results = self.tasks_store.similarity_search(query, k=k)
        except Exception as e:
            log.exception("similarity_search failed: %s", e)
            return []

        seen = set()
        unique = []
        for r in results:
            meta = getattr(r, "metadata", {}) or {}
            # skip tombstones
            if meta.get("is_deleted"):
                continue
            orig = meta.get("task_id")
            if orig and orig in seen:
                continue
            if orig:
                seen.add(orig)
            unique.append({"content": r.page_content, "metadata": meta})
            if len(unique) >= k:
                break
        return unique

    # Hàm tìm kiếm task liên quan kèm score (bỏ qua tombstones)
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

        seen = set()
        unique = []
        for item in results:
            doc, score = item[0], item[1]
            meta = getattr(doc, "metadata", {}) or {}
            if meta.get("is_deleted"):
                continue
            orig = meta.get("task_id")
            if orig and orig in seen:
                continue
            if orig:
                seen.add(orig)
            unique.append({"content": doc.page_content, "metadata": meta, "score": score})
            if len(unique) >= k:
                break
        return unique

    # Hàm lấy các task trong một project (bỏ tombstones)
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
        return [{"content": r.page_content, "metadata": r.metadata} for r in results if not (getattr(r, "metadata", {}) or {}).get("is_deleted")]

    # Hàm lấy các user tham gia trong một project (bỏ tombstones)
    def retrieve_users_for_project(self, project_id: str, k: int = 10) -> List[Dict[str, Any]]:
        if not self.users_store:
            log.warning("users_store not initialized. retrieve_users_for_project returns empty list.")
            return []
        try:
            results = self.users_store.similarity_search("", k=k, filter=None)
        except TypeError:
            results = self.users_store.similarity_search("", k=k)
        except Exception as e:
            log.exception("users similarity_search failed: %s", e)
            return []
        # use getattr safely for metadata access and filter out tombstones
        out = []
        for r in results:
            meta = getattr(r, "metadata", {}) or {}
            if meta.get("is_deleted"):
                continue
            position = meta.get('position', '')
            content = f"{r.page_content}. {position}"
            out.append({"content": content, "metadata": meta})
            if len(out) >= k:
                break
        return out

    # Hàm tìm người dùng phù hợp cho văn bản nhiệm vụ (bỏ tombstones)
    def retrieve_users_for_query(self, task_text: str, k: int = 5, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if not self.users_store:
            log.warning("users_store not initialized. retrieve_users_for_task_text returns empty list.")
            return []
        filters = None
        try:
            results = self.users_store.similarity_search(task_text, k=k, filter=filters)
        except TypeError:
            results = self.users_store.similarity_search(task_text, k=k)
        except Exception as e:
            log.exception("users similarity_search failed: %s", e)
            return []
        return [{"content": f"Tên: {r.page_content}. Vị trí: {r.metadata.get('position','')}", "metadata": r.metadata} for r in results if not (getattr(r, "metadata", {}) or {}).get("is_deleted")]


    # CRUD document ------------------
    def get_task_by_id(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Lấy thông tin chi tiết của một task từ vector store bằng ID."""
        if not self.ensure_stores(): return None
        try:
            results = self.tasks_store.similarity_search("", k=1, filter={"task_id": task_id})
            if results:
                # Trả về document đầu tiên tìm thấy
                return {"content": results[0].page_content, "metadata": results[0].metadata}
            return None
        except Exception as e:
            log.exception(f"Failed to get task by id {task_id}: {e}")
            return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Lấy thông tin chi tiết của một user từ vector store bằng ID."""
        if not self.ensure_stores(): return None
        try:
            results = self.users_store.similarity_search("", k=1, filter={"user_id": user_id})
            if results:
                # Trả về document đầu tiên tìm thấy
                return {"content": results[0].page_content, "metadata": results[0].metadata}
            return None
        except Exception as e:
            log.exception(f"Failed to get user by id {user_id}: {e}")
            return None
        

    def upsert_task(self, task: dict, force: bool = False):
        if not self.ensure_stores() or "id" not in task:
            return False
        task_id = task["id"]
        text, meta = self.make_task_document(task)
        try:
            existing_ids = self._get_document_ids_by_metadata(self.tasks_store, "task_id", task_id)
            if existing_ids:
                if not force:
                    log.info(f"Task {task_id} đã tồn tại và force=False, bỏ qua upsert.")
                    return True
                else:
                    self._delete_by_id(self.tasks_store, "task_id", task_id)

            self.tasks_store.add_texts([text], [meta])
            log.info(f"Upsert task {task_id} thành công.")
            return True
        except Exception as e:
            log.exception(f"Upsert task {task_id} thất bại: {e}")
            return False

    def upsert_user(self, user: dict, force: bool = False):
        if not self.ensure_stores() or "id" not in user:
            return False
        user_id = user["id"]
        text, meta = self.make_user_document(user)
        try:
            existing_ids = self._get_document_ids_by_metadata(self.users_store, "user_id", user_id)
            if existing_ids:
                if not force:
                    log.info(f"User {user_id} đã tồn tại và force=False, bỏ qua upsert.")
                    return True
                else:
                    self._delete_by_id(self.users_store, "user_id", user_id)

            # Thêm hoặc cập nhật document mới
            self.users_store.add_texts([text], [meta])
            log.info(f"Upsert user {user_id} thành công.")
            return True
        except Exception as e:
            log.exception(f"Upsert user {user_id} thất bại: {e}")
            return False


    # Xóa task theo ID
    def delete_task_by_id(self, task_id: str):
        if not self.ensure_stores():
            return False
        try:
            res = self._delete_by_id(self.tasks_store, "task_id", task_id)
            if res:
                log.info(f"Đã xóa task {task_id}.")
            else:
                log.warning(f"Không thể xóa task {task_id}.")
            return res
        except Exception as e:
            log.exception(f"Delete task {task_id} thất bại: {e}")
            return False

    def delete_user_by_id(self, user_id: str):
        if not self.ensure_stores():
            return False
        try:
            res = self._delete_by_id(self.users_store, "user_id", user_id)
            if res:
                log.info(f"Đã xóa user {user_id}.")
            else:
                log.warning(f"Không thể xóa user {user_id}.")
            return res
        except Exception as e:
            log.exception(f"Delete user {user_id} thất bại: {e}")
            return False