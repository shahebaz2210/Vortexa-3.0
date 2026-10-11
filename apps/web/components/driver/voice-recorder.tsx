"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  vehicleId?: string;
  onIncidentReported?: (incident: any) => void;
}

export function VoiceRecorder({ vehicleId = "VH-001", onIncidentReported }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [statusText, setStatusText] = useState("Tap mic to speak or select a quick voice report template");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastIncident, setLastIncident] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsRecording(true);
          setStatusText("Listening... Speak clearly into your microphone");
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsRecording(false);
          setStatusText("Mic error. You can type or use quick report templates below.");
        };

        recognition.onend = () => {
          setIsRecording(false);
          setStatusText("Recording stopped. Review transcript and submit.");
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      setLastIncident(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          setIsRecording(true);
          setStatusText("Simulating mic input...");
        }
      } else {
        // Fallback for browsers without Web Speech API
        setStatusText("Microphone API not available. Type below or choose a preset.");
      }
    }
  };

  const handlePreset = (presetText: string) => {
    setTranscript(presetText);
    setStatusText("Preset selected. Ready to report.");
  };

  const submitVoiceReport = async () => {
    if (!transcript.trim()) return;
    setIsSubmitting(true);
    setStatusText("Ingesting voice report & analyzing logistics impact...");

    try {
      const res = await fetch("/api/v1/voice/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, vehicle_id: vehicleId }),
      });

      const data = await res.json();
      if (data.success) {
        setLastIncident(data.incident);
        setStatusText("Incident successfully logged with dispatch center!");
        if (onIncidentReported) onIncidentReported(data.incident);

        // Speak audio acknowledgment via ElevenLabs / Web Speech
        playAudioFeedback(`Incident reported: ${data.incident.type.replace(/_/g, " ")}. Dispatch alerted.`);
      }
    } catch (err) {
      setStatusText("Failed to submit voice report. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const playAudioFeedback = async (spokenText: string) => {
    try {
      const res = await fetch("/api/v1/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: spokenText }),
      });

      if (res.headers.get("content-type")?.includes("audio/mpeg")) {
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audio.play();
        return;
      }
    } catch (e) {
      // Fallback to browser synthesis
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(spokenText);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <span>🎙️</span> ElevenLabs Voice Incident Reporter
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Hands-free hands-on-wheel reporting for drivers with automatic NLP classification
          </p>
        </div>
        <div className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
          {vehicleId}
        </div>
      </div>

      {/* Main Mic Button & Status */}
      <div className="flex flex-col items-center justify-center py-4 bg-muted/20 border border-border/60 rounded-lg">
        <button
          type="button"
          onClick={toggleRecording}
          disabled={isSubmitting}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? "bg-rose-600 text-white shadow-lg shadow-rose-500/50 scale-105 animate-pulse"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
          }`}
          aria-label={isRecording ? "Stop recording" : "Start voice recording"}
        >
          <span className="text-3xl">{isRecording ? "⏹️" : "🎙️"}</span>
        </button>

        <div className="mt-3 text-xs font-medium text-foreground text-center px-4">
          {statusText}
        </div>
      </div>

      {/* Editable Live Transcript Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted tracking-wider uppercase">
          Speech Transcript
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Speak or type incident here (e.g., 'Major road closure on 4th Street near stop 2, expect 30 minute delay')..."
          rows={3}
          className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
      </div>

      {/* Quick Action Incident Presets */}
      <div>
        <div className="text-xs font-medium text-muted mb-1.5">Quick Voice Presets:</div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() =>
              handlePreset(
                "Heavy traffic delay on 101 Northbound, delayed by 25 minutes approaching stop ORD-9902"
              )
            }
            className="text-xs px-2.5 py-1 rounded bg-muted/60 hover:bg-muted text-foreground border border-border transition-colors"
          >
            🚧 Traffic Delay (+25m)
          </button>
          <button
            type="button"
            onClick={() =>
              handlePreset(
                "Complete road closure on Market Street due to burst water main, street blocked"
              )
            }
            className="text-xs px-2.5 py-1 rounded bg-muted/60 hover:bg-muted text-foreground border border-border transition-colors"
          >
            ⛔ Road Closure
          </button>
          <button
            type="button"
            onClick={() =>
              handlePreset(
                "Vehicle breakdown, flat tire on driver rear wheel, unable to continue route"
              )
            }
            className="text-xs px-2.5 py-1 rounded bg-muted/60 hover:bg-muted text-foreground border border-border transition-colors"
          >
            ⚠️ Breakdown
          </button>
          <button
            type="button"
            onClick={() =>
              handlePreset(
                "Customer unavailable at Marina Grocers stop ORD-9902, store gate is locked"
              )
            }
            className="text-xs px-2.5 py-1 rounded bg-muted/60 hover:bg-muted text-foreground border border-border transition-colors"
          >
            🏬 Customer Unavailable
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          variant="primary"
          onClick={submitVoiceReport}
          disabled={!transcript.trim() || isSubmitting}
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
        >
          {isSubmitting ? "Ingesting & Analyzing..." : "Submit Incident Report to Dispatch"}
        </Button>
      </div>

      {/* Incident Result Card */}
      {lastIncident && (
        <div className="mt-4 p-4 rounded-lg bg-card border border-rose-200 dark:border-rose-900/50 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Disruption Logged
            </span>
            <span className="text-xs px-2 py-0.5 rounded font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              {lastIncident.severity} SEVERITY
            </span>
          </div>
          <div className="text-sm font-semibold text-foreground">
            {lastIncident.extracted_summary}
          </div>
          <div className="text-xs text-muted">
            <span className="font-semibold text-foreground">Recommended Action:</span>{" "}
            {lastIncident.recommended_action}
          </div>
        </div>
      )}
    </div>
  );
}
