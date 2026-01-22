from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt

SECRET_KEY = "SEACRET1234567"
ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60

def create_access_token(data: dict, expires_minutes: int = ACCESS_TOKEN_MINUTES) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise ValueError("Invalid token") from e
