/*
 * JWT Learn Tab Controller.
 * Manages the spacious educational curriculum:
 * - Chapter 00: Digital Passport narrative & 3-phase journey
 * - Chapter 01: Anatomical Deconstruction (Meet the Token - 3 colored segments & interactive tooltips)
 * - Chapter 02: Cryptographic Disambiguation (Base64URL Encoding vs Encryption)
 * - Chapter 03: The Core Tenet (The Central Truth: Decoded ≠ Verified)
 * - Chapter 04: Lab Bench (Interactive Tampering Sandbox with Avalanche effect)
 * - Chapter 05: Temporal Safety (Token Lifecycles & Interactive Timeline)
 * - Chapter 06: Vulnerability Surface (Common Pitfalls & 4 Defense Rules)
 * - Chapter 07: Knowledge Check Quiz (4 Interactive Technical Challenges)
 * - Chapter 08: Field Application (Tactical Handoffs to Decode & Build)
 */

window.CastleJwtLearn = window.CastleJwtLearn || {};

(function(exports) {
  'use strict';

  let hostContainer = null;
  let isTampered = false;
  let customSecretVal = "demo-secret";

  const segmentData = {
    header: {
      title: "Segment 01: The Header (JOSE Metadata)",
      meta: "ALGORITHM & TOKEN SPECIFICATION",
      desc: "Specifies cryptographic directives governing token verification. It informs the validating recipient which hashing algorithm was chosen (e.g. HS256, RS256) and confirms the wrapper standard (typ: \"JWT\"). It is serialized into Base64URL and contains zero confidentiality.",
      colorClass: "bg-red-500",
      textColor: "text-red-400",
      borderColor: "border-red-500"
    },
    payload: {
      title: "Segment 02: The Payload (Identity Claims)",
      meta: "CLAIMS & IDENTITY ATTRIBUTES",
      desc: "Contains JSON statements about the authenticated entity (user ID, roles, permissions) alongside temporal assertions like issued-at (iat) and expiration (exp). Because Base64URL is strictly encoding, claims are visible to any observer who inspects the wire traffic.",
      colorClass: "bg-brand-orange",
      textColor: "text-brand-orange",
      borderColor: "border-brand-orange"
    },
    signature: {
      title: "Segment 03: The Signature (Cryptographic Seal)",
      meta: "MATHEMATICAL INTEGRITY PROOF",
      desc: "Calculated by computing a cryptographic keyed-hash (HMAC) or asymmetric digital signature over the concatenated encoded header and encoded payload: HMAC_SHA256(Header + \".\" + Payload, Secret). If a single bit in the header or payload is modified, mathematical verification fails instantly.",
      colorClass: "bg-sky-500",
      textColor: "text-sky-400",
      borderColor: "border-sky-500"
    }
  };

  function init(container) {
    hostContainer = container;
    render();
    bindEvents();
  }

  function render() {
    if (!hostContainer) return;

    hostContainer.innerHTML = `
      <!-- ================= CURRICULUM TRACK NAVIGATOR ================= -->
      <nav aria-label="Curriculum Tracks" class="curriculum-chapter-stepper sticky top-0 z-20">
        <div class="flex items-center gap-2.5">
          <span class="size-2 rounded-full bg-brand-orange animate-pulse"></span>
          <span class="font-mono text-xs font-bold text-white uppercase tracking-wider">LESSON TRACKS:</span>
        </div>
        <div id="jwt-track-pills" class="chapter-steps-track" role="tablist">
          <button type="button" data-jwt-track="all" class="jwt-track-btn chapter-step-pill active">
            All Lessons
          </button>
          <button type="button" data-jwt-track="anatomy" class="jwt-track-btn chapter-step-pill">
            1. Anatomy &amp; Invariants
          </button>
          <button type="button" data-jwt-track="lab" class="jwt-track-btn chapter-step-pill">
            2. Interactive Labs
          </button>
          <button type="button" data-jwt-track="defense" class="jwt-track-btn chapter-step-pill">
            3. Defense &amp; Quiz
          </button>
        </div>
      </nav>

      <!-- ================= TRACK 01: ANATOMY & CORE CONCEPTS ================= -->
      <div id="jwt-track-section-anatomy" class="flex flex-col gap-6">
        <div class="editorial-read-canvas">
          <header class="editorial-header">
            <div class="editorial-kicker">
              <span class="editorial-kicker-dot"></span>
              <span>TRACK 01 // ANATOMY &amp; CRYPTOGRAPHIC INVARIANTS</span>
            </div>
            <h1 class="editorial-title">
              Understanding JSON Web Tokens: The Digital Passport
            </h1>
            <p class="editorial-lede">
              A JSON Web Token (JWT) is a compact, URL-safe container carrying cryptographically verified claims between disparate systems. APIs, single-page applications, and microservices employ it to verify identity without repeated database round-trips.
            </p>
          </header>

          <!-- ================= CHAPTER 00: DIGITAL PASSPORT HERO ================= -->
          <section class="editorial-section">
            <h2 class="editorial-heading">The 3-Phase Token Lifecycle</h2>
            <div class="editorial-prose">
              <p>
                In a modern decoupled architecture, identity verification proceeds through three distinct phases:
              </p>
            </div>

            <!-- 3-Step Real World Journey Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
              <div class="editorial-card-item">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-xs text-brand-orange font-bold uppercase">PHASE 01</span>
                  <span class="material-symbols-outlined text-zinc-500 text-[20px]">fingerprint</span>
                </div>
                <h3 class="font-mono text-sm text-white font-bold">User Authenticates</h3>
                <p class="font-sans text-xs text-zinc-400 leading-relaxed">
                  Client transmits credentials (username/password or MFA code) over TLS to the authorization gateway for initial identity assertion.
                </p>
              </div>

              <div class="editorial-card-item">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-xs text-brand-orange font-bold uppercase">PHASE 02</span>
                  <span class="material-symbols-outlined text-brand-orange text-[20px]">badge</span>
                </div>
                <h3 class="font-mono text-sm text-white font-bold">Passport Issued</h3>
                <p class="font-sans text-xs text-zinc-400 leading-relaxed">
                  Auth server encodes identity claims, seals them mathematically using its private key or HMAC secret, and returns a lightweight token string.
                </p>
              </div>

              <div class="editorial-card-item">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-xs text-emerald-400 font-bold uppercase">PHASE 03</span>
                  <span class="material-symbols-outlined text-emerald-400 text-[20px]">key_vertical</span>
                </div>
                <h3 class="font-mono text-sm text-white font-bold">Seamless Verification</h3>
                <p class="font-sans text-xs text-zinc-400 leading-relaxed">
                  Client presents the Bearer token with every subsequent HTTP request. Downstream services verify the signature in RAM without querying a central session database.
                </p>
              </div>
            </div>
          </section>

      <!-- ================= CHAPTER 01: ANATOMICAL DECONSTRUCTION ================= -->
      <section class="w-full bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl" id="learn-ch01">
        <div class="flex items-center gap-2 font-mono text-xs text-brand-orange uppercase tracking-wider font-semibold">
          <span class="text-zinc-500">//</span>
          <span>CHAPTER 01 // ANATOMICAL DECONSTRUCTION</span>
        </div>
        <div>
          <h2 class="text-xl md:text-2xl font-mono font-bold text-white mb-2">
            Meet the Token: Three Colored Segments
          </h2>
          <p class="text-xs md:text-sm text-zinc-400 max-w-3xl font-sans">
            Every valid JWT is a single string split into three distinct segments delimited by literal period (<code class="font-mono text-white">.</code>) glyphs: the <strong class="text-red-400 font-mono">Header</strong>, the <strong class="text-brand-orange font-mono">Payload</strong>, and the <strong class="text-sky-400 font-mono">Signature</strong>.
          </p>
        </div>

        <!-- Raw Interactive Token Box with Tooltips -->
        <div class="bg-[#050505] rounded-xl p-5 border border-[#1E1E1E] flex flex-col gap-4">
          <div class="flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>ENCODED JWT STREAM (RFC 7519)</span>
            <span>184 BYTES TOTAL • CLICK ANY SEGMENT FOR DECODED TOOLTIP</span>
          </div>

          <div class="p-4 bg-[#000000] rounded-lg border border-[#222222] break-all font-mono text-xs md:text-sm tracking-wider leading-loose select-text">
            <button id="btn-seg-header" data-castle-tooltip aria-expanded="false" class="inline-block transition-all text-red-400 font-bold hover:underline decoration-red-500 underline-offset-4 cursor-pointer focus:outline-none text-left">
              eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
              <span role="tooltip" class="hidden absolute z-30 p-3 w-64 bg-[#0A0A0A] border border-red-500 text-zinc-300 rounded-lg shadow-2xl text-left mt-2 font-mono text-xs">
                <strong class="text-red-400">Header (JOSE Metadata)</strong><br>
                Algorithm and token format specification.<br>
                <code class="text-[11px] text-red-300 bg-red-500/10 block mt-1.5 p-1.5 rounded">{"alg":"HS256","typ":"JWT"}</code>
              </span>
            </button><span class="text-zinc-500 font-bold px-1 select-none">.</span><button id="btn-seg-payload" data-castle-tooltip aria-expanded="false" class="inline-block transition-all text-brand-orange font-bold hover:underline decoration-brand-orange underline-offset-4 cursor-pointer focus:outline-none text-left">
              eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIFNlY3VyaXR5IiwiYWRtaW4iOnRydWV9
              <span role="tooltip" class="hidden absolute z-30 p-3 w-64 bg-[#0A0A0A] border border-brand-orange text-zinc-300 rounded-lg shadow-2xl text-left mt-2 font-mono text-xs">
                <strong class="text-brand-orange">Payload (Identity Claims)</strong><br>
                Identity claims and session attributes.<br>
                <code class="text-[11px] text-orange-200 bg-brand-orange/10 block mt-1.5 p-1.5 rounded">{"sub":"1234567890","name":"Alice Security","admin":true}</code>
              </span>
            </button><span class="text-zinc-500 font-bold px-1 select-none">.</span><button id="btn-seg-signature" data-castle-tooltip aria-expanded="false" class="inline-block transition-all text-sky-400 font-bold hover:underline decoration-sky-400 underline-offset-4 cursor-pointer focus:outline-none text-left">
              SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
              <span role="tooltip" class="hidden absolute z-30 p-3 w-64 bg-[#0A0A0A] border border-sky-400 text-zinc-300 rounded-lg shadow-2xl text-left mt-2 font-mono text-xs">
                <strong class="text-sky-400">Signature (HMAC Integrity)</strong><br>
                HMAC-SHA256 hash calculated with secret key.<br>
                <code class="text-[11px] text-sky-200 bg-sky-500/10 block mt-1.5 p-1.5 rounded">HMAC_SHA256(H.P, secret)</code>
              </span>
            </button>
          </div>

          <!-- Segment Selector Controls -->
          <div class="flex flex-wrap items-center gap-2 pt-2">
            <button type="button" id="tab-btn-header" class="px-3.5 py-1.5 font-mono text-xs rounded-lg bg-[#141414] border border-red-500 text-red-400 flex items-center gap-2 transition-all cursor-pointer">
              <span class="w-2 h-2 rounded-full bg-red-500"></span>
              <span>SEGMENT 01: HEADER</span>
            </button>
            <button type="button" id="tab-btn-payload" class="px-3.5 py-1.5 font-mono text-xs rounded-lg bg-[#050505] border border-[#222222] text-zinc-400 hover:text-white flex items-center gap-2 transition-all cursor-pointer">
              <span class="w-2 h-2 rounded-full bg-brand-orange"></span>
              <span>SEGMENT 02: PAYLOAD</span>
            </button>
            <button type="button" id="tab-btn-signature" class="px-3.5 py-1.5 font-mono text-xs rounded-lg bg-[#050505] border border-[#222222] text-zinc-400 hover:text-white flex items-center gap-2 transition-all cursor-pointer">
              <span class="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>SEGMENT 03: SIGNATURE</span>
            </button>
          </div>
        </div>

        <!-- Dynamic Segment Explainer Card -->
        <div id="segment-explainer" class="bg-[#050505] rounded-xl p-5 md:p-6 border border-[#1E1E1E] transition-all flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span id="explainer-dot" class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <h4 id="explainer-title" class="font-mono text-sm md:text-base text-white font-bold">Segment 01: The Header (JOSE Metadata)</h4>
            </div>
            <span id="explainer-meta" class="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">ALGORITHM & TOKEN SPECIFICATION</span>
          </div>
          <p id="explainer-desc" class="text-xs md:text-sm text-zinc-300 leading-relaxed font-sans mt-1">
            Specifies cryptographic directives governing token verification. It informs the validating recipient which hashing algorithm was chosen (e.g. HS256, RS256) and confirms the wrapper standard (<code class="font-mono text-brand-orange">typ: "JWT"</code>). It is serialized into Base64URL and contains zero confidentiality.
          </p>
        </div>
      </section>

      <!-- ================= CHAPTER 02: BASE64URL VS ENCRYPTION ================= -->
      <section class="w-full bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl">
        <div class="flex items-center gap-2 font-mono text-xs text-brand-orange uppercase tracking-wider font-semibold">
          <span class="text-zinc-500">//</span>
          <span>CHAPTER 02 // CRYPTOGRAPHIC DISAMBIGUATION</span>
        </div>
        <div>
          <h2 class="text-xl md:text-2xl font-mono font-bold text-white mb-2">
            What's Inside: Base64URL Encoding vs Encryption
          </h2>
          <p class="text-xs md:text-sm text-zinc-400 max-w-3xl font-sans">
            A common developer misunderstanding is treating encoded JWT claims as private. Understanding the boundary between encoding and encryption is essential to building secure authentication architectures.
          </p>
        </div>

        <!-- High-Visibility Architectural Banner -->
        <div class="bg-[#050505] rounded-xl p-5 border-l-4 border-l-brand-orange border-y border-r border-[#1E1E1E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-lg bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange shrink-0">
              <span class="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <div>
              <h4 class="font-mono text-sm text-white font-bold tracking-wide uppercase">BASE64URL IS ENCODING, NOT ENCRYPTION</h4>
              <p class="font-sans text-xs text-zinc-400 mt-0.5">
                Anyone who intercepts or inspects a JWT can read the raw claims in plaintext within milliseconds. Zero cryptographic keys are needed to view the contents.
              </p>
            </div>
          </div>
          <div class="shrink-0 px-3.5 py-1.5 rounded-lg bg-[#000000] border border-[#222222] font-mono text-xs text-zinc-400">
            CONFIDENTIALITY: <span class="text-red-400 font-bold">0% (PLAINTEXT)</span>
          </div>
        </div>

        <!-- Side-by-Side Deconstructed Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Header Card -->
          <div class="bg-[#050505] rounded-xl p-5 border border-red-500/30 flex flex-col justify-between gap-3">
            <div>
              <div class="flex items-center justify-between mb-3 text-xs font-mono">
                <span class="text-red-400 uppercase tracking-wider font-bold">DECODED HEADER</span>
                <span class="text-zinc-500">JOSE METADATA</span>
              </div>
              <pre class="bg-[#000000] p-3 rounded-lg border border-[#222222] font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed mb-3"><code>{
  <span class="text-red-400 font-semibold">"alg"</span>: <span class="text-white">"HS256"</span>,
  <span class="text-red-400 font-semibold">"typ"</span>: <span class="text-white">"JWT"</span>
}</code></pre>
              <ul class="space-y-2 font-sans text-xs text-zinc-400">
                <li class="flex items-start gap-2">
                  <span class="material-symbols-outlined text-red-400 text-[16px] mt-0.5">check_circle</span>
                  <span><strong class="text-white font-mono">alg: HS256</strong> — Defines HMAC with SHA-256 for symmetric signing.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="material-symbols-outlined text-red-400 text-[16px] mt-0.5">check_circle</span>
                  <span><strong class="text-white font-mono">typ: JWT</strong> — Informs token parsers of RFC 7519 semantics.</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Payload Card -->
          <div class="bg-[#050505] rounded-xl p-5 border border-brand-orange/30 flex flex-col justify-between gap-3">
            <div>
              <div class="flex items-center justify-between mb-3 text-xs font-mono">
                <span class="text-brand-orange uppercase tracking-wider font-bold">DECODED PAYLOAD</span>
                <span class="text-zinc-500">IDENTITY CLAIMS</span>
              </div>
              <pre class="bg-[#000000] p-3 rounded-lg border border-[#222222] font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed mb-3"><code>{
  <span class="text-brand-orange font-semibold">"sub"</span>: <span class="text-white">"1234567890"</span>,
  <span class="text-brand-orange font-semibold">"name"</span>: <span class="text-white">"Alice Security"</span>,
  <span class="text-brand-orange font-semibold">"admin"</span>: <span class="text-emerald-400 font-semibold">true</span>
}</code></pre>
              <ul class="space-y-2 font-sans text-xs text-zinc-400">
                <li class="flex items-start gap-2">
                  <span class="material-symbols-outlined text-brand-orange text-[16px] mt-0.5">check_circle</span>
                  <span><strong class="text-white font-mono">sub</strong> — Unique identifier representing the authenticated principal.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="material-symbols-outlined text-brand-orange text-[16px] mt-0.5">check_circle</span>
                  <span><strong class="text-white font-mono">admin</strong> — Application role claim used by downstream gateways for RBAC.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Base64 vs Base64URL Expandable Box -->
        <details class="group bg-[#050505] rounded-xl border border-[#1E1E1E] overflow-hidden transition-all">
          <summary class="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-[#111111] transition-colors">
            <div class="flex items-center gap-2.5 font-mono text-xs md:text-sm text-white font-semibold">
              <span class="material-symbols-outlined text-brand-orange text-[18px]">terminal</span>
              <span>Why use Base64URL instead of standard Base64?</span>
            </div>
            <span class="material-symbols-outlined text-zinc-500 group-open:rotate-180 transition-transform">expand_more</span>
          </summary>
          <div class="p-4 pt-1 font-sans text-xs text-zinc-300 border-t border-[#1E1E1E] space-y-2 bg-[#000000]">
            <p>
              Standard Base64 utilizes the characters <code class="font-mono text-red-400">+</code> and <code class="font-mono text-red-400">/</code>, alongside padding glyphs <code class="font-mono text-red-400">=</code>. When passed in HTTP headers, URL query parameters, or cookie values, these characters require percent-encoding (<code class="font-mono text-zinc-400">%2B</code>, <code class="font-mono text-zinc-400">%2F</code>).
            </p>
            <p>
              <strong>Base64URL</strong> replaces <code class="font-mono text-emerald-400">+</code> with <code class="font-mono text-emerald-400">-</code> (hyphen) and <code class="font-mono text-emerald-400">/</code> with <code class="font-mono text-emerald-400">_</code> (underscore), while stripping trailing pad symbols entirely. This ensures tokens traverse URLs and HTTP transport layers unaltered without escaping.
            </p>
          </div>
        </details>
      </section>

      <!-- ================= CHAPTER 03: THE CENTRAL TRUTH ================= -->
      <section class="w-full bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl">
        <div class="flex items-center gap-2 font-mono text-xs text-brand-orange uppercase tracking-wider font-semibold">
          <span class="text-zinc-500">//</span>
          <span>CHAPTER 03 // THE CORE TENET</span>
        </div>
        <div>
          <h2 class="text-xl md:text-2xl font-mono font-bold text-white mb-2">
            The Central Truth: Decoded Does Not Mean Verified
          </h2>
          <p class="text-xs md:text-sm text-zinc-400 max-w-3xl font-sans">
            Anyone can decode a JWT. Reading a token proves nothing about who produced it or whether an adversary altered the underlying payload during transit. Trust hinges strictly on mathematical signature verification.
          </p>
        </div>

        <!-- Visual Duel Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- State A: Unverified -->
          <div class="bg-[#050505] rounded-xl p-5 border border-amber-500/40 relative flex flex-col gap-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-400 text-[20px]">gpp_maybe</span>
              <span class="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase font-bold">
                STATE A: DECODED ONLY — ZERO INTEGRITY PROOF
              </span>
            </div>
            <h3 class="font-mono text-sm text-white font-bold">Client-Side Parser Output</h3>
            <p class="font-sans text-xs text-zinc-400 leading-relaxed">
              A client decodes the JSON payload locally to display the user's name on a navigation bar. <strong>No signature math has occurred.</strong> If an adversary substituted claims, the app remains oblivious.
            </p>
            <div class="p-3 rounded-lg bg-[#000000] border border-[#222222] font-mono text-xs space-y-1">
              <div class="text-zinc-500">// Parsed directly without secret key</div>
              <div class="text-zinc-200">user.name = "Alice Security"</div>
              <div class="text-amber-400">user.role = "admin" <span class="text-zinc-500 font-normal">(UNCONFIRMED CLAIM)</span></div>
            </div>
          </div>

          <!-- State B: Verified -->
          <div class="bg-[#050505] rounded-xl p-5 border border-emerald-500/40 relative flex flex-col gap-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-400 text-[20px]">verified_user</span>
              <span class="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase font-bold">
                STATE B: CRYPTOGRAPHICALLY VERIFIED
              </span>
            </div>
            <h3 class="font-mono text-sm text-white font-bold">HMAC SHA-256 Engine Validation</h3>
            <p class="font-sans text-xs text-zinc-400 leading-relaxed">
              The API gateway runs <code class="font-mono text-emerald-400">crypto.subtle.verify()</code> using the known server secret. A bit-for-bit mathematical match proves the identity issuer and total integrity.
            </p>
            <div class="p-3 rounded-lg bg-[#000000] border border-[#222222] font-mono text-xs space-y-1">
              <div class="text-zinc-500">// Signature computed matches wire signature</div>
              <div class="text-emerald-400 truncate">HMAC_SHA256(H.P, SECRET) == SflKxw...</div>
              <div class="text-white">INTEGRITY: <span class="text-emerald-400 font-bold">AUTHENTIC & UNTOUCHED</span></div>
            </div>
          </div>
        </div>
      </section>
      </div>
      </div>

      <!-- ================= TRACK 02: INTERACTIVE LABS & LIFECYCLES ================= -->
      <div id="jwt-track-section-lab" class="flex flex-col gap-6">
        <div class="editorial-read-canvas">
          <header class="editorial-header">
            <div class="editorial-kicker">
              <span class="editorial-kicker-dot"></span>
              <span>TRACK 02 // INTERACTIVE LABS &amp; LIFECYCLES</span>
            </div>
            <h1 class="editorial-title">
              Cryptographic Tampering &amp; Temporal Lifecycles
            </h1>
            <p class="editorial-lede">
              Experience the mathematical sensitivity of keyed-hash signatures in real time. Manipulate payload claims, observe instantaneous signature rejection, and simulate temporal expiration curves.
            </p>
          </header>
        <!-- ================= CHAPTER 04: INTERACTIVE TAMPERING SANDBOX ================= -->
        <section class="w-full bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2 font-mono text-xs text-brand-orange uppercase tracking-wider font-semibold">
              <span class="text-zinc-500">//</span>
              <span>CHAPTER 04 // LAB BENCH</span>
            </div>
            <span class="font-mono text-[10px] text-zinc-400 bg-[#050505] px-2.5 py-1 rounded-lg border border-[#222222]">INTERACTIVE SIMULATION</span>
          </div>

        <div>
          <h2 class="text-xl md:text-2xl font-mono font-bold text-white mb-2">
            Interactive Tampering Sandbox
          </h2>
          <p class="text-xs md:text-sm text-zinc-400 max-w-3xl font-sans">
            Experience the cryptographic tamper-evident seal firsthand. Change a single character inside the payload without knowing the secret key, and observe the immediate cryptographic failure.
          </p>
        </div>

        <div class="bg-[#050505] rounded-xl p-5 border border-[#1E1E1E] flex flex-col gap-4">
          <!-- Status Banner -->
          <div id="tamper-status-banner" class="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between transition-colors font-mono text-xs font-bold text-emerald-400">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">verified</span>
              <span id="tamper-status-text">✓ SIGNATURE VERIFIED WITH 'demo-secret'</span>
            </div>
            <span id="tamper-hash-status" class="text-zinc-400 font-normal hidden sm:inline text-[11px]">SHA256 HASH COMPLIANT</span>
          </div>

          <!-- Token Stream Display -->
          <div class="flex flex-col gap-1.5">
            <span class="text-xs font-mono text-zinc-500">Live JWT Serialized Stream:</span>
            <div id="tamper-token-display" class="p-3 bg-[#000000] rounded-lg border border-[#222222] font-mono text-xs break-all leading-normal text-zinc-200"></div>
          </div>

          <!-- Visual Hash Pipeline -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-mono text-zinc-400 font-semibold">Decoded Payload Claims:</span>
              <pre id="tamper-payload-display" class="p-3 bg-[#000000] border border-[#222222] rounded-lg text-orange-200 font-mono text-xs overflow-x-auto leading-relaxed min-h-24"></pre>
            </div>

            <div class="flex flex-col justify-between gap-3">
              <div class="flex flex-col gap-1.5">
                <span class="text-xs font-mono text-zinc-400 font-semibold">Verification Key (Secret):</span>
                <input type="text" id="tamper-secret-input" class="w-full bg-[#000000] border border-[#262626] rounded-lg px-3 py-2 text-brand-orange font-mono text-xs focus:border-brand-orange outline-none" value="demo-secret">
                <span class="text-[10px] font-mono text-zinc-500">Try editing the secret key above to trigger verification failure without changing payload.</span>
              </div>

              <!-- Controls -->
              <div class="flex flex-wrap items-center gap-2 pt-2">
                <button type="button" id="tamper-btn" class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">edit_note</span>
                  <span>Tamper with Payload ("role": "admin")</span>
                </button>
                <button type="button" id="reset-tamper-btn" class="px-4 py-2 bg-[#141414] hover:bg-[#1F1F1F] text-zinc-300 border border-[#262626] rounded-lg text-xs font-mono font-semibold uppercase transition-all cursor-pointer flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span>Reset Demo</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Cryptographic Avalanche Effect Callout -->
          <div id="tamper-hint-panel" class="hidden p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-sans text-zinc-300 space-y-1.5">
            <strong class="text-red-400 font-mono text-xs uppercase block">Cryptographic Avalanche Effect:</strong>
            <p class="leading-relaxed">
              When you altered <code class="font-mono text-white">"role": "user"</code> to <code class="font-mono text-white">"role": "admin"</code>, the input string to the cryptographic hash function completely changed. Because the attacker lacks the secret key <code class="font-mono text-brand-orange">demo-secret</code>, they cannot forge a new valid signature for that altered string. The server executes HMAC on the modified input, compares it against the token's attached signature, and unconditionally drops the request.
            </p>
          </div>
        </div>
      </section>

      <!-- ================= CHAPTER 05: TOKEN LIFECYCLES ================= -->
      <section class="w-full bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl">
        <div class="flex items-center gap-2 font-mono text-xs text-brand-orange uppercase tracking-wider font-semibold">
          <span class="text-zinc-500">//</span>
          <span>CHAPTER 05 // TEMPORAL SAFETY</span>
        </div>
        <div>
          <h2 class="text-xl md:text-2xl font-mono font-bold text-white mb-2">
            Token Lifecycles: Expiration & Time Claims
          </h2>
          <p class="text-xs md:text-sm text-zinc-400 max-w-3xl font-sans">
            Tokens are bearer instruments: anyone in possession of a valid token can impersonate the bearer until expiration. For this reason, tokens must strictly declare temporal constraints according to RFC 7519.
          </p>
        </div>

        <!-- Visual Interactive Timeline -->
        <div class="bg-[#050505] rounded-xl p-5 md:p-6 border border-[#1E1E1E] flex flex-col gap-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span class="font-mono text-xs text-zinc-400 uppercase font-semibold">CHRONOLOGICAL VERIFICATION TIMELINE</span>
            <div class="flex items-center gap-2 font-mono text-xs">
              <button type="button" id="time-demo-valid" class="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold uppercase cursor-pointer transition-all shadow-sm">
                T = +15m (ACTIVE)
              </button>
              <button type="button" id="time-demo-expired" class="px-3 py-1.5 rounded-lg bg-[#141414] text-zinc-400 hover:text-white border border-[#222222] uppercase cursor-pointer transition-all">
                T = +75m (EXPIRED)
              </button>
            </div>
          </div>

          <!-- Timeline Bar Component -->
          <div class="relative py-4">
            <!-- Connecting Line -->
            <div class="h-1.5 w-full bg-[#1A1A1A] rounded-full relative">
              <div id="time-progress-bar" class="h-full bg-emerald-500 rounded-full transition-all duration-300" style="width: 33.3%"></div>
            </div>

            <!-- Waypoints -->
            <div class="flex justify-between items-center -mt-3.5 relative font-mono text-xs">
              <!-- iat -->
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 rounded-full bg-[#0A0A0A] border-2 border-brand-orange flex items-center justify-center">
                  <span class="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
                </div>
                <span class="text-white font-bold mt-2">iat</span>
                <span id="time-iat-label" class="text-[10px] text-zinc-500">12:00:00 UTC</span>
              </div>

              <!-- current cursor -->
              <div class="flex flex-col items-center">
                <div id="time-cursor-dot" class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-xs shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                  <span class="material-symbols-outlined text-[16px]">schedule</span>
                </div>
                <span id="time-now-label" class="text-emerald-400 font-bold mt-2">CURRENT TIME</span>
              </div>

              <!-- exp -->
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 rounded-full bg-[#0A0A0A] border-2 border-red-500 flex items-center justify-center">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                </div>
                <span class="text-white font-bold mt-2">exp</span>
                <span id="time-exp-label" class="text-[10px] text-zinc-500">13:00:00 UTC</span>
              </div>
            </div>
          </div>

          <!-- Current Timeline Status Box -->
          <div id="time-status-banner" class="p-4 rounded-xl bg-[#000000] border border-[#222222] flex items-center justify-between font-mono text-xs">
            <div class="flex items-center gap-2">
              <span id="time-status-icon" class="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
              <span id="time-status-badge" class="text-emerald-400 font-bold uppercase">TOKEN IS VALID // ACTIVE WINDOW</span>
            </div>
            <span class="text-zinc-500 text-[11px] hidden sm:inline">RFC 7519 COMPLIANT</span>
          </div>
        </div>

        <!-- 3 RFC Claims Explained -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-[#050505] p-4 rounded-xl border border-[#1E1E1E] flex flex-col gap-2">
            <code class="font-mono text-xs text-brand-orange font-bold uppercase">exp (Expiration Time)</code>
            <p class="font-sans text-xs text-zinc-400 leading-relaxed">
              Unix epoch timestamp after which the token must be rejected unconditionally by all verifiers.
            </p>
          </div>
          <div class="bg-[#050505] p-4 rounded-xl border border-[#1E1E1E] flex flex-col gap-2">
            <code class="font-mono text-xs text-brand-orange font-bold uppercase">iat (Issued At)</code>
            <p class="font-sans text-xs text-zinc-400 leading-relaxed">
              Identifies the instant when the JWT was minted. Used to determine token age and enforce max session limits.
            </p>
          </div>
          <div class="bg-[#050505] p-4 rounded-xl border border-[#1E1E1E] flex flex-col gap-2">
            <code class="font-mono text-xs text-brand-orange font-bold uppercase">nbf (Not Before)</code>
            <p class="font-sans text-xs text-zinc-400 leading-relaxed">
              Timestamp identifying the exact moment before which the token must not be accepted for processing.
            </p>
          </div>
        </div>
      </section>
      </div>
      </div>

      <!-- ================= TRACK 03: DEFENSE RULES & KNOWLEDGE CHECK ================= -->
      <div id="jwt-track-section-defense" class="flex flex-col gap-6">
        <div class="editorial-read-canvas">
          <header class="editorial-header">
            <div class="editorial-kicker">
              <span class="editorial-kicker-dot"></span>
              <span>TRACK 03 // DEFENSE ARCHITECTURE &amp; AUDIT</span>
            </div>
            <h1 class="editorial-title">
              Vulnerability Surface, Defense Rules &amp; Comprehension Audit
            </h1>
            <p class="editorial-lede">
              Four architectural rules for secure token verification, followed by technical challenges to audit your implementation knowledge.
            </p>
          </header>
        <!-- ================= CHAPTER 06: VULNERABILITY SURFACE ================= -->
        <section class="w-full bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl">
          <div class="flex items-center gap-2 font-mono text-xs text-brand-orange uppercase tracking-wider font-semibold">
            <span class="text-zinc-500">//</span>
            <span>CHAPTER 06 // VULNERABILITY SURFACE</span>
          </div>
        <div>
          <h2 class="text-xl md:text-2xl font-mono font-bold text-white mb-2">
            Common Pitfalls & Defense Rules
          </h2>
          <p class="text-xs md:text-sm text-zinc-400 max-w-3xl font-sans">
            Misconfigured libraries and architectural oversights turn an otherwise robust standard into a high-severity entry point. Maintain these four ironclad operational safeguards:
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Pitfall 1 -->
          <div class="bg-[#050505] p-5 rounded-xl border border-[#1E1E1E] flex flex-col justify-between gap-3">
            <div>
              <div class="flex items-center gap-1.5 text-red-400 font-mono text-xs mb-2 font-bold uppercase">
                <span class="material-symbols-outlined text-[16px]">no_encryption</span>
                <span>VULNERABILITY 01</span>
              </div>
              <h3 class="font-mono text-sm text-white font-bold mb-1">The 'alg: none' Exploit</h3>
              <p class="font-sans text-xs text-zinc-400 leading-relaxed">
                The JOSE spec permits an algorithm of <code class="font-mono text-white">"none"</code> for unauthenticated tokens. Naive libraries parse this and bypass signature validation altogether.
              </p>
            </div>
            <div class="p-2.5 rounded-lg bg-[#000000] border border-[#222222] font-mono text-xs text-emerald-400 flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">shield</span>
              <span>DEFENSE: Whitelist explicit algorithms on server verifier.</span>
            </div>
          </div>

          <!-- Pitfall 2 -->
          <div class="bg-[#050505] p-5 rounded-xl border border-[#1E1E1E] flex flex-col justify-between gap-3">
            <div>
              <div class="flex items-center gap-1.5 text-red-400 font-mono text-xs mb-2 font-bold uppercase">
                <span class="material-symbols-outlined text-[16px]">visibility</span>
                <span>VULNERABILITY 02</span>
              </div>
              <h3 class="font-mono text-sm text-white font-bold mb-1">Storing Sensitive Secrets in Claims</h3>
              <p class="font-sans text-xs text-zinc-400 leading-relaxed">
                Storing passwords, credit card numbers, or PII in a JWT payload exposes confidential records to browser extensions, log scrapers, and intermediate proxies.
              </p>
            </div>
            <div class="p-2.5 rounded-lg bg-[#000000] border border-[#222222] font-mono text-xs text-emerald-400 flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">shield</span>
              <span>DEFENSE: Store only opaque UUIDs or public role identifiers.</span>
            </div>
          </div>

          <!-- Pitfall 3 -->
          <div class="bg-[#050505] p-5 rounded-xl border border-[#1E1E1E] flex flex-col justify-between gap-3">
            <div>
              <div class="flex items-center gap-1.5 text-red-400 font-mono text-xs mb-2 font-bold uppercase">
                <span class="material-symbols-outlined text-[16px]">key_off</span>
                <span>VULNERABILITY 03</span>
              </div>
              <h3 class="font-mono text-sm text-white font-bold mb-1">Weak HMAC Signing Secrets</h3>
              <p class="font-sans text-xs text-zinc-400 leading-relaxed">
                Tokens signed with dictionary words (e.g. <code class="font-mono text-white">"secret123"</code>) can be cracked offline in seconds using GPU-accelerated brute force at billions of guesses per second.
              </p>
            </div>
            <div class="p-2.5 rounded-lg bg-[#000000] border border-[#222222] font-mono text-xs text-emerald-400 flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">shield</span>
              <span>DEFENSE: Require 256-bit high-entropy secrets (32+ random bytes).</span>
            </div>
          </div>

          <!-- Pitfall 4 -->
          <div class="bg-[#050505] p-5 rounded-xl border border-[#1E1E1E] flex flex-col justify-between gap-3">
            <div>
              <div class="flex items-center gap-1.5 text-amber-400 font-mono text-xs mb-2 font-bold uppercase">
                <span class="material-symbols-outlined text-[16px]">sync_problem</span>
                <span>ARCHITECTURAL TRADEOFF</span>
              </div>
              <h3 class="font-mono text-sm text-white font-bold mb-1">Stateless Revocation Challenge</h3>
              <p class="font-sans text-xs text-zinc-400 leading-relaxed">
                Because JWTs are stateless, you cannot unilaterally revoke an active token without introducing a centralized blacklist or token revocation list (TRL) back into memory.
              </p>
            </div>
            <div class="p-2.5 rounded-lg bg-[#000000] border border-[#222222] font-mono text-xs text-emerald-400 flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">shield</span>
              <span>DEFENSE: Enforce short lifetimes (&lt;15 mins) with refresh tokens.</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= CHAPTER 07: KNOWLEDGE CHECK QUIZ ================= -->
      <section class="w-full bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2 font-mono text-xs text-brand-orange uppercase tracking-wider font-semibold">
            <span class="text-zinc-500">//</span>
            <span>CHAPTER 07 // PROTOCOL COMPREHENSION AUDIT</span>
          </div>
          <span class="font-mono text-[10px] text-zinc-400 bg-[#050505] px-2.5 py-1 rounded-lg border border-[#222222]">TECHNICAL ASSESSMENT</span>
        </div>

        <div>
          <h2 class="text-xl md:text-2xl font-mono font-bold text-white mb-2">
            JWT Architecture & Security Quiz
          </h2>
          <p class="text-xs md:text-sm text-zinc-400 max-w-3xl font-sans">
            Test your understanding of token anatomy, cryptographic integrity, and protocol defenses. Select an answer to evaluate your response instantly:
          </p>
        </div>

        <div class="flex flex-col gap-5">
          <!-- Question 1 -->
          <div class="bg-[#050505] rounded-xl p-5 border border-[#1E1E1E] flex flex-col gap-3" data-quiz-item="1">
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs text-brand-orange font-bold uppercase">QUESTION 01</span>
              <span class="quiz-feedback font-mono text-xs text-zinc-500">SELECT AN ANSWER</span>
            </div>
            <p class="font-sans text-xs md:text-sm text-white font-semibold">
              What mechanism provides data confidentiality for payload claims in a standard RFC 7519 JWT?
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              <button type="button" class="quiz-opt p-3 rounded-lg bg-[#0A0A0A] border border-[#222222] text-zinc-300 hover:text-white hover:border-[#333333] text-left cursor-pointer transition-colors" data-correct="false">
                A) Base64URL encoding
              </button>
              <button type="button" class="quiz-opt p-3 rounded-lg bg-[#0A0A0A] border border-[#222222] text-zinc-300 hover:text-white hover:border-[#333333] text-left cursor-pointer transition-colors" data-correct="false">
                B) HMAC-SHA256 signature
              </button>
              <button type="button" class="quiz-opt p-3 rounded-lg bg-[#0A0A0A] border border-[#222222] text-zinc-300 hover:text-white hover:border-[#333333] text-left cursor-pointer transition-colors" data-correct="true">
                C) Nothing — claims are plaintext unless JWE is used
              </button>
              <button type="button" class="quiz-opt p-3 rounded-lg bg-[#0A0A0A] border border-[#222222] text-zinc-300 hover:text-white hover:border-[#333333] text-left cursor-pointer transition-colors" data-correct="false">
                D) The "typ": "JWT" header parameter
              </button>
            </div>
            <div class="quiz-explanation hidden p-3 rounded-lg bg-[#000000] border border-[#222222] text-xs font-sans text-zinc-300 leading-relaxed"></div>
          </div>

          <!-- Question 2 -->
          <div class="bg-[#050505] rounded-xl p-5 border border-[#1E1E1E] flex flex-col gap-3" data-quiz-item="2">
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs text-brand-orange font-bold uppercase">QUESTION 02</span>
              <span class="quiz-feedback font-mono text-xs text-zinc-500">SELECT AN ANSWER</span>
            </div>
            <p class="font-sans text-xs md:text-sm text-white font-semibold">
              An adversary alters <code class="font-mono text-brand-orange">"role": "user"</code> to <code class="font-mono text-brand-orange">"role": "admin"</code> in a valid token but does not possess the secret key. What happens upon server verification?
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              <button type="button" class="quiz-opt p-3 rounded-lg bg-[#0A0A0A] border border-[#222222] text-zinc-300 hover:text-white hover:border-[#333333] text-left cursor-pointer transition-colors" data-correct="false">
                A) The server automatically re-signs the token
              </button>
              <button type="button" class="quiz-opt p-3 rounded-lg bg-[#0A0A0A] border border-[#222222] text-zinc-300 hover:text-white hover:border-[#333333] text-left cursor-pointer transition-colors" data-correct="true">
                B) Signature validation fails bit-for-bit and request is rejected
              </button>
              <button type="button" class="quiz-opt p-3 rounded-lg bg-[#0A0A0A] border border-[#222222] text-zinc-300 hover:text-white hover:border-[#333333] text-left cursor-pointer transition-colors" data-correct="false">
                C) The token algorithm falls back to "none"
              </button>
              <button type="button" class="quiz-opt p-3 rounded-lg bg-[#0A0A0A] border border-[#222222] text-zinc-300 hover:text-white hover:border-[#333333] text-left cursor-pointer transition-colors" data-correct="false">
                D) The expiration time is instantly revoked
              </button>
            </div>
            <div class="quiz-explanation hidden p-3 rounded-lg bg-[#000000] border border-[#222222] text-xs font-sans text-zinc-300 leading-relaxed"></div>
          </div>

          <!-- Question 3 -->
          <div class="bg-[#050505] rounded-xl p-5 border border-[#1E1E1E] flex flex-col gap-3" data-quiz-item="3">
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs text-brand-orange font-bold uppercase">QUESTION 03</span>
              <span class="quiz-feedback font-mono text-xs text-zinc-500">SELECT AN ANSWER</span>
            </div>
            <p class="font-sans text-xs md:text-sm text-white font-semibold">
              Why must server verification engines reject tokens with <code class="font-mono text-red-400">"alg": "none"</code>?
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              <button type="button" class="quiz-opt p-3 rounded-lg bg-[#0A0A0A] border border-[#222222] text-zinc-300 hover:text-white hover:border-[#333333] text-left cursor-pointer transition-colors" data-correct="true">
                A) It tells parsers the token is unsigned, enabling trivial privilege escalation
              </button>
              <button type="button" class="quiz-opt p-3 rounded-lg bg-[#0A0A0A] border border-[#222222] text-zinc-300 hover:text-white hover:border-[#333333] text-left cursor-pointer transition-colors" data-correct="false">
                B) It crashes browser JSON deserializers
              </button>
              <button type="button" class="quiz-opt p-3 rounded-lg bg-[#0A0A0A] border border-[#222222] text-zinc-300 hover:text-white hover:border-[#333333] text-left cursor-pointer transition-colors" data-correct="false">
                C) It causes memory leaks in WebCrypto
              </button>
              <button type="button" class="quiz-opt p-3 rounded-lg bg-[#0A0A0A] border border-[#222222] text-zinc-300 hover:text-white hover:border-[#333333] text-left cursor-pointer transition-colors" data-correct="false">
                D) It violates TLS 1.3 protocol standards
              </button>
            </div>
            <div class="quiz-explanation hidden p-3 rounded-lg bg-[#000000] border border-[#222222] text-xs font-sans text-zinc-300 leading-relaxed"></div>
          </div>
        </div>
      </section>

      <!-- ================= CHAPTER 08: TACTICAL HANDOFFS ================= -->
      <section class="w-full bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl">
        <div class="flex items-center gap-2 font-mono text-xs text-brand-orange uppercase tracking-wider font-semibold">
          <span class="text-zinc-500">//</span>
          <span>CHAPTER 08 // FIELD APPLICATION</span>
        </div>
        <div>
          <h2 class="text-xl md:text-2xl font-mono font-bold text-white mb-2">
            Tactical Handoffs: Put It Into Practice
          </h2>
          <p class="text-xs md:text-sm text-zinc-400 max-w-3xl font-sans">
            Transition from theoretical mechanics to client-side cryptographic execution. Choose your active workspace below:
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Action Card 1: Decode & Verify -->
          <div class="bg-[#050505] p-6 rounded-xl border border-[#1E1E1E] hover:border-brand-orange/40 transition-all flex flex-col justify-between gap-4 group">
            <div class="flex flex-col gap-2">
              <div class="w-12 h-12 rounded-lg bg-[#000000] border border-[#222222] flex items-center justify-center text-brand-orange group-hover:scale-105 transition-transform">
                <span class="material-symbols-outlined text-[24px]">troubleshoot</span>
              </div>
              <div class="font-mono text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">DIAGNOSTIC WORKSPACE</div>
              <h3 class="font-mono text-base text-white font-bold">Launch Decode & Verify</h3>
              <p class="font-sans text-xs text-zinc-400 leading-relaxed">
                Inspect arbitrary JWT tokens, analyze payload claims, compute verification checksums with custom HMAC secrets, and run automated vulnerability scanners locally in browser RAM.
              </p>
            </div>
            <button type="button" data-tab-link="decode" class="w-full py-2.5 px-4 rounded-lg bg-[#0D0D0D] border border-[#262626] hover:border-brand-orange text-white font-mono text-xs font-bold flex items-center justify-between transition-colors cursor-pointer">
              <span>INITIALIZE DECODER CONSOLE</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <!-- Action Card 2: Build & Sign -->
          <div class="bg-[#050505] p-6 rounded-xl border border-[#1E1E1E] hover:border-brand-orange/40 transition-all flex flex-col justify-between gap-4 group">
            <div class="flex flex-col gap-2">
              <div class="w-12 h-12 rounded-lg bg-[#000000] border border-[#222222] flex items-center justify-center text-brand-orange group-hover:scale-105 transition-transform">
                <span class="material-symbols-outlined text-[24px]">construction</span>
              </div>
              <div class="font-mono text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">GENERATOR WORKSPACE</div>
              <h3 class="font-mono text-base text-white font-bold">Launch Build & Sign</h3>
              <p class="font-sans text-xs text-zinc-400 leading-relaxed">
                Draft structured claims, assign explicit temporal boundaries (exp, nbf, iat), and generate production-grade signed JWTs powered by local WebCrypto entropy engines.
              </p>
            </div>
            <button type="button" data-tab-link="build" class="w-full py-2.5 px-4 rounded-lg bg-brand-orange text-black hover:bg-orange-500 font-mono text-xs font-bold flex items-center justify-between transition-colors cursor-pointer shadow-[0_0_12px_rgba(255,106,0,0.25)]">
              <span>INITIALIZE TOKEN MINT</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>
        </div>
      </div>
    `;

    // Initialize tooltip bindings
    if (window.CastleTooltip) {
      window.CastleTooltip.bind(hostContainer);
    }

    updateTamperDemo();
    updateTimelineDemo(true);
  }

  function bindEvents() {
    if (!hostContainer) return;

    // Segment Selector interaction (Chapter 01)
    ['header', 'payload', 'signature'].forEach(segKey => {
      const tabBtn = hostContainer.querySelector('#tab-btn-' + segKey);
      const segBtn = hostContainer.querySelector('#btn-seg-' + segKey);

      const handler = () => selectSegment(segKey);
      if (tabBtn) tabBtn.addEventListener('click', handler);
      if (segBtn) segBtn.addEventListener('click', handler);
    });

    // Tampering demo controls (Chapter 04)
    const tamperBtn = hostContainer.querySelector('#tamper-btn');
    const resetTamperBtn = hostContainer.querySelector('#reset-tamper-btn');
    const secretInput = hostContainer.querySelector('#tamper-secret-input');

    if (tamperBtn) {
      tamperBtn.addEventListener('click', () => {
        isTampered = true;
        updateTamperDemo();
      });
    }

    if (resetTamperBtn) {
      resetTamperBtn.addEventListener('click', () => {
        isTampered = false;
        customSecretVal = "demo-secret";
        if (secretInput) secretInput.value = "demo-secret";
        updateTamperDemo();
      });
    }

    if (secretInput) {
      secretInput.addEventListener('input', (e) => {
        customSecretVal = e.target.value;
        updateTamperDemo();
      });
    }

    // Timeline demo buttons (Chapter 05)
    const validTimeBtn = hostContainer.querySelector('#time-demo-valid');
    const expiredTimeBtn = hostContainer.querySelector('#time-demo-expired');

    if (validTimeBtn) {
      validTimeBtn.addEventListener('click', () => {
        updateTimelineDemo(true);
      });
    }

    if (expiredTimeBtn) {
      expiredTimeBtn.addEventListener('click', () => {
        updateTimelineDemo(false);
      });
    }

    // Quiz evaluation (Chapter 07)
    const quizItems = hostContainer.querySelectorAll('[data-quiz-item]');
    quizItems.forEach(item => {
      const options = item.querySelectorAll('.quiz-opt');
      const feedback = item.querySelector('.quiz-feedback');
      const explanation = item.querySelector('.quiz-explanation');

      options.forEach(opt => {
        opt.addEventListener('click', () => {
          const isCorrect = opt.getAttribute('data-correct') === 'true';

          options.forEach(o => {
            o.disabled = true;
            if (o.getAttribute('data-correct') === 'true') {
              o.className = "quiz-opt p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-bold text-left";
            } else {
              o.className = "quiz-opt p-3 rounded-lg bg-[#0A0A0A] border border-[#222222] text-zinc-500 opacity-60 text-left";
            }
          });

          if (isCorrect) {
            opt.className = "quiz-opt p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/60 text-emerald-400 font-bold text-left ring-1 ring-emerald-500";
            if (feedback) {
              feedback.textContent = "✓ CORRECT";
              feedback.className = "quiz-feedback font-mono text-xs text-emerald-400 font-bold";
            }
          } else {
            opt.className = "quiz-opt p-3 rounded-lg bg-red-500/20 border border-red-500/60 text-red-400 font-bold text-left ring-1 ring-red-500";
            if (feedback) {
              feedback.textContent = "✗ INCORRECT";
              feedback.className = "quiz-feedback font-mono text-xs text-red-400 font-bold";
            }
          }

          if (explanation) {
            explanation.classList.remove('hidden');
            const qId = item.getAttribute('data-quiz-item');
            if (qId === '1') {
              explanation.innerHTML = `<strong>Explanation:</strong> Base64URL simply transforms bytes into safe ASCII text. It does not encrypt anything. To keep payload data confidential, an organization must use JSON Web Encryption (JWE, RFC 7516) or encrypt the payload before token generation.`;
            } else if (qId === '2') {
              explanation.innerHTML = `<strong>Explanation:</strong> The signature is an HMAC calculation over the header and payload. Any alteration to the payload produces an avalanche effect in the cryptographic hash. Because the adversary doesn't know the secret, the resulting signature check fails bit-for-bit.`;
            } else if (qId === '3') {
              explanation.innerHTML = `<strong>Explanation:</strong> The "alg: none" vulnerability occurs when an application verifier accepts tokens declaring algorithm "none" and skips signature checking, allowing attackers to forge arbitrary claims (such as administrator rights) without a key.`;
            }
          }
        });
      });
    });

    // Tactical handoff links (Chapter 08)
    const handoffBtns = hostContainer.querySelectorAll('[data-tab-link]');
    handoffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab-link');
        if (target && window.CastleJwtUI && typeof window.CastleJwtUI.selectTab === 'function') {
          window.CastleJwtUI.selectTab(target);
        }
      });
    });

    // Track Navigator filtering
    const trackBtns = hostContainer.querySelectorAll('.jwt-track-btn');
    trackBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const trackId = btn.getAttribute('data-jwt-track');
        if (trackId) switchTrack(trackId);
      });
    });
  }

  function switchTrack(trackId) {
    if (!hostContainer) return;

    const anatomyEl = hostContainer.querySelector('#jwt-track-section-anatomy');
    const labEl = hostContainer.querySelector('#jwt-track-section-lab');
    const defenseEl = hostContainer.querySelector('#jwt-track-section-defense');

    if (anatomyEl) anatomyEl.classList.toggle('hidden', trackId !== 'all' && trackId !== 'anatomy');
    if (labEl) labEl.classList.toggle('hidden', trackId !== 'all' && trackId !== 'lab');
    if (defenseEl) defenseEl.classList.toggle('hidden', trackId !== 'all' && trackId !== 'defense');

    const trackBtns = hostContainer.querySelectorAll('.jwt-track-btn');
    trackBtns.forEach(btn => {
      const isTarget = btn.getAttribute('data-jwt-track') === trackId;
      if (isTarget) {
        btn.className = "jwt-track-btn chapter-step-pill active";
      } else {
        btn.className = "jwt-track-btn chapter-step-pill";
      }
    });

    if (trackId === 'lab' || trackId === 'all') {
      updateTamperDemo();
      updateTimelineDemo(true);
    }
  }

  function selectSegment(segmentKey) {
    const data = segmentData[segmentKey];
    if (!data || !hostContainer) return;

    const titleEl = hostContainer.querySelector('#explainer-title');
    const metaEl = hostContainer.querySelector('#explainer-meta');
    const descEl = hostContainer.querySelector('#explainer-desc');
    const dotEl = hostContainer.querySelector('#explainer-dot');

    if (titleEl) titleEl.textContent = data.title;
    if (metaEl) metaEl.textContent = data.meta;
    if (descEl) descEl.textContent = data.desc;
    if (dotEl) dotEl.className = "w-2.5 h-2.5 rounded-full " + data.colorClass;

    ['header', 'payload', 'signature'].forEach(k => {
      const tabBtn = hostContainer.querySelector('#tab-btn-' + k);
      if (tabBtn) {
        if (k === segmentKey) {
          tabBtn.className = "px-3.5 py-1.5 font-mono text-xs rounded-lg bg-[#141414] border " + data.borderColor + " " + data.textColor + " flex items-center gap-2 transition-all cursor-pointer font-bold shadow-sm";
        } else {
          tabBtn.className = "px-3.5 py-1.5 font-mono text-xs rounded-lg bg-[#050505] border border-[#222222] text-zinc-400 hover:text-white flex items-center gap-2 transition-all cursor-pointer";
        }
      }
    });
  }

  function updateTamperDemo() {
    if (!hostContainer) return;
    const tokenDisplay = hostContainer.querySelector('#tamper-token-display');
    const payloadDisplay = hostContainer.querySelector('#tamper-payload-display');
    const statusBanner = hostContainer.querySelector('#tamper-status-banner');
    const statusText = hostContainer.querySelector('#tamper-status-text');
    const hashStatus = hostContainer.querySelector('#tamper-hash-status');
    const hintPanel = hostContainer.querySelector('#tamper-hint-panel');

    if (!tokenDisplay || !payloadDisplay || !statusBanner) return;

    const headerB64 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
    const sigB64 = "Mroc1BHDhuLnS-9PwiK9zUgt2sE6zyBgrpy1Py3VmkA";

    let payloadJson, payloadB64;
    if (isTampered) {
      payloadJson = '{\n  "sub": "alice123",\n  "role": "admin"\n}';
      payloadB64 = "eyJzdWIiOiJhbGljZTEyMyIsInJvbGUiOiJhZG1pbiJ9";
      if (hintPanel) hintPanel.classList.remove('hidden');
    } else {
      payloadJson = '{\n  "sub": "alice123",\n  "role": "user"\n}';
      payloadB64 = "eyJzdWIiOiJhbGljZTEyMyIsInJvbGUiOiJ1c2VyIn0";
      if (hintPanel) hintPanel.classList.add('hidden');
    }

    tokenDisplay.innerHTML = `
      <span class="text-red-400 font-semibold">${headerB64}</span><span class="text-zinc-500 font-bold px-0.5">.</span><span class="text-brand-orange font-semibold underline underline-offset-2">${payloadB64}</span><span class="text-zinc-500 font-bold px-0.5">.</span><span class="text-sky-400 font-semibold">${sigB64}</span>
    `;

    payloadDisplay.textContent = payloadJson;

    const isSecretCorrect = (customSecretVal === "demo-secret");
    const isValid = !isTampered && isSecretCorrect;

    if (isValid) {
      statusBanner.className = "p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between transition-colors font-mono text-xs font-bold text-emerald-400";
      if (statusText) statusText.textContent = "✓ SIGNATURE VERIFIED WITH 'demo-secret'";
      if (hashStatus) {
        hashStatus.textContent = "SHA256 HASH COMPLIANT";
        hashStatus.className = "text-zinc-400 font-normal hidden sm:inline text-[11px]";
      }
    } else {
      let reason = "WRONG SECRET KEY SUPPLIED";
      if (isTampered && !isSecretCorrect) reason = "TAMPERED PAYLOAD AND WRONG SECRET";
      else if (isTampered) reason = "THE SIGNATURE DOES NOT MATCH THE MODIFIED PAYLOAD";

      statusBanner.className = "p-4 rounded-xl border border-red-500/40 bg-red-500/10 flex items-center justify-between transition-colors font-mono text-xs font-bold text-red-400";
      if (statusText) statusText.textContent = `✗ SIGNATURE INVALID — ${reason}`;
      if (hashStatus) {
        hashStatus.textContent = "HASH MISMATCH";
        hashStatus.className = "text-red-400 font-bold hidden sm:inline text-[11px]";
      }
    }
  }

  function updateTimelineDemo(isValidToken) {
    if (!hostContainer) return;
    const iatLabel = hostContainer.querySelector('#time-iat-label');
    const expLabel = hostContainer.querySelector('#time-exp-label');
    const statusBadge = hostContainer.querySelector('#time-status-badge');
    const statusIcon = hostContainer.querySelector('#time-status-icon');
    const statusBanner = hostContainer.querySelector('#time-status-banner');
    const progressBar = hostContainer.querySelector('#time-progress-bar');
    const cursorDot = hostContainer.querySelector('#time-cursor-dot');
    const validBtn = hostContainer.querySelector('#time-demo-valid');
    const expiredBtn = hostContainer.querySelector('#time-demo-expired');

    if (!iatLabel || !expLabel || !statusBadge || !progressBar) return;

    const formatTime = (date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " UTC";
    };

    const now = new Date();
    if (isValidToken) {
      const iatDate = new Date(now.getTime() - 15 * 60 * 1000); // 15 min ago
      const expDate = new Date(now.getTime() + 45 * 60 * 1000); // 45 min from now

      iatLabel.textContent = formatTime(iatDate);
      expLabel.textContent = formatTime(expDate);

      statusBadge.textContent = "TOKEN IS VALID // 45 MINUTES REMAINING";
      statusBadge.className = "text-emerald-400 font-bold uppercase";
      if (statusIcon) {
        statusIcon.textContent = "check_circle";
        statusIcon.className = "material-symbols-outlined text-emerald-400 text-[20px]";
      }
      if (statusBanner) {
        statusBanner.className = "p-4 rounded-xl bg-[#000000] border border-emerald-500/30 flex items-center justify-between font-mono text-xs";
      }

      progressBar.style.width = "33.3%";
      progressBar.className = "h-full bg-emerald-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]";

      if (cursorDot) {
        cursorDot.className = "w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-xs shadow-[0_0_12px_rgba(16,185,129,0.4)]";
      }

      if (validBtn) {
        validBtn.className = "px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold uppercase cursor-pointer transition-all shadow-sm";
      }
      if (expiredBtn) {
        expiredBtn.className = "px-3 py-1.5 rounded-lg bg-[#141414] text-zinc-400 hover:text-white border border-[#222222] uppercase cursor-pointer transition-all";
      }
    } else {
      const iatDate = new Date(now.getTime() - 75 * 60 * 1000); // 75 min ago
      const expDate = new Date(now.getTime() - 15 * 60 * 1000); // 15 min ago (expired)

      iatLabel.textContent = formatTime(iatDate);
      expLabel.textContent = formatTime(expDate);

      statusBadge.textContent = "TOKEN EXPIRED // 15 MINUTES PAST EXPIRATION";
      statusBadge.className = "text-red-400 font-bold uppercase";
      if (statusIcon) {
        statusIcon.textContent = "error";
        statusIcon.className = "material-symbols-outlined text-red-400 text-[20px]";
      }
      if (statusBanner) {
        statusBanner.className = "p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between font-mono text-xs";
      }

      progressBar.style.width = "100%";
      progressBar.className = "h-full bg-red-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]";

      if (cursorDot) {
        cursorDot.className = "w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs shadow-[0_0_12px_rgba(239,68,68,0.4)]";
      }

      if (validBtn) {
        validBtn.className = "px-3 py-1.5 rounded-lg bg-[#141414] text-zinc-400 hover:text-white border border-[#222222] uppercase cursor-pointer transition-all";
      }
      if (expiredBtn) {
        expiredBtn.className = "px-3 py-1.5 rounded-lg bg-red-500 text-white font-bold uppercase cursor-pointer transition-all shadow-sm";
      }
    }
  }

  // Export public API
  exports.init = init;

})(window.CastleJwtLearn);
