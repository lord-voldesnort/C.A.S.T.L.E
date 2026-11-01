
# Castle Screen and Interaction Inventory

This document provides a comprehensive inventory of all screens, workspaces, modal dialogs, and interactive states currently implemented in **Castle** (`cybersecurity-toolkit`). Every entry corresponds to actual code and genuine screenshots captured from the running local application.

---

## 1. Master Screen & UI State Table

| ID | Tool / Page | Screen or State | How to Reach It | Important Elements | Viewport | Screenshot Filename | Capture Status |
|:---|:---|:---|:---|:---|:---:|:---|:---:|
| **SCR-00-D** | Homepage | Main Landing Dashboard | Initial page load (`/index.html`) | Top navigation bar with branding (`C.A.S.T.L.E.`), links (Home, Tools, Categories, Learn, About), utility icons (search, code, dark_mode), "Launch Castle" CTA, Hero banner with 3D interactive Three.js wireframe keep animation, search input, category pill filters (`All Tools`, `Authentication`, `Web Security`, `Encryption`, `Utilities`), 5 tactical armor-plate tool cards, and footer. | 1440 × 1000 | `00-homepage-desktop.png` | Captured |
| **SCR-00-M** | Homepage | Mobile Landing Dashboard | Open homepage on mobile viewport | Stacked navigation, compact hero headline, responsive 3D keep wireframe, horizontal category scroll, stacked 1-column tool cards, bottom footer. | 390 × 844 | `00-homepage-mobile.png` | Captured |
| **SCR-01-GEN** | Password | Tab 1: Create Password (Generation Workspace) | Click "Launch" on Password card; defaults to Tab 1 | Modal header with module badge (`MODULE // AUTH-01 FLAGSHIP`), privacy guarantee banner, Tab selector (`Tab 1: Create Password` / `Tab 2: Analyze Password`), Quick Presets (`⚡ Max Security`, `🧠 Max Memorability`), 6 generation method cards (`Fully Random`, `Memorable Word`, `Phrase Based`, `Initialism`, `Theme Based`, `Memory Assisted`), method-specific input panel, length slider (4–128) with live badge, character set checkboxes (Uppercase, Lowercase, Numbers, Symbols), exclude ambiguous characters checkbox, output display with copy/visibility/refresh buttons, "Generate Password" action button, dual independent meters (Cryptographic Strength & Human Memorability), entropy & crack-time metrics, collapsible "Why this password?" panel, and session history list. | 1440 × 1000 | `01-password-generate.png` | Captured |
| **SCR-01-LRN** | Password | Educational View ("Why this password?") | In Tab 1, click `#pw-why-toggle` ("Why this password?") | Expanded explanation accordion detailing why the generated password is secure, mathematical Shannon entropy calculation ($H = L \log_2 R$), estimated offline crack time across GPU cracking clusters, character pool distribution breakdown badges (Upper, Lower, Num, Sym), and human recall factors. | 1440 × 1000 | `01-password-learn.png` | Captured |
| **SCR-01-RES** | Password | Generated Password State | Click `⚡ Max Security` preset and click `Generate Password` | Output field populated with high-entropy cryptographic password, "Applied Maximum Security Preset" toast, Dual Meters active (Cryptographic Strength: `FORTRESS (UNBREAKABLE)` across 4 full bars, Human Memorability: `45% (HIGH RECALL)`), Entropy: 157 bits, Crack Time: `Trillions of years`, Distribution badges: `Upper: 8, Lower: 5, Num: 4, Sym: 7`. | 1440 × 1000 | `01-password-result.png` | Captured |
| **SCR-01-ANA** | Password | Tab 2: Analyze Password (Audit Workspace) | Click `Tab 2: Analyze Password` in modal header; type input password | Input field with show/hide password toggle, real-time Cryptographic Strength Meter, real-time Memorability Meter, Entropy bits readout, offline crack time estimate, length rating, character pool pills, detected pattern badges (dictionary words, repetitions, sequences), weakness checklist with warning icons, tailored improvement recommendations, and smart recommended upgrade box with "Copy Upgrade" button. | 1440 × 1000 | `01-password-analysis.png` | Captured |
| **SCR-01-M** | Password | Mobile Password Workspace | Launch Password tool on mobile viewport | Vertically responsive modal dialog constrained to `max-h-[92vh]`, touch-friendly sliders, stacked 2-column method cards, full-width output field, and collapsible history. | 390 × 844 | `01-password-mobile.png` | Captured |
| **SCR-02-LRN** | Hash Toolkit | Tab 1: Learn (Integrity & Checksum Concepts) | Click "Launch" on Hash Toolkit card; defaults to Tab 1 | Module badge (`MODULE // CRYPTO-02 UNIFIED`), privacy guarantee banner, Tab navigation (`Learn`, `Generate`, `Verify`), plain-language explainer card ("What is a Hash?"), live avalanche-effect sandbox with interactive text input, live SHA-256 digest container with highlight transitions, real-world context grid (Password storage, File downloads, Git commits, Docker images). | 1440 × 1000 | `02-hash-learn.png` | Captured |
| **SCR-02-GEN** | Hash Toolkit | Tab 2: Generate (Multi-Algorithm Hash Generator) | In Hash Toolkit, click `Generate` tab | Source toggle (`Text Mode` vs `File Mode`), text input textarea, drag-and-drop file upload zone (in file mode), algorithm selection checkboxes with security annotations (`MD5` [Broken warning], `SHA-1` [Broken warning], `SHA-256` [Default checked], `SHA-512`), progress bar, and results container. | 1440 × 1000 | `02-hash-generate.png` | Captured |
| **SCR-02-RES** | Hash Toolkit | Multi-Hash Generated State | Type text into input field and enable all 4 algorithms | Rendered digest cards for MD5 (32 hex), SHA-1 (40 hex), SHA-256 (64 hex), and SHA-512 (128 hex), each displaying algorithm badge, formatted monospace hex output, and one-click copy buttons with copied confirmation state. | 1440 × 1000 | `02-hash-result.png` | Captured |
| **SCR-02-VER** | Hash Toolkit | Tab 3: Verify (Integrity Verification Hub) | In Hash Toolkit, click `Verify` tab | Mode toggle (`Compare to a known hash` [Mode A] vs `Compare two files` [Mode B]), persistent instructional banner. Mode A view: target file drag-and-drop zone, expected hash input field with auto-algorithm length detection notice, digest computing progress bar, and match/mismatch result banner. Mode B view: dual side-by-side dropzones (File A & File B), progress bar, and SHA-256 binary match verdict. | 1440 × 1000 | `02-hash-verify.png` | Captured |
| **SCR-02-M** | Hash Toolkit | Mobile Hash Workspace | Launch Hash Toolkit on mobile viewport | Compact tab navigation, single-column stacked dropzones in Verify Mode B, touch-friendly algorithm checkboxes, responsive hash digest wrapping. | 390 × 844 | `02-hash-mobile.png` | Captured |
| **SCR-03-LRN** | AES Studio | Tab 1: Learn (Symmetric Encryption Concepts) | Click "Launch" on AES Studio card; defaults to Tab 1 | Header with `Cryptography workspace` tag, privacy guarantee banner, Tab navigation (`Learn`, `Encrypt`, `Decrypt`), 4 conceptual cards (`Encryption vs Hashing`, `Why AES-256-GCM`, `Keys, salt, and IV`, `Symmetric encryption`), "Why encryption mode matters" card with dual HTML5 canvas renders (ECB pattern retention vs GCM randomized noise), two-way encryption pipeline flowchart, and expandable `<details>` panel for the interactive 16-byte internal round visualizer with step-by-step state matrix updates. | 1440 × 1000 | `03-aes-learn.png` | Captured |
| **SCR-03-ENC** | AES Studio | Tab 2: Encrypt (Local Client-Side Encryption) | In AES Studio, click `Encrypt` tab | Source toggle (`Text` vs `File`), plaintext input textarea, file upload dropzone, advisor advisory box ("Plain text is protected locally with a fresh IV and authenticated encryption"), key mode toggle (`Passphrase` vs `Random key`), secret passphrase input field with real-time entropy/strength feedback, "Generate strong passphrase" bridge link to Password tool, random key warning callout, "Encrypt locally" button, progress bar, and encrypted output area. | 1440 × 1000 | `03-aes-encrypt.png` | Captured |
| **SCR-03-RES** | AES Studio | Successful Encryption Result | Enter plaintext + passphrase and click `Encrypt locally` | Generated ciphertext display container showing Base64-encoded Castle JSON envelope (containing version, algorithm, mode, salt, IV, and data), "Copy Ciphertext" button, "Download .castle Payload" action, and "Generate integrity hash" bridge button to Hash Toolkit. | 1440 × 1000 | `03-aes-result.png` | Captured |
| **SCR-03-DEC** | AES Studio | Tab 3: Decrypt (Restoration & Verification) | In AES Studio, click `Decrypt` tab | Ciphertext input textarea, `.castle` file upload dropzone, detected mode indicator, decryption secret input field (passphrase or random key), "Decrypt locally" button, progress bar, decrypted plaintext output viewer, and post-decryption "Verify this file in Hash Toolkit" bridge button. | 1440 × 1000 | `03-aes-decrypt.png` | Captured |
| **SCR-03-M** | AES Studio | Mobile AES Workspace | Launch AES Studio on mobile viewport | Mobile tab bar, single-column encryption cards, stacked canvas comparison, touch-friendly key-derivation inputs. | 390 × 844 | `03-aes-mobile.png` | Captured |
| **SCR-04-LRN** | JWT Decoder | Tab 1: Learn (Token Mechanics & Vulnerabilities) | Click "Launch" on JWT Decoder card; defaults to Tab 1 | Header with `Web Security workspace` badge, zero-network privacy notice, Tab navigation (`Learn`, `Decode & Verify`, `Build`), Section A: "What is a JSON Web Token?" with red Base64URL encoding disclaimer, Section B: Interactive Token Anatomy with color-coded interactive segments (Red Header, Gold Payload, Blue Signature) and rich hover tooltips displaying decoded JSON, Section C: "Decoded ≠ Verified" contrast banners, Section D: Live Tampering Sandbox demonstrating instant signature breakage on claim modification. | 1440 × 1000 | `04-jwt-learn.png` | Captured |
| **SCR-04-DEC** | JWT Decoder | Tab 2: Decode & Verify (Token Inspector) | In JWT modal, click `Decode & Verify` tab | Paste JWT textarea, token error banner, parsed results view with one-line English summary, duplicate key warning banner, signature verification status banner, live expiration countdown timer, side-by-side Decoded Header and Decoded Payload JSON inspectors, HMAC secret input field, algorithm dropdown, and Token Status panel (Structure, Algorithm, Expiration, Signature, Secret Strength, Sensitive Fields scan). | 1440 × 1000 | `04-jwt-decode-verify.png` | Captured |
| **SCR-04-BLD** | JWT Decoder | Tab 3: Build (Token Generator & Signer) | In JWT modal, click `Build` tab | Custom claim creation form: Subject (`sub`), Custom Claim / Role (`role`), Issuer (`iss`), Expiration dropdown (`exp`: 15m, 1h, 24h, 7d), Algorithm select (`HS256`, `HS384`, `HS512`), Epoch auto-fill timestamp (`iat`), HMAC Signing Secret input, "Generate Signed JWT" button, formatted Header and Payload preview blocks, generated signed token output field with copy button, and "Analyze This Token →" handoff button. | 1440 × 1000 | `04-jwt-build.png` | Captured |
| **SCR-04-RES** | JWT Decoder | Token Signature Verified State | Provide valid token + secret in Decode & Verify | Bright green `✓ SIGNATURE VERIFIED` banner with explanation ("Signature verified ≠ issuer trusted"), populated Token Status panel (`✓ Valid Structure`, `✓ HS256`, `✓ Verified (HMAC)`, `✓ Strong (FORTRESS)`), and collapsible claims translation table. | 1440 × 1000 | `04-jwt-result.png` | Captured |
| **SCR-04-M** | JWT Decoder | Mobile JWT Workspace | Launch JWT modal on mobile viewport | Responsive token inputs, stacked decoded header/payload viewers, touch-friendly verification controls. | 390 × 844 | `04-jwt-mobile.png` | Captured |
| **SCR-05-LRN** | URL Analyzer | Tab 1: Learn (Phishing & Structural Deception) | Click "Launch" on URL Structure Analyzer card | Header with `Utilities workspace` badge, Tab navigation (`Learn`, `Analyze`, `Build`), "What is phishing?" explainer, interactive Anatomy of a URL breakdown (Protocol, Subdomain, Domain, TLD, Path, Query string) with popup tooltips, expandable Glossary with 8 cards (Domain, Subdomain, TLD, Homoglyph, Typosquatting, URL Shortener, Punycode, HTTPS), 5-step attacker workflow, "Spot the Difference" interactive 6-question domain quiz, and emergency guidance checklist. | 1440 × 1000 | `05-url-learn.png` | Captured |
| **SCR-05-ANA** | URL Analyzer | Tab 2: Analyze (Link Heuristics Inspector) | In URL modal, click `Analyze` tab | Monospace URL input field with clear/paste actions, live heuristics evaluation engine, and collapsible URL encode/decode utility. | 1440 × 1000 | `05-url-analyze.png` | Captured |
| **SCR-05-RES** | URL Analyzer | Suspicious URL Analysis Result State | Enter deceptive link into URL input field | Structural Risk Score banner (e.g., `35/100 Some risk signals present`), detected heuristic flag callouts (`Suspicious subdomain structure`, `Brand name with unexpected TLD`), external verification links (Google Safe Browsing, VirusTotal), and component breakdown. | 1440 × 1000 | `05-url-result.png` | Captured |
| **SCR-05-BLD** | URL Analyzer | Tab 3: Build (Safe Phishing Simulator) | In URL modal, click `Build` tab | Safe simulation disclaimer, target base domain display (`paypal.com`), interactive deception manipulation buttons (`Swap a character`, `Add fake subdomain`, `Insert @ trick`, `Use suspicious TLD`, `Add excessive subdomains`, `Reset`), and real-time live structural vulnerability readout explaining the trick applied. | 1440 × 1000 | `05-url-build.png` | Captured |
| **SCR-05-M** | URL Analyzer | Mobile URL Workspace | Launch URL modal on mobile viewport | Responsive single-column layout, touch-friendly quiz buttons, wrapped URL breakdown spans, collapsible glossary. | 390 × 844 | `05-url-mobile.png` | Captured |

---

## 2. Comprehensive Interaction Inventory

### A. Navigation & Homepage Controls
1. **Top Nav Links**:
   - `Home`: Scrolls to top of the dashboard.
   - `Tools`: Smooth-scrolls to `#tools-section` (search & cards grid).
   - `Categories`: Filters and displays tool modules by security domain.
   - `Learn`: Anchor link intended for global educational overview.
   - `About`: Anchor link for project metadata and architecture.
2. **Global Utility Buttons**:
   - Search icon button: Focuses the tools search bar.
   - Code icon button: Points to project repository / inspect code.
   - Theme toggle button: Toggles dark mode (currently configured for permanent tactical dark theme).
   - `Launch Castle` primary button: Quick-scrolls directly to `#tools-section`.
3. **Hero Section Action**:
   - `Explore Modules`: Smooth-scrolls viewport to the tool grid.
4. **Search Input**:
   - Debounced real-time filter across card titles, descriptions, and category tags.
5. **Category Filter Pills**:
   - `All Tools`: Displays all 5 tool cards.
   - `Authentication`: Filters to Password tool card.
   - `Web Security`: Filters to JWT Decoder & Verifier card.
   - `Encryption`: Filters to AES Studio and Hash Toolkit cards.
   - `Utilities`: Filters to URL Structure Analyzer card.
6. **Tool Card Launch Buttons & Card Click**:
   - Clicking either the card body (`.armor-plate-interactive`) or the explicit `Launch →` button opens the dedicated modal workspace for that tool.

### B. Workspace Modal Patterns
1. **Opening**: Sets modal `hidden` class to false, locks background scrolling (`document.body.style.overflow = 'hidden'`).
2. **Closing**:
   - Clicking modal close icon button (`close`).
   - Clicking dark backdrop overlay (`#*-backdrop`).
   - Pressing the keyboard `Escape` key.
   - Restores background scrolling (`document.body.style.overflow = ''`).
3. **Privacy Guarantees**:
   - Every workspace modal features a top prominent banner confirming that all cryptographic operations, file reading, and parsing are executed 100% locally client-side via the browser Web Crypto API and `FileReader`. Zero data leaves the machine.

### C. Password Workspace Interactions
1. **Workspace Tabs**: Switch between `Tab 1: Create Password` and `Tab 2: Analyze Password`.
2. **Presets**: One-click configuration for `⚡ Max Security` (24 chars, all pools enabled) or `🧠 Max Memorability` (Memory-Assisted mode).
3. **Method Selection Cards**: 6 cards (`Fully Random`, `Memorable Word`, `Phrase Based`, `Initialism`, `Theme Based`, `Memory Assisted`). Clicking any card displays its tailored input panel and recomputes the generation strategy.
4. **Configuration Controls**:
   - Length slider: Real-time update of badge value (4 to 128 characters).
   - Checkboxes: Uppercase (`A-Z`), Lowercase (`a-z`), Numbers (`0-9`), Symbols (`!@#$%...`).
   - Ambiguous character exclusion: Excludes visually confusing glyphs (`l, 1, I, O, 0, o, |`).
5. **Output Actions**:
   - Visibility toggle: Switches between plaintext and masked bullets.
   - Regenerate button: Generates a new password with existing parameters.
   - Copy button: Copies generated password to OS clipboard and displays confirmation toast.
6. **Meters & Analysis**:
   - Dual independent meters: Cryptographic Strength (4 segmented bars) and Human Memorability (0–100% bar).
   - Entropy readout (bits), GPU Crack Time estimate, and character distribution badges.
   - "Why this password?" toggle: Expands collapsible reasoning list.
   - Session history: Displays recent passwords generated during the browser session.
7. **Audit Workspace (Tab 2)**:
   - Typing or pasting any password triggers real-time dual-meter evaluation, flaw scanning, vulnerability warnings, and structure-preserving upgrade recommendations.

### D. Hash Toolkit Interactions
1. **Workspace Tabs**: Switch between `Learn`, `Generate`, and `Verify`.
2. **Avalanche Demo (Learn)**: Typing in the input field instantly computes and renders the live SHA-256 digest, highlighting how a 1-character change alters the entire hash.
3. **Source Toggle (Generate)**: Switch between `Text Mode` (textarea) and `File Mode` (drag-and-drop zone with chunked local file reading).
4. **Algorithm Selection**: Toggling MD5, SHA-1, SHA-256, and SHA-512 dynamically updates the computed digests.
5. **Copy Hash**: Individual copy buttons beside each generated digest.
6. **Verification Mode A**: Drag file + paste expected hash. The algorithm is automatically detected based on the character length of the pasted hash (32 = MD5, 40 = SHA-1, 64 = SHA-256, 128 = SHA-512). Compares computed digest against expected value and displays an explicit match/mismatch banner.
7. **Verification Mode B**: Side-by-side dropzones for File A and File B. Computes SHA-256 of both files in parallel and displays binary equivalence verdict.

### E. AES Studio Interactions
1. **Workspace Tabs**: Switch between `Learn`, `Encrypt`, and `Decrypt`.
2. **Mode Visualizer (Learn)**: Interactive canvas rendering comparing ECB pattern leaks against GCM pseudo-random noise.
3. **Round Visualizer (Learn)**: Stepping through the 14 transformation rounds of AES-256 (`SubBytes`, `ShiftRows`, `MixColumns`, `AddRoundKey`) with live state matrix updates.
4. **Source Toggle (Encrypt)**: Text input or file upload.
5. **Key Management Toggle**:
   - `Passphrase Mode`: PBKDF2 with 250,000 iterations of HMAC-SHA-256 and fresh 16-byte random salt. Includes "Generate strong passphrase" bridge.
   - `Random Key Mode`: Generates a high-entropy 256-bit random key displayed once.
6. **Encryption Execution**: `crypto.subtle.encrypt` in AES-GCM mode with fresh 96-bit IV. Output packed into Castle envelope.
7. **Hash Bridge Action**: "Generate integrity hash" executes `window.CastleHashEngine.hashFile` directly without duplicate engines.
8. **Decryption Execution**: Validates payload structure, derives/applies key, verifies GCM authentication tag, and outputs decrypted text or downloads restored file.
9. **Verify Bridge Action**: Decrypted file can be handed off directly to Hash Toolkit via `openHashToolkitVerify(restoredFile)`.

### F. JWT Decoder & Verifier Interactions
1. **Workspace Tabs**: Switch between `Learn`, `Decode & Verify`, and `Build`.
2. **Interactive Token Anatomy (Learn)**: Clicking Header, Payload, or Signature highlights the segment and reveals formatted decoded tooltips.
3. **Live Tampering Sandbox (Learn)**: Changing a claim in the sample token instantly displays signature failure.
4. **Token Input (Decode & Verify)**: Paste or type any JWT. Automatically parses Base64URL header and payload into formatted JSON.
5. **Secret Verification (Decode & Verify)**: Enter HMAC secret. Live Web Crypto verification displays green `SIGNATURE VERIFIED` or red `SIGNATURE INVALID` status banner.
6. **Token Status Panel**: Evaluates token structure, algorithm, expiration countdown, signature validity, secret strength, and sensitive field leaks.
7. **Build Tab**: Enter subject, role, issuer, expiration, algorithm, and secret. Clicking "Generate Signed JWT" creates a valid token locally. Clicking "Analyze This Token →" automatically loads the generated token and secret into the Decode & Verify tab.

### G. URL Structure Analyzer Interactions
1. **Workspace Tabs**: Switch between `Learn`, `Analyze`, and `Build`.
2. **Interactive URL Anatomy (Learn)**: Hover/tap colored components of a sample URL to inspect its technical role.
3. **Glossary Cards (Learn)**: Expandable cards defining Domain, Subdomain, TLD, Homoglyph, Typosquatting, URL Shortener, Punycode, and HTTPS.
4. **Spot the Difference Quiz (Learn)**: 6-question interactive quiz asking users to identify real domains vs typosquatted lookalikes (e.g. `paypal.com` vs `paypa1.com`), tracking session score.
5. **URL Input & Live Analysis (Analyze)**: Evaluates input link using native URL parsing and regex heuristics, generating a Structural Risk Score (0–100) and actionable warning flags.
6. **URL Encode/Decode Utility (Analyze)**: Built-in utility to inspect obfuscated hex/percent-encoded parameters.
7. **Safe Phishing Simulator (Build)**: Click deception buttons (`Swap a character`, `Add fake subdomain`, `Insert @ trick`, `Use suspicious TLD`, `Add excessive subdomains`) to witness how attackers visually disguise destinations without visiting any malicious server.
