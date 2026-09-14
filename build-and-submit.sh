#!/bin/bash

# ============================================================
# build-and-submit.sh
# Expo: Set Version → Git Commit All → Version Check → Prebuild → Local Build → Submit
#
# Always submits to Play Store INTERNAL TESTING track.
# To promote to Production, run: node scripts/promote-to-production.js
#
# Usage: npm run release
#        bash build-and-submit.sh [build-profile]
# Default build profile: production
# ============================================================

set -e  # Exit immediately on any error

BUILD_PROFILE="${1:-production}"
SUBMIT_PROFILE="internal"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Read current version from app.json
CURRENT_VERSION=$(node -e "console.log(require('./app.json').expo.version)")

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║    🚀 MindCraft Learning — Build & Submit   ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  Build profile  : $BUILD_PROFILE"
echo "  Submit track   : Internal Testing"
echo "  Current version: $CURRENT_VERSION"
echo ""

# ── Step 0: Set Version ───────────────────────────────────
echo "🔖 [0/5] Set app version"
echo "------------------------------------------------"
echo "  Current version is: $CURRENT_VERSION"
echo "  Enter new version (or press Enter to keep current):"
echo -n "  > "
read NEW_VERSION

# Strip any whitespace, carriage returns (\r), or newlines
NEW_VERSION=$(echo "$NEW_VERSION" | tr -d '\r\n[:space:]')

if [ -z "$NEW_VERSION" ]; then
  echo "  ↳ Keeping current version: $CURRENT_VERSION"
else
  # Validate semver format using standard POSIX class [0-9]
  if [[ ! "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ Invalid version format: \"$NEW_VERSION\""
    echo "   Must be semver: MAJOR.MINOR.PATCH  e.g. 2.1.0"
    exit 1
  fi
  echo ""
  node "$PROJECT_DIR/scripts/set-version.js" "$NEW_VERSION"
  echo ""
  echo "  💡 Don't forget to update \"whatsNew\" in version.json before releasing!"
  echo ""
  echo -n "  Press Enter to continue, or Ctrl+C to edit version.json first... "
  read CONFIRM
fi
echo ""

# ── Step 1: Commit EVERYTHING to Git before build ─────────
echo "📝 [1/5] Committing all working tree changes to Git..."
echo "------------------------------------------------"
FINAL_VERSION=$(node -e "console.log(require('./app.json').expo.version)")

# Stage all modified and untracked files
git add -A

if git diff --cached --quiet; then
  echo "  ↳ Working tree clean. Nothing new to commit."
else
  git commit -m "chore(release): prepare release v${FINAL_VERSION}"
  git push origin main
  echo "  ✅ All changes committed and pushed to main."
fi
echo ""

# ── Step 2: Play Store Version Pre-flight Check ───────────
echo "🔍 [2/5] Checking version against Play Store..."
echo "------------------------------------------------"
node "$PROJECT_DIR/scripts/check-play-version.js"
echo ""

# ── Step 3: Prebuild ──────────────────────────────────────
echo "📦 [3/5] Running Expo Prebuild (clean)..."
echo "------------------------------------------------"
npx expo prebuild --clean --platform android
echo "✅ Prebuild complete."
echo ""

# ── Step 4: Local Build ───────────────────────────────────
echo "🔨 [4/5] Running EAS Local Build (profile: $BUILD_PROFILE)..."
echo "------------------------------------------------"
eas build --platform android --profile "$BUILD_PROFILE" --local
echo "✅ Local build complete."
echo ""

# ── Step 5: Find latest .aab & Submit ────────────────────
echo "📤 [5/5] Locating .aab and submitting to Internal Testing..."
echo "------------------------------------------------"

LATEST_AAB=$(find "$PROJECT_DIR" -maxdepth 1 -name "*.aab" -printf "%T@ %p\n" 2>/dev/null | sort -n | tail -1 | awk '{print $2}')

if [ -z "$LATEST_AAB" ]; then
  echo "❌ No .aab file found in project root: $PROJECT_DIR"
  echo "   Make sure the build succeeded and the .aab is in the project root."
  exit 1
fi

echo "📂 Found: $(basename "$LATEST_AAB")"
echo ""
eas submit --platform android --profile "$SUBMIT_PROFILE" --path "$LATEST_AAB"

# Get the versionCode that was just built
VERSION_CODE=$(node -e "
try {
  const out = require('child_process').execSync('eas build:version:get --platform android --profile production --non-interactive', {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']});
  const match = out.match(/Android\s+versionCode\s*[-:]\s*(\d+)/i) || out.match(/versionCode[:\s\-]+(\d+)/i) || out.match(/\"versionCode\":\s*(\d+)/);
  console.log(match ? match[1] : 'unknown');
} catch (e) {
  console.log('unknown');
}
")

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   ✅  Submitted to Internal Testing!        ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  Version : $FINAL_VERSION"
echo "  Build   : $VERSION_CODE"
echo "  Bundle  : $(basename "$LATEST_AAB")"
echo ""
echo "  Next steps:"
echo "  • Test on internal track devices"
echo "  • Then promote to Production:"
echo "    npm run release:promote"
echo ""