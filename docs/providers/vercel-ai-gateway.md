---
title: "Vercel AI Gateway"
summary: "Use Vercel AI Gateway's unified API to access many models in Moltbot"
read_when:
  - You want to use Vercel AI Gateway with Moltbot
  - You need the API key env var or CLI auth choice
---
# Vercel AI Gateway

The [Vercel AI Gateway](https://vercel.com/ai-gateway) provides a unified API to access hundreds of models through a single endpoint with built-in provider routing, fallbacks, and observability.

**Best for:** Vercel users who want unified model access with automatic fallbacks and usage tracking.

| Property | Value |
|----------|-------|
| Provider | `vercel-ai-gateway` |
| Auth | `AI_GATEWAY_API_KEY` |
| API | Anthropic Messages compatible |

## Quick start

1. Get your API key from [Vercel AI Gateway settings](https://vercel.com/account/ai-gateway)

2. Configure Moltbot:

```bash
moltbot onboard --auth-choice ai-gateway-api-key
```

3. Set a default model:

```json5
{
  agents: {
    defaults: {
      model: { primary: "vercel-ai-gateway/anthropic/claude-opus-4-5" }
    }
  }
}
```

## Setup options

### Option A: Interactive setup (recommended)

```bash
moltbot onboard --auth-choice ai-gateway-api-key
```

This will prompt for your API key and configure the provider automatically.

### Option B: Non-interactive setup

```bash
moltbot onboard --non-interactive \
  --mode local \
  --auth-choice ai-gateway-api-key \
  --ai-gateway-api-key "$AI_GATEWAY_API_KEY"
```

### Option C: Environment variable

```bash
export AI_GATEWAY_API_KEY="..."
```

### Config snippet

```json5
{
  env: { AI_GATEWAY_API_KEY: "..." },
  agents: {
    defaults: {
      model: { primary: "vercel-ai-gateway/anthropic/claude-opus-4-5" }
    }
  }
}
```

## Model naming

Vercel AI Gateway model refs follow the pattern `vercel-ai-gateway/<provider>/<model>`:

```json5
{
  agents: {
    defaults: {
      model: {
        primary: "vercel-ai-gateway/anthropic/claude-opus-4-5",
        fallbacks: ["vercel-ai-gateway/openai/gpt-5.2"]
      }
    }
  }
}
```

## Provider routing

Vercel AI Gateway supports provider routing options to control how requests are routed across infrastructure providers. Configure these via model `params`:

| Option | Type | Description |
|--------|------|-------------|
| `gatewayOrder` | `string[]` | Provider fallback order (e.g., `["bedrock", "anthropic"]`) |
| `gatewayOnly` | `string[]` | Restrict routing to specific providers |
| `gatewayModels` | `string[]` | Fallback model IDs if the primary model fails |

### Example: prefer Bedrock, restrict to specific providers

```json5
{
  agents: {
    defaults: {
      model: { primary: "vercel-ai-gateway/anthropic/claude-opus-4-5" },
      models: {
        "vercel-ai-gateway/anthropic/claude-opus-4-5": {
          params: {
            gatewayOrder: ["bedrock", "anthropic"],
            gatewayOnly: ["bedrock", "anthropic", "vertex"]
          }
        }
      }
    }
  }
}
```

### Example: model fallbacks

If the primary model fails or is unavailable, fall back to alternative models:

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
            ]
          }
        }
      }
    }
  }
}
```

## Model parameters

Pass provider-specific parameters via `params`:

```json5
{
  agents: {
    defaults: {
      models: {
        "vercel-ai-gateway/anthropic/claude-opus-4-5": {
          params: {
            temperature: 0.7,
            maxTokens: 4096,
            gatewayOrder: ["bedrock", "anthropic"]
          }
        }
      }
    }
  }
}
```

## Daemon environment

If the Gateway runs as a daemon (launchd/systemd), make sure `AI_GATEWAY_API_KEY`
is available to that process:

- **macOS (launchd):** Add to `~/.clawdbot/.env` or configure via `env.shellEnv` in your config
- **Linux (systemd):** Add to your service's environment file or use `Environment=` in the unit

```json5
{
  env: {
    shellEnv: ["AI_GATEWAY_API_KEY"]
  }
}
```

## Troubleshooting

### Invalid API key

Make sure your key is valid and the environment variable is set:

```bash
echo $AI_GATEWAY_API_KEY
moltbot models status
```

### Model not found

Check the model ID format is `vercel-ai-gateway/<provider>/<model>`:

```bash
moltbot models list | grep vercel-ai-gateway
```

### Gateway routing errors

If provider routing fails:
- Verify the provider slugs are correct (e.g., `bedrock`, `anthropic`, `vertex`)
- Check that the model supports the requested providers
- Review Vercel AI Gateway logs in your Vercel dashboard

### API key not found in daemon

If the gateway runs as a daemon and reports missing credentials:

1. Add the key to `~/.clawdbot/.env`:
   ```bash
   AI_GATEWAY_API_KEY=your-key-here
   ```

2. Or configure `env.shellEnv` in your config to inherit from shell environment

3. Restart the gateway

## See also

- [Vercel AI Gateway docs](https://vercel.com/docs/ai-gateway)
- [Vercel AI Gateway provider options](https://vercel.com/docs/ai-gateway/models-and-providers/provider-options)
- [Model providers](/concepts/model-providers)
- [Model selection](/concepts/models)
