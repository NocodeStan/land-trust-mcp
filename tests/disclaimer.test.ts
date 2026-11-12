/**
 * Disclaimer tests.
 *
 * Every tool handler must include the standard disclaimer in its output.
 * These tests call each handler with minimal valid input and assert
 * that the disclaimer text is present.
 */

import { describe, it, expect } from "vitest";
import { DISCLAIMER } from "../src/lib/disclaimer.js";
import { handleBuyingSteps } from "../src/tools/buying-steps.js";
import { handleDueDiligence } from "../src/tools/due-diligence.js";
import { handleAgentQuestions } from "../src/tools/agent-questions.js";
import { handleExplainTerm } from "../src/tools/explain-term.js";
import { handleFindFirm } from "../src/tools/find-firm.js";

function assertHasDisclaimer(output: string, toolName: string): void {
  expect(output, `${toolName} must include the disclaimer`).toContain(DISCLAIMER);
}

describe("Disclaimer present in all tool outputs", () => {
  it("get_buying_steps — no args", () => {
    const out = handleBuyingSteps({});
    assertHasDisclaimer(out, "get_buying_steps");
  });

  it("get_buying_steps — single step", () => {
    const out = handleBuyingSteps({ step_number: 1 });
    assertHasDisclaimer(out, "get_buying_steps (step 1)");
  });

  it("get_buying_steps — invalid step", () => {
    const out = handleBuyingSteps({ step_number: 999 });
    assertHasDisclaimer(out, "get_buying_steps (invalid step)");
  });

  it("get_due_diligence_checklist — no args", () => {
    const out = handleDueDiligence({});
    assertHasDisclaimer(out, "get_due_diligence_checklist");
  });

  it("get_due_diligence_checklist — title category", () => {
    const out = handleDueDiligence({ category: "title" });
    assertHasDisclaimer(out, "get_due_diligence_checklist (title)");
  });

  it("get_due_diligence_checklist — invalid category", () => {
    const out = handleDueDiligence({ category: "nonexistent" });
    assertHasDisclaimer(out, "get_due_diligence_checklist (invalid)");
  });

  it("get_questions_for_your_agent — no args", () => {
    const out = handleAgentQuestions({});
    assertHasDisclaimer(out, "get_questions_for_your_agent");
  });

  it("get_questions_for_your_agent — lawyer", () => {
    const out = handleAgentQuestions({ audience: "lawyer" });
    assertHasDisclaimer(out, "get_questions_for_your_agent (lawyer)");
  });

  it("get_questions_for_your_agent — surveyor", () => {
    const out = handleAgentQuestions({ audience: "surveyor" });
    assertHasDisclaimer(out, "get_questions_for_your_agent (surveyor)");
  });

  it("get_questions_for_your_agent — seller", () => {
    const out = handleAgentQuestions({ audience: "seller" });
    assertHasDisclaimer(out, "get_questions_for_your_agent (seller)");
  });

  it("explain_term — known term", () => {
    const out = handleExplainTerm({ term: "Certificate of Occupancy" });
    assertHasDisclaimer(out, "explain_term (C of O)");
  });

  it("explain_term — unknown term", () => {
    const out = handleExplainTerm({ term: "nonexistent-term-xyz" });
    assertHasDisclaimer(out, "explain_term (unknown)");
  });

  it("explain_term — empty term", () => {
    const out = handleExplainTerm({ term: "" });
    assertHasDisclaimer(out, "explain_term (empty)");
  });

  it("find_a_land_trust_os_firm — no args", () => {
    const out = handleFindFirm({});
    assertHasDisclaimer(out, "find_a_land_trust_os_firm");
  });
});

describe("Disclaimer exact text integrity", () => {
  it("disclaimer contains the required phrases", () => {
    expect(DISCLAIMER).toContain("general guidance, not legal advice");
    expect(DISCLAIMER).toContain("does not confirm title");
    expect(DISCLAIMER).toContain("Lagos property lawyer and surveyor");
  });
});
