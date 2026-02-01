from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from database import get_session
from src.Models.sinProduct import SinProduct
from src.Models.sinCategory import SinCategory
from src.Schemas.sinProduct import SinProductCreate
from src.Utils.deps import require_admin  # 👈 יש לך כבר

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

@router.post("/", response_model=SinProduct)
def create_product(
    body: SinProductCreate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin)  # 👈 רק אדמין יכול
):
    # לוודא שcategory קיימת (אם נשלח category_id)
    if body.category_id is not None:
        cat = session.exec(select(SinCategory).where(SinCategory.id == body.category_id)).first()
        if not cat:
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
