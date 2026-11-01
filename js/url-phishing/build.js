/*
 * URL Structure Analyzer Build Tab (Deception Lab).
 * Modernized to the spacious Google Stitch design system.
 * Allows safe interactive construction and live heuristic analysis of phishing vectors.
 */

(function(root) {
  'use strict';

  function init() {
    const host = document.getElementById('url-tab-build');
    if (!host) return;

    host.innerHTML = `
      <div class="studio-read-canvas">

        <!-- STUDIO HEADER -->
        <header class="studio-header">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span class="studio-kicker">SIMULATION WORKSPACE // DECEPTION LAB</span>
              <h2 class="studio-title">Phishing Deception Vector Simulator</h2>
            </div>
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111] border border-[#222222] self-start sm:self-auto">
              <span class="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
              <span class="font-mono text-[11px] text-zinc-300 font-semibold tracking-wider uppercase">Safe Client Simulation</span>
            </div>
          </div>
          <p class="studio-lede">
            Witness client-side how adversaries manipulate RFC 3986 syntax to craft deceptive links that exploit human visual scanning habits. All operations strictly manipulate text in browser memory; no external domains are ever resolved or contacted.
          </p>
        </header>

        <!-- SECTION 01: Vector Controls -->
        <section class="studio-section">
          <div class="studio-plate">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1A1A1A]">
              <div>
                <span class="font-mono text-[10px] text-brand-orange uppercase font-bold tracking-widest block mb-1">Step 01 // Vector Controls</span>
                <h3 class="font-mono text-sm text-white font-bold uppercase tracking-wider">Toggle Deception Vectors</h3>
              </div>
              <button id="url-build-reset" type="button" class="px-3.5 py-1.5 bg-[#141414] hover:bg-[#202020] text-zinc-300 hover:text-white font-mono text-xs font-semibold rounded-lg border border-[#262626] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm self-start sm:self-auto">
                <span class="material-symbols-outlined text-[16px] text-brand-orange">restart_alt</span>
                <span>RESET TO CLEAN APEX</span>
              </button>
            </div>

            <!-- Buttons Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs mt-4">
              <button data-build="swap" aria-pressed="false" class="p-3 border border-[#262626] bg-[#050505] hover:border-brand-orange text-zinc-300 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center shadow-sm">
                <span class="material-symbols-outlined text-[20px] text-brand-orange">swap_horiz</span>
                <span class="font-bold">Swap Character</span>
                <span class="text-[10px] text-zinc-500">Typosquatting (examp1e)</span>
              </button>

              <button data-build="sub" aria-pressed="false" class="p-3 border border-[#262626] bg-[#050505] hover:border-brand-orange text-zinc-300 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center shadow-sm">
                <span class="material-symbols-outlined text-[20px] text-amber-400">add_moderator</span>
                <span class="font-bold">Fake Subdomain</span>
                <span class="text-[10px] text-zinc-500">Prefix Cloaking (secure-login.)</span>
              </button>

              <button data-build="at" aria-pressed="false" class="p-3 border border-[#262626] bg-[#050505] hover:border-brand-orange text-zinc-300 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center shadow-sm">
                <span class="material-symbols-outlined text-[20px] text-red-400">alternate_email</span>
                <span class="font-bold">Insert @ Trick</span>
                <span class="text-[10px] text-zinc-500">Authority Deception</span>
              </button>

              <button data-build="tld" aria-pressed="false" class="p-3 border border-[#262626] bg-[#050505] hover:border-brand-orange text-zinc-300 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center shadow-sm">
                <span class="material-symbols-outlined text-[20px] text-amber-300">travel_explore</span>
                <span class="font-bold">Suspicious TLD</span>
                <span class="text-[10px] text-zinc-500">Switch to .tk / .xyz</span>
              </button>

              <button data-build="many" aria-pressed="false" class="p-3 border border-[#262626] bg-[#050505] hover:border-brand-orange text-zinc-300 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center shadow-sm">
                <span class="material-symbols-outlined text-[20px] text-sky-400">domain_add</span>
                <span class="font-bold">Excessive Labels</span>
                <span class="text-[10px] text-zinc-500">Nesting Depth (a.b.c.d.)</span>
              </button>
            </div>

            <!-- Generated URL Output Field -->
            <div class="flex flex-col gap-2 pt-4 mt-4 border-t border-[#161616]">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-zinc-400 font-bold uppercase tracking-wider">Step 02 // Generated Simulated Link:</span>
                <button id="url-build-copy-btn" type="button" class="text-brand-orange hover:text-white flex items-center gap-1.5 cursor-pointer font-bold uppercase transition-colors">
                  <span class="material-symbols-outlined text-[15px]">content_copy</span>
                  <span>Copy Simulated URL</span>
                </button>
              </div>
              <div class="bg-[#050505] p-4 rounded-xl border border-[#222222] flex items-center justify-between gap-3 shadow-inner">
                <code id="url-build-url" class="font-mono text-xs md:text-sm text-brand-orange break-all select-all leading-relaxed">https://example-bank.com/login</code>
              </div>
            </div>
          </div>
        </section>

        <!-- SECTION 02: Real-Time Evaluation Telemetry -->
        <section class="studio-section">
          <div class="flex items-center gap-2 mb-3">
            <span class="font-mono text-xs text-brand-orange tracking-wider font-bold uppercase">LIVE TELEMETRY // DECEPTION AUDIT</span>
            <span class="text-zinc-700">//</span>
            <span class="font-mono text-xs text-zinc-500 uppercase">REAL-TIME HEURISTIC BREAKDOWN</span>
          </div>
          <div id="url-build-results" class="flex flex-col gap-6"></div>
        </section>

      </div>
    `;

    const out = document.getElementById('url-build-url');
    const result = document.getElementById('url-build-results');
    const copyBtn = document.getElementById('url-build-copy-btn');
    const states = {
      swap: false,
      sub: false,
      at: false,
      tld: false,
      many: false
    };

    function update() {
      let hostName = 'example-bank.com';
      if (states.swap) hostName = 'examp1e-bank.com';
      if (states.sub) hostName = 'secure-login.' + hostName;
      if (states.many) hostName = 'a.b.c.d.' + hostName;

      let url = 'https://' + hostName + '/login';
      if (states.at) url = 'https://example-bank.com@' + hostName + '/login';
      if (states.tld) url = url.replace('.com/', '.tk/');

      if (out) out.textContent = url;
      if (result && root.CastleUrlPhishingAnalyze) {
        root.CastleUrlPhishingAnalyze.render(result, url);
      }
    }

    document.querySelectorAll('[data-build]').forEach(b => {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        const key = b.dataset.build;
        states[key] = !states[key];
        b.setAttribute('aria-pressed', states[key] ? 'true' : 'false');
        if (states[key]) {
          b.className = 'p-3 border border-brand-orange bg-brand-orange text-black font-bold rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center shadow-[0_0_12px_rgba(255,106,0,0.3)]';
        } else {
          b.className = 'p-3 border border-[#262626] bg-[#050505] hover:border-brand-orange text-zinc-300 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center shadow-sm';
        }
        update();
      });
    });

    const resetBtn = document.getElementById('url-build-reset');
    function resetSimulator() {
      Object.keys(states).forEach(k => states[k] = false);
      document.querySelectorAll('[data-build]').forEach(b => {
        b.setAttribute('aria-pressed', 'false');
        b.className = 'p-3 border border-[#262626] bg-[#050505] hover:border-brand-orange text-zinc-300 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center shadow-sm';
      });
      update();
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', resetSimulator);
    }

    if (copyBtn && out) {
      copyBtn.addEventListener('click', async () => {
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="material-symbols-outlined text-[14px] text-emerald-400">check</span><span class="text-emerald-400 font-bold">COPIED URL!</span>';
        const container = out.closest('.p-4') || out;
        if (container) {
          container.classList.remove('pulse-copied');
          void container.offsetWidth;
          container.classList.add('pulse-copied');
        }
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(out.textContent);
          } else {
            throw new Error('No clipboard API');
          }
        } catch (e) {
          const ta = document.createElement('textarea');
          ta.value = out.textContent;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        setTimeout(() => {
          copyBtn.innerHTML = originalHtml;
        }, 1800);
      });
    }

    update();

    root.CastleUrlPhishingBuild.reset = resetSimulator;
  }

  root.CastleUrlPhishingBuild = {
    init
  };

})(window);
