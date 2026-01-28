from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from database import get_session
from src.Utils.deps import get_current_user
from src.Models.favorite import Favorite
from src.Models.product import Product

router = APIRouter(prefix="/favorites", tags=["favorites"])

@router.get("", response_model=List[int])
def list_favorites(
    session: Session = Depends(get_session),
    user=Depends(get_current_user),
):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    favs = session.exec(
        select(Favorite).where(Favorite.user_id == user.id)
    ).all()
    return [f.product_id for f in favs]


@router.post("/{product_id}", status_code=status.HTTP_200_OK)
def toggle_favorite(
    product_id: int,
    session: Session = Depends(get_session),
    user=Depends(get_current_user),
):
    product = session.get(Product, product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = session.exec(
        select(Favorite).where(
            Favorite.user_id == user.id,
            Favorite.product_id == product_id
        )
    ).first()

    if existing:
        session.delete(existing)
        session.commit()
        return {"favorite": False}

    fav = Favorite(user_id=user.id, product_id=product_id)
    session.add(fav)
    session.commit()
    return {"favorite": True}

