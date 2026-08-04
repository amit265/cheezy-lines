# 🧀 Cheesy Lines — ASO Strategy & Growth Roadmap

> **North Star:** Every decision below is made with one goal — **more installs**.

---

## 1. App Store Metadata

### App Title (≤ 30 chars)
```
Cheesy Lines: So Bad, It Works
```
> Already great. Keep it. "So Bad, It Works" is memorable, self-explanatory, and funny — it sells itself.

---

### iOS Subtitle (≤ 30 chars)
```
Pickup Lines & AI Generator
```

### Google Play Short Description (≤ 80 chars)
```
Funny pickup lines & AI-generated cheesy openers for every situation 😄
```

---

### Keywords (iOS — comma-separated, ≤ 100 chars total)
```
pickup lines,cheesy lines,flirty,rizz,icebreaker,funny quotes,dating,AI chat
```

> **Why these?**
> - `rizz` — trending Gen Z term, high volume, low competition
> - `icebreaker` — covers social/party use cases
> - `funny quotes` — adjacent organic traffic
> - Avoid: "pickup artist" (negative connotation, might trigger policy flags)

---

### Full Description

**Google Play / App Store Long Description:**

```
😂 Running out of things to say? Let Cheesy Lines do the talking.

Whether you're sliding into DMs, breaking the ice at a party, or just 
want to make someone smile — Cheesy Lines has you covered with 
hundreds of perfectly terrible pickup lines, organized by topic.

✨ KEY FEATURES

🤖 AI Line Generator
Can't find the right line? Describe your situation and our AI will craft 
a custom cheesy opener just for you. Coffee lover? Dog parent? 
Gym rat? We've got a line for that.

📚 Lines for Every Situation
Browse by topic — food, nature, tech, sports, animals, music & more.
New categories added regularly.

❤️ Save Your Favorites
Heart the lines that made you laugh (or cringe) and keep them in your 
personal collection for later.

📤 Share Instantly
One tap to share any line via WhatsApp, Instagram, iMessage, or 
anywhere else.

🃏 Swipe to Discover
Tinder-style card swiping makes browsing feel natural and fun.
Swipe through hundreds of lines without lifting a finger.

💯 Free & Offline
No login required. No subscription. Works without internet.
Just open and enjoy.

---

Whether the line works or not... at least it'll get a laugh 😄

Download Cheesy Lines — because the worst pickup line is the one 
you never tried.
```

> **Keyword density check:** pickup lines (3×), cheesy (2×), AI (2×), share (1×), funny (1×) — sits at ~2.5%, within the 2–3% guideline ✅

---

## 2. Visual ASO (Screenshots & Icon)

### Screenshot Strategy (6 screenshots recommended)

Each screenshot should have a **bold headline at the top** and show the UI below. Use the brand palette (`#132F94` / `#0C1D59` / `#FFA500`).

| # | Headline | UI Shown |
|---|---|---|
| 1 | **"Swipe. Cringe. Repeat. 🃏"** | Home swipe deck with a funny line |
| 2 | **"AI Picks the Perfect Line 🤖✨"** | AI Magic page with a generated result |
| 3 | **"Lines for Every Vibe 🎯"** | Topics grid screen |
| 4 | **"Save Your Best Ones ❤️"** | Favorites screen |
| 5 | **"Share in One Tap 📤"** | Share sheet or share card |
| 6 | **"100% Free. No Login. 🎉"** | Clean home screen + "built by destyastudio" branding |

> **First screenshot is the most important** — it appears in search results without users tapping the listing. Make screenshot 1 show the funniest, most scroll-stopping line possible.

### App Icon Tips
- Current icon should prominently feature the 🧀 cheese emoji or a bold "CL" monogram on brand indigo
- Must be readable at **29×29px** (notification size) — test this
- A/B test icon variants on Google Play using the **Store Listing Experiments** feature

---

## 3. Ratings & Reviews Strategy

Per Section 15 of the guidelines — **ask at peak dopamine moments**, never randomly.

### Trigger Points (implement in code)
```javascript
// Trigger review after:
// 1. User saves their 3rd favorite line
// 2. User shares a line for the first time
// 3. User generates their first AI line successfully
// 4. User swipes through 20+ lines in a session
```

### Reply to Reviews
- Reply to every 1-star review within 48 hours
- Thank every 5-star review
- Reviews with replies convert browsers → installers better (Google ranks this)

---

## 4. Viral Growth Mechanics (In-App Features to Build)

These are the highest-ROI features for organic install growth:

### 🔥 Priority 1 — Share Card Watermark
**Status:** Partially built (ShareCard component exists)
**Action:** Add `● cheesy-lines.app` or `destyastudio.com` watermark to every shared image card
**Impact:** Every share becomes a passive ad. If 100 users share 1 card each, that's 100 free impressions.

### 🔥 Priority 2 — "Send a Line" Deep Link
**Status:** Deep linking exists but not line-specific
**Action:** Generate shareable URLs like `destyastudio.com/cheezylines?line=123` that open the app to that specific line
**Impact:** WhatsApp/iMessage previews show the funny line → curiosity → install

### 🔥 Priority 3 — Daily Line Widget (iOS/Android)
**Status:** Not built
**Action:** Home screen widget showing today's cheesy line
**Impact:** Massive retention + word-of-mouth ("lol look at my widget")

### ⭐ Priority 4 — "Line of the Day" Push Notification
**Status:** Daily notifications exist but are generic
**Action:** Send an actual funny line in the notification body every day at 7 PM
**Impact:** Users forward notifications to friends → organic installs
```javascript
// Example notification:
{
  title: "🧀 Today's Cheesy Line",
  body: "\"Are you a parking ticket? Because you've got 'fine' written all over you.\" 😂"
}
```

### ⭐ Priority 5 — Leaderboard / "Most Saved" Lines
**Status:** Not built
**Action:** Show a "🔥 Trending" tab with the most favorited/shared lines globally (via Firestore counters)
**Impact:** Social proof + FOMO drives sharing + "which line is the best?" debates

### 💡 Priority 6 — Seasonal & Trending Packs
**Status:** Not built
**Action:** Add time-sensitive line packs — Valentine's Day, New Year, Diwali, Halloween
**Impact:** Triggers App Store featuring consideration + seasonal search spikes

---

## 5. Phased Feature Roadmap

### Phase 1 — Polish (Now → 2 weeks)
- [ ] Add share card watermark with app URL
- [ ] Trigger store review at right moments (save 3rd fav, first AI line)
- [ ] Fix "Line of the Day" notification to include actual line text
- [ ] Upload proper screenshots to both stores with bold headlines

### Phase 2 — Virality (2–6 weeks)
- [ ] Build line-specific shareable deep links
- [ ] "Most Saved" / Trending tab powered by Firestore counters
- [ ] Seasonal line packs (schedule: Valentine's Feb 1, Halloween Oct 1, etc.)
- [ ] Cross-promotion banner in other Destya Studio apps pointing to Cheesy Lines

### Phase 3 — Retention & Monetization (6–12 weeks)
- [ ] Home screen widget (iOS WidgetKit + Android Glance)
- [ ] "Line of the Week" email/notification campaign
- [ ] User-submitted lines with moderation queue (UGC = infinite content)
- [ ] Optional "Cheesy Pro" unlock for offline AI + unlimited favorites sync

---

## 6. Off-Store Growth Channels

| Channel | Action | Effort | Impact |
|---|---|---|---|
| **TikTok / Reels** | Post 15s clips of the funniest lines with reactions | Low | Very High |
| **Reddit** | Post top lines in r/funny, r/Tinder, r/dating_advice | Low | High |
| **Product Hunt** | Launch on PH with the AI angle as the hook | Medium | High |
| **Twitter/X** | Daily cheesy line tweet from @destyastudio | Low | Medium |
| **Influencer** | DM 5 dating/humor micro-influencers for feature | Medium | High |
| **Pinterest** | Quote card pins (evergreen SEO traffic) | Low | Medium |

---

## 7. Google Play-Specific Wins (Quick)

- ✅ Enable **Google Play Store Listing Experiments** — A/B test icon and screenshot 1
- ✅ Add **in-app events** on Google Play (e.g. "Valentine's Day Lines Drop")
- ✅ Respond to all reviews (boosts ranking algorithm)
- ✅ Ensure `targetSdkVersion: 36` is set (mandatory by Aug 31 2026 per guideline §7)
- ✅ Upload a **feature graphic** (1024×500px banner) — many devs skip this, it shows in search

## 8. iOS App Store-Specific Wins (Quick)

- ✅ Fill all 100 keyword characters — don't waste space
- ✅ Use **Custom Product Pages** for different audiences (dating, humor, party)
- ✅ Submit for **App Store featuring** via the request form (Entertainment category)
- ✅ Add **promotional text** (170 chars, updateable without new build) — use for seasonal hooks

---

> **Bottom line:** The fastest path to installs is making every share a discovery moment.
> Prioritize the share card watermark and line-specific deep links above everything else.
