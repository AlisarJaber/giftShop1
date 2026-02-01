from pydantic import BaseModel

class SinCategoryBase(BaseModel):
    name: str
    is_active: bool = True

class SinCategoryCreate(SinCategoryBase):
    name: str

class SinCategoryOut(SinCategoryBase):
    id: int

    class Config:
        from_attributes = True
