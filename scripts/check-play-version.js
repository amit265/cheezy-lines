#!/usr/bin/env node

/**
 * check-play-version.js
 *
 * Pre-flight version check before a local EAS build.
 *
 * Since appVersionSource is "remote" with autoIncrement:true, EAS manages
 * the versionCode on its own servers. This script:
 *
 *   1. Asks EAS: "what is the current remote versionCode?"
 *   2. Calculates the NEXT versionCode (current + 1, since autoIncrement
 *      bumps it before each build)
 *   3. Queries the Play Store API for the highest versionCode across all
 *      tracks (internal, alpha, beta, production)
 *   4. Fails if Play Store's max >= the next EAS versionCode
 *      (means a manual Play Console upload bypassed EAS and jumped the
 *      counter ahead — EAS's next build would conflict)
 *
 * Uses only Node.js built-in modules (no extra packages required).
 */

const https = require("https");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ── Paths ─────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "..");
const APP_JSON = JSON.parse(fs.readFileSync(path.join(ROOT, "app.json"), "utf8"));
const KEY_PATH = path.join(ROOT, "google-services-key.json");

const PACKAGE_NAME = APP_JSON.expo.android.package;
const LOCAL_VERSION = APP_JSON.expo.version;
const TRACKS = ["internal", "alpha", "beta", "production"];

// Suggest next patch version: "2.0.0" → "2.0.1"
function bumpPatch(version) {
  const parts = version.split(".").map(Number);
  parts[2] = (parts[2] || 0) + 1;
  return parts.join(".");
}

// ── Get EAS remote versionCode ────────────────────────────
function getEASVersionCode(profile = "production") {
  try {
    console.log(`\n📡 Fetching EAS remote versionCode (profile: ${profile})...`);
    const raw = execSync(
      `eas build:version:get --platform android --profile ${profile} --non-interactive`,
      { cwd: ROOT, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    );

    // 1. Try matching "Android versionCode - 41" or "Android versionCode: 41"
    const androidMatch = raw.match(/Android\s+versionCode\s*[-:]\s*(\d+)/i);
    if (androidMatch) {
      return parseInt(androidMatch[1], 10);
    }

    // 2. Try matching standard key-value "versionCode: 41" or "versionCode - 41"
    const lineMatch = raw.match(/versionCode\s*[:\-]\s*(\d+)/i);
    if (lineMatch) {
      return parseInt(lineMatch[1], 10);
    }

    // 3. Try parsing structured JSON
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.versionCode !== undefined) {
          return parseInt(parsed.versionCode, 10);
        }
      } catch (_) {}
    }

    throw new Error("Could not parse versionCode from EAS output:\n" + raw);
  } catch (e) {
    console.error("❌ Failed to get EAS version:", e.message);
    process.exit(1);
  }
}

// ── JWT creation (RS256) ──────────────────────────────────
function createJWT(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  })).toString("base64url");
  const signing = `${header}.${payload}`;
  const sig = crypto.createSign("RSA-SHA256").update(signing).sign(key.private_key, "base64url");
  return `${signing}.${sig}`;
}

// ── HTTP helper ───────────────────────────────────────────
function request(method, url, token, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const bodyStr = body != null
      ? (typeof body === "string" ? body : JSON.stringify(body))
      : "";
    const isForm = typeof body === "string";

    const headers = {
      "Content-Type": isForm ? "application/x-www-form-urlencoded" : "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (bodyStr) headers["Content-Length"] = Buffer.byteLength(bodyStr);

    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method, headers },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      }
    );
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   🔍 Play Store Version Pre-flight Check    ║");
  console.log("╚══════════════════════════════════════════════╝\n");
  console.log(`📦 Package : ${PACKAGE_NAME}`);
  console.log(`🏷️  Version : ${LOCAL_VERSION}`);

  // 1. Get EAS remote versionCode and calculate next
  const currentEASVersionCode = getEASVersionCode("production");
  const nextVersionCode = currentEASVersionCode + 1;
  console.log(`✅ EAS remote versionCode   : ${currentEASVersionCode}`);
  console.log(`⏭️  Next build versionCode   : ${nextVersionCode} (autoIncrement +1)`);

  // 2. Load service account key
  if (!fs.existsSync(KEY_PATH)) {
    console.error("\n❌ google-services-key.json not found in project root.");
    console.error("   Cannot check Play Store. Proceeding without Play Store check.\n");
    console.log("✅ EAS version check passed. Safe to build.");
    process.exit(0);
  }
  const KEY = JSON.parse(fs.readFileSync(KEY_PATH, "utf8"));

  // 3. Authenticate with Google Play
  console.log("\n🔐 Authenticating with Google Play...");
  const tokenRes = await request(
    "POST",
    "https://oauth2.googleapis.com/token",
    null,
    `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${createJWT(KEY)}`
  );
  if (!tokenRes.body?.access_token) {
    console.error("❌ Authentication failed:", JSON.stringify(tokenRes.body, null, 2));
    process.exit(1);
  }
  const token = tokenRes.body.access_token;
  console.log("✅ Authenticated.");

  // 4. Create temporary edit to read tracks
  console.log("\n📂 Creating temporary Play Store edit...");
  const editRes = await request(
    "POST",
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/edits`,
    token,
    {}
  );
  if (!editRes.body?.id) {
    console.error("❌ Could not create edit:", JSON.stringify(editRes.body, null, 2));
    console.error(`\n   👉 Fix: run  eas build:version:set --platform android --profile production`);
    console.error(`          and enter ${maxPlayVersionCode} when prompted (next build will be ${maxPlayVersionCode + 1})\n`);
    process.exit(1);
  }
  const editId = editRes.body.id;

  // 5. Query all tracks
  console.log("\n📊 Checking Play Store tracks...\n");
  let maxPlayVersionCode = 0;
  let maxTrack = "none";
  let productionVersionName = null;

  for (const track of TRACKS) {
    const res = await request(
      "GET",
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/edits/${editId}/tracks/${track}`,
      token
    );
    if (res.status === 200 && res.body?.releases?.length > 0) {
      const codes = res.body.releases.flatMap((r) => r.versionCodes || []).map(Number);
      const trackMax = Math.max(...codes);
      const statuses = res.body.releases.map((r) => r.status).join(", ");
      if (track === "production") {
        const completedRelease = res.body.releases.find((r) => r.status === "completed") || res.body.releases[0];
        productionVersionName = completedRelease?.name || null;
      }
      console.log(`  ✅ ${track.padEnd(12)} → versionCode: ${trackMax}  [${statuses}]`);
      if (trackMax > maxPlayVersionCode) {
        maxPlayVersionCode = trackMax;
        maxTrack = track;
      }
    } else if (res.status === 404) {
      console.log(`  ⬜ ${track.padEnd(12)} → no releases`);
    } else {
      console.log(`  ⚠️  ${track.padEnd(12)} → skipped (status ${res.status})`);
    }
  }

  // Cleanup edit
  await request(
    "DELETE",
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/edits/${editId}`,
    token
  );
  console.log("\n🧹 Temporary edit cleaned up.");

  // 6. versionCode conflict check
  console.log("\n══════════════════════════════════════════════");
  console.log(`  Play Store highest versionCode : ${maxPlayVersionCode} (track: ${maxTrack})`);
  console.log(`  EAS next build versionCode     : ${nextVersionCode}`);
  console.log(`  Local version string           : ${LOCAL_VERSION}`);
  console.log(`  Production version string      : ${productionVersionName || "(none yet)"}`);
  console.log("══════════════════════════════════════════════\n");

  if (nextVersionCode <= maxPlayVersionCode) {
    console.error("❌  VERSION CONFLICT DETECTED — Build aborted!\n");
    console.error(`   Play Store has versionCode ${maxPlayVersionCode} on "${maxTrack}" track.`);
    console.error(`   EAS will build with versionCode ${nextVersionCode} — this will FAIL on upload.\n`);
    console.error("   ⚠️  This means a build was manually uploaded to Play Console,");
    console.error(`   bypassing EAS and jumping the counter ahead.`);
    console.error(`\n   👉 Fix: run  eas build:version:set --platform android --version-code ${maxPlayVersionCode + 1}`);
    console.error(`          to sync EAS remote counter to ${maxPlayVersionCode + 1}\n`);
    process.exit(1);
  }

  // 7. Version string warning (non-blocking)
  if (productionVersionName && LOCAL_VERSION === productionVersionName) {
    console.log("⚠️   VERSION STRING WARNING (not a blocker):");
    console.log(`    Your local version "${LOCAL_VERSION}" is the same as what's already`);
    console.log(`    on the Production track.`);
    console.log(`    ✅ This is fine for a bug-fix build (only versionCode changes).`);
    console.log(`    💡 If this is a new feature release, bump "version" in app.json first.`);
    console.log(`       e.g.  "${LOCAL_VERSION}"  →  "${bumpPatch(LOCAL_VERSION)}"\n`);
  }

  console.log(`✅ Version check passed! EAS next versionCode (${nextVersionCode}) > Play Store max (${maxPlayVersionCode})`);
  console.log("   Safe to build.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Unexpected error:", err.message);
  process.exit(1);
});