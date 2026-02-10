from fastapi import Depends, HTTPException, status, Cookie
from sqlmodel import Session, select
from datetime import datetime, timezone

from database import get_session
from src.Models.user import User
from src.Utils.jwt import decode_token


def _utc_now_naive() -> datetime:
    # Use naive UTC for safer comparisons with DB naive datetimes
    return datetime.utcnow()


def _as_naive(dt: datetime) -> datetime:
    # Convert aware -> naive (UTC), keep naive as-is
    if dt is None:
        return None
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


def get_current_user(
    access_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session),
) -> User:
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not logged in",
        )

    try:
        payload = decode_token(access_token)
        user_id: int = int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # ============================
    # 🔒 BLOCKED USER CHECK (GLOBAL)
    # ============================
    if getattr(user, "is_blocked", False):
        now = _utc_now_naive()
        blocked_until = _as_naive(getattr(user, "blocked_until", None))

        # If blocked_until exists and has passed => auto-unblock
        if blocked_until is not None and blocked_until <= now:
            user.is_blocked = False
            user.blocked_until = None
            session.add(user)
            session.commit()
            session.refresh(user)
        else:
            # Still blocked (either no end date OR end date is in the future)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="USER_BLOCKED",
            )

    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return user