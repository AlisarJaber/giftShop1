from typing import Optional
from sqlmodel import Session, select
from src.Models.user import User
from src.Utils.security import hash_password, verify_password


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def create_user(
    session: Session,
    first_name: str,
    last_name: str,
    email: str,
    password: str,
    is_admin: bool = False
) -> User:
    existing = get_user_by_email(session, email)
    if existing:
        raise ValueError("EMAIL_ALREADY_EXISTS")

    user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        hashed_password=hash_password(password),
        is_admin=is_admin
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
