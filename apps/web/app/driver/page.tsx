"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { VoiceRecorder } from "@/components/driver/voice-recorder";
import { ProofOfDeliveryModal } from "@/components/driver/proof-of-delivery";
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  ChevronRight,
  FileCheck,
  Radio,
} from "lucide-react";

interface DriverStop {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  contactPhone: string;
  plannedArrival: string;
  timeWindow: string;
  packageWeightKg: number;
  packageVolumeM3: number;
  status: "COMPLETED" | "ACTIVE" | "PENDING";
  specialNotes?: string;
}

export default function StandaloneDriverPortal() {
  const [activeTab, setActiveTab] = useState<"MANIFEST" | "VOICE" | "DELIVERED">("MANIFEST");
  const [selectedDriverId, setSelectedDriverId] = useState("DRV-101");
  const [isPlayingBriefing, setIsPlayingBriefing] = useState(false);
  const [selectedPodStop, setSelectedPodStop] = useState<DriverStop | null>(null);

  const DRIVER_PROFILES: Record<string, { name: string; vehicle: string; plate: string }> = {
    "DRV-101": { name: "Alex Vance", vehicle: "TRK-01 (Mercedes Actros)", plate: "DX-2026-AA" },
    "DRV-102": { name: "Sarah Connor", vehicle: "TRK-02 (Volvo FH16)", plate: "DX-2026-BB" },
    "DRV-103": { name: "Marcus Brody", vehicle: "VAN-03 (Ford Transit 350)", plate: "DX-2026-CC" },
    "DRV-104": { name: "Elena Rostova", vehicle: "VAN-04 (Iveco Daily 35S18)", plate: "DX-2026-DD" },
    "DRV-105": { name: "David Chen", vehicle: "EV-05 (Renault Master E-Tech)", plate: "DX-2026-EE" },
  };

  const currentProfile = DRIVER_PROFILES[selectedDriverId] || DRIVER_PROFILES["DRV-101"];
  const driverName = currentProfile.name;
  const vehicleId = currentProfile.vehicle;

  const [stops, setStops] = useState<DriverStop[]>([
    {
      id: "STOP-01",
      orderId: "ORD-9901",
      customerName: "Apex BioLabs",
      address: "185 Berry St, Suite 400, SF",
      contactPhone: "+1 (415) 555-0192",
      plannedArrival: "08:45 AM",
      timeWindow: "08:00 - 10:00 AM",
      packageWeightKg: 45,
      packageVolumeM3: 0.35,
      status: "COMPLETED",
      specialNotes: "Building security requires badge check at lobby desk.",
    },
    {
      id: "STOP-02",
      orderId: "ORD-9902",
      customerName: "Marina Grocers",
      address: "2200 Chestnut St, SF",
      contactPhone: "+1 (415) 555-7821",
      plannedArrival: "09:30 AM",
      timeWindow: "09:00 - 11:30 AM",
      packageWeightKg: 120,
      packageVolumeM3: 1.1,
      status: "ACTIVE",
      specialNotes: "Loading dock entry via rear alleyway. Gate access code 4490.",
    },
    {
      id: "STOP-03",
      orderId: "ORD-9903",
      customerName: "Mission Culinary Arts",
      address: "750 Valencia St, SF",
      contactPhone: "+1 (415) 555-4309",
      plannedArrival: "10:15 AM",
      timeWindow: "10:00 - 12:30 PM",
      packageWeightKg: 85,
      packageVolumeM3: 0.7,
      status: "PENDING",
      specialNotes: "Heavy crates: hand-truck required. Ring kitchen bell.",
    },
    {
      id: "STOP-04",
      orderId: "ORD-9904",
      customerName: "Presidio Diagnostic Clinic",
      address: "102 Montgomery St, SF",
      contactPhone: "+1 (415) 555-8812",
      plannedArrival: "11:20 AM",
      timeWindow: "11:00 - 01:00 PM",
      packageWeightKg: 28,
      packageVolumeM3: 0.2,
      status: "PENDING",
      specialNotes: "Temperature-controlled medical supplies. Priority dropoff.",
    },
  ]);

  const completedCount = stops.filter((s) => s.status === "COMPLETED").length;
  const progressPercent = Math.round((completedCount / stops.length) * 100);

  const markDelivered = (stopId: string) => {
    setStops((prev) =>
      prev.map((s, idx) => {
        if (s.id === stopId) {
          return { ...s, status: "COMPLETED" };
        }
        // Activate next stop automatically
        if (prev[idx - 1]?.id === stopId && s.status === "PENDING") {
          return { ...s, status: "ACTIVE" };
        }
        return s;
      })
    );
  };

  const playShiftBriefing = async () => {
    setIsPlayingBriefing(true);
    const briefingText =
      "Good morning Alex. You are operating vehicle VH-001 with four scheduled deliveries today. Your current immediate stop is Marina Grocers on Chestnut Street, planned for 9:30 AM. Loading dock code is 4490. If you encounter any traffic or road closures, use the voice incident button to alert dispatch.";

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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased">
      {/* 1. Dedicated In-Cab Top Bar */}
      <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-tight">Driver Terminal</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                LIVE SHIFT
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="bg-neutral-800 text-neutral-200 border border-neutral-700 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none cursor-pointer"
                aria-label="Switch driver profile"
              >
                {Object.entries(DRIVER_PROFILES).map(([id, prof]) => (
                  <option key={id} value={id}>
                    {prof.name} ({prof.vehicle.split(" ")[0]})
                  </option>
                ))}
              </select>
              <span className="hidden sm:inline text-neutral-400">• {vehicleId}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* ElevenLabs Audio Briefing Button */}
          <button
            onClick={playShiftBriefing}
            disabled={isPlayingBriefing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 transition-colors"
          >
            <Volume2 className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden sm:inline">
              {isPlayingBriefing ? "Playing Briefing..." : "Shift Audio"}
            </span>
          </button>

          {/* Link to Dispatcher Driver Operations Hub */}
          <Link
            href="/drivers"
            className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-colors font-medium hidden md:inline-flex items-center gap-1"
          >
            Driver Hub (Dispatcher)
          </Link>

          {/* Switch to Dispatcher */}
          <Link
            href="/"
            className="text-xs px-2.5 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
            title="Switch to Dispatcher Control Room"
          >
            Control Room →
          </Link>
        </div>
      </header>

      {/* 2. Driver Shift Status Banner */}
      <div className="bg-neutral-900 border-b border-neutral-800/80 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-neutral-300">Today's Route Progress</span>
              <span className="text-blue-400 font-mono">
                {completedCount} of {stops.length} stops ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="text-right pl-4 border-l border-neutral-800">
            <div className="text-[10px] text-neutral-400 uppercase font-mono">Shift Window</div>
            <div className="text-xs font-bold text-white font-mono">08:00 - 16:00</div>
          </div>
        </div>
      </div>

      {/* 3. Driver Navigation Tabs */}
      <div className="bg-neutral-900/50 border-b border-neutral-800 px-4">
        <div className="max-w-2xl mx-auto flex gap-2">
          <button
            onClick={() => setActiveTab("MANIFEST")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "MANIFEST"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <span>📦 Delivery Manifest</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-300">
              {stops.length - completedCount} Left
            </span>
          </button>

          <button
            onClick={() => setActiveTab("VOICE")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "VOICE"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <span>🎙️ Voice Incident Reporter</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab("DELIVERED")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "DELIVERED"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <span>✓ Completed ({completedCount})</span>
          </button>
        </div>
      </div>

      {/* 4. Tab Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 space-y-4">
        {/* TAB 1: DELIVERY MANIFEST */}
        {activeTab === "MANIFEST" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
              <span>Next Sequential Stops</span>
              <span>Tap 'Confirm Delivery' for Digital POD</span>
            </div>

            {stops.map((stop, idx) => {
              const isCurrent = stop.status === "ACTIVE";
              const isDone = stop.status === "COMPLETED";

              return (
                <div
                  key={stop.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    isCurrent
                      ? "bg-neutral-900 border-blue-500/80 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/40"
                      : isDone
                      ? "bg-neutral-900/40 border-neutral-800/60 opacity-60"
                      : "bg-neutral-900/80 border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Stop Sequence Number Circle */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isDone
                            ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/40"
                            : isCurrent
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                            : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                        }`}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-white tracking-tight">
                            {stop.customerName}
                          </h3>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse">
                              CURRENT STOP
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-neutral-300 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                          <span>{stop.address}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 pt-1 font-mono">
                          <span>
                            ETA: <strong className="text-white">{stop.plannedArrival}</strong>
                          </span>
                          <span>Window: {stop.timeWindow}</span>
                          <span>Weight: {stop.packageWeightKg} kg</span>
                        </div>

                        {/* Special Delivery Instructions */}
                        {stop.specialNotes && (
                          <div className="mt-2 p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80 text-xs text-amber-300/90 leading-relaxed">
                            <span className="font-bold text-amber-400">ℹ️ Notes: </span>
                            {stop.specialNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for this stop */}
                  <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                    <a
                      href={`tel:${stop.contactPhone}`}
                      className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 text-blue-400" />
                      <span>Call Customer</span>
                    </a>

                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Delivered (POD Signed)</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedPodStop(stop)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isCurrent
                              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                              : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700"
                          }`}
                        >
                          <FileCheck className="h-4 w-4" />
                          <span>Confirm Delivery (POD)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: VOICE INCIDENT REPORTER */}
        {activeTab === "VOICE" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300/90 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-200">Hands-Free Driver Incident Mode: </span>
                Report road closures, vehicle breakdowns, or delays verbally. The system automatically transcribes your report via ElevenLabs, extracts disruption data, and alerts dispatch.
              </div>
            </div>

            <VoiceRecorder
              vehicleId={vehicleId}
              onIncidentReported={(incident) => {
                alert(`Disruption logged: ${incident.extracted_summary}. Dispatch alerted.`);
              }}
            />
          </div>
        )}

        {/* TAB 3: COMPLETED DELIVERIES */}
        {activeTab === "DELIVERED" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-200 px-1">Completed Shift Deliveries</h3>
            {stops
              .filter((s) => s.status === "COMPLETED")
              .map((stop) => (
                <div
                  key={stop.id}
                  className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{stop.customerName}</div>
                      <div className="text-xs text-neutral-400">{stop.address}</div>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-semibold text-emerald-400">Confirmed POD</span>
                    <div className="text-neutral-500 font-mono text-[10px]">Signed & Logged</div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Proof of Delivery (POD) Modal */}
        {selectedPodStop && (
          <ProofOfDeliveryModal
            orderId={selectedPodStop.orderId}
            customerName={selectedPodStop.customerName}
            onDelivered={() => {
              markDelivered(selectedPodStop.id);
              setSelectedPodStop(null);
            }}
            onClose={() => setSelectedPodStop(null)}
          />
        )}
      </main>
    </div>
  );
}
