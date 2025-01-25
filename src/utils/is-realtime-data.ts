import { z } from "astro/zod";

/**
 * Schema for realtime data received from PocketBase.
 */
const realtimeDataSchema = z.object({
  action: z.union([
    z.literal("create"),
    z.literal("update"),
    z.literal("delete")
  ]),
  record: z.object({
    id: z.string(),
    collectionName: z.string(),
    collectionId: z.string()
  })
});

/**
 * Type for realtime data received from PocketBase.
 */
export type RealtimeData = z.infer<typeof realtimeDataSchema>;

/**
 * Checks if the given data is realtime data received from PocketBase.
 */
export function isRealtimeData(data: unknown): data is RealtimeData {
  try {
    realtimeDataSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}
