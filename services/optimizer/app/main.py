from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

app = FastAPI(
    title="DispatchX Optimization Worker",
    version="0.1.0",
    description="Sub-second VRPTW route optimization engine powered by Google OR-Tools",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "dispatchx-optimizer",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "0.1.0",
    }


@app.get("/ready")
def readiness_check():
    return {
        "ready": True,
        "solver": "google-or-tools",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
