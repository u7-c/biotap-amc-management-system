from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import clients, analytics, products, amcs, leads, upload, auth_router, users, client_products
import auth
from add_admin import add_admin

models.Base.metadata.create_all(bind=engine)
add_admin()

app = FastAPI(title="AMC Management System API")

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(clients.router)
app.include_router(analytics.router)
app.include_router(products.router)
app.include_router(client_products.router)
app.include_router(amcs.router)
app.include_router(leads.router)
app.include_router(users.router)
app.include_router(upload.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AMC Management System API"}
