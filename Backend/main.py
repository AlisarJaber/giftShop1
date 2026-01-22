from fastapi import FastAPI
from database import create_db_and_tables
from src.Routes.auth import router as auth_router

app = FastAPI(title="Gift Shop API")

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(auth_router)

@app.get("/")
def root():
    return {"status": "ok"}

