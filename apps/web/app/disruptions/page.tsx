"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  AlertTriangle,
  RotateCw,
  Check,
  X,
  Volume2,
  Mic,
  ArrowRight,
  Truck,
  Package,
} from "lucide-react";

interface Incident {
  id: string;
  incidentType: "BREAKDOWN" | "ROAD_CLOSURE" | "DELAY" | "URGENT_ORDER";
  vehicleCode: string;
  driverName: string;
  locationName: string;
  description: string;
  reportedAt: string;
  status: "AWAITING_APPROVAL" | "APPROVED" | "REJECTED";
  affectedOrdersCount: number;
}

export default function DisruptionsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: "INC-901",
      incidentType: "ROAD_CLOSURE",
      vehicleCode: "TRK-02",
      driverName: "Sarah Connor",
      locationName: "Industrial Bypass KM 14",
      description: "Severe roadwork blocking northbound arterial. Detour adds 40 mins travel time.",
      reportedAt: "10:14 AM",
      status: "AWAITING_APPROVAL",
      affectedOrdersCount: 3,
    },
    {
      id: "INC-902",
      incidentType: "BREAKDOWN",
      vehicleCode: "TRK-01",
      driverName: "Marcus Vance",
      locationName: "Exit 4 Junction",
      description: "Engine oil pressure warning indicator. Safe pull-over at service bay.",
      reportedAt: "09:42 AM",
      status: "APPROVED",
      affectedOrdersCount: 2,
    },
  ]);

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isComparingReplan, setIsComparingReplan] = useState(false);

  const handleApprove = (incident: Incident) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === incident.id ? { ...i, status: "APPROVED" } : i))
    );
    setSelectedIncident(null);
  };

  const handleReject = (incident: Incident) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === incident.id ? { ...i, status: "REJECTED" } : i))
    );
    setSelectedIncident(null);
  };

  const columns: Column<Incident>[] = [
    {
      key: "id",
      header: "Incident ID",
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-[var(--primary)]">{r.id}</span>,
    },
    {
      key: "incidentType",
      header: "Type",
      render: (r) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--surface-secondary)] border border-[var(--border-subtle)]">
          {r.incidentType}
        </span>
      ),
    },
    {
      key: "vehicleCode",
      header: "Vehicle & Driver",
      render: (r) => (
        <div>
          <div className="font-semibold text-xs text-[var(--foreground)]">{r.vehicleCode}</div>
          <div className="text-[11px] text-[var(--muted-foreground)]">{r.driverName}</div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Incident Summary",
      render: (r) => (
        <div className="max-w-md">
          <div className="text-xs font-medium text-[var(--foreground)]">{r.description}</div>
          <div className="text-[11px] text-[var(--muted-foreground)]">Location: {r.locationName}</div>
        </div>
      ),
    },
    {
      key: "reportedAt",
      header: "Reported",
      align: "right",
      render: (r) => <span className="font-mono text-xs">{r.reportedAt}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge
          status={
            r.status === "AWAITING_APPROVAL"
              ? "AWAITING_APPROVAL"
              : r.status === "APPROVED"
              ? "APPROVED_REPLAN"
              : "FAILED"
          }
          size="sm"
        />
      ),
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      render: (r) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedIncident(r)}
        >
          Review & Replan
        </Button>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Disruptions & Incidents", isCurrent: true },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Disruptions & Incident Ingestion
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Human-in-the-loop recovery control: review reported disruptions, compare KEPT/MOVED/BROKEN orders, and trigger replans.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Volume2 className="h-4 w-4" />}
              onClick={() => alert("ElevenLabs voice debriefing queued")}
            >
              Play Shift Audio Incident Briefing
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={incidents}
          keyExtractor={(r) => r.id}
        />

        {/* Incident Review & Replan Comparison Modal */}
        {selectedIncident && (
          <Modal
            isOpen={!!selectedIncident}
            onClose={() => setSelectedIncident(null)}
            size="lg"
            title={`Review Incident: ${selectedIncident.id} (${selectedIncident.incidentType})`}
            description="Human-in-the-loop safeguard: Review suggested route alterations before activating them across the fleet."
          >
            <div className="flex flex-col gap-5">
              <div className="p-3.5 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--foreground)]">Vehicle: {selectedIncident.vehicleCode} ({selectedIncident.driverName})</span>
                  <span className="font-mono text-[var(--muted-foreground)]">{selectedIncident.reportedAt}</span>
                </div>
                <p className="text-[var(--text-secondary)]">{selectedIncident.description}</p>
                <div className="text-[11px] text-[var(--primary)] font-medium">Location: {selectedIncident.locationName}</div>
              </div>

              {/* KEPT / MOVED / BROKEN Comparison Grid */}
              <div className="flex flex-col gap-2.5">
                <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                  Impact Simulation (OR-Tools Dynamic Replanner)
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-[var(--status-kept-border)] bg-[var(--status-kept-bg)] flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-[var(--status-kept)] uppercase">KEPT (Unchanged)</span>
                    <span className="text-xl font-bold font-mono text-[var(--status-kept)] mt-1">9</span>
                    <span className="text-[10px] text-[var(--status-kept)]">Preserves completed stops</span>
                  </div>

                  <div className="p-3 rounded-lg border border-[var(--status-moved-border)] bg-[var(--status-moved-bg)] flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-[var(--status-moved)] uppercase">MOVED (Reassigned)</span>
                    <span className="text-xl font-bold font-mono text-[var(--status-moved)] mt-1">2</span>
                    <span className="text-[10px] text-[var(--status-moved)]">Reallocated to Truck Alpha</span>
                  </div>

                  <div className="p-3 rounded-lg border border-[var(--status-broken-border)] bg-[var(--status-broken-bg)] flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-[var(--status-broken)] uppercase">BROKEN (Unassigned)</span>
                    <span className="text-xl font-bold font-mono text-[var(--status-broken)] mt-1">0</span>
                    <span className="text-[10px] text-[var(--status-broken)]">All orders feasible</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
                <Button variant="ghost" size="sm" onClick={() => handleReject(selectedIncident)}>
                  Reject Incident
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Check className="h-4 w-4" />}
                  onClick={() => handleApprove(selectedIncident)}
                >
                  Approve Replan & Deploy to Fleet
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
