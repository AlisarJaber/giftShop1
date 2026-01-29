from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlmodel import Session

from database import get_session
from src.Schemas.user import UserCreate, UserLogin, UserResponse, AuthResponse
from src.Services.user_service import create_user, authenticate_user
from src.Utils.jwt import create_access_token
from src.Utils.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, response: Response, session: Session = Depends(get_session)):
    try:
        user = create_user(
            session=session,
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=str(payload.email),
            password=payload.password,
            is_admin=False
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
                "is_admin": user.is_admin
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
            "is_admin": user.is_admin
        }
    }


@router.get("/me", response_model=UserResponse)
def me(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "is_admin": current_user.is_admin
    }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/"
)
    return {"ok": True}
