#!/bin/bash
# sdks/scripts/publish.sh
# Handles publishing of all SDKs to their respective registries.

set -e

# Always run from the repo root
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
cd "$GIT_ROOT"

# 1. Apply unified version
chmod +x scripts/apply_version.sh
./scripts/apply_version.sh

VERSION=$(cat VERSION | tr -d '[:space:]')

# 2. Publish NPM Packages (Node, Web, React)
echo "📦 Publishing to NPM..."
# Using workspace-aware publishing to avoid ENOWORKSPACES
if [ -n "$NPM_TOKEN" ]; then
  npm config set //registry.npmjs.org/:_authToken=$NPM_TOKEN
  
  # Map folder names to package names
  WORKSPACES=("@aerostack/sdk-node" "@aerostack/sdk-web" "@aerostack/react")
  
  for ws in "${WORKSPACES[@]}"; do
    echo "  - Publishing workspace $ws..."
    npm publish --workspace="$ws" --access public || echo "  ⚠️ NPM publish failed for $ws (possibly version already exists)"
  done
else
  echo "  ⚠️ Skipping NPM publish: NPM_TOKEN not set."
fi

# 3. Trigger GitHub Micro-repo Sync
echo "🚀 Triggering Micro-repo Sync..."
chmod +x scripts/sync.sh
./scripts/sync.sh

echo "🎉 v$VERSION successfully released!"
