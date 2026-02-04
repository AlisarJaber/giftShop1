from fastapi import Depends, HTTPException, status, Cookie
from sqlmodel import Session, select
from datetime import datetime, timezone

from database import get_session
from src.Models.user import User
from src.Utils.jwt import decode_token


def get_current_user(
    access_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session)
) -> User:

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not logged in"
        )

    try:
        payload = decode_token(access_token)
        user_id: int = int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    user = session.exec(
        select(User).where(User.id == user_id)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    # ============================
    # 🔒 BLOCKED USER CHECK
    # ============================
    if user.is_blocked:
        # אם יש תאריך חסימה ועדיין לא עבר
        if user.blocked_until and user.blocked_until > datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is temporarily blocked"
            )
        else:
            # פג תוקף החסימה – משחררים אוטומטית
            user.is_blocked = False
            user.blocked_until = None
            session.add(user)
            session.commit()

    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return user
