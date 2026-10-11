"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/app-shell";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { FleetMap } from "@/components/map/fleet-map";
import {
  Truck,
  Package,
  Clock,
  AlertTriangle,
  Play,
  RotateCw,
  FileSpreadsheet,
  PlusCircle,
  Volume2,
} from "lucide-react";

interface FleetVehicleSummary {
  id: string;
  name: string;
  driverName: string;
  status: string;
  utilization: string;
  nextStop: string;
  eta: string;
}

const DEMO_FLEET: FleetVehicleSummary[] = [
  {
    id: "TRK-01",
    name: "Truck Alpha (Mercedes Actros)",
    driverName: "Marcus Vance",
    status: "ACTIVE_VEHICLE",
    utilization: "78% (3,120 / 4,000 kg)",
    nextStop: "Tech Hub Stop #4",
    eta: "11:45 AM",
  },
  {
    id: "TRK-02",
    name: "Truck Beta (Volvo FH16)",
    driverName: "Sarah Connor",
    status: "DELAYED_ROUTE",
    utilization: "92% (4,600 / 5,000 kg)",
    nextStop: "Industrial Park Gate B",
    eta: "12:15 PM (+18m)",
  },
  {
    id: "TRK-03",
    name: "Van Gamma (Ford Transit)",
    driverName: "David Kim",
    status: "ACTIVE_VEHICLE",
    utilization: "45% (675 / 1,500 kg)",
    nextStop: "Metro Medical Center",
    eta: "11:30 AM",
  },
];

export default function ControlRoomPage() {
  const [isReplanning, setIsReplanning] = useState(false);
  const [activeAlert, setActiveAlert] = useState<string | null>(
    "Road closure detected on Industrial Bypass. 3 orders on Truck Beta risk time-window violations."
  );

  const fleetColumns: Column<FleetVehicleSummary>[] = [
    {
      key: "id",
      header: "Vehicle ID",
      sortable: true,
      render: (row) => <span className="font-mono font-semibold text-[var(--primary)]">{row.id}</span>,
    },
    {
      key: "name",
      header: "Vehicle & Model",
      render: (row) => (
        <div>
          <div className="font-medium text-[var(--foreground)]">{row.name}</div>
          <div className="text-[11px] text-[var(--muted-foreground)]">Driver: {row.driverName}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: "utilization",
      header: "Payload Capacity",
      render: (row) => (
        <span className="font-mono text-xs text-[var(--text-secondary)]">{row.utilization}</span>
      ),
    },
    {
      key: "nextStop",
      header: "Next Stop",
    },
    {
      key: "eta",
      header: "ETA",
      align: "right",
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-[var(--foreground)]">{row.eta}</span>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Control Room Dashboard
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Live fleet telemetry, schedule tracking, and human-in-the-loop disruption recovery.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/plans/new">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileSpreadsheet className="h-4 w-4 text-[var(--primary)]" />}
              >
                Upload Excel/CSV Plan
              </Button>
            </Link>

            <Link href="/disruptions">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<AlertTriangle className="h-4 w-4 text-[var(--warning)]" />}
              >
                Incident Ingestion
              </Button>
            </Link>

            <Button
              variant="primary"
              size="sm"
              isLoading={isReplanning}
              leftIcon={<RotateCw className="h-4 w-4" />}
              onClick={() => {
                setIsReplanning(true);
                setTimeout(() => setIsReplanning(false), 1500);
              }}
            >
              Re-optimize Routes
            </Button>
          </div>
        </div>

        {/* Operational Disruption Alert Banner */}
        {activeAlert && (
          <Alert
            variant="warning"
            title="Active Operational Disruption Detected"
            onClose={() => setActiveAlert(null)}
          >
            {activeAlert}
            <div className="mt-2 flex items-center gap-2">
              <Link href="/disruptions">
                <Button size="sm" variant="danger">
                  Review & Replan Impact
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<Volume2 className="h-3.5 w-3.5" />}
                onClick={() => alert("ElevenLabs voice briefing queued")}
              >
                Play Audio Incident Briefing
              </Button>
            </div>
          </Alert>
        )}

        {/* Real-time KPI Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Active Fleet Units"
            value="3 / 3"
            unit="VEHICLES"
            icon={<Truck className="h-4 w-4" />}
            subtitle="100% operational readiness"
          />

          <KPICard
            label="Deliveries On Plan"
            value="42 / 48"
            unit="ORDERS"
            icon={<Package className="h-4 w-4" />}
            delta={{
              value: "87.5%",
              trend: "up",
              periodLabel: "shift completion rate",
            }}
          />

          <KPICard
            label="Avg On-Time Arrival"
            value="98.2%"
            unit="SLA"
            icon={<Clock className="h-4 w-4" />}
            delta={{
              value: "+1.4%",
              trend: "up",
              periodLabel: "vs yesterday",
            }}
          />

          <KPICard
            label="Active Disruptions"
            value="1"
            unit="ALERT"
            icon={<AlertTriangle className="h-4 w-4 text-[var(--warning)]" />}
            delta={{
              value: "1 pending review",
              trend: "down",
              isPositive: false,
              periodLabel: "Truck Beta",
            }}
          />
        </div>

        {/* Real-time Fleet Map Display */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Real-Time Fleet Routing & Node Network
            </h2>
            <span className="text-xs font-mono text-[var(--muted-foreground)]">Valhalla Engine · PostGIS Active</span>
          </div>
          <FleetMap />
        </div>

        {/* Fleet Operational Table */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Active Vehicle Fleet & Schedule
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Continuous GPS position tracking and load capacity monitoring.
              </p>
            </div>
            <Link href="/fleet" className="text-xs font-medium text-[var(--primary)] hover:underline">
              View All 12 Fleet Units →
            </Link>
          </div>

          <DataTable
            columns={fleetColumns}
            data={DEMO_FLEET}
            keyExtractor={(row) => row.id}
          />
        </div>

        {/* Quick Replanning & Constraint Rules Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold text-xs text-[var(--foreground)]">
              <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
              Preserve Completed Orders (INV-01)
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Once an order is signed or marked delivered, replanning is strictly forbidden from reassigning or altering its sequence.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold text-xs text-[var(--foreground)]">
              <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
              Dynamic Capacity Balancing
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Real-time vehicle weight (kg) and volumetric (m³) constraints enforced via Google OR-Tools VRPTW solver algorithms.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold text-xs text-[var(--foreground)]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              Human-in-the-Loop Activation
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Replanned routes remain Proposed (dashed) until the dispatcher explicitly approves. Compare KEPT, MOVED, and BROKEN orders side-by-side.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
