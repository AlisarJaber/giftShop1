# Schemas/custom_box.py (או איפה שנוח לך)

from pydantic import BaseModel
from typing import List

class CustomBoxItem(BaseModel):
    product_id: int
    quantity: int = 1

class CustomBoxCreate(BaseModel):
    name: str | None = None
    items: List[CustomBoxItem]
