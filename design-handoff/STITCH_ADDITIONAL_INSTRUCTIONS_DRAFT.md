# Google Stitch "Additional Instructions" Draft

Copy and paste the text block below into the **"Additional instructions"** field in Google Stitch when starting your redesign project:

```markdown
# REDESIGN DIRECTIVE: CASTLE CYBERSECURITY TOOLBOX

## 1. Ground Rules & Scope
- Castle already exists as a fully functioning client-side cybersecurity learning and analysis web application. 
- You are REDESIGNING the existing product, NOT inventing a new or unrelated cybersecurity dashboard.
- Preserve all 5 implemented tools, their exact workspace tabs, and their functional workflows:
  1. Password (Tab 1: Create Password with 6 generation modes; Tab 2: Analyze Password with real-time audit & dual meters).
  2. Hash Toolkit (Tab 1: Learn with live avalanche demo; Tab 2: Generate with Text/File multi-hash; Tab 3: Verify with Mode A & Mode B).
  3. AES Studio (Tab 1: Learn with ECB vs GCM canvas & 14-round visualizer; Tab 2: Encrypt with PBKDF2/random key; Tab 3: Decrypt with Hash bridge).
  4. JWT Decoder & Verifier (Tab 1: Learn with 3-part interactive token anatomy; Tab 2: Decode & Verify with status checklist; Tab 3: Build & Sign).
  5. URL Structure Analyzer (Tab 1: Learn with URL anatomy & Spot the Difference quiz; Tab 2: Analyze heuristics; Tab 3: Safe phishing deception builder).

## 2. Core Visual & Design Requirements
- Design a cohesive, modern, and premium dark-mode aesthetic (e.g. sleek cyber-defense / aerospace tactical UI with refined amber/gold or cyan accents, high-contrast typography, and subtle glowing border states).
- Maintain rigorous visual consistency across all five tools: use uniform card border treatments, tab buttons, input containers, progress bars, and status badges.
- Replace cramped popup modal windows with expansive, dedicated workspace canvases or clean split-panel layouts that eliminate excessive inner vertical scrolling.
- Prioritize clear visual separation between:
  - Input configuration (left or top).
  - Processing / telemetry indicators (center).
  - Cryptographic output & verification results (right or bottom).

## 3. Educational Priority
- Castle's primary differentiator is its interactive "Learn" engine. Do not treat educational sections as an afterthought or remove them.
- Prominently feature and modernize:
  - The live Avalanche Effect sandbox in Hash Toolkit.
  - The ECB pattern leak vs. GCM randomized noise canvas in AES Studio.
  - The 14-round AES internal state matrix step-by-step visualizer.
  - The color-coded 3-segment Token Anatomy and live tampering lab in JWT Decoder.
  - The visual URL structural decomposition and "Spot the Difference" domain quiz in URL Analyzer.

## 4. Integrity, Authenticity & Feasibility
- Do NOT invent fictional security capabilities (e.g. do not pretend live IP blacklist lookups, AI neural firewalls, or dark-web leak monitoring exist). Castle performs local, offline, deterministic analysis.
- Keep all security warnings, verification badges, and error states unambiguous:
  - Bright emerald green for verified tokens, matching checksums, and fortress-grade entropy.
  - High-visibility amber/yellow for warnings (unverified tokens, legacy MD5/SHA-1 algorithms, suspicious URL subdomains).
  - Clear crimson/red for critical failures (tampered tokens, mismatched file hashes, critical password flaws).
- Prominently display the zero-knowledge privacy guarantee on every tool ("100% Client-Side WebCrypto // Zero Server Storage").
- Ensure all layouts are fully responsive, elegant on desktop (1440px), and touch-friendly on mobile (390px).
- Deliver a clean, implementable design system feasible to translate directly into HTML5, modern CSS, and vanilla JavaScript.
```
