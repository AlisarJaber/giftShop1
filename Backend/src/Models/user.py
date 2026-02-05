from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)

    first_name: str
    last_name: str
    email: str = Field(index=True, unique=True)
    hashed_password: str

    is_admin: bool = Field(default=False)

    is_blocked: bool = Field(default=False)
    blocked_until: Optional[datetime] = Field(default=None)
