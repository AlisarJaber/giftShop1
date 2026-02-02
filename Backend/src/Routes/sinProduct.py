from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from database import get_session
from src.Models.sinProduct import SinProduct
from src.Models.sinCategory import SinCategory
from src.Schemas.sinProduct import SinProductCreate
from src.Utils.deps import require_admin

router = APIRouter(prefix="/single-products", tags=["Single Products"])


@router.get("/")
def get_products(
    category_id: int | None = Query(default=None),
    session: Session = Depends(get_session)
):
    stmt = select(SinProduct)
    if category_id is not None:
        stmt = stmt.where(SinProduct.category_id == category_id)
    return session.exec(stmt).all()


@router.post("/", response_model=SinProduct, status_code=status.HTTP_201_CREATED)
def create_product(
    body: SinProductCreate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin)
):
    if body.category_id is not None:
        cat = session.exec(select(SinCategory).where(SinCategory.id == body.category_id)).first()
        if not cat or not cat.is_active:
            raise HTTPException(status_code=400, detail="Category not found")

    p = SinProduct(
        name=body.name,
        description=body.description,
        price=body.price,
        image_url=body.image_url,
        category_id=body.category_id
    )
    session.add(p)
    session.commit()
    session.refresh(p)
    return p


# ✅ NEW: edit product
@router.put("/{product_id}", response_model=SinProduct)
def update_product(
    product_id: int,
    body: SinProductCreate,  # אותו schema, כי אלו אותם שדות
    session: Session = Depends(get_session),
    _admin=Depends(require_admin)
):
    p = session.exec(select(SinProduct).where(SinProduct.id == product_id)).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    # אם משנים category_id - לוודא שקיימת
    if body.category_id is not None:
        cat = session.exec(select(SinCategory).where(SinCategory.id == body.category_id)).first()
        if not cat or not cat.is_active:
            raise HTTPException(status_code=400, detail="Category not found")

    p.name = body.name
    p.description = body.description
    p.price = body.price
    p.image_url = body.image_url
    p.category_id = body.category_id

    session.add(p)
    session.commit()
    session.refresh(p)
    return p


# ✅ NEW: delete product (hard delete)
@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin)
):
    p = session.exec(select(SinProduct).where(SinProduct.id == product_id)).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    session.delete(p)
    session.commit()
    return
