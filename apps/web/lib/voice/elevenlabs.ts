/**
 * ElevenLabs Voice Integration Module
 * Handles speech-to-text incident parsing and text-to-speech generation
 * for driver incident reporting, shift debriefs, and dispatcher audio alerts.
 */

export interface ParsedVoiceIncident {
  type: "ROAD_CLOSURE" | "VEHICLE_BREAKDOWN" | "CUSTOMER_UNAVAILABLE" | "TRAFFIC_DELAY" | "PACKAGE_DAMAGED" | "GENERAL_HAZARD";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  order_id?: string;
  vehicle_id?: string;
  delay_minutes: number;
  raw_transcript: string;
  extracted_summary: string;
  recommended_action: string;
}

/**
 * Intelligent NLP extractor parsing driver voice transcripts into structured disruption events
 */
export function parseVoiceTranscript(transcript: string, driverVehicleId: string = "VH-001"): ParsedVoiceIncident {
  const text = transcript.toLowerCase();

  // Pattern detection
  let type: ParsedVoiceIncident["type"] = "TRAFFIC_DELAY";
  let severity: ParsedVoiceIncident["severity"] = "MEDIUM";
  let delay = 15;
  let action = "Hold schedule and recalculate ETA";

  if (text.includes("closure") || text.includes("closed") || text.includes("blocked") || text.includes("construction")) {
    type = "ROAD_CLOSURE";
    severity = "HIGH";
    delay = 30;
    action = "Trigger dynamic local detour bypassing blocked street segment";
  } else if (text.includes("breakdown") || text.includes("flat tire") || text.includes("engine") || text.includes("towed")) {
    type = "VEHICLE_BREAKDOWN";
    severity = "CRITICAL";
    delay = 120;
    action = "Immediate vehicle evacuation: reassign remaining route stops to nearest active fleet units";
  } else if (text.includes("nobody") || text.includes("not home") || text.includes("customer unavailable") || text.includes("closed store")) {
    type = "CUSTOMER_UNAVAILABLE";
    severity = "LOW";
    delay = 10;
    action = "Mark stop as failed delivery attempt and proceed to next sequential stop";
  } else if (text.includes("damaged") || text.includes("broken box") || text.includes("leaking")) {
    type = "PACKAGE_DAMAGED";
    severity = "MEDIUM";
    delay = 10;
    action = "File damaged manifest exception with dispatch supervisor";
  }

  // Extract order reference if present (e.g., ORD-9902 or stop 2)
  const orderMatch = transcript.match(/ord-?\d+/i) || transcript.match(/order\s*#?\s*(\d+)/i);
  const orderId = orderMatch ? orderMatch[0].toUpperCase().replace("ORDER", "ORD") : undefined;

  // Extract delay minutes if explicitly spoken (e.g., "delayed by 25 minutes")
  const minMatch = transcript.match(/(\d+)\s*(?:min|minute)/i);
  if (minMatch) {
    delay = parseInt(minMatch[1], 10);
  }

  return {
    type,
    severity,
    order_id: orderId,
    vehicle_id: driverVehicleId,
    delay_minutes: delay,
    raw_transcript: transcript,
    extracted_summary: `${type.replace(/_/g, " ")} reported by ${driverVehicleId}. Expected delay: ${delay} mins.`,
    recommended_action: action,
  };
}

/**
 * ElevenLabs TTS Audio Generator
 * Calls official ElevenLabs API if key configured, or yields audio stream.
 */
export async function generateElevenLabsSpeech(text: string, voiceId: string = "21m00Tcm4TlvDq8ikWAM"): Promise<ArrayBuffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    // Graceful fallback when key is not yet set in environment
    return null;
  }

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
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!res.ok) {
      console.warn(`ElevenLabs API returned ${res.status}: ${await res.text()}`);
      return null;
    }

    return await res.arrayBuffer();
  } catch (err) {
    console.error("ElevenLabs speech synthesis error:", err);
    return null;
  }
}
