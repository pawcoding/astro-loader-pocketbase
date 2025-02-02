import { randomUUID } from "crypto";
import type { PocketBaseEntry } from "../../src/types/pocketbase-entry.type";

export function createPocketbaseEntry(
  entry?: Record<string, unknown>
): PocketBaseEntry {
  return {
    id: Math.random().toString(36).substring(2, 17),
    collectionId: Math.random().toString(36).substring(2, 17),
    collectionName: "test",
    customId: randomUUID(),
    updated: new Date().toISOString().replace("T", " "),
    ...entry
  };
}
