from typing import Optional
from pydantic import BaseModel, EmailStr, validator

SPECIAL_CHARS = "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?"


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

    # ✅ optional profile image
    image_url: Optional[str] = None

    @validator("password")
    def validate_password(cls, v: str):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")

        if not any(c.isupper() for c in v):
            raise ValueError("Password must include at least one capital letter")

        if not any(c in SPECIAL_CHARS for c in v):
            raise ValueError("Password must include at least one special character")

        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ✅ NEW: payload לעדכון פרטי משתמש (מחייב סיסמה)
class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    image_url: Optional[str] = None
    current_password: str


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    is_admin: bool

    # ✅ נשלח לפרונט
    image_url: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse