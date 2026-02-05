from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List

from database import get_session
from src.Utils.deps import require_admin
from src.Models.user import User
from src.Models.audit_log import AuditLog

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@router.get("/admin", response_model=List[AuditLog])
def list_audit_logs_admin(
    limit: int = 200,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    limit = max(1, min(int(limit), 500))

    logs = session.exec(
        select(AuditLog).order_by(AuditLog.id.desc()).limit(limit)
    ).all()

    return logs
