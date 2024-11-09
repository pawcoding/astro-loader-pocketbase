/**
 * Convert a string to a slug.
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
    .replace(/ä/g, "ae") // Replace umlauts
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}
