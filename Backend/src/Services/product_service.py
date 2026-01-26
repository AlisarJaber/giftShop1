from sqlmodel import Session, select
from typing import List, Optional

from src.Models.product import Product
from src.Schemas.product import ProductCreate, ProductUpdate
from datetime import datetime, timezone

def get_all_products(session: Session) -> List[Product]:
    statement = select(Product).where(Product.is_active == True)
    return session.exec(statement).all()


def get_product_by_id(session: Session, product_id: int) -> Optional[Product]:
    return session.get(Product, product_id)


def create_product(session: Session, data: ProductCreate) -> Product:
    product = Product(**data.dict())

    session.add(product)
    session.commit()
    session.refresh(product)

    return product


def update_product(session: Session, product: Product, updates: dict) -> Product:
    for key, value in updates.items():
        setattr(product, key, value)

    product.updated_at = datetime.now(timezone.utc)

    session.commit()
    session.refresh(product)
    return product

    return product
def soft_delete_product(session: Session, product: Product) -> None:
    product.is_active = False
    session.commit()

