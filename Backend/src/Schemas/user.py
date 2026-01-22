from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    is_admin: bool

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
