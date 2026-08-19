/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { CHAT_CONTEXT_TYPES, CONTEXT_TOOL_SCOPE } from "@orra/types";
import { buildTools } from "./index";

const FAKE_USER_ID = "00000000-0000-0000-0000-000000000000";

describe("CONTEXT_TOOL_SCOPE", () => {
  const allToolNames = Object.keys(buildTools(FAKE_USER_ID));
  const contextTypes = CHAT_CONTEXT_TYPES as readonly string[];

  test("every scope key is a valid chat context type", () => {
    for (const key of Object.keys(CONTEXT_TOOL_SCOPE)) {
      expect(contextTypes).toContain(key);
    }
  });

  test("covers every chat context type (default-deny: no empty scopes)", () => {
    for (const contextType of contextTypes) {
      const tools = CONTEXT_TOOL_SCOPE[contextType];
      expect(tools, `${contextType} scope must be defined`).toBeDefined();
      expect(
        tools?.length ?? 0,
        `${contextType} scope must not be empty`,
      ).toBeGreaterThan(0);
    }
  });

  test("every listed tool name exists in buildTools", () => {
    for (const [contextType, toolNames] of Object.entries(CONTEXT_TOOL_SCOPE)) {
      for (const name of toolNames) {
        expect(
          allToolNames,
          `${name} (in ${contextType}) must exist in buildTools`,
        ).toContain(name);
      }
    }
  });

  test("no dead tools: every reachable tool appears in at least one scope", () => {
    const scoped = new Set(Object.values(CONTEXT_TOOL_SCOPE).flat());
    for (const name of allToolNames) {
      expect(
        scoped.has(name),
        `${name} should be reachable in at least one scope`,
      ).toBe(true);
    }
  });
});
