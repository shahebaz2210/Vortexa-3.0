"""
Unit test for Google OR-Tools VRPTW solver with demo instance
"""
import pytest
from app.models import OptimizationRequest, VehicleInput, StopInput, DepotInput, RouteObjective
from app.solver import solve_vrptw

def test_solver_basic_instance():
    # 2 vehicles, 4 stops, 1 depot
    depot = DepotInput(id="DEPOT-1", name="Central Depot", lat=37.7749, lng=-122.4194)
    vehicles = [
        VehicleInput(id="V-1", name="Van Alpha", capacity_kg=1000.0, capacity_m3=10.0, depot_id="DEPOT-1", max_shift_minutes=480),
        VehicleInput(id="V-2", name="Van Beta", capacity_kg=1200.0, capacity_m3=12.0, depot_id="DEPOT-1", max_shift_minutes=480),
    ]
    stops = [
        StopInput(id="STOP-1", name="Client A", lat=37.7800, lng=-122.4100, weight_kg=100.0, volume_m3=1.0, time_window_start_minutes=0, time_window_end_minutes=240, service_duration_minutes=15),
        StopInput(id="STOP-2", name="Client B", lat=37.7850, lng=-122.4050, weight_kg=150.0, volume_m3=1.5, time_window_start_minutes=30, time_window_end_minutes=300, service_duration_minutes=15),
        StopInput(id="STOP-3", name="Client C", lat=37.7700, lng=-122.4300, weight_kg=200.0, volume_m3=2.0, time_window_start_minutes=0, time_window_end_minutes=360, service_duration_minutes=20),
        StopInput(id="STOP-4", name="Client D", lat=37.7650, lng=-122.4350, weight_kg=80.0, volume_m3=0.8, time_window_start_minutes=60, time_window_end_minutes=400, service_duration_minutes=15),
    ]
    
    # 5x5 dummy distance/time matrix (index 0 = depot, 1..4 = stops)
    matrix_time = [
        [0, 10, 15, 12, 18],
        [10, 0, 8, 20, 25],
        [15, 8, 0, 22, 28],
        [12, 20, 22, 0, 10],
        [18, 25, 28, 10, 0]
    ]
    matrix_dist = [
        [0.0, 5.0, 7.5, 6.0, 9.0],
        [5.0, 0.0, 4.0, 10.0, 12.5],
        [7.5, 4.0, 0.0, 11.0, 14.0],
        [6.0, 10.0, 11.0, 0.0, 5.0],
        [9.0, 12.5, 14.0, 5.0, 0.0]
    ]
    
    req = OptimizationRequest(
        plan_id="TEST-PLAN-1",
        vehicles=vehicles,
        stops=stops,
        depot=depot,
        time_matrix_minutes=matrix_time,
        distance_matrix_km=matrix_dist,
        time_limit_seconds=5
    )
    
    solution = solve_vrptw(req)
    assert solution.status in ["OPTIMAL", "FEASIBLE"]
    assert len(solution.routes) > 0
    assigned_stops = sum(len(r.stops) for r in solution.routes)
    assert assigned_stops == 4
    assert len(solution.unassigned_stop_ids) == 0

if __name__ == "__main__":
    test_solver_basic_instance()
    print("Solver basic instance passed successfully!")
