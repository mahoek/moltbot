import { describe, expect, it } from "vitest";
import type { StreamFn } from "@mariozechner/pi-agent-core";
import type { Model } from "@mariozechner/pi-ai";
import { streamSimple } from "@mariozechner/pi-ai";
import type { MoltbotConfig } from "../../config/config.js";
import {
  applyExtraParamsToAgent,
  resolveExtraParams,
} from "./extra-params.js";

describe("extra-params", () => {
  describe("resolveExtraParams", () => {
    it("resolves params from config", () => {
      const cfg: MoltbotConfig = {
        agents: {
          defaults: {
            models: {
              "vercel-ai-gateway/anthropic/claude-opus-4.5": {
                params: {
                  gatewayOrder: ["bedrock", "anthropic"],
                  gatewayOnly: ["bedrock", "anthropic"],
                },
              },
            },
          },
        },
      };

      const result = resolveExtraParams({
        cfg,
        provider: "vercel-ai-gateway",
        modelId: "anthropic/claude-opus-4.5",
      });

      expect(result).toEqual({
        gatewayOrder: ["bedrock", "anthropic"],
        gatewayOnly: ["bedrock", "anthropic"],
      });
    });

    it("returns undefined when no params configured", () => {
      const cfg: MoltbotConfig = {
        agents: {
          defaults: {},
        },
      };

      const result = resolveExtraParams({
        cfg,
        provider: "vercel-ai-gateway",
        modelId: "anthropic/claude-opus-4.5",
      });

      expect(result).toBeUndefined();
    });
  });

  describe("applyExtraParamsToAgent", () => {
    it("creates wrapper function when gateway routing options are present", () => {
      const cfg: MoltbotConfig = {
        agents: {
          defaults: {
            models: {
              "vercel-ai-gateway/anthropic/claude-opus-4.5": {
                params: {
                  gatewayOrder: ["bedrock", "anthropic"],
                  gatewayOnly: ["bedrock", "anthropic", "vertex"],
                  gatewayModels: [
                    "anthropic/claude-opus-4.5",
                    "anthropic/claude-sonnet-4.5",
                  ],
                },
              },
            },
          },
        },
      };

      const agent = { streamFn: streamSimple };
      const originalStreamFn = agent.streamFn;

      applyExtraParamsToAgent(
        agent,
        cfg,
        "vercel-ai-gateway",
        "anthropic/claude-opus-4.5",
      );

      // Should create a wrapper function
      expect(agent.streamFn).toBeDefined();
      expect(agent.streamFn).not.toBe(originalStreamFn);
    });

    it("ignores gateway options for non-gateway providers", () => {
      const cfg: MoltbotConfig = {
        agents: {
          defaults: {
            models: {
              "openai/gpt-5.2": {
                params: {
                  gatewayOrder: ["bedrock", "anthropic"],
                  temperature: 0.7,
                },
              },
            },
          },
        },
      };

      const agent = { streamFn: streamSimple };
      const originalStreamFn = agent.streamFn;

      applyExtraParamsToAgent(agent, cfg, "openai", "gpt-5.2");

      // Should create a wrapper for temperature, but gateway options should be ignored
      expect(agent.streamFn).toBeDefined();
      expect(agent.streamFn).not.toBe(originalStreamFn);
    });

    it("does not create wrapper when gateway arrays are empty", () => {
      const cfg: MoltbotConfig = {
        agents: {
          defaults: {
            models: {
              "vercel-ai-gateway/anthropic/claude-opus-4.5": {
                params: {
                  gatewayOrder: [],
                  gatewayOnly: [],
                  gatewayModels: [],
                },
              },
            },
          },
        },
      };

      const agent = { streamFn: streamSimple };
      const originalStreamFn = agent.streamFn;

      applyExtraParamsToAgent(
        agent,
        cfg,
        "vercel-ai-gateway",
        "anthropic/claude-opus-4.5",
      );

      // Empty arrays should not create a wrapper
      expect(agent.streamFn).toBe(originalStreamFn);
    });

    it("creates wrapper when only some gateway options are present", () => {
      const cfg: MoltbotConfig = {
        agents: {
          defaults: {
            models: {
              "vercel-ai-gateway/anthropic/claude-opus-4.5": {
                params: {
                  gatewayOrder: ["bedrock"],
                },
              },
            },
          },
        },
      };

      const agent = { streamFn: streamSimple };
      const originalStreamFn = agent.streamFn;

      applyExtraParamsToAgent(
        agent,
        cfg,
        "vercel-ai-gateway",
        "anthropic/claude-opus-4.5",
      );

      // Should create a wrapper even with just one option
      expect(agent.streamFn).toBeDefined();
      expect(agent.streamFn).not.toBe(originalStreamFn);
    });

    it("handles non-array gateway option values gracefully", () => {
      const cfg: MoltbotConfig = {
        agents: {
          defaults: {
            models: {
              "vercel-ai-gateway/anthropic/claude-opus-4.5": {
                params: {
                  gatewayOrder: "not-an-array",
                  gatewayOnly: ["bedrock"],
                },
              },
            },
          },
        },
      };

      const agent = { streamFn: streamSimple };
      const originalStreamFn = agent.streamFn;

      applyExtraParamsToAgent(
        agent,
        cfg,
        "vercel-ai-gateway",
        "anthropic/claude-opus-4.5",
      );

      // Should create wrapper for valid array (gatewayOnly), ignoring invalid gatewayOrder
      expect(agent.streamFn).toBeDefined();
      expect(agent.streamFn).not.toBe(originalStreamFn);
    });
  });
});
