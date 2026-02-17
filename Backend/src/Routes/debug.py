from fastapi import APIRouter, Request, Depends
from src.Utils.deps import require_admin
from src.Models.user import User

router = APIRouter(prefix="/debug", tags=["debug"])


@router.get("/headers")
def headers(request: Request):
    return {
        "cookie_header": request.headers.get("cookie"),
        "has_access_token_in_cookie_header": "access_token=" in (request.headers.get("cookie") or ""),
        "origin": request.headers.get("origin"),
    }


@router.get("/protected")
def protected(request: Request, admin: User = Depends(require_admin)):
    return {"ok": True}