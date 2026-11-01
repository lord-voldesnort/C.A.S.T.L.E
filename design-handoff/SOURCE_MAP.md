# Castle Source Code & Architecture Map

This document maps all user interface components, workspace dialogs, educational visualizers, and cryptographic logic to their exact implementation files in the repository.

It is structured to help frontend designers and software engineers understand:
1. Which files control **Presentation & Styling** (safe to redesign/restructure).
2. Which files control **UI Interaction & State Binding** (require updating event handlers to match new markup).
3. Which files contain **Security-Critical Cryptographic & Heuristic Logic** (must be preserved intact without regression).

---

## 1. Architectural Overview & Boundary Separation

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│  - index.html (Global layout, Tailwind tokens, Hero, Card Grid)        │
│  - designofwebsite/DESIGN.md (Design token specifications)             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    UI CONTROLLER & INTERACTION LAYER                   │
│  - js/app.js (Global search, filter, card launch, modal lifecycle)     │
│  - js/ui/tooltip.js (Accessible ARIA tooltip engine)                   │
│  - js/password/ui.js (Password workspace modal controller)             │
│  - js/hash/ui.js & js/hash-toolkit.js (Hash modal tab controller)      │
│  - js/aes/ui.js, js/aes/encrypt.js, js/aes/decrypt.js (AES UI events) │
│  - js/jwt/ui.js, js/jwt/decode.js, js/jwt/build.js (JWT UI events)     │
│  - js/url-phishing/ui.js (URL Phishing workspace controller)           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│               EDUCATIONAL & INTERACTIVE VISUALIZER LAYER               │
│  - js/aes/learn.js (ECB vs GCM canvas simulation & round visualizer)   │
│  - js/hash/learn.js (Live avalanche-effect engine)                     │
│  - js/jwt/learn.js (Interactive token anatomy & tampering sandbox)     │
│  - js/url-phishing/learn.js (URL anatomy & spot-the-difference quiz)   │
│  - js/url-phishing/build.js (Safe phishing URL deception simulator)   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│               CORE FUNCTIONAL & SECURITY-CRITICAL LAYER                │
│  - js/password/entropy.js (Shannon entropy & GPU crack-time math)      │
│  - js/password/generator.js & transformations.js (Crypto random gen)   │
│  - js/hash/crypto.js & md5.js (Chunked SHA/MD5 hashing engines)        │
│  - js/aes/crypto.js (PBKDF2 250k, AES-GCM 256-bit, Castle envelope)   │
│  - js/jwt/crypto.js & claims.js (Base64URL, HMAC verification/signing) │
│  - js/url-phishing/heuristics.js (Punycode, homoglyph, TLD rules)      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Complete File-by-File Mapping

### A. Homepage & Global Architecture

| Component / Screen | Original File Path | Description & Role | Classification | UI Redesign Safety | Dependencies |
|:---|:---|:---|:---|:---:|:---|
| **Global Page Structure & Modals** | `index.html` | Defines the main HTML document, Tailwind theme configuration, custom CSS rules (`.armor-plate`, `.tech-grid`), top navbar, hero banner with Three.js canvas, search/category filter bar, 5 tool cards, footer, and inline HTML for Password, Hash, and AES modals. | Presentation & Layout | **High Priority for Redesign** | Google Fonts, Tailwind CDN, Three.js CDN, Material Symbols |
| **Application Controller** | `js/app.js` | Manages homepage card search, category filtering, tool modal launch buttons, backdrop click handling, and keyboard `Escape` closing. Exposes modal opener functions on `window`. | UI Controller / Interaction | **Update Event Selectors** | DOM elements in `index.html` |
| **Accessible Tooltips** | `js/ui/tooltip.js` | Lightweight, zero-dependency tooltip manager supporting ARIA roles (`role="tooltip"`, `aria-expanded`), mouse hover, and keyboard focus. | Shared UI Utility | Safe to Enhance / Restyle | None |

---

### B. Tool 1: Password (Auth-01 Flagship)

| Component / Screen | Original File Path | Description & Role | Classification | UI Redesign Safety | Dependencies |
|:---|:---|:---|:---|:---:|:---|
| **Password Workspace UI** | `js/password/ui.js` | Manages modal DOM references, tab switching (`Create` vs `Analyze`), method selection cards, length slider, character checkboxes, dual meter rendering, "Why this password?" toggle, and session history list. | UI Controller / Interaction | **Update Selectors & Layout** | `generator.js`, `analysis.js`, `questions.js` |
| **Password Generator Engine** | `js/password/generator.js` | Generates passwords via cryptographically secure pseudo-randomness (`window.crypto.getRandomValues`). Implements Fully Random, Word-based, Phrase-based, and Initialism generation modes. | Core Logic | **DO NOT OVERWRITE** (Preserve Logic) | `transformations.js`, `entropy.js` |
| **Password Audit & Flaw Scanner** | `js/password/analysis.js` | Evaluates passwords for weak patterns (dictionary sequences, repeated characters, date patterns), generates tailored recommendation lists, and computes structure-preserving upgrades. | Security Analysis Logic | **DO NOT OVERWRITE** (Preserve Logic) | `entropy.js` |
| **Entropy & Crack-Time Calculator** | `js/password/entropy.js` | Computes Shannon entropy ($H = L \log_2 R$), keyspace size ($2^H$), and crack times against offline GPU clusters ($10^{11}$ hashes/sec) and online rate-limited APIs ($10^2$ hashes/sec). | Mathematical Engine | **DO NOT OVERWRITE** (Preserve Math) | None |
| **Linguistic & Morphological Transformations** | `js/password/transformations.js` | Intelligent character swapping, leet-speak conversions, casing alterations, and symbol interleaving that maintain human memorability hooks. | Functional Logic | **DO NOT OVERWRITE** (Preserve Logic) | None |
| **Memory-Assisted Prompts** | `js/password/questions.js` | Contains Castle's signature 30+ personal memory prompts organized into childhood, pets, travel, milestones, and favorites. | Educational / Data | Safe to expand or style | None |

---

### C. Tool 2: Hash Toolkit (Crypto-02 Unified)

| Component / Screen | Original File Path | Description & Role | Classification | UI Redesign Safety | Dependencies |
|:---|:---|:---|:---|:---:|:---|
| **Hash Workspace Controller** | `js/hash/ui.js` | Handles tab switching (`Learn`, `Generate`, `Verify`) with ARIA attributes and arrow-key keyboard navigation. Manages modal visibility. | UI Controller / Interaction | **Update Selectors & Markup** | DOM elements in `index.html` |
| **Public Bridge API** | `js/hash-toolkit.js` | Exposes global bridge methods including `window.openHashToolkitModal()` and `window.openHashToolkitVerify(file)`. | Integration Bridge | **Preserve API Contract** | `js/hash/ui.js`, `verifier.js` |
| **Hash Generator UI & Events** | `js/hash/generator.js` | Binds text/file mode toggle, file dropzone drag-and-drop events, algorithm checkboxes, progress bar, and renders digest cards. | UI Interaction | **Update Selectors & Markup** | `crypto.js` |
| **Hash Verifier UI & Comparison** | `js/hash/verifier.js` | Implements Mode A (Compare to known hash with auto-detected length) and Mode B (Side-by-side file comparison). Renders green match and red mismatch verdict banners. | UI Interaction & Verification | **Update Selectors & Markup** | `crypto.js` |
| **Avalanche & Educational Demo** | `js/hash/learn.js` | Controls the live avalanche effect sandbox on the Learn tab, computing live SHA-256 digests as the user types and rendering highlight animations. | Educational Controller | **Update Selectors & Styling** | `crypto.js` |
| **Web Crypto Hash Engine** | `js/hash/crypto.js` | Provides streaming, chunked hashing (4MB blocks) for large files via `FileReader` and `crypto.subtle.digest()`. Computes SHA-1, SHA-256, SHA-512, and handles MD5 fallback. | Security-Critical Cryptography | **DO NOT OVERWRITE** (Preserve Crypto) | `md5.js`, Web Crypto API |
| **Pure JS MD5 Engine** | `js/hash/md5.js` | Standalone RFC 1321 MD5 hashing engine required because browsers intentionally omit MD5 from native `SubtleCrypto`. | Cryptographic Utility | **DO NOT OVERWRITE** (Preserve Utility) | None |

---

### D. Tool 3: AES Studio (Crypto-03 Symmetric Workbench)

| Component / Screen | Original File Path | Description & Role | Classification | UI Redesign Safety | Dependencies |
|:---|:---|:---|:---|:---:|:---|
| **AES Workspace Controller** | `js/aes/ui.js` | Manages ARIA tab navigation (`Learn`, `Encrypt`, `Decrypt`), modal open/close lifecycle, and keyboard navigation. | UI Controller / Interaction | **Update Selectors & Markup** | DOM elements in `index.html` |
| **AES Encrypt UI** | `js/aes/encrypt.js` | Encrypt tab controller: binds text/file toggle, passphrase vs random key mode, runs encryption, renders `.castle` envelope, download actions, and Hash Toolkit bridge. | UI Interaction | **Update Selectors & Markup** | `crypto.js`, `coach.js`, `advisor.js` |
| **AES Decrypt UI** | `js/aes/decrypt.js` | Decrypt tab controller: parses `.castle` ciphertext, prompts for key, executes decryption, restores file in memory, and triggers Hash Toolkit verification bridge. | UI Interaction | **Update Selectors & Markup** | `crypto.js`, `hash-toolkit.js` |
| **Educational Canvas & Visualizer** | `js/aes/learn.js` | Implements the HTML5 Canvas visualizer comparing ECB block patterns against GCM random noise, and controls the 14-round AES state matrix visualizer. | Educational Visualizer | **High Priority for UI Polish** | HTML5 Canvas |
| **Security Review & Strength Coach** | `js/aes/coach.js` | Evaluates passphrase quality, security posture, and displays educational warnings regarding key storage and authentication tags. | Educational Logic | Safe to Restyle / Improve | `js/password/analysis.js` |
| **File Advisor** | `js/aes/advisor.js` | Analyzes uploaded file types and sizes, advising users on browser chunking and optimal encryption performance. | UI Helper | Safe to Restyle | None |
| **Web Crypto AES-256-GCM Engine** | `js/aes/crypto.js` | Implements PBKDF2 (HMAC-SHA-256, 250,000 iterations, 16-byte random salt), AES-256-GCM authenticated encryption with 96-bit random IV, and `.castle` JSON envelope format. | Security-Critical Cryptography | **DO NOT OVERWRITE** (Preserve Crypto) | Web Crypto API |

---

### E. Tool 4: JWT Decoder & Verifier (Web Security)

| Component / Screen | Original File Path | Description & Role | Classification | UI Redesign Safety | Dependencies |
|:---|:---|:---|:---|:---:|:---|
| **JWT Modal & Dynamic Injection** | `js/jwt/ui.js` | Dynamically injects `#jwt-modal` markup into document body, binds ARIA tabs (`Learn`, `Decode & Verify`, `Build`), and enforces zero-trace in-memory state wiping on close. | UI Controller & Template | **High Priority for Redesign** | `learn.js`, `decode.js`, `build.js` |
| **Decode & Verify Controller** | `js/jwt/decode.js` | Handles debounced JWT parsing, live countdown expiration timer, HMAC signature verification, status checklist rendering, duplicate key warnings, and sensitive field alerts. | UI Interaction & Analysis | **Update Selectors & Markup** | `crypto.js`, `claims.js` |
| **JWT Builder Controller** | `js/jwt/build.js` | Manages claim input forms (`sub`, `role`, `iss`, `exp`, `iat`, `alg`), triggers local HMAC signing, renders formatted JSON blocks, and executes Build-to-Verify handoff. | UI Interaction | **Update Selectors & Markup** | `crypto.js` |
| **JWT Educational Workspace** | `js/jwt/learn.js` | Renders the Learn tab: "What is a JWT?", Base64URL encoding warnings, interactive 3-part token anatomy with popup tooltips, Decoded vs Verified comparison, and live tampering sandbox. | Educational Visualizer | **High Priority for UI Polish** | `crypto.js`, `tooltip.js` |
| **Standard Claims & Explanations** | `js/jwt/claims.js` | Dictionary of registered RFC 7519 claims (`iss`, `sub`, `aud`, `exp`, `nbf`, `iat`, `jti`), providing plain-English explanations and epoch date translations. | Educational Data & Translation | Safe to Expand | None |
| **Web Crypto HMAC Engine** | `js/jwt/crypto.js` | Base64URL parsing/encoding, `SubtleCrypto` HMAC-SHA256 / HS384 / HS512 key importing, token signing, and timing-safe signature comparison. | Security-Critical Cryptography | **DO NOT OVERWRITE** (Preserve Crypto) | Web Crypto API |
| **JWT Unit & Scenario Test Suite** | `js/jwt/tests.js` | 15 automated test vectors validating HS256/384/512 known-answer pairs, tampering detection, and duplicate claim handling. | Testing & Quality Assurance | Reference for verification | `crypto.js`, `claims.js` |

---

### F. Tool 5: URL Structure Analyzer (Utilities)

| Component / Screen | Original File Path | Description & Role | Classification | UI Redesign Safety | Dependencies |
|:---|:---|:---|:---|:---:|:---|
| **URL Workspace UI & Modal** | `js/url-phishing/ui.js` | Injects `#url-phishing-modal` markup, manages tabs (`Learn`, `Analyze`, `Build`), binds modal close events, and manages utility toggles. | UI Controller & Template | **High Priority for Redesign** | `learn.js`, `analyze.js`, `build.js` |
| **URL Analysis Controller** | `js/url-phishing/analyze.js` | Binds URL input events, runs heuristic inspection, renders Structural Risk Score (0–100), detected deceptive signal cards, and external reputation links. | UI Interaction | **Update Selectors & Markup** | `heuristics.js` |
| **Educational & Quiz Module** | `js/url-phishing/learn.js` | Renders Learn tab: Phishing explainer, interactive URL anatomy breakdown with tooltips, expandable glossary (8 terms), attacker workflow, 6-question "Spot the Difference" quiz, and incident advice. | Educational Visualizer | **High Priority for UI Polish** | `tooltip.js` |
| **Safe Phishing Simulator** | `js/url-phishing/build.js` | Interactive laboratory allowing users to click manipulation buttons (`subdomain`, `@ trick`, `typo`, `tld`) to see how attackers construct misleading links client-side. | Educational Lab | **High Priority for UI Polish** | `heuristics.js` |
| **Heuristics & Deception Rules** | `js/url-phishing/heuristics.js` | Native `URL` object parsing, Punycode/homoglyph detection (`xn--`), IP address hostname detection, brand keyword impersonation rules, non-standard port detection, and suspicious TLD scoring. | Security Heuristics Engine | **DO NOT OVERWRITE** (Preserve Logic) | Native URL API |

---

## 3. Implementation Rules for Future UI Redesign

1. **HTML & Presentation Separation**:
   - The files marked **High Priority for Redesign** (`index.html`, `js/jwt/ui.js`, `js/url-phishing/ui.js`) contain the HTML templates and layout structure. In a redesigned version, these templates can be completely modernized.
2. **Preserve DOM Element IDs or Update Controller Bindings**:
   - The UI controller files (`js/password/ui.js`, `js/hash/generator.js`, `js/aes/encrypt.js`, etc.) reference specific element IDs (e.g., `#pw-output-field`, `#hash-gen-text-input`, `#aes-plain-text`, `#jwt-input`). When modifying markup, preserve these IDs or update the corresponding `document.getElementById` selectors.
3. **Strict Protection of Security-Critical Files**:
   - `js/password/entropy.js`
   - `js/password/generator.js`
   - `js/hash/crypto.js`
   - `js/aes/crypto.js`
   - `js/jwt/crypto.js`
   - `js/url-phishing/heuristics.js`
   These files contain verified cryptographic operations, PBKDF2 derivations, mathematical Shannon entropy computations, and heuristic parsers. **They must never be replaced by stubbed or mock code.**
