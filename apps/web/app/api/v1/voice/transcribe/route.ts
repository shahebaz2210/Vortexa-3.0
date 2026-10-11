import { NextRequest, NextResponse } from "next/server";
import { parseVoiceTranscript, ParsedVoiceIncident } from "@/lib/voice/elevenlabs";
import { mockDisruptions } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transcript = body.transcript || body.text || "";
    const vehicleId = body.vehicle_id || "VH-001";

    if (!transcript.trim()) {
      return NextResponse.json({ error: "Empty speech transcript" }, { status: 400 });
    }

    // 1. NLP extract incident
    const incident: ParsedVoiceIncident = parseVoiceTranscript(transcript, vehicleId);

    // 2. Synthesize disruption event into platform disruptions
    const disruptionRecord = {
      id: `DISR-${Date.now().toString().slice(-4)}`,
      type: incident.type,
      severity: incident.severity,
      vehicleId: incident.vehicle_id,
      description: incident.extracted_summary,
      impactDurationMinutes: incident.delay_minutes,
      timestamp: new Date().toISOString(),
      status: "OPEN",
      recommendedAction: incident.recommended_action,
    };

    // Add to mock disruptions pool
    mockDisruptions.unshift(disruptionRecord as any);

    return NextResponse.json({
      success: true,
      incident,
      disruption: disruptionRecord,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process voice transcript" }, { status: 500 });
  }
}
