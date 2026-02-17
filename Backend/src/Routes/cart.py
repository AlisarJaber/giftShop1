from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
import os
from typing import List, Optional

from database import get_session
from src.Utils.deps import get_current_user, require_admin

from src.Models.cart import Cart, CartProduct
from src.Models.user import User
from src.Models.product import Product
from src.Models.sinProduct import SinProduct
from src.Models.audit_log import AuditLog
from src.socketio_server import emit_admins

from src.Schemas.cart import AddToCartRequest
from src.Schemas.custom_box import CustomBoxCreate

router = APIRouter(prefix="/carts", tags=["carts"])

PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000")
CUSTOM_BOX_IMAGE_URL = f"{PUBLIC_BASE_URL}/static/images/custom_gift_box.png"

CUSTOM_BOX_STOCK = 999999


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


def _parse_box_items_from_description(desc: Optional[str]) -> List[str]:
    if not desc:
        return []

    marker = "Custom box includes:"
    if marker not in desc:
        return []

    tail = desc.split(marker, 1)[1].strip()
    if not tail:
        return []

    parts = [p.strip() for p in tail.split(",") if p.strip()]
    return parts


@router.get("/")
def get_my_cart(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """
    ✅ מחזיר שורות עגלה עם שדות נוספים למארז:
    - is_box
    - box_price
    - box_items
    """
    cart = get_or_create_open_cart(session, user.id)

    rows = session.exec(
        select(CartProduct, Product)
        .join(Product, Product.id == CartProduct.product_id)
        .where(CartProduct.cart_id == cart.id)
    ).all()

    out = []
    for cart_row, product in rows:
        is_box = bool(getattr(product, "is_custom_box", False)) if product else False
        box_price = float(getattr(product, "price", 0) or 0) if is_box and product else None
        box_items = (
            _parse_box_items_from_description(getattr(product, "description", None))
            if is_box and product
            else []
        )

        out.append(
            {
                "product_id": cart_row.product_id,
                "quantity": int(cart_row.quantity or 0),
                "is_box": is_box,
                "box_price": box_price,
                "box_items": box_items,
            }
        )

    return out
