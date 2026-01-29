from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime
from datetime import datetime, timezone

class Product(SQLModel, table=True):
    __tablename__ = "product"  
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    price: int
    image_url: Optional[str] = None
    quantity: int = 0
    badge: Optional[str] = None 
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    category_id: Optional[int] = Field(default=None, foreign_key="categories.id", index=True)
    