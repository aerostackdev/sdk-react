#!/bin/bash
# sdks/scripts/apply_version.sh
# Unifies the version across all SDK packages based on the sdks/VERSION file.

set -e

# Always run from the repo root
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
cd "$GIT_ROOT"

VERSION=$(cat VERSION | tr -d '[:space:]')
echo "🚀 Applying version v$VERSION to all SDKs..."

# 1. Update Node/Web/React/React-Native (package.json)
for pkg in packages/{node,web,react,react-native}; do
  if [ -f "$pkg/package.json" ]; then
    echo "  - Updating $pkg/package.json"
    perl -pi -e "s/\"version\": \".*?\"/\"version\": \"$VERSION\"/" "$pkg/package.json"
  fi
done

# 2. Update Python (pyproject.toml)
if [ -f "packages/python/pyproject.toml" ]; then
  echo "  - Updating packages/python/pyproject.toml"
  perl -pi -e "s/version = \".*?\"/version = \"$VERSION\"/" "packages/python/pyproject.toml"
fi

# 3. Update Flutter (pubspec.yaml)
if [ -f "packages/flutter/pubspec.yaml" ]; then
  echo "  - Updating packages/flutter/pubspec.yaml"
  perl -pi -e "s/version: .*?/version: $VERSION/" "packages/flutter/pubspec.yaml"
fi

echo "✅ Version v$VERSION applied successfully!"
