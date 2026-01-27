from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
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

router = APIRouter(prefix="/products", tags=["products"])


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

