from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from src.Models.cart import Cart, CartProduct
from src.Schemas.cart import AddToCartRequest
from src.Utils.deps import get_current_user, require_admin
from database import get_session
from src.Models.user import User
from src.Models.product import Product

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
    quantity: int,
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


@router.get("/admin/all")
def admin_list_all_carts(
    session: Session = Depends(get_session),
    admin=Depends(require_admin),
):
    carts = session.exec(select(Cart).order_by(Cart.id.desc())).all()
    result = []

    for cart in carts:
        cart_items = session.exec(
            select(CartProduct).where(CartProduct.cart_id == cart.id)
        ).all()

        items = []
        total_price = 0

        for it in cart_items:
            product = session.get(Product, it.product_id)
            price = int(product.price) if product and product.price is not None else 0
            qty = int(it.quantity or 0)
            total_price += price * qty

            items.append(
                {
                    "product_id": it.product_id,
                    "product_name": product.name if product else None,
                    "product_price": price if product else None,
                    "quantity": qty,
                }
            )

        result.append(
            {
                "id": cart.id,
                "user_id": cart.user_id,
                "is_paid": cart.is_paid,
                "total_price": total_price,
                "items": items,
            }
        )

    return result
