# Castle — System Design Specification

> **Google Stitch Design Specification Document**  
> **Product**: C.A.S.T.L.E. (Cybersecurity Toolbox Platform / Armor)  
> **Repository Path**: `d:\Projects\cybersecurity-toolkit`  
> **Status**: Existing, fully functional local-first client-side web application.  
> **Companion Documents**: [SCREEN_INVENTORY.md](file:///d:/Projects/cybersecurity-toolkit/design-handoff/SCREEN_INVENTORY.md) | [SOURCE_MAP.md](file:///d:/Projects/cybersecurity-toolkit/design-handoff/SOURCE_MAP.md) | [DESIGN_IMPROVEMENT_BRIEF.md](file:///d:/Projects/cybersecurity-toolkit/design-handoff/DESIGN_IMPROVEMENT_BRIEF.md)

---

## 1. Product Identity, Purpose & Core Pillars

### 1.1 Product Identity
**Castle** (also titled **C.A.S.T.L.E.** or **Armor / Protection Hub**) is a privacy-first, browser-native cybersecurity learning and analysis platform. Inspired by the intuitive card-and-workspace paradigm of **iLovePDF**, Castle organizes specialized security utilities into a modular tactical command center.

Unlike conventional "black-box" converter utilities (e.g. CyberChef or base64 decoders) that perform opaque transformations, Castle is built with a dual-purpose identity:
1. **Practical Real-World Utility**: Enables everyday users, developers, and security enthusiasts to evaluate password strength, generate robust credentials, compute file checksums, encrypt/decrypt confidential data with AES-256-GCM, inspect/verify JSON Web Tokens, and analyze suspicious phishing links.
2. **Interactive "Learn" Engine**: Demystifies cryptographic algorithms, mathematical entropy, and threat mechanics through live visual simulations, interactive canvas demonstrations, side-by-side analogies, and step-by-step internal round visualizers.

### 1.2 Core Architectural Pillars
- **Zero-Knowledge, Client-Side Processing**: Every single cryptographic operation (AES encryption, PBKDF2 derivation, SHA hashing, JWT decoding and signing) and file read occurs 100% locally in the user's browser using native Web Crypto APIs (`window.crypto.subtle`) and `FileReader`. Zero server-side transmission or persistent tracking occurs.
- **Clear Security Results**: Technical metrics (Shannon entropy bits, GPU offline crack time, hash comparison verdicts, signature validity badges, heuristic risk scores) are presented with clear, unambiguous visual indicators rather than obscure hex codes.
- **Cohesive Command-Center Design**: Implements an "Armor Plate" tactical military/defensive design system using deep dark substrates, subtle technical grid shaders, precision typography, and warm amber/gold accents.

---

## 2. Target Users & Product Personality

### 2.1 Target Audiences
- **Computer Science & Cybersecurity Students**: Learning foundational cryptographic principles (symmetric encryption, one-way functions, hash collisions, block cipher modes, token architecture).
- **Developers & Web Engineers**: Auditing JWTs, generating secure API secrets, deriving keys, and inspecting token expiration and duplicate claim anomalies.
- **Privacy-Conscious Individuals**: Seeking a trustworthy, zero-leakage offline environment to create passwords, compute file hashes, or encrypt sensitive documents before transit.
- **Academic Evaluators & Technical Reviewers**: Inspecting practical engineering implementations combining a polished web frontend with sound cryptographic math.

### 2.2 Product Personality & Tone
- **Tactical & Authoritative**: Clean, utilitarian, disciplined, and defensive.
- **Transparent & Instructive**: Explains *why* an algorithm is secure or why a link is deceptive. Never obscures math behind arbitrary percentages without scientific backing.
- **Privacy-Assuring**: Explicitly reminds the user at every interaction that their data never leaves their local device.

---

## 3. Existing Visual Identity & Design System

### 3.1 Color Palette
Castle utilizes a specialized dark palette defined via Tailwind CSS theme configuration (`index.html`) and legacy design tokens (`designofwebsite/DESIGN.md`):

#### Substrates & Surfaces
| Token Name | Hex Value | Semantic Usage |
|:---|:---:|:---|
| `bg-main` | `#090909` | Deepest root page background |
| `background` | `#191209` | Primary tinted background substrate |
| `surface` | `#151515` | Default card and container background (`.armor-plate`) |
| `surface-elevated` | `#1D1D1D` | Elevated layers, flyouts, and tooltips |
| `surface-container-lowest` | `#130d05` | Recessed input fields, code blocks, sub-panels |
| `surface-container-low` | `#211a11` | Secondary recessed containers |
| `surface-container` | `#251e15` | Default container fill for badges and sliders |
| `surface-container-high` | `#30291e` | Highlighted container fills |
| `surface-container-highest` | `#3c3429` | Active buttons, category pills, slider tracks |
| `surface-bright` | `#40382d` | Hover states on container elements |
| `border` | `#2B2B2B` | Default structural border line |
| `outline` | `#9F8E78` | Focused outline / subtle border highlight |

#### Brand & Accent Colors
| Token Name | Hex Value | Semantic Usage |
|:---|:---:|:---|
| `primary` | `#FFD597` | Castle Flagship Amber / Light Gold (primary text accent, active borders, key highlights) |
| `on-primary` | `#432C00` | High-contrast dark text on primary gold buttons |
| `primary-container` | `#FFB000` | Deep Amber / Gold accent (wireframe keep, active toggles) |
| `on-surface` | `#EEE0D0` | Standard high-contrast readable body text |
| `on-surface-variant` | `#D7C4AC` | Muted secondary text, inactive links |
| `text-primary` | `#F5F5F5` | Pure off-white primary headlines |
| `text-secondary` | `#A3A3A3` | Secondary descriptive text |
| `text-muted` | `#6B7280` | Tertiary microcopy, placeholders, hints |

#### Semantic Status Tokens
| Token Name | Hex Value | Semantic Usage |
|:---|:---:|:---|
| `success` | `#22C55E` | Verified signature, matching hashes, strong password |
| `warning` | `#FACC15` | Broken algorithms (MD5/SHA-1), unverified token, suspicious URL signals |
| `danger` / `error` | `#EF4444` | Tampered token, hash mismatch, critical password weakness |
| `info` | `#3B82F6` | Token signature anatomy, technical telemetry, metadata |

---

### 3.2 Typography & Type Hierarchy

Castle loads three Google Fonts (`Space Grotesk`, `Inter`, `JetBrains Mono`):

```
Headings & Display  : Space Grotesk (Sans-serif, technical, bold, architectural)
Body & Interface    : Inter (Sans-serif, neutral, highly legible)
Code, Keys & Digits : JetBrains Mono (Monospace, clear character disambiguation)
```

| Type Token | Font Family | Size | Weight | Line Height | Usage |
|:---|:---|:---:|:---:|:---:|:---|
| `hero` | Space Grotesk | 72px | 700 | 1.10 | Desktop hero main banner |
| `hero-mobile` | Space Grotesk | 48px | 700 | 1.15 | Mobile hero banner |
| `headline-lg` | Space Grotesk | 56px | 700 | 1.15 | Major section headers |
| `headline-md` | Space Grotesk | 42px | 700 | 1.20 | Hero headline (`Build Your Digital Fortress`) |
| `headline-sm` | Space Grotesk | 30px | 600 | 1.30 | Modal titles, major tool headings |
| `title-lg` | Space Grotesk | 24px | 600 | 1.30 | Card titles (`Password`, `AES Studio`), Brand logo |
| `body-lg` | Inter | 18px | 400 | 1.70 | Lead introductory paragraphs |
| `body-md` | Inter | 16px | 400 | 1.70 | Standard interface text, descriptions |
| `body-sm` | Inter | 14px | 400 | 1.50 | Tooltips, card microcopy, footer links |
| `label-md` | Inter | 13px | 500 / 600 | 1.40 | Button labels, category pills, tab selectors |
| `code` | JetBrains Mono | 14px | 500 | 1.50 | Monospace hashes, tokens, inputs, slider readouts |

---

### 3.3 Spacing, Sizing & Layout Grid
- **Base Unit**: 4px (`base: 4px`).
- **Scale**:
  - `xs`: 4px
  - `sm`: 8px
  - `md`: 16px
  - `lg`: 24px
  - `xl`: 32px
  - `xxl`: 64px
  - `gutter`: 24px
- **Margins**: Mobile: 16px (`px-margin-mobile`), Desktop: 40px (`px-margin-desktop`).
- **Layout Max-Width**: Main container constrained to `max-w-7xl` (1280px), centered with `mx-auto`.
- **Tool Grid Breakpoints**:
  - Mobile (`< 768px`): 1 column grid.
  - Tablet (`768px - 1024px`): 2 column grid.
  - Desktop (`> 1024px`): 3 column grid.

---

### 3.4 Card Styling: The "Armor Plate" Component
All containers, cards, and workspace modals use the `.armor-plate` CSS component:
- **Base Style**:
  - Background: `#151515` (deep charcoal).
  - Border: 1px solid `rgba(43, 43, 43, 0.8)`.
  - Border Radius: 4px (`rounded-lg` / `rounded: 0.25rem`).
  - Position: relative.
- **Tactical Corner Accent**:
  - Pseudoelement `::before` positioned at `top: -1px; left: -1px; width: 8px; height: 8px;`.
  - Top and left borders: 2px solid `#ffd597` (amber accent).
  - Hover / focus-within transition: Opacity shifts from 0 to 1 on hover.
- **Interactive State (`.armor-plate-interactive`)**:
  - Hover: `transform: translateY(-4px);`
  - Border color: `rgba(255, 213, 151, 0.5)`
  - Shadow: `0 12px 24px -10px rgba(255, 213, 151, 0.15)`.

---

### 3.5 Buttons, Inputs, Sliders & Tabs
- **Primary Action Button (`.btn-primary`)**:
  - Background: `#FFD597`, text: `#432C00` (deep bronze/black), font: `label-md` bold, uppercase tracking.
  - Hover: Background `#FFC83D`, glowing shadow `0 0 15px rgba(255, 213, 151, 0.35)`.
- **Secondary / Ghost Buttons**:
  - Background: `surface-container-highest/30`, border: 1px solid `border/50`, text: `primary`.
  - Hover: Background `#FFD597`, text `#432C00`.
- **Text Inputs & Textareas**:
  - Background: `#090909` (`bg-main`), border: 1px solid `#2B2B2B`.
  - Font: `JetBrains Mono` text-xs or text-sm, text: `#FFD597` or `#F5F5F5`.
  - Focus: Border `#FFD597`, ring 1px `rgba(255, 213, 151, 0.5)`.
- **Range Slider (`input[type=range]`)**:
  - Track: 6px height, background `#251e15`, border 1px solid `#2B2B2B`, rounded 2px.
  - Thumb: 18x18px square, background `#FFD597`, box-shadow `0 0 8px rgba(255, 213, 151, 0.5)`.
- **Tabs (`role="tablist"`)**:
  - Segmented control in recessed container (`bg-bg-main p-xs rounded border border-border/60`).
  - Active Tab: Border 1px solid `#FFD597`, background `rgba(255, 213, 151, 0.20)`, text `#FFD597`, font-bold, uppercase.
  - Inactive Tab: Border 1px solid `border/50`, background `surface-container-lowest`, text `text-secondary`, hover: text `on-surface`.

---

## 4. Homepage Layout & Structure

*(Screenshot Reference: [00-homepage-desktop.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/00-homepage-desktop.png) & [00-homepage-mobile.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/00-homepage-mobile.png))*

### 4.1 Top Navigation Bar
- Fixed top navigation with backdrop blur (`bg-background/90 backdrop-blur-md border-b border-border/50`).
- Left: Monospace bold brand `C.A.S.T.L.E.`.
- Center: Navigation links (`Home` [active gold border], `Tools`, `Categories`, `Learn`, `About`).
- Right: Search, Source Code (`code`), Theme Mode (`dark_mode`) icon buttons, and "Launch Castle" CTA.

### 4.2 Hero Section
- Armor-plate card banner (`max-w-7xl mx-auto`).
- Left 60%: Title `BUILD YOUR DIGITAL FORTRESS`, subtitle describing tactical analysis and encrypted communication, and "Explore Modules" button.
- Right 40%: Interactive Three.js WebGL canvas displaying a rotating golden wireframe keep/castle turret mesh with ambient breathing opacity.

### 4.3 Search & Category Filter Bar
- Full-width monospace search input: `Search tools, decoders, generators, scanners...` with search glyph.
- Category filter pill bar: `All Tools` (active), `Authentication`, `Web Security`, `Encryption`, `Utilities`.

### 4.4 Tool Cards Grid
A 3-column responsive grid containing 5 tool modules:
1. **Password**: Auth tag, `FLAGSHIP` badge, key icon, description ("See how strong your password really is..."), Launch button.
2. **AES Studio**: Crypto tag, `Intermediate` badge, lock icon, description ("Encrypt any file or message..."), Launch button.
3. **Hash Toolkit**: Crypto tag, `Beginner` badge, fingerprint icon, description ("Check whether a file has been corrupted..."), Launch button.
4. **JWT Decoder & Verifier**: Web tag, `Intermediate` badge, code icon, description ("See exactly what's inside a login token..."), Launch button.
5. **URL Structure Analyzer**: Utils tag, `Intermediate` badge, link icon, description ("Paste a suspicious link and see the specific tricks..."), Launch button.

### 4.5 Footer
- Bottom bar containing `C.A.S.T.L.E.` brand, copyright (`© 2026 Castle Protection Platform`), and links (`GitHub`, `Documentation`, `Privacy`, `License`).

---

## 5. Detailed Design of All Five Tools

### 5.1 Tool 1: Password (Auth-01 Flagship)

*(Screenshot References: [01-password-generate.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/01-password-generate.png), [01-password-learn.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/01-password-learn.png), [01-password-result.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/01-password-result.png), [01-password-analysis.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/01-password-analysis.png), [01-password-mobile.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/01-password-mobile.png))*

#### Workspace Architecture
- Header: Module tag `MODULE // AUTH-01 FLAGSHIP`, close icon button.
- Privacy Banner: `Everything is generated locally inside your browser. Nothing leaves your device.`
- Main Tab Selector:
  - `Tab 1: Create Password` (`#pw-tab-panel-create`)
  - `Tab 2: Analyze Password` (`#pw-tab-panel-analyze`)

#### Tab 1: Create Password Elements
- **Quick Presets Bar**: `⚡ Max Security` (24 chars, all sets), `🧠 Max Memorability` (Memory-assisted mode).
- **Generation Method Grid (6 Cards)**:
  1. `Fully Random`: Cryptographically secure randomness via `crypto.getRandomValues`.
  2. `Memorable Word`: Single word transformed and padded with random characters.
  3. `Phrase Based`: High-entropy derivation inspired by personal phrase.
  4. `Initialism`: Derives password from initials of a sentence mixed with salt.
  5. `Theme Based`: Thematic dictionaries (Space, Ocean, Technology, Nature, Mountains, Fantasy).
  6. `Memory Assisted`: Castle Signature feature: 3–5 conversational memory prompts.
- **Specific Method Input Container**: Dynamically switches based on selected card.
- **Advanced Configuration**:
  - Length slider (4 to 128 characters) with live badge readout.
  - Character pool checkboxes: Uppercase, Lowercase, Numbers, Symbols.
  - Checkbox: "Exclude Ambiguous Characters (l, 1, I, O, 0, o, |)".
- **Output Display**:
  - Large monospace display with show/hide password toggle, regenerate button, and one-click copy button.
  - Action button: `GENERATE PASSWORD`.
- **Dual Independent Meters**:
  - `1. Cryptographic Strength Meter`: 4 segmented bars, rated from `WEAK` to `FORTRESS (UNBREAKABLE)`.
  - `2. Human Memorability Meter`: Continuous gauge (0% to 100%) measuring cognitive recall based on linguistic chunking.
  - Metrics Grid: Entropy (bits), Estimated Offline Crack Time ($10^{11}$ GPU hashes/sec), Character Distribution badges (Upper, Lower, Num, Sym).
- **Collapsible "Why this password?" Section**:
  - Accordion detailing Shannon entropy calculations, brute-force math, and human recall factors.
- **Session Password History**:
  - Log of recently generated passwords during the session.

#### Tab 2: Analyze Password Elements
- Input field to evaluate any custom or pasted password.
- Real-time dual meters (Cryptographic Strength and Memorability score).
- Flaw scanner: Pattern badges (repeated characters, sequential digits, common words).
- Identified weaknesses checklist (red warning glyphs) and recommendation cards.
- Smart recommended upgrade box: Suggests a structure-preserving enhanced password with a "Copy Upgrade" button.

---

### 5.2 Tool 2: Hash Toolkit (Crypto-02 Unified)

*(Screenshot References: [02-hash-learn.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/02-hash-learn.png), [02-hash-generate.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/02-hash-generate.png), [02-hash-verify.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/02-hash-verify.png), [02-hash-result.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/02-hash-result.png), [02-hash-mobile.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/02-hash-mobile.png))*

#### Workspace Architecture
- Header: Module tag `MODULE // CRYPTO-02 UNIFIED`, title `Hash Toolkit`.
- Privacy Banner: `Runs entirely in your browser — nothing you upload here ever leaves your device.`
- ARIA Tablist: `Learn`, `Generate`, `Verify`.

#### Tab 1: Learn Panel
- Plain-language explainer card: "What is a Hash?" (analogies of digital fingerprints and one-way mathematical traps).
- **Live Avalanche Effect Demo**: Interactive text input (`#hash-learn-input`) that recalculates SHA-256 live as the user types, highlighting character bitflips with an instructional hint.
- "Where You'll Actually See This": 4 real-world cards (Password storage, File downloads, Git commits, Docker images).

#### Tab 2: Generate Panel
- Source Toggle: `Text Mode` vs `File Mode`.
- Text input textarea or file drag-and-drop zone (chunked 4MB stream reader).
- Multi-Algorithm Checkboxes:
  - `MD5` (annotated with broken security warning badge).
  - `SHA-1` (annotated with broken security warning badge).
  - `SHA-256` (checked by default).
  - `SHA-512`.
- Asynchronous progress bar with percentage indicator.
- Results Area: Individual algorithm cards displaying full hexadecimal digests with one-click copy buttons.

#### Tab 3: Verify Panel
- Mode Toggle: `Compare to a known hash` (Mode A) vs `Compare two files` (Mode B).
- **Mode A View**:
  - File drag-and-drop zone.
  - Expected hash input field with automatic length-based algorithm detector (32 hex = MD5, 40 hex = SHA-1, 64 hex = SHA-256, 128 hex = SHA-512).
  - Progress bar and explicit Green (Match) or Red (Mismatch) result banner.
- **Mode B View**:
  - Dual side-by-side dropzones (File A & File B).
  - Parallel SHA-256 computing progress bar.
  - Binary equivalence match verdict banner.

---

### 5.3 Tool 3: AES Studio (Crypto-03 Symmetric Workbench)

*(Screenshot References: [03-aes-learn.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/03-aes-learn.png), [03-aes-encrypt.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/03-aes-encrypt.png), [03-aes-decrypt.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/03-aes-decrypt.png), [03-aes-result.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/03-aes-result.png), [03-aes-mobile.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/03-aes-mobile.png))*

#### Workspace Architecture
- Header: Category `Cryptography workspace`, title `AES Studio`.
- Privacy Banner: `Everything happens locally inside your browser. Castle never stores or uploads your files, text, or passphrases.`
- ARIA Tablist: `Learn`, `Encrypt`, `Decrypt`.

#### Tab 1: Learn Panel
- 4 conceptual cards: `Encryption vs Hashing`, `Why AES-256-GCM`, `Keys, salt, and IV`, `Symmetric encryption`.
- **Why Encryption Mode Matters (Canvas Demo)**: Two side-by-side HTML5 canvas elements:
  - ECB Canvas: Renders pattern-retaining image demonstrating block correlation leaks.
  - GCM Canvas: Renders true pseudo-random noise with authentication tag protection.
- Two-way encryption pipeline diagram (Plaintext → AES-256-GCM → Ciphertext).
- **Advanced AES Round Visualizer**: Collapsible panel mapping a sample 16-byte string (`castle`) into a 4x4 state matrix, stepping through the 14 rounds of AES-256 (`SubBytes`, `ShiftRows`, `MixColumns`, `AddRoundKey`).

#### Tab 2: Encrypt Panel
- Source Toggle: `Text` vs `File`.
- Plaintext textarea or file upload dropzone.
- Security advisor notice.
- Key Derivation Mode Toggle:
  - `Passphrase Mode`: Input field with real-time strength analysis, PBKDF2 derivation (250,000 iterations, random 16-byte salt), and "Generate strong passphrase" bridge to Password tool.
  - `Random Key Mode`: Generates 256-bit random key with explicit recovery warning.
- "Encrypt locally" primary action button.
- Progress bar and output container: Displays Base64 Castle JSON envelope, copy button, download `.castle` file action, and "Generate integrity hash" bridge button to Hash Toolkit.

#### Tab 3: Decrypt Panel
- Ciphertext textarea or `.castle` file upload dropzone.
- Automatic mode indicator (identifies passphrase vs random key from envelope metadata).
- Decryption secret input field.
- "Decrypt locally" action button.
- Progress bar and restored output viewer.
- "Verify this file in Hash Toolkit" bridge button (hands restored file directly into Hash Verifier without re-upload).

---

### 5.4 Tool 4: JWT Decoder & Verifier (Web Security)

*(Screenshot References: [04-jwt-learn.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/04-jwt-learn.png), [04-jwt-decode-verify.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/04-jwt-decode-verify.png), [04-jwt-build.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/04-jwt-build.png), [04-jwt-result.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/04-jwt-result.png), [04-jwt-mobile.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/04-jwt-mobile.png))*

#### Workspace Architecture
- Header: Category `Web Security workspace`, title `JWT Decoder & Verifier`.
- Privacy Banner: `Castle itself makes zero network requests involving your token, secret, or decoded data... Closing or resetting this tool clears the token and secret from the page's active state.`
- ARIA Tablist: `Learn`, `Decode & Verify`, `Build`.

#### Tab 1: Learn Panel
- Section A: "What is a JSON Web Token?" with red alert emphasizing that **Base64URL is encoding, not encryption**.
- Section B: **Interactive Token Anatomy**: Color-coded token string (Red Header, Gold Payload, Blue Signature) with interactive hover tooltips displaying decoded JSON structures.
- Section C: "Decoded ≠ Verified" contrast banners.
- Section D: Live Tampering Sandbox demonstrating how payload edits immediately break signature validity.

#### Tab 2: Decode & Verify Panel
- Paste JWT textarea with sample placeholder.
- Parsed Results Container:
  - One-line English token summary (`Token for 'castle123', issued by 'unknown issuer', no expiration, signed via HS256`).
  - Duplicate claim warning banner.
  - Signature verification status banner (`✓ SIGNATURE VERIFIED` or `⚠ SIGNATURE INVALID`).
  - Live expiration countdown badge.
  - Side-by-side Decoded Header and Decoded Payload JSON blocks.
  - HMAC secret input field with algorithm dropdown (`HS256`, `HS384`, `HS512`).
  - **Token Status Panel**: Structure, Algorithm, Expiration, Signature, Secret Strength, Sensitive Fields scan.
  - Collapsible Claims Details & Translations table.

#### Tab 3: Build Panel
- Custom JWT builder form: Subject (`sub`), Role (`role`), Issuer (`iss`), Expiration dropdown (15m, 1h, 24h, 7d), Algorithm select, Issued At epoch (`iat`), HMAC Signing Secret.
- "Generate Signed JWT" action button.
- Preview boxes for generated Header, Payload, and signed token output field.
- "Analyze This Token →" handoff button (pre-loads token and secret directly into Decode & Verify tab).

---

### 5.5 Tool 5: URL Structure Analyzer (Utilities)

*(Screenshot References: [05-url-learn.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/05-url-learn.png), [05-url-analyze.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/05-url-analyze.png), [05-url-build.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/05-url-build.png), [05-url-result.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/05-url-result.png), [05-url-mobile.png](file:///d:/Projects/cybersecurity-toolkit/design-handoff/screenshots/05-url-mobile.png))*

#### Workspace Architecture
- Header: Category `Utilities workspace`, title `URL Structure Analyzer`.
- ARIA Tablist: `Learn`, `Analyze`, `Build`.

#### Tab 1: Learn Panel
- "What is phishing?" explainer.
- **Anatomy of a URL**: Colored components (`Protocol`, `Subdomain`, `Domain`, `TLD`, `Path`, `Query string`) with interactive tooltips explaining which part reveals true control.
- **Glossary Grid**: 8 expandable term cards (`Domain`, `Subdomain`, `TLD`, `Homoglyph`, `Typosquatting`, `URL Shortener`, `Punycode`, `HTTPS`).
- Attacker 5-step deceptive playbook.
- **Spot the Difference Quiz**: 6-question interactive laboratory challenging users to identify authentic domains vs typosquatted lookalikes (e.g. `paypal.com` vs `paypa1.com`), tracking session score.
- Emergency advice if a phishing link was already clicked.

#### Tab 2: Analyze Panel
- URL input field (`#url-phishing-input`).
- Heuristics inspection results:
  - **Structural Risk Score** (0 to 100) with rating label.
  - Deceptive signal callouts (Suspicious subdomain structure, Brand name with unexpected TLD, IP host, etc.).
  - External reputation validation links (Google Safe Browsing, VirusTotal).
- Collapsible URL encode/decode utility.

#### Tab 3: Build Panel (Safe Phishing Simulator)
- Safe simulation disclaimer (modifies text locally on screen; no remote server is contacted).
- Base target domain (`paypal.com`).
- Deception trick buttons: `Swap a character`, `Add fake subdomain`, `Insert @ trick`, `Use suspicious TLD`, `Add excessive subdomains`, `Reset`.
- Live simulated address display and real-time vulnerability explanation of the applied deception trick.

---

## 6. Cross-Tool Integrations & Bridges

Castle features seamless client-side data bridges between tools:
1. **Password → AES Studio Bridge**: When configuring passphrase encryption in AES Studio, clicking "Generate strong passphrase" opens the Password tool to generate high-entropy credentials.
2. **AES Studio → Hash Toolkit Integrity Bridge**: After encrypting a file, clicking "Generate integrity hash" uses `window.CastleHashEngine.hashFile` to calculate SHA-256 without re-reading bytes.
3. **AES Studio → Hash Toolkit Verification Bridge**: After decrypting a file in AES Studio, clicking "Verify this file in Hash Toolkit" calls `window.openHashToolkitVerify(restoredFile)`, opening Hash Toolkit on Verify Mode A with the restored file already preloaded.
4. **JWT Build → JWT Decode Handoff**: Creating a custom signed token in the JWT Build tab immediately feeds the token and secret into the Decode & Verify tab via "Analyze This Token →".

---

## 7. Accessibility, Responsive & Technical Implementation

- **Keyboard Navigation**: All modal workspaces support closing via `Escape`. Tabs have full ARIA role bindings (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`) with roving focus.
- **Responsive Layouts**: Tested and validated on Desktop (1440 × 1000) and Mobile (390 × 844). Modals maintain maximum vertical height (`max-h-[92vh]`) with smooth inner scrolling on touch devices.
- **Zero Third-Party Tracking**: No analytics, trackers, or remote APIs. Google Fonts and Tailwind CSS are loaded client-side. Web Crypto executes natively on the user's CPU.

---

## 8. Summary of Screenshots Reference Index

| Filename | Dimensions | Screen / View Description |
|:---|:---:|:---|
| `00-homepage-desktop.png` | 1440 × 1000 | Homepage hero with 3D keep, search bar, and 5 tool cards |
| `00-homepage-mobile.png` | 390 × 844 | Mobile responsive homepage layout |
| `01-password-generate.png` | 1440 × 1000 | Password Tab 1: Create Password (presets, 6 methods, length slider) |
| `01-password-learn.png` | 1440 × 1000 | Password Educational: "Why this password?" open with entropy/crack math |
| `01-password-result.png` | 1440 × 1000 | Password Generated State: populated output with dual meters |
| `01-password-analysis.png` | 1440 × 1000 | Password Tab 2: Analyze Password (live audit, flaws, recommendations) |
| `01-password-mobile.png` | 390 × 844 | Mobile Password workspace |
| `02-hash-learn.png` | 1440 × 1000 | Hash Toolkit Tab 1: Learn (What is a Hash, live avalanche demo, real-world cards) |
| `02-hash-generate.png` | 1440 × 1000 | Hash Toolkit Tab 2: Generate (Text/File modes, 4 algorithms) |
| `02-hash-result.png` | 1440 × 1000 | Hash Toolkit Result State: generated MD5, SHA-1, SHA-256, SHA-512 digests |
| `02-hash-verify.png` | 1440 × 1000 | Hash Toolkit Tab 3: Verify (Mode A and Mode B) |
| `02-hash-mobile.png` | 390 × 844 | Mobile Hash Toolkit workspace |
| `03-aes-learn.png` | 1440 × 1000 | AES Studio Tab 1: Learn (ECB vs GCM canvas demo, 14-round visualizer) |
| `03-aes-encrypt.png` | 1440 × 1000 | AES Studio Tab 2: Encrypt (Plaintext, passphrase derivation, advisor) |
| `03-aes-result.png` | 1440 × 1000 | AES Studio Result State: encrypted `.castle` ciphertext envelope & bridges |
| `03-aes-decrypt.png` | 1440 × 1000 | AES Studio Tab 3: Decrypt (Ciphertext input, file dropzone, secret input) |
| `03-aes-mobile.png` | 390 × 844 | Mobile AES Studio workspace |
| `04-jwt-learn.png` | 1440 × 1000 | JWT Decoder Tab 1: Learn (Token anatomy tooltips, tampering sandbox) |
| `04-jwt-decode-verify.png` | 1440 × 1000 | JWT Decoder Tab 2: Decode & Verify (Parsed claims, countdown, checklist) |
| `04-jwt-build.png` | 1440 × 1000 | JWT Decoder Tab 3: Build (Token generator, header/payload preview, signing) |
| `04-jwt-result.png` | 1440 × 1000 | JWT Decoder Result State: verified HS256 token with valid signature badge |
| `04-jwt-mobile.png` | 390 × 844 | Mobile JWT Decoder workspace |
| `05-url-learn.png` | 1440 × 1000 | URL Analyzer Tab 1: Learn (URL anatomy, glossary, Spot the Difference quiz) |
| `05-url-analyze.png` | 1440 × 1000 | URL Analyzer Tab 2: Analyze (URL input, encode/decode utility) |
| `05-url-build.png` | 1440 × 1000 | URL Analyzer Tab 3: Build (Safe phishing deception simulator) |
| `05-url-result.png` | 1440 × 1000 | URL Analyzer Result State: analyzed deceptive URL with risk flags |
| `05-url-mobile.png` | 390 × 844 | Mobile URL Analyzer workspace |
