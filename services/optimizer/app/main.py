import os
import time
from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.models import OptimizationRequest, SolutionResponse, OptimizationStatus
from app.solver import solve_vrptw
from app.post_solve import audit_solution

app = FastAPI(
    title="DispatchX VRPTW Optimizer",
    description="OR-Tools powered dynamic VRPTW optimization engine with hard constraints and disruption replanning",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WORKER_SECRET = os.environ.get("OPTIMIZER_WORKER_SECRET", "dispatchx-internal-optimizer-secret-2026")

def verify_secret(x_worker_secret: str = Header(None, alias="X-Worker-Secret")):
    if x_worker_secret != WORKER_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid X-Worker-Secret")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "optimizer", "engine": "Google OR-Tools VRPTW"}

@app.post("/optimize", response_model=SolutionResponse)
def optimize(request: OptimizationRequest, _auth: None = Depends(verify_secret)):
    start_time = time.time()
    
    # 1. Run VRPTW solver
    solution = solve_vrptw(request)
    
    # 2. Audit solution constraints
    is_valid, violations, unassigned_reasons = audit_solution(
        request, 
        solution.routes, 
        solution.unassigned_stop_ids
    )
    
    # 3. Update solution with audit feedback if needed
    if not is_valid:
        solution.violations = violations
    if unassigned_reasons:
        solution.unassigned_reasons = unassigned_reasons
        
    solution.solve_duration_ms = int((time.time() - start_time) * 1000)
    return solution
