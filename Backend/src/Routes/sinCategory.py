from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from src.Models.sinCategory import SinCategory
from src.Schemas.sinCategory import SinCategoryCreate, SinCategoryUpdate
from src.Utils.deps import require_admin

router = APIRouter(prefix="/single-categories", tags=["Single Categories"])

@router.get("/")
def get_categories(session: Session = Depends(get_session)):
    return session.exec(select(SinCategory).where(SinCategory.is_active == True)).all()

@router.post("/", response_model=SinCategory)
def create_category(
    body: SinCategoryCreate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin)
):
    existing = session.exec(select(SinCategory).where(SinCategory.name == body.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    cat = SinCategory(
        name=body.name,
        image_url=body.image_url,
        is_active=body.is_active if body.is_active is not None else True
    )
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat

@router.put("/{category_id}", response_model=SinCategory)
def update_category(
    category_id: int,
    body: SinCategoryUpdate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin)
):
    cat = session.get(SinCategory, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    if body.name is not None:
        cat.name = body.name
    if body.image_url is not None:
        cat.image_url = body.image_url
    if body.is_active is not None:
        cat.is_active = body.is_active

    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin)
):
    cat = session.get(SinCategory, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    # אפשר soft delete:
    cat.is_active = False
    session.add(cat)
    session.commit()
    return {"ok": True}
