from pydantic import BaseModel
from typing import List

class CustomBoxCreate(BaseModel):
    items: List[int]  # ids של single_products
