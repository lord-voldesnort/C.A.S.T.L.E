/*
 * JWT Decoder & Verifier UI Manager.
 * Injects the approved Spacious Dedicated Workspace layout from Google Stitch.
 * Preserves 100% of existing functionality, SubtleCrypto HMAC verification, security assurances, and accessibility contracts.
 */

window.CastleJwtUI = window.CastleJwtUI || {};

(function(root) {
  'use strict';

  let initialized = false;
  let activeTab = 'learn';

  function init() {
    if (initialized) return;
    initialized = true;

    insertModalHTML();
    setupTabNavigation();
    setupModalEvents();

    // Initialize individual tab logics
    if (root.CastleJwtLearn && typeof root.CastleJwtLearn.init === 'function') {
      root.CastleJwtLearn.init(document.getElementById('jwt-tab-panel-learn'));
    }
    if (root.CastleJwtDecode && typeof root.CastleJwtDecode.init === 'function') {
      root.CastleJwtDecode.init();
    }
    if (root.CastleJwtBuild && typeof root.CastleJwtBuild.init === 'function') {
      root.CastleJwtBuild.init();
    }
  }

  function insertModalHTML() {
    const modalHTML = `
      <div id="jwt-modal" role="dialog" aria-modal="true" aria-labelledby="jwt-modal-title" class="castle-modal fixed inset-0 z-50 overflow-y-auto bg-black text-[#e2e2e2] flex flex-col hidden select-text">
        <div id="jwt-backdrop" class="castle-modal-backdrop fixed inset-0 bg-black/90 backdrop-blur-md pointer-events-none -z-10"></div>
        
        <!-- ================= SYSTEM LINE & HEADER ================= -->
        <header class="w-full bg-[#050505] border-b border-[#1A1A1A] sticky top-0 z-40">
          <!-- Top Telemetry Status Line -->
          <div class="w-full bg-[#0A0A0A] border-b border-[#141414] px-4 md:px-6 py-1.5">
            <div class="max-w-7xl mx-auto flex items-center justify-between font-mono text-[11px] text-zinc-400">
              <div class="flex items-center gap-2 md:gap-3 flex-wrap">
                <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
                <span class="text-emerald-400 font-semibold tracking-wider">AIR-GAP VERIFIED // 100% CLIENT-SIDE</span>
                <span class="text-zinc-600">//</span>
                <span class="hidden sm:inline">ZERO SERVER PERSISTENCE</span>
              </div>
              <div class="flex items-center gap-3 font-mono text-[11px]">
                <span class="text-zinc-400">ENGINE: <span class="text-white">WebCrypto HMAC Isolate</span></span>
                <span class="text-zinc-600">|</span>
                <span class="text-zinc-400">ENTROPY: <span class="text-emerald-400">Local Browser RAM</span></span>
              </div>
            </div>
          </div>

          <!-- Main Header Bar -->
          <div class="h-16 w-full bg-[#0D0D0D]">
            <div class="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 md:gap-4">
                <div class="w-10 h-10 bg-[#111111] border border-brand-orange/40 text-brand-orange flex items-center justify-center rounded-lg shadow-[0_0_12px_rgba(255,106,0,0.2)]">
                  <span class="material-symbols-outlined text-[22px]">shield_lock</span>
                </div>
                <div class="flex flex-col">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-base md:text-lg tracking-wider text-white font-bold">CASTLE</span>
                    <span class="font-mono text-[10px] px-2 py-0.5 bg-[#1F1F1F] text-zinc-400 rounded border border-[#2A2A2A] uppercase font-semibold">SEC-OPS v3.5</span>
                  </div>
                  <div class="font-mono text-xs text-zinc-400 tracking-tight flex items-center gap-1.5">
                    <span>WEB SECURITY</span>
                    <span class="text-zinc-600">/</span>
                    <span>MODULE-04</span>
                    <span class="text-zinc-600">/</span>
                    <h2 id="jwt-modal-title" class="text-brand-orange font-semibold inline">JWT Decoder & Cryptographic Verifier</h2>
                  </div>
                </div>
              </div>

              <!-- Header Actions: Reset & Close -->
              <div class="flex items-center gap-2 md:gap-3">
                <button id="jwt-reset-workspace-btn" type="button" class="px-3 py-1.5 bg-[#141414] hover:bg-[#1F1F1F] text-zinc-300 hover:text-white font-mono text-xs rounded border border-[#262626] flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer" title="Reset Workspace">
                  <span class="material-symbols-outlined text-[16px] text-brand-orange">restart_alt</span>
                  <span class="hidden sm:inline">RESET WORKSPACE</span>
                </button>
                <button id="jwt-close" type="button" class="px-3.5 py-1.5 bg-brand-orange/15 hover:bg-brand-orange text-brand-orange hover:text-black font-mono text-xs font-bold rounded border border-brand-orange/50 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer" aria-label="Close JWT Decoder & Verifier" title="Close Workspace & Return to Dashboard">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                  <span class="hidden sm:inline">RETURN TO DASHBOARD</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Single Unified Tab Navigation Row -->
          <div class="w-full bg-[#050505] border-t border-[#1A1A1A]">
            <div class="max-w-7xl mx-auto px-4 md:px-6">
              <nav role="tablist" aria-label="JWT Toolkit Tabs" class="flex items-center gap-1 md:gap-2 py-2">
                <button id="jwt-tab-btn-learn" role="tab" data-tab-name="learn" aria-controls="jwt-tab-panel-learn" aria-selected="true" class="font-mono text-xs md:text-sm font-bold px-3.5 md:px-5 py-2 rounded transition-all flex items-center gap-2 cursor-pointer outline-none bg-brand-orange text-black border border-brand-orange shadow-[0_0_14px_rgba(255,106,0,0.3)]">
                  <span class="material-symbols-outlined text-[16px]">school</span>
                  <span>TAB 01: LEARN</span>
                </button>
                <button id="jwt-tab-btn-decode" role="tab" data-tab-name="decode" aria-controls="jwt-tab-panel-decode" aria-selected="false" class="font-mono text-xs md:text-sm font-medium px-3.5 md:px-5 py-2 rounded transition-all flex items-center gap-2 cursor-pointer outline-none text-zinc-400 bg-[#0D0D0D] border border-[#1E1E1E] hover:text-white hover:border-[#333333]">
                  <span class="material-symbols-outlined text-[16px]">troubleshoot</span>
                  <span class="hidden sm:inline">TAB 02: DECODE & VERIFY</span>
                  <span class="inline sm:hidden">TAB 02: DECODE</span>
                </button>
                <button id="jwt-tab-btn-build" role="tab" data-tab-name="build" aria-controls="jwt-tab-panel-build" aria-selected="false" class="font-mono text-xs md:text-sm font-medium px-3.5 md:px-5 py-2 rounded transition-all flex items-center gap-2 cursor-pointer outline-none text-zinc-400 bg-[#0D0D0D] border border-[#1E1E1E] hover:text-white hover:border-[#333333]">
                  <span class="material-symbols-outlined text-[16px]">construction</span>
                  <span class="hidden sm:inline">TAB 03: BUILD & SIGN</span>
                  <span class="inline sm:hidden">TAB 03: BUILD</span>
                </button>
              </nav>
            </div>
          </div>

          <!-- Sub-Telemetry Strip -->
          <div class="w-full bg-[#080808] border-t border-[#141414] px-4 md:px-6 py-1">
            <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 font-mono text-[11px] text-zinc-500">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse"></span>
                <span class="text-zinc-200 font-medium">SubtleCrypto Engine ACTIVE</span>
                <span class="text-zinc-700">//</span>
                <span>RFC 7519 COMPLIANT</span>
                <span class="text-zinc-700">//</span>
                <span class="text-emerald-400 font-semibold">100% AIR-GAPPED</span>
              </div>
              <div class="flex items-center gap-3">
                <span>ISOLATE: <strong class="text-zinc-300 font-mono">0x4F9B..E12C</strong></span>
                <span class="text-zinc-700">//</span>
                <span>ZERO INGRESS TELEMETRY</span>
              </div>
            </div>
          </div>
        </header>

        <!-- ================= MAIN WORKSPACE CONTENT ================= -->
        <main class="castle-modal-plate w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 flex-1 flex flex-col gap-8">

          <!-- ================= TAB 1: LEARN ================= -->
          <div id="jwt-tab-panel-learn" data-jwt-panel="learn" role="tabpanel" aria-labelledby="jwt-tab-btn-learn" class="workspace-tab-pane flex flex-col gap-6">
            <!-- Rendered dynamically by learn.js with spacious curriculum -->
          </div>

          <!-- ================= TAB 2: DECODE & VERIFY ================= -->
          <div id="jwt-tab-panel-decode" data-jwt-panel="decode" role="tabpanel" aria-labelledby="jwt-tab-btn-decode" class="workspace-tab-pane hidden">
            <div class="studio-read-canvas">

              <!-- STUDIO HEADER -->
              <header class="studio-header">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span class="studio-kicker">RFC 7519 JSON WEB TOKEN FORENSICS</span>
                    <h2 class="studio-title">JWT Decoder &amp; Cryptographic Inspector</h2>
                  </div>
                  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111] border border-[#222222] self-start sm:self-auto">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span class="font-mono text-[11px] text-zinc-300 font-semibold tracking-wider uppercase">100% Air-Gapped WebCrypto</span>
                  </div>
                </div>
                <p class="studio-lede">
                  Deconstruct RFC 7519 tokens into JOSE header, identity claims, and cryptographic signature segments. Dissect token semantics and temporal constraints locally in volatile memory, then verify signature integrity against symmetric HMAC secrets.
                </p>
              </header>

              <!-- STAGE 01 // TOKEN INGRESS BUFFER -->
              <section class="studio-section">
                <div class="studio-plate">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A1A1A]">
                    <div>
                      <span class="font-mono text-[10px] text-brand-orange uppercase font-bold tracking-widest block mb-1">Step 01 // Token Ingress</span>
                      <h3 class="font-mono text-sm text-white font-bold uppercase tracking-wider">Base64URL Token Ingress Buffer</h3>
                    </div>
                    <div class="flex items-center gap-2 font-mono text-xs text-zinc-500">
                      <span id="byte-counter" class="text-emerald-400 font-semibold">0 BYTES</span>
                      <span class="text-zinc-700">//</span>
                      <span id="dot-segments" class="text-zinc-300">3 DOT-DELIMITED SEGMENTS</span>
                    </div>
                  </div>

                  <!-- Action Row -->
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2 font-mono text-xs text-zinc-400 font-semibold">
                      <span class="material-symbols-outlined text-[16px] text-brand-orange">terminal</span>
                      <span>INGRESS STREAM</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <button id="btn-paste" type="button" class="btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#262626] hover:border-brand-orange text-zinc-300 hover:text-white font-mono text-xs transition-all cursor-pointer shadow-sm">
                        <span class="material-symbols-outlined text-[14px] text-brand-orange">content_paste</span>
                        <span>Paste Clipboard</span>
                      </button>
                      <button id="btn-demo" type="button" class="btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#262626] hover:border-brand-orange text-zinc-300 hover:text-white font-mono text-xs transition-all cursor-pointer shadow-sm">
                        <span class="material-symbols-outlined text-[14px] text-emerald-400">play_circle</span>
                        <span>Load Demo Token</span>
                      </button>
                      <button id="btn-clear" type="button" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#262626] hover:border-red-500 text-zinc-400 hover:text-red-400 font-mono text-xs transition-all cursor-pointer shadow-sm">
                        <span class="material-symbols-outlined text-[14px]">delete</span>
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>

                  <!-- Textarea -->
                  <div class="relative">
                    <textarea id="jwt-input" rows="4" spellcheck="false" class="w-full bg-[#050505] border border-[#262626] rounded-lg p-3.5 font-mono text-xs md:text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-brand-orange transition-all leading-relaxed break-all resize-y" placeholder="Paste your RFC 7519 JWT here (e.g. eyJhbGciOi...)"></textarea>
                  </div>

                  <!-- Visual Segment Anatomy Pill Bar -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-xs">
                    <div id="pill-header" class="bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg flex items-center justify-between text-red-400">
                      <span class="font-bold flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-red-400"></span>
                        <span>01 // HEADER (JOSE)</span>
                      </span>
                      <span id="pill-header-size" class="text-[10px] text-zinc-400 font-semibold">0 B</span>
                    </div>
                    <div id="pill-payload" class="bg-brand-orange/10 border border-brand-orange/30 px-3 py-2 rounded-lg flex items-center justify-between text-brand-orange">
                      <span class="font-bold flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-brand-orange"></span>
                        <span>02 // PAYLOAD (CLAIMS)</span>
                      </span>
                      <span id="pill-payload-size" class="text-[10px] text-zinc-400 font-semibold">0 B</span>
                    </div>
                    <div id="pill-signature" class="bg-sky-500/10 border border-sky-500/30 px-3 py-2 rounded-lg flex items-center justify-between text-sky-400">
                      <span class="font-bold flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-sky-400"></span>
                        <span>03 // SIGNATURE (HMAC)</span>
                      </span>
                      <span id="pill-signature-size" class="text-[10px] text-zinc-400 font-semibold">0 B</span>
                    </div>
                  </div>

                  <!-- Plain English Summary Banner -->
                  <div id="jwt-one-line-summary" class="bg-[#050505] border-l-2 border-brand-orange p-3 flex items-center gap-2.5 font-mono text-xs text-zinc-300 rounded-r-lg border border-r-[#1E1E1E] border-t-[#1E1E1E] border-b-[#1E1E1E]">
                    <span class="material-symbols-outlined text-brand-orange text-[18px]">info</span>
                    <span>Input an RFC 7519 Base64URL token above or click 'Load Demo Token' to analyze segments, claims, and signature validity.</span>
                  </div>
                </div>
              </section>

              <!-- Error Banner -->
              <div id="jwt-error-container" class="hidden p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono rounded-xl leading-relaxed"></div>

              <!-- Initial Empty State -->
              <div id="jwt-empty-container" class="p-8 bg-[#080808] border border-[#1E1E1E] rounded-xl text-center font-mono text-xs text-zinc-500 shadow-inner flex flex-col items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[28px] text-zinc-600">token</span>
                <span>Waiting for RFC 7519 token buffer... Input a token above to deconstruct architecture.</span>
              </div>

              <!-- ================= PARSED RESULTS CONTAINER ================= -->
              <div id="jwt-results-container" class="hidden flex flex-col gap-8">

                <!-- Duplicate warning banner -->
                <div id="jwt-duplicate-warning" class="hidden p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono rounded-lg"></div>

                <!-- Live Expiry banner -->
                <div id="jwt-live-countdown-container" class="hidden">
                  <span id="jwt-live-countdown-value"></span>
                </div>

                <!-- STAGE 02 // DECODED SEGMENTS & CLAIMS -->
                <section class="studio-section">
                  <div class="studio-plate">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-4 border-b border-[#1A1A1A]">
                      <div>
                        <span class="font-mono text-[10px] text-brand-orange uppercase font-bold tracking-widest block mb-1">Step 02 // Decoded Anatomy</span>
                        <h3 class="font-mono text-sm text-white font-bold uppercase tracking-wider">JOSE Header &amp; Claims Architecture</h3>
                      </div>
                      <span class="font-mono text-xs text-zinc-500">Decoded locally via Base64URL reversibility. Base64URL is encoding, not encryption.</span>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <!-- LEFT: HEADER (JOSE METADATA) -->
                      <div class="bg-[#050505] border border-[#1E1E1E] rounded-xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden shadow-lg">
                        <div class="absolute top-0 left-0 right-0 h-0.5 bg-red-500"></div>
                        <div class="flex flex-col gap-3">
                          <div class="flex items-center justify-between border-b border-[#1A1A1A] pb-2">
                            <div class="flex items-center gap-2">
                              <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/40 uppercase font-semibold">HEADER (JOSE)</span>
                              <span class="font-mono text-sm text-white font-bold">Metadata &amp; Algorithm</span>
                            </div>
                            <span class="font-mono text-xs text-zinc-500">RFC 7515</span>
                          </div>
                          <div class="bg-[#000000] border border-[#222222] rounded-lg p-3.5 relative">
                            <button id="jwt-copy-header-btn" type="button" class="absolute top-2.5 right-2.5 text-zinc-400 hover:text-white p-1 rounded hover:bg-[#1A1A1A] transition-colors cursor-pointer" title="Copy Header JSON">
                              <span class="material-symbols-outlined text-[16px]">content_copy</span>
                            </button>
                            <pre class="font-mono text-xs text-red-400 overflow-x-auto leading-relaxed select-text"><code id="jwt-header-json"></code></pre>
                          </div>
                        </div>
                        <!-- Plain-English JOSE Annotations -->
                        <div class="bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg p-3 flex flex-col gap-1.5 font-mono text-xs">
                          <div class="flex items-center gap-2">
                            <span class="text-red-400 font-semibold">alg:</span>
                            <span class="text-zinc-500">→</span>
                            <span class="text-zinc-300">Cryptographic authentication cipher directive</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="text-red-400 font-semibold">typ:</span>
                            <span class="text-zinc-500">→</span>
                            <span class="text-zinc-300">Standard JSON Web Token object profile (RFC 7519)</span>
                          </div>
                        </div>
                      </div>

                      <!-- RIGHT: PAYLOAD (IDENTITY & CLAIMS) -->
                      <div class="bg-[#050505] border border-[#1E1E1E] rounded-xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden shadow-lg">
                        <div class="absolute top-0 left-0 right-0 h-0.5 bg-brand-orange"></div>
                        <div class="flex flex-col gap-3">
                          <div class="flex items-center justify-between border-b border-[#1A1A1A] pb-2">
                            <div class="flex items-center gap-2">
                              <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-orange/20 text-brand-orange border border-brand-orange/40 uppercase font-semibold">PAYLOAD</span>
                              <span class="font-mono text-sm text-white font-bold">Identity &amp; Claims</span>
                            </div>
                            <span class="font-mono text-xs text-zinc-500">RFC 7519</span>
                          </div>
                          <div class="bg-[#000000] border border-[#222222] rounded-lg p-3.5 relative">
                            <button id="jwt-copy-payload-btn" type="button" class="absolute top-2.5 right-2.5 text-zinc-400 hover:text-white p-1 rounded hover:bg-[#1A1A1A] transition-colors cursor-pointer" title="Copy Payload JSON">
                              <span class="material-symbols-outlined text-[16px]">content_copy</span>
                            </button>
                            <pre class="font-mono text-xs text-brand-orange overflow-x-auto leading-relaxed select-text"><code id="jwt-payload-json"></code></pre>
                          </div>
                        </div>
                        <!-- Plain-English Claims Translations Summary -->
                        <div class="bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                          <div class="flex items-center gap-1.5">
                            <span class="text-brand-orange font-semibold">sub:</span>
                            <span class="text-zinc-400 truncate">Subject Entity ID</span>
                          </div>
                          <div class="flex items-center gap-1.5">
                            <span class="text-brand-orange font-semibold">exp:</span>
                            <span class="text-emerald-400 truncate font-semibold">Expiration Epoch</span>
                          </div>
                          <div class="flex items-center gap-1.5">
                            <span class="text-brand-orange font-semibold">iat:</span>
                            <span class="text-zinc-400 truncate">Issued-At Timestamp</span>
                          </div>
                          <div class="flex items-center gap-1.5">
                            <span class="text-brand-orange font-semibold">iss:</span>
                            <span class="text-zinc-400 truncate">Issuer Authority</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- STAGE 03 // TOKEN INTEGRITY & LIFECYCLE AUDIT -->
                <section class="studio-section">
                  <div class="studio-plate">
                    <div class="flex items-center justify-between pb-4 border-b border-[#1A1A1A]">
                      <div>
                        <span class="font-mono text-[10px] text-brand-orange uppercase font-bold tracking-widest block mb-1">Step 03 // Lifecycle &amp; Integrity Audit</span>
                        <h3 class="font-mono text-sm text-white font-bold uppercase tracking-wider">Token Telemetry &amp; Claim Validation</h3>
                      </div>
                      <span class="font-mono text-xs text-zinc-500">4 CORE AUDIT CHECKS</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <!-- Card 1: STRUCTURE -->
                      <div class="bg-[#050505] border border-[#1E1E1E] rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md">
                        <div class="flex items-center justify-between">
                          <span class="font-mono text-[10px] text-zinc-500 uppercase font-semibold">TOKEN STRUCTURE</span>
                          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                        </div>
                        <div class="flex flex-col gap-1">
                          <div id="audit-structure-status" class="flex items-center gap-1.5 text-emerald-400 font-mono text-sm font-bold">
                            <span class="material-symbols-outlined text-[18px]">check_circle</span>
                            <span>Valid 3-Part RFC</span>
                          </div>
                          <p id="audit-structure-desc" class="font-sans text-xs text-zinc-400 leading-relaxed">Header, Payload, &amp; Signature delimited by valid periods.</p>
                        </div>
                        <div id="audit-structure-meta" class="font-mono text-xs text-white bg-[#0A0A0A] px-2 py-1 rounded border border-[#1E1E1E] text-center">
                          2 Periods // Valid Encoding
                        </div>
                      </div>

                      <!-- Card 2: ALGORITHM -->
                      <div class="bg-[#050505] border border-[#1E1E1E] rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md">
                        <div class="flex items-center justify-between">
                          <span class="font-mono text-[10px] text-zinc-500 uppercase font-semibold">DECLARED CIPHER</span>
                          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                        </div>
                        <div class="flex flex-col gap-1">
                          <div class="flex items-center gap-1.5 text-white font-mono text-sm font-bold">
                            <span class="material-symbols-outlined text-[18px] text-brand-orange">key</span>
                            <span id="jwt-status-alg">HS256 (HMAC)</span>
                          </div>
                          <p id="audit-cipher-desc" class="font-sans text-xs text-zinc-400 leading-relaxed">Symmetric key cryptographic authentication code.</p>
                        </div>
                        <div id="audit-cipher-meta" class="font-mono text-xs text-emerald-400 bg-[#0A0A0A] px-2 py-1 rounded border border-[#1E1E1E] text-center">
                          Standard Symmetric Suite
                        </div>
                      </div>

                      <!-- Card 3: LIFECYCLE -->
                      <div class="bg-[#050505] border border-[#1E1E1E] rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md">
                        <div class="flex items-center justify-between">
                          <span class="font-mono text-[10px] text-zinc-500 uppercase font-semibold">LIFECYCLE STATE</span>
                          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        </div>
                        <div class="flex flex-col gap-1">
                          <div class="flex items-center gap-1.5 text-emerald-400 font-mono text-sm font-bold">
                            <span class="material-symbols-outlined text-[18px]">schedule</span>
                            <span id="jwt-status-expiry">Active Token</span>
                          </div>
                          <p id="audit-lifecycle-desc" class="font-sans text-xs text-zinc-400 leading-relaxed">
                            NBF: <span id="jwt-status-nbf" class="text-zinc-300 font-mono">—</span>
                          </p>
                        </div>
                        <div id="audit-lifecycle-meta" class="font-mono text-xs text-zinc-300 bg-[#0A0A0A] px-2 py-1 rounded border border-[#1E1E1E] text-center">
                          Temporal Grants Enforced
                        </div>
                      </div>

                      <!-- Card 4: SIGNATURE STATE -->
                      <div class="bg-[#050505] border border-amber-500/40 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md bg-amber-500/5">
                        <div class="flex items-center justify-between">
                          <span class="font-mono text-[10px] text-amber-400 uppercase font-semibold">SIGNATURE STATE</span>
                          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                        </div>
                        <div class="flex flex-col gap-1">
                          <div class="flex items-center gap-1.5 text-amber-400 font-mono text-sm font-bold">
                            <span class="material-symbols-outlined text-[18px]">warning</span>
                            <span id="jwt-status-signature">Unverified Key</span>
                          </div>
                          <p class="font-sans text-xs text-zinc-400 leading-relaxed">Rule: <strong class="text-white">Decoded ≠ Verified</strong>. Secret evaluation required.</p>
                        </div>
                        <div id="audit-signature-meta" class="font-mono text-xs text-amber-400 bg-[#0A0A0A] px-2 py-1 rounded border border-amber-500/30 text-center font-semibold">
                          NEEDS LOCAL EVALUATION
                        </div>
                      </div>
                    </div>

                    <!-- Secondary Status Row -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-1">
                      <div class="p-3 bg-[#050505] border border-[#1E1E1E] rounded-lg flex items-center justify-between">
                        <span class="text-zinc-500 text-[10px] uppercase font-semibold">Claims Policy:</span>
                        <span id="jwt-status-policy" class="font-bold text-zinc-400">—</span>
                      </div>
                      <div class="p-3 bg-[#050505] border border-[#1E1E1E] rounded-lg flex items-center justify-between">
                        <span class="text-zinc-500 text-[10px] uppercase font-semibold">Sensitive Fields:</span>
                        <span id="jwt-status-sensitive" class="font-bold text-zinc-400">—</span>
                      </div>
                      <div class="p-3 bg-[#050505] border border-[#1E1E1E] rounded-lg flex items-center justify-between">
                        <span class="text-zinc-500 text-[10px] uppercase font-semibold">Secret Entropy:</span>
                        <span id="jwt-status-secret" class="font-bold text-zinc-400">—</span>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- STAGE 04 // CRYPTOGRAPHIC SIGNATURE VERIFICATION -->
                <section class="studio-section">
                  <div class="studio-plate">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-4 border-b border-[#1A1A1A]">
                      <div>
                        <span class="font-mono text-[10px] text-brand-orange uppercase font-bold tracking-widest block mb-1">Step 04 // Signature Verification</span>
                        <h3 class="font-mono text-sm text-white font-bold uppercase tracking-wider">SubtleCrypto HMAC Authenticator</h3>
                      </div>
                      <span class="font-mono text-xs text-zinc-500">Provide shared secret to test against WebCrypto engine.</span>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      <!-- Algorithm Selection -->
                      <div class="lg:col-span-5 flex flex-col gap-2">
                        <label for="jwt-alg-select" class="font-mono text-xs text-white uppercase flex items-center justify-between font-semibold">
                          <span>Expected Verification Algorithm</span>
                          <span class="text-sky-400 text-[10px] bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/30">ANTI-CONFUSION</span>
                        </label>
                        <div class="relative">
                          <select id="jwt-alg-select" class="w-full bg-[#050505] border border-[#262626] rounded-lg px-3.5 py-2.5 font-mono text-xs md:text-sm text-white appearance-none focus:outline-none focus:border-brand-orange cursor-pointer pr-10">
                            <option value="HS256" selected>HS256 (HMAC-SHA256) — High Assurance Standard</option>
                            <option value="HS384">HS384 (HMAC-SHA384)</option>
                            <option value="HS512">HS512 (HMAC-SHA512)</option>
                          </select>
                          <span class="material-symbols-outlined absolute right-3 top-2.5 pointer-events-none text-zinc-500 text-[20px]">expand_more</span>
                        </div>
                        <p class="font-sans text-xs text-zinc-400 mt-0.5 leading-relaxed">
                          Applications must explicitly specify approved algorithms to prevent <strong class="text-zinc-200">algorithm confusion attacks</strong> (e.g. forced 'none' or public key abuse).
                        </p>
                      </div>

                      <!-- HMAC Secret Input -->
                      <div class="lg:col-span-7 flex flex-col gap-2">
                        <div class="flex items-center justify-between font-mono text-xs font-semibold">
                          <label for="jwt-secret-input" class="text-white uppercase">HMAC Secret (Text/UTF-8)</label>
                          <div class="flex items-center gap-1.5">
                            <span class="text-zinc-500 text-[10px]">ENTROPY:</span>
                            <span id="jwt-secret-entropy-badge" class="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">AWAITING INPUT</span>
                          </div>
                        </div>
                        <div class="relative flex items-center">
                          <input id="jwt-secret-input" type="password" class="w-full bg-[#050505] border border-[#262626] rounded-lg pl-3.5 pr-12 py-2.5 font-mono text-xs md:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-orange tracking-wider" placeholder="Enter signing secret to evaluate...">
                          <button id="toggle-secret-visibility" type="button" class="absolute right-3 text-zinc-500 hover:text-white transition-colors cursor-pointer" title="Toggle secret visibility">
                            <span id="secret-visibility-icon" class="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                        </div>
                        <div class="flex items-center justify-between mt-0.5 font-mono text-xs">
                          <span class="text-zinc-400 font-sans">The demo test secret is: <code class="text-brand-orange font-mono bg-[#050505] px-1 py-0.5 rounded border border-[#1A1A1A]">your-256-bit-secret</code></span>
                          <button id="fill-demo-secret" type="button" class="text-brand-orange hover:underline font-semibold cursor-pointer">Autofill Match</button>
                        </div>
                      </div>
                    </div>

                    <!-- Primary Action Trigger -->
                    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#1A1A1A]">
                      <div class="flex items-center gap-2 font-mono text-xs text-zinc-400">
                        <span class="material-symbols-outlined text-emerald-400 text-[16px]">lock</span>
                        <span>Cryptographic execution running via <span class="text-white font-semibold">window.crypto.subtle</span> sandbox.</span>
                      </div>
                      <button id="btn-verify" type="button" class="btn-tactile w-full sm:w-auto px-6 py-3 rounded-lg bg-brand-orange hover:bg-[#FF7D1A] text-black font-mono text-xs md:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(255,106,0,0.30)]">
                        <span class="material-symbols-outlined text-[20px]">verified</span>
                        <span>VERIFY HMAC SIGNATURE</span>
                      </button>
                    </div>

                    <!-- Verified / Invalid Status Banner -->
                    <div id="jwt-status-banner" class="p-3 font-mono font-bold text-center rounded-lg border text-xs"></div>

                    <!-- Dynamic Verified Shutter Box -->
                    <div id="verified-shutter" class="hidden bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-5 flex flex-col gap-4 shadow-[0_0_24px_rgba(16,185,129,0.12)]">
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <span class="material-symbols-outlined text-[20px]">check</span>
                          </div>
                          <div>
                            <h4 class="font-mono text-sm md:text-base text-white font-bold">✓ SIGNATURE VERIFIED — CRYPTOGRAPHIC INTEGRITY CONFIRMED</h4>
                            <span class="font-mono text-xs text-emerald-400 uppercase">SubtleCrypto HMAC Byte Match Verified</span>
                          </div>
                        </div>
                        <div class="flex items-center gap-1.5 font-mono text-xs text-emerald-400 bg-[#050505] px-2.5 py-1 rounded border border-emerald-500/30">
                          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          <span>ZERO BIT TAMPERING</span>
                        </div>
                      </div>
                      <p class="font-sans text-xs md:text-sm text-zinc-300 leading-relaxed">
                        Signature matches the provided secret via SubtleCrypto HMAC. 
                        <span class="text-zinc-400">Note: A valid signature confirms the payload has not been modified since signing, but does not alone verify real-world issuer legitimacy or business authorization.</span>
                      </p>
                      <!-- Signature Stream Comparison -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div class="bg-[#050505] border border-[#1A1A1A] rounded-lg p-3 flex flex-col gap-1">
                          <span class="font-mono text-[10px] text-zinc-500 uppercase font-semibold">TOKEN SIGNATURE SEGMENT</span>
                          <code id="token-sig-stream" class="font-mono text-xs text-sky-400 break-all select-all"></code>
                        </div>
                        <div class="bg-[#050505] border border-[#1A1A1A] rounded-lg p-3 flex flex-col gap-1">
                          <span class="font-mono text-[10px] text-zinc-500 uppercase font-semibold">COMPUTED HMAC HASH DIGEST</span>
                          <code id="computed-sig-stream" class="font-mono text-xs text-emerald-400 break-all select-all"></code>
                        </div>
                      </div>
                    </div>

                    <!-- Alg Warnings -->
                    <div id="jwt-algnone-warning" class="hidden p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg leading-relaxed font-mono">
                      ⚠ This token's header declares no signature algorithm (alg: none) — it is unsigned. Never treat an unsigned token as verified.
                    </div>
                    <div id="jwt-unsupported-warning" class="hidden p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-lg leading-relaxed font-mono"></div>
                  </div>
                </section>

                <!-- STAGE 05 // COMPREHENSIVE SECURITY INSPECTION -->
                <section class="studio-section">
                  <div class="studio-plate">
                    <div class="flex items-center justify-between pb-4 border-b border-[#1A1A1A]">
                      <div>
                        <span class="font-mono text-[10px] text-brand-orange uppercase font-bold tracking-widest block mb-1">Step 05 // Deep Security Inspection</span>
                        <h3 class="font-mono text-sm text-white font-bold uppercase tracking-wider">Auditing &amp; Policy Drawers</h3>
                      </div>
                      <span class="font-mono text-xs text-zinc-500">4 TECHNICAL DRAWERS</span>
                    </div>

                    <div class="flex flex-col gap-3">
                      <!-- Drawer 1: RFC 7519 Claims Translation & Validation -->
                      <div class="bg-[#050505] border border-[#1E1E1E] rounded-xl overflow-hidden shadow-md transition-all">
                        <button class="drawer-trigger w-full px-5 py-4 flex items-center justify-between hover:bg-[#111111] transition-colors text-left cursor-pointer" type="button" onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.drawer-icon').classList.toggle('rotate-180');">
                          <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-brand-orange text-[20px]">fact_check</span>
                            <div class="flex flex-col">
                              <span class="font-mono text-xs md:text-sm text-white font-bold">RFC 7519 Registered Claims Translation &amp; Validation</span>
                              <span class="font-sans text-xs text-zinc-400">Epoch timestamps, subject identification, and temporal lifecycle validity.</span>
                            </div>
                          </div>
                          <span class="drawer-icon material-symbols-outlined text-zinc-500 transition-transform duration-200">expand_more</span>
                        </button>
                        <div class="border-t border-[#1E1E1E] p-5 bg-[#000000] flex flex-col gap-4 font-mono text-xs">
                          <div id="jwt-claims-explainer" class="space-y-2"></div>
                          
                          <!-- Policy checks inside Claims Drawer -->
                          <div class="p-4 bg-[#0A0A0A] border border-[#222222] rounded-lg flex flex-col gap-3 mt-2">
                            <span class="text-xs font-bold text-brand-orange uppercase flex items-center gap-2">
                              <span class="material-symbols-outlined text-[16px]">rule</span>
                              <span>Claims Policy Evaluation &amp; Clock Skew Configuration</span>
                            </span>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div class="flex flex-col gap-1">
                                <label for="jwt-policy-leeway" class="text-zinc-400 text-[10px] uppercase font-semibold">Clock Skew Leeway:</label>
                                <select id="jwt-policy-leeway" class="bg-[#050505] border border-[#262626] rounded-lg p-2 text-zinc-200 outline-none focus:border-brand-orange text-xs cursor-pointer">
                                  <option value="0">0 Seconds (Strict)</option>
                                  <option value="30">30 Seconds</option>
                                  <option value="60">60 Seconds (Standard)</option>
                                  <option value="120">120 Seconds</option>
                                </select>
                              </div>
                              <div class="flex flex-col gap-1">
                                <label for="jwt-policy-iss" class="text-zinc-400 text-[10px] uppercase font-semibold">Expected Issuer (iss):</label>
                                <input type="text" id="jwt-policy-iss" class="bg-[#050505] border border-[#262626] rounded-lg p-2 text-zinc-200 outline-none focus:border-brand-orange text-xs" placeholder="e.g. https://auth.castle.sec">
                              </div>
                              <div class="flex flex-col gap-1">
                                <label for="jwt-policy-aud" class="text-zinc-400 text-[10px] uppercase font-semibold">Expected Audience (aud):</label>
                                <input type="text" id="jwt-policy-aud" class="bg-[#050505] border border-[#262626] rounded-lg p-2 text-zinc-200 outline-none focus:border-brand-orange text-xs" placeholder="e.g. api.castle.sec">
                              </div>
                            </div>
                            <div id="jwt-policy-results" class="hidden p-3 bg-[#050505] border border-[#222222] rounded-lg text-xs font-mono"></div>
                          </div>
                        </div>
                      </div>

                      <!-- Drawer 2: Sensitive Data Scan & Privacy Audit -->
                      <div class="bg-[#050505] border border-[#1E1E1E] rounded-xl overflow-hidden shadow-md transition-all">
                        <button class="drawer-trigger w-full px-5 py-4 flex items-center justify-between hover:bg-[#111111] transition-colors text-left cursor-pointer" type="button" onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.drawer-icon').classList.toggle('rotate-180');">
                          <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-emerald-400 text-[20px]">privacy_tip</span>
                            <div class="flex flex-col">
                              <span class="font-mono text-xs md:text-sm text-white font-bold">Sensitive Data Scan &amp; Payload Privacy Audit</span>
                              <span class="font-sans text-xs text-zinc-400">Automated inspection for unencrypted credentials, PII, or internal tokens in payload.</span>
                            </div>
                          </div>
                          <span class="drawer-icon material-symbols-outlined text-zinc-500 transition-transform duration-200">expand_more</span>
                        </button>
                        <div id="jwt-sensitive-fields" class="border-t border-[#1E1E1E] p-5 bg-[#000000] flex flex-col gap-3 font-mono text-xs hidden"></div>
                      </div>

                      <!-- Drawer 3: HMAC Secret Entropy & Brute-Force Feasibility -->
                      <div class="bg-[#050505] border border-[#1E1E1E] rounded-xl overflow-hidden shadow-md transition-all">
                        <button class="drawer-trigger w-full px-5 py-4 flex items-center justify-between hover:bg-[#111111] transition-colors text-left cursor-pointer" type="button" onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.drawer-icon').classList.toggle('rotate-180');">
                          <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-sky-400 text-[20px]">calculate</span>
                            <div class="flex flex-col">
                              <span class="font-mono text-xs md:text-sm text-white font-bold">HMAC Secret Entropy &amp; Brute-Force Feasibility Estimate</span>
                              <span class="font-sans text-xs text-zinc-400">Shannon entropy assessment and offline GPU dictionary attack resistance.</span>
                            </div>
                          </div>
                          <span class="drawer-icon material-symbols-outlined text-zinc-500 transition-transform duration-200">expand_more</span>
                        </button>
                        <div id="jwt-secret-strength" class="border-t border-[#1E1E1E] p-5 bg-[#000000] flex flex-col gap-3 font-mono text-xs hidden"></div>
                      </div>

                      <!-- Drawer 4: Authorization Header Preview -->
                      <div class="bg-[#050505] border border-[#1E1E1E] rounded-xl overflow-hidden shadow-md transition-all">
                        <button class="drawer-trigger w-full px-5 py-4 flex items-center justify-between hover:bg-[#111111] transition-colors text-left cursor-pointer" type="button" onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.drawer-icon').classList.toggle('rotate-180');">
                          <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-purple-400 text-[20px]">vpn_key</span>
                            <div class="flex flex-col">
                              <span class="font-mono text-xs md:text-sm text-white font-bold">HTTP Authorization Header Construction</span>
                              <span class="font-sans text-xs text-zinc-400">Formatted Bearer authentication string for REST APIs and microservice gateways.</span>
                            </div>
                          </div>
                          <span class="drawer-icon material-symbols-outlined text-zinc-500 transition-transform duration-200">expand_more</span>
                        </button>
                        <div class="border-t border-[#1E1E1E] p-5 bg-[#000000] flex flex-col gap-3 font-mono text-xs hidden">
                          <code id="jwt-auth-header" class="p-3 bg-[#0A0A0A] border border-[#222222] rounded-lg text-xs font-mono break-all text-zinc-200 select-all"></code>
                          <button id="jwt-copy-auth-btn" type="button" class="btn-tactile px-4 py-2 bg-brand-orange text-black hover:bg-[#FF7D1A] text-xs font-bold font-mono uppercase rounded-lg cursor-pointer self-start transition-all shadow-sm">
                            Copy Authorization Header
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Reset Form Trigger -->
                    <div class="flex items-center justify-end mt-2 pt-3 border-t border-[#1A1A1A]">
                      <button id="jwt-reset-btn" type="button" class="px-4 py-2 bg-[#141414] hover:bg-[#1F1F1F] text-zinc-400 hover:text-white font-mono text-xs rounded-lg border border-[#262626] transition-colors cursor-pointer">
                        Reset Form
                      </button>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>

          <!-- ================= TAB 3: BUILD & SIGN ================= -->
          <div id="jwt-tab-panel-build" data-jwt-panel="build" role="tabpanel" aria-labelledby="jwt-tab-btn-build" class="workspace-tab-pane hidden">
            <div class="studio-read-canvas">

              <!-- STUDIO HEADER -->
              <header class="studio-header">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span class="studio-kicker">RFC 7519 TOKEN SYNTHESIS &amp; SIGNING</span>
                    <h2 class="studio-title">JWT Mint &amp; Cryptographic Signer</h2>
                  </div>
                  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111] border border-[#222222] self-start sm:self-auto">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span class="font-mono text-[11px] text-zinc-300 font-semibold tracking-wider uppercase">SubtleCrypto HMAC Engine</span>
                  </div>
                </div>
                <p class="studio-lede">
                  Synthesize custom RFC 7519 JSON Web Tokens in volatile client memory. Configure standard claims or author custom JSON payloads, then sign with cryptographic HMAC keys using WebCrypto SubtleCrypto.
                </p>
              </header>

              <!-- Build Error Banner -->
              <div id="jwt-build-error" class="hidden p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono rounded-xl flex items-center gap-2"></div>

              <!-- STAGE 01: Composition Mode Selection -->
              <section class="studio-section">
                <div class="studio-plate">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1A1A1A]">
                    <div>
                      <span class="font-mono text-[10px] text-brand-orange uppercase font-bold tracking-widest block mb-1">Step 01 // Payload Composition</span>
                      <h3 class="font-mono text-sm text-white font-bold uppercase tracking-wider">Payload Authoring Mode</h3>
                    </div>
                    <div class="flex items-center gap-2 bg-[#000000] p-1 rounded-lg border border-[#222222]">
                      <button type="button" id="jwt-build-mode-quick" class="px-3 py-1.5 rounded-lg bg-brand-orange text-black font-mono font-bold text-xs uppercase shadow-[0_0_12px_rgba(255,106,0,0.25)] transition-all cursor-pointer">
                        Quick Form
                      </button>
                      <button type="button" id="jwt-build-mode-custom" class="px-3 py-1.5 rounded-lg bg-[#0D0D0D] text-zinc-400 hover:text-white font-mono text-xs uppercase border border-[#222222] transition-colors cursor-pointer">
                        Custom JSON
                      </button>
                    </div>
                  </div>

                  <!-- Quick Form Configuration Grid -->
                  <div id="jwt-build-quick-container" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1.5">
                      <label for="jwt-build-sub" class="text-xs font-mono text-zinc-300 font-semibold uppercase flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-brand-orange text-[15px]">person</span>
                        <span>Subject (sub)</span>
                      </label>
                      <input type="text" id="jwt-build-sub" class="bg-[#000000] border border-[#262626] text-xs font-mono rounded-lg p-3 text-zinc-200 outline-none focus:border-brand-orange" placeholder="e.g. user123 or uuid" value="user123">
                      <span class="text-[11px] text-zinc-500 font-sans">Identifies the principal subject of the token claim.</span>
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <label for="jwt-build-role" class="text-xs font-mono text-zinc-300 font-semibold uppercase flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-brand-orange text-[15px]">badge</span>
                        <span>Role / Permissions (role)</span>
                      </label>
                      <input type="text" id="jwt-build-role" class="bg-[#000000] border border-[#262626] text-xs font-mono rounded-lg p-3 text-zinc-200 outline-none focus:border-brand-orange" placeholder="e.g. admin or editor" value="user">
                      <span class="text-[11px] text-zinc-500 font-sans">Custom role claim evaluated by application gateways.</span>
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <label for="jwt-build-iss" class="text-xs font-mono text-zinc-300 font-semibold uppercase flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-brand-orange text-[15px]">domain</span>
                        <span>Issuer (iss)</span>
                      </label>
                      <input type="text" id="jwt-build-iss" class="bg-[#000000] border border-[#262626] text-xs font-mono rounded-lg p-3 text-zinc-200 outline-none focus:border-brand-orange" placeholder="e.g. Castle Auth Gateway" value="Castle Demo">
                      <span class="text-[11px] text-zinc-500 font-sans">Identifies the authority that issued the credentials.</span>
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <label for="jwt-build-exp" class="text-xs font-mono text-zinc-300 font-semibold uppercase flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-brand-orange text-[15px]">timer</span>
                        <span>Token Lifetime (exp offset)</span>
                      </label>
                      <select id="jwt-build-exp" class="bg-[#000000] border border-[#262626] text-xs font-mono rounded-lg p-3 text-zinc-200 outline-none focus:border-brand-orange cursor-pointer">
                        <option value="900">15 Minutes (Recommended for APIs)</option>
                        <option value="3600" selected>1 Hour (Standard Session)</option>
                        <option value="86400">24 Hours (Long-lived)</option>
                        <option value="604800">7 Days (Refresh Token)</option>
                      </select>
                      <span class="text-[11px] text-zinc-500 font-sans">Expiration time calculated from issued-at instant.</span>
                    </div>

                    <div class="flex flex-col gap-1.5 md:col-span-2">
                      <label for="jwt-build-iat" class="text-xs font-mono text-zinc-300 font-semibold uppercase flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-brand-orange text-[15px]">schedule</span>
                        <span>Issued At (iat Unix Epoch)</span>
                      </label>
                      <input type="number" id="jwt-build-iat" class="bg-[#000000] border border-[#262626] text-xs font-mono rounded-lg p-3 text-zinc-200 outline-none focus:border-brand-orange">
                      <span class="text-[11px] text-zinc-500 font-sans">Timestamp representing the moment of creation (auto-filled to current UTC epoch).</span>
                    </div>
                  </div>

                  <!-- Custom JSON Configuration Container -->
                  <div id="jwt-build-custom-container" class="hidden flex flex-col gap-3">
                    <div class="flex items-center justify-between">
                      <label for="jwt-build-custom-json" class="text-xs font-mono text-zinc-300 font-semibold uppercase flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-orange text-[16px]">data_object</span>
                        <span>Raw Claims JSON Payload (RFC 7519)</span>
                      </label>
                      <span class="text-[10px] font-mono text-zinc-500 bg-[#000000] px-2 py-0.5 rounded border border-[#222222]">MUST BE JSON OBJECT</span>
                    </div>
                    <textarea id="jwt-build-custom-json" class="w-full min-h-48 bg-[#000000] border border-[#262626] rounded-xl p-4 text-xs md:text-sm font-mono text-orange-200 outline-none focus:border-brand-orange resize-y leading-relaxed" spellcheck="false"></textarea>
                    <div id="jwt-build-json-error" class="hidden p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono rounded-lg"></div>
                  </div>
                </div>
              </section>

              <!-- STAGE 02: Cryptographic Signing Parameters -->
              <section class="studio-section">
                <div class="studio-plate">
                  <div class="flex items-center gap-2 border-b border-[#1A1A1A] pb-4">
                    <div>
                      <span class="font-mono text-[10px] text-brand-orange uppercase font-bold tracking-widest block mb-1">Step 02 // Cryptographic Signing</span>
                      <h3 class="font-mono text-sm text-white font-bold uppercase tracking-wider">HMAC Cipher &amp; Secret Key</h3>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1.5 md:col-span-2">
                      <label for="jwt-build-alg" class="text-xs font-mono text-zinc-300 font-semibold uppercase flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-brand-orange text-[15px]">lock</span>
                        <span>HMAC Algorithm</span>
                      </label>
                      <select id="jwt-build-alg" class="bg-[#000000] border border-[#262626] text-xs font-mono rounded-lg p-3 text-zinc-200 outline-none focus:border-brand-orange cursor-pointer">
                        <option value="HS256" selected>HS256 (HMAC with SHA-256) — RFC 7518 Standard</option>
                        <option value="HS384">HS384 (HMAC with SHA-384)</option>
                        <option value="HS512">HS512 (HMAC with SHA-512) — Maximum Entropy</option>
                      </select>
                    </div>

                    <div class="flex flex-col gap-1.5 md:col-span-2">
                      <label for="jwt-build-secret" class="text-xs font-mono text-zinc-300 font-semibold uppercase flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-brand-orange text-[15px]">key</span>
                        <span>HMAC Secret Key (Required)</span>
                      </label>
                      <input type="password" id="jwt-build-secret" class="bg-[#000000] border border-[#262626] text-xs font-mono rounded-lg p-3 text-zinc-200 outline-none focus:border-brand-orange" placeholder="Enter signing secret (e.g. your-256-bit-secret)">
                      <div id="jwt-build-secret-strength" class="mt-1 text-[11px] font-mono text-zinc-500">
                        <span class="text-zinc-600">Enter a secret key to evaluate resistance to brute-force cracking.</span>
                      </div>
                    </div>
                  </div>

                  <!-- Generation Trigger Buttons -->
                  <div class="flex flex-wrap items-center gap-3 pt-3 border-t border-[#1A1A1A]">
                    <button id="jwt-build-generate-btn" type="button" class="btn-tactile flex-1 py-3 px-5 bg-brand-orange text-black hover:bg-orange-500 font-mono text-xs md:text-sm font-bold uppercase rounded-lg cursor-pointer shadow-[0_0_14px_rgba(255,106,0,0.3)] flex items-center justify-center gap-2">
                      <span class="material-symbols-outlined text-[18px]">lock</span>
                      <span>Generate Signed JWT</span>
                    </button>
                    <button id="jwt-build-reset-btn" type="button" class="py-3 px-5 bg-[#141414] hover:bg-[#1F1F1F] text-zinc-300 hover:text-white font-mono text-xs font-semibold rounded-lg border border-[#262626] transition-colors cursor-pointer flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[16px]">restart_alt</span>
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              </section>

              <!-- STAGE 03: Minted Token Output Container -->
              <section class="studio-section">
                <div id="jwt-build-output-container" class="hidden studio-output-hero relative overflow-hidden">
                  <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-brand-orange to-sky-500"></div>

                  <div class="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-emerald-400 text-[20px]">verified</span>
                      <h3 class="font-mono text-xs md:text-sm text-white font-bold uppercase">Stage 03 // Minted Token Artifacts</h3>
                    </div>
                    <span class="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold uppercase">CRYPTOGRAPHICALLY SIGNED</span>
                  </div>

                  <!-- Dual Deconstructed Preview -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-[#000000] border border-red-500/30 rounded-xl p-4 flex flex-col gap-2">
                      <div class="flex items-center justify-between text-xs font-mono">
                        <span class="text-red-400 font-bold uppercase">Generated Header</span>
                        <span class="text-zinc-500 text-[10px]">JOSE</span>
                      </div>
                      <pre id="jwt-build-header-out" class="p-3 bg-[#050505] border border-[#222222] rounded-lg text-xs font-mono text-red-200 overflow-x-auto leading-relaxed"></pre>
                    </div>

                    <div class="bg-[#000000] border border-brand-orange/30 rounded-xl p-4 flex flex-col gap-2">
                      <div class="flex items-center justify-between text-xs font-mono">
                        <span class="text-brand-orange font-bold uppercase">Generated Payload</span>
                        <span class="text-zinc-500 text-[10px]">CLAIMS</span>
                      </div>
                      <pre id="jwt-build-payload-out" class="p-3 bg-[#050505] border border-[#222222] rounded-lg text-xs font-mono text-orange-200 overflow-x-auto leading-relaxed"></pre>
                    </div>
                  </div>

                  <!-- Complete Serialized JWT Output -->
                  <div class="flex flex-col gap-2">
                    <label for="jwt-build-token-out" class="text-xs font-mono text-emerald-400 font-bold uppercase flex items-center justify-between">
                      <span>Serialized Base64URL JWT Stream (RFC 7519):</span>
                      <span class="text-[10px] text-zinc-500 font-normal">CLICK TEXTAREA TO SELECT ALL</span>
                    </label>
                    <textarea id="jwt-build-token-out" readonly class="w-full min-h-24 bg-[#000000] border border-emerald-500/40 rounded-xl p-4 text-xs md:text-sm font-mono text-emerald-400 select-all outline-none leading-relaxed break-all shadow-inner"></textarea>
                  </div>

                  <!-- Actions: Copy & Handoff -->
                  <div class="flex flex-wrap items-center gap-3 pt-2 border-t border-[#1A1A1A]">
                    <button id="jwt-build-copy-token-btn" type="button" class="btn-tactile py-2.5 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 font-bold font-mono uppercase rounded-lg text-xs cursor-pointer flex items-center gap-2 shadow-sm">
                      <span class="material-symbols-outlined text-[16px]">content_copy</span>
                      <span>Copy Signed Token</span>
                    </button>
                    <button id="jwt-build-analyze-btn" type="button" class="btn-tactile py-2.5 px-4 bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange border border-brand-orange/50 font-bold font-mono uppercase rounded-lg text-xs cursor-pointer transition-all flex items-center gap-2 shadow-sm">
                      <span>Analyze in Decode &amp; Verify</span>
                      <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </section>

            </div>
          </div>
          </main>

        <!-- ================= TACTICAL FOOTER ================= -->
        <footer class="w-full bg-[#0A0A0A] border-t border-[#1A1A1A] py-4 mt-auto">
          <div class="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-500">
            <div class="flex items-center gap-3">
              <span class="text-zinc-400 font-semibold">CASTLE SEC-OPS // MODULE-04</span>
              <span>•</span>
              <span>100% CLIENT-SIDE EXECUTION // ZERO TELEMETRY INGRESS</span>
            </div>
            <div class="flex items-center gap-4 text-zinc-400">
              <span>RFC 7519</span>
              <span>RFC 7515 (JOSE)</span>
              <span>RFC 7518 (JWA)</span>
              <span>AIR-GAP VERIFIED</span>
            </div>
          </div>
        </footer>

      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  function setupTabNavigation() {
    const tabs = document.querySelectorAll('#jwt-modal [role="tab"]');
    if (!tabs || tabs.length === 0) return;

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        selectTab(tab.getAttribute('data-tab-name'));
      });

      tab.addEventListener('keydown', (e) => {
        let targetIndex = null;
        if (e.key === 'ArrowRight') {
          targetIndex = (index + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft') {
          targetIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
          targetIndex = 0;
        } else if (e.key === 'End') {
          targetIndex = tabs.length - 1;
        }

        if (targetIndex !== null) {
          e.preventDefault();
          tabs[targetIndex].focus();
          selectTab(tabs[targetIndex].getAttribute('data-tab-name'));
        }
      });
    });
  }

  function selectTab(tabName) {
    if (!tabName) return;
    activeTab = tabName;

    const tabs = document.querySelectorAll('#jwt-modal [role="tab"]');
    const panels = {
      'learn': document.getElementById('jwt-tab-panel-learn'),
      'decode': document.getElementById('jwt-tab-panel-decode'),
      'build': document.getElementById('jwt-tab-panel-build')
    };

    tabs.forEach(tab => {
      const name = tab.getAttribute('data-tab-name');
      const isSelected = name === tabName;

      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');

      if (isSelected) {
        tab.className = 'font-mono text-xs md:text-sm font-bold px-3.5 md:px-5 py-2 rounded transition-all flex items-center gap-2 cursor-pointer outline-none bg-brand-orange text-black border border-brand-orange shadow-[0_0_14px_rgba(255,106,0,0.3)]';
      } else {
        tab.className = 'font-mono text-xs md:text-sm font-medium px-3.5 md:px-5 py-2 rounded transition-all flex items-center gap-2 cursor-pointer outline-none text-zinc-400 bg-[#0D0D0D] border border-[#1E1E1E] hover:text-white hover:border-[#333333]';
      }
    });

    Object.keys(panels).forEach(key => {
      if (panels[key]) {
        if (key === tabName) {
          panels[key].classList.remove('hidden');
        } else {
          panels[key].classList.add('hidden');
        }
      }
    });
  }

  function setupModalEvents() {
    const modal = document.getElementById('jwt-modal');
    const closeBtn = document.getElementById('jwt-close');
    const backdrop = document.getElementById('jwt-backdrop');
    const resetWorkspaceBtn = document.getElementById('jwt-reset-workspace-btn');

    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }

    if (backdrop) {
      backdrop.addEventListener('click', close);
    }

    if (resetWorkspaceBtn) {
      resetWorkspaceBtn.addEventListener('click', () => {
        if (root.CastleJwtDecode) root.CastleJwtDecode.resetState();
        if (root.CastleJwtBuild) root.CastleJwtBuild.resetState();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        close();
      }
    });
  }

  function open() {
    init(); // Ensure modal is inserted and initialized
    const modal = document.getElementById('jwt-modal');
    if (modal) {
      if (root.CastleModalMotion) {
        root.CastleModalMotion.open(modal, () => {
          selectTab('learn');
        });
      } else {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        selectTab('learn');
      }
    }
  }

  function close() {
    if (root.CastleModalMotion) {
      root.CastleModalMotion.close('jwt-modal', () => {
        // Wipe sensitive state on close to guarantee privacy
        if (root.CastleJwtDecode) root.CastleJwtDecode.resetState();
        if (root.CastleJwtBuild) root.CastleJwtBuild.resetState();
      });
    } else {
      const modal = document.getElementById('jwt-modal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Wipe sensitive state on close to guarantee privacy
        if (root.CastleJwtDecode) root.CastleJwtDecode.resetState();
        if (root.CastleJwtBuild) root.CastleJwtBuild.resetState();
      }
    }
  }

  // Expose triggers & public API
  root.CastleJwtUI = root.CastleJwtUI || {};
  root.CastleJwtUI.init = init;
  root.CastleJwtUI.selectTab = selectTab;
  root.CastleJwtUI.open = open;
  root.CastleJwtUI.close = close;

  root.openJwtModal = open;
  root.closeJwtModal = close;

  // Auto-initialize on DOM readiness so modal exists in DOM immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Delegated launcher trigger ensuring immediate modal opening from cards
  document.addEventListener('click', (e) => {
    const launch = e.target.closest('[data-launch-tool="jwt-modal"]');
    if (launch) {
      open();
    }
  });

})(window);
