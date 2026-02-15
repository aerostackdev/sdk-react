# Aerostack SDKs

Multi-language SDK generation for the Aerostack Platform API.

## Architecture

This repository uses **OpenAPI spec-driven generation** to maintain SDKs across multiple languages from a single source of truth.

### Supported SDKs

**Backend (Server-Side)**
- Node.js/TypeScript (`@aerostack/sdk-node`)
- Python (`aerostack-python`)
- Go (`aerostack-go`)
- PHP (`aerostack/sdk-php`)
- Ruby (`aerostack-ruby`)

**Frontend (Client-Side)**
- JavaScript/Web (`@aerostack/sdk-web`)
- React (`@aerostack/react`)
- Vue (`@aerostack/vue`)
- React Native (`@aerostack/react-native`)
- Flutter/Dart (`aerostack_flutter`)

## Quick Start

### Install Speakeasy CLI

```bash
curl -fsSL https://raw.githubusercontent.com/speakeasy-api/speakeasy/main/install.sh | sh
```

### Generate All SDKs

```bash
npm run generate
```

### Test All SDKs

```bash
npm test
```

### Publish to Registries

```bash
npm run publish:all
```

## Directory Structure

```
sdks/
├── spec/
│   └── openapi.yaml          # API specification (SINGLE SOURCE OF TRUTH)
│
├── packages/
│   ├── node/                 # @aerostack/sdk-node
│   ├── python/               # aerostack-python
│   ├── go/                   # aerostack-go
│   ├── web/                  # @aerostack/sdk-web
│   └── react/                # @aerostack/react
│
├── templates/                # Custom generation templates
│
├── scripts/
│   ├── generate.sh           # Generate all SDKs
│   └── publish.sh            # Publish to registries
│
└── .github/workflows/
    └── generate-sdks.yml     # CI/CD automation
```

## Development Workflow

1. **Edit OpenAPI Spec**: Modify `spec/openapi.yaml`
2. **Generate SDKs**: Run `npm run generate`
3. **Test**: Run `npm test`
4. **Commit & Push**: CI/CD handles the rest

## Adding a New Endpoint

```yaml
# Edit spec/openapi.yaml
paths:
  /new-endpoint:
    post:
      operationId: newOperation
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                param:
                  type: string
      responses:
        '200':
          description: Success
```

Then run `npm run generate` and all SDKs will have the new method.

## Documentation

- [OpenAPI Spec](./spec/openapi.yaml)
- [SDK Generation Strategy](../../../.gemini/antigravity/brain/393c4513-0ed5-4460-8200-ad938f6ed7cd/sdk_generation_strategy.md)
- [SDK Proposal](../../../.gemini/antigravity/brain/393c4513-0ed5-4460-8200-ad938f6ed7cd/sdk_proposal.md)
