from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import create_db_and_tables

from src.Routes.auth import router as auth_router
from src.Routes.products import router as products_router
from src.Routes.favorites import router as favorites_router
from src.Routes.cart import router as carts_router
from src.Routes.category import router as categoryRouter
from src.Routes.sinCategory import router as single_category_router
from src.Routes.sinProduct import router as single_product_router
from src.Routes.uploads import router as uploads_router
from src.Routes.export_pdf import router as export_router
from src.Routes.admin_users import router as admin_users_router
from src.Routes.audit_logs import router as audit_logs_router

import os
import socketio
from src.socketio_server import sio

os.makedirs("static/images", exist_ok=True)

app = FastAPI(title="Gift Shop API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def root():
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(products_router)
app.include_router(favorites_router)
app.include_router(carts_router)
app.include_router(categoryRouter)
app.include_router(single_category_router)
app.include_router(single_product_router)
app.include_router(uploads_router)
app.include_router(export_router)
app.include_router(admin_users_router)
app.include_router(audit_logs_router)

app.mount("/static", StaticFiles(directory="static"), name="static")

asgi_app = socketio.ASGIApp(sio, app)