/**
 * Disclaimer appended to every tool response.
 * Must never be removed or modified without legal review.
 */
export const DISCLAIMER =
  "This is general guidance, not legal advice. " +
  "Land Trust OS does not confirm title or declare any land safe. " +
  "Use a qualified Lagos property lawyer and surveyor.";

/**
 * Wraps any tool output with the standard disclaimer.
 * Keeps the disclaimer visually separated so LLM clients render it clearly.
 */
export function withDisclaimer(content: string): string {
  return `${content.trimEnd()}\n\n---\n**Disclaimer:** ${DISCLAIMER}`;
}
