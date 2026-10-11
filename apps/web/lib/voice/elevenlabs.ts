/**
 * ElevenLabs Voice & Text Disruption Parsing Module
 * Strictly adheres to Problem Statement S-01 (ReRoute: Dynamic Fleet & Delivery Replanning):
 * 1. Road closure increasing travel time between two locations for a stated period.
 * 2. Vehicle failure at a stated time (receives no stops after failure time).
 * 3. Urgent delivery added during the day.
 * 
 * Hard Policy: Reports referencing an unknown location MUST be REJECTED, not guessed at.
 * Dispatcher confirmation required before any text report takes effect.
 */

export interface ParsedVoiceIncident {
  type: "ROAD_CLOSURE" | "VEHICLE_BREAKDOWN" | "URGENT_DELIVERY" | "CUSTOMER_UNAVAILABLE" | "TRAFFIC_DELAY";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "VALID" | "REJECTED";
  rejection_reason?: string;
  order_id?: string;
  vehicle_id?: string;
  failure_time_minutes?: number;
  delay_minutes: number;
  duration_period_minutes?: number;
  location_from?: string;
  location_to?: string;
  raw_transcript: string;
  extracted_summary: string;
  recommended_action: string;
  requires_dispatcher_confirmation: boolean;
}

// Known nodes / delivery locations in the active network
export const KNOWN_NETWORK_LOCATIONS = [
  "market st",
  "chestnut st",
  "berry st",
  "valencia st",
  "montgomery st",
  "2nd st",
  "van ness",
  "soma central hub",
  "marina grocers",
  "apex biolabs",
  "mission culinary",
  "presidio clinic",
  "baytech robotics",
  "depot-sf-01",
  "ord-9901",
  "ord-9902",
  "ord-9903",
  "ord-9904",
  "ord-9905",
];

export function parseVoiceTranscript(
  transcript: string,
  driverVehicleId: string = "VH-001",
  customKnownLocations: string[] = []
): ParsedVoiceIncident {
  const text = transcript.toLowerCase();
  const known = [...KNOWN_NETWORK_LOCATIONS, ...customKnownLocations.map((l) => l.toLowerCase())];

  // 1. Detect location mentions and check if unknown location mentioned
  // Look for patterns like "on <location>", "at <location>", "near <location>", "between <loc1> and <loc2>"
  const locationMatch = text.match(/(?:at|on|near|between)\s+([a-z0-9\s]{3,30}?)(?:,|\.|\s+due|\s+delayed|\s+blocked|\s+closed|\s+at|$)/i);
  let detectedLocation = locationMatch ? locationMatch[1].trim() : null;

  // Filter out non-location words
  if (detectedLocation && (detectedLocation.startsWith("the ") || detectedLocation.startsWith("a "))) {
    detectedLocation = detectedLocation.replace(/^(the|a)\s+/i, "");
  }

  // Check unknown location rejection rule (PS S-01: A report naming an unknown location must be rejected, not guessed at)
  if (detectedLocation) {
    const isKnown = known.some((k) => detectedLocation!.includes(k) || k.includes(detectedLocation!));
    if (!isKnown) {
      return {
        type: "ROAD_CLOSURE",
        severity: "HIGH",
        status: "REJECTED",
        rejection_reason: `Report rejected: Location '${detectedLocation}' is unknown in the delivery network. Guessing is disabled by ReRoute policy (PS S-01).`,
        vehicle_id: driverVehicleId,
        delay_minutes: 0,
        raw_transcript: transcript,
        extracted_summary: `REJECTED: Unknown location '${detectedLocation}' reported. Dispatcher verification required.`,
        recommended_action: "Reject report and request clarification from driver",
        requires_dispatcher_confirmation: true,
      };
    }
  }

  // 2. Identify Disruption Type
  let type: ParsedVoiceIncident["type"] = "TRAFFIC_DELAY";
  let severity: ParsedVoiceIncident["severity"] = "MEDIUM";
  let delay = 15;
  let action = "Hold schedule and recalculate ETA";
  let failureTime: number | undefined = undefined;
  let durationPeriod = 60; // 60 min default closure period

  if (text.includes("urgent") || text.includes("priority delivery") || text.includes("emergency order")) {
    type = "URGENT_DELIVERY";
    severity = "HIGH";
    action = "Insert urgent delivery into optimal active vehicle route respecting capacity and deadlines";
  } else if (text.includes("breakdown") || text.includes("failed") || text.includes("failure") || text.includes("flat tire") || text.includes("engine")) {
    type = "VEHICLE_BREAKDOWN";
    severity = "CRITICAL";
    delay = 120;
    failureTime = 600; // default 10:00 AM (600 mins from midnight)
    // Extract stated time if present: "at 10:30", "at 9:15"
    const timeMatch = text.match(/at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const mins = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const isPm = timeMatch[3]?.toLowerCase() === "pm";
      failureTime = (isPm && hours !== 12 ? hours + 12 : hours) * 60 + mins;
    }
    action = `Halt ${driverVehicleId} at failure time (${failureTime}m). Reassign and reassign remaining route stops to active fleet.`;
  } else if (text.includes("closure") || text.includes("closed") || text.includes("bridge") || text.includes("blocked")) {
    type = "ROAD_CLOSURE";
    severity = "HIGH";
    delay = 30;
    // Extract stated duration period if mentioned: "for 2 hours", "for 45 minutes"
    const durMatch = text.match(/for\s+(\d+)\s*(hour|minute|min)/i);
    if (durMatch) {
      const val = parseInt(durMatch[1], 10);
      durationPeriod = durMatch[2].startsWith("hour") ? val * 60 : val;
    }
    action = `Increase segment travel time by +${delay}m for duration of ${durationPeriod}m. Trigger dynamic detour around blocked segment.`;
  } else if (text.includes("nobody") || text.includes("not home") || text.includes("customer unavailable")) {
    type = "CUSTOMER_UNAVAILABLE";
    severity = "LOW";
    delay = 10;
    action = "Mark stop as failed attempt and proceed to next stop";
  }

  // Extract order reference
  const orderMatch = transcript.match(/ord-?\d+/i) || transcript.match(/order\s*#?\s*(\d+)/i);
  const orderId = orderMatch ? orderMatch[0].toUpperCase().replace("ORDER", "ORD") : undefined;

  // Extract custom delay minutes if explicitly stated
  const minMatch = transcript.match(/(\d+)\s*(?:min|minute)/i);
  if (minMatch) {
    delay = parseInt(minMatch[1], 10);
  }

  return {
    type,
    severity,
    status: "VALID",
    order_id: orderId,
    vehicle_id: driverVehicleId,
    failure_time_minutes: failureTime,
    delay_minutes: delay,
    duration_period_minutes: durationPeriod,
    location_from: detectedLocation || undefined,
    raw_transcript: transcript,
    extracted_summary: `${type.replace(/_/g, " ")} validated at ${detectedLocation || "known route node"}. Delay: ${delay}m.`,
    recommended_action: action,
    requires_dispatcher_confirmation: true, // Dispatcher must confirm before taking effect
  };
}

/**
 * ElevenLabs Speech Audio Generation
 */
export async function generateElevenLabsSpeech(text: string, voiceId: string = "21m00Tcm4TlvDq8ikWAM"): Promise<ArrayBuffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}
