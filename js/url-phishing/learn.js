/*
 * URL Structure Analyzer Learn Workspace.
 * Modernized to CASTLE high-contrast technical design system.
 * Contains URL Anatomy breakdown, interactive glossary, 3-phase attacker journey,
 * "Spot the Difference" quiz, heuristic defense criteria, and compromise response playbook.
 */

(function(root) {
  'use strict';

  const glossary = {
    domain: [
      'Domain Apex (SLD)',
      'The primary registered name, such as "paypal" in paypal.com.',
      'It identifies who actually controls and operates the destination infrastructure.',
      'paypal.com vs paypa1.com'
    ],
    subdomain: [
      'Subdomain Prefix',
      'An arbitrary label prepended before the domain, such as "secure-login." in secure-login.example.com.',
      'Anyone controlling a domain can prepend deceptive labels like "paypal.verify.attacker.com".',
      'paypal.verify.example.com'
    ],
    TLD: [
      'Top-Level Domain (TLD)',
      'The ending suffix, such as .com, .org, .edu, or .xyz.',
      'Cheap or disposable TLDs registered beside trusted brands are an immediate red flag.',
      'paypal.com vs paypal.tk'
    ],
    homoglyph: [
      'Homoglyph / Punycode (IDN)',
      'Characters from other alphabets (Cyrillic, Greek) that visually imitate Latin letters.',
      'An attacker registers "pаypal.com" where "а" is Cyrillic (U+0430), deceiving a casual reader.',
      'xn--pypal-43a.com'
    ],
    typosquatting: [
      'Typosquatting',
      'A domain variant that is one mistyped character away from a legitimate property.',
      'Attackers rely on hurried reading, fat-fingering, and visual substitution (e.g., l vs 1).',
      'paypal.com vs paypa1.com'
    ],
    shortener: [
      'URL Shortener',
      'A redirection service (bit.ly, tinyurl) that maps a small token to an arbitrary target.',
      'Shorteners completely obscure the true destination authority until the HTTP redirect occurs.',
      'bit.ly/3xSec'
    ],
    HTTPS: [
      'HTTPS / TLS Protocol',
      'Transport Layer Security encrypts the data pipe between your browser and the remote server.',
      'HTTPS provides encryption in transit, NOT trustworthiness. Attackers use free TLS certs too.',
      'https://phishing-site.example'
    ],
    openRedirect: [
      'Open Redirect Parameter',
      'A legitimate web parameter (e.g. ?redirect_url=) exploited to bounce visitors to an external attacker host.',
      'Attackers abuse trusted domain reputations to slip past email filters and user scrutiny.',
      'trusted.com/login?goto=https://attacker.com'
    ]
  };

  function init() {
    const host = document.getElementById('url-tab-learn');
    if (!host) return;

    host.innerHTML = `
      <!-- ====================================================================
           CURRICULUM CHAPTER STEPPER NAVIGATION
           ==================================================================== -->
      <nav aria-label="URL Curriculum Stepper" class="curriculum-chapter-stepper sticky top-0 z-20">
        <div class="flex items-center gap-2">
          <button id="url-prev-chapter-btn" class="chapter-nav-btn" title="Previous chapter">
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            <span class="hidden sm:inline">Prev</span>
          </button>
        </div>

        <div class="chapter-steps-track" role="tablist">
          <button role="tab" class="chapter-step-pill url-chapter-step-pill active" data-url-ch="0">
            <span class="text-brand-orange font-bold">01</span>
            <span>URL Anatomy</span>
          </button>
          <button role="tab" class="chapter-step-pill url-chapter-step-pill" data-url-ch="1">
            <span class="text-brand-orange font-bold">02</span>
            <span>Challenge &amp; Glossary</span>
          </button>
          <button role="tab" class="chapter-step-pill url-chapter-step-pill" data-url-ch="2">
            <span class="text-brand-orange font-bold">03</span>
            <span>Defense &amp; Playbook</span>
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button id="url-next-chapter-btn" class="chapter-nav-btn" title="Next chapter">
            <span class="hidden sm:inline">Next</span>
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </nav>

      <!-- ====================================================================
           EDITORIAL READING CANVAS
           ==================================================================== -->
      <div class="editorial-read-canvas">
        <header class="editorial-header">
          <div class="editorial-kicker">
            <span class="editorial-kicker-dot"></span>
            <span>RFC 3986 SPECIFICATION // PHISHING THREAT ARCHITECTURE</span>
          </div>
          <h1 class="editorial-title">
            Understanding Phishing: Structural Deception at Scale
          </h1>
          <p class="editorial-lede">
            Phishing attacks manipulate human cognitive shortcuts and URL anatomy rather than breaking encryption algorithms. Attackers exploit rapid reading habits by engineering deceptive subdomain chains, lookalike typosquatting variations, and unicode homoglyphs that visually mimic authentic enterprise services.
          </p>
        </header>

        <!-- ====================================================================
             TRACK 01: ANATOMY & ATTACKER LIFECYCLE
             ==================================================================== -->
        <section id="url-ch-0" class="editorial-section">
          <h2 class="editorial-heading">
            <span class="text-brand-orange font-mono">01.</span> URL Anatomy &amp; The 3-Phase Attacker Lifecycle
          </h2>
          <p class="editorial-prose">
            Every web link consists of discrete architectural segments specified under RFC 3986. Because the human eye scans left-to-right, adversaries structure domains to place familiar brand tokens early in the path or subdomain string, concealing the true destination authority.
          </p>

          <!-- RFC 3986 Interactive URL Component Deconstructor -->
          <div class="editorial-lab-figure">
            <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
              <span class="font-mono text-xs text-brand-orange font-bold uppercase flex items-center gap-2 tracking-wider">
                <span class="material-symbols-outlined text-[18px]">fingerprint</span> Interactive RFC 3986 Address Deconstructor
              </span>
              <span class="text-[11px] font-mono text-zinc-500">Hover or tap colored segments to inspect</span>
            </div>
            <p class="font-sans text-xs text-zinc-400 leading-relaxed mb-4">
              Notice how attackers use the <strong class="text-white">Scheme</strong> and <strong class="text-white">Subdomains</strong> to disguise the actual <strong class="text-brand-orange">Domain Apex</strong>:
            </p>
            
            <div class="font-mono text-xs md:text-sm break-all bg-[#000000] p-4 rounded-xl border border-[#222222] flex flex-wrap gap-y-1.5 items-center leading-normal shadow-inner">
              <button data-castle-tooltip aria-expanded="false" class="text-sky-400 hover:underline outline-none cursor-pointer">
                https://
                <span role="tooltip" class="hidden absolute z-30 p-3 w-56 bg-[#0A0A0A] border border-sky-400 text-zinc-300 rounded-xl shadow-2xl text-left mt-2 font-sans text-xs">
                  <strong class="text-sky-400 font-mono">Scheme (Protocol)</strong><br>Browser connection method. Encrypts data in transit via TLS.
                </span>
              </button>
              <button data-castle-tooltip aria-expanded="false" class="text-amber-400 hover:underline outline-none cursor-pointer">
                mail.
                <span role="tooltip" class="hidden absolute z-30 p-3 w-56 bg-[#0A0A0A] border border-amber-400 text-zinc-300 rounded-xl shadow-2xl text-left mt-2 font-sans text-xs">
                  <strong class="text-amber-400 font-mono">Subdomain Prefix</strong><br>Arbitrary label controlled by the domain owner.
                </span>
              </button>
              <button data-castle-tooltip aria-expanded="false" class="text-brand-orange font-bold hover:underline outline-none cursor-pointer">
                example
                <span role="tooltip" class="hidden absolute z-30 p-3 w-56 bg-[#0A0A0A] border border-brand-orange text-zinc-300 rounded-xl shadow-2xl text-left mt-2 font-sans text-xs">
                  <strong class="text-brand-orange font-mono">Domain Apex (SLD)</strong><br>The actual registered destination. This determines who controls the site.
                </span>
              </button>
              <button data-castle-tooltip aria-expanded="false" class="text-amber-300 hover:underline outline-none cursor-pointer">
                .com
                <span role="tooltip" class="hidden absolute z-30 p-3 w-56 bg-[#0A0A0A] border border-amber-300 text-zinc-300 rounded-xl shadow-2xl text-left mt-2 font-sans text-xs">
                  <strong class="text-amber-300 font-mono">Top-Level Domain (TLD)</strong><br>Ending registry suffix.
                </span>
              </button>
              <button data-castle-tooltip aria-expanded="false" class="text-zinc-300 hover:underline outline-none cursor-pointer">
                /login
                <span role="tooltip" class="hidden absolute z-30 p-3 w-56 bg-[#0A0A0A] border border-zinc-400 text-zinc-300 rounded-xl shadow-2xl text-left mt-2 font-sans text-xs">
                  <strong class="text-white font-mono">Resource Path</strong><br>Internal endpoint path within the host application.
                </span>
              </button>
              <button data-castle-tooltip aria-expanded="false" class="text-purple-400 hover:underline outline-none cursor-pointer">
                ?user=1
                <span role="tooltip" class="hidden absolute z-30 p-3 w-56 bg-[#0A0A0A] border border-purple-400 text-zinc-300 rounded-xl shadow-2xl text-left mt-2 font-sans text-xs">
                  <strong class="text-purple-400 font-mono">Query Parameters</strong><br>Key-value variables passed into the web endpoint.
                </span>
              </button>
            </div>
            <div class="editorial-lab-caption">
              FIGURE 1.1 — RFC 3986 ADDRESS DECONSTRUCTION. Hover or tap colored segments to inspect protocol boundaries, subdomain hierarchies, and destination authority.
            </div>
          </div>

          <h3 class="editorial-subheading">The 3-Phase Attacker Lifecycle</h3>
          <p class="editorial-prose">
            Weaponized phishing campaigns generally follow a standardized three-step operational progression from provisioning to credential exfiltration:
          </p>

          <!-- 3-Phase Attacker Workflow Cards -->
          <div class="editorial-grid sm:grid-cols-3">
            <div class="editorial-card-item">
              <div class="flex items-center justify-between text-brand-orange font-mono text-xs mb-1">
                <span class="font-bold">PHASE 01 // PROVISION</span>
                <span class="material-symbols-outlined text-[18px]">psychology</span>
              </div>
              <h4 class="font-mono text-xs text-white font-bold">1. Visual Masquerading</h4>
              <p class="font-sans text-xs text-zinc-400 leading-relaxed">
                Attacker registers disposable infrastructure (e.g. <code class="text-zinc-200">secure-login.paypal.com.account-update.xyz</code>), relying on left-to-right reading habits to hide the real apex domain.
              </p>
            </div>

            <div class="editorial-card-item">
              <div class="flex items-center justify-between text-brand-orange font-mono text-xs mb-1">
                <span class="font-bold">PHASE 02 // CLOAK</span>
                <span class="material-symbols-outlined text-[18px]">lock</span>
              </div>
              <h4 class="font-mono text-xs text-white font-bold">2. Free TLS Certificate</h4>
              <p class="font-sans text-xs text-zinc-400 leading-relaxed">
                Attacker issues a valid TLS padlock via automated certificate authorities. Browsers show a padlock, inducing false consumer confidence in an adversary-controlled host.
              </p>
            </div>

            <div class="editorial-card-item">
              <div class="flex items-center justify-between text-emerald-400 font-mono text-xs mb-1">
                <span class="font-bold">PHASE 03 // HARVEST</span>
                <span class="material-symbols-outlined text-[18px]">shield_lock</span>
              </div>
              <h4 class="font-mono text-xs text-white font-bold">3. Credential Exfiltration</h4>
              <p class="font-sans text-xs text-zinc-400 leading-relaxed">
                Victim enters authentication credentials or MFA codes. The server exfiltrates the tokens to an attacker endpoint and immediately redirects the user to the real service to hide theft.
              </p>
            </div>
          </div>
        </section>

        <!-- ====================================================================
             TRACK 02: INTERACTIVE CHALLENGE & THREAT GLOSSARY
             ==================================================================== -->
        <section id="url-ch-1" class="editorial-section">
          <h2 class="editorial-heading">
            <span class="text-brand-orange font-mono">02.</span> Interactive Challenge &amp; Threat Architecture Glossary
          </h2>
          <p class="editorial-prose">
            Developing instinctual detection requires training visual pattern recognition against real-world obfuscation techniques, character substitutions, and deceptive top-level domains.
          </p>

          <!-- Spot the Difference Interactive Quiz -->
          <div class="editorial-lab-figure">
            <div class="flex items-center justify-between flex-wrap gap-2 mb-2">
              <span class="font-mono text-xs text-brand-orange font-bold uppercase flex items-center gap-2 tracking-wider">
                <span class="material-symbols-outlined text-[18px]">quiz</span> Spot the Difference: Authentic vs Deceptive Lookalike
              </span>
              <span class="text-[11px] font-mono text-zinc-400">Click the authentic domain</span>
            </div>
            <p class="font-sans text-xs text-zinc-400 leading-relaxed mb-4">
              One address below is the genuine brand. The other is a weaponized lookalike crafted with character swaps or deceptive typos. Test your visual detection accuracy:
            </p>
            <div id="url-quiz" class="bg-[#000000] p-4 rounded-xl border border-[#222222]"></div>
            <div class="editorial-lab-caption">
              FIGURE 2.1 — VISUAL DISCRIMINATION AUDIT. Evaluate character homoglyphs and typosquatting vectors under simulated inspection conditions.
            </div>
          </div>

          <h3 class="editorial-subheading">URL Threat Architecture Glossary</h3>
          <p class="editorial-prose">
            Eight essential mechanisms employed in deceptive link engineering and destination obfuscation:
          </p>

          <!-- Threat Architecture Glossary (8 Core Concepts) -->
          <div class="editorial-grid sm:grid-cols-2">
            ${Object.entries(glossary).map(([key, v]) => `
              <details class="editorial-card-item cursor-pointer select-none hover:border-[#333333] transition-colors">
                <summary class="text-brand-orange font-mono font-bold uppercase flex items-center justify-between text-xs">
                  <span>${v[0]}</span>
                  <span class="text-[10px] text-zinc-500 font-normal border border-[#222222] px-1.5 py-0.5 rounded">DETAILS</span>
                </summary>
                <div class="mt-3 space-y-2 font-sans text-xs">
                  <p class="text-zinc-300 leading-relaxed">${v[1]}</p>
                  <p class="text-amber-400 font-mono text-[11px]"><strong>Why it matters:</strong> ${v[2]}</p>
                  <code class="text-[11px] text-zinc-300 bg-[#000000] p-2 rounded-lg font-mono block break-all border border-[#222222]">${v[3]}</code>
                </div>
              </details>
            `).join('')}
          </div>
        </section>

        <!-- ====================================================================
             TRACK 03: DEFENSE HEURISTICS & INCIDENT PLAYBOOK
             ==================================================================== -->
        <section id="url-ch-2" class="editorial-section">
          <h2 class="editorial-heading">
            <span class="text-brand-orange font-mono">03.</span> Defensive Heuristics &amp; Compromise Playbook
          </h2>
          <p class="editorial-prose">
            Automated defensive scanning combines deterministic syntactic parsing with structural heuristics to isolate weaponized addresses before human interaction occurs.
          </p>

          <h3 class="editorial-subheading">What CASTLE Automated Heuristics Inspect</h3>
          <p class="editorial-prose">
            When you evaluate a link in the Analyzer tab, CASTLE runs instant client-side checks against key deception indicators:
          </p>

          <!-- Automated Heuristic Inspection Criteria -->
          <div class="editorial-grid sm:grid-cols-2">
            <div class="editorial-card-item">
              <span class="text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">1. Apex Domain Verification</span>
              <p class="text-zinc-400 font-sans text-xs mt-1.5 leading-relaxed">Compares the true second-level domain against known brand identities to catch misleading subdomain prefixes.</p>
            </div>
            <div class="editorial-card-item">
              <span class="text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">2. Raw IP Addresses</span>
              <p class="text-zinc-400 font-sans text-xs mt-1.5 leading-relaxed">Detects IPv4 or IPv6 literals used in place of legitimate hostnames to bypass domain reputational filters.</p>
            </div>
            <div class="editorial-card-item">
              <span class="text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">3. Subdomain Depth Stacking</span>
              <p class="text-zinc-400 font-sans text-xs mt-1.5 leading-relaxed">Flags chains of 3+ subdomain labels configured to push the real destination off narrow mobile screens.</p>
            </div>
            <div class="editorial-card-item">
              <span class="text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">4. Homoglyphs &amp; Non-ASCII IDN</span>
              <p class="text-zinc-400 font-sans text-xs mt-1.5 leading-relaxed">Scans for lookalike Cyrillic/Greek characters and unmasks Punycode <code class="text-zinc-200">xn--</code> representations.</p>
            </div>
          </div>

          <!-- Incident Response Playbook Callout -->
          <div class="editorial-callout-warning my-6">
            <div class="flex items-center justify-between flex-wrap gap-2 mb-2">
              <h4 class="font-mono text-xs text-brand-orange font-bold uppercase flex items-center gap-2 tracking-wider">
                <span class="material-symbols-outlined text-[18px]">emergency</span> Incident Response: If You Clicked a Suspicious Link
              </h4>
              <span class="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                URGENT CONTAINMENT
              </span>
            </div>
            <ul class="list-disc pl-5 space-y-2 text-xs text-zinc-300 font-sans leading-relaxed">
              <li><strong class="text-white">Rotate credentials immediately:</strong> Change the password for the affected service from a known-clean device, ensuring the new passphrase is generated with high entropy.</li>
              <li><strong class="text-white">Terminate active sessions:</strong> In the service account security settings, click "Log out of all devices" to invalidate stolen session cookies and refresh tokens.</li>
              <li><strong class="text-white">Verify multi-factor authentication:</strong> Ensure hardware security keys (FIDO2/WebAuthn) or time-based authenticator apps (TOTP) are active; remove SMS-based recovery if suspect.</li>
              <li><strong class="text-white">Audit account telemetry:</strong> Review recent login activity and audit logs for unfamiliar IP addresses, unexpected geographical regions, or unrecognized user agents.</li>
            </ul>
          </div>

          <!-- Action Handoff Bridges -->
          <div class="action-handoff-bridge mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex flex-col gap-1">
                <span class="font-mono text-xs text-brand-orange font-bold uppercase tracking-wider flex items-center gap-2">
                  <span class="material-symbols-outlined text-base">forward</span>
                  READY TO AUDIT OR CONSTRUCT SUSPICIOUS LINKS?
                </span>
                <p class="text-xs sm:text-sm text-zinc-300">
                  Run structural heuristic deconstruction on suspicious links or test defense filters with the Deceptive URL Builder.
                </p>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <button id="url-handoff-analyze-btn" type="button" class="px-4 py-2 bg-brand-orange text-black font-mono text-xs font-bold uppercase rounded-lg hover:bg-[#FF7D1A] transition-all cursor-pointer shadow-[0_0_12px_rgba(255,106,0,0.3)]">
                  Launch Analyzer →
                </button>
                <button id="url-handoff-build-btn" type="button" class="px-4 py-2 bg-[#141414] border border-[#262626] text-white hover:text-brand-orange hover:border-brand-orange font-mono text-xs font-bold uppercase rounded-lg transition-all cursor-pointer">
                  URL Builder →
                </button>
              </div>
            </div>
          </div>

          <!-- Client-Side Privacy Guarantee -->
          <div class="editorial-callout-info">
            <div class="flex items-center justify-between flex-wrap gap-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-brand-orange">shield</span>
                <span><strong class="text-white font-mono">Client-Side Isolation:</strong> All URL parsing occurs strictly in volatile browser memory. Zero destination HTTP requests or outbound telemetry are ever transmitted.</span>
              </div>
              <span class="text-[10px] text-zinc-500 font-mono">// ZERO EXTERNAL EGRESS</span>
            </div>
          </div>
        </section>
      </div>
    `;

    if (root.CastleTooltip) {
      root.CastleTooltip.bind(host);
    }
    quiz();

    // Bind URL Curriculum Stepper
    const urlPills = host.querySelectorAll('.url-chapter-step-pill');
    let activeUrlCh = 0;
    const totalUrlCh = 3;

    function showUrlChapter(idx) {
      if (idx < 0 || idx >= totalUrlCh) return;
      activeUrlCh = idx;

      urlPills.forEach((p, i) => p.classList.toggle('active', i === idx));

      const prevBtn = host.querySelector('#url-prev-chapter-btn');
      const nextBtn = host.querySelector('#url-next-chapter-btn');
      if (prevBtn) prevBtn.disabled = (idx === 0);
      if (nextBtn) {
        if (idx === totalUrlCh - 1) {
          nextBtn.innerHTML = `<span>Analyze Link</span><span class="material-symbols-outlined text-sm">arrow_forward</span>`;
        } else {
          nextBtn.innerHTML = `<span>Next</span><span class="material-symbols-outlined text-sm">arrow_forward</span>`;
        }
      }

      const targetEl = host.querySelector(`#url-ch-${idx}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    urlPills.forEach((p, i) => {
      p.addEventListener('click', () => showUrlChapter(i));
    });

    const prevBtn = host.querySelector('#url-prev-chapter-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (activeUrlCh > 0) showUrlChapter(activeUrlCh - 1);
      });
    }

    const nextBtn = host.querySelector('#url-next-chapter-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (activeUrlCh < totalUrlCh - 1) {
          showUrlChapter(activeUrlCh + 1);
        } else {
          if (root.CastleURLUI && typeof root.CastleURLUI.selectTab === 'function') {
            root.CastleURLUI.selectTab('analyze');
          }
        }
      });
    }

    // Bind Action Handoffs
    const handoffAnalyze = host.querySelector('#url-handoff-analyze-btn');
    if (handoffAnalyze) {
      handoffAnalyze.addEventListener('click', () => {
        if (root.CastleUrlPhishingUI && typeof root.CastleUrlPhishingUI.selectTab === 'function') {
          root.CastleUrlPhishingUI.selectTab('analyze');
        } else if (root.CastleURLUI && typeof root.CastleURLUI.selectTab === 'function') {
          root.CastleURLUI.selectTab('analyze');
        }
      });
    }

    const handoffBuild = host.querySelector('#url-handoff-build-btn');
    if (handoffBuild) {
      handoffBuild.addEventListener('click', () => {
        if (root.CastleUrlPhishingUI && typeof root.CastleUrlPhishingUI.selectTab === 'function') {
          root.CastleUrlPhishingUI.selectTab('build');
        } else if (root.CastleURLUI && typeof root.CastleURLUI.selectTab === 'function') {
          root.CastleURLUI.selectTab('build');
        }
      });
    }
  }

  function quiz() {
    const pairs = [
      ['paypal.com', 'paypa1.com'],
      ['google.com', 'goog1e.com'],
      ['microsoft.com', 'micros0ft.com'],
      ['amazon.com', 'amaz0n.com'],
      ['apple.com', 'app1e.com'],
      ['netflix.com', 'netfIix.com']
    ];
    let i = 0, score = 0;
    const box = document.getElementById('url-quiz');
    if (!box) return;

    function draw() {
      if (i === pairs.length) {
        box.innerHTML = `
          <div class="flex items-center justify-between font-mono text-xs flex-wrap gap-2">
            <span class="text-brand-orange font-bold">Audit Complete! Final Score: ${score}/${pairs.length}</span>
            <button id="url-quiz-restart" class="px-4 py-1.5 bg-brand-orange text-black font-bold uppercase rounded-lg cursor-pointer hover:bg-[#FF7D1A] transition-colors">Try Again</button>
          </div>
        `;
        const restartBtn = box.querySelector('#url-quiz-restart');
        if (restartBtn) {
          restartBtn.addEventListener('click', () => {
            i = 0; score = 0; draw();
          });
        }
        return;
      }

      const p = pairs[i];
      box.innerHTML = `
        <div class="flex flex-col gap-3 font-mono text-xs">
          <div class="flex justify-between items-center text-zinc-400 text-[11px]">
            <span>Challenge ${i + 1} of ${pairs.length}</span>
            <span>Current Score: ${score}/${i}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button data-real="0" class="py-3 px-4 border border-[#262626] bg-[#0A0A0A] hover:border-brand-orange text-zinc-200 rounded-lg text-xs md:text-sm font-mono transition-all cursor-pointer shadow-sm">
              ${p[0]}
            </button>
            <button data-real="1" class="py-3 px-4 border border-[#262626] bg-[#0A0A0A] hover:border-brand-orange text-zinc-200 rounded-lg text-xs md:text-sm font-mono transition-all cursor-pointer shadow-sm">
              ${p[1]}
            </button>
          </div>
          <p id="url-quiz-answer" class="text-xs min-h-[22px] font-mono"></p>
        </div>
      `;

      box.querySelectorAll('[data-real]').forEach(b => {
        b.addEventListener('click', () => {
          const ok = b.dataset.real === '0';
          if (ok) score++;
          const ans = box.querySelector('#url-quiz-answer');
          if (ans) {
            ans.innerHTML = ok
              ? `<span class="text-emerald-400 font-bold">✓ Correct!</span> <span class="text-zinc-300">${p[0]} is authentic; ${p[1]} swaps characters.</span>`
              : `<span class="text-red-400 font-bold">✗ Incorrect.</span> <span class="text-zinc-300">${p[1]} is a lookalike; ${p[0]} is authentic.</span>`;
          }
          i++;
          setTimeout(draw, 1000);
        });
      });
    }

    draw();
  }

  root.CastleUrlPhishingLearn = {
    init
  };

})(window);
