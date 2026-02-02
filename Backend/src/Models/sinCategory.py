from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class SinCategory(SQLModel, table=True):
    __tablename__ = "single_categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, nullable=False, unique=True)
    is_active: bool = Field(default=True, nullable=False)
    image_url: Optional[str] = None


    # optional relationship (works only if SinProduct has relationship back)
    products: List["SinProduct"] = Relationship(back_populates="category")

from src.Models.sinProduct import SinProduct  # noqa
