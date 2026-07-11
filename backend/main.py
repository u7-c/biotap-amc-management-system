import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import clients, analytics, products, amcs, leads, upload, auth_router, users, client_products
import auth
from add_admin import add_admin
from seed import seed_db_if_empty

models.Base.metadata.create_all(bind=engine)
add_admin()


def seed_demo_data_if_needed():
    auto_seed = os.environ.get("AUTO_SEED_DEMO_DATA", "false").lower() in {"1", "true", "yes", "on"}
    if auto_seed:
        seed_db_if_empty()


seed_demo_data_if_needed()

app = FastAPI(title="AMC Management System API")

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

vercel_url = os.environ.get("VERCEL_URL")
if vercel_url:
    origins.append(f"https://{vercel_url}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/api")
app.include_router(clients.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(client_products.router, prefix="/api")
app.include_router(amcs.router, prefix="/api")
app.include_router(leads.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(upload.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to AMC Management System API"}
