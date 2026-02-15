#!/bin/bash
set -e
cd sdks

echo "🔧 Fixing Monorepo Sync..."

# Ensure we are on main
git checkout main

# Force add everything in packages/ to ensure they are tracked as files, not submodules
git add --force packages/

# Commit (allow empty if already clean, but we expect changes)
git commit -m "chore: sync packages to monorepo" || echo "Nothing to commit"

# Push
git push origin main

echo "✅ Monorepo sync attempt complete."
