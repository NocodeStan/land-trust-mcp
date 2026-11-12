import { withDisclaimer } from "../lib/disclaimer.js";
import content from "../content/firms.json" with { type: "json" };

export const findFirmToolDef = {
  name: "find_a_land_trust_os_firm",
  description:
    "Provides guidance on how to find a qualified Lagos property lawyer or surveyor. " +
    "Land Trust OS does not endorse, rank, or recommend specific firms. " +
    "This tool returns impartial guidance on where to look and what to check. " +
    "This is general guidance only.",
  inputSchema: {
    type: "object" as const,
    properties: {},
    required: [],
  },
};

export function handleFindFirm(_args: Record<string, unknown>): string {
  const lines: string[] = [
    "# How to Find a Qualified Lagos Property Professional",
    "",
    content.guidance.summary,
    "",
    "## Where to Look",
    "",
  ];

  content.guidance.how_to_find.forEach((source) => {
    lines.push(`### ${source.source}`);
    lines.push(source.description);
    lines.push("");
  });

  lines.push("## What to Check Before Engaging Anyone", "");
  content.guidance.what_to_check.forEach((check) => {
    lines.push(`- ${check}`);
  });

  return withDisclaimer(lines.join("\n"));
}
