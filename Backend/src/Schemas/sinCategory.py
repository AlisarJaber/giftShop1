from sqlmodel import SQLModel
from typing import Optional

class SinCategoryCreate(SQLModel):
    name: str
    image_url: Optional[str] = None
    is_active: bool = True

class SinCategoryUpdate(SQLModel):
    name: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
