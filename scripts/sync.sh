#!/bin/bash
# sdks/scripts/sync.sh
# Syncs monorepo packages to their individual target repositories.

set -e

# Configuration
ORG="${AEROSTACK_ORG:-aerostackdev}"
PACKAGES=("node" "python" "go" "web" "react" "flutter" "react-native")
REPOS=("sdk-node" "sdk-python" "sdk-go" "sdk-web" "sdk-react" "sdk-flutter" "sdk-react-native")

echo "📦 Aerostack SDK Synchronization Tool"
echo "------------------------------------"

# Navigate to git root of the sdks folder
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
cd "$GIT_ROOT"

# Configure git for CI if needed
if [ -n "$GITHUB_ACTIONS" ]; then
  git config --global user.email "bot@aerostack.ai"
  git config --global user.name "Aerostack Bot"
fi

for i in "${!PACKAGES[@]}"; do
  PKG="${PACKAGES[$i]}"
  REPO="${REPOS[$i]}"
  
  if [ -n "$SDK_SYNC_PAT" ]; then
    TARGET_URL="https://x-access-token:${SDK_SYNC_PAT}@github.com/$ORG/$REPO.git"
  else
    TARGET_URL="git@github.com:$ORG/$REPO.git"
  fi
  
  echo "🚀 Syncing packages/$PKG to $ORG/$REPO..."
  
  # Check if remote exists, add/update if needed
  if ! git remote | grep -q "$REPO"; then
    git remote add "$REPO" "$TARGET_URL" || true
  else
    git remote set-url "$REPO" "$TARGET_URL"
  fi
  
  # Push the subdirectory to the target repository's main branch
  git subtree push --prefix=packages/"$PKG" "$REPO" main --force || {
    echo "⚠️ Failed to sync $PKG. Ensure the repo exists and you have permissions."
  }
done

echo ""
echo "✅ All SDKs synchronized!"
