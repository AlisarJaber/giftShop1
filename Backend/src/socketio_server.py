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

@sio.event
async def connect(sid, environ, auth):
    auth = auth or {}

    api_key = auth.get("apiKey")
    if api_key != API_KEY:
        return False

    token = auth.get("token")
    if not token:
        return False

    try:
        payload = decode_token(token)
        user_id = int(payload.get("sub"))
        is_admin = bool(payload.get("is_admin"))
    except Exception:
        return False

    await sio.save_session(sid, {"user_id": user_id, "is_admin": is_admin})

    # rooms
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