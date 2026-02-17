import socketio
from src.Utils.jwt import decode_token

API_KEY = "SEACRET1234567"

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    logger=True,
    engineio_logger=True,
)

def _get_cookie(environ, name: str) -> str | None:
    raw = environ.get("HTTP_COOKIE") or ""
    parts = [p.strip() for p in raw.split(";") if p.strip()]
    for p in parts:
        if p.startswith(name + "="):
            return p.split("=", 1)[1]
    return None

@sio.event
async def connect(sid, environ, auth):
    auth = auth or {}

    api_key = auth.get("apiKey")
    if api_key != API_KEY:
        return False

    token = _get_cookie(environ, "access_token")
    if not token:
        return False

    try:
        payload = decode_token(token)
        user_id = int(payload.get("sub"))
        is_admin = bool(payload.get("is_admin"))
    except Exception:
        return False

    await sio.save_session(sid, {"user_id": user_id, "is_admin": is_admin})

    await sio.enter_room(sid, "inventory")
    await sio.enter_room(sid, f"user:{user_id}")
    if is_admin:
        await sio.enter_room(sid, "admins")

    await sio.emit("connected", {"user_id": user_id, "is_admin": is_admin}, to=sid)

@sio.event
async def disconnect(sid):
    pass

async def emit_inventory(event: str, payload: dict | None = None):
    await sio.emit(event, payload or {}, room="inventory")

async def emit_admins(event: str, payload: dict | None = None):
    await sio.emit(event, payload or {}, room="admins")
