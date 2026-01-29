from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import engine
from src.Models.cart import Cart, CartProduct
from src.Schemas.cart import NewCartRequest, CartProductRequest, AddToCartRequest
from fastapi.responses import JSONResponse, Response
# from auth_helper import get_user
from src.Utils.jwt import create_access_token
from src.Utils.deps import get_current_user
from database import get_session
from src.Models.user import User


router = APIRouter(prefix="/carts", tags=["carts"])


def get_or_create_open_cart(session: Session, user_id: int) -> Cart:
    cart = session.exec(
        select(Cart).where(Cart.user_id == user_id, Cart.is_paid.is_(False))
    ).first()

    if cart:
        return cart

    cart = Cart(user_id=user_id, is_paid=False)
    session.add(cart)
    session.commit()
    session.refresh(cart)
    return cart


@router.post("/add")
def add_prod_to_cart(
    cart_prod_request: AddToCartRequest,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    cart = get_or_create_open_cart(session, user.id)

    cart_item = session.exec(
        select(CartProduct).where(
            CartProduct.cart_id == cart.id,
            CartProduct.product_id == cart_prod_request.product_id,
        )
    ).first()

    if cart_item:
        cart_item.quantity += cart_prod_request.quantity
    else:
        cart_item = CartProduct(
            cart_id=cart.id,
            product_id=cart_prod_request.product_id,
            quantity=cart_prod_request.quantity,
        )
        session.add(cart_item)

    session.commit()
    return {"message": "Product added to cart"}


@router.get("/")
def get_my_cart(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    cart = get_or_create_open_cart(session, user.id)

    cart_items = session.exec(
        select(CartProduct).where(CartProduct.cart_id == cart.id)
    ).all()

    return cart_items

@router.patch("/items/{product_id}")
def update_item_quantity(
    product_id: int,
    quantity: int,  # מגיע ב-query: ?quantity=3
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    if quantity < 0:
        raise HTTPException(status_code=400, detail="quantity must be >= 0")

    cart = get_or_create_open_cart(session, user.id)

    cart_item = session.exec(
        select(CartProduct).where(
            CartProduct.cart_id == cart.id,
            CartProduct.product_id == product_id,
        )
    ).first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    # אם quantity == 0 מוחקים
    if quantity == 0:
        session.delete(cart_item)
        session.commit()
        return {"message": "Item removed"}

    cart_item.quantity = quantity
    session.add(cart_item)
    session.commit()
    session.refresh(cart_item)
    return cart_item

@router.delete("/items/{product_id}")
def delete_item_from_cart(
    product_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    cart = get_or_create_open_cart(session, user.id)

    cart_item = session.exec(
        select(CartProduct).where(
            CartProduct.cart_id == cart.id,
            CartProduct.product_id == product_id,
        )
    ).first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    session.delete(cart_item)
    session.commit()
    return {"message": "Item deleted"}
