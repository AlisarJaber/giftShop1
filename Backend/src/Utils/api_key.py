from fastapi import Request, HTTPException, status

API_KEY = "SEACRET1234567"

def verify_api_key(request: Request):
    # ✅ לא לחסום Preflight של CORS
    if request.method == "OPTIONS":
        return True

    api_key = request.headers.get("apiKey")
    if api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing apiKey"
        )

    return True
