from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List

from database import get_session
from src.Models.category import Category
from src.Schemas.category import CategoryRead, CategoryCreate 
from src.Utils.deps import get_current_user, require_admin

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("", response_model=List[CategoryRead])  
def list_categories(
    session: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    stmt = select(Category).where(Category.is_active == True).order_by(Category.name)
    return session.exec(stmt).all()

@router.post("", response_model=CategoryRead) 
def create_category(
    payload: CategoryCreate, 
    session: Session = Depends(get_session),
    user=Depends(require_admin)
):
    category = Category(name=payload.name.strip())
    session.add(category)
    session.commit()
    session.refresh(category)
    return category
