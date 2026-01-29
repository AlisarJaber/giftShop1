from sqlmodel import Session, select
from fastapi import HTTPException
from src.Models.category import Category

def get_all_categories(session: Session):
    stmt = select(Category).where(Category.is_active == True).order_by(Category.name)
    return session.exec(stmt).all()

def get_category_by_id(session: Session, category_id: int):
    return session.get(Category, category_id)

def get_category_by_name(session: Session, name: str):
    stmt = select(Category).where(Category.name == name)
    return session.exec(stmt).first()

def create_category(session: Session, name: str):
    name = name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Category name is required")

    existing = get_category_by_name(session, name)
    if existing:
        raise HTTPException(status_code=409, detail="Category already exists")

    category = Category(name=name)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

def soft_delete_category(session: Session, category_id: int):
    category = get_category_by_id(session, category_id)
    if not category or not category.is_active:
        raise HTTPException(status_code=404, detail="Category not found")

    category.is_active = False
    session.add(category)
    session.commit()
    session.refresh(category)
    return category
