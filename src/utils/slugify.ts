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
    .replaceAll(/\s+/g, "-") // Replace spaces with -
    .replaceAll("ä", "ae") // Replace umlauts
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replaceAll(/[^\w-]+/g, "") // Remove all non-word chars
    .replaceAll(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}
