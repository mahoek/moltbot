---
summary: "Use OpenRouter's unified API to access many models in Moltbot"
read_when:
  - You want a single API key for many LLMs
  - You want to run models via OpenRouter in Moltbot
---
# OpenRouter

OpenRouter provides a **unified API** that routes requests to many models behind a single
endpoint and API key. It is OpenAI-compatible, so most OpenAI SDKs work by switching the base URL.

## CLI setup

```bash
moltbot onboard --auth-choice apiKey --token-provider openrouter --token "$OPENROUTER_API_KEY"
```

## Config snippet

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

## Provider routing

OpenRouter can route requests to different infrastructure providers. You can control which
providers handle your requests using the `provider` config:

```json5
{
  agents: {
    defaults: {
      models: {
        "openrouter/anthropic/claude-sonnet-4": {
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

Common provider slugs: `anthropic`, `openai`, `together`, `deepinfra`, `azure`, `google`, `aws-bedrock`

See [OpenRouter provider routing docs](https://openrouter.ai/docs/guides/routing/provider-selection) for the full list.

## Notes

- Model refs are `openrouter/<provider>/<model>`.
- For more model/provider options, see [/concepts/model-providers](/concepts/model-providers).
- OpenRouter uses a Bearer token with your API key under the hood.
