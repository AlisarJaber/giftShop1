from sqlmodel import Session, select
from typing import List, Optional
from src.Models.category import Category
from src.Models.product import Product
from src.Schemas.product import ProductCreate, ProductUpdate
from datetime import datetime, timezone
from fastapi import HTTPException

def get_all_products(session: Session) -> List[Product]:
    statement = select(Product).where(
        Product.is_active == True,
        Product.is_custom_box == False
    )
    return session.exec(statement).all()



def get_product_by_id(session: Session, product_id: int) -> Optional[Product]:
    return session.get(Product, product_id)


def create_product(session: Session, data: ProductCreate) -> Product:
    if getattr(data, "category_id", None) is not None:
        category = session.get(Category, data.category_id)
        if not category or not category.is_active:
            raise HTTPException(status_code=400, detail="Invalid category_id")

    product = Product(**data.dict())

    session.add(product)
    session.commit()
    session.refresh(product)

    return product


def update_product(session: Session, product: Product, updates: dict) -> Product:
    if "category_id" in updates and updates["category_id"] is not None:
        category = session.get(Category, updates["category_id"])
        if not category or not category.is_active:
            raise HTTPException(status_code=400, detail="Invalid category_id")

    for key, value in updates.items():
        setattr(product, key, value)

    product.updated_at = datetime.now(timezone.utc)

    session.commit()
    session.refresh(product)
    return product


def soft_delete_product(session: Session, product: Product) -> None:
    product.is_active = False
    session.commit()

