import { withDisclaimer } from "../lib/disclaimer.js";
import content from "../content/agent-questions.json" with { type: "json" };

export const agentQuestionsToolDef = {
  name: "get_questions_for_your_agent",
  description:
    "Returns suggested questions to ask your Lagos property lawyer, surveyor, or seller " +
    "before proceeding with a land purchase. Helps buyers understand what to ask and why. " +
    "This is general guidance only.",
  inputSchema: {
    type: "object" as const,
    properties: {
      audience: {
        type: "string",
        description:
          "Optional. Return questions for a specific audience. " +
          "Valid values: lawyer, surveyor, seller. " +
          "If omitted, questions for all audiences are returned.",
        enum: ["lawyer", "surveyor", "seller"],
      },
    },
    required: [],
  },
};

export function handleAgentQuestions(args: Record<string, unknown>): string {
  const audienceFilter =
    typeof args.audience === "string" ? args.audience : null;

  const sections = audienceFilter
    ? content.sections.filter((s) => s.id === audienceFilter)
    : content.sections;

  if (sections.length === 0) {
    const valid = content.sections.map((s) => s.id).join(", ");
    return withDisclaimer(
      `No section found for "${audienceFilter}". Valid values: ${valid}.`
    );
  }

  const formatted = sections
    .map((section) => {
      const lines: string[] = [`## ${section.heading}`, ""];

      section.questions.forEach((item, i) => {
        lines.push(`**${i + 1}. ${item.q}**`);
        lines.push(`*Why ask this:* ${item.why}`);
        lines.push("");
      });

      return lines.join("\n").trimEnd();
    })
    .join("\n\n---\n\n");

  const intro =
    audienceFilter === null
      ? `${content.intro}\n\n`
      : "";

  return withDisclaimer(intro + formatted);
}
