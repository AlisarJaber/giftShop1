from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from src.Models.sinCategory import SinCategory
from src.Schemas.sinCategory import SinCategoryCreate
from src.Utils.deps import require_admin  # 👈 יש לך כבר

router = APIRouter(prefix="/single-categories", tags=["Single Categories"])

@router.get("/")
def get_categories(session: Session = Depends(get_session)):
    return session.exec(
        select(SinCategory).where(SinCategory.is_active == True)
    ).all()

@router.post("/", response_model=SinCategory)
def create_category(
    body: SinCategoryCreate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin)  # 👈 רק אדמין יכול
):
    # בדיקה שאין אותו שם כבר
    existing = session.exec(select(SinCategory).where(SinCategory.name == body.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    cat = SinCategory(name=body.name, is_active=True)
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat
