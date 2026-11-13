/**
 * Stdio entry point for Claude Desktop (and any MCP host that launches
 * the server as a child process and communicates via stdin/stdout).
 *
 * Usage in claude_desktop_config.json:
 *   "command": "npx", "args": ["tsx", ".../src/stdio.ts"]
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
  buyingStepsToolDef,
  handleBuyingSteps,
  dueDiligenceToolDef,
  handleDueDiligence,
  agentQuestionsToolDef,
  handleAgentQuestions,
  explainTermToolDef,
  handleExplainTerm,
  findFirmToolDef,
  handleFindFirm,
} from "./tools/index.js";

const TOOLS = [
  buyingStepsToolDef,
  dueDiligenceToolDef,
  agentQuestionsToolDef,
  explainTermToolDef,
  findFirmToolDef,
];

type HandlerFn = (args: Record<string, unknown>) => string;

const HANDLERS: Record<string, HandlerFn> = {
  [buyingStepsToolDef.name]: handleBuyingSteps,
  [dueDiligenceToolDef.name]: handleDueDiligence,
  [agentQuestionsToolDef.name]: handleAgentQuestions,
  [explainTermToolDef.name]: handleExplainTerm,
  [findFirmToolDef.name]: handleFindFirm,
};

const server = new Server(
  { name: "land-trust-os", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const handler = HANDLERS[name];

  if (!handler) {
    return {
      content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  const text = handler((args ?? {}) as Record<string, unknown>);
  return { content: [{ type: "text" as const, text }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
