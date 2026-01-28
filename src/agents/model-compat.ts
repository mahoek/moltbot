import type { Api, Model } from "@mariozechner/pi-ai";

import type { MoltbotConfig } from "../config/config.js";

function isOpenAiCompletionsModel(model: Model<Api>): model is Model<"openai-completions"> {
  return model.api === "openai-completions";
}

/**
 * Normalize model compat settings for provider-specific quirks.
 * - Z.ai: disable developer role support
 * - OpenRouter: inject provider routing preferences from config
 */
export function normalizeModelCompat(model: Model<Api>, cfg?: MoltbotConfig): Model<Api> {
  const baseUrl = model.baseUrl ?? "";

  // Z.ai: disable developer role support
  const isZai = model.provider === "zai" || baseUrl.includes("api.z.ai");
  if (isZai && isOpenAiCompletionsModel(model)) {
    const openaiModel = model as Model<"openai-completions">;
    const compat = openaiModel.compat ?? undefined;
    if (compat?.supportsDeveloperRole !== false) {
      openaiModel.compat = compat
        ? { ...compat, supportsDeveloperRole: false }
        : { supportsDeveloperRole: false };
    }
    return openaiModel;
  }

  // OpenRouter: inject provider routing preferences
  const isOpenRouter = model.provider === "openrouter" || baseUrl.includes("openrouter.ai");
  if (isOpenRouter && isOpenAiCompletionsModel(model)) {
    const modelKey = `openrouter/${model.id}`;
    const providerConfig = cfg?.agents?.defaults?.models?.[modelKey]?.provider;
    if (providerConfig) {
      const openaiModel = model as Model<"openai-completions">;
      openaiModel.compat = {
        ...openaiModel.compat,
        openRouterRouting: providerConfig,
      };
      return openaiModel;
    }
  }

  return model;
}
