from typing import Optional
from sqlmodel import SQLModel, Field

class Cart(SQLModel, table=True):
    __tablename__ = "carts"

    id: Optional[int] = Field(default=None, primary_key=True)  # הכרחי
    is_paid: bool = Field(default=False)
    user_id: int = Field(foreign_key="users.id", index=True)   # index מומלץ


class CartProduct(SQLModel, table=True):
    __tablename__ = "cart_product"

    id: Optional[int] = Field(default=None, primary_key=True)  # הכרחי
    product_id: int = Field(foreign_key="product.id", index=True)
    cart_id: int = Field(foreign_key="carts.id", index=True)

    quantity: int = Field(default=1, nullable=False)  # הכרחי
