#!/usr/bin/env node

/**
 * promote-to-production.js
 *
 * Promotes the latest release from the Play Store Internal Testing track
 * to the Production track — without needing to rebuild or re-upload anything.
 *
 * Flow:
 *   1. Auth with Google Play API
 *   2. Fetch current internal track release (latest completed/draft)
 *   3. Create a production track release with the same versionCodes
 *   4. Commit the edit
 *
 * Usage:
 *   node scripts/promote-to-production.js              → 100% rollout
 *   node scripts/promote-to-production.js 10           → 10% staged rollout
 *
 * Uses only Node.js built-in modules — no extra packages required.
 */

const https = require("https");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");

// ── Paths ─────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "..");
const APP_JSON = JSON.parse(
  fs.readFileSync(path.join(ROOT, "app.json"), "utf8"),
);
const KEY = JSON.parse(
  fs.readFileSync(path.join(ROOT, "google-services-key.json"), "utf8"),
);

const PACKAGE_NAME = APP_JSON.expo.android.package;
const LOCAL_VERSION = APP_JSON.expo.version;
const LOCAL_VERSION_CODE = APP_JSON.expo.android.versionCode;

// Rollout percentage (0–100). Pass as first arg, default 100
const ROLLOUT_ARG = parseInt(process.argv[2], 10);
const ROLLOUT_PERCENT =
  !isNaN(ROLLOUT_ARG) && ROLLOUT_ARG > 0 && ROLLOUT_ARG <= 100
    ? ROLLOUT_ARG
    : 100;
const USER_FRACTION = ROLLOUT_PERCENT / 100;

// ── JWT creation (RS256) ──────────────────────────────────
function createJWT() {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: KEY.client_email,
      scope: "https://www.googleapis.com/auth/androidpublisher",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  ).toString("base64url");
  const signing = `${header}.${payload}`;
  const sig = crypto
    .createSign("RSA-SHA256")
    .update(signing)
    .sign(KEY.private_key, "base64url");
  return `${signing}.${sig}`;
}

// ── HTTP helpers ──────────────────────────────────────────
function request(method, url, token, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const bodyStr =
      body != null
        ? typeof body === "string"
          ? body
          : JSON.stringify(body)
        : "";
    const isForm = typeof body === "string";

    const headers = {
      "Content-Type": isForm
        ? "application/x-www-form-urlencoded"
        : "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (bodyStr) headers["Content-Length"] = Buffer.byteLength(bodyStr);

    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method, headers },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      },
    );
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ── Confirm prompt ────────────────────────────────────────
function confirm(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   🚀 Promote Internal → Production          ║");
  console.log("╚══════════════════════════════════════════════╝\n");
  console.log(`📦 Package  : ${PACKAGE_NAME}`);
  console.log(
    `🏷️  Version  : ${LOCAL_VERSION} (versionCode: ${LOCAL_VERSION_CODE})`,
  );
  console.log(`📊 Rollout  : ${ROLLOUT_PERCENT}%`);

  // 1. Authenticate
  console.log("\n🔐 Authenticating with Google Play...");
  const tokenRes = await request(
    "POST",
    "https://oauth2.googleapis.com/token",
    null,
    `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${createJWT()}`,
  );
  if (!tokenRes.body?.access_token) {
    console.error(
      "❌ Authentication failed:",
      JSON.stringify(tokenRes.body, null, 2),
    );
    process.exit(1);
  }
  const token = tokenRes.body.access_token;
  console.log("✅ Authenticated.");

  // 2. Create edit
  console.log("\n📂 Creating Play Store edit...");
  const editRes = await request(
    "POST",
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/edits`,
    token,
    {},
  );
  if (!editRes.body?.id) {
    console.error(
      "❌ Could not create edit:",
      JSON.stringify(editRes.body, null, 2),
    );
    process.exit(1);
  }
  const editId = editRes.body.id;

  // Helper to abort edit on error
  async function abortEdit(reason) {
    console.error(`\n❌ ${reason}`);
    await request(
      "DELETE",
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/edits/${editId}`,
      token,
    );
    console.log("🧹 Edit rolled back.");
    process.exit(1);
  }

  // 3. Get internal track
  console.log("\n📊 Fetching Internal Testing track...");
  const internalRes = await request(
    "GET",
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/edits/${editId}/tracks/internal`,
    token,
  );

  if (internalRes.status !== 200 || !internalRes.body?.releases?.length) {
    await abortEdit(
      "No releases found on Internal Testing track. Nothing to promote.",
    );
  }

  // Find the most recent completed or draft release
  const releases = internalRes.body.releases;
  const latestRelease =
    releases.find((r) => r.status === "completed") || releases[0];
  const versionCodes = latestRelease.versionCodes || [];
  const releaseNotes = latestRelease.releaseNotes || [];

  if (!versionCodes.length) {
    await abortEdit("Internal track release has no versionCodes.");
  }

  console.log(`\n  Internal track release:`);
  console.log(`  • versionCodes : ${versionCodes.join(", ")}`);
  console.log(`  • status       : ${latestRelease.status}`);
  if (latestRelease.name)
    console.log(`  • name         : ${latestRelease.name}`);

  // 4. Check current production versionCode
  console.log("\n📊 Fetching current Production track...");
  const prodRes = await request(
    "GET",
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/edits/${editId}/tracks/production`,
    token,
  );

  let currentProdVersionCode = 0;
  if (prodRes.status === 200 && prodRes.body?.releases?.length) {
    const codes = prodRes.body.releases
      .flatMap((r) => r.versionCodes || [])
      .map(Number);
    currentProdVersionCode = Math.max(...codes);
    console.log(`  Current production versionCode: ${currentProdVersionCode}`);
  } else {
    console.log("  No current production release found.");
  }

  const promotingVersionCode = Math.max(...versionCodes.map(Number));
  if (promotingVersionCode <= currentProdVersionCode) {
    await abortEdit(
      `versionCode ${promotingVersionCode} is already on production (or older). Nothing to promote.`,
    );
  }

  // 5. Confirm with user
  console.log("");
  console.log("══════════════════════════════════════════════");
  console.log(`  Promoting versionCode ${promotingVersionCode} to Production`);
  console.log(`  Rollout: ${ROLLOUT_PERCENT}%`);
  console.log("══════════════════════════════════════════════");
  const ok = await confirm("\n❓ Proceed with promotion? (y/N): ");
  if (!ok) {
    await request(
      "DELETE",
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/edits/${editId}`,
      token,
    );
    console.log("\n⏭️  Cancelled. Edit cleaned up.");
    process.exit(0);
  }

  // 6. Update production track
  console.log("\n📤 Setting Production track release...");
  const productionRelease = {
    versionCodes,
    releaseNotes,
    status: ROLLOUT_PERCENT === 100 ? "completed" : "inProgress",
    ...(ROLLOUT_PERCENT < 100 ? { userFraction: USER_FRACTION } : {}),
  };

  const putRes = await request(
    "PUT",
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/edits/${editId}/tracks/production`,
    token,
    { releases: [productionRelease] },
  );

  if (putRes.status !== 200) {
    await abortEdit(
      `Failed to update production track: ${JSON.stringify(putRes.body)}`,
    );
  }
  console.log("✅ Production track updated.");

  // 7. Commit the edit
  console.log("\n💾 Committing edit to Play Store...");
  const commitRes = await request(
    "POST",
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/edits/${editId}:commit`,
    token,
    {},
  );

  if (commitRes.status !== 200) {
    console.error("❌ Commit failed:", JSON.stringify(commitRes.body, null, 2));
    process.exit(1);
  }

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   🎉 Promoted to Production Successfully!   ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log(`\n  versionCode : ${versionCodes.join(", ")}`);
  console.log(`  Rollout     : ${ROLLOUT_PERCENT}%`);
  console.log(`  Track       : production\n`);

  // 8. Commit to Git
  console.log("📝 Committing promotion to Git...");
  const commitMsg = `chore(release): promote v${LOCAL_VERSION} (build ${versionCodes.join(", ")}) to production`;
  try {
    execSync(`git commit --allow-empty -m "${commitMsg}"`, {
      cwd: ROOT,
      stdio: "inherit",
    });
    execSync(`git push origin main`, { cwd: ROOT, stdio: "inherit" });
    console.log(`✅ Pushed to repository: ${commitMsg}\n`);
  } catch (e) {
    console.error(
      "⚠️  Failed to commit/push to Git, but promotion succeeded.",
      e.message,
    );
  }
}

main().catch((err) => {
  console.error("\n❌ Unexpected error:", err.message);
  process.exit(1);
});
