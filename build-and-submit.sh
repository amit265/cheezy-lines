#!/bin/bash

# ============================================================
# build-and-submit.sh
# Expo: Set Version → Git Commit All → Version Check → Prebuild → Build → Submit
# ============================================================

set -e  # Exit immediately on any error

BUILD_PROFILE="${1:-production}"
SUBMIT_PROFILE="internal"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CURRENT_VERSION=$(node -e "console.log(require('./app.json').expo.version)")

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║    🚀 Cheezy Lines — Build & Submit          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  Build profile  : $BUILD_PROFILE"
echo "  Submit track   : Internal / TestFlight"
echo "  Current version: $CURRENT_VERSION"
echo ""

echo "  Select platform to build and submit:"
echo "  1) Android (Local Build)"
echo "  2) iOS (Cloud Build)"
echo "  3) Both (Android Local, iOS Cloud)"
echo -n "  > "
read PLATFORM_CHOICE

case $PLATFORM_CHOICE in
  1) BUILD_ANDROID=true; BUILD_IOS=false ;;
  2) BUILD_ANDROID=false; BUILD_IOS=true ;;
  3) BUILD_ANDROID=true; BUILD_IOS=true ;;
  *) echo "❌ Invalid choice. Exiting."; exit 1 ;;
esac

# ── Step 0: Set Version ───────────────────────────────────
echo ""
echo "🔖 [1/5] Set app version"
echo "------------------------------------------------"
echo "  Current version is: $CURRENT_VERSION"
echo "  Enter new version (or press Enter to keep current):"
echo -n "  > "
read NEW_VERSION

NEW_VERSION=$(echo "$NEW_VERSION" | tr -d '\r\n[:space:]')

if [ -z "$NEW_VERSION" ]; then
  echo "  ↳ Keeping current version: $CURRENT_VERSION"
else
  if [[ ! "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ Invalid version format: \"$NEW_VERSION\""
    exit 1
  fi
  node "$PROJECT_DIR/scripts/set-version.js" "$NEW_VERSION"
  echo "  💡 Don't forget to update \"whatsNew\" in version.json!"
  echo -n "  Press Enter to continue... "
  read CONFIRM
fi
echo ""

# ── Step 1: Commit EVERYTHING to Git ──────────────────────
echo "📝 [2/5] Committing to Git..."
echo "------------------------------------------------"
FINAL_VERSION=$(node -e "console.log(require('./app.json').expo.version)")
git add -A
if git diff --cached --quiet; then
  echo "  ↳ Working tree clean."
else
  git commit -m "chore(release): prepare release v${FINAL_VERSION}"
  git push origin main
  echo "  ✅ Changes committed."
fi
echo ""

# ── Step 2: Pre-flight Check ──────────────────────────────
if [ "$BUILD_ANDROID" = true ]; then
  echo "🔍 [3/5] Checking Android version against Play Store..."
  node "$PROJECT_DIR/scripts/check-play-version.js" || echo "⚠️ Check failed, continuing anyway..."
  echo ""
fi

# ── Step 3: Build ─────────────────────────────────────────
echo "📦 [4/5] Building Apps..."
echo "------------------------------------------------"
if [ "$BUILD_IOS" = true ]; then
  echo "☁️ Running EAS Cloud Build for iOS..."
  eas build --platform ios --profile "$BUILD_PROFILE" --non-interactive
fi

if [ "$BUILD_ANDROID" = true ]; then
  echo "🔨 Prebuilding Android..."
  npx expo prebuild --clean --platform android
  echo "🔨 Running EAS Local Build for Android..."
  eas build --platform android --profile "$BUILD_PROFILE" --local
fi
echo "✅ Builds complete."
echo ""

# ── Step 4: Submit ────────────────────────────────────────
echo "📤 [5/5] Submitting Apps..."
echo "------------------------------------------------"
if [ "$BUILD_IOS" = true ]; then
  echo "🍎 Submitting latest iOS build to TestFlight..."
  eas submit --platform ios --profile "$SUBMIT_PROFILE" --latest
fi

if [ "$BUILD_ANDROID" = true ]; then
  LATEST_AAB=$(find "$PROJECT_DIR" -maxdepth 1 -name "*.aab" -printf "%T@ %p\n" 2>/dev/null | sort -n | tail -1 | awk '{print $2}')
  if [ -z "$LATEST_AAB" ]; then
    echo "❌ No .aab file found!"
  else
    echo "📂 Submitting Android: $(basename "$LATEST_AAB")"
    eas submit --platform android --profile "$SUBMIT_PROFILE" --path "$LATEST_AAB"
  fi
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   ✅  Deployments Finished!                 ║"
echo "╚══════════════════════════════════════════════╝"
echo ""