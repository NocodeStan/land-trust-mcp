/**
 * Banned-word tests.
 *
 * These tests MUST fail the build if any banned word or phrase appears
 * in content files or tool descriptions.
 *
 * Banned words (case-insensitive, whole-word or substring match):
 *   verified, verify, verification, safe land, secure land,
 *   guaranteed, title confirmed
 *
 * "safe" and "secure" on their own are allowed; only the compound phrases
 * "safe land" and "secure land" are banned.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { buyingStepsToolDef } from "../src/tools/buying-steps.js";
import { dueDiligenceToolDef } from "../src/tools/due-diligence.js";
import { agentQuestionsToolDef } from "../src/tools/agent-questions.js";
import { explainTermToolDef } from "../src/tools/explain-term.js";
import { findFirmToolDef } from "../src/tools/find-firm.js";

// ── Banned patterns ───────────────────────────────────────────────────────────

const BANNED_PATTERNS: RegExp[] = [
  /\bverified\b/i,
  /\bverify\b/i,
  /\bverification\b/i,
  /\bsafe land\b/i,
  /\bsecure land\b/i,
  /\bguaranteed\b/i,
  /\btitle confirmed\b/i,
];

function checkForBannedWords(text: string, source: string): void {
  for (const pattern of BANNED_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      throw new Error(
        `Banned word/phrase "${match[0]}" found in ${source}. ` +
          `Pattern: ${pattern}. ` +
          `Context: ...${text.slice(Math.max(0, text.indexOf(match[0]) - 40), text.indexOf(match[0]) + 60)}...`
      );
    }
  }
}

// ── Collect all content JSON files ───────────────────────────────────────────

function collectFiles(dir: string, ext: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectFiles(full, ext));
    } else if (entry.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

const contentDir = resolve("src/content");
const contentFiles = collectFiles(contentDir, ".json");

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Banned words — content files", () => {
  for (const filePath of contentFiles) {
    it(`${filePath} contains no banned words`, () => {
      const text = readFileSync(filePath, "utf-8");
      checkForBannedWords(text, filePath);
    });
  }
});

describe("Banned words — tool descriptions", () => {
  const tools = [
    buyingStepsToolDef,
    dueDiligenceToolDef,
    agentQuestionsToolDef,
    explainTermToolDef,
    findFirmToolDef,
  ];

  for (const tool of tools) {
    it(`tool "${tool.name}" description contains no banned words`, () => {
      checkForBannedWords(tool.description, `tool:${tool.name}`);
    });
  }
});

describe("Banned words — source TypeScript files", () => {
  const srcDir = resolve("src");
  const tsFiles = collectFiles(srcDir, ".ts");

  for (const filePath of tsFiles) {
    it(`${filePath} contains no banned words`, () => {
      const text = readFileSync(filePath, "utf-8");
      checkForBannedWords(text, filePath);
    });
  }
});
