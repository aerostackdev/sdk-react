#!/bin/bash
set -e

echo "🚀 Generating Aerostack SDKs from OpenAPI spec..."
echo ""

SPEC_FILE="spec/openapi.yaml"

# Check if Speakeasy is installed
if ! command -v speakeasy &> /dev/null; then
    echo "❌ Speakeasy CLI not found. Installing..."
    curl -fsSL https://raw.githubusercontent.com/speakeasy-api/speakeasy/main/install.sh | sh
fi

# Validate OpenAPI spec
echo "📋 Validating OpenAPI spec..."
speakeasy validate openapi -s $SPEC_FILE --non-interactive

# Generate TypeScript SDK (Node.js)
echo ""
echo "📦 Generating TypeScript SDK (@aerostack/sdk-node)..."
speakeasy generate sdk \
  -s $SPEC_FILE \
  --lang typescript \
  --out packages/node \
  --auto-yes

# Generate Python SDK
echo ""
echo "🐍 Generating Python SDK (aerostack-python)..."
speakeasy generate sdk \
  -s $SPEC_FILE \
  --lang python \
  --out packages/python \
  --auto-yes

# Generate Go SDK
echo ""
echo "🔷 Generating Go SDK (aerostack-go)..."
speakeasy generate sdk \
  -s $SPEC_FILE \
  --lang go \
  --out packages/go \
  --auto-yes

# Generate Web SDK (TypeScript for browser)
echo ""
echo "🌐 Generating Web SDK (@aerostack/sdk-web)..."
speakeasy generate sdk \
  -s $SPEC_FILE \
  --lang typescript \
  --out packages/web \
  --auto-yes

# Apply patches for Node and Web SDKs
echo "🩹 Applying patches..."
sed -i '' 's/new Blob(\[payload\.file\.content\],/new Blob(\[payload.file.content as any\],/g' packages/node/src/funcs/storageStorageUpload.ts
sed -i '' 's/new Blob(\[payload\.file\.content\],/new Blob(\[payload.file.content as any\],/g' packages/web/src/funcs/storageStorageUpload.ts

# Generate Flutter SDK (Dart)
echo ""
echo "📱 Generating Flutter SDK (aerostack_flutter)..."
npx @openapitools/openapi-generator-cli generate \
  -i $SPEC_FILE \
  -g dart-dio \
  -o packages/flutter \
  --additional-properties=pubName=aerostack_flutter,pubAuthor=Aerostack

# Install dependencies and build
echo ""
echo "📦 Installing dependencies..."
cd packages/node && npm install && npm run build && cd ../..
cd packages/web && npm install && npm run build && cd ../..
cd packages/react && npm install && npm run build && cd ../..

echo ""
echo "✅ All SDKs generated successfully!"
echo ""
echo "📁 Generated SDKs:"
echo "  - Node.js:  packages/node"
echo "  - Python:   packages/python"
echo "  - Go:       packages/go"
echo "  - Web:      packages/web"
echo "  - React:    packages/react"
echo "  - Flutter:  packages/flutter"
echo ""
echo "Next steps:"
echo "  1. Run 'npm test' to verify SDKs"
echo "  2. Run 'npm run publish:all' to publish to registries"
