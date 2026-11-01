/*
 * URL Structure Analyzer UI Controller.
 * Injects the approved Spacious Dedicated Workspace layout from Google Stitch.
 * Preserves 100% of existing functionality, security mitigations, and accessibility contracts.
 */

(function(root) {
  'use strict';

  let ready = false;

  function init() {
    if (ready) return;
    ready = true;

    const modalHTML = `
      <div id="url-phishing-modal" role="dialog" aria-modal="true" aria-labelledby="url-modal-title" class="castle-modal fixed inset-0 z-50 overflow-y-auto bg-black text-[#e2e2e2] flex flex-col hidden select-text">
        <div id="url-phishing-backdrop" class="castle-modal-backdrop fixed inset-0 bg-black/90 backdrop-blur-md pointer-events-none -z-10"></div>
        
        <!-- ================= SYSTEM LINE ================= -->
        <header class="w-full bg-[#050505] border-b border-[#1A1A1A] sticky top-0 z-40">
          <!-- Top Telemetry Status Line -->
          <div class="w-full bg-[#0A0A0A] border-b border-[#141414] px-4 md:px-6 py-1.5">
            <div class="max-w-7xl mx-auto flex items-center justify-between font-mono text-[11px] text-zinc-400">
              <div class="flex items-center gap-2 md:gap-3 flex-wrap">
                <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
                <span class="text-emerald-400 font-semibold tracking-wider">AIR-GAP MODE ACTIVE</span>
                <span class="text-zinc-500">//</span>
                <span class="hidden sm:inline">ZERO INGRESS TELEMETRY</span>
                <span class="text-zinc-500 hidden sm:inline">//</span>
                <span>100% CLIENT-SIDE WEBCRYPTO</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="hidden md:inline text-zinc-400">ISOLATION: MIL-STD-188</span>
                <span class="text-zinc-500 hidden md:inline">//</span>
                <span class="text-brand-orange font-medium">RFC 3986 BUFFER READY</span>
              </div>
            </div>
          </div>

          <!-- Main Header Bar -->
          <div class="h-16 w-full bg-[#0D0D0D]">
            <div class="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 md:gap-4">
                <div class="w-10 h-10 bg-[#111111] border border-brand-orange/40 text-brand-orange flex items-center justify-center rounded-lg shadow-[0_0_12px_rgba(255,106,0,0.2)]">
                  <span class="material-symbols-outlined text-[22px]">link</span>
                </div>
                <div class="flex flex-col">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-base md:text-lg tracking-wider text-white font-bold">CASTLE</span>
                    <span class="font-mono text-[10px] px-2 py-0.5 bg-[#1F1F1F] text-zinc-400 rounded border border-[#2A2A2A] uppercase font-semibold">SEC-OPS v3.4</span>
                  </div>
                  <div class="font-mono text-xs text-zinc-400 tracking-tight flex items-center gap-1.5">
                    <span>UTILITIES</span>
                    <span class="text-zinc-500">/</span>
                    <span class="text-zinc-400">MODULE-05</span>
                    <span class="text-zinc-500">/</span>
                    <h2 id="url-modal-title" class="text-brand-orange font-semibold inline">URL Structure Analyzer</h2>
                  </div>
                </div>
              </div>

              <!-- Header Actions: Reset & Close -->
              <div class="flex items-center gap-2 md:gap-3">
                <button id="url-reset-workspace-btn" type="button" class="px-3 py-1.5 bg-[#141414] hover:bg-[#1F1F1F] text-zinc-300 hover:text-white font-mono text-xs rounded border border-[#262626] flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer" title="Reset Workspace">
                  <span class="material-symbols-outlined text-[16px] text-brand-orange">restart_alt</span>
                  <span class="hidden sm:inline">RESET WORKSPACE</span>
                </button>
                <button id="url-phishing-close" type="button" class="px-3.5 py-1.5 bg-brand-orange/15 hover:bg-brand-orange text-brand-orange hover:text-black font-mono text-xs font-bold rounded border border-brand-orange/50 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer" aria-label="Close URL Structure Analyzer" title="Close Workspace & Return to Dashboard">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                  <span class="hidden sm:inline">RETURN TO DASHBOARD</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Single Unified Tab Navigation Row -->
          <div class="w-full bg-[#050505] border-t border-[#1A1A1A]">
            <div class="max-w-7xl mx-auto px-4 md:px-6">
              <nav role="tablist" aria-label="URL Analyzer Tabs" class="flex items-center gap-1 md:gap-2 py-2">
                <button id="url-tab-btn-learn" role="tab" data-url-tab="learn" aria-controls="url-tab-learn" aria-selected="true" class="font-mono text-xs md:text-sm font-bold px-3.5 md:px-5 py-2 rounded transition-all flex items-center gap-2 cursor-pointer outline-none bg-brand-orange text-black border border-brand-orange shadow-[0_0_14px_rgba(255,106,0,0.3)]">
                  <span class="material-symbols-outlined text-[16px]">school</span>
                  <span>TAB 01: LEARN</span>
                </button>
                <button id="url-tab-btn-analyze" role="tab" data-url-tab="analyze" aria-controls="url-tab-analyze" aria-selected="false" class="font-mono text-xs md:text-sm font-medium px-3.5 md:px-5 py-2 rounded transition-all flex items-center gap-2 cursor-pointer outline-none text-zinc-400 bg-[#0D0D0D] border border-[#1E1E1E] hover:text-white hover:border-[#333333]">
                  <span class="material-symbols-outlined text-[16px]">radar</span>
                  <span>TAB 02: ANALYZE</span>
                </button>
                <button id="url-tab-btn-build" role="tab" data-url-tab="build" aria-controls="url-tab-build" aria-selected="false" class="font-mono text-xs md:text-sm font-medium px-3.5 md:px-5 py-2 rounded transition-all flex items-center gap-2 cursor-pointer outline-none text-zinc-400 bg-[#0D0D0D] border border-[#1E1E1E] hover:text-white hover:border-[#333333]">
                  <span class="material-symbols-outlined text-[16px]">construction</span>
                  <span class="hidden sm:inline">Build (Deception Lab)</span>
                  <span class="inline sm:hidden">Lab</span>
                </button>
              </nav>
            </div>
          </div>

          <!-- Sub-Telemetry Strip -->
          <div class="w-full bg-[#080808] border-t border-[#141414] px-4 md:px-6 py-1">
            <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 font-mono text-[11px] text-zinc-500">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse"></span>
                <span class="text-zinc-200 font-medium">CLIENT-SIDE HEURISTIC ENGINE</span>
                <span class="text-zinc-700">//</span>
                <span>RFC 3986 PARSER</span>
                <span class="text-zinc-700">//</span>
                <span class="text-emerald-400 font-semibold">100% AIR-GAPPED</span>
              </div>
              <div class="flex items-center gap-3">
                <span>LATENCY: <strong class="text-zinc-300">0.28ms</strong></span>
                <span class="text-zinc-700">//</span>
                <span>MATRIX: <span class="text-brand-orange">v2.4-STABLE</span></span>
                <span class="text-zinc-700 hidden sm:inline">//</span>
                <span class="hidden sm:inline">0 BYTES INGRESS</span>
              </div>
            </div>
          </div>
        </header>

        <!-- ================= MAIN WORKSPACE CONTENT ================= -->
        <main class="castle-modal-plate w-full flex-1 max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
          
          <!-- ================= TAB 1: LEARN ================= -->
          <div id="url-tab-learn" role="tabpanel" aria-labelledby="url-tab-btn-learn" data-url-panel="learn" class="workspace-tab-pane flex flex-col gap-6">
            <!-- Rendered dynamically by learn.js with spacious layout -->
          </div>

          <!-- ================= TAB 2: ANALYZE ================= -->
          <div id="url-tab-analyze" role="tabpanel" aria-labelledby="url-tab-btn-analyze" data-url-panel="analyze" class="workspace-tab-pane hidden">
            <div class="studio-read-canvas">

              <!-- STUDIO HEADER -->
              <header class="studio-header">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span class="studio-kicker">HEURISTIC ANATOMY &amp; AUTHORITY PARSER</span>
                    <h2 class="studio-title">URL Structure &amp; Phishing Analyzer</h2>
                  </div>
                  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111] border border-[#222222] self-start sm:self-auto">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span class="font-mono text-[11px] text-zinc-300 font-semibold tracking-wider uppercase">100% Air-Gapped Local Parser</span>
                  </div>
                </div>
                <p class="studio-lede">
                  Dissect raw URLs according to RFC 3986 grammar. Inspect authority anchors, apex domains, homoglyph entropy, and deceptive subdomain hierarchies in an isolated, air-gapped client environment without network ingress.
                </p>
              </header>

              <!-- STAGE 01 // URL INGRESS BUFFER -->
              <section class="studio-section">
                <div class="studio-plate">
                  <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#1A1A1A]">
                    <div>
                      <span class="font-mono text-[10px] text-brand-orange uppercase font-bold tracking-widest block mb-1">Step 01 // Telemetry Ingress</span>
                      <h3 class="font-mono text-sm text-white font-bold uppercase tracking-wider">URL Ingress Buffer</h3>
                    </div>
                    <!-- Synthetic Samples Bar -->
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="font-mono text-[11px] text-zinc-500 mr-1">SYNTHETIC SAMPLES:</span>
                      <button id="url-sample-1" type="button" class="px-2.5 py-1 bg-[#141414] hover:bg-brand-orange hover:text-black text-brand-orange border border-brand-orange/40 font-mono text-xs font-semibold rounded transition-colors cursor-pointer shadow-sm">
                        01: Deceptive Subdomain
                      </button>
                      <button id="url-sample-2" type="button" class="px-2.5 py-1 bg-[#141414] hover:bg-amber-400 hover:text-black text-amber-400 border border-amber-500/40 font-mono text-xs rounded transition-colors cursor-pointer shadow-sm">
                        02: Typosquatting (paypa1)
                      </button>
                      <button id="url-sample-3" type="button" class="px-2.5 py-1 bg-[#141414] hover:bg-emerald-400 hover:text-black text-emerald-400 border border-emerald-500/40 font-mono text-xs rounded transition-colors cursor-pointer shadow-sm">
                        03: Clean Apex (google.co.uk)
                      </button>
                    </div>
                  </div>

                  <!-- Main Input Bar -->
                  <div class="flex flex-col gap-3 mt-4">
                    <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
                      <div class="flex-1 relative">
                        <input id="url-phishing-input" type="text" class="w-full bg-[#050505] text-white font-mono text-xs md:text-sm px-4 py-3 rounded-lg border border-[#222222] outline-none placeholder:text-zinc-600 focus:border-brand-orange transition-all" placeholder="Paste RFC 3986 link here (e.g. https://...)" aria-label="URL to analyze" value="https://secure-login.paypal.com.account-verification.xyz/auth?user=victim99&amp;session=84920482#step2">
                      </div>
                      <div class="flex items-center gap-2 justify-end shrink-0">
                        <button id="url-btn-paste" type="button" class="px-3.5 py-3 bg-[#141414] hover:bg-[#202020] text-zinc-200 font-mono text-xs rounded-lg border border-[#262626] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm">
                          <span class="material-symbols-outlined text-[16px] text-brand-orange">content_paste</span>
                          <span>PASTE</span>
                        </button>
                        <button id="url-btn-clear" type="button" class="px-3.5 py-3 bg-[#141414] hover:bg-[#202020] text-zinc-200 font-mono text-xs rounded-lg border border-[#262626] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm">
                          <span class="material-symbols-outlined text-[16px] text-red-400">close</span>
                          <span>CLEAR</span>
                        </button>
                        <button id="url-btn-evaluate" type="button" class="btn-tactile px-5 py-3 bg-brand-orange hover:bg-[#FF7D1A] text-black font-mono text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(255,106,0,0.3)]">
                          <span class="material-symbols-outlined text-[18px]">psychology</span>
                          <span>EVALUATE</span>
                        </button>
                      </div>
                    </div>

                    <!-- Isolated Execution Footnote -->
                    <div class="p-3 bg-[#050505] rounded-lg border border-[#1A1A1A] flex items-center gap-2.5 text-xs font-mono text-zinc-400">
                      <span class="material-symbols-outlined text-emerald-400 text-[18px] shrink-0">verified_user</span>
                      <span><strong class="text-emerald-400 font-bold">Isolated Execution Guarantee:</strong> Raw strings and RFC 3986 authority anchors are analyzed purely in browser memory. Zero network requests or DNS resolutions are emitted.</span>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Dynamic Heuristic Analysis Output Area -->
              <div id="url-phishing-results" class="flex flex-col gap-6"></div>

              <!-- URL Encode/Decode Utility Collapsible -->
              <section class="studio-section">
                <div class="studio-plate">
                  <button id="url-encode-toggle" type="button" class="w-full text-left font-mono text-xs text-brand-orange font-bold uppercase flex items-center justify-between cursor-pointer">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-[18px]">code</span>
                      <span>Local URL Percent-Encoding / Decoding Utility</span>
                    </span>
                    <span class="text-[10px] text-zinc-400 font-normal border border-[#222222] px-2.5 py-1 rounded bg-[#050505]">EXPAND UTILITY</span>
                  </button>

                  <div id="url-encode-utility" class="hidden flex flex-col gap-3 mt-4 pt-4 border-t border-[#1E1E1E]">
                    <p class="text-xs text-zinc-400 font-sans">
                      Inspect obfuscated strings (%20, %2E, %2F) often utilized to bypass primitive web application firewall regex pattern filters.
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div class="flex flex-col gap-1.5">
                        <label for="url-encode-mode" class="text-[10px] font-mono text-zinc-500 uppercase font-semibold">Mode:</label>
                        <select id="url-encode-mode" class="bg-[#050505] border border-[#222222] text-xs font-mono rounded-lg p-2.5 text-zinc-200 outline-none focus:border-brand-orange cursor-pointer">
                          <option value="encode">EncodeURIComponent</option>
                          <option value="decode">DecodeURIComponent</option>
                        </select>
                      </div>
                      <div class="flex flex-col gap-1.5 md:col-span-2">
                        <label for="url-encode-input" class="text-[10px] font-mono text-zinc-500 uppercase font-semibold">Input String:</label>
                        <div class="flex gap-2">
                          <input id="url-encode-input" class="flex-1 bg-[#050505] border border-[#222222] rounded-lg p-2.5 text-xs font-mono text-zinc-200 outline-none focus:border-brand-orange" placeholder="Enter text or encoded string..." value="https://site.com/%61%75%74%68">
                          <button id="url-encode-run" type="button" class="btn-tactile px-4 py-2.5 bg-brand-orange text-black font-mono text-xs font-bold rounded-lg cursor-pointer hover:bg-[#FF7D1A] transition-colors">
                            Run
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label for="url-encode-output" class="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Parsed Output:</label>
                      <textarea id="url-encode-output" readonly rows="2" class="w-full bg-[#050505] border border-[#222222] rounded-lg p-2.5 text-xs font-mono text-emerald-400 outline-none resize-none" placeholder="Output appears here..."></textarea>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>

          <!-- ================= TAB 3: BUILD (DECEPTION LAB) ================= -->
          <div id="url-tab-build" role="tabpanel" aria-labelledby="url-tab-btn-build" data-url-panel="build" class="workspace-tab-pane hidden flex flex-col gap-6">
            <!-- Rendered dynamically by build.js with spacious layout -->
          </div>

        </main>

        <!-- ================= TACTICAL FOOTER ================= -->
        <footer class="w-full bg-[#0A0A0A] border-t border-[#1A1A1A] py-4 mt-auto">
          <div class="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-500">
            <div class="flex items-center gap-3">
              <span class="text-zinc-400 font-semibold">CASTLE SEC-OPS // MODULE-05</span>
              <span>•</span>
              <span>100% CLIENT-SIDE EXECUTION // ZERO TELEMETRY INGRESS</span>
            </div>
            <div class="flex items-center gap-4 text-zinc-400">
              <span>RFC 3986</span>
              <span>RFC 3492 (PUNYCODE)</span>
              <span>AIR-GAP VERIFIED</span>
            </div>
          </div>
        </footer>

      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    setupNavigation();
    setupIngressControls();

    // Initialize sub-controllers
    if (root.CastleUrlPhishingLearn && typeof root.CastleUrlPhishingLearn.init === 'function') {
      root.CastleUrlPhishingLearn.init();
    }
    if (root.CastleUrlPhishingAnalyze && typeof root.CastleUrlPhishingAnalyze.init === 'function') {
      root.CastleUrlPhishingAnalyze.init();
    }
    if (root.CastleUrlPhishingBuild && typeof root.CastleUrlPhishingBuild.init === 'function') {
      root.CastleUrlPhishingBuild.init();
    }
  }

  function setupNavigation() {
    const tabBtns = document.querySelectorAll('[data-url-tab]');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectTab(btn.dataset.urlTab);
      });
    });

    const closeBtn = document.getElementById('url-phishing-close');
    const backdrop = document.getElementById('url-phishing-backdrop');

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      const modal = document.getElementById('url-phishing-modal');
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        close();
      }
    });
  }

  function setupIngressControls() {
    const sample1 = document.getElementById('url-sample-1');
    const sample2 = document.getElementById('url-sample-2');
    const sample3 = document.getElementById('url-sample-3');

    const input = document.getElementById('url-phishing-input');
    const out = document.getElementById('url-phishing-results');

    if (sample1 && input) {
      sample1.addEventListener('click', () => {
        input.value = "https://secure-login.paypal.com.account-verification.xyz/auth?user=victim99&session=84920482#step2";
        if (root.CastleUrlPhishingAnalyze) root.CastleUrlPhishingAnalyze.render(out, input.value);
      });
    }

    if (sample2 && input) {
      sample2.addEventListener('click', () => {
        input.value = "https://paypa1.com/webscr?cmd=_login-run";
        if (root.CastleUrlPhishingAnalyze) root.CastleUrlPhishingAnalyze.render(out, input.value);
      });
    }

    if (sample3 && input) {
      sample3.addEventListener('click', () => {
        input.value = "https://www.google.co.uk/search?q=cybersecurity";
        if (root.CastleUrlPhishingAnalyze) root.CastleUrlPhishingAnalyze.render(out, input.value);
      });
    }

    const btnPaste = document.getElementById('url-btn-paste');
    const btnClear = document.getElementById('url-btn-clear');
    const btnEval = document.getElementById('url-btn-evaluate');
    const btnResetWorkspace = document.getElementById('url-reset-workspace-btn');

    if (btnPaste && input) {
      btnPaste.addEventListener('click', async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            input.value = text.trim();
            if (root.CastleUrlPhishingAnalyze) root.CastleUrlPhishingAnalyze.render(out, input.value);
          }
        } catch (err) {
          console.warn('Clipboard read error:', err);
        }
      });
    }

    if (btnClear && input) {
      btnClear.addEventListener('click', () => {
        input.value = '';
        if (root.CastleUrlPhishingAnalyze) root.CastleUrlPhishingAnalyze.render(out, '');
      });
    }

    if (btnEval && input) {
      btnEval.addEventListener('click', () => {
        if (root.CastleUrlPhishingAnalyze) root.CastleUrlPhishingAnalyze.render(out, input.value);
      });
    }

    if (btnResetWorkspace && input) {
      btnResetWorkspace.addEventListener('click', () => {
        input.value = '';
        if (root.CastleUrlPhishingAnalyze) root.CastleUrlPhishingAnalyze.render(out, '');
        if (root.CastleUrlPhishingBuild && typeof root.CastleUrlPhishingBuild.reset === 'function') {
          root.CastleUrlPhishingBuild.reset();
        }
      });
    }
  }

  function selectTab(name) {
    document.querySelectorAll('[data-url-panel]').forEach(panel => {
      panel.classList.toggle('hidden', panel.dataset.urlPanel !== name);
    });

    document.querySelectorAll('[data-url-tab]').forEach(btn => {
      const isSelected = btn.dataset.urlTab === name;
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      if (isSelected) {
        btn.className = "font-mono text-xs md:text-sm font-bold px-3.5 md:px-5 py-2 rounded transition-all flex items-center gap-2 cursor-pointer outline-none bg-brand-orange text-black border border-brand-orange shadow-[0_0_14px_rgba(255,106,0,0.3)]";
      } else {
        btn.className = "font-mono text-xs md:text-sm font-medium px-3.5 md:px-5 py-2 rounded transition-all flex items-center gap-2 cursor-pointer outline-none text-zinc-400 bg-[#0D0D0D] border border-[#1E1E1E] hover:text-white hover:border-[#333333]";
      }
    });

    // If switching to analyze tab and results container is empty, perform initial evaluation
    if (name === 'analyze') {
      const input = document.getElementById('url-phishing-input');
      const out = document.getElementById('url-phishing-results');
      if (input && out && !out.hasChildNodes() && root.CastleUrlPhishingAnalyze) {
        root.CastleUrlPhishingAnalyze.render(out, input.value);
      }
    }
  }

  function open() {
    init();
    const modal = document.getElementById('url-phishing-modal');
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
      root.CastleModalMotion.close('url-phishing-modal');
    } else {
      const modal = document.getElementById('url-phishing-modal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }
  }

  root.openUrlPhishingModal = open;
  root.closeUrlPhishingModal = close;
  root.CastleUrlPhishingUI = {
    init,
    open,
    close,
    selectTab
  };

  // Auto-initialize layout on DOM readiness so elements are present immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Delegated launcher trigger ensuring immediate modal opening from cards
  document.addEventListener('click', (e) => {
    const launch = e.target.closest('[data-launch-tool="url-phishing-modal"]');
    if (launch) {
      open();
    }
  });

})(window);
