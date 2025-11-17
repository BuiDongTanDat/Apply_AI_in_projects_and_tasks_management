from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


# Compose input
class ComposeIn(BaseModel):
    userInput: str
    lang: Optional[str] = None
    use_llm: Optional[bool] = True

# Assign input
class AssignIn(BaseModel):
    task: Dict[str, Any]
    requirement_text: Optional[str] = ""

# Duplicate input
class DuplicateIn(BaseModel):
    task: Dict[str, Any]

# Estimate Story Point input (MỚI)
class EstimateIn(BaseModel):
    title: Optional[str] = Field(None, description="Tiêu đề của task.")
    description: Optional[str] = Field(None, description="Mô tả chi tiết của task.")
    
    # Validation cơ bản
    def model_post_init(self, context: Any) -> None:
        if not self.title and not self.description:
            raise ValueError("Phải cung cấp ít nhất 'title' hoặc 'description'.")


