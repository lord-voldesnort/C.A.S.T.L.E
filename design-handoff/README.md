# Google Stitch Design Handoff Guide — Castle

This package contains the complete UI/UX audit, screen inventory, architecture source map, genuine high-resolution screenshots, and design improvement brief for **Castle** (`cybersecurity-toolkit`).

Follow this guide to input this package into **Google Stitch** to redesign the application.

---

## 1. Quick Start: Google Stitch Input Workflow

```
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Paste Master Specification                                    │
│ Copy the entire text of:                                               │
│ └── design-handoff/DESIGN.md                                           │
│ And paste it directly into Google Stitch's "Paste an existing          │
│ DESIGN.md" field.                                                      │
├────────────────────────────────────────────────────────────────────────┤
│ STEP 2: Paste Additional Instructions                                  │
│ Copy the text from:                                                    │
│ └── design-handoff/STITCH_ADDITIONAL_INSTRUCTIONS_DRAFT.md             │
│ And paste it into Google Stitch's "Additional instructions" prompt.    │
├────────────────────────────────────────────────────────────────────────┤
│ STEP 3: Upload Supporting Files (Prioritized Batch)                    │
│ Upload the high-priority screenshots and documentation files from:     │
│ └── design-handoff/screenshots/                                       │
│ └── design-handoff/SCREEN_INVENTORY.md                                 │
│ └── design-handoff/DESIGN_IMPROVEMENT_BRIEF.md                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Supporting Files Upload Priority & Strategy

Google Stitch (and associated multimodal LLM context windows) works most effectively when provided with a curated, high-signal set of visual and structural references. Uploading hundreds of files at once can dilute context.

Use this prioritized 3-tier sequence:

### Tier 1: Essential Uploads (Upload First — Highest Signal)
These files establish the visual baseline and explain the exact functionality of every screen:

1. **Desktop & Mobile Landing Dashboard**:
   - `screenshots/00-homepage-desktop.png` (Core desktop layout, Three.js 3D keep, search, 5 cards)
   - `screenshots/00-homepage-mobile.png` (Mobile responsive layout)
2. **Tool Baseline & Result Screenshots (1 per tool + result states)**:
   - `screenshots/01-password-result.png` (Password tool: Dual meters, presets, output)
   - `screenshots/01-password-analysis.png` (Password tool: Real-time flaw audit & recommendations)
   - `screenshots/02-hash-learn.png` (Hash Toolkit: Live avalanche effect demonstration)
   - `screenshots/02-hash-result.png` (Hash Toolkit: Multi-digest generation cards)
   - `screenshots/03-aes-learn.png` (AES Studio: ECB vs GCM canvas demo & round visualizer)
   - `screenshots/03-aes-result.png` (AES Studio: Protected `.castle` ciphertext envelope & bridges)
   - `screenshots/04-jwt-learn.png` (JWT Decoder: 3-part interactive token anatomy & tampering lab)
   - `screenshots/04-jwt-result.png` (JWT Decoder: Verified HS256 signature & token status panel)
   - `screenshots/05-url-learn.png` (URL Analyzer: URL anatomy & Spot the Difference quiz)
   - `screenshots/05-url-result.png` (URL Analyzer: Heuristic threat score & deceptive flags)
3. **Core Documentation**:
   - `SCREEN_INVENTORY.md` (Tabular index of every UI state and interaction behavior)
   - `DESIGN_IMPROVEMENT_BRIEF.md` (Detailed UX critique and target design directions)

### Tier 2: Secondary / Structural Reference (Upload Next If Capacity Allows)
These files provide deeper context on secondary views, tabs, and component layout:

- `screenshots/01-password-generate.png` (Password generation mode cards)
- `screenshots/01-password-learn.png` (Password "Why this password?" educational accordion)
- `screenshots/02-hash-generate.png` (Hash Toolkit generate tab)
- `screenshots/02-hash-verify.png` (Hash Toolkit verify tab: Mode A & Mode B)
- `screenshots/03-aes-encrypt.png` (AES Studio encrypt configuration)
- `screenshots/03-aes-decrypt.png` (AES Studio decrypt configuration)
- `screenshots/04-jwt-decode-verify.png` (JWT Decoder input and parsed claim trees)
- `screenshots/04-jwt-build.png` (JWT custom token builder)
- `screenshots/05-url-analyze.png` (URL link input and utility)
- `screenshots/05-url-build.png` (Safe phishing URL deception simulator)
- `SOURCE_MAP.md` (Maps screens to implementation code files)

### Tier 3: Mobile Viewports & Asset References (Optional)
Upload these if you want Stitch to specifically refine mobile ergonomics:

- `screenshots/01-password-mobile.png`
- `screenshots/02-hash-mobile.png`
- `screenshots/03-aes-mobile.png`
- `screenshots/04-jwt-mobile.png`
- `screenshots/05-url-mobile.png`
- `assets/castle-original-concept.png` (Original project concept mockup)
- `source/homepage/index.html` (Original HTML template structure)

---

## 3. Directory Structure of the Handoff Package

```text
design-handoff/
├── DESIGN.md                               # Master design specification for Stitch DESIGN.md field
├── README.md                               # This instructional guide
├── SCREEN_INVENTORY.md                     # Complete tabular inventory of 27 screens & UI states
├── SOURCE_MAP.md                           # Source code mapping and security boundaries
├── DESIGN_IMPROVEMENT_BRIEF.md             # Detailed UX critique and redesign recommendations
├── STITCH_ADDITIONAL_INSTRUCTIONS_DRAFT.md # Ready-to-paste draft for Stitch additional instructions
├── screenshots/                            # 27 genuine PNG screenshots captured from live local app
│   ├── 00-homepage-desktop.png
│   ├── 00-homepage-mobile.png
│   ├── 01-password-generate.png
│   ├── 01-password-learn.png
│   ├── 01-password-result.png
│   ├── 01-password-analysis.png
│   ├── 01-password-mobile.png
│   ├── 02-hash-learn.png
│   ├── 02-hash-generate.png
│   ├── 02-hash-result.png
│   ├── 02-hash-verify.png
│   ├── 02-hash-mobile.png
│   ├── 03-aes-learn.png
│   ├── 03-aes-encrypt.png
│   ├── 03-aes-result.png
│   ├── 03-aes-decrypt.png
│   ├── 03-aes-mobile.png
│   ├── 04-jwt-learn.png
│   ├── 04-jwt-decode-verify.png
│   ├── 04-jwt-build.png
│   ├── 04-jwt-result.png
│   ├── 04-jwt-mobile.png
│   ├── 05-url-learn.png
│   ├── 05-url-analyze.png
│   ├── 05-url-result.png
│   ├── 05-url-build.png
│   └── 05-url-mobile.png
├── source/                                 # Organized local copies of relevant source code
│   ├── homepage/                           # index.html, app.js
│   ├── shared/                             # tooltip.js
│   ├── password/                           # 6 password UI and crypto files
│   ├── hash/                               # 7 hash toolkit UI, crypto, and bridge files
│   ├── aes/                                # 7 AES Studio UI, crypto, coach, and learn files
│   ├── jwt/                                # 7 JWT UI, crypto, decode, build, and claims files
│   └── url/                                # 5 URL Phishing heuristics, learn, and UI files
└── assets/                                 # Legacy tokens and concept art references
    ├── castle-original-concept.png
    └── DESIGN-TOKENS-LEGACY.md
```

---

## 4. Key Takeaways for the Redesign

1. **Castle Already Works**: Castle is not a concept or wireframe mockup; it is an existing, functioning client-side cybersecurity toolkit. The redesign must modernize the UI while keeping all existing tools, tabs, and interactive workflows intact.
2. **Never Remove Educational Labs**: The live avalanche demo, ECB canvas visualizer, AES round visualizer, JWT tampering sandbox, and phishing simulator are Castle's core differentiators. Stitch must elevate their visual presentation, not eliminate them.
3. **Preserve Privacy Signage**: The zero-knowledge, local-only browser processing guarantee is a critical product promise. The redesigned layout must feature prominent privacy guarantees across all tools.
