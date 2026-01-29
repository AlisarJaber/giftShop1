from pydantic import BaseModel

class NewCartRequest(BaseModel):
    customer_name: str
    ispaid:bool
    
class CartProductRequest(BaseModel):
    product_id: int
    cart_id:int
    quantity:int

class AddToCartRequest(BaseModel):
    product_id: int
    quantity: int = 1
