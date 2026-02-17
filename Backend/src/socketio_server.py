import socketio
from src.Utils.jwt import decode_token

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    logger=True,
    engineio_logger=True,
)


def _get_cookie_value(cookie_header: str | None, key: str) -> str | None:
    if not cookie_header:
        return None
    parts = [p.strip() for p in cookie_header.split(";")]
    for p in parts:
        if p.startswith(key + "="):
            return p.split("=", 1)[1]
    return None


@sio.event
async def connect(sid, environ, auth):
    # ✅ Authenticate ONLY by access_token cookie (JWT)
    cookie_header = environ.get("HTTP_COOKIE")
    token = _get_cookie_value(cookie_header, "access_token")
    if not token:
        return False

    try:
        payload = decode_token(token)
        user_id = int(payload.get("sub"))
        is_admin = bool(payload.get("is_admin"))
    except Exception:
        return False

    await sio.save_session(sid, {"user_id": user_id, "is_admin": is_admin})

    # Rooms
    await sio.enter_room(sid, "inventory")         # כולם
    await sio.enter_room(sid, f"user:{user_id}")   # אישי
    if is_admin:
        await sio.enter_room(sid, "admins")        # רק מנהלים

    await sio.emit("connected", {"user_id": user_id, "is_admin": is_admin}, to=sid)


@sio.event
async def disconnect(sid):
    pass


async def emit_inventory(event: str, payload: dict | None = None):
    await sio.emit(event, payload or {}, room="inventory")


async def emit_admins(event: str, payload: dict | None = None):
    await sio.emit(event, payload or {}, room="admins")