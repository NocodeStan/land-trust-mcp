import { withDisclaimer } from "../lib/disclaimer.js";
import content from "../content/due-diligence.json" with { type: "json" };

export const dueDiligenceToolDef = {
  name: "get_due_diligence_checklist",
  description:
    "Returns a due diligence checklist for buying land in Lagos, Nigeria. " +
    "Covers title documents, official searches, survey checks, encumbrances, and payment precautions. " +
    "This is general guidance only.",
  inputSchema: {
    type: "object" as const,
    properties: {
      category: {
        type: "string",
        description:
          "Optional. Return only one category. " +
          "Valid values: title, search, survey, encumbrances, payment. " +
          "If omitted, all categories are returned.",
        enum: ["title", "search", "survey", "encumbrances", "payment"],
      },
    },
    required: [],
  },
};

export function handleDueDiligence(args: Record<string, unknown>): string {
  const categoryFilter =
    typeof args.category === "string" ? args.category : null;

  const categories = categoryFilter
    ? content.categories.filter((c) => c.id === categoryFilter)
    : content.categories;

  if (categories.length === 0) {
    const valid = content.categories.map((c) => c.id).join(", ");
    return withDisclaimer(
      `No category found for "${categoryFilter}". Valid categories: ${valid}.`
    );
  }

  const formatted = categories
    .map((cat) => {
      const lines: string[] = [`## ${cat.title}`, ""];

      cat.items.forEach((item, i) => {
        lines.push(`**${i + 1}. ${item.task}**`);
        lines.push(`*Why:* ${item.why}`);
        lines.push("");
      });

      return lines.join("\n").trimEnd();
    })
    .join("\n\n---\n\n");

  const header =
    categoryFilter === null ? "# Lagos Land Purchase: Due Diligence Checklist\n\n" : "";

  return withDisclaimer(header + formatted);
}
