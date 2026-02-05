from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from database import get_session
from src.Schemas.user import UserCreate, UserLogin, UserResponse, AuthResponse
from src.Services.user_service import create_user, authenticate_user, get_user_by_email
from src.Utils.jwt import create_access_token
from src.Utils.deps import get_current_user
from src.Utils.security import verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


# ✅ payload לעדכון פרטים (מחייב סיסמה נוכחית)
class UserUpdatePayload(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    image_url: Optional[str] = None
    current_password: str


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, response: Response, session: Session = Depends(get_session)):
    try:
        user = create_user(
            session=session,
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=str(payload.email),
            password=payload.password,
            is_admin=False,
            image_url=(payload.image_url.strip() if getattr(payload, "image_url", None) else None),  # ✅
        )

        token = create_access_token({"sub": str(user.id), "is_admin": user.is_admin})

        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            samesite="lax",
            secure=False,
            path="/",
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "is_admin": user.is_admin,
                "image_url": getattr(user, "image_url", None),  # ✅
            }
        }

    except ValueError as e:
        if str(e) == "EMAIL_ALREADY_EXISTS":
            raise HTTPException(status_code=400, detail="Email already exists")
        raise


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLogin, response: Response, session: Session = Depends(get_session)):
    user = authenticate_user(session=session, email=str(payload.email), password=payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id), "is_admin": user.is_admin})

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "is_admin": user.is_admin,
            "image_url": getattr(user, "image_url", None),  # ✅
        }
    }


@router.get("/me", response_model=UserResponse)
def me(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "is_admin": current_user.is_admin,
        "image_url": getattr(current_user, "image_url", None),  # ✅
    }


# ✅ NEW: עדכון פרטי משתמש (מחייב current_password)
@router.patch("/me", response_model=UserResponse)
def update_me(
    payload: UserUpdatePayload,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    # 1) אימות סיסמה נוכחית
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Wrong password")

    # 2) עדכון שדות (רק מה שנשלח)
    if payload.first_name is not None:
        current_user.first_name = payload.first_name.strip()

    if payload.last_name is not None:
        current_user.last_name = payload.last_name.strip()

    if payload.image_url is not None:
        current_user.image_url = payload.image_url.strip() if payload.image_url else None

    if payload.email is not None:
        next_email = str(payload.email).strip().lower()
        # אם המשתמש שינה מייל — נוודא שאין כפילות
        if next_email != current_user.email:
            existing = get_user_by_email(session, next_email)
            if existing:
                raise HTTPException(status_code=400, detail="Email already exists")
            current_user.email = next_email

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "is_admin": current_user.is_admin,
        "image_url": getattr(current_user, "image_url", None),
    }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"ok": True}