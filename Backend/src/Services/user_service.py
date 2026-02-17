from typing import Optional
from sqlmodel import Session, select
from fastapi import HTTPException, status

from src.Models.user import User
from src.Utils.security import hash_password, verify_password


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


# ✅ Reusable helper: bring user by id or 404
def get_user_or_404(session: Session, user_id: int) -> User:
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


def create_user(
    session: Session,
    first_name: str,
    last_name: str,
    email: str,
    password: str,
    is_admin: bool = False,
    image_url: Optional[str] = None,  # ✅ added
) -> User:
    existing = get_user_by_email(session, email)
    if existing:
        raise ValueError("EMAIL_ALREADY_EXISTS")

    user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        hashed_password=hash_password(password),
        is_admin=is_admin,
        image_url=image_url,  # ✅ save to db
    )

    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(session, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user