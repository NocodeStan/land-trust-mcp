import { withDisclaimer } from "../lib/disclaimer.js";
import content from "../content/glossary.json" with { type: "json" };

export const explainTermToolDef = {
  name: "explain_term",
  description:
    "Explains a Lagos land-buying term or concept in plain British English. " +
    "Covers terms such as Certificate of Occupancy, Governor's Consent, Deed of Assignment, " +
    "Survey Plan, Land Use Act, Global Acquisition, Excision, Family Land, Stamp Duty, and more. " +
    "This is general guidance only.",
  inputSchema: {
    type: "object" as const,
    properties: {
      term: {
        type: "string",
        description:
          "The term or phrase to explain, e.g. 'Certificate of Occupancy', 'Governor's Consent', " +
          "'Deed of Assignment', 'Survey Plan', 'Land Use Act', 'Excision', 'Family Land', " +
          "'Stamp Duty', 'SURCON', 'Right of Occupancy', 'Registered Survey'.",
      },
    },
    required: ["term"],
  },
};

export function handleExplainTerm(args: Record<string, unknown>): string {
  const rawTerm =
    typeof args.term === "string" ? args.term.trim() : "";

  if (!rawTerm) {
    const termList = content.terms.map((t) => `- ${t.term}`).join("\n");
    return withDisclaimer(
      `Please provide a term to explain. Available terms include:\n\n${termList}`
    );
  }

  // Case-insensitive, partial-match search
  const needle = rawTerm.toLowerCase();
  const match = content.terms.find(
    (t) =>
      t.term.toLowerCase() === needle ||
      t.term.toLowerCase().includes(needle) ||
      needle.includes(t.term.toLowerCase())
  );

  if (!match) {
    const termList = content.terms.map((t) => `- ${t.term}`).join("\n");
    return withDisclaimer(
      `The term "${rawTerm}" was not found in the glossary. Available terms include:\n\n${termList}`
    );
  }

  const lines: string[] = [
    `## ${match.term}`,
    "",
    match.definition,
  ];

  return withDisclaimer(lines.join("\n"));
}
