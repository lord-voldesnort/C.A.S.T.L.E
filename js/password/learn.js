/**
 * CASTLE — Cybersecurity and Analysis Toolkit for Learning and Evaluation
 * Password Suite // Educational Curriculum Module (Learn & Lab)
 * 
 * Progressive disclosure architecture:
 * Chapter 01: The Entropy Imperative (Shannon Mathematics & Combinatorics)
 * Chapter 02: Attack Mechanics & Cracking Physics (GPU Rig Speeds & Search Space)
 * Chapter 03: Password Storage & Key Derivation Functions (Argon2id vs bcrypt vs PBKDF2)
 * Chapter 04: Modern Defense Architecture & Knowledge Check Quiz
 */

window.CastlePasswordLearn = (function() {
  'use strict';

  let initialized = false;
  let activeChapterIndex = 0;
  const totalChapters = 4;

  const chaptersMeta = [
    { id: 'ch-entropy', num: '01', title: 'The Entropy Imperative' },
    { id: 'ch-attacks', num: '02', title: 'Attack Mechanics & Cracking Physics' },
    { id: 'ch-storage', num: '03', title: 'Password Storage & KDFs' },
    { id: 'ch-defense', num: '04', title: 'Defense & Knowledge Check' }
  ];

  // Quiz questions state
  const quizState = {
    q1: null,
    q2: null,
    q3: null
  };

  function init() {
    const container = document.getElementById('pw-tab-panel-learn');
    if (!container) return;

    if (!initialized) {
      render(container);
      bindEvents(container);
      initEntropyInteractive();
      initCrackingInteractive();
      initialized = true;
    }
    showChapter(activeChapterIndex);
  }

  function showChapter(index) {
    if (index < 0 || index >= totalChapters) return;
    activeChapterIndex = index;

    // Update pill buttons
    const pills = document.querySelectorAll('.pw-chapter-step-pill');
    pills.forEach((pill, idx) => {
      if (idx === index) {
        pill.classList.add('active');
        pill.classList.remove('text-zinc-500');
      } else {
        pill.classList.remove('active');
      }
    });

    // Update panes
    const panes = document.querySelectorAll('.pw-learn-pane');
    panes.forEach((pane, idx) => {
      const isActive = (idx === index);
      pane.classList.toggle('active', isActive);
      if (isActive) {
        pane.classList.remove('hidden');
        pane.style.display = 'flex';
      } else {
        pane.classList.add('hidden');
        pane.style.display = 'none';
      }
    });

    // Update prev/next buttons
    const prevBtn = document.getElementById('pw-prev-chapter-btn');
    const nextBtn = document.getElementById('pw-next-chapter-btn');
    if (prevBtn) prevBtn.disabled = (index === 0);
    if (nextBtn) {
      if (index === totalChapters - 1) {
        nextBtn.innerHTML = `<span>Generator</span><span class="material-symbols-outlined text-sm">arrow_forward</span>`;
      } else {
        nextBtn.innerHTML = `<span>Next</span><span class="material-symbols-outlined text-sm">arrow_forward</span>`;
      }
    }

    // Scroll workspace to top
    const modal = document.getElementById('password-modal');
    if (modal) {
      const scrollable = modal.querySelector('.overflow-y-auto');
      if (scrollable) scrollable.scrollTop = 0;
    }
  }

  function render(container) {
    container.innerHTML = `
      <!-- =====================================================================
           PROGRESSIVE CHAPTER STEPPER NAVIGATION (STICKY MINIMAL TRACK)
           ===================================================================== -->
      <nav aria-label="Curriculum Stepper" class="curriculum-chapter-stepper mb-4">
        <div class="flex items-center gap-2">
          <button id="pw-prev-chapter-btn" class="chapter-nav-btn" title="Previous chapter">
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            <span class="hidden sm:inline">Prev</span>
          </button>
        </div>

        <div class="chapter-steps-track" role="tablist">
          ${chaptersMeta.map((ch, idx) => `
            <button role="tab" class="chapter-step-pill pw-chapter-step-pill ${idx === 0 ? 'active' : ''}" data-ch-index="${idx}" aria-label="Chapter ${ch.num}: ${ch.title}">
              <span class="text-brand-orange font-bold">${ch.num}</span>
              <span>${ch.title}</span>
            </button>
          `).join('')}
        </div>

        <div class="flex items-center gap-2">
          <button id="pw-next-chapter-btn" class="chapter-nav-btn" title="Next chapter">
            <span class="hidden sm:inline">Next</span>
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </nav>

      <!-- =====================================================================
           CHAPTER 01: THE ENTROPY IMPERATIVE
           ===================================================================== -->
      <article class="learn-chapter-pane pw-learn-pane active w-full" id="pw-pane-0">
        <div class="editorial-read-canvas">
          <header class="editorial-header">
            <div class="editorial-kicker">
              <span class="editorial-kicker-dot"></span>
              <span>CHAPTER 01 // MATHEMATICAL FOUNDATIONS</span>
            </div>
            <h1 class="editorial-title">
              The Entropy Imperative: Shannon Mathematics &amp; Combinatorics
            </h1>
            <p class="editorial-lede">
              Password strength is not an opinion, aesthetic quality, or arbitrary meter. It is a strictly measurable thermodynamic property of information called <strong class="text-white">information entropy</strong>, formulated by Claude Shannon in 1948.
            </p>
          </header>

          <section class="editorial-section">
            <h2 class="editorial-heading">Quantifying Uncertainty in Secret Systems</h2>
            <div class="editorial-prose">
              <p>
                In classical information theory, entropy measures the degree of uncertainty or "surprise" inherent in a secret. When an adversary attempts to guess a password, entropy represents the exact logarithmic size of the brute-force search space they must exhaust.
              </p>
              <p>
                For a password of length <code class="text-brand-orange">L</code> drawn with uniform randomness from a character pool of size <code class="text-brand-orange">R</code>, Shannon entropy <code class="text-brand-orange">E</code> in bits is calculated as:
              </p>
            </div>

            <div class="bg-[#050505] border border-[#1C1C1C] rounded-xl p-5 font-mono text-xs sm:text-sm text-zinc-300 my-2">
              <div class="text-brand-orange font-bold text-lg mb-1 tracking-wider">E = L × log₂(R)</div>
              <div class="text-zinc-400 text-xs mt-1">
                Where <span class="text-white font-semibold">E</span> is entropy in bits, <span class="text-white font-semibold">L</span> is character length, and <span class="text-white font-semibold">R</span> is the unique character set cardinality.
              </div>
            </div>
          </section>

          <!-- Interactive Entropy Laboratory Figure -->
          <figure class="editorial-lab-figure">
            <figcaption class="editorial-lab-caption">
              <div class="flex items-center gap-2 text-brand-orange">
                <span class="material-symbols-outlined text-base">calculate</span>
                <span>Interactive Entropy Laboratory</span>
              </div>
              <span class="text-zinc-500 font-mono text-[11px]">E = L × log₂(R)</span>
            </figcaption>

            <div class="editorial-prose text-xs text-zinc-400">
              <p>Select an alphabet pool (<code class="text-brand-orange">R</code>) and adjust password length (<code class="text-brand-orange">L</code>). Observe how length multiplicatively expands the search space far beyond merely adding arbitrary symbols.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center pt-2">
              <!-- Controls (Left 7 Cols) -->
              <div class="lg:col-span-7 flex flex-col gap-4">
                <!-- Character Pool Selection -->
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-mono uppercase text-zinc-400 font-bold">1. Character Set Pool (R):</label>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button type="button" class="pw-pool-btn p-2.5 rounded-lg border border-brand-orange bg-brand-orange/10 text-white font-mono text-xs flex flex-col items-center gap-1 cursor-pointer transition-all" data-pool="10" data-pool-name="Numeric">
                      <span class="text-brand-orange font-bold">0-9</span>
                      <span class="text-[10px] text-zinc-400">R = 10 chars</span>
                    </button>
                    <button type="button" class="pw-pool-btn p-2.5 rounded-lg border border-[#262626] bg-[#050505] text-zinc-400 font-mono text-xs flex flex-col items-center gap-1 cursor-pointer hover:border-zinc-500 transition-all" data-pool="26" data-pool-name="Lowercase">
                      <span class="font-bold">a-z</span>
                      <span class="text-[10px] text-zinc-400">R = 26 chars</span>
                    </button>
                    <button type="button" class="pw-pool-btn p-2.5 rounded-lg border border-[#262626] bg-[#050505] text-zinc-400 font-mono text-xs flex flex-col items-center gap-1 cursor-pointer hover:border-zinc-500 transition-all" data-pool="62" data-pool-name="Alphanumeric">
                      <span class="font-bold">a-Z + 0-9</span>
                      <span class="text-[10px] text-zinc-400">R = 62 chars</span>
                    </button>
                    <button type="button" class="pw-pool-btn p-2.5 rounded-lg border border-[#262626] bg-[#050505] text-zinc-400 font-mono text-xs flex flex-col items-center gap-1 cursor-pointer hover:border-zinc-500 transition-all" data-pool="94" data-pool-name="Full Printable ASCII">
                      <span class="font-bold">All Symbols</span>
                      <span class="text-[10px] text-zinc-400">R = 94 chars</span>
                    </button>
                  </div>
                </div>

                <!-- Length Slider -->
                <div class="flex flex-col gap-2">
                  <div class="flex justify-between items-center text-xs font-mono">
                    <label for="pw-learn-len-slider" class="text-zinc-400 font-bold uppercase">2. Password Length (L):</label>
                    <span class="text-brand-orange font-bold text-sm"><span id="pw-learn-len-val">16</span> characters</span>
                  </div>
                  <input id="pw-learn-len-slider" type="range" min="6" max="36" value="16" class="w-full" />
                  <div class="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>6 (Insecure)</span>
                    <span>12 (NIST Min)</span>
                    <span>16 (Recommended)</span>
                    <span>36 (Passphrase)</span>
                  </div>
                </div>
              </div>

              <!-- Output Telemetry Card (Right 5 Cols) -->
              <div class="lg:col-span-5 bg-[#050505] border border-brand-orange/40 rounded-xl p-5 flex flex-col gap-4 shadow-inner">
                <div class="flex justify-between items-center border-b border-[#1A1A1A] pb-2">
                  <span class="font-mono text-xs text-zinc-400 uppercase font-bold">CALCULATED METRICS</span>
                  <span id="pw-learn-verdict-badge" class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    EXCELLENT
                  </span>
                </div>

                <div class="flex flex-col gap-1">
                  <span class="font-mono text-xs text-zinc-400">Shannon Information Entropy:</span>
                  <div class="flex items-baseline gap-2">
                    <span id="pw-learn-entropy-bits" class="font-mono text-3xl font-extrabold text-white">53.15</span>
                    <span class="font-mono text-sm text-brand-orange font-semibold">bits of entropy</span>
                  </div>
                </div>

                <div class="flex flex-col gap-1 border-t border-[#181818] pt-2">
                  <span class="font-mono text-xs text-zinc-400">Total Possible Search Space (Rᴸ):</span>
                  <span id="pw-learn-combinations" class="font-mono text-xs text-zinc-200 font-bold break-all">
                    10¹⁶ = 10,000,000,000,000,000 combinations
                  </span>
                </div>

                <div class="flex flex-col gap-1 border-t border-[#181818] pt-2">
                  <span class="font-mono text-[11px] text-zinc-400">Time to exhaust search space at 100B guesses/sec:</span>
                  <span id="pw-learn-exhaust-time" class="font-mono text-xs text-brand-orange font-bold">
                    ~ 1.15 days
                  </span>
                </div>
              </div>
            </div>
          </figure>

          <!-- Section: Mathematical Proof -->
          <section class="editorial-section">
            <h2 class="editorial-heading">Mathematical Proof: Why Length Beats Complexity</h2>
            <div class="editorial-prose">
              <p>
                A common intuition claims that an 8-character password with complex symbols (e.g. <code>Tr0ub&amp;d9</code>) is stronger than a 16-character alphanumeric passphrase (e.g. <code>correcthorsebattery</code>). Combinatorial mathematics proves this intuition completely wrong:
              </p>
            </div>

            <div class="editorial-grid editorial-grid-2">
              <div class="editorial-card-item">
                <div class="font-mono text-xs text-red-400 font-bold uppercase">Case A: 8 Chars (Full ASCII 94)</div>
                <div class="font-mono text-sm text-white font-bold">94⁸ ≈ 6.09 × 10¹⁵ combinations</div>
                <div class="font-mono text-xs text-zinc-400">~52.4 bits of Shannon entropy</div>
                <p class="font-sans text-xs text-zinc-400 mt-1">Exhausted by an 8x RTX 4090 cluster in <strong class="text-red-400">under 60 minutes</strong>.</p>
              </div>
              <div class="editorial-card-item">
                <div class="font-mono text-xs text-emerald-400 font-bold uppercase">Case B: 16 Chars (Lowercase 26)</div>
                <div class="font-mono text-sm text-white font-bold">26¹⁶ ≈ 4.36 × 10²² combinations</div>
                <div class="font-mono text-xs text-zinc-400">~75.2 bits of Shannon entropy</div>
                <p class="font-sans text-xs text-zinc-400 mt-1">Exhausted by an 8x RTX 4090 cluster in <strong class="text-emerald-400">over 13,800 years</strong>.</p>
              </div>
            </div>

            <div class="editorial-callout-info">
              <strong>The Exponent Rule:</strong> Each additional character multiplies the search space by $R$. Doubling length squares the entire search space: $(R^8)^2 = R^{16}$. Length is an exponential defense multiplier, whereas adding character sets is merely linear.
            </div>
          </section>
        </div>
      </article>

      <!-- =====================================================================
           CHAPTER 02: ATTACK MECHANICS & CRACKING PHYSICS
           ===================================================================== -->
      <article class="learn-chapter-pane pw-learn-pane w-full" id="pw-pane-1">
        <div class="editorial-read-canvas">
          <header class="editorial-header">
            <div class="editorial-kicker">
              <span class="editorial-kicker-dot"></span>
              <span>CHAPTER 02 // THREAT MODELING &amp; OFFENSIVE PHYSICS</span>
            </div>
            <h1 class="editorial-title">
              Attack Mechanics: How Passwords Are Broken in Reality
            </h1>
            <p class="editorial-lede">
              Attackers do not sit at a login box typing passwords until an account locks out. Real-world credential attacks occur <strong class="text-white">offline</strong> after extracting hashed database dumps, executing trillions of guesses per second on dedicated hardware clusters.
            </p>
          </header>

          <section class="editorial-section">
            <h2 class="editorial-heading">Offensive Attack Vectors</h2>
            <div class="editorial-prose">
              <p>
                When a database breach occurs, threat actors exfiltrate password hash tables and deploy automated cracking pipelines. Modern offensive strategies utilize three core methodologies:
              </p>
            </div>

            <div class="editorial-grid editorial-grid-3">
              <div class="editorial-card-item">
                <div class="flex items-center gap-2 text-brand-orange font-mono text-xs font-bold uppercase">
                  <span class="material-symbols-outlined text-base">memory</span>
                  <span>1. Pure Brute-Force</span>
                </div>
                <p class="text-xs text-zinc-300 leading-relaxed">
                  Exhaustively enumerating every possible string sequence from <code>a</code> to <code>zzzzzzzz</code>. Feasible against short credentials (≤8 chars) in minutes, but completely defeated by length (≥16 chars).
                </p>
              </div>

              <div class="editorial-card-item">
                <div class="flex items-center gap-2 text-brand-orange font-mono text-xs font-bold uppercase">
                  <span class="material-symbols-outlined text-base">menu_book</span>
                  <span>2. Dictionary &amp; Rules</span>
                </div>
                <p class="text-xs text-zinc-300 leading-relaxed">
                  Utilizing historical breach wordlists (RockYou with 32M+ entries) paired with rule engines like Hashcat (substituting <code>a</code> with <code>@</code>, appending <code>123!</code>).
                </p>
              </div>

              <div class="editorial-card-item">
                <div class="flex items-center gap-2 text-brand-orange font-mono text-xs font-bold uppercase">
                  <span class="material-symbols-outlined text-base">cycle</span>
                  <span>3. Credential Stuffing</span>
                </div>
                <p class="text-xs text-zinc-300 leading-relaxed">
                  Automated replay of breached username/password pairs across hundreds of services. If a user reuses credentials, compromising one service compromises every account.
                </p>
              </div>
            </div>
          </section>

          <section class="editorial-section">
            <h2 class="editorial-heading">Hardware Cracking Physics &amp; Hashcat Benchmarks</h2>
            <div class="editorial-prose">
              <p>
                Password cracking speed is constrained only by silicon parallelism and integer arithmetic throughput. The comparison below illustrates why fast hashing algorithms crumble before offensive hardware rigs:
              </p>
            </div>

            <div class="editorial-grid editorial-grid-3 font-mono text-xs">
              <div class="editorial-card-item">
                <span class="text-zinc-400 font-bold uppercase">Commodity Laptop CPU</span>
                <span class="text-2xl font-bold text-white mt-1">~ 15 Million</span>
                <span class="text-zinc-500 text-[11px]">NTLM / MD5 guesses / sec</span>
                <p class="font-sans text-[11px] text-zinc-400 mt-2">General-purpose x86 cores with branch prediction, unsuited for massive parallel SIMD hashing.</p>
              </div>

              <div class="editorial-card-item border-brand-orange/40 shadow-[0_0_16px_rgba(255,106,0,0.1)]">
                <span class="text-brand-orange font-bold uppercase">Dedicated 8x RTX 4090 Rig</span>
                <span class="text-2xl font-bold text-brand-orange mt-1">~ 1.6 Trillion</span>
                <span class="text-zinc-400 text-[11px]">NTLM / MD5 guesses / sec</span>
                <p class="font-sans text-[11px] text-zinc-400 mt-2">131,000+ CUDA cores executing integer arithmetic in parallel. Can check all 8-char alphanumeric passwords in under 2 hours.</p>
              </div>

              <div class="editorial-card-item">
                <span class="text-zinc-400 font-bold uppercase">Nation-State ASIC Cluster</span>
                <span class="text-2xl font-bold text-cyan-400 mt-1">100+ Trillion</span>
                <span class="text-zinc-500 text-[11px]">NTLM / MD5 guesses / sec</span>
                <p class="font-sans text-[11px] text-zinc-400 mt-2">Custom silicon pipelines hardwired exclusively for SHA/MD5 compression loops with zero instruction overhead.</p>
              </div>
            </div>
          </section>
        </div>
      </article>

      <!-- =====================================================================
           CHAPTER 03: PASSWORD STORAGE & KEY DERIVATION FUNCTIONS
           ===================================================================== -->
      <article class="learn-chapter-pane pw-learn-pane w-full" id="pw-pane-2">
        <div class="editorial-read-canvas">
          <header class="editorial-header">
            <div class="editorial-kicker">
              <span class="editorial-kicker-dot"></span>
              <span>CHAPTER 03 // SERVER-SIDE SECURITY &amp; KDFS</span>
            </div>
            <h1 class="editorial-title">
              Password Storage: Why Raw Hashes Fail &amp; Key Derivation Works
            </h1>
            <p class="editorial-lede">
              The fundamental flaw in historical authentication was storing credentials with fast general-purpose hashes like MD5, SHA-1, or SHA-256. Secure storage mandates <strong class="text-white">intentionally slow, memory-hard Key Derivation Functions (KDFs)</strong>.
            </p>
          </header>

          <section class="editorial-section">
            <div class="editorial-callout-warning">
              <div class="font-mono text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
                CRITICAL LESSON: FAST HASHES PROTECT INTEGRITY, NOT PASSWORDS
              </div>
              <p>
                SHA-256 was designed by the NSA to calculate checksums and verify gigabytes of file data per second. When applied to passwords, that speed becomes an attacker's greatest asset. Password hashing algorithms must force an adversary's hardware to spend heavy RAM and CPU cycles on every single guess.
              </p>
            </div>

            <h2 class="editorial-heading">Key Derivation Function (KDF) Comparison</h2>
            <div class="editorial-prose">
              <p>
                Modern security engineering evaluates hashing functions by their ability to neutralize GPU parallelism through memory hardness and iteration cost:
              </p>
            </div>

            <div class="bg-[#080808] border border-[#1E1E1E] rounded-xl overflow-hidden my-2">
              <div class="p-3.5 border-b border-[#1A1A1A] flex items-center justify-between">
                <span class="font-mono text-xs text-white uppercase font-bold flex items-center gap-2">
                  <span class="material-symbols-outlined text-brand-orange text-base">dns</span>
                  KDF Evaluation Matrix
                </span>
                <span class="font-mono text-[10px] text-zinc-400">NIST SP 800-63B / OWASP</span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left font-mono text-xs">
                  <thead class="bg-[#050505] text-zinc-400 uppercase text-[11px] border-b border-[#1A1A1A]">
                    <tr>
                      <th class="p-3">Algorithm</th>
                      <th class="p-3">Primary Defense</th>
                      <th class="p-3">GPU / ASIC Resistance</th>
                      <th class="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#181818] text-zinc-300">
                    <tr class="bg-[#080808]">
                      <td class="p-3 font-bold text-brand-orange">Argon2id (RFC 9106)</td>
                      <td class="p-3">Memory-Hard (fills MBs of RAM) + CPU work loops.</td>
                      <td class="p-3 text-emerald-400 font-bold">MAXIMUM</td>
                      <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">GOLD STANDARD</span></td>
                    </tr>
                    <tr class="bg-[#050505]">
                      <td class="p-3 font-bold text-white">bcrypt (Blowfish)</td>
                      <td class="p-3">4 KB internal state per instance. Max 72-byte input.</td>
                      <td class="p-3 text-emerald-400">HIGH</td>
                      <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">APPROVED</span></td>
                    </tr>
                    <tr class="bg-[#080808]">
                      <td class="p-3 font-bold text-white">PBKDF2 (RFC 2898)</td>
                      <td class="p-3">HMAC loops (600,000+ iter). Zero memory hardness.</td>
                      <td class="p-3 text-amber-400 font-bold">MODERATE</td>
                      <td class="p-3"><span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">LEGACY ACCEPTABLE</span></td>
                    </tr>
                    <tr class="bg-[#050505]">
                      <td class="p-3 font-bold text-red-400">Raw SHA-256 / MD5</td>
                      <td class="p-3">Zero iteration stretching, zero memory overhead.</td>
                      <td class="p-3 text-red-400 font-bold">NONE</td>
                      <td class="p-3"><span class="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">VULNERABILITY</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </article>

      <!-- =====================================================================
           CHAPTER 04: DEFENSE ARCHITECTURE & KNOWLEDGE CHECK
           ===================================================================== -->
      <article class="learn-chapter-pane pw-learn-pane w-full" id="pw-pane-3">
        <div class="editorial-read-canvas">
          <header class="editorial-header">
            <div class="editorial-kicker">
              <span class="editorial-kicker-dot"></span>
              <span>CHAPTER 04 // PROTOCOL DEFENSE &amp; COMPREHENSION AUDIT</span>
            </div>
            <h1 class="editorial-title">
              Modern Defensive Best Practices &amp; Knowledge Check
            </h1>
            <p class="editorial-lede">
              NIST SP 800-63B guidelines have shifted password strategy away from periodic expiration and arbitrary composition rules, favoring <strong class="text-white">length, passphrases, zero-knowledge managers, and hardware-bound Passkeys (FIDO2)</strong>.
            </p>
          </header>

          <section class="editorial-section">
            <h2 class="editorial-heading">Three Tenets of Modern Defense</h2>
            <div class="editorial-prose">
              <p>
                Applying security in the modern threat landscape requires practical defenses that minimize human error while maximizing computational resistance:
              </p>
            </div>

            <div class="editorial-grid editorial-grid-3">
              <div class="editorial-card-item">
                <span class="text-brand-orange font-mono text-xs font-bold uppercase">1. Length Over Complexity</span>
                <p class="text-xs text-zinc-300 leading-relaxed">
                  Favor 4-word random Diceware passphrases (e.g. <code>battery-staple-cactus-falcon</code>). They deliver 50+ bits of true entropy and resist brute force for millennia.
                </p>
              </div>

              <div class="editorial-card-item">
                <span class="text-brand-orange font-mono text-xs font-bold uppercase">2. Never Reuse Credentials</span>
                <p class="text-xs text-zinc-300 leading-relaxed">
                  Use a zero-knowledge password manager (Bitwarden, 1Password) to generate and store unique 20+ character random strings for every distinct online identity.
                </p>
              </div>

              <div class="editorial-card-item">
                <span class="text-brand-orange font-mono text-xs font-bold uppercase">3. Deploy Passkeys (FIDO2)</span>
                <p class="text-xs text-zinc-300 leading-relaxed">
                  Upgrade to WebAuthn / Passkeys. Because signatures are cryptographically bound to the browser's origin domain, they are inherently immune to credential phishing.
                </p>
              </div>
            </div>
          </section>

          <!-- Interactive Knowledge Check Audit -->
          <section class="editorial-section">
            <div class="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-brand-orange text-lg">quiz</span>
                <h3 class="font-mono text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                  Password Protocol Comprehension Audit
                </h3>
              </div>
              <span class="text-[11px] font-mono text-zinc-400 bg-[#050505] px-2.5 py-1 rounded border border-[#222222]">
                3 CHALLENGES // INSTANT FEEDBACK
              </span>
            </div>

            <!-- Challenge 1 -->
            <div class="knowledge-check-card" data-quiz-id="q1">
              <div class="flex items-center gap-2 text-xs font-mono text-brand-orange font-bold uppercase">
                <span>Challenge 01 // Mathematical Combinatorics</span>
              </div>
              <p class="text-sm text-white font-medium">
                Why does increasing a password from 8 to 16 characters provide vastly superior protection compared to adding special characters to an 8-character password?
              </p>

              <div class="flex flex-col gap-2">
                <button type="button" class="knowledge-option-btn" data-correct="false">
                  <span class="font-mono font-bold text-zinc-400 shrink-0">A.</span>
                  <span>Special characters are easily guessed by dictionary wordlists, whereas lowercase letters cannot be guessed.</span>
                </button>
                <button type="button" class="knowledge-option-btn" data-correct="true">
                  <span class="font-mono font-bold text-zinc-400 shrink-0">B.</span>
                  <span>Length acts as an exponent in the search space ($R^L$), multiplying search complexity exponentially with each added character, whereas adding character sets only expands the base linearly.</span>
                </button>
                <button type="button" class="knowledge-option-btn" data-correct="false">
                  <span class="font-mono font-bold text-zinc-400 shrink-0">C.</span>
                  <span>Hardware GPUs cannot process strings longer than 12 characters due to hardware memory buffer limitations.</span>
                </button>
              </div>

              <div class="knowledge-feedback-banner bg-[#050505] border border-[#222222] text-xs font-mono"></div>
            </div>

            <!-- Challenge 2 -->
            <div class="knowledge-check-card" data-quiz-id="q2">
              <div class="flex items-center gap-2 text-xs font-mono text-brand-orange font-bold uppercase">
                <span>Challenge 02 // Database Storage Architecture</span>
              </div>
              <p class="text-sm text-white font-medium">
                A software developer salts passwords with a unique 128-bit random value, then computes <code class="text-brand-orange">SHA-256(salt + password)</code>. Why is this architecture still considered severely flawed?
              </p>

              <div class="flex flex-col gap-2">
                <button type="button" class="knowledge-option-btn" data-correct="false">
                  <span class="font-mono font-bold text-zinc-400 shrink-0">A.</span>
                  <span>The salt makes the hash reversible through mathematical modular inverse operations.</span>
                </button>
                <button type="button" class="knowledge-option-btn" data-correct="true">
                  <span class="font-mono font-bold text-zinc-400 shrink-0">B.</span>
                  <span>SHA-256 is computationally too fast; modern GPU clusters can still test billions of guesses per second against an individual salted hash because there is zero iteration stretching or memory cost.</span>
                </button>
                <button type="button" class="knowledge-option-btn" data-correct="false">
                  <span class="font-mono font-bold text-zinc-400 shrink-0">C.</span>
                  <span>SHA-256 suffers from practical hash collision vulnerabilities discovered in 2017.</span>
                </button>
              </div>

              <div class="knowledge-feedback-banner bg-[#050505] border border-[#222222] text-xs font-mono"></div>
            </div>

            <!-- Challenge 3 -->
            <div class="knowledge-check-card" data-quiz-id="q3">
              <div class="flex items-center gap-2 text-xs font-mono text-brand-orange font-bold uppercase">
                <span>Challenge 03 // State of the Art KDF Selection</span>
              </div>
              <p class="text-sm text-white font-medium">
                Which Key Derivation Function is recommended by NIST and OWASP for modern password hashing to provide maximum resistance against parallel GPU and custom ASIC attacks?
              </p>

              <div class="flex flex-col gap-2">
                <button type="button" class="knowledge-option-btn" data-correct="false">
                  <span class="font-mono font-bold text-zinc-400 shrink-0">A.</span>
                  <span>MD5 with 100,000 recursive iterations.</span>
                </button>
                <button type="button" class="knowledge-option-btn" data-correct="false">
                  <span class="font-mono font-bold text-zinc-400 shrink-0">B.</span>
                  <span>Standard PBKDF2-HMAC-SHA1 with a 1,000 count loop.</span>
                </button>
                <button type="button" class="knowledge-option-btn" data-correct="true">
                  <span class="font-mono font-bold text-zinc-400 shrink-0">C.</span>
                  <span>Argon2id (RFC 9106), which combines memory-hardness to starve GPU parallel memory with CPU work loops and parallelism parameters.</span>
                </button>
              </div>

              <div class="knowledge-feedback-banner bg-[#050505] border border-[#222222] text-xs font-mono"></div>
            </div>
          </section>

          <!-- Action Handoff Bridges -->
          <section class="action-handoff-bridge mt-2">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex flex-col gap-1">
                <span class="font-mono text-xs text-brand-orange font-bold uppercase tracking-wider flex items-center gap-2">
                  <span class="material-symbols-outlined text-base">forward</span>
                  READY TO PUT THEORY INTO PRACTICE?
                </span>
                <p class="text-xs sm:text-sm text-zinc-300">
                  Generate cryptographically secure credentials or audit the entropy and crack resistance of existing passwords.
                </p>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <button id="pw-handoff-create-btn" type="button" class="px-4 py-2 bg-brand-orange text-black font-mono text-xs font-bold uppercase rounded-lg hover:bg-[#FF7D1A] transition-all cursor-pointer shadow-[0_0_12px_rgba(255,106,0,0.3)]">
                  Launch Generator →
                </button>
                <button id="pw-handoff-analyze-btn" type="button" class="px-4 py-2 bg-[#141414] border border-[#262626] text-white hover:text-brand-orange hover:border-brand-orange font-mono text-xs font-bold uppercase rounded-lg transition-all cursor-pointer">
                  Strength Checker →
                </button>
              </div>
            </div>
          </section>
        </div>
      </article>
    `;
  }

  function bindEvents(container) {
    // Stepper Pills
    const pills = container.querySelectorAll('.pw-chapter-step-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const idx = parseInt(pill.getAttribute('data-ch-index'), 10);
        showChapter(idx);
      });
    });

    // Prev / Next Controls
    const prevBtn = container.querySelector('#pw-prev-chapter-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (activeChapterIndex > 0) {
          showChapter(activeChapterIndex - 1);
        }
      });
    }

    const nextBtn = container.querySelector('#pw-next-chapter-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (activeChapterIndex < totalChapters - 1) {
          showChapter(activeChapterIndex + 1);
        } else {
          // At end of curriculum, handoff to Generator tab
          const tabBtn = document.getElementById('pw-tab-btn-create');
          if (tabBtn) {
            tabBtn.click();
          } else if (window.castlePasswordApp && typeof window.castlePasswordApp.switchTab === 'function') {
            window.castlePasswordApp.switchTab('create');
          }
        }
      });
    }

    // Interactive Quiz Bindings
    const quizCards = container.querySelectorAll('.knowledge-check-card');
    quizCards.forEach(card => {
      const qId = card.getAttribute('data-quiz-id');
      const optionBtns = card.querySelectorAll('.knowledge-option-btn');
      const feedbackBanner = card.querySelector('.knowledge-feedback-banner');

      optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const isCorrect = btn.getAttribute('data-correct') === 'true';
          quizState[qId] = isCorrect;

          // Reset other buttons in this question
          optionBtns.forEach(b => {
            b.classList.remove('selected-correct', 'selected-incorrect');
            b.disabled = true;
          });

          if (isCorrect) {
            btn.classList.add('selected-correct');
            feedbackBanner.className = 'knowledge-feedback-banner show border border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
            feedbackBanner.innerHTML = `
              <div class="flex items-center gap-1.5 font-bold mb-1">
                <span class="material-symbols-outlined text-base">check_circle</span>
                <span>CORRECT VERIFICATION</span>
              </div>
              <p class="text-zinc-300 font-sans">
                ${getQuizExplanation(qId, true)}
              </p>
            `;
          } else {
            btn.classList.add('selected-incorrect');
            // Highlight the correct one
            optionBtns.forEach(b => {
              if (b.getAttribute('data-correct') === 'true') {
                b.classList.add('selected-correct');
              }
            });
            feedbackBanner.className = 'knowledge-feedback-banner show border border-red-500/40 bg-red-500/10 text-red-300';
            feedbackBanner.innerHTML = `
              <div class="flex items-center gap-1.5 font-bold mb-1">
                <span class="material-symbols-outlined text-base">cancel</span>
                <span>INCORRECT ARCHITECTURE</span>
              </div>
              <p class="text-zinc-300 font-sans">
                ${getQuizExplanation(qId, false)}
              </p>
            `;
          }
        });
      });
    });

    // Action Handoff Bridges
    const handoffCreate = container.querySelector('#pw-handoff-create-btn');
    if (handoffCreate) {
      handoffCreate.addEventListener('click', () => {
        const tabBtn = document.getElementById('pw-tab-btn-create');
        if (tabBtn) {
          tabBtn.click();
        } else if (window.castlePasswordApp && typeof window.castlePasswordApp.switchTab === 'function') {
          window.castlePasswordApp.switchTab('create');
        }
      });
    }

    const handoffAnalyze = container.querySelector('#pw-handoff-analyze-btn');
    if (handoffAnalyze) {
      handoffAnalyze.addEventListener('click', () => {
        const tabBtn = document.getElementById('pw-tab-btn-analyze');
        if (tabBtn) {
          tabBtn.click();
        } else if (window.castlePasswordApp && typeof window.castlePasswordApp.switchTab === 'function') {
          window.castlePasswordApp.switchTab('analyze');
        }
      });
    }
  }

  function getQuizExplanation(qId, isCorrect) {
    switch (qId) {
      case 'q1':
        return `Shannon entropy formula E = L × log₂(R) proves that length L multiplies search complexity exponentially (R^L), whereas expanding the character set pool R only affects the base. Doubling length from 8 to 16 characters squares the total combinations, providing millennia of defense against brute force.`;
      case 'q2':
        return `Salts prevent precomputed rainbow tables and ensure identical passwords have distinct hashes. However, raw SHA-256 has zero computational delay. Modern 8x RTX 4090 GPU rigs compute over 1.6 trillion hashes per second, meaning an attacker can still exhaust an 8-character salted hash in hours.`;
      case 'q3':
        return `Argon2id (RFC 9106) won the global Password Hashing Competition. It is explicitly engineered to be memory-hard, filling tens of megabytes of RAM per hash. Because GPU clusters rely on thousands of tiny parallel cores sharing very limited high-speed cache, Argon2id's memory requirement starves and halts parallel GPU acceleration.`;
      default:
        return `Review the chapter concepts to understand modern cryptographic defense standards.`;
    }
  }

  function initEntropyInteractive() {
    let currentPool = 10;
    const poolBtns = document.querySelectorAll('.pw-pool-btn');
    const lenSlider = document.getElementById('pw-learn-len-slider');
    const lenVal = document.getElementById('pw-learn-len-val');
    const entropyBitsEl = document.getElementById('pw-learn-entropy-bits');
    const combinationsEl = document.getElementById('pw-learn-combinations');
    const exhaustTimeEl = document.getElementById('pw-learn-exhaust-time');
    const badgeEl = document.getElementById('pw-learn-verdict-badge');

    function update() {
      const L = parseInt(lenSlider.value, 10);
      if (lenVal) lenVal.textContent = L;

      // E = L * log2(R)
      const entropy = L * Math.log2(currentPool);
      if (entropyBitsEl) entropyBitsEl.textContent = entropy.toFixed(2);

      // Combinations = R^L
      const comb = Math.pow(currentPool, L);
      if (combinationsEl) {
        if (comb > 1e18) {
          combinationsEl.textContent = `${currentPool}^${L} ≈ 10^${(L * Math.log10(currentPool)).toFixed(1)} combinations`;
        } else {
          combinationsEl.textContent = `${currentPool}^${L} = ${comb.toLocaleString()} combinations`;
        }
      }

      // Exhaust time at 100 Billion (10^11) guesses/sec
      const guessesPerSec = 1e11;
      const seconds = comb / guessesPerSec;
      if (exhaustTimeEl) {
        if (seconds < 1) {
          exhaustTimeEl.textContent = `< 1 millisecond (Instant Breach)`;
          exhaustTimeEl.className = 'font-mono text-xs text-red-400 font-bold';
        } else if (seconds < 60) {
          exhaustTimeEl.textContent = `~ ${Math.round(seconds)} seconds`;
          exhaustTimeEl.className = 'font-mono text-xs text-red-400 font-bold';
        } else if (seconds < 3600) {
          exhaustTimeEl.textContent = `~ ${Math.round(seconds / 60)} minutes`;
          exhaustTimeEl.className = 'font-mono text-xs text-amber-400 font-bold';
        } else if (seconds < 86400) {
          exhaustTimeEl.textContent = `~ ${(seconds / 3600).toFixed(1)} hours`;
          exhaustTimeEl.className = 'font-mono text-xs text-amber-400 font-bold';
        } else if (seconds < 86400 * 365) {
          exhaustTimeEl.textContent = `~ ${(seconds / 86400).toFixed(1)} days`;
          exhaustTimeEl.className = 'font-mono text-xs text-amber-400 font-bold';
        } else if (seconds < 86400 * 365 * 1000) {
          exhaustTimeEl.textContent = `~ ${(seconds / (86400 * 365)).toFixed(0)} years`;
          exhaustTimeEl.className = 'font-mono text-xs text-emerald-400 font-bold';
        } else {
          exhaustTimeEl.textContent = `> Millions of years (Mathematically Infeasible)`;
          exhaustTimeEl.className = 'font-mono text-xs text-emerald-400 font-bold';
        }
      }

      if (badgeEl) {
        if (entropy < 35) {
          badgeEl.textContent = 'VERY WEAK';
          badgeEl.className = 'px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-500/10 border border-red-500/30 text-red-400';
        } else if (entropy < 50) {
          badgeEl.textContent = 'MODERATE';
          badgeEl.className = 'px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400';
        } else if (entropy < 70) {
          badgeEl.textContent = 'STRONG';
          badgeEl.className = 'px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400';
        } else {
          badgeEl.textContent = 'MAXIMUM DEFENSE';
          badgeEl.className = 'px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400';
        }
      }
    }

    poolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        poolBtns.forEach(b => {
          b.className = 'pw-pool-btn p-2.5 rounded-lg border border-[#262626] bg-[#050505] text-zinc-400 font-mono text-xs flex flex-col items-center gap-1 cursor-pointer hover:border-zinc-500 transition-all';
        });
        btn.className = 'pw-pool-btn p-2.5 rounded-lg border border-brand-orange bg-brand-orange/10 text-white font-mono text-xs flex flex-col items-center gap-1 cursor-pointer transition-all';
        currentPool = parseInt(btn.getAttribute('data-pool'), 10);
        update();
      });
    });

    if (lenSlider) {
      lenSlider.addEventListener('input', update);
    }

    update();
  }

  function initCrackingInteractive() {
    // Cracking physics simulation helpers
  }

  return {
    init,
    showChapter,
    getChapterIndex: () => activeChapterIndex,
    isInitialized: () => initialized
  };
})();

