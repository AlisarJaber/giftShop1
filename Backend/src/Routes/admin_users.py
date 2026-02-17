from datetime import datetime, timedelta, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from database import get_session
from src.Models.user import User
from src.Utils.deps import require_admin

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])


class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    is_admin: bool
    is_blocked: bool
    blocked_until: Optional[datetime] = None


class BlockBody(BaseModel):
    minutes: int  # how many minutes to block


# ✅ Reusable helper: bring user by id or 404 (no duplication)
def get_user_or_404(session: Session, user_id: int) -> User:
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.get("/", response_model=List[UserOut])
def list_users(
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    users = session.exec(select(User)).all()
    return [
        UserOut(
            id=u.id,
            first_name=u.first_name,
            last_name=u.last_name,
            email=u.email,
            is_admin=u.is_admin,
            is_blocked=u.is_blocked,
            blocked_until=u.blocked_until,
        )
        for u in users
    ]


@router.post("/{user_id}/block")
def block_user(
    user_id: int,
    body: BlockBody,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    user = get_user_or_404(session, user_id)

    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot block an admin user")

    if body.minutes <= 0:
        raise HTTPException(status_code=400, detail="Minutes must be > 0")

    # limit to 30 days (optional safety)
    if body.minutes > 60 * 24 * 30:
        raise HTTPException(status_code=400, detail="Minutes too large")

    until = datetime.now(timezone.utc) + timedelta(minutes=body.minutes)

    user.is_blocked = True
    user.blocked_until = until

    session.add(user)
    session.commit()
    session.refresh(user)

    return {
        "ok": True,
        "user_id": user_id,
        "is_blocked": user.is_blocked,
        "blocked_until": user.blocked_until,
    }


@router.post("/{user_id}/unblock")
def unblock_user(
    user_id: int,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    user = get_user_or_404(session, user_id)

    user.is_blocked = False
    user.blocked_until = None

    session.add(user)
    session.commit()
    session.refresh(user)

    return {
        "ok": True,
        "user_id": user_id,
        "is_blocked": user.is_blocked,
        "blocked_until": user.blocked_until,
    }