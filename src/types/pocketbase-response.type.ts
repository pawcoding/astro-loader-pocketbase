import { z } from "astro/zod";

/**
 * Response returned when fetching a collection
 */
export const collectionResponseSchema = z.object({
  items: z.array(z.record(z.unknown())),
  page: z.number(),
  totalPages: z.number()
});

/**
 * Response returned when fetching a collection for cleanup
 */
export const cleanupResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.string()
    })
  ),
  page: z.number(),
  totalPages: z.number()
});

/**
 * Response returned when fetching a superuser token
 */
export const loginResponseSchema = z.object({
  token: z.string()
});

/**
 * Error that can be returned by any request
 */
export const errorSchema = z.object({
  message: z.string()
});
