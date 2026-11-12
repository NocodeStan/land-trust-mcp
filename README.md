# Land Trust OS — Public Guide MCP Server

A read-only, public, remote MCP server that helps people buying land in Lagos understand the buying process, terminology, and what questions to ask their professional advisers.

## What it does

| Tool | Description |
|---|---|
| `get_buying_steps` | Step-by-step guide to buying land in Lagos (10 steps) |
| `get_due_diligence_checklist` | Due diligence checklist across 5 categories |
| `get_questions_for_your_agent` | Questions to ask your lawyer, surveyor, or seller |
| `explain_term` | Plain-English definitions of Lagos land terms |
| `find_a_land_trust_os_firm` | Guidance on how to find a qualified Lagos professional |

## What it does NOT do

- It does **not** confirm title to any parcel of land.
- It does **not** store or process any client data.
- It does **not** use AI to generate or modify guidance.
- It does **not** endorse or recommend specific firms.

## Disclaimer

Every response from this server includes:

> This is general guidance, not legal advice. Land Trust OS does not confirm title or declare any land safe. Use a qualified Lagos property lawyer and surveyor.

## Banned words

The following words and phrases are banned from all content, tool descriptions, and source code. The test suite will fail the build if any appear:

- `verified` / `verify` / `verification`
- `safe land`
- `secure land`
- `guaranteed`
- `title confirmed`

## Running locally

```bash
npm install
npm run dev        # hot-reload dev server on port 3001
npm run build      # compile TypeScript to dist/
npm start          # run compiled server
npm test           # run banned-word and disclaimer tests
```

Environment variable:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | HTTP port |

## MCP endpoint

```
POST http://localhost:3001/mcp
```

Implements the [MCP Streamable HTTP transport](https://modelcontextprotocol.io/docs/concepts/transports).

## Content files

All guidance content lives in versioned JSON files under `src/content/`. Every file that contains legal or procedural content is marked with `TODO-REVIEW` notes. See `REVIEW-REQUIRED.md` for the review process.

## Project structure

```
src/
  server.ts               — Express + MCP server wiring
  tools/                  — One file per tool handler
  content/                — Versioned JSON content files
  middleware/
    rate-limit.ts         — 60 req/min per IP (in-memory)
    logger.ts             — Method/path/status only; no IPs; 7-day in-memory retention
  lib/
    disclaimer.ts         — Disclaimer constant and withDisclaimer() helper
tests/
  banned-words.test.ts    — Fails build on any banned word in content or descriptions
  disclaimer.test.ts      — Fails build if any handler omits the disclaimer
```

## Logging policy

- Logged: HTTP method, path, response status, timestamp.
- Not logged: IP addresses, query parameters, tool arguments, user data.
- Retention: in-memory only; resets on restart; entries older than 7 days are pruned.
