from fastapi import FastAPI, Depends
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

from src.Utils.api_key import verify_api_key

import os

# יוצרים תיקיות לסטטיק כדי שלא ייפול השרת
os.makedirs("static/images", exist_ok=True)

app = FastAPI(title="Gift Shop API")

# ✅ CORS עבור Vite (5173) + עם cookies
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # אם לפעמים את מריצה React על 3000:
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  # חשוב בגלל apiKey
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def root():
    return {"status": "ok"}

# Routers (כולם עם API KEY)
app.include_router(auth_router, dependencies=[Depends(verify_api_key)])
app.include_router(products_router, dependencies=[Depends(verify_api_key)])
app.include_router(favorites_router, dependencies=[Depends(verify_api_key)])
app.include_router(carts_router, dependencies=[Depends(verify_api_key)])
app.include_router(categoryRouter, dependencies=[Depends(verify_api_key)])
app.include_router(single_category_router, dependencies=[Depends(verify_api_key)])
app.include_router(single_product_router, dependencies=[Depends(verify_api_key)])
app.include_router(uploads_router, dependencies=[Depends(verify_api_key)])

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")
