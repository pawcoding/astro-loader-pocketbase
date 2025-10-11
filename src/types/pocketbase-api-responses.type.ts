import { z } from "astro/zod";
import { pocketBaseEntrySchema } from "./pocketbase-entry.type";

/**
 * Schema for PocketBase API error responses.
 * All API failures return a status code of 400 or higher with this structure.
 */
export const pocketbaseErrorResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.record(z.unknown()).optional()
});

export type PocketBaseErrorResponse = z.infer<
  typeof pocketbaseErrorResponseSchema
>;

/**
 * Schema for PocketBase authentication response.
 * Returned by auth-with-password and similar authentication endpoints.
 */
export const pocketbaseAuthResponseSchema = z.object({
  token: z.string(),
  record: z.record(z.unknown()).optional(),
  meta: z.record(z.unknown()).optional()
});

export type PocketBaseAuthResponse = z.infer<
  typeof pocketbaseAuthResponseSchema
>;

/**
 * Schema for PocketBase list response (paginated collection of records).
 * Returned by GET /api/collections/{collection}/records endpoint.
 */
export const pocketbaseListResponseSchema = z.object({
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
  items: z.array(pocketBaseEntrySchema)
});

export type PocketBaseListResponse = z.infer<
  typeof pocketbaseListResponseSchema
>;

/**
 * Schema for PocketBase list response with minimal item validation.
 * Used when specific fields are requested and core fields might not be present.
 */
export const pocketbaseMinimalListResponseSchema = z.object({
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
  items: z.array(z.record(z.unknown()))
});

export type PocketBaseMinimalListResponse = z.infer<
  typeof pocketbaseMinimalListResponseSchema
>;
