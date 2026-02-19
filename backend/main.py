from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="EternalQuants API",
    description="Backend for EternalQuants - Quantitative Trading Model Marketplace",
    version="1.0.0"
)

# CORS Configuration
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to EternalQuants API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

from routers import models, metrics, ratings

app.include_router(models.router, prefix="/api/models", tags=["models"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["metrics"])
app.include_router(ratings.router, prefix="/api/ratings", tags=["ratings"])
