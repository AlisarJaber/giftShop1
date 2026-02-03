from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from database import get_session
from src.Utils.deps import get_current_user, require_admin

from src.Models.cart import Cart, CartProduct
from src.Models.user import User
from src.Models.product import Product
from src.Models.sinProduct import SinProduct

from src.Schemas.cart import AddToCartRequest
from src.Schemas.custom_box import CustomBoxCreate

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


# ✅ GET CART (זה מה שחסר לך - בגלל זה היה 404)
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


# ✅ ADD CUSTOM BOX AS ONE PRODUCT
@router.post("/custom-box/add", status_code=status.HTTP_201_CREATED)
def create_custom_box_and_add_to_cart(
    body: CustomBoxCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    if not body.items or len(body.items) == 0:
        raise HTTPException(status_code=400, detail="No items selected")

    qty_by_id = {}
    for it in body.items:
        pid = int(it.product_id)
        qty = int(it.quantity or 1)

        if pid <= 0 or qty <= 0:
            raise HTTPException(status_code=400, detail="Invalid product_id/quantity")

        qty_by_id[pid] = qty_by_id.get(pid, 0) + qty

    sin_ids = list(qty_by_id.keys())

    sin_products = session.exec(
        select(SinProduct).where(
            SinProduct.id.in_(sin_ids),
            SinProduct.is_active == True,   # אצלך כבר הוספת
        )
    ).all()

    if len(sin_products) != len(sin_ids):
        raise HTTPException(status_code=400, detail="one or more products not found/inactive")

    total = 0
    parts = []
    for p in sin_products:
        q = qty_by_id[p.id]
        price = int(p.price or 0)
        total += price * q
        parts.append(f"{p.name} x{q}")

    name = body.name or "My Box"
    names = ", ".join(parts)

    # ליצור מוצר חדש בטבלת products (מארז)
    custom_product = Product(
        name=name,
        description=f"Custom box includes: {names}",
        price=total,
        image_url="https://via.placeholder.com/800x500?text=Custom+Gift+Box",
        is_active=True,
        is_custom_box=True,
        category_id=None
    )
    session.add(custom_product)
    session.commit()
    session.refresh(custom_product)

    cart = get_or_create_open_cart(session, user.id)

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


# ✅ ADD REGULAR PRODUCT
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


# ✅ UPDATE ITEM QUANTITY
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


# ✅ DELETE ITEM
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


# (אופציונלי) ADMIN - אם היה אצלך קודם
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
                    "is_custom_box": bool(getattr(product, "is_custom_box", False)) if product else False,
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
