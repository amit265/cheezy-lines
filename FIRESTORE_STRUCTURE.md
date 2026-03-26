# 🌍 DestyaStudio Global System (Complete Guide)

This is your **single source of truth** for managing:

* 📱 Multiple mobile apps
* 🌐 Website (Next.js)

Everything is controlled via **Firebase (global project)**.

---

# 🧠 CORE IDEA

You are NOT building multiple apps.

👉 You are building:

**One platform (Firebase) + multiple clients (apps + website)**

---

# 🏗️ GLOBAL FIRESTORE STRUCTURE

```
/global
  /config
  /apps
  /about
  /announcements
  /banners
```

---

# 🧩 1. GLOBAL CONFIG (`/global/config/main`)

## Purpose

Central brand + system config used across ALL apps

## Schema

```json
{
  "developerName": "destya studio",
  "brandName": "destyastudio",

  "email": "hello@destyastudio.com",
  "website": "https://destyastudio.com",

  "assetsBaseUrl": "https://destyastudio.com/apps",

  "icon": {
    "type": "static",
    "path": "logo.png"
  },

  "header_image": {
    "type": "static",
    "path": "header_image.png"
  },

  "support": {
    "email": "hello@destyastudio.com"
  },

  "legal": {
    "privacyBaseUrl": "https://destyastudio.com/apps",
    "termsBaseUrl": "https://destyastudio.com/apps"
  },

  "features": {
    "showMoreApps": true,
    "showAbout": true,
    "showSocialLinks": true
  },

  "configVersion": 1
}
```

---

# 📱 2. APPS REGISTRY (`/global/apps`)

Each document = one app

## Schema

```json
{
  "slug": "spin-the-wheel",
  "title": "Spin the Wheel : Pick for me",
  "shortDescription": "Spin the wheel to decide fun topics, games, meals, or challenges!",
  "category": "Entertainment",

  "icon": {
    "type": "static",
    "path": "icon.png"
  },

  "playStoreLink": "https://play.google.com/store/apps/details?id=...",
  "appStoreLink": "https://apps.apple.com/...",

  "platforms": {
    "android": true,
    "ios": true
  },

  "tags": ["fun", "games"],
  "recommendedIn": ["question-games"],

  "priority": 1,
  "active": true,

  "createdAt": "2025-01-10",

  "legal": {
    "hasCustomPrivacy": false
  }
}
```

---

# 🖼️ ICON SYSTEM

## Folder

```
/public/apps/{slug}/icon.png
```

## URL

```
https://destyastudio.com/apps/{slug}/icon.png
```

## Build in App

```
iconUrl = assetsBaseUrl + "/" + slug + "/" + icon.path
```

---

# 📄 3. ABOUT SECTION (`/global/about/main`)

## Schema

```json
{
  "tagline": "Small by design.",
  "title": "Destya Studio",

  "highlight": "We build for clarity, not complexity.",

  "sections": [
    {
      "type": "paragraph",
      "content": "Destya Studio is an independent lab focused on building products that feel clear, calm, and well-crafted."
    },
    {
      "type": "paragraph",
      "content": "Destya Studio began as a desire to escape the 'noise' of modern tech."
    }
  ],

  "updatedAt": "2025-01-10"
}
```

## Usage

* About screen
* Website About page

---

# ⚡ 4. POWERED BY (SPLASH SCREEN)

## Purpose

Show brand identity subtly in every app

## Config (from global config)

```json
{
  "brandName": "destyastudio",
  "icon": {
    "path": "logo.png"
  }
}
```

## UI Idea

Splash screen bottom section:

```
Powered by
Destya Studio
```

## Logo URL

```
https://destyastudio.com/apps/logo.png
```

---

# 📢 5. ANNOUNCEMENTS (`/global/announcements`)

## Schema

```json
{
  "title": "New App Launched 🚀",
  "message": "Try our latest app now!",
  "type": "promo",
  "active": true,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

## Usage

* Show popup
* Show banner inside app

## Logic

* Show only if `active === true`
* Check date range

---

# 🎯 6. BANNERS (`/global/banners`)

## Schema

```json
{
  "title": "Try this app",
  "imageUrl": "https://...",
  "redirectType": "app",
  "redirectTarget": "spin-the-wheel",
  "active": true,
  "priority": 1
}
```

## Redirect Types

* `app` → open app store
* `external` → open URL
* `none` → just display

---

# ⚙️ APP INTEGRATION FLOW

## On App Start

Fetch:

* `/global/config`
* `/global/apps`

Cache locally.

---

## More Apps

* filter: active
* sort: priority

---

## About

* render `/global/about`

---

## Privacy URL

```
privacyUrl = privacyBaseUrl + "/" + slug + "/privacy"
```

---

# 🔐 FIREBASE RULES

* Allow READ → public
* Allow WRITE → admin only

---

# ⚠️ RULES TO FOLLOW

* ❌ No hardcoding

* ❌ No duplication

* ❌ No `_next/image` URLs

* ✅ Use slug-based system

* ✅ Use global config

* ✅ Cache data

---

# 🚀 WHAT YOU BUILT

* Centralized ecosystem
* Scalable architecture
* Cross-app growth system

---

# 🧠 FINAL NOTE

You are no longer just building apps.

👉 You are building a **platform.**

---

**End of Guide 🚀**
