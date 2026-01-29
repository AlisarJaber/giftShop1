from sqlmodel import SQLModel, Field

class Cart(SQLModel, table=True):
    __tablename__ ="carts"
    id: int = Field(primary_key=True, default=None)
    is_paid : bool = Field(default=False)
    user_id : int = Field(foreign_key="users.id")


class CartProduct(SQLModel, table=True):
    __tablename__ = "cart_product"
    id: int = Field(primary_key=True, default=None)
    product_id: int = Field(foreign_key="products.id")
    cart_id: int = Field(foreign_key="carts.id")
    quantity: int 
