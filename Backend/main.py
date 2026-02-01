from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from database import create_db_and_tables
from src.Routes.auth import router as auth_router
from src.Routes.products import router as products_router
from src.Routes.favorites import router as favorites_router
from src.Routes.cart import router as carts_router
from src.Routes.category import router as categoryRouter
from src.Routes.sinCategory import router as single_category_router
from src.Routes.sinProduct import router as single_product_router

from src.Utils.api_key import verify_api_key



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

app.include_router(auth_router, dependencies=[Depends(verify_api_key)])
app.include_router(products_router, dependencies=[Depends(verify_api_key)])
app.include_router(favorites_router, dependencies=[Depends(verify_api_key)])
app.include_router(carts_router, dependencies=[Depends(verify_api_key)])
app.include_router(categoryRouter, dependencies=[Depends(verify_api_key)])

