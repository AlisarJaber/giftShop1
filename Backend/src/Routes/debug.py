from fastapi import APIRouter, Request, Depends
from src.Utils.api_key import verify_api_key

router = APIRouter(prefix="/debug", tags=["debug"])

@router.get("/headers")
def headers(request: Request):
    return {
        "cookie_header": request.headers.get("cookie"),
        "has_access_token_in_cookie_header": "access_token=" in (request.headers.get("cookie") or ""),
        "apikey": request.headers.get("apikey"),
        "apiKey": request.headers.get("apiKey"),
        "origin": request.headers.get("origin"),
    }

@router.get("/protected", dependencies=[Depends(verify_api_key)])
def protected(request: Request):
    return {
        "ok": True,
        "cookie_header": request.headers.get("cookie"),
        "has_access_token_in_cookie_header": "access_token=" in (request.headers.get("cookie") or ""),
        "apikey": request.headers.get("apikey"),
        "apiKey": request.headers.get("apiKey"),
    }
