# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.database import connect_to_mongo, close_mongo_connection
from app.api import farmers  # <-- Import your new API route!

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("⏳ Starting up the server...")
    await connect_to_mongo()
    yield
    print("⏳ Shutting down the server...")
    await close_mongo_connection()

app = FastAPI(
    title="AgriSense API",
    description="Intelligent Scheme Discovery Platform for Farmers",
    version="1.0.0",
    lifespan=lifespan 
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach the farmers router to the main app
app.include_router(farmers.router, prefix="/api/farmers", tags=["Farmers"])

@app.get("/")
async def root():
    return {"message": "Welcome to the AgriSense API. System is operational."}