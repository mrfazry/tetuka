/** Split pasted text into slide chunks. */
export function splitText(raw: string): string[] {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [""];

  // Two blank lines separate slides; a single blank line keeps paragraphs on one page.
  const byBlank = normalized
    .split(/\n\s*\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  return byBlank.length > 0 ? byBlank : [normalized];
}
