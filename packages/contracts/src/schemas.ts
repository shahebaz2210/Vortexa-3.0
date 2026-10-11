import { z } from "zod";

export const SystemHealthSchema = z.object({
  status: z.enum(["healthy", "degraded", "unhealthy"]),
  timestamp: z.string().datetime(),
  version: z.string(),
});

export type SystemHealth = z.infer<typeof SystemHealthSchema>;
