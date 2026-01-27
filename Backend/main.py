from fastapi import FastAPI
from database import create_db_and_tables
from src.Routes.auth import router as auth_router
from src.Routes.products import router as products_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Gift Shop API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(auth_router)

@app.get("/")
def root():
    return {"status": "ok"}

app.include_router(products_router)


