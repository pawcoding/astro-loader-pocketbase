/**
 * Convert a string to a slog.
 *
 * Example:
 * ```ts
 * slugify("Hello World!"); // hello-world
 * ```
 */
export function slugify(input: string): string {
  return input
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}
