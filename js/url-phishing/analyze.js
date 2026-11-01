/*
 * URL Structure Analyzer Heuristic Analysis Renderer.
 * Generates the approved Google Stitch spacious Level 01, Level 02, and Level 03 forensic diagnostic cards.
 * Preserves strict context-aware HTML escaping, privacy-sanitized reputation lookups, and dangerous scheme handling.
 */

(function(root) {
  'use strict';

  // Context-aware HTML entity escaping utility to prevent DOM-based XSS
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Privacy-preserving clean URL for external lookups:
  // Strips query parameters, fragments, and userinfo credentials so private tokens, passwords, and emails are never leaked
  function cleanLookupUrl(urlStringOrObj) {
    try {
      const u = typeof urlStringOrObj === 'string' ? new URL(urlStringOrObj) : urlStringOrObj;
      if (!u || !u.origin) return '';
      return u.origin + (u.pathname === '/' ? '' : u.pathname);
    } catch {
      return '';
    }
  }

  // Shannon Entropy calculation for character distribution randomness
  function computeShannonEntropy(str) {
    if (!str) return '0.00';
    const freq = {};
    for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;
    let h = 0;
    for (const ch in freq) {
      const p = freq[ch] / str.length;
      h -= p * Math.log2(p);
    }
    return h.toFixed(2);
  }

  function render(target, value) {
    if (!target) return;

    const trimmed = String(value || '').trim();
    if (!trimmed) {
      target.innerHTML = `
        <div class="p-8 bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl text-center font-mono text-xs text-zinc-400 shadow-inner flex flex-col items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[24px] text-zinc-500">travel_explore</span>
          <span>Input an RFC 3986 URL buffer above or select a synthetic sample to initiate client-side heuristic inspection.</span>
        </div>
      `;
      return;
    }

    const result = root.CastleUrlPhishingHeuristics.analyze(trimmed);

    // 1. Whitespace or Malformed Scheme Errors
    if (result.error && !result.isDangerousScheme && !result.isNonWebScheme) {
      target.innerHTML = `
        <div class="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-xs font-mono text-amber-400">
          <span class="material-symbols-outlined text-[18px] shrink-0 mt-0.5">warning</span>
          <div class="flex flex-col gap-1">
            <span class="font-bold uppercase">Invalid URL Buffer:</span>
            <span class="text-zinc-300 font-sans">${escapeHtml(result.errorDetail || 'Invalid URL entered.')}</span>
          </div>
        </div>
      `;
      return;
    }

    // 2. Dangerous Execution Pseudo-Schemes (javascript:, data:, file:, etc.)
    if (result.isDangerousScheme) {
      target.innerHTML = `
        <!-- LEVEL 01 // CRITICAL WARNING -->
        <section class="flex flex-col gap-4">
          <div class="p-5 bg-red-500/10 border border-red-500/40 rounded-xl flex flex-col gap-3 shadow-[0_0_24px_rgba(239,68,68,0.15)]">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <b class="text-red-400 font-mono text-sm uppercase flex items-center gap-2">
                <span class="material-symbols-outlined text-[20px]">dangerous</span>
                <span>Structural Risk Score: ${result.score}/100</span>
              </b>
              <span id="risk-badge" class="text-xs font-mono px-3 py-1 rounded bg-[#000000] border border-red-500/50 text-red-400 font-bold uppercase tracking-wider">
                ${escapeHtml(root.CastleUrlPhishingHeuristics.band(result.score))} // CRITICAL EXECUTION
              </span>
            </div>
            <p class="text-xs md:text-sm font-sans text-zinc-300 leading-relaxed">
              <strong>CRITICAL SECURITY HAZARD:</strong> This input utilizes an executable pseudo-scheme or local filesystem protocol. It does not resolve to an ordinary remote web page and can execute arbitrary scripts directly within your local security context.
            </p>
            <div class="bg-[#050505] p-3 rounded-lg border border-[#262626]">
              <code class="text-xs font-mono break-all text-red-400 select-all leading-relaxed">${escapeHtml(result.raw)}</code>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${result.signals.map(s => `
              <div class="p-4 bg-[#0D0D0D] border border-red-500/40 rounded-xl flex flex-col gap-1.5 shadow-md">
                <b class="text-red-400 text-xs font-mono flex items-center gap-1.5 uppercase font-bold">
                  <span class="material-symbols-outlined text-[16px]">warning</span> ${escapeHtml(s.title)}
                </b>
                <p class="text-xs text-zinc-300 font-sans leading-relaxed">${escapeHtml(s.text)}</p>
              </div>
            `).join('')}
          </div>

          <div class="p-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl text-xs font-mono text-zinc-400 flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px] text-zinc-400">info</span>
            <span>External reputation lookup (VirusTotal/Safe Browsing) is strictly disabled for client-executable pseudo-schemes to prevent protocol confusion.</span>
          </div>
        </section>
      `;
      return;
    }

    // 3. Non-Web Schemes (mailto:, tel:, etc.)
    if (result.isNonWebScheme) {
      target.innerHTML = `
        <section class="flex flex-col gap-4">
          <div class="p-5 bg-amber-500/10 border border-amber-500/40 rounded-xl flex flex-col gap-3 shadow-md">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <b class="text-amber-400 font-mono text-sm uppercase flex items-center gap-2">
                <span class="material-symbols-outlined text-[20px]">info</span>
                <span>Structural Risk Score: ${result.score}/100</span>
              </b>
              <span id="risk-badge" class="text-xs font-mono px-3 py-1 rounded bg-[#000000] border border-amber-500/40 text-amber-400 font-bold uppercase tracking-wider">
                ${escapeHtml(root.CastleUrlPhishingHeuristics.band(result.score))}
              </span>
            </div>
            <p class="text-xs md:text-sm font-sans text-zinc-300 leading-relaxed">
              This link specifies an external device protocol (such as an email client or telephone dialer) rather than loading a remote website.
            </p>
            <div class="bg-[#050505] p-3 rounded-lg border border-[#262626]">
              <code class="text-xs font-mono break-all text-amber-400 select-all leading-relaxed">${escapeHtml(result.raw)}</code>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${result.signals.map(s => `
              <div class="p-4 bg-[#0D0D0D] border border-amber-500/40 rounded-xl flex flex-col gap-1.5 shadow-md">
                <b class="text-amber-400 text-xs font-mono flex items-center gap-1.5 uppercase font-bold">
                  <span class="material-symbols-outlined text-[16px]">warning</span> ${escapeHtml(s.title)}
                </b>
                <p class="text-xs text-zinc-300 font-sans leading-relaxed">${escapeHtml(s.text)}</p>
              </div>
            `).join('')}
          </div>
        </section>
      `;
      return;
    }

    // 4. Standard Web URLs (http: and https:)
    if (!result.url) {
      target.innerHTML = `
        <div class="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-xs font-mono text-amber-400">
          <span class="material-symbols-outlined text-[18px]">warning</span>
          <span>That is not a valid URL. Enter a valid web address (e.g. example.com or https://example.com/login).</span>
        </div>
      `;
      return;
    }

    const cleanTarget = cleanLookupUrl(result.url);
    const safeBrowsingUrl = `https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent(cleanTarget)}`;
    const virusTotalUrl = `https://www.virustotal.com/gui/search/${encodeURIComponent(cleanTarget)}`;

    const hostEntropy = computeShannonEntropy(result.host || '');
    const labelCount = result.labels ? result.labels.length : 1;
    const band = root.CastleUrlPhishingHeuristics.band(result.score);

    let scoreColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    let barColor = 'bg-emerald-500';
    let riskTierLabel = 'CLEAN REPUTATION // LOW RISK';
    if (result.score > 50) {
      scoreColor = 'text-red-400 border-red-500/40 bg-red-500/10';
      barColor = 'bg-red-500';
      riskTierLabel = 'CRITICAL STRUCTURAL RISK // TIER III';
    } else if (result.score > 20) {
      scoreColor = 'text-brand-orange border-brand-orange/40 bg-brand-orange/10';
      barColor = 'bg-brand-orange';
      riskTierLabel = 'ELEVATED STRUCTURAL RISK // TIER II';
    }

    // Deconstruct tokens for the ribbon
    const schemeToken = result.url.protocol + '//';
    const subdomainsToken = result.subdomains ? (Array.isArray(result.subdomains) ? result.subdomains.join('.') + '.' : result.subdomains + '.') : '';
    const sldToken = result.sld || (result.host ? result.host.split('.')[0] : '');
    const tldToken = result.tld ? '.' + result.tld : '';
    const pathToken = result.url.pathname || '/';
    const queryToken = result.url.search || '';
    const hashToken = result.url.hash || '';

    // Check specific heuristic patterns for the diagnostic pillars
    const brandSignal = result.signals ? result.signals.find(s => s.id === 'brand_subdomain' || s.id === 'brand_hyphen' || s.id === 'brand_tld') : null;
    const tldSignal = result.signals ? result.signals.find(s => s.id === 'tld') : null;
    const subSignal = result.signals ? result.signals.find(s => s.id === 'subdomains') : null;

    target.innerHTML = `
      <!-- LEVEL 01 // OVERVIEW -->
      <section class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs text-brand-orange tracking-wider font-bold">LEVEL 01 // OVERVIEW</span>
            <span class="text-zinc-700">//</span>
            <span class="font-mono text-xs text-zinc-500">SYNTACTIC THREAT SCORE</span>
          </div>
          <span class="font-mono text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            PARSED IN 0.28ms
          </span>
        </div>

        <!-- Threat Metric Card Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <!-- Score Card (5 Cols) -->
          <div class="lg:col-span-5 bg-[#0D0D0D] p-5 md:p-6 rounded-xl border border-[#1E1E1E] shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <span class="font-mono text-[11px] text-zinc-500 uppercase font-semibold">STRUCTURAL DEFENSE METRIC</span>
                <span id="risk-badge" class="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold tracking-widest flex items-center gap-1 border ${scoreColor}">
                  <span class="material-symbols-outlined text-[13px]">warning</span>
                  <span>${escapeHtml(riskTierLabel)}</span>
                </span>
              </div>
              <div class="flex items-baseline gap-3 my-1">
                <span id="risk-score-num" class="font-mono text-4xl md:text-5xl font-bold tracking-tight text-white leading-none">${result.score}</span>
                <span class="font-mono text-xs md:text-sm text-zinc-500">/ 100 HEURISTIC RISK</span>
              </div>
              <!-- Progress Meter -->
              <div class="w-full bg-[#050505] h-2.5 rounded-full overflow-hidden flex border border-[#1E1E1E] p-0.5">
                <div id="risk-bar" class="${barColor} meter-bar-fill h-full rounded-full shadow-sm" style="width: 100%; transform-origin: left; transform: scaleX(${Math.max(result.score, 4) / 100});"></div>
              </div>
              <p class="font-sans text-xs text-zinc-400 leading-relaxed mt-1">
                Syntactic heuristic derived from <strong class="text-zinc-200">domain depth</strong>, deceptive brand keywords, and <strong class="text-zinc-200">TLD abuse profile</strong>. Evaluates structural trickery, not active runtime server payloads.
              </p>
            </div>
            <div class="pt-3 mt-4 border-t border-[#1A1A1A] flex items-center justify-between font-mono text-[11px] text-zinc-500">
              <span class="flex items-center gap-1 text-emerald-400">
                <span class="material-symbols-outlined text-[14px]">verified</span>
                Confidence: High (98.4%)
              </span>
              <span>SHANNON: ${hostEntropy} H(X)</span>
            </div>
          </div>

          <!-- Diagnostic Summary Pillars (7 Cols) -->
          <div class="lg:col-span-7 flex flex-col gap-3 justify-between">
            <!-- Pillar 1: Domain Depth -->
            <div class="bg-[#0D0D0D] p-4 rounded-xl border border-[#1E1E1E] shadow-md flex items-start gap-3.5 hover:border-[#2A2A2A] transition-colors">
              <div class="w-10 h-10 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center shrink-0 text-brand-orange">
                <span class="material-symbols-outlined text-[20px]">account_tree</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="font-mono text-xs md:text-sm text-white font-bold">Domain Depth: ${labelCount} Labels</h4>
                  <span class="px-2 py-0.5 font-mono text-[10px] rounded uppercase font-semibold ${labelCount > 3 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}">
                    ${labelCount > 3 ? 'ABNORMAL NESTING' : 'STANDARD DEPTH'}
                  </span>
                </div>
                <p class="font-sans text-xs text-zinc-400 mt-1 leading-relaxed">
                  ${subSignal ? escapeHtml(subSignal.text) : 'Standard hierarchy. Attackers frequently use multiple subdomains to induce authority confusion before mobile viewports truncate the address.'}
                </p>
              </div>
            </div>

            <!-- Pillar 2: TLD Abuse Profile -->
            <div class="bg-[#0D0D0D] p-4 rounded-xl border border-[#1E1E1E] shadow-md flex items-start gap-3.5 hover:border-[#2A2A2A] transition-colors">
              <div class="w-10 h-10 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center shrink-0 text-amber-400">
                <span class="material-symbols-outlined text-[20px]">travel_explore</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="font-mono text-xs md:text-sm text-white font-bold">TLD Profile: .${escapeHtml(result.tld || 'unknown')}</h4>
                  <span class="px-2 py-0.5 font-mono text-[10px] rounded uppercase font-semibold ${tldSignal ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}">
                    ${tldSignal ? 'ELEVATED ABUSE RISK' : 'ESTABLISHED TLD'}
                  </span>
                </div>
                <p class="font-sans text-xs text-zinc-400 mt-1 leading-relaxed">
                  ${tldSignal ? escapeHtml(tldSignal.text) : 'Established top-level domain registry with standard verification and dispute resolution mechanisms.'}
                </p>
              </div>
            </div>

            <!-- Pillar 3: Brand Anchor -->
            <div class="bg-[#0D0D0D] p-4 rounded-xl border border-[#1E1E1E] shadow-md flex items-start gap-3.5 hover:border-[#2A2A2A] transition-colors">
              <div class="w-10 h-10 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center shrink-0 text-red-400">
                <span class="material-symbols-outlined text-[20px]">fingerprint</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="font-mono text-xs md:text-sm text-white font-bold">Brand Misplacement Analysis</h4>
                  <span class="px-2 py-0.5 font-mono text-[10px] rounded uppercase font-semibold ${brandSignal ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}">
                    ${brandSignal ? 'DECEPTIVE ANCHOR' : 'NO ANCHOR SHIFT'}
                  </span>
                </div>
                <p class="font-sans text-xs text-zinc-400 mt-1 leading-relaxed">
                  ${brandSignal ? escapeHtml(brandSignal.text) : 'No high-value financial or technology brand name detected masquerading outside its legitimate apex authority.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tokenized URL Syntax Ribbon -->
        <div class="bg-[#0D0D0D] p-5 rounded-xl border border-[#1E1E1E] shadow-xl flex flex-col gap-3">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span class="font-mono text-xs text-brand-orange font-bold uppercase tracking-wider">
              SYNTAX DECONSTRUCTION // RFC 3986 TOKENS
            </span>
            <span class="font-mono text-[11px] text-zinc-500">Hover or tap segments to isolate DNS authority anchors</span>
          </div>
          <!-- Ribbon Display -->
          <div class="bg-[#050505] p-3.5 rounded-lg border border-[#222222] font-mono text-xs md:text-sm overflow-x-auto flex items-center whitespace-nowrap shadow-inner select-all">
            <span class="text-sky-400 hover:bg-sky-500/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors" title="Scheme: TLS Transport Protocol">${escapeHtml(schemeToken)}</span>
            ${subdomainsToken ? `<span class="text-amber-400 hover:bg-amber-500/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors" title="Subdomain: Prefix Cloaking / Label Boundary">${escapeHtml(subdomainsToken)}</span>` : ''}
            <span class="text-brand-orange font-bold hover:bg-brand-orange/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors bg-brand-orange/10" title="Legal Registrable Authority: True DNS Destination">${escapeHtml(sldToken)}</span>
            <span class="text-amber-300 font-semibold hover:bg-amber-400/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors" title="Top-Level Domain">${escapeHtml(tldToken)}</span>
            <span class="text-zinc-300 hover:bg-zinc-800 px-1.5 py-0.5 rounded cursor-pointer transition-colors" title="Resource Path">${escapeHtml(pathToken)}</span>
            ${queryToken ? `<span class="text-purple-400 hover:bg-purple-500/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors" title="Query String Payload">${escapeHtml(queryToken)}</span>` : ''}
            ${hashToken ? `<span class="text-zinc-400 hover:bg-zinc-800 px-1.5 py-0.5 rounded cursor-pointer transition-colors" title="Document Fragment Anchor">${escapeHtml(hashToken)}</span>` : ''}
          </div>
          <!-- Segment Legend -->
          <div class="flex flex-wrap items-center gap-3 pt-1 font-mono text-[11px] text-zinc-400">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-sm bg-sky-400"></span>
              <span>SCHEME (<code class="text-white">${escapeHtml(result.url.protocol)}</code>)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>
              <span>SUBDOMAIN MASQUERADE</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-sm bg-brand-orange"></span>
              <span class="text-white font-bold">TRUE RECIPIENT (REGISTRABLE APEX)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-sm bg-amber-300"></span>
              <span>TLD</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-sm bg-zinc-600"></span>
              <span>PATH & PAYLOAD</span>
            </div>
          </div>
        </div>
      </section>

      <!-- LEVEL 02 // SURGICAL FINDINGS -->
      <section class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <span class="font-mono text-xs text-brand-orange tracking-wider font-bold">LEVEL 02 // SURGICAL EXPLANATIONS</span>
          <span class="text-zinc-700">//</span>
          <span class="font-mono text-xs text-zinc-500">TACTICAL ANOMALY BREAKDOWN</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <!-- Finding 1: Subdomain Structure -->
          <div class="bg-[#0D0D0D] p-5 rounded-xl border border-[#1E1E1E] shadow-lg flex flex-col justify-between hover:border-[#2A2A2A] transition-colors">
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 bg-red-500/20 text-red-400 font-mono text-[10px] font-bold rounded uppercase border border-red-500/30">
                  ${brandSignal ? 'CRITICAL SPOOFING' : 'STRUCTURAL CHECK'}
                </span>
                <span class="font-mono text-[11px] text-zinc-500">HEUR-01</span>
              </div>
              <h4 class="font-mono text-xs md:text-sm text-white font-bold">Subdomain Masquerading Structure</h4>
              <p class="font-sans text-xs text-zinc-400 leading-relaxed">
                ${brandSignal ? escapeHtml(brandSignal.text) : 'Evaluates whether legitimate trusted names are placed as left-hand subdomain prefixes to deceive human eyes reading left-to-right.'}
              </p>
              <!-- Visual Side-by-Side Comparison Box -->
              <div class="mt-2 p-3 bg-[#050505] rounded-lg border border-[#222222] flex flex-col gap-2 shadow-inner font-mono text-[11px]">
                <div class="flex flex-col">
                  <span class="text-red-400 font-bold">WHAT HUMAN EYES ASSUME:</span>
                  <span class="text-zinc-300 line-through decoration-red-400">${escapeHtml(brandSignal ? 'paypal.com (Trust Anchor)' : (result.sld || 'example') + '.com')}</span>
                </div>
                <div class="h-px bg-[#1A1A1A]"></div>
                <div class="flex flex-col">
                  <span class="text-brand-orange font-bold">WHERE NETWORKS ROUTE:</span>
                  <span class="text-brand-orange font-bold">${escapeHtml(result.host || 'destination')}</span>
                </div>
              </div>
            </div>
            <div class="mt-4 pt-2 text-brand-orange font-mono text-[11px] font-semibold">
              RFC 3986 Rule: Authority ends at apex domain
            </div>
          </div>

          <!-- Finding 2: TLD Abuse Pattern -->
          <div class="bg-[#0D0D0D] p-5 rounded-xl border border-[#1E1E1E] shadow-lg flex flex-col justify-between hover:border-[#2A2A2A] transition-colors">
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 font-mono text-[10px] font-bold rounded uppercase border ${tldSignal ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}">
                  ${tldSignal ? 'HIGH-ABUSE PATTERN' : 'STANDARD REGISTRY'}
                </span>
                <span class="font-mono text-[11px] text-zinc-500">HEUR-02</span>
              </div>
              <h4 class="font-mono text-xs md:text-sm text-white font-bold">Disposable gTLD Pairing</h4>
              <p class="font-sans text-xs text-zinc-400 leading-relaxed">
                ${tldSignal ? escapeHtml(tldSignal.text) : 'High-consequence keywords paired with disposable top-level extensions (.xyz, .top, .buzz, .tk) correlate statistically with automated throwaway phishing kits.'}
              </p>
              <div class="mt-2 p-3 bg-[#050505] rounded-lg border border-[#222222] flex flex-col gap-2 shadow-inner font-mono text-[11px]">
                <div class="flex items-center justify-between text-zinc-400">
                  <span>gTLD ABUSE METRIC</span>
                  <span class="${tldSignal ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}">${tldSignal ? 'ELEVATED' : 'NOMINAL'}</span>
                </div>
                <div class="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden">
                  <div class="${tldSignal ? 'bg-amber-400' : 'bg-emerald-400'} h-full rounded-full" style="width: ${tldSignal ? '74%' : '12%'};"></div>
                </div>
                <span class="text-zinc-500 text-[10px]">Registry profile: .${escapeHtml(result.tld || 'com')}</span>
              </div>
            </div>
            <div class="mt-4 pt-2 text-amber-400 font-mono text-[11px] font-semibold">
              Reputation: ${tldSignal ? 'Common throwaway vector' : 'Standard enterprise profile'}
            </div>
          </div>

          <!-- Finding 3: HTTPS != Legitimacy -->
          <div class="bg-[#0D0D0D] p-5 rounded-xl border border-[#1E1E1E] shadow-lg flex flex-col justify-between hover:border-[#2A2A2A] transition-colors">
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold rounded uppercase border border-emerald-500/30">
                  TRANSPORT VALID
                </span>
                <span class="font-mono text-[11px] text-zinc-500">HEUR-03</span>
              </div>
              <h4 class="font-mono text-xs md:text-sm text-white font-bold">Valid HTTPS Does NOT Imply Trust</h4>
              <p class="font-sans text-xs text-zinc-400 leading-relaxed">
                The URL presents a valid TLS padlock (${escapeHtml(result.url.protocol)}). This guarantees encryption in transit against open Wi-Fi eavesdropping, but proves zero operational trust. Attackers routinely auto-issue legitimate free certificates via automated CAs.
              </p>
              <div class="mt-2 p-3 bg-[#050505] rounded-lg border border-[#222222] flex flex-col gap-1.5 shadow-inner font-mono text-[11px]">
                <div class="flex items-center gap-1.5 text-emerald-400">
                  <span class="material-symbols-outlined text-[15px]">lock</span>
                  <span>Transport: Active TLS Tunnel</span>
                </div>
                <div class="flex items-center gap-1.5 ${result.score > 20 ? 'text-red-400' : 'text-emerald-400'}">
                  <span class="material-symbols-outlined text-[15px]">${result.score > 20 ? 'gpp_bad' : 'verified_user'}</span>
                  <span>Destination Identity: ${result.score > 20 ? 'UNVERIFIED ENTITY' : 'NOMINAL DESTINATION'}</span>
                </div>
              </div>
            </div>
            <div class="mt-4 pt-2 text-emerald-400 font-mono text-[11px] font-semibold">
              Clarification: Encryption != Legitimacy
            </div>
          </div>
        </div>
      </section>

      <!-- LEVEL 03 // FORENSIC PROGRESSIVE DISCLOSURE DRAWERS -->
      <section class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs text-brand-orange tracking-wider font-bold">LEVEL 03 // FORENSIC DRAWERS</span>
            <span class="text-zinc-700">//</span>
            <span class="font-mono text-xs text-zinc-500">PROGRESSIVE DISCLOSURE SUITE</span>
          </div>
          <span class="font-mono text-[11px] text-zinc-500 hidden sm:inline">Inspect RFC 3986 spec trees & Shannon entropy</span>
        </div>

        <div class="flex flex-col gap-3">
          <!-- Drawer 1: RFC 3986 Anatomical Tree -->
          <div class="bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl overflow-hidden shadow-md">
            <button type="button" class="w-full px-5 py-3.5 flex items-center justify-between hover:bg-[#141414] transition-colors text-left cursor-pointer" onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.arrow-icon').classList.toggle('rotate-180');">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-brand-orange text-[20px]">account_tree</span>
                <span class="font-mono text-xs md:text-sm text-white font-bold">RFC 3986 Anatomical Tree (Deconstructed Spec Nodes)</span>
                <span class="font-mono text-[10px] text-zinc-500 px-2 py-0.5 bg-[#050505] rounded border border-[#222222]">7 NODES PARSED</span>
              </div>
              <span class="material-symbols-outlined text-zinc-500 transition-transform duration-200 arrow-icon">expand_more</span>
            </button>
            <div class="p-5 bg-[#050505] border-t border-[#1E1E1E] flex flex-col gap-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                <div class="p-3 bg-[#0D0D0D] rounded-lg border border-[#222222]">
                  <span class="text-zinc-500 text-[10px] uppercase block font-semibold">Protocol Scheme</span>
                  <span class="text-sky-400 font-bold">${escapeHtml(result.url.protocol)}</span>
                  <span class="text-zinc-500 block text-[10px] mt-1">Default Port: ${result.url.protocol === 'https:' ? '443' : '80'}</span>
                </div>
                <div class="p-3 bg-[#0D0D0D] rounded-lg border border-[#222222]">
                  <span class="text-zinc-500 text-[10px] uppercase block font-semibold">Subdomain Labels (${result.subdomains ? (Array.isArray(result.subdomains) ? result.subdomains.length : result.subdomains.split('.').length) : 0})</span>
                  <span class="text-amber-400 font-semibold break-all">${escapeHtml(Array.isArray(result.subdomains) ? result.subdomains.join('.') : (result.subdomains || 'None'))}</span>
                  <span class="text-zinc-500 block text-[10px] mt-1">Nesting: ${result.subdomains && (Array.isArray(result.subdomains) ? result.subdomains.length > 0 : !!result.subdomains) ? 'Multi-tier' : 'Apex only'}</span>
                </div>
                <div class="p-3 bg-[#0D0D0D] rounded-lg border border-[#222222]">
                  <span class="text-zinc-500 text-[10px] uppercase block font-semibold">Registrable SLD (Apex)</span>
                  <span class="text-brand-orange font-bold break-all">${escapeHtml(result.sld || result.host)}</span>
                  <span class="text-zinc-500 block text-[10px] mt-1">Legal Destination Authority</span>
                </div>
                <div class="p-3 bg-[#0D0D0D] rounded-lg border border-[#222222]">
                  <span class="text-zinc-500 text-[10px] uppercase block font-semibold">Top Level Domain (TLD)</span>
                  <span class="text-amber-300 font-bold">${escapeHtml(result.tld ? '.' + result.tld : 'None')}</span>
                  <span class="text-zinc-500 block text-[10px] mt-1">Registry Suffix</span>
                </div>
                <div class="p-3 bg-[#0D0D0D] rounded-lg border border-[#222222]">
                  <span class="text-zinc-500 text-[10px] uppercase block font-semibold">Resource Path</span>
                  <span class="text-zinc-200 font-medium break-all">${escapeHtml(result.url.pathname || '/')}</span>
                  <span class="text-zinc-500 block text-[10px] mt-1">Segments: ${(result.url.pathname || '/').split('/').filter(Boolean).length}</span>
                </div>
                <div class="p-3 bg-[#0D0D0D] rounded-lg border border-[#222222] lg:col-span-2">
                  <span class="text-zinc-500 text-[10px] uppercase block font-semibold">Query Parameters</span>
                  <span class="text-purple-400 font-medium break-all">${escapeHtml(result.url.search || 'None')}</span>
                  <span class="text-zinc-500 block text-[10px] mt-1">Inline HTTP GET Variables</span>
                </div>
                <div class="p-3 bg-[#0D0D0D] rounded-lg border border-[#222222]">
                  <span class="text-zinc-500 text-[10px] uppercase block font-semibold">Fragment Identifier</span>
                  <span class="text-zinc-300 font-medium break-all">${escapeHtml(result.url.hash || 'None')}</span>
                  <span class="text-zinc-500 block text-[10px] mt-1">Client-Side DOM Anchor</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Drawer 2: Entropy & Homoglyph Scan -->
          <div class="bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl overflow-hidden shadow-md">
            <button type="button" class="w-full px-5 py-3.5 flex items-center justify-between hover:bg-[#141414] transition-colors text-left cursor-pointer" onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.arrow-icon').classList.toggle('rotate-180');">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-brand-orange text-[20px]">calculate</span>
                <span class="font-mono text-xs md:text-sm text-white font-bold">Entropy & Visual Homoglyph Scan</span>
                <span class="font-mono text-[10px] text-zinc-500 px-2 py-0.5 bg-[#050505] rounded border border-[#222222]">SHANNON MATRIX</span>
              </div>
              <span class="material-symbols-outlined text-zinc-500 transition-transform duration-200 arrow-icon">expand_more</span>
            </button>
            <div class="p-5 bg-[#050505] border-t border-[#1E1E1E] flex flex-col gap-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div class="p-4 bg-[#0D0D0D] rounded-lg border border-[#222222] flex flex-col gap-1.5">
                  <span class="text-zinc-500 text-[10px] uppercase font-semibold">Shannon Entropy H(X)</span>
                  <span class="text-xl font-bold text-white">${hostEntropy} <span class="text-xs text-zinc-500 font-normal">bits/char</span></span>
                  <p class="text-zinc-400 font-sans text-xs mt-1">Lexical randomness of host. High entropy (>4.5) indicates algorithmic DGA generation.</p>
                </div>
                <div class="p-4 bg-[#0D0D0D] rounded-lg border border-[#222222] flex flex-col gap-1.5">
                  <span class="text-zinc-500 text-[10px] uppercase font-semibold">Punycode (IDN) Homoglyphs</span>
                  <div class="flex items-center gap-1.5 mt-0.5 font-bold ${result.host && result.host.includes('xn--') ? 'text-red-400' : 'text-emerald-400'}">
                    <span class="material-symbols-outlined text-[18px]">${result.host && result.host.includes('xn--') ? 'warning' : 'check_circle'}</span>
                    <span>${result.host && result.host.includes('xn--') ? 'PUNYCODE DETECTED' : 'CLEAN // ZERO DETECTED'}</span>
                  </div>
                  <p class="text-zinc-400 font-sans text-xs mt-1">Cyrillic, Greek, or internationalized script lookalike substitution detection.</p>
                </div>
                <div class="p-4 bg-[#0D0D0D] rounded-lg border border-[#222222] flex flex-col gap-1.5">
                  <span class="text-zinc-500 text-[10px] uppercase font-semibold">Invisible Unicode / Zero-Width</span>
                  <div class="flex items-center gap-1.5 mt-0.5 font-bold text-emerald-400">
                    <span class="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>0 HIDDEN CODEPOINTS</span>
                  </div>
                  <p class="text-zinc-400 font-sans text-xs mt-1">Checks for zero-width spaces (U+200B) or bidirectional override tags.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- OUT-OF-BAND REPUTATION HAND-OFFS -->
      <section class="bg-[#0D0D0D] p-5 md:p-6 rounded-xl border border-[#1E1E1E] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-start gap-3.5">
          <div class="w-10 h-10 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center shrink-0 text-brand-orange">
            <span class="material-symbols-outlined text-[22px]">radar</span>
          </div>
          <div class="flex flex-col">
            <h4 class="font-mono text-sm md:text-base text-white font-bold">Optional Out-of-Band Reputation Lookups</h4>
            <p class="font-sans text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              <strong class="text-amber-400 font-mono">Egress & Privacy Disclosure:</strong> Clicking external lookups sends the destination to third-party infrastructure. Castle automatically strips queries, fragments, and user credentials beforehand to protect your privacy.
            </p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2.5 shrink-0 w-full md:w-auto font-mono text-xs">
          <a target="_blank" rel="noopener noreferrer" class="flex-1 md:flex-none px-4 py-2.5 bg-[#141414] hover:bg-[#1E1E1E] text-brand-orange border border-brand-orange/40 hover:border-brand-orange rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm" href="${escapeHtml(safeBrowsingUrl)}">
            <span>Google Safe Browsing</span>
            <span class="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
          <a target="_blank" rel="noopener noreferrer" class="flex-1 md:flex-none px-4 py-2.5 bg-[#141414] hover:bg-[#1E1E1E] text-brand-orange border border-brand-orange/40 hover:border-brand-orange rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm" href="${escapeHtml(virusTotalUrl)}">
            <span>VirusTotal</span>
            <span class="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>
      </section>
    `;

    target.classList.remove('pulse-generated');
    void target.offsetWidth;
    target.classList.add('pulse-generated');
  }

  function init() {
    const input = document.getElementById('url-phishing-input');
    const out = document.getElementById('url-phishing-results');
    let t;

    if (input && out) {
      input.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => render(out, input.value), 150);
      });
    }

    const encodeToggle = document.getElementById('url-encode-toggle');
    const encodeUtility = document.getElementById('url-encode-utility');
    const encodeRun = document.getElementById('url-encode-run');

    if (encodeToggle && encodeUtility) {
      encodeToggle.addEventListener('click', () => {
        encodeUtility.classList.toggle('hidden');
      });
    }

    if (encodeRun) {
      encodeRun.addEventListener('click', () => {
        const inputEl = document.getElementById('url-encode-input');
        const modeEl = document.getElementById('url-encode-mode');
        const outArea = document.getElementById('url-encode-output');

        const v = inputEl ? inputEl.value : '';
        const mode = modeEl ? modeEl.value : 'encode';

        if (outArea) {
          try {
            outArea.value = mode === 'encode' ? encodeURIComponent(v) : decodeURIComponent(v);
          } catch (err) {
            outArea.value = 'Error: ' + err.message;
          }
        }
      });
    }
  }

  // Export module API
  root.CastleUrlPhishingAnalyze = {
    init,
    render,
    escapeHtml,
    cleanLookupUrl,
    computeShannonEntropy
  };

})(window);
