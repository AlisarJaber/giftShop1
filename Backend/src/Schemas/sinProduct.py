from pydantic import BaseModel
from typing import Optional

class SinProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: int = 0
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    quantity: int = 0

# class SinProductCreate(SinProductBase):
#     pass

class SinProductOut(SinProductBase):
    id: int

    class Config:
        from_attributes = True

class SinProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: int
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    quantity: int