from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field
from datetime import datetime
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column


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
    is_custom_box: bool = Field(default=False)
    box_items: Optional[List[Dict[str, Any]]] = Field(
    default=None,
    sa_column=Column(JSONB, nullable=True)
)


    