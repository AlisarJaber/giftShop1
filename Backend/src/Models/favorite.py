from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime, timezone

class Favorite(SQLModel, table=True):
    __tablename__ = "favorite"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    product_id: int = Field(index=True)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

