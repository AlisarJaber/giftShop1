from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"

    id: Optional[int] = Field(default=None, primary_key=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)

    actor_user_id: Optional[int] = Field(default=None, index=True)
    actor_name: str = Field(default="")
    actor_email: str = Field(default="")

    action: str = Field(index=True) 
    product_id: Optional[int] = Field(default=None, index=True)
    product_name: str = Field(default="")
    quantity_delta: int = Field(default=0) 

    cart_id: Optional[int] = Field(default=None, index=True)
    note: Optional[str] = Field(default=None)
