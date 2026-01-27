from fastapi import Request, HTTPException, status

API_KEY = "SEACRET1234567"

def verify_api_key(request: Request):
    api_key = request.headers.get("apikey")
    if api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key"
        )
