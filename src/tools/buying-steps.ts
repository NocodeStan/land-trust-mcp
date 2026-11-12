import { withDisclaimer } from "../lib/disclaimer.js";
import content from "../content/buying-steps.json" with { type: "json" };

export const buyingStepsToolDef = {
  name: "get_buying_steps",
  description:
    "Returns the step-by-step guide for buying land in Lagos, Nigeria. " +
    "Each step includes what to do, why it matters, and common pitfalls. " +
    "This is general guidance only.",
  inputSchema: {
    type: "object" as const,
    properties: {
      step_number: {
        type: "number",
        description:
          "Optional. Return only this specific step number (1–10). " +
          "If omitted, all steps are returned.",
      },
    },
    required: [],
  },
};

export function handleBuyingSteps(args: Record<string, unknown>): string {
  const stepNumber =
    typeof args.step_number === "number" ? args.step_number : null;

  const steps =
    stepNumber !== null
      ? content.steps.filter((s) => s.number === stepNumber)
      : content.steps;

  if (steps.length === 0) {
    return withDisclaimer(
      `No step found for step number ${stepNumber}. Valid steps are 1 to ${content.steps.length}.`
    );
  }

  const formatted = steps
    .map((step) => {
      const lines: string[] = [
        `## Step ${step.number}: ${step.title}`,
        "",
        step.description,
      ];

      if (step.watch_out_for && step.watch_out_for.length > 0) {
        lines.push("", "**Watch out for:**");
        step.watch_out_for.forEach((w) => lines.push(`- ${w}`));
      }

      return lines.join("\n");
    })
    .join("\n\n---\n\n");

  const header =
    stepNumber === null
      ? `# How to Buy Land in Lagos: ${content.steps.length} Steps\n\n`
      : "";

  return withDisclaimer(header + formatted);
}
