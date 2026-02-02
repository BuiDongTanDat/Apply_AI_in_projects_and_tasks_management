from app.utils.api import fetch_from_api

class FetchData:
    @staticmethod
    async def fetch_all_done_tasks_and_export(export_format: str = "csv"):
        """
        Lấy toàn bộ tasks có status DONE và export ra file csv.
        File sẽ được lưu vào thư mục data/train trong workspace Docker.
        """
        import os
        import pandas as pd
        import json
        out_dir = "app/data/train" #Lưu ý direct này nha
        os.makedirs(out_dir, exist_ok=True)
        tasks = []
        page = 1
        limit = 100
        total_pages = 1
        while True:
            params = {"status": "DONE", "limit": limit, "page": page}
            resp = await fetch_from_api("/tasks", params=params)

            meta = resp.get("metadata", {})
            page_info = meta.get("page", {})
            page_tasks = meta.get("tasks", [])
            
            tasks.extend(page_tasks)
            total_pages = page_info.get("pages", 1)
            #Tiếp tục đọc trang kế nếu còn
            if page >= total_pages:
                break
            page += 1
        # Chỉ lấy các trường cần thiết
        processed = [
            {
                "Title": t["title"],
                "Description": t["description"],
                "Type": t["type"],
                "Priority": t["priority"],
                "Story_Point": t["actualEffort"]
            }
            for t in tasks if t.get("status") == "DONE"
        ]
        out_path = os.path.join(out_dir, f"tasks_done_train.{export_format}")
        if export_format == "csv":
            df = pd.DataFrame(processed)
            df.to_csv(out_path, index=False, encoding="utf-8")
        else:
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(processed, f, ensure_ascii=False, indent=2)
        return out_path
        
        
    @staticmethod
    async def get_projects(params: dict = None):
        """Lấy danh sách projects từ API ngoài."""
        return await fetch_from_api("/projects", params=params)

    @staticmethod
    async def get_tasks(params: dict = None):
        """Lấy danh sách tasks từ API ngoài."""
        return await fetch_from_api("/tasks?limit=100", params=params)

    @staticmethod
    async def get_members(params: dict = None):
        """Lấy danh sách members từ API ngoài."""
        return await fetch_from_api("/members", params=params)
    
    @staticmethod
    async def get_tasks_and_export(params: dict = None):
        """Lấy danh sách tasks và xuất dữ liệu từ API ngoài."""
        return await fetch_from_api("/tasks/export", params=params)