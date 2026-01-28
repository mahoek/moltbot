import type { Api, Model } from "@mariozechner/pi-ai";
import { describe, expect, it } from "vitest";

import type { MoltbotConfig } from "../config/config.js";

import { normalizeModelCompat } from "./model-compat.js";

const baseModel = (): Model<Api> =>
  ({
    id: "glm-4.7",
    name: "GLM-4.7",
    api: "openai-completions",
    provider: "zai",
    baseUrl: "https://api.z.ai/api/coding/paas/v4",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 8192,
    maxTokens: 1024,
  }) as Model<Api>;

const openRouterModel = (): Model<Api> =>
  ({
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    api: "openai-completions",
    provider: "openrouter",
    baseUrl: "https://openrouter.ai/api/v1",
    reasoning: false,
    input: ["text"],
    cost: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
    contextWindow: 200000,
    maxTokens: 8192,
  }) as Model<Api>;

describe("normalizeModelCompat", () => {
  it("forces supportsDeveloperRole off for z.ai models", () => {
    const model = baseModel();
    delete (model as { compat?: unknown }).compat;
    const normalized = normalizeModelCompat(model);
    expect(normalized.compat?.supportsDeveloperRole).toBe(false);
  });

  it("leaves non-zai models untouched", () => {
    const model = {
      ...baseModel(),
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
    };
    delete (model as { compat?: unknown }).compat;
    const normalized = normalizeModelCompat(model);
    expect(normalized.compat).toBeUndefined();
  });

  it("does not override explicit z.ai compat false", () => {
    const model = baseModel();
    model.compat = { supportsDeveloperRole: false };
    const normalized = normalizeModelCompat(model);
    expect(normalized.compat?.supportsDeveloperRole).toBe(false);
  });
});

describe("normalizeModelCompat openrouter", () => {
  it("injects openRouterRouting from config", () => {
    const model = openRouterModel();
    const cfg: MoltbotConfig = {
      agents: {
        defaults: {
          models: {
            "openrouter/anthropic/claude-sonnet-4": {
              provider: {
                only: ["anthropic"],
                allow_fallbacks: false,
              },
            },
          },
        },
      },
    };
    const normalized = normalizeModelCompat(model, cfg);
    expect(normalized.compat?.openRouterRouting).toEqual({
      only: ["anthropic"],
      allow_fallbacks: false,
    });
  });

  it("does not inject routing without config", () => {
    const model = openRouterModel();
    const normalized = normalizeModelCompat(model);
    expect(normalized.compat?.openRouterRouting).toBeUndefined();
  });

  it("does not inject routing for non-openrouter models", () => {
    const model = {
      ...openRouterModel(),
      provider: "anthropic",
      baseUrl: "https://api.anthropic.com/v1",
    };
    const cfg: MoltbotConfig = {
      agents: {
        defaults: {
          models: {
            "openrouter/anthropic/claude-sonnet-4": {
              provider: { only: ["anthropic"] },
            },
          },
        },
      },
    };
    const normalized = normalizeModelCompat(model, cfg);
    expect(normalized.compat?.openRouterRouting).toBeUndefined();
  });

  it("preserves existing compat fields when adding routing", () => {
    const model = openRouterModel();
    model.compat = { supportsStore: true };
    const cfg: MoltbotConfig = {
      agents: {
        defaults: {
          models: {
            "openrouter/anthropic/claude-sonnet-4": {
              provider: { ignore: ["together"] },
            },
          },
        },
      },
    };
    const normalized = normalizeModelCompat(model, cfg);
    expect(normalized.compat?.supportsStore).toBe(true);
    expect(normalized.compat?.openRouterRouting).toEqual({ ignore: ["together"] });
  });
});
