#!/usr/bin/env node

/**
 * set-version.js
 *
 * Single source of truth for the app version.
 * Updates app.json, package.json, and version.json in one command.
 *
 * Usage:
 *   node scripts/set-version.js 2.1.0
 *   npm run version 2.1.0
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
// Trim whitespace and carriage returns
const rawVersion = process.argv[2];
const newVersion = rawVersion ? rawVersion.trim() : "";

// ── Validate ──────────────────────────────────────────────
if (!newVersion) {
  console.error("❌ No version provided.");
  console.error("   Usage: npm run version 2.1.0");
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error(`❌ Invalid version format: "${newVersion}"`);
  console.error("   Must be semver: MAJOR.MINOR.PATCH  e.g. 2.1.0");
  process.exit(1);
}

// ── Helper ────────────────────────────────────────────────
function updateJSON(filePath, updater) {
  const abs = path.join(ROOT, filePath);
  const content = JSON.parse(fs.readFileSync(abs, "utf8"));
  updater(content);
  fs.writeFileSync(abs, JSON.stringify(content, null, 2) + "\n");
}

function readVersion(filePath, getter) {
  const abs = path.join(ROOT, filePath);
  const content = JSON.parse(fs.readFileSync(abs, "utf8"));
  return getter(content);
}

// ── Read current versions ─────────────────────────────────
const oldAppVersion = readVersion("app.json", (c) => c.expo.version);
const oldPkgVersion = readVersion("package.json", (c) => c.version);
const oldReleaseVersion = readVersion("version.json", (c) => c.latestVersion);

console.log("\n╔══════════════════════════════════════════════╗");
console.log("║        🔖 Set App Version                   ║");
console.log("╚══════════════════════════════════════════════╝\n");
console.log(`  ${oldAppVersion.padEnd(10)} →  ${newVersion}\n`);

// ── Update files ──────────────────────────────────────────
updateJSON("app.json", (c) => {
  c.expo.version = newVersion;
});
console.log(`  ✅ app.json          ${oldAppVersion} → ${newVersion}`);

updateJSON("package.json", (c) => {
  c.version = newVersion;
});
console.log(`  ✅ package.json      ${oldPkgVersion} → ${newVersion}`);

updateJSON("version.json", (c) => {
  c.latestVersion = newVersion;
});
console.log(`  ✅ version.json      ${oldReleaseVersion} → ${newVersion}`);

console.log(`\n  💡 Don't forget to update "whatsNew" in version.json!\n`);