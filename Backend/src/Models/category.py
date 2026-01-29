from typing import Optional
from sqlmodel import SQLModel, Field

class Category(SQLModel, table=True):
    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, max_length=80, unique=True)
    is_active: bool = Field(default=True)
