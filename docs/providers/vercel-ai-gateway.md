---
title: "Vercel AI Gateway"
summary: "Vercel AI Gateway setup (auth + model selection)"
read_when:
  - You want to use Vercel AI Gateway with Moltbot
  - You need the API key env var or CLI auth choice
---
# Vercel AI Gateway


The [Vercel AI Gateway](https://vercel.com/ai-gateway) provides a unified API to access hundreds of models through a single endpoint. 

- Provider: `vercel-ai-gateway`
- Auth: `AI_GATEWAY_API_KEY`
- API: Anthropic Messages compatible

## Quick start

1) Set the API key (recommended: store it for the Gateway):

```bash
moltbot onboard --auth-choice ai-gateway-api-key
```

2) Set a default model:

```json5
{
  agents: {
    defaults: {
      model: { primary: "vercel-ai-gateway/anthropic/claude-opus-4.5" }
    }
  }
}
```

## Non-interactive example

```bash
moltbot onboard --non-interactive \
  --mode local \
  --auth-choice ai-gateway-api-key \
  --ai-gateway-api-key "$AI_GATEWAY_API_KEY"
```

## Provider routing options

Vercel AI Gateway supports provider routing options to control how requests are routed across providers. Configure these via model `params`:

- `gatewayOrder`: Array of provider slugs specifying the fallback order (e.g., `["bedrock", "anthropic"]`)
- `gatewayOnly`: Array of provider slugs to restrict routing to specific providers
- `gatewayModels`: Array of fallback model IDs to try if the primary model fails

Example configuration:

```json5
{
  agents: {
    defaults: {
      model: { primary: "vercel-ai-gateway/anthropic/claude-opus-4.5" },
      models: {
        "vercel-ai-gateway/anthropic/claude-opus-4.5": {
          params: {
            gatewayOrder: ["bedrock", "anthropic"], // Try Bedrock first, then Anthropic
            gatewayOnly: ["bedrock", "anthropic", "vertex"], // Restrict to these providers
          }
        }
      }
    }
  }
}
```

With model fallbacks:

```json5
{
  agents: {
    defaults: {
      model: { primary: "vercel-ai-gateway/openai/gpt-4o" },
      models: {
        "vercel-ai-gateway/openai/gpt-4o": {
          params: {
            gatewayModels: [
              "openai/gpt-5-nano",
              "gemini-2.0-flash"
            ] // Fallback models if primary fails
          }
        }
      }
    }
  }
}
```

See the [Vercel AI Gateway provider options documentation](https://vercel.com/docs/ai-gateway/models-and-providers/provider-options) for details on provider routing behavior.

## Environment note

If the Gateway runs as a daemon (launchd/systemd), make sure `AI_GATEWAY_API_KEY`
is available to that process (for example, in `~/.clawdbot/.env` or via
`env.shellEnv`).
