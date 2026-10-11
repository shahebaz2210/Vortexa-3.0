"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import {
  Users,
  Truck,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Search,
  Filter,
  Volume2,
  RefreshCw,
  Plus,
  Shield,
  Star,
  Award,
  ExternalLink,
  ChevronRight,
  Package,
  Layers,
  Edit2,
  X,
  Play,
} from "lucide-react";

export interface DriverRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  assignedVehicleId: string;
  assignedVehicleModel: string;
  licensePlate: string;
  depot: string;
  status: "EN_ROUTE" | "LOADING" | "ON_BREAK" | "DELAYED" | "OFF_DUTY";
  statusReason?: string;
  shiftStart: string;
  shiftEnd: string;
  hoursWorked: number;
  currentRouteId: string;
  stopsTotal: number;
  stopsCompleted: number;
  currentStopName: string;
  currentStopEta: string;
  currentPayloadKg: number;
  maxPayloadKg: number;
  currentPayloadM3: number;
  maxPayloadM3: number;
  onTimeRatePercent: number;
  rating: number;
  licenseType: string;
  notes?: string;
}

const AVAILABLE_VEHICLES = [
  { id: "TRK-01", model: "Mercedes Actros 2545", plate: "DX-2026-AA" },
  { id: "TRK-02", model: "Volvo FH16 750", plate: "DX-2026-BB" },
  { id: "VAN-03", model: "Ford Transit EcoBlue 350", plate: "DX-2026-CC" },
  { id: "VAN-04", model: "Iveco Daily 35S18", plate: "DX-2026-DD" },
  { id: "EV-05", model: "Renault Master E-Tech", plate: "DX-2026-EE" },
  { id: "TRK-06", model: "Scania R 500 V8", plate: "DX-2026-FF" },
];

export default function DriverManagementPage() {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [metrics, setMetrics] = useState({
    totalDrivers: 6,
    enRoute: 2,
    loading: 1,
    delayed: 1,
    onBreak: 1,
    offDuty: 1,
    averageOnTimeRate: 98.3,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [depotFilter, setDepotFilter] = useState("ALL");

  // Reassignment Modal State
  const [selectedDriver, setSelectedDriver] = useState<DriverRecord | null>(null);
  const [newVehicleId, setNewVehicleId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Voice Ping / Debrief Modal
  const [voicePingDriver, setVoicePingDriver] = useState<DriverRecord | null>(null);
  const [isSendingVoicePing, setIsSendingVoicePing] = useState(false);
  const [voicePingSuccess, setVoicePingSuccess] = useState(false);

  // New Driver Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverPhone, setNewDriverPhone] = useState("");
  const [newDriverDepot, setNewDriverDepot] = useState("DEPOT-CENTRAL");
  const [newDriverLicense, setNewDriverLicense] = useState("Commercial Class B");

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/drivers");
      const json = await res.json();
      if (json.data) {
        setDrivers(json.data);
      }
      if (json.metrics) {
        setMetrics(json.metrics);
      }
    } catch (err) {
      console.error("Failed to load drivers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleReassignVehicle = async () => {
    if (!selectedDriver || !newVehicleId) return;
    setIsUpdating(true);
    try {
      const veh = AVAILABLE_VEHICLES.find((v) => v.id === newVehicleId);
      const res = await fetch("/api/v1/drivers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: selectedDriver.id,
          assignedVehicleId: newVehicleId,
          assignedVehicleModel: veh ? veh.model : newVehicleId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDrivers((prev) =>
          prev.map((d) => (d.id === selectedDriver.id ? data.data : d))
        );
        setSelectedDriver(null);
      }
    } catch (err) {
      console.error("Failed to reassign vehicle:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendVoicePing = async () => {
    if (!voicePingDriver) return;
    setIsSendingVoicePing(true);
    try {
      const res = await fetch("/api/v1/voice/driver-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverName: voicePingDriver.name,
          vehicleCode: voicePingDriver.assignedVehicleId,
          stopsCount: voicePingDriver.stopsTotal - voicePingDriver.stopsCompleted,
          disruptionAlert: voicePingDriver.statusReason || null,
        }),
      });
      if (res.ok) {
        setVoicePingSuccess(true);
        setTimeout(() => {
          setVoicePingSuccess(false);
          setVoicePingDriver(null);
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to broadcast voice:", err);
    } finally {
      setIsSendingVoicePing(false);
    }
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim()) return;
    try {
      const res = await fetch("/api/v1/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDriverName,
          phone: newDriverPhone || "+1 (415) 555-0100",
          depot: newDriverDepot,
          licenseType: newDriverLicense,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setDrivers((prev) => [...prev, json.data]);
        setShowAddModal(false);
        setNewDriverName("");
        setNewDriverPhone("");
      }
    } catch (err) {
      console.error("Failed to register driver:", err);
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.assignedVehicleId.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search);
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    const matchesDepot = depotFilter === "ALL" || d.depot === depotFilter;
    return matchesSearch && matchesStatus && matchesDepot;
  });

  const getStatusBadge = (status: DriverRecord["status"], reason?: string) => {
    switch (status) {
      case "EN_ROUTE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            En Route
          </span>
        );
      case "LOADING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Loading at Depot
          </span>
        );
      case "DELAYED":
        return (
          <span
            title={reason}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
          >
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            Delayed
          </span>
        );
      case "ON_BREAK":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            On DOT Break
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            Off Duty
          </span>
        );
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center shadow-xs">
                <Users className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                Driver Operations & Dispatch Hub
              </h1>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 ml-10.5">
              Live driver tracking, vehicle & route allocation, real-time status monitoring, and ElevenLabs voice dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/driver" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold flex items-center gap-1.5 border-primary/50 text-primary hover:bg-primary/10"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Launch In-Cab Terminal</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />}
              onClick={fetchDrivers}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Register Driver
            </Button>
          </div>
        </div>

        {/* Driver Operations KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-2xs">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block">
              Total Roster
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-bold text-[var(--foreground)] font-mono">
                {metrics.totalDrivers}
              </span>
              <Users className="h-4 w-4 text-[var(--muted-foreground)]" />
            </div>
            <span className="text-[10px] text-[var(--muted-foreground)] block mt-1">
              Active registered
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              En Route
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                {metrics.enRoute}
              </span>
              <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 block mt-1">
              Delivering stops
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/20 shadow-2xs">
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
              Loading
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-bold text-blue-800 dark:text-blue-300 font-mono">
                {metrics.loading}
              </span>
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-[10px] text-blue-600/80 dark:text-blue-400/80 block mt-1">
              At depot staging
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
              Delayed
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-bold text-amber-800 dark:text-amber-300 font-mono">
                {metrics.delayed}
              </span>
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 block mt-1">
              Disruption active
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-purple-200/60 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/20 shadow-2xs">
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider block">
              On Break
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-bold text-purple-800 dark:text-purple-300 font-mono">
                {metrics.onBreak}
              </span>
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-[10px] text-purple-600/80 dark:text-purple-400/80 block mt-1">
              DOT rest rule
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-2xs">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block">
              On-Time Rate
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-bold text-[var(--primary)] font-mono">
                {metrics.averageOnTimeRate}%
              </span>
              <Award className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <span className="text-[10px] text-[var(--muted-foreground)] block mt-1">
              Fleet SLA adherence
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search driver, ID, vehicle, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              <Filter className="h-3.5 w-3.5" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="EN_ROUTE">En Route</option>
                <option value="LOADING">Loading</option>
                <option value="DELAYED">Delayed</option>
                <option value="ON_BREAK">On Break</option>
                <option value="OFF_DUTY">Off Duty</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              <span>Depot:</span>
              <select
                value={depotFilter}
                onChange={(e) => setDepotFilter(e.target.value)}
                className="py-1.5 px-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
              >
                <option value="ALL">All Depots</option>
                <option value="DEPOT-CENTRAL">Central Hub</option>
                <option value="DEPOT-NORTH">North Logistics</option>
                <option value="DEPOT-EAST">East Terminal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Drivers Grid / Table */}
        <div className="flex flex-col gap-4">
          {filteredDrivers.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[var(--border)] rounded-2xl bg-[var(--surface)]">
              <Users className="h-10 w-10 text-[var(--muted-foreground)] mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold text-[var(--foreground)]">No drivers match this query</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Try adjusting your search terms or filters above.
              </p>
            </div>
          ) : (
            filteredDrivers.map((driver) => {
              const stopProgressPercent =
                driver.stopsTotal > 0
                  ? Math.round((driver.stopsCompleted / driver.stopsTotal) * 100)
                  : 0;
              const weightPercent =
                driver.maxPayloadKg > 0
                  ? Math.min(100, Math.round((driver.currentPayloadKg / driver.maxPayloadKg) * 100))
                  : 0;

              return (
                <div
                  key={driver.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 sm:p-5 shadow-2xs hover:border-[var(--primary)]/40 transition-all flex flex-col gap-4"
                >
                  {/* Top Bar: Driver Info & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                    <div className="flex items-start gap-3.5">
                      <div className="h-11 w-11 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-sm flex items-center justify-center shrink-0 border border-[var(--primary)]/20 shadow-2xs">
                        {driver.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base font-bold text-[var(--foreground)] tracking-tight">
                            {driver.name}
                          </h2>
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--muted-foreground)] font-semibold">
                            {driver.id}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-800">
                            {driver.licenseType}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {driver.phone}
                          </span>
                          <span>•</span>
                          <span>{driver.depot}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="h-3 w-3" />
                            Shift: {driver.shiftStart} - {driver.shiftEnd} ({driver.hoursWorked}h logged)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-center">
                      {getStatusBadge(driver.status, driver.statusReason)}
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-900/40">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{driver.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Disruption Alert Callout if Delayed */}
                  {driver.status === "DELAYED" && driver.statusReason && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>
                          <strong className="font-semibold">Disruption Notice:</strong> {driver.statusReason}
                        </span>
                      </div>
                      <Link href="/disruptions">
                        <button className="text-[11px] font-bold text-amber-700 dark:text-amber-300 underline hover:opacity-80 cursor-pointer">
                          Resolve Disruption →
                        </button>
                      </Link>
                    </div>
                  )}

                  {/* Mid Row: Vehicle, Route & Payload Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3.5 rounded-xl bg-[var(--surface-secondary)]/60 border border-[var(--border-subtle)]">
                    {/* Vehicle Assignment */}
                    <div className="flex flex-col justify-between">
                      <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block">
                        Assigned Vehicle
                      </span>
                      <div className="flex items-center justify-between mt-1">
                        <div>
                          <p className="text-sm font-bold text-[var(--foreground)] font-mono">
                            {driver.assignedVehicleId}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)] truncate">
                            {driver.assignedVehicleModel} ({driver.licensePlate})
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[11px] h-7 px-2 border-[var(--border)]"
                          onClick={() => {
                            setSelectedDriver(driver);
                            setNewVehicleId(driver.assignedVehicleId);
                          }}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Reassign
                        </Button>
                      </div>
                    </div>

                    {/* Route & Stop Progress */}
                    <div className="flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                          Route Progress
                        </span>
                        <span className="text-xs font-mono font-bold text-[var(--foreground)]">
                          {driver.stopsCompleted} / {driver.stopsTotal} Stops ({stopProgressPercent}%)
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[var(--primary)] h-full rounded-full transition-all duration-300"
                            style={{ width: `${stopProgressPercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1.5 truncate">
                          <strong className="text-[var(--foreground)]">Next:</strong> {driver.currentStopName} ({driver.currentStopEta})
                        </p>
                      </div>
                    </div>

                    {/* Cargo Load Status */}
                    <div className="flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                          Cargo Load
                        </span>
                        <span className="text-xs font-mono font-semibold text-[var(--muted-foreground)]">
                          {driver.currentPayloadKg} / {driver.maxPayloadKg} kg ({weightPercent}%)
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              weightPercent > 85 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${weightPercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1.5 flex justify-between font-mono">
                          <span>Vol: {driver.currentPayloadM3} / {driver.maxPayloadM3} m³</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {driver.onTimeRatePercent}% On-Time
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-[var(--muted-foreground)] italic truncate">
                      "{driver.notes || "Ready for next waypoint dispatch."}"
                    </p>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Volume2 className="h-3.5 w-3.5 text-blue-500" />}
                        className="text-xs"
                        onClick={() => setVoicePingDriver(driver)}
                      >
                        ElevenLabs Audio Ping
                      </Button>

                      <Link href={`/driver`} target="_blank">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/10"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          Driver In-Cab View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Vehicle Reassignment Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-6 shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2.5">
                <Truck className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="font-bold text-base text-[var(--foreground)]">
                  Reassign Vehicle: {selectedDriver.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDriver(null)}
                className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--muted-foreground)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[var(--muted-foreground)]">
              Select a vehicle to immediately transfer this driver's route manifest and active payload.
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[var(--foreground)]">
                Available Fleet Vehicles:
              </label>
              <select
                value={newVehicleId}
                onChange={(e) => setNewVehicleId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
              >
                {AVAILABLE_VEHICLES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.id} — {v.model} ({v.plate})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border)]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDriver(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isUpdating}
                onClick={handleReassignVehicle}
              >
                Confirm Reassignment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ElevenLabs Voice Ping / Debrief Modal */}
      {voicePingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2.5">
                <Volume2 className="h-5 w-5 text-blue-500" />
                <h3 className="font-bold text-base text-[var(--foreground)]">
                  Dispatch Voice Ping: {voicePingDriver.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVoicePingDriver(null)}
                className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--muted-foreground)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200">
              <p className="font-semibold mb-1">Synthesizing ElevenLabs Voice Announcement:</p>
              <p className="italic font-mono text-[11px]">
                "Hello {voicePingDriver.name}. Control room here. You have {voicePingDriver.stopsTotal - voicePingDriver.stopsCompleted} stops remaining on {voicePingDriver.assignedVehicleId}. Next stop is {voicePingDriver.currentStopName} scheduled for {voicePingDriver.currentStopEta}. Drive safe."
              </p>
            </div>

            {voicePingSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Audio broadcast sent to in-cab terminal successfully!</span>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border)]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVoicePingDriver(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isSendingVoicePing}
                  leftIcon={<Radio className="h-3.5 w-3.5" />}
                  onClick={handleSendVoicePing}
                >
                  Send Voice Broadcast
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateDriver}
            className="w-full max-w-md bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-6 shadow-xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2.5">
                <Users className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="font-bold text-base text-[var(--foreground)]">
                  Register New Fleet Driver
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--muted-foreground)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Jordan Miller"
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
                className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Phone Number</label>
              <input
                type="text"
                placeholder="+1 (415) 555-0188"
                value={newDriverPhone}
                onChange={(e) => setNewDriverPhone(e.target.value)}
                className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Depot</label>
                <select
                  value={newDriverDepot}
                  onChange={(e) => setNewDriverDepot(e.target.value)}
                  className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="DEPOT-CENTRAL">Central Hub</option>
                  <option value="DEPOT-NORTH">North Logistics</option>
                  <option value="DEPOT-EAST">East Terminal</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">License</label>
                <select
                  value={newDriverLicense}
                  onChange={(e) => setNewDriverLicense(e.target.value)}
                  className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="Commercial Class A">Class A + Semi</option>
                  <option value="Commercial Class B">Class B + Van</option>
                  <option value="Commercial Class C">Class C + Standard</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Register Driver
              </Button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
