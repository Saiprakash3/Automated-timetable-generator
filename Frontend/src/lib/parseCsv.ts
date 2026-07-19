/**
 * Deliberately plain: comma-split, no quoted-field escaping. Sufficient for
 * the Bulk Import Stepper's own template format (simple values, no embedded
 * commas) — a full RFC 4180 parser would be solving a problem this project's
 * CSVs don't have. Blank lines (including a trailing newline) are skipped.
 */
export function parseCsv(text: string): string[][] {
  return text
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(",").map((cell) => cell.trim()));
}
