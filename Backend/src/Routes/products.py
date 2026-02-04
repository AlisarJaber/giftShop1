from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel
from typing import List as TList
import os

from database import get_session
from src.Schemas.product import (
    ProductCard,
    ProductDetails,
    ProductCreate,
    ProductUpdate
)
from src.Services.product_service import (
    get_all_products,
    get_product_by_id,
    create_product,
    update_product,
    soft_delete_product
)
from src.Utils.deps import get_current_user, require_admin

from src.Models.product import Product
from src.Models.sinProduct import SinProduct
from src.Models.cart import Cart
from src.Models.cart import CartProduct

from src.socketio_server import emit_inventory

PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000")
CUSTOM_BOX_IMAGE_URL = f"{PUBLIC_BASE_URL}/static/images/custom_gift_box.png"

router = APIRouter(prefix="/products", tags=["products"])


class CustomBoxCreate(BaseModel):
    items: TList[int]


@router.get("", response_model=List[ProductCard])
def list_products(
    session: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    return get_all_products(session)


@router.get("/{product_id}", response_model=ProductDetails)
def product_details(
    product_id: int,
    session: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    product = get_product_by_id(session, product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=ProductDetails, status_code=status.HTTP_201_CREATED)
async def add_product(
    payload: ProductCreate,
    session: Session = Depends(get_session),
    admin=Depends(require_admin)
):
    created = create_product(session, payload)

    await emit_inventory("item_added", {
        "product_id": created.id,
        "by_admin_id": admin.id
    })

    return created


@router.post("/custom-box", status_code=status.HTTP_201_CREATED)
async def create_custom_box_and_add_to_cart(
    body: CustomBoxCreate,
    session: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    if not body.items or len(body.items) == 0:
        raise HTTPException(status_code=400, detail="No items selected")

    sin_products = session.exec(
        select(SinProduct).where(SinProduct.id.in_(body.items))
    ).all()

    if len(sin_products) != len(set(body.items)):
        raise HTTPException(status_code=400, detail="Some items not found")

    total = sum(int(p.price or 0) for p in sin_products)
    names = ", ".join([p.name for p in sin_products])

    custom_product = Product(
        name="Custom Gift Box",
        description=f"Includes: {names}",
        price=total,
        image_url=CUSTOM_BOX_IMAGE_URL,
        is_active=True,
        is_custom_box=True,
        category_id=None
    )
    session.add(custom_product)
    session.commit()
    session.refresh(custom_product)

    cart = session.exec(select(Cart).where(Cart.user_id == user.id)).first()
    if not cart:
        cart = Cart(user_id=user.id)
        session.add(cart)
        session.commit()
        session.refresh(cart)

    row = session.exec(
        select(CartProduct).where(
            CartProduct.cart_id == cart.id,
            CartProduct.product_id == custom_product.id
        )
    ).first()

    if row:
        row.quantity += 1
    else:
        row = CartProduct(cart_id=cart.id, product_id=custom_product.id, quantity=1)
        session.add(row)

    session.commit()

    return {"added_product_id": custom_product.id, "total": total}


@router.put("/{product_id}", response_model=ProductDetails)
async def edit_product(
    product_id: int,
    payload: ProductUpdate,
    session: Session = Depends(get_session),
    admin=Depends(require_admin)
):
    product = get_product_by_id(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    updated = update_product(session, product, payload.dict(exclude_unset=True))

    await emit_inventory("inventory_update", {
        "product_id": product_id,
        "by_admin_id": admin.id
    })

    return updated


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    session: Session = Depends(get_session),
    admin=Depends(require_admin)
):
    product = get_product_by_id(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    soft_delete_product(session, product)

    await emit_inventory("item_removed", {
        "product_id": product_id,
        "by_admin_id": admin.id
    })
