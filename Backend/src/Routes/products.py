from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

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

# ✅ NEW imports
from pydantic import BaseModel
from typing import List as TList
from src.Models.product import Product
from src.Models.sinProduct import SinProduct
from src.Models.cart import Cart  # יש לך כזה כבר
# ❗ שימי לב: השורה הבאה תלויה בשם המודל שלך לטבלת cart_product
# אם אצלך זה לא CartProduct — החליפי לשם הנכון
from src.Models.cart import CartProduct  # <-- אם השם שונה אצלך, תגידי לי

router = APIRouter(prefix="/products", tags=["products"])


# ✅ NEW schema (אפשר גם לשים בקובץ Schemas נפרד, אבל שמתי פה כדי שלא תסתבכי)
class CustomBoxCreate(BaseModel):
    items: TList[int]  # ids של single_products


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
def add_product(
    payload: ProductCreate,
    session: Session = Depends(get_session),
    admin=Depends(require_admin)
):
    return create_product(session, payload)


# ✅ NEW: create custom box product + add to cart as one item
@router.post("/custom-box", status_code=status.HTTP_201_CREATED)
def create_custom_box_and_add_to_cart(
    body: CustomBoxCreate,
    session: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    if not body.items or len(body.items) == 0:
        raise HTTPException(status_code=400, detail="No items selected")

    # להביא את הפריטים שנבחרו מהטבלה single_products
    sin_products = session.exec(
        select(SinProduct).where(SinProduct.id.in_(body.items))
    ).all()

    if len(sin_products) != len(set(body.items)):
        raise HTTPException(status_code=400, detail="Some items not found")

    total = sum(int(p.price or 0) for p in sin_products)
    names = ", ".join([p.name for p in sin_products])

    # ליצור מוצר חדש בטבלת products (כמו מארז רגיל)
    custom_product = Product(
        name="Custom Gift Box",
        description=f"Includes: {names}",
        price=total,
        image_url="https://via.placeholder.com/800x500?text=Custom+Gift+Box",
        is_active=True,
        is_custom_box=True,  # ✅ חשוב כדי שלא יופיע בקטלוג
        category_id=None
    )
    session.add(custom_product)
    session.commit()
    session.refresh(custom_product)

    # להביא/ליצור עגלה למשתמש
    cart = session.exec(select(Cart).where(Cart.user_id == user.id)).first()
    if not cart:
        cart = Cart(user_id=user.id)
        session.add(cart)
        session.commit()
        session.refresh(cart)

    # ✅ להוסיף לעגלה כ"שורה אחת" (cart_product)
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
def edit_product(
    product_id: int,
    payload: ProductUpdate,
    session: Session = Depends(get_session),
    admin=Depends(require_admin)
):
    product = get_product_by_id(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return update_product(session, product, payload.dict(exclude_unset=True))


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    session: Session = Depends(get_session),
    admin=Depends(require_admin)
):
    product = get_product_by_id(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    soft_delete_product(session, product)
