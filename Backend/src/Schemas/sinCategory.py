from typing import Optional
from sqlmodel import SQLModel


class SinCategoryBase(SQLModel):
    name: str
    image_url: Optional[str] = None


class SinCategoryRead(SinCategoryBase):
    id: int
    is_active: bool


class SinCategoryCreate(SinCategoryBase):
    is_active: bool = True


class SinCategoryUpdate(SQLModel):
    name: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
