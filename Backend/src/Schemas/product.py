from pydantic import BaseModel
from typing import Optional

class ProductCard(BaseModel):
    id: int
    name: str
    price: int
    image_url: Optional[str] = None
    badge: Optional[str] = None
    category_id: Optional[int] = None

class ProductDetails(ProductCard):
    description: Optional[str] = None
    quantity: int

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: int
    image_url: Optional[str] = None
    quantity: int = 0
    badge: Optional[str] = None
    category_id: Optional[int] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    image_url: Optional[str] = None
    quantity: Optional[int] = None
    badge: Optional[str] = None
    is_active: Optional[bool] = None
    category_id: Optional[int] = None 
