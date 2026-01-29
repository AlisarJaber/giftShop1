from typing import Optional
from sqlmodel import SQLModel

class CategoryBase(SQLModel):
    name: str

class CategoryRead(CategoryBase):
    id: int
    is_active: bool

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(SQLModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
