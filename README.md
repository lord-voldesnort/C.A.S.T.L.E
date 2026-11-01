# 🛡️ C.A.S.T.L.E. — Cybersecurity Toolbox Platform

Welcome to **C.A.S.T.L.E.**, a modern, high-tech, browser-based **Cybersecurity Toolkit** designed for real-world utility and deep educational exploration. 

Inspired by the intuitive user interface model of **iLovePDF** and designed with a premium, low-light Command Center aesthetic, C.A.S.T.L.E. provides a grid of focused security modules. All cryptographic and analytical tasks are executed **locally and client-side** inside the user's browser, ensuring absolute data privacy.

---

## 🎓 The Core Differentiator: Interactive "Learn" Engine
Unlike typical cybersecurity tools (like CyberChef or basic online encoders) that simply act as black-box converters, **C.A.S.T.L.E. acts as an interactive learning environment.** 

Every single tool features a dedicated **"Learn" Workspace** designed to demystify complex security concepts through interactive widgets, live visual flowcharts, side-by-side analogies, and step-by-step mathematical simulations:
* **Password Analyzer & Generator**: Features a live Shannon Entropy sandbox and password complexity visualizer. Users see in real-time how characters shift the logarithmic keyspace and crack-time metrics under different threat models (offline vs. online brute force).
* **AES Studio**: Contains a custom canvas simulation demonstrating ECB vs. GCM mode vulnerability (the famous ECB Penguin vulnerability), along with an **interactive 16-byte block round visualizer** displaying mathematical state transformations.
* **Hash Toolkit**: Compares hashing against encryption with real-world analogies (e.g. padlocks vs. fingerprints), explaining the mathematics of collision resistance, one-way functions, and cryptographic checksum validation.
* **JWT Decoder**: Explains how JWT signatures work and lets users simulate token-tampering. It includes an interactive playground demonstrating the historic "none" algorithm signature bypass vulnerability.
* **URL Structure Analyzer**: Breaks down how attackers trick human users (e.g. typosquatting, subdomains, homoglyphs) with clear visual breakdowns of malicious structures and heuristics scoring.

---

## 🔒 Focus: AES Studio & The Advanced Round Visualizer

The **AES Studio** includes a highly detailed visualizer that demonstrates block cipher operations step-by-step, helping users understand standard symmetric encryption.

```
Plaintext State Grid (4x4 Matrix)
┌───┬───┬───┬───┐
│63 │72 │73 │74 │   1. SubBytes   ➔ Uses FIPS 197 S-Box matrix to substitute bytes
├───┼───┼───┼───┤
│61 │65 │6c │65 │   2. ShiftRows  ➔ Cyclically shifts rows by offsets (0, 1, 2, 3)
├───┼───┼───┼───┤
│73 │74 │6c │65 │   3. MixColumns ➔ Multiplies columns in Galois Field (GF(2^8))
├───┼───┼───┼───┤
│20 │20 │20 │20 │   4. AddRoundKey➔ Bitwise XORs state matrix with round subkey
└───┴───┴───┴───┘
```

### 1. The ECB vs. GCM Canvas Visualizer (Why Mode Matters)
Under the **WHY** tab, the platform uses two HTML5 Canvas elements to visually explain block cipher modes of operation:
* **The ECB (Electronic Codebook) Canvas**: Simulates encrypting an image (like a castle logo or security icon) block-by-block. Because ECB encrypts identical plaintext blocks into identical ciphertext blocks, the canvas demonstrates that the overall pattern/shape remains visible, revealing the underlying data.
* **The GCM (Galois/Counter Mode) Canvas**: Simulates encrypting the same image using GCM. Because GCM incorporates a unique Initialization Vector (IV) and counters, the canvas displays complete, randomized white noise. It also illustrates how the GCM Authentication Tag functions as a tamper-evident seal.

### 2. The Interactive 16-Byte Internal Round Visualizer
Under the **HOW** tab, users can enter any 16-character string (such as `"castle"`) and watch the visualizer map it into a $4 \times 4$ byte state matrix. The simulator then steps through the **14 internal transformation rounds** of AES-256:
* **State Initialization**: Translates character bytes into hexadecimal values and populates a $4 \times 4$ grid column-by-column.
* **Round-by-Round Step Control**: Users can click "Next Step" or "Next Round" to watch the values change color and transform inside the state grid.
* **Visualizing the Four AES Transformations**:
  1. **`SubBytes`**: Highlighted cells map their byte index to the FIPS 197 S-Box array, replacing values (e.g. `0x63` maps to `0x99`).
  2. **`ShiftRows`**: An animated rotation of rows. Row 0 remains unchanged, Row 1 shifts left by 1 byte, Row 2 by 2 bytes, and Row 3 by 3 bytes.
  3. **`MixColumns`**: Simulates column-by-column matrix multiplication inside Galois Field ($GF(2^8)$) to diffuse data patterns across columns.
  4. **`AddRoundKey`**: Executes a bitwise XOR operation between the state matrix and the generated subkey for that round.

---

## 🛠️ Detailed Tool Breakdown & Mechanisms

### 1. 🔑 Password (Unified Creation & Analysis)
* **Secure Randomness**: Utilizes `window.crypto.getRandomValues()` to pull cryptographically strong pseudo-random numbers directly from the operating system's entropy pool (rather than using the predictable `Math.random()`).
* **Generation Presets**:
  * **Fully Random**: Generates passwords directly from selected pools (uppercase, lowercase, digits, symbols).
  * **Memorable Word**: Blends a user-provided word with random character splits, padding, and case transformations.
  * **Initialism**: Takes the first letter of each word in a user-provided sentence and mixes in symbol salt.
  * **Memory-Assisted**: Castle’s signature feature. It prompts the user with 3-5 custom questions and deterministically hashes the consolidated answers browser-side using SHA-256 to produce an unguessable but recoverable passcode.
* **Entropy Math**: Computes Shannon entropy ($H = L \log_2(R)$ where $L$ is length and $R$ is the size of the character pool). 
* **GPU Crack Time**: Converts entropy into total guess combinations ($2^H$) and divides by common cracker thresholds (e.g., $10^6$ hashes/sec for a desktop CPU up to $10^{11}$ hashes/sec for a professional offline GPU cracking rig) to present a realistic timeline of password durability.

### 2. 🔒 AES Studio (Cryptographic Workbench)
* **Web Crypto API**: Interfaces directly with browser-optimized native algorithms via `crypto.subtle`.
* **Key Derivation (PBKDF2)**: When a passphrase is typed, the system generates a random 16-byte salt and uses **PBKDF2** (Password-Based Key Derivation Function 2) with **HMAC-SHA-256** and **250,000 iterations** to derive a 256-bit symmetric key.
* **Encryption Mode (AES-256-GCM)**: Uses AES in Galois/Counter Mode (GCM). A unique, random 12-byte Initialization Vector (IV) is generated for each operation. GCM provides authenticated encryption, meaning it generates a message authentication tag that prevents tampering with the encrypted content.
* **File Processing**: Reads files progressively using the `FileReader` API as an `ArrayBuffer`. Large files are read in chunks to prevent page stuttering.
* **Output Envelope**: Packs the encrypted ciphertext, the PBKDF2 salt, the IV, and original file metadata into a custom JSON-formatted `.castle` file, encoded in Base64 for safe transit.

### 3. 🧬 Hash Toolkit (Integrity & Cryptography)
* **Digest Generation**: Utilizes the native browser `crypto.subtle.digest()` API for **SHA-1**, **SHA-256**, and **SHA-512**.
* **Legacy MD5 Support**: Since MD5 is cryptographically weak, it is not supported in modern Web Crypto implementations. Castle integrates a lightweight, pure-JavaScript implementation of MD5 (`js/hash/md5.js`) to support legacy checksum validation.
* **Asynchronous Chunking**: To prevent browser freezing when hashing large files (e.g., ISOs or videos), the toolkit splits files larger than 10MB into **4MB chunks**. It reads each chunk sequentially using `FileReader`, yielding control to the main UI thread via `setTimeout(..., 0)` between reads, maintaining a smooth progress indicator.
* **Hash Type Recognition**: Matches input lengths and hexadecimal characters using regular expressions (e.g., MD5 is recognized by 32 characters, SHA-1 by 40, SHA-256 by 64, and SHA-512 by 128 characters).

### 4. 🎟️ JWT Decoder & Verifier (Web Authentication)
* **Base64URL Parsing**: Splits the JWT string by the `.` delimiter. It uses a custom helper to parse Base64URL-encoded strings, handling URL-specific character mappings (`-` to `+`, `_` to `/`) and padding requirements.
* **Crypto Re-computation**: For HMAC verification, the tool imports the secret using Web Crypto API's `importKey` for the HS256 (`HMAC-SHA256`) algorithm. It then hashes the concatenated header and payload (`Header.Payload`) and compares the resulting signature byte-by-byte with the decoded signature from the token.
* **Simulation Engine**: Allows users to alter claims inside the decoded payload text area. As the user types, the UI immediately recomputes the expected signature, demonstrating how any tamper attempt breaks verification unless the attacker possesses the cryptographic secret.

### 🔗 5. URL Structure Analyzer (Web Security)
* **Native Browser Parsing**: Uses the JavaScript `URL` object constructor to reliably break down URL parts without brittle regex patterns.
* **Homoglyph & Unicode Checker**: Scans hostnames for Punycode encoding (prefixed with `xn--`) indicating internationalized domain names (IDNs) often used to spoof familiar brand characters (e.g., replacing Latin `o` with Cyrillic `о`).
* **Keyword Matching**: Searches the subdomain and path segments for brand keywords (e.g., "paypal", "netflix", "login") while verifying if the root domain actually belongs to that brand.
* **IP and Port Detection**: Flags URLs that use raw IP addresses (e.g., `192.168.1.1` or hex/octal representations) instead of domain names, or links routing traffic through unusual, non-web ports (ports other than 80 or 443).
* **Heuristics Scoring**: Tallies specific risk indicators, outputting a categorized list of flags (Severe, Moderate, Low) along with explanations of the tricks detected.

---

## 📂 Project Architecture

```
cybersecurity-toolkit/
├── index.html                   # Main single-page web app entry point
├── server.cjs                   # Zero-dependency local development server
├── .gitignore                   # Staging & deployment exclusion rules
├── README.md                    # Detailed overview & engine mechanisms
├── PROJECT_VISION.md            # Architectural background & roadmap
├── AES_STUDIO_PLAN.md           # Implementation blueprint for AES
├── AES_STUDIO_WALKTHROUGH.md    # Walkthrough of AES Studio features
├── URL_PHISHING_WALKTHROUGH.md  # Walkthrough of Phishing Analyzer features
├── designofwebsite/
│   ├── DESIGN.md                # Brand, typography, & color system
│   └── ...
└── js/                          # Javascript Application Layer
    ├── app.js                   # Navigation & global page management
    ├── aes/                     # AES Symmetric cryptosystem modules
    ├── hash/                    # Hash generators & verifiers
    ├── jwt/                     # JWT parser, crypto, & interactive labs
    ├── password/                # Entropy calculations & generator presets
    └── url-phishing/            # URL heuristics & link analysis modules
```

---

## 🚀 How to Run Locally

Since C.A.S.T.L.E. is completely client-side and requires zero build pipeline or backend database:

1. Open a terminal in the project directory.
2. Start the local development server:
   ```bash
   node server.cjs
   ```
3. Open `http://localhost:8000/` in any modern web browser (Chrome, Edge, Firefox, Safari).

Alternatively, `index.html` can be served with any static web server (such as Python's `python -m http.server 8000` or VS Code's Live Server).

---

## 🛡️ Status & Release

**Phase 4 Development Closure:** Complete, audited, and frozen. All 5 operational workspaces, 5 editorial Learn curricula, responsive layouts, motion system, and WebCrypto engines pass 100% of the regression test suite. Ready for Phase 5 hosting and deployment.
