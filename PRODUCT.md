# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

CASTLE is built to serve users across different levels of technical experience:

1. **Complete Beginners**: Everyday individuals with little or no cybersecurity background who need practical, accessible security utilities and clear, jargon-free explanations.
2. **Students & Learners**: Computer science, engineering, and cybersecurity students seeking to understand foundational principles (symmetric encryption, one-way hash functions, block cipher modes, Shannon entropy, token architecture).
3. **Academic & Project Evaluators**: Technical reviewers and professors who may or may not specialize in cybersecurity, requiring an immediate understanding of each module's purpose alongside verifiable technical depth.
4. **Developers & Security Practitioners**: Engineers who need quick, dependable client-side utilities (JWT inspection, hash verification, key derivation, password auditing) with direct access to accurate metrics and uncompromised underlying mechanics.

## Product Purpose

CASTLE is a browser-based cybersecurity learning and evaluation workstation that combines practical security utilities with interactive educational experiences.

The application contains five functional security modules. The primary design objective is to improve the overall user experience by making the interface clearer, more cohesive, more intuitive, and significantly less visually overwhelming.

The core challenge being addressed is clutter within the **Learn tabs and educational workspaces**, where dense information dumps create cognitive overload. CASTLE's objective is to reduce this clutter and present information progressively while strictly preserving the application's technical depth, capabilities, and local browser-based architecture.

## Positioning

Unlike conventional "black-box" converter utilities (such as CyberChef or basic encoders) that perform opaque transformations without explanation, and unlike purely theoretical security blogs that lack practical utilities, CASTLE bridges practical tools directly with interactive visual simulations (AES 14-round state matrix stepper, ECB vs. GCM canvas demonstration, live JWT tampering sandbox, Shannon entropy sandbox) executed locally inside the browser.

## Operating Context

- Single-page web application executing client-side in the user's browser.
- Core cryptographic operations, file parsing, and analytical workflows execute locally using native browser capabilities (`window.crypto.subtle`, `window.crypto.getRandomValues`, `FileReader`).
- High-contrast, tactical command-center interface optimized for low-light environments across desktop and mobile screens.

## Capabilities and Constraints

### Confirmed Functional Capabilities (Immutable)
- **Password Studio**: Generation (6 strategies, including CASTLE's deterministic SHA-256 Memory-Assisted mode) and Analysis (live Shannon entropy calculation, GPU offline brute-force crack-time modeling, dual strength/memorability meters, weakness checklists).
- **Hash Toolkit**: Multi-algorithm digest generation (SHA-1, SHA-256, SHA-512 via native Web Crypto; MD5 pure-JS fallback with broken-crypto warnings) with 4MB chunked asynchronous file reading, plus Mode A (known hash) and Mode B (dual file comparison) verification.
- **AES Studio**: AES-256-GCM symmetric encryption with PBKDF2 key derivation (250,000 iterations, 16-byte salt, 12-byte IV), `.castle` Base64 JSON package export, dual ECB/GCM canvas comparison, and interactive 16-byte 14-round state matrix stepper (`SubBytes`, `ShiftRows`, `MixColumns`, `AddRoundKey`).
- **JWT Decoder & Verifier**: Base64URL parsing, HMAC secret verification (HS256, HS384, HS512), expiration countdown, sensitive field scanning, token builder, and live tampering signature sandbox.
- **URL Structure Analyzer**: Punycode/homoglyph detection (`xn--`), deceptive subdomain and TLD checks, non-standard port flags, heuristic scoring (0–100), security glossary, domain quiz, and safe phishing simulator.

### Strict Functionality & Security Boundaries
- **Behavioral Preservation Invariant**: Zero changes to cryptographic algorithms, key derivation, hashing, encryption, decryption, signing, verification logic, calculations, mathematical transformations, analysis models, or processing pipelines.
- **Preserve Simulation Mechanics**: Zero changes to the underlying logic, event handlers, state transitions, or mathematical output of interactive simulations (AES round stepper, ECB/GCM canvases, JWT tampering sandbox, password meters, hash verification).
- **Never Replace or Cripple Features**: Do not replace functioning interactive visualizations with static illustrations, remove working features to simplify layouts, or turn active controls into decorative elements.
- **DOM & Script Safeguards**: Preserve critical element IDs, CSS selector dependencies, event targets, and module structures. Visual adjustments must never inadvertently break JavaScript event bindings.
- **Permitted Presentation Scope**: Refine HTML structure, CSS styling, typography, spacing, visual hierarchy, responsive layout, non-functional explanatory copy, labels, headings, static educational content organization, visual control styling, accessibility, and purposeful transitions.

## Brand Commitments

- **Name**: CASTLE (finalized name; early working titles "Armor" and "Protection Hub" are historical and deprecated).
- **Visual Identity**: High-contrast, tactical command-center cybersecurity aesthetic.
- **Color Palette**: Root black (`#000000`), dark tactical cards (`#0D0D0D`, `#0A0A0A`), primary accent orange (`#FF6A00`), emerald status indicator (`#10B981`), cyan telemetry accents (`#89CEFF`), and subtle hairline borders (`#1A1A1A`).
- **Typography**: Space Grotesk (display & section headers), Inter (body UI & instructions), JetBrains Mono (code, cryptographic keys, technical telemetry).
- **Signature Motif**: Three.js 3D interactive wireframe castle keep in the hero section (preserved as an anchor brand element; framing and responsiveness may be polished, but canvas behavior remains intact).
- **Personality**: Technical, trustworthy, precise, educational, modern, and distinctive. Explicitly avoid generic AI-generated dashboard tropes, gratuitous gradients, excessive glows, redundant nested cards, or decorative clutter.

## Evidence on Hand

- `index.html`: Fully functioning client-side dashboard with 5 modal workspaces and Three.js canvas.
- `js/`: Modular JavaScript implementations across all 5 security modules (`js/aes/`, `js/hash/`, `js/jwt/`, `js/password/`, `js/url-phishing/`, `js/ui/`).
- `design-handoff/`: Design specifications, source maps, and captured screen inventories.
- `README.md` & `PROJECT_VISION.md`: Architectural documentation and module specifications.

## Product Principles

### 1. Easy at First Glance, Technically Rewarding in Depth
The interface must welcome beginners without alienating experts. Primary headings and first-level content provide clear, jargon-free explanations of what a tool does and why it matters. Deeper technical rigor, algorithmic details, and mathematical models reward those who explore further.

### 2. Progressive Technical Depth
Educational material is organized into conceptual layers rather than overwhelming single-page dumps:
- **Understand**: Concise, accessible explanation of the concept, purpose, and real-world significance.
- **Explore**: Concrete examples, real-world analogies, visual explanations, or guided demonstrations.
- **Go Deeper**: Rigorous technical terminology, mathematical proofs, algorithmic steps, assumptions, and limitations.

### 3. Accuracy Without Intimidation
Simplify the language, not the underlying science. Retain correct technical terminology, essential security caveats, mathematical accuracy, and real-world limitations. Introduce unfamiliar terms naturally in context rather than diluting technical truth or overwhelming beginners with unformatted jargon.

### 4. Intelligent De-Cluttering Over Indiscriminate Deletion
Reduce cognitive overload by summarizing verbose paragraphs, removing redundant text, improving visual grouping, and using progressive disclosure (accordions, collapsible cards, stepped walkthroughs). Never delete or hide information essential for understanding a security concept, operating a tool safely, or interpreting results.

### 5. Behavioral & Architecture Immutability
Design passes must never compromise or modify the underlying cryptographic logic, mathematical models, client-side processing architecture, or interactive simulation mechanics.

### 6. Tactical Precision & Purposeful Motion
Preserve the focused black-and-orange visual identity. Animations and micro-interactions must serve clear functional purposes—communicating state changes, guiding attention, and providing feedback—without adding visual noise, causing sluggishness, or violating reduced-motion preferences.

## Accessibility & Inclusion Objectives

Accessibility is an active design goal requiring inspection and systematic improvement:
- **Contrast & Legibility**: Ensure readable text contrast ratios against dark backgrounds and appropriate sizing for technical monospace output.
- **Keyboard Navigation & Focus**: Verify and refine visible focus states, tab navigation order, and modal focus trapping / Escape-to-close behavior across all workspaces.
- **Clear Feedback States**: Provide accessible labels and unambiguous feedback for loading, copying, error conditions, and tool execution.
- **Reduced Motion**: Strictly respect `prefers-reduced-motion` across all UI transitions and canvas animations.
- **Responsive Ergonomics**: Ensure touch-friendly controls, readable typography, and adaptive layouts across mobile, tablet, and desktop viewports.

