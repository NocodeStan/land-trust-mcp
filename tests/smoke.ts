/**
 * Smoke test: starts the server, connects an MCP client,
 * calls all 5 tools, prints the results, then exits cleanly.
 *
 * Run with: npx tsx tests/smoke.ts
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { spawn } from "node:child_process";

const SERVER_URL = "http://localhost:3002"; // Use 3002 so it doesn't clash

function startServer(): Promise<ReturnType<typeof spawn>> {
  return new Promise((resolve, reject) => {
    const proc = spawn("npx", ["tsx", "src/server.ts"], {
      env: { ...process.env, PORT: "3002" },
      stdio: ["ignore", "pipe", "pipe"],
    });

    proc.stdout?.on("data", (d: Buffer) => {
      const line = d.toString();
      if (line.includes("running on")) {
        resolve(proc);
      }
    });

    proc.stderr?.on("data", (d: Buffer) => {
      process.stderr.write(d);
    });

    proc.on("error", reject);

    // Fallback timeout
    setTimeout(() => resolve(proc), 3000);
  });
}

async function main() {
  console.log("Starting server...");
  const server = startServer();
  await new Promise((r) => setTimeout(r, 2500)); // let it boot

  const client = new Client(
    { name: "smoke-test", version: "1.0" },
    { capabilities: {} }
  );

  const transport = new StreamableHTTPClientTransport(
    new URL(`${SERVER_URL}/mcp`)
  );

  await client.connect(transport);
  console.log("Connected.\n");

  // ── List tools ──────────────────────────────────────────────────────────────
  const { tools } = await client.listTools();
  console.log("=== Tools available ===");
  tools.forEach((t) => console.log(`  • ${t.name}`));
  console.log();

  // ── get_buying_steps (step 1) ───────────────────────────────────────────────
  console.log("=== get_buying_steps (step 1) ===");
  const step1 = await client.callTool({
    name: "get_buying_steps",
    arguments: { step_number: 1 },
  });
  const step1Text = (step1.content as Array<{ type: string; text: string }>)[0]
    .text;
  // Print first 600 chars so it fits in the terminal
  console.log(step1Text.slice(0, 600) + "\n…[truncated]\n");

  // ── get_due_diligence_checklist (title category) ────────────────────────────
  console.log("=== get_due_diligence_checklist (category: title) ===");
  const dd = await client.callTool({
    name: "get_due_diligence_checklist",
    arguments: { category: "title" },
  });
  const ddText = (dd.content as Array<{ type: string; text: string }>)[0].text;
  console.log(ddText.slice(0, 500) + "\n…[truncated]\n");

  // ── get_questions_for_your_agent (surveyor) ─────────────────────────────────
  console.log("=== get_questions_for_your_agent (audience: surveyor) ===");
  const qs = await client.callTool({
    name: "get_questions_for_your_agent",
    arguments: { audience: "surveyor" },
  });
  const qsText = (qs.content as Array<{ type: string; text: string }>)[0].text;
  console.log(qsText.slice(0, 500) + "\n…[truncated]\n");

  // ── explain_term ────────────────────────────────────────────────────────────
  console.log("=== explain_term (Governor's Consent) ===");
  const term = await client.callTool({
    name: "explain_term",
    arguments: { term: "Governor's Consent" },
  });
  const termText = (term.content as Array<{ type: string; text: string }>)[0]
    .text;
  console.log(termText + "\n");

  // ── find_a_land_trust_os_firm ───────────────────────────────────────────────
  console.log("=== find_a_land_trust_os_firm ===");
  const firms = await client.callTool({
    name: "find_a_land_trust_os_firm",
    arguments: {},
  });
  const firmsText = (
    firms.content as Array<{ type: string; text: string }>
  )[0].text;
  console.log(firmsText.slice(0, 500) + "\n…[truncated]\n");

  // ── Confirm disclaimer present ──────────────────────────────────────────────
  const DISCLAIMER =
    "This is general guidance, not legal advice.";
  const allOutputs = [step1Text, ddText, qsText, termText, firmsText];
  const allHaveDisclaimer = allOutputs.every((o) => o.includes(DISCLAIMER));
  console.log(
    `✓ Disclaimer present in all 5 responses: ${allHaveDisclaimer}`
  );

  await client.close();

  // Kill server
  (await server).kill();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
