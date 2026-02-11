from typing import Optional, Any
from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB

class Cart(SQLModel, table=True):
    __tablename__ = "carts"

    id: Optional[int] = Field(default=None, primary_key=True)  
    is_paid: bool = Field(default=False)
    user_id: int = Field(foreign_key="users.id", index=True) 
    is_box: bool = Field(default=False, nullable=False)
    box_items: Optional[Any] = Field(default=None, sa_column=Column(JSONB))
    box_price: Optional[float] = Field(default=None, nullable=True)


class CartProduct(SQLModel, table=True):
    __tablename__ = "cart_product"

    id: Optional[int] = Field(default=None, primary_key=True)  
    product_id: int = Field(foreign_key="product.id", index=True)
    cart_id: int = Field(foreign_key="carts.id", index=True)

    quantity: int = Field(default=1, nullable=False)  
