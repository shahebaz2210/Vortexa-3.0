"use client";

import React from "react";
import { AppShell } from "@/components/shell/app-shell";
import { FleetMap } from "@/components/map/fleet-map";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Activity, Truck, Signal, Clock } from "lucide-react";

export default function LiveMonitorPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Live Fleet Telemetry & Node Monitor", isCurrent: true },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                Live Fleet Routing Monitor
              </h1>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--success-subtle)] text-[11px] font-medium text-[var(--success-subtle-foreground)] border border-[var(--success-border)]">
                <span className="h-2 w-2 rounded-full bg-[var(--success)] animate-ping" />
                Live Telemetry
              </span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              High-frequency GPS updates, route adherence verification, and automated disruption sensing.
            </p>
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <KPICard
            label="Active Transponders"
            value="3 / 3"
            unit="ONLINE"
            icon={<Signal className="h-4 w-4 text-[var(--success)]" />}
          />
          <KPICard
            label="Average Ping Latency"
            value="42"
            unit="MS"
            icon={<Activity className="h-4 w-4" />}
          />
          <KPICard
            label="Route Adherence"
            value="99.4%"
            unit="ON PLAN"
            icon={<Truck className="h-4 w-4 text-[var(--primary)]" />}
          />
          <KPICard
            label="Next Stop Arrival"
            value="11:45"
            unit="AM"
            icon={<Clock className="h-4 w-4" />}
            subtitle="Truck Alpha -> Tech Hub"
          />
        </div>

        {/* Interactive Map */}
        <div className="rounded-xl overflow-hidden border border-[var(--border)] shadow-xs">
          <FleetMap className="h-[620px]" />
        </div>
      </div>
    </AppShell>
  );
}
