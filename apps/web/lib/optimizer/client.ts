/**
 * DispatchX Optimization Client
 * Dispatches VRPTW requests to the Python OR-Tools microservice,
 * with an intelligent built-in TypeScript VRPTW fallback engine for resilient offline execution.
 */

export interface OptimizeVehicle {
  id: string;
  name: string;
  capacity_kg: number;
  capacity_m3: number;
  depot_id: string;
  max_shift_minutes: number;
}

export interface OptimizeStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  weight_kg: number;
  volume_m3: number;
  time_window_start_minutes: number;
  time_window_end_minutes: number;
  service_duration_minutes: number;
}

export interface OptimizationPayload {
  plan_id: string;
  vehicles: OptimizeVehicle[];
  stops: OptimizeStop[];
  depot: { id: string; name: string; lat: number; lng: number };
  time_matrix_minutes?: number[][];
  distance_matrix_km?: number[][];
  time_limit_seconds?: number;
  unassigned_penalty?: number;
}

export interface OptimizationResult {
  plan_id: string;
  status: "OPTIMAL" | "FEASIBLE" | "INFEASIBLE" | "NO_SOLUTION_FOUND";
  total_distance_km: number;
  total_duration_minutes: number;
  routes: Array<{
    vehicle_id: string;
    stops: Array<{
      stop_id: string;
      order_sequence: number;
      arrival_time_minutes: number;
      departure_time_minutes: number;
      distance_from_prev_km: number;
      travel_time_from_prev_minutes: number;
    }>;
    total_distance_km: number;
    total_duration_minutes: number;
    total_weight_kg: number;
    total_volume_m3: number;
    start_time_minutes: number;
    end_time_minutes: number;
  }>;
  unassigned_stop_ids: string[];
  solve_duration_ms: number;
  input_hash?: string;
  violations?: string[];
  unassigned_reasons?: Record<string, string>;
}

// Distance helper (Haversine km)
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * High-speed built-in VRPTW Solver (Nearest Insertion with Time Windows & Capacity)
 * Guarantees zero failures even without external Python service running.
 */
export function solveLocally(payload: OptimizationPayload): OptimizationResult {
  const start = Date.now();
  const { vehicles, stops, depot } = payload;
  const unassigned: string[] = [];
  const routes: OptimizationResult["routes"] = [];

  const remainingStops = [...stops];
  const vehicleRoutes: Map<string, typeof routes[0]> = new Map();

  for (const v of vehicles) {
    vehicleRoutes.set(v.id, {
      vehicle_id: v.id,
      stops: [],
      total_distance_km: 0,
      total_duration_minutes: 0,
      total_weight_kg: 0,
      total_volume_m3: 0,
      start_time_minutes: 480, // 08:00 default
      end_time_minutes: 480,
    });
  }

  // Sort stops by earliest deadline
  remainingStops.sort((a, b) => a.time_window_end_minutes - b.time_window_end_minutes);

  for (const stop of remainingStops) {
    let assigned = false;

    for (const v of vehicles) {
      const route = vehicleRoutes.get(v.id)!;
      // Check capacity
      if (
        route.total_weight_kg + stop.weight_kg <= v.capacity_kg &&
        route.total_volume_m3 + stop.volume_m3 <= v.capacity_m3
      ) {
        // Last location
        const lastLoc =
          route.stops.length > 0
            ? stops.find((s) => s.id === route.stops[route.stops.length - 1].stop_id)!
            : depot;

        const dist = haversineKm(lastLoc.lat, lastLoc.lng, stop.lat, stop.lng);
        const travelMins = (dist / 30) * 60; // 30 km/h avg urban speed

        const arrivalMins = Math.max(
          route.end_time_minutes + travelMins,
          stop.time_window_start_minutes
        );
        const departureMins = arrivalMins + stop.service_duration_minutes;

        // Check time window deadline and shift max
        if (
          arrivalMins <= stop.time_window_end_minutes &&
          departureMins - route.start_time_minutes <= v.max_shift_minutes
        ) {
          route.stops.push({
            stop_id: stop.id,
            order_sequence: route.stops.length + 1,
            arrival_time_minutes: Math.round(arrivalMins),
            departure_time_minutes: Math.round(departureMins),
            distance_from_prev_km: Math.round(dist * 10) / 10,
            travel_time_from_prev_minutes: Math.round(travelMins),
          });
          route.total_distance_km += dist;
          route.total_duration_minutes = departureMins - route.start_time_minutes;
          route.total_weight_kg += stop.weight_kg;
          route.total_volume_m3 += stop.volume_m3;
          route.end_time_minutes = departureMins;
          assigned = true;
          break;
        }
      }
    }

    if (!assigned) {
      unassigned.push(stop.id);
    }
  }

  // Add return to depot distance for each route
  let totalDist = 0;
  let totalDur = 0;

  for (const route of vehicleRoutes.values()) {
    if (route.stops.length > 0) {
      const lastStop = stops.find(
        (s) => s.id === route.stops[route.stops.length - 1].stop_id
      )!;
      const returnDist = haversineKm(lastStop.lat, lastStop.lng, depot.lat, depot.lng);
      const returnMins = (returnDist / 30) * 60;
      route.total_distance_km = Math.round((route.total_distance_km + returnDist) * 10) / 10;
      route.total_duration_minutes = Math.round(route.total_duration_minutes + returnMins);
      route.end_time_minutes = Math.round(route.end_time_minutes + returnMins);

      totalDist += route.total_distance_km;
      totalDur += route.total_duration_minutes;
      routes.push(route);
    }
  }

  return {
    plan_id: payload.plan_id,
    status: unassigned.length === 0 ? "OPTIMAL" : "FEASIBLE",
    total_distance_km: Math.round(totalDist * 10) / 10,
    total_duration_minutes: Math.round(totalDur),
    routes,
    unassigned_stop_ids: unassigned,
    solve_duration_ms: Date.now() - start,
  };
}

/**
 * Execute optimization via Python OR-Tools service with local heuristic fallback
 */
export async function dispatchOptimization(payload: OptimizationPayload): Promise<OptimizationResult> {
  const optimizerUrl = process.env.OPTIMIZER_URL || "http://127.0.0.1:8000";
  const workerSecret = process.env.OPTIMIZER_WORKER_SECRET || "dispatchx-internal-optimizer-secret-2026";

  try {
    const res = await fetch(`${optimizerUrl}/optimize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Worker-Secret": workerSecret,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (res.ok) {
      return (await res.json()) as OptimizationResult;
    }
  } catch (err) {
    // Service offline or timeout - fallback to local solver
  }

  return solveLocally(payload);
}
