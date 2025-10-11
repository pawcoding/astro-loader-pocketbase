import { z } from "astro/zod";
import { pocketBaseEntry } from "./pocketbase-entry.type";

/**
 * The schema for a PocketBase error response.
 */
export const pocketBaseErrorResponse = z.object({
  /**
   * The error message returned by PocketBase.
   */
  message: z.string()
});

/**
 * The schema for a PocketBase list response.
 */
export const pocketBaseListResponse = z.object({
  /**
   * Current page number.
   */
  page: z.number(),
  /**
   * Total number of pages available.
   */
  totalPages: z.number(),
  /**
   * Array of items in the current page.
   */
  items: z.array(pocketBaseEntry)
});

/**
 * The schema for a PocketBase login response.
 */
export const pocketBaseLoginResponse = z.object({
  /**
   * The authentication token returned by PocketBase.
   */
  token: z.string()
});
