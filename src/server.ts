/**
 * Land Trust OS — public guide MCP server
 *
 * Transport: Streamable HTTP (POST /mcp)
 * No auth. Read-only. No client data stored.
 */

import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  isInitializeRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "node:crypto";

import { rateLimiter } from "./middleware/rate-limit.js";
import { requestLogger } from "./middleware/logger.js";

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

const PORT = Number(process.env.PORT ?? 3001);

// ── Tool registry ─────────────────────────────────────────────────────────────

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

// ── MCP server factory ────────────────────────────────────────────────────────

function createMcpServer(): Server {
  const server = new Server(
    { name: "land-trust-os", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  // List tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  // Call tool
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

  return server;
}

// ── Express app ───────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "land-trust-os-mcp" });
});

// Per-session state
const sessions = new Map<
  string,
  { server: Server; transport: StreamableHTTPServerTransport }
>();

// MCP endpoint — Streamable HTTP transport
app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  // Existing session
  if (sessionId && sessions.has(sessionId)) {
    const { transport } = sessions.get(sessionId)!;
    await transport.handleRequest(req, res, req.body);
    return;
  }

  // New session — must start with an Initialize request
  if (!isInitializeRequest(req.body)) {
    res.status(400).json({ error: "Expected MCP Initialize request." });
    return;
  }

  const newSessionId = randomUUID();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => newSessionId,
    onsessioninitialized: (sid) => {
      sessions.set(sid, { server, transport });
    },
  });

  transport.onclose = () => {
    sessions.delete(newSessionId);
  };

  const server = createMcpServer();
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

// Handle GET and DELETE for session lifecycle
app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (!sessionId || !sessions.has(sessionId)) {
    res.status(404).json({ error: "Session not found." });
    return;
  }
  const { transport } = sessions.get(sessionId)!;
  await transport.handleRequest(req, res);
});

app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (!sessionId || !sessions.has(sessionId)) {
    res.status(404).json({ error: "Session not found." });
    return;
  }
  const { transport } = sessions.get(sessionId)!;
  await transport.handleRequest(req, res);
  sessions.delete(sessionId);
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Land Trust OS MCP server running on http://localhost:${PORT}`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
});
