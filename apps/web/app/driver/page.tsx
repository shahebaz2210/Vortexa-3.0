"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { VoiceRecorder } from "@/components/driver/voice-recorder";
import { ProofOfDeliveryModal } from "@/components/driver/proof-of-delivery";

interface DriverStop {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  plannedArrival: string;
  packageWeight: number;
  packageVolume: number;
  status: "COMPLETED" | "ACTIVE" | "PENDING";
  specialNotes?: string;
}

export default function DriverPortalPage() {
  const [vehicleId] = useState("VH-001 (SF-789-TX)");
  const [isPlayingBriefing, setIsPlayingBriefing] = useState(false);
  const [selectedPodStop, setSelectedPodStop] = useState<DriverStop | null>(null);

  const [stops, setStops] = useState<DriverStop[]>([
    {
      id: "STOP-01",
      orderId: "ORD-9901",
      customerName: "Apex BioLabs",
      address: "185 Berry St, Suite 400, SF",
      plannedArrival: "08:45 AM",
      packageWeight: 45,
      packageVolume: 0.35,
      status: "COMPLETED",
    },
    {
      id: "STOP-02",
      orderId: "ORD-9902",
      customerName: "Marina Grocers",
      address: "2200 Chestnut St, SF",
      plannedArrival: "09:30 AM",
      packageWeight: 120,
      packageVolume: 1.1,
      status: "ACTIVE",
      specialNotes: "Dock entrance in alleyway; code 4490",
    },
    {
      id: "STOP-03",
      orderId: "ORD-9903",
      customerName: "Mission Culinary Arts",
      address: "750 Valencia St, SF",
      plannedArrival: "10:15 AM",
      packageWeight: 85,
      packageVolume: 0.7,
      status: "PENDING",
    },
    {
      id: "STOP-04",
      orderId: "ORD-9904",
      customerName: "Presidio Diagnostic Clinic",
      address: "102 Montgomery St, SF",
      plannedArrival: "11:20 AM",
      packageWeight: 28,
      packageVolume: 0.2,
      status: "PENDING",
    },
  ]);

  const markDelivered = (stopId: string) => {
    setStops((prev) =>
      prev.map((s) => (s.id === stopId ? { ...s, status: "COMPLETED" } : s))
    );
  };

  const playShiftBriefing = async () => {
    setIsPlayingBriefing(true);
    const briefingText =
      "Good morning driver. You are operating vehicle VH 001. Today you have four scheduled stops across San Francisco. Your next immediate stop is Marina Grocers on Chestnut Street, planned for 9:30 AM. Drive safely and use the voice microphone if you encounter any disruptions.";

    try {
      const res = await fetch("/api/v1/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: briefingText }),
      });

      if (res.headers.get("content-type")?.includes("audio/mpeg")) {
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audio.onended = () => setIsPlayingBriefing(false);
        audio.play();
        return;
      }
    } catch {
      // Fallback
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(briefingText);
      utterance.onend = () => setIsPlayingBriefing(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingBriefing(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Driver Header */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                Active Shift • Web Driver Terminal
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-1">Driver Portal: Alex Vance</h1>
            <p className="text-sm text-muted">
              Assigned Vehicle: <span className="font-semibold text-foreground">{vehicleId}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="secondary" size="sm" className="text-xs">
                ← Back to Dispatcher
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={playShiftBriefing}
              disabled={isPlayingBriefing}
              className="flex items-center gap-2 text-xs border-primary/40 text-primary hover:bg-primary/10"
            >
              <span>{isPlayingBriefing ? "🔊 Playing..." : "🗣️ Audio Shift Briefing"}</span>
            </Button>
          </div>
        </div>

        {/* ElevenLabs Voice Incident Reporting Section */}
        <VoiceRecorder vehicleId={vehicleId} />

        {/* Today's Route Stops Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Assigned Route Manifest</h2>
            <div className="text-xs text-muted">
              {stops.filter((s) => s.status === "COMPLETED").length} of {stops.length} completed
            </div>
          </div>

          <div className="space-y-3">
            {stops.map((stop, index) => {
              const isCurrent = stop.status === "ACTIVE";
              return (
                <div
                  key={stop.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30"
                      : stop.status === "COMPLETED"
                      ? "border-border bg-muted/20 opacity-70"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          stop.status === "COMPLETED"
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {stop.status === "COMPLETED" ? "✓" : index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground">
                            {stop.customerName}
                          </h3>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                              CURRENT STOP
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted mt-0.5">{stop.address}</p>
                        {stop.specialNotes && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            ℹ️ Note: {stop.specialNotes}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted mt-2">
                          <span>
                            ETA: <strong className="text-foreground">{stop.plannedArrival}</strong>
                          </span>
                          <span>Weight: {stop.packageWeight} kg</span>
                          <span>Volume: {stop.packageVolume} m³</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={stop.status} />
                      {stop.status !== "COMPLETED" && (
                        <Button
                          variant={isCurrent ? "primary" : "outline"}
                          size="sm"
                          onClick={() => setSelectedPodStop(stop)}
                          className="text-xs"
                        >
                          Confirm Delivery (POD)
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* POD Modal */}
        {selectedPodStop && (
          <ProofOfDeliveryModal
            orderId={selectedPodStop.orderId}
            customerName={selectedPodStop.customerName}
            onDelivered={() => markDelivered(selectedPodStop.id)}
            onClose={() => setSelectedPodStop(null)}
          />
        )}
      </div>
    </AppShell>
  );
}
