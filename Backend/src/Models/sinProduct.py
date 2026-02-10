from typing import Optional
from sqlmodel import SQLModel, Field, Relationship

class SinProduct(SQLModel, table=True):
    __tablename__ = "single_products"

    id: Optional[int] = Field(default=None, primary_key=True)

    name: str = Field(nullable=False)
    description: Optional[str] = Field(default=None)

    price: int = Field(default=0, nullable=False)  # int4 אצלך
    image_url: Optional[str] = Field(default=None)

    category_id: Optional[int] = Field(
        default=None,
        foreign_key="single_categories.id"
    )

    quantity: int = Field(default=0, nullable=False)

    category: Optional["SinCategory"] = Relationship(back_populates="products")

    is_active: bool = True

    
    
from src.Models.sinCategory import SinCategory  # noqa
