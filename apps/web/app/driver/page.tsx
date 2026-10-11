"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Mic,
  Send,
  Navigation,
  Phone,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";

interface DriverStop {
  id: string;
  orderRef: string;
  customerName: string;
  address: string;
  timeWindow: string;
  weightKg: number;
  status: "PENDING" | "IN_TRANSIT" | "DELIVERED" | "FAILED";
  notes?: string;
}

export default function DriverWebPortalPage() {
  const [activeStopIndex, setActiveStopIndex] = useState(1);
  const [isReportingDisruption, setIsReportingDisruption] = useState(false);
  const [disruptionText, setDisruptionText] = useState("");
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [reportedAlert, setReportedAlert] = useState<string | null>(null);

  const [stops, setStops] = useState<DriverStop[]>([
    {
      id: "STOP-01",
      orderRef: "DEPOT-01",
      customerName: "Central Logistics Hub",
      address: "Depot Departure Gate 4",
      timeWindow: "08:00 - 08:30",
      weightKg: 0,
      status: "DELIVERED",
    },
    {
      id: "STOP-02",
      orderRef: "ORD-1001",
      customerName: "Astra Tech Labs",
      address: "12 Innovation Way, Tech District",
      timeWindow: "08:30 - 11:30",
      weightKg: 240,
      status: "DELIVERED",
    },
    {
      id: "STOP-03",
      orderRef: "ORD-1002",
      customerName: "BioGen Research",
      address: "45 Medical Sciences Park",
      timeWindow: "09:00 - 12:00",
      weightKg: 450,
      status: "IN_TRANSIT",
    },
    {
      id: "STOP-04",
      orderRef: "ORD-1004",
      customerName: "Vortex Quantum Hub",
      address: "101 Silicon Quay",
      timeWindow: "11:00 - 15:00",
      weightKg: 380,
      status: "PENDING",
    },
  ]);

  const activeStop = stops[activeStopIndex] || stops[2];

  const handleMarkDelivered = (index: number) => {
    setStops((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, status: "DELIVERED" } : s))
    );
    if (index + 1 < stops.length) {
      setActiveStopIndex(index + 1);
      setStops((prev) =>
        prev.map((s, idx) => (idx === index + 1 ? { ...s, status: "IN_TRANSIT" } : s))
      );
    }
  };

  const handleSendDisruption = () => {
    if (!disruptionText.trim()) return;
    setReportedAlert(`Incident sent to Dispatcher: "${disruptionText}". Route replan awaiting approval.`);
    setIsReportingDisruption(false);
    setDisruptionText("");
  };

  const handleSimulateVoiceInput = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      setDisruptionText("Truck breakdown near Industrial bypass. Engine overheating, need roadside assistance and remaining orders reallocated.");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col antialiased">
      {/* Driver Header */}
      <header className="h-14 border-b border-[var(--border)] bg-[var(--surface-elevated)] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Truck Alpha (TRK-01)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--success-subtle)] text-[var(--success-subtle-foreground)] font-mono font-semibold">
                ON SHIFT
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)]">Driver: Marcus Vance · 3/4 Stops Completed</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="outline" size="sm">
              Switch to Dispatcher
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<AlertTriangle className="h-4 w-4" />}
            onClick={() => setIsReportingDisruption(true)}
          >
            Report Disruption
          </Button>
        </div>
      </header>

      {/* Main Driver Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {reportedAlert && (
          <Alert variant="warning" title="Incident Staged to Dispatcher" onClose={() => setReportedAlert(null)}>
            {reportedAlert}
          </Alert>
        )}

        {/* Current Target Stop Hero Card */}
        {activeStop && activeStop.status !== "DELIVERED" ? (
          <div className="rounded-xl border-2 border-[var(--primary)] bg-[var(--card)] p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider">
                  CURRENT ACTIVE DELIVERY
                </span>
                <h2 className="text-xl font-bold text-[var(--foreground)] mt-0.5">
                  {activeStop.customerName}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mt-1">
                  <MapPin className="h-3.5 w-3.5 text-[var(--primary)]" />
                  <span>{activeStop.address}</span>
                </div>
              </div>
              <StatusBadge status="ACTIVE_VEHICLE" customLabel="EN ROUTE" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-[var(--surface-secondary)] text-xs">
              <div>
                <span className="text-[var(--muted-foreground)] block text-[10px]">ORDER REF</span>
                <span className="font-mono font-bold text-[var(--foreground)]">{activeStop.orderRef}</span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)] block text-[10px]">TIME WINDOW</span>
                <span className="font-mono font-bold text-[var(--foreground)]">{activeStop.timeWindow}</span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)] block text-[10px]">PAYLOAD WEIGHT</span>
                <span className="font-mono font-bold text-[var(--foreground)]">{activeStop.weightKg} kg</span>
              </div>
            </div>

            {/* Stop Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                leftIcon={<CheckCircle2 className="h-5 w-5" />}
                onClick={() => handleMarkDelivered(activeStopIndex)}
              >
                Mark as Delivered
              </Button>
              <Button
                variant="outline"
                size="lg"
                leftIcon={<Navigation className="h-4 w-4" />}
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeStop.address)}`, "_blank")}
              >
                Directions
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-xl border border-[var(--success-border)] bg-[var(--success-subtle)] text-center flex flex-col items-center gap-2">
            <CheckCircle2 className="h-10 w-10 text-[var(--success)]" />
            <h3 className="text-lg font-bold text-[var(--success-subtle-foreground)]">Shift Manifest Fully Completed!</h3>
            <p className="text-xs text-[var(--success-subtle-foreground)]">All scheduled deliveries have been fulfilled and verified.</p>
          </div>
        )}

        {/* Route Stops Sequence */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Full Shift Stop Sequence ({stops.length} stops)
          </h3>

          <div className="space-y-2.5">
            {stops.map((stop, index) => {
              const isCurrent = index === activeStopIndex && stop.status !== "DELIVERED";
              return (
                <div
                  key={stop.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    isCurrent
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                        stop.status === "DELIVERED"
                          ? "bg-[var(--success-subtle)] text-[var(--success-subtle-foreground)]"
                          : isCurrent
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--surface-secondary)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[var(--foreground)]">{stop.customerName}</div>
                      <div className="text-[11px] text-[var(--muted-foreground)] truncate max-w-sm">{stop.address}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[var(--muted-foreground)] hidden sm:inline">{stop.timeWindow}</span>
                    <StatusBadge status={stop.status} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Disruption Report Modal (Voice / Text) */}
      <Modal
        isOpen={isReportingDisruption}
        onClose={() => setIsReportingDisruption(false)}
        title="Report Vehicle Disruption or Delay"
        description="Dispatches incident report to the central control room. Replanning will be staged for dispatcher approval."
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-xs">
              <Mic className={`h-4 w-4 ${isRecordingVoice ? "text-[var(--destructive)] animate-pulse" : "text-[var(--primary)]"}`} />
              <span>{isRecordingVoice ? "ElevenLabs Voice Transcription Listening..." : "Record Incident with ElevenLabs Speech-to-Text"}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              isLoading={isRecordingVoice}
              onClick={handleSimulateVoiceInput}
            >
              {isRecordingVoice ? "Recording..." : "Voice Input"}
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--foreground)]">
              Describe Incident & Location
            </label>
            <textarea
              rows={4}
              value={disruptionText}
              onChange={(e) => setDisruptionText(e.target.value)}
              placeholder="e.g. Flat tire on Highway 101 near Exit 14. Cannot proceed for 45 minutes..."
              className="w-full rounded-lg border border-[var(--input)] bg-[var(--surface-input)] p-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsReportingDisruption(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Send className="h-3.5 w-3.5" />}
              onClick={handleSendDisruption}
              disabled={!disruptionText.trim()}
            >
              Send Incident Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
