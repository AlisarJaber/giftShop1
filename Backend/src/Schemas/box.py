from pydantic import BaseModel
from typing import List, Optional

class BoxItemIn(BaseModel):
    product_id: int
    quantity: int

class CreateBoxIn(BaseModel):
    name: Optional[str] = None
    items: List[BoxItemIn]
