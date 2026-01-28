---
title: "OpenRouter"
summary: "Use OpenRouter's unified API to access many models in Moltbot"
read_when:
  - You want a single API key for many LLMs
  - You want to run models via OpenRouter in Moltbot
---
# OpenRouter

OpenRouter provides a **unified API** that routes requests to many models behind a single
endpoint and API key. It is OpenAI-compatible, so most OpenAI SDKs work by switching the base URL.

**Best for:** accessing 200+ models from a single provider with unified billing.

## Quick start

1. Get your API key from [openrouter.ai/keys](https://openrouter.ai/keys)

2. Configure Moltbot:

```bash
moltbot onboard --auth-choice openrouter-api-key
```

3. Set a default model:

```json5
{
  agents: {
    defaults: {
      model: { primary: "openrouter/anthropic/claude-sonnet-4-5" }
    }
  }
}
```

## Setup options

### Option A: Interactive setup (recommended)

```bash
moltbot onboard --auth-choice openrouter-api-key
```

This will prompt for your API key and configure the provider automatically.

### Option B: Non-interactive setup

```bash
moltbot onboard --non-interactive \
  --mode local \
  --auth-choice openrouter-api-key \
  --openrouter-api-key "$OPENROUTER_API_KEY"
```

### Option C: Environment variable

```bash
export OPENROUTER_API_KEY="sk-or-..."
```

### Config snippet

```json5
{
  env: { OPENROUTER_API_KEY: "sk-or-..." },
  agents: {
    defaults: {
      model: { primary: "openrouter/anthropic/claude-sonnet-4-5" }
    }
  }
}
```

## Model naming

OpenRouter model refs follow the pattern `openrouter/<provider>/<model>`:

```json5
{
  agents: {
    defaults: {
      model: {
        primary: "openrouter/anthropic/claude-sonnet-4-5",
        fallbacks: ["openrouter/openai/gpt-5.2"]
      }
    }
  }
}
```

## Provider routing

OpenRouter can route requests to different infrastructure providers (e.g., Anthropic direct vs AWS Bedrock). Control which providers handle your requests using the `provider` config:

```json5
{
  agents: {
    defaults: {
      models: {
        "openrouter/anthropic/claude-sonnet-4-5": {
          provider: {
            only: ["anthropic"],       // Only use Anthropic's servers
            allow_fallbacks: false     // Don't fall back to other providers
          }
        }
      }
    }
  }
}
```

### Provider options

| Option | Type | Description |
|--------|------|-------------|
| `only` | `string[]` | Allowlist: only use these providers |
| `ignore` | `string[]` | Blocklist: never use these providers |
| `order` | `string[]` | Try providers in this order |
| `allow_fallbacks` | `boolean` | Enable/disable fallback (default: true) |

**Common provider slugs:** `anthropic`, `openai`, `together`, `deepinfra`, `azure`, `google`, `aws-bedrock`

### Example: prefer Bedrock, fall back to Anthropic

```json5
{
  agents: {
    defaults: {
      models: {
        "openrouter/anthropic/claude-sonnet-4-5": {
          provider: {
            order: ["aws-bedrock", "anthropic"],
            allow_fallbacks: true
          }
        }
      }
    }
  }
}
```

### Example: block specific providers

```json5
{
  agents: {
    defaults: {
      models: {
        "openrouter/anthropic/claude-sonnet-4-5": {
          provider: {
            ignore: ["azure", "google"]  // Never use Azure or Google
          }
        }
      }
    }
  }
}
```

## Prompt caching (Anthropic models)

OpenRouter supports Anthropic prompt caching for Claude models. Set the cache TTL via model `params`:

```json5
{
  agents: {
    defaults: {
      models: {
        "openrouter/anthropic/claude-sonnet-4-5": {
          params: { cacheControlTtl: "1h" }  // or "5m"
        }
      }
    }
  }
}
```

This only applies to Anthropic models routed through OpenRouter (model IDs starting with `anthropic/`).

## Model parameters

Pass provider-specific parameters via `params`:

```json5
{
  agents: {
    defaults: {
      models: {
        "openrouter/anthropic/claude-sonnet-4-5": {
          params: {
            temperature: 0.7,
            maxTokens: 4096,
            cacheControlTtl: "1h"
          }
        }
      }
    }
  }
}
```

## Troubleshooting

### Invalid API key

Make sure your key starts with `sk-or-` and is valid:

```bash
echo $OPENROUTER_API_KEY
moltbot models status
```

### Model not found

Check the model ID format is `openrouter/<provider>/<model>`:

```bash
moltbot models list | grep openrouter
```

### Rate limiting

OpenRouter has per-model rate limits. If you hit limits:
- Use `provider.order` to prefer providers with higher limits
- Add fallback models to `model.fallbacks`

### Provider routing not working

Provider routing only applies to models with the `provider` config set. Verify your config:

```bash
moltbot config get agents.defaults.models
```

## See also

- [OpenRouter docs](https://openrouter.ai/docs)
- [OpenRouter provider routing](https://openrouter.ai/docs/guides/routing/provider-selection)
- [Model providers](/concepts/model-providers)
- [Model selection](/concepts/models)
