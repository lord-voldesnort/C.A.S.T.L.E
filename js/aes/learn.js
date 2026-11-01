/* ============================================================================
 * CASTLE AES STUDIO — LEARN MODULE (STAGE A2)
 * Interactive AES Learning Laboratory:
 *   Chapter 01: Interactive Process Pipeline (4-Stage Reactive Architecture)
 *   Chapter 02: Interactive 16-Byte Block Explorer & 4×4 State Matrix
 *   Chapter 03: Genuine AES-256 Round Simulator (R0–R14) & FIPS 197 S-Box
 * ============================================================================ */
(function(root) {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. OFFICIAL FIPS 197 CRYPTOGRAPHIC CONSTANTS & S-BOX
  // ---------------------------------------------------------------------------
  // Verified NIST FIPS 197 Appendix A S-Box (256 unique substitution bytes)
  const OFFICIAL_SBOX = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
  ];

  // Round Constants Rcon[1..10]
  const RCON = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54];

  // NIST FIPS 197 Appendix C.3 Official AES-256 Known-Answer Test Vector
  const NIST_KAT_PLAINTEXT = [
    0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77,
    0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff
  ];
  const NIST_KAT_KEY = [
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
    0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
    0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f
  ];
  const NIST_KAT_EXPECTED_CIPHERTEXT = '8ea2b7ca516745bfeafc49904b496089';

  // ---------------------------------------------------------------------------
  // NIST FIPS 197 OFFICIAL KEY SPECIFICATIONS (AES-128, AES-192, AES-256)
  // ---------------------------------------------------------------------------
  const AES_VARIANTS = {
    '128': {
      id: '128',
      name: 'AES-128',
      keyBits: 128,
      keyBytes: 16,
      rounds: 10,
      expandedWords: 44,
      expandedBytes: 176,
      roundKeys: 11, // Nr + 1
      blockSizeBits: 128,
      blockSizeBytes: 16,
      barPercent: 50,
      searchSpace: '2¹²⁸ ≈ 3.40 × 10³⁸ combinations',
      desc: 'Lightweight, high-speed AES standard with 10 transformation rounds. Suitable for constrained and low-latency environments while maintaining strong classical security.',
      securityMargin: '128 bits of classical security margin. Under Grover’s quantum search algorithm, effective key strength reduces to 64 bits.',
      comparison: 'Uses 4 fewer rounds and 16 fewer key bytes than AES-256. Expanded key requires 64 fewer bytes of schedule storage (176B vs 240B).'
    },
    '192': {
      id: '192',
      name: 'AES-192',
      keyBits: 192,
      keyBytes: 24,
      rounds: 12,
      expandedWords: 52,
      expandedBytes: 208,
      roundKeys: 13, // Nr + 1
      blockSizeBits: 128,
      blockSizeBytes: 16,
      barPercent: 75,
      searchSpace: '2¹⁹² ≈ 6.28 × 10⁵⁷ combinations',
      desc: 'Intermediate key length operating 12 transformation rounds. Less common in production environments due to lack of distinct hardware optimization advantages over AES-256.',
      securityMargin: '192 bits of classical security margin. Under Grover’s quantum search algorithm, effective key strength reduces to 96 bits.',
      comparison: 'Uses 2 more rounds than AES-128 and 2 fewer than AES-256. Search space is 2⁶⁴ times larger than AES-128.'
    },
    '256': {
      id: '256',
      name: 'AES-256',
      keyBits: 256,
      keyBytes: 32,
      rounds: 14,
      expandedWords: 60,
      expandedBytes: 240,
      roundKeys: 15, // Nr + 1
      blockSizeBits: 128,
      blockSizeBytes: 16,
      barPercent: 100,
      searchSpace: '2²⁵⁶ ≈ 1.16 × 10⁷⁷ combinations',
      desc: 'Top-secret / military-grade standard with 14 rounds. Includes an extra SubWord step during key expansion every 4 words. Default cipher for CASTLE AES Studio.',
      securityMargin: '256 bits of classical security margin. Under Grover’s quantum search algorithm, retains a robust 128-bit post-quantum security margin.',
      comparison: 'Search space is 2¹²⁸ times larger than AES-128. Requires 14 rounds and 240 bytes of expanded key schedule storage.'
    }
  };

  // ---------------------------------------------------------------------------
  // 2. MATHEMATICAL AES CORE TRANSFORMATIONS (FIPS 197 SPECIFICATION)
  // ---------------------------------------------------------------------------
  function xor(a, b) {
    return a.map((v, i) => v ^ b[i]);
  }

  function sub(a) {
    return a.map(v => OFFICIAL_SBOX[v]);
  }

  function shift(a) {
    const o = a.slice();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        o[r + 4 * c] = a[r + 4 * ((c + r) % 4)];
      }
    }
    return o;
  }

  function gm(a, b) {
    let p = 0;
    for (let i = 0; i < 8; i++) {
      if (b & 1) p ^= a;
      const h = a & 128;
      a = (a << 1) & 255;
      if (h) a ^= 27;
      b >>= 1;
    }
    return p;
  }

  function mix(a) {
    const o = a.slice();
    for (let c = 0; c < 4; c++) {
      const i = 4 * c;
      const [x, y, z, w] = a.slice(i, i + 4);
      o[i]     = gm(x, 2) ^ gm(y, 3) ^ z ^ w;
      o[i + 1] = x ^ gm(y, 2) ^ gm(z, 3) ^ w;
      o[i + 2] = x ^ y ^ gm(z, 2) ^ gm(w, 3);
      o[i + 3] = gm(x, 3) ^ y ^ z ^ gm(w, 2);
    }
    return o;
  }

  // Key Expansion: Derives 60 32-bit words (15 round keys × 16 bytes = 240 bytes)
  function expandKey(key) {
    const words = [];
    for (let i = 0; i < 8; i++) {
      words[i] = key.slice(i * 4, i * 4 + 4);
    }
    for (let i = 8; i < 60; i++) {
      let t = words[i - 1].slice();
      if (i % 8 === 0) {
        t = t.slice(1).concat(t[0]).map(v => OFFICIAL_SBOX[v]);
        t[0] ^= RCON[i / 8];
      } else if (i % 8 === 4) {
        t = t.map(v => OFFICIAL_SBOX[v]);
      }
      words[i] = words[i - 8].map((v, j) => v ^ t[j]);
    }
    return Array.from({ length: 15 }, (_, r) => words.slice(r * 4, r * 4 + 4).flat());
  }

  // Full calculation of all 15 rounds with intermediate step matrices
  function calculateTrace(plaintext, key) {
    const roundKeys = expandKey(key);
    const rounds = [];

    // Round 0: Pre-whitening AddRoundKey only
    let state = plaintext.slice();
    const r0_after = xor(state, roundKeys[0]);
    rounds.push({
      round: 0,
      roundKey: roundKeys[0],
      startState: state.slice(),
      steps: [
        {
          name: 'AddRoundKey',
          op: 'add',
          title: 'Initial Key Whitening (Pre-Round)',
          desc: 'XORs the 128-bit input state matrix directly with Round Key 0 derived from the master key schedule.',
          eq: "S'[r,c] = S[r,c] ⊕ K₀[r,c]",
          inState: state.slice(),
          outState: r0_after.slice()
        }
      ],
      endState: r0_after.slice()
    });
    state = r0_after.slice();

    // Rounds 1..13: Full rounds (SubBytes → ShiftRows → MixColumns → AddRoundKey)
    for (let r = 1; r <= 13; r++) {
      const roundStart = state.slice();
      const steps = [];

      // Step 1: SubBytes
      const s_sub = sub(state);
      steps.push({
        name: 'SubBytes',
        op: 'sub',
        title: 'Step 1: SubBytes (Non-Linear S-Box Substitution)',
        desc: 'Each byte is independently replaced with a byte from the Rijndael S-Box lookup table, introducing confusion via GF(2⁸) inversion.',
        eq: "S'[r,c] = S_BOX( S[r,c] )",
        inState: state.slice(),
        outState: s_sub.slice()
      });

      // Step 2: ShiftRows
      const s_shift = shift(s_sub);
      steps.push({
        name: 'ShiftRows',
        op: 'shift',
        title: 'Step 2: ShiftRows (Row Permutation & Diffusion)',
        desc: 'Rows 0, 1, 2, and 3 are cyclically rotated left by 0, 1, 2, and 3 byte offsets, dispersing column interdependencies.',
        eq: 'S\'[r,c] = S[r, (c + r) mod 4]',
        inState: s_sub.slice(),
        outState: s_shift.slice()
      });

      // Step 3: MixColumns
      const s_mix = mix(s_shift);
      steps.push({
        name: 'MixColumns',
        op: 'mix',
        title: 'Step 3: MixColumns (Galois Field Column Mixing)',
        desc: 'Each 4-byte column is transformed using matrix multiplication over GF(2⁸) with an MDS polynomial.',
        eq: 'S\'[*,c] = MDS_Matrix ⊗ S[*,c]',
        inState: s_shift.slice(),
        outState: s_mix.slice()
      });

      // Step 4: AddRoundKey
      const s_add = xor(s_mix, roundKeys[r]);
      steps.push({
        name: 'AddRoundKey',
        op: 'add',
        title: `Step 4: AddRoundKey (Round Key ${r} Injection)`,
        desc: `Bitwise XOR combines the transformed state with 128-bit Round Key ${r} generated by the Rijndael key schedule.`,
        eq: `S'[r,c] = S[r,c] ⊕ K_${r}[r,c]`,
        inState: s_mix.slice(),
        outState: s_add.slice()
      });

      rounds.push({
        round: r,
        roundKey: roundKeys[r],
        startState: roundStart,
        steps,
        endState: s_add.slice()
      });
      state = s_add.slice();
    }

    // Round 14: Terminal round (SubBytes → ShiftRows → AddRoundKey, NO MixColumns)
    {
      const roundStart = state.slice();
      const steps = [];

      // Step 1: SubBytes
      const s_sub = sub(state);
      steps.push({
        name: 'SubBytes',
        op: 'sub',
        title: 'Step 1: SubBytes (Terminal Substitution)',
        desc: 'Final non-linear S-Box substitution applied to all 16 state bytes.',
        eq: "S'[r,c] = S_BOX( S[r,c] )",
        inState: state.slice(),
        outState: s_sub.slice()
      });

      // Step 2: ShiftRows
      const s_shift = shift(s_sub);
      steps.push({
        name: 'ShiftRows',
        op: 'shift',
        title: 'Step 2: ShiftRows (Terminal Row Rotation)',
        desc: 'Rows 0, 1, 2, and 3 are cyclically rotated left by 0, 1, 2, and 3 byte offsets.',
        eq: 'S\'[r,c] = S[r, (c + r) mod 4]',
        inState: s_sub.slice(),
        outState: s_shift.slice()
      });

      // Step 3: AddRoundKey (MixColumns is omitted per FIPS 197 Section 5.1!)
      const s_add = xor(s_shift, roundKeys[14]);
      steps.push({
        name: 'AddRoundKey',
        op: 'add',
        title: 'Step 3: AddRoundKey (Terminal Key Injection // No MixColumns)',
        desc: 'Bitwise XOR with final Round Key 14. MixColumns is omitted in Round 14 per NIST FIPS 197 to enable symmetric cipher reversibility.',
        eq: "S'[r,c] = S[r,c] ⊕ K₁₄[r,c]",
        inState: s_shift.slice(),
        outState: s_add.slice()
      });

      rounds.push({
        round: 14,
        roundKey: roundKeys[14],
        startState: roundStart,
        steps,
        endState: s_add.slice()
      });
      state = s_add.slice();
    }

    return { rounds, roundKeys, finalCiphertext: state };
  }

  // Pre-calculate verified NIST KAT trace
  const NIST_TRACE = calculateTrace(NIST_KAT_PLAINTEXT, NIST_KAT_KEY);

  // ---------------------------------------------------------------------------
  // 3. INTERNAL STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  const PRESETS = {
    castle: {
      id: 'castle',
      name: 'CASTLE (6B)',
      text: 'CASTLE',
      bytes: [0x43, 0x41, 0x53, 0x54, 0x4c, 0x45],
      note: 'Six ASCII bytes. Demonstrates educational zero-filling for the first 16-byte state.'
    },
    exact16: {
      id: 'exact16',
      name: '16-BYTE EXACT',
      text: 'CASTLE_SEC_OPS_1',
      bytes: [0x43, 0x41, 0x53, 0x54, 0x4c, 0x45, 0x5f, 0x53, 0x45, 0x43, 0x5f, 0x4f, 0x50, 0x53, 0x5f, 0x31],
      note: 'Exactly 16 ASCII bytes (128 bits). Perfectly fills one complete AES state block with zero padding.'
    },
    multiblock: {
      id: 'multiblock',
      name: 'MULTI-BLOCK MESSAGE (36B)',
      text: 'CASTLE TACTICAL CRYPTOGRAPHIC LAB 26',
      bytes: Array.from(new TextEncoder().encode('CASTLE TACTICAL CRYPTOGRAPHIC LAB 26')),
      note: '36 UTF-8 bytes spanning 3 AES counter-mode blocks (16B + 16B + 4B) with GCM authentication.'
    }
  };

  const state = {
    activePreset: 'castle',
    inputText: 'CASTLE',
    selectedByteIndex: 0, // 0..15 linear index
    simVectorMode: 'nist', // 'nist' | 'custom'
    activeRound: 0, // 0..14
    activeStep: 0, // 0..3
    activeSboxByte: 0x1D,
    customKey: Array.from({ length: 32 }, (_, i) => i),
    initialized: false,
    activeKeyVariant: '256',
    learnView: 'landing', // 'landing' | 'theory' | 'lab'
    gcmLab: {
      samplePlaintext: 'TACTICAL MISSION BRIEFING: VERIFY INTEGRITY BEFORE LAUNCH',
      aadText: 'hdr:v=1;src=hq;dst=field_unit_4',
      useAad: true,
      activeScenario: 'valid',
      rawKey: null,
      cryptoKey: null,
      iv: null,
      ciphertext: null,
      tag: null,
      lastDecryptResult: null,
      opSeq: 0
    }
  };

  // Convert an array of bytes to a 32-character hex string
  function bytesToHex(arr) {
    return arr.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Convert hex byte string to printable char
  function byteToAscii(b) {
    if (b >= 32 && b <= 126) return String.fromCharCode(b);
    return '·';
  }

  // Get current 16-byte educational block (Block 0)
  function getEducationalBlockBytes() {
    const rawBytes = Array.from(new TextEncoder().encode(state.inputText));
    const block = rawBytes.slice(0, 16);
    while (block.length < 16) {
      block.push(0);
    }
    return {
      rawBytes,
      block,
      padCount: Math.max(0, 16 - rawBytes.length)
    };
  }

  // Get the active round trace (NIST KAT or Custom Block)
  function getActiveTrace() {
    if (state.simVectorMode === 'nist') {
      return NIST_TRACE;
    }
    const { block } = getEducationalBlockBytes();
    return calculateTrace(block, state.customKey);
  }

  // ---------------------------------------------------------------------------
  // 4. MAIN RENDER CONTROLLER
  // ---------------------------------------------------------------------------

  function setLearnView(view) {
    state.learnView = view;
    const landing = document.getElementById('aes-learn-landing-view');
    const theory = document.getElementById('aes-learn-theory-view');
    const lab = document.getElementById('aes-learn-lab-view');
    if (landing) landing.classList.toggle('hidden', view !== 'landing');
    if (theory) {
      theory.classList.toggle('hidden', view !== 'theory');
      if (view === 'theory') {
        // Redraw ECB vs GCM comparison canvases when Theory view is made visible
        requestAnimationFrame(() => drawModeCanvases());
      }
    }
    if (lab) lab.classList.toggle('hidden', view !== 'lab');

    // Scroll workspace body to top
    const modal = document.getElementById('aes-studio-modal');
    if (modal) {
      const scrollable = modal.querySelector('.overflow-y-auto');
      if (scrollable) scrollable.scrollTop = 0;
    }
  }

  function init() {
    if (state.initialized) return;
    state.initialized = true;

    renderLaboratoryShell();
    bindEvents();
    updateChapter01();
    updateChapter02();
    updateChapter03();
    updateChapter04();
    runGcmLabEncrypt();
    setLearnView('landing');
  }

  function reset() {
    // Invalidate any in-flight asynchronous operations
    state.gcmLab.opSeq = (state.gcmLab.opSeq || 0) + 1;
    state.gcmLab.lastDecryptResult = null;

    state.activePreset = 'castle';
    state.inputText = 'CASTLE';
    state.selectedByteIndex = 0;
    state.simVectorMode = 'nist';
    state.activeRound = 0;
    state.activeStep = 0;
    state.activeSboxByte = 0x1D;
    state.activeKeyVariant = '256';

    const inputEl = document.getElementById('aes-round-input');
    if (inputEl) inputEl.value = 'CASTLE';

    const gcmPtInput = document.getElementById('aes-gcm-plaintext-input');
    if (gcmPtInput) gcmPtInput.value = 'TACTICAL MISSION BRIEFING: VERIFY INTEGRITY BEFORE LAUNCH';

    const gcmAadInput = document.getElementById('aes-gcm-aad-input');
    if (gcmAadInput) gcmAadInput.value = 'hdr:v=1;src=hq;dst=field_unit_4';

    const gcmAadToggle = document.getElementById('aes-gcm-use-aad-toggle');
    if (gcmAadToggle) gcmAadToggle.checked = true;

    updateChapter01();
    updateChapter02();
    updateChapter03();
    updateChapter04();
    runGcmLabEncrypt();
    setLearnView('landing');
  }

  function renderLaboratoryShell() {
    const panel = document.getElementById('aes-panel-learn');
    if (!panel) return;

    panel.innerHTML = `

      <!-- ====================================================================
           VIEW 1: LEARN LANDING SCREEN (PRIMARY TWO-CHOICE ENTRYPOINT)
           ==================================================================== -->
      <div id="aes-learn-landing-view" class="flex flex-col gap-6" role="region" aria-label="Learn overview landing screen">
        <div class="editorial-read-canvas">
          <header class="editorial-header">
            <div class="editorial-kicker">
              <span class="editorial-kicker-dot"></span>
              <span>AES STUDIO // CRYPTOGRAPHIC CURRICULUM</span>
            </div>
            <h1 class="editorial-title">
              Advanced Encryption Standard: Theory &amp; Simulator
            </h1>
            <p class="editorial-lede">
              FIPS 197 &amp; SP 800-38D verified. Select your learning trajectory: master foundational symmetric cryptographic theory or explore live block transformations in volatile client RAM.
            </p>
          </header>

          <!-- Primary Two-Choice Selection Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5" role="region" aria-label="Learn Navigation Paths">
            
            <!-- CHOICE 1: WHAT & WHY (CONCEPTUAL LEARNING) -->
            <div id="aes-learn-card-theory" class="group bg-[#080808] hover:bg-[#0D0D0D] border border-[#202020] hover:border-brand-orange/70 rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[0_0_28px_rgba(255,106,0,0.18)] focus-within:ring-2 focus-within:ring-brand-orange/80" tabindex="0" role="button" aria-label="Open What & Why conceptual learning view">
              <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-1 rounded bg-brand-orange/10 border border-brand-orange/30 text-brand-orange font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    PATH 01 // THEORY
                  </span>
                  <div class="size-10 rounded-xl bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(255,106,0,0.2)]">
                    <span class="material-symbols-outlined text-2xl">menu_book</span>
                  </div>
                </div>

                <div>
                  <h3 class="text-white text-lg sm:text-xl font-bold font-heading tracking-tight group-hover:text-brand-orange transition-colors">
                    What &amp; Why: AES Principles
                  </h3>
                  <p class="text-zinc-400 text-xs sm:text-sm font-sans mt-2 leading-relaxed">
                    Comprehensive architectural guide to symmetric cryptography. Understand why encryption is vital, how block ciphers operate on 128-bit blocks, the roles of keys and nonces, Galois/Counter Mode (GCM), and why authentication failure must strictly purge plaintext.
                  </p>
                </div>

                <div class="p-3.5 bg-[#050505] border border-[#1A1A1A] rounded-xl flex flex-col gap-2 font-mono text-xs">
                  <span class="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Topics Covered:</span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-zinc-300 text-[11px]">
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-brand-orange text-sm shrink-0">check_circle</span>
                      <span class="truncate">Symmetric vs Asymmetric</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-brand-orange text-sm shrink-0">check_circle</span>
                      <span class="truncate">AES-128 / 192 / 256</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-brand-orange text-sm shrink-0">check_circle</span>
                      <span class="truncate">128-Bit Block Matrices</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-brand-orange text-sm shrink-0">check_circle</span>
                      <span class="truncate">IV / Nonce Reuse Risks</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-brand-orange text-sm shrink-0">check_circle</span>
                      <span class="truncate">GCM & GHASH Integrity</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-brand-orange text-sm shrink-0">check_circle</span>
                      <span class="truncate">Unauthenticated Plaintext</span>
                    </div>
                  </div>
                </div>
              </div>

              <button id="aes-learn-btn-choose-theory" class="w-full py-3 px-4 rounded-xl bg-brand-orange text-black font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(255,106,0,0.35)] flex items-center justify-center gap-2 group-hover:bg-[#ff7b1a] transition-all cursor-pointer">
                <span>EXPLORE CONCEPTS &amp; THEORY</span>
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            <!-- CHOICE 2: HANDS-ON EXPERIENCE (INTERACTIVE SIMULATOR) -->
            <div id="aes-learn-card-lab" class="group bg-[#080808] hover:bg-[#0D0D0D] border border-[#202020] hover:border-cyan-400/70 rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[0_0_28px_rgba(137,206,255,0.18)] focus-within:ring-2 focus-within:ring-cyan-400/80" tabindex="0" role="button" aria-label="Launch Hands-on Experience interactive simulator">
              <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    PATH 02 // SIMULATOR
                  </span>
                  <div class="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(137,206,255,0.2)]">
                    <span class="material-symbols-outlined text-2xl">science</span>
                  </div>
                </div>

                <div>
                  <h3 class="text-white text-lg sm:text-xl font-bold font-heading tracking-tight group-hover:text-cyan-400 transition-colors">
                    Hands-on Experience: Simulator
                  </h3>
                  <p class="text-zinc-400 text-xs sm:text-sm font-sans mt-2 leading-relaxed">
                    Live cryptographic block simulator. Step through all 14 rounds of AES-256 transformations, inspect the 4×4 state matrix and S-box, compare key-size metrics, and execute genuine WebCrypto GCM tampering attacks.
                  </p>
                </div>

                <div class="p-3.5 bg-[#050505] border border-[#1A1A1A] rounded-xl flex flex-col gap-2 font-mono text-xs">
                  <span class="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Interactive Modules:</span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-zinc-300 text-[11px]">
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-cyan-400 text-sm shrink-0">check_circle</span>
                      <span class="truncate">4-Stage Process Pipeline</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-cyan-400 text-sm shrink-0">check_circle</span>
                      <span class="truncate">16-Byte 4×4 State Matrix</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-cyan-400 text-sm shrink-0">check_circle</span>
                      <span class="truncate">R0–R14 Round Simulator</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-cyan-400 text-sm shrink-0">check_circle</span>
                      <span class="truncate">16×16 FIPS 197 S-Box</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-cyan-400 text-sm shrink-0">check_circle</span>
                      <span class="truncate">Key-Size Comparison</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-cyan-400 text-sm shrink-0">check_circle</span>
                      <span class="truncate">Genuine WebCrypto GCM Lab</span>
                    </div>
                  </div>
                </div>
              </div>

              <button id="aes-learn-btn-choose-lab" class="w-full py-3 px-4 rounded-xl bg-cyan-400 text-black font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(137,206,255,0.35)] flex items-center justify-center gap-2 group-hover:bg-cyan-300 transition-all cursor-pointer">
                <span>LAUNCH INTERACTIVE SIMULATOR</span>
                <span class="material-symbols-outlined text-[18px]">play_arrow</span>
              </button>
            </div>

          </div>

          <!-- Bottom Guidance Strip -->
          <div class="p-3.5 bg-[#060606] border border-[#1A1A1A] rounded-xl flex items-center justify-between text-xs font-mono text-zinc-500">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-base text-zinc-400">info</span>
              <span>All learning modules operate in volatile client RAM. No keys or confidential plaintext ever leave your device.</span>
            </div>
            <span class="hidden sm:inline text-zinc-500">// CASTLE TACTICAL ED-OPS</span>
          </div>
        </div>
      </div>


      <!-- ====================================================================
           VIEW 2: WHAT & WHY // CONCEPTUAL LEARNING VIEW
           ==================================================================== -->
      <div id="aes-learn-theory-view" class="hidden flex flex-col gap-6" role="region" aria-label="What and Why conceptual learning view">
        
        <!-- Sub-Navigation Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#0A0A0A] border border-[#222222] rounded-xl text-xs font-mono shadow-sm">
          <div class="flex items-center gap-2">
            <button id="aes-learn-theory-back" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141414] hover:bg-[#1E1E1E] text-zinc-300 hover:text-white border border-[#2E2E2E] text-xs font-bold transition-all cursor-pointer shadow-sm">
              <span class="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>RETURN TO LEARN OVERVIEW</span>
            </button>
            <span class="text-zinc-500 hidden md:inline">|</span>
            <span class="text-zinc-400 hidden md:inline text-[11px]">PATH 01 // WHAT & WHY: CONCEPTS & PRINCIPLES</span>
          </div>
          <button id="aes-learn-theory-to-lab" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium transition-all cursor-pointer">
            <span>SWITCH TO HANDS-ON LAB</span>
            <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>

        <div class="editorial-read-canvas">
          <header class="editorial-header">
            <div class="editorial-kicker">
              <span class="editorial-kicker-dot"></span>
              <span>PATH 01 // WHAT &amp; WHY: CONCEPTS &amp; PRINCIPLES</span>
            </div>
            <h1 class="editorial-title">
              Symmetric Cryptography &amp; AES Architecture
            </h1>
            <p class="editorial-lede">
              An architectural and mathematical breakdown of the Advanced Encryption Standard (FIPS 197), Galois/Counter Mode (SP 800-38D), and the algebraic operations that protect data confidentiality and integrity.
            </p>
          </header>

        <!-- TOPIC 01: What AES Is & Why Encryption is Needed -->
        <section class="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-5 sm:p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 rounded bg-brand-orange text-black font-mono text-xs font-bold flex items-center justify-center">01</span>
              <h3 class="text-white font-mono text-sm sm:text-base font-bold uppercase tracking-wider">What AES Is & Why Encryption Is Essential</h3>
            </div>
            <span class="px-2 py-0.5 rounded bg-[#141414] border border-[#262626] text-zinc-400 text-[10px] font-mono">FIPS PUB 197</span>
          </div>
          <div class="text-xs text-zinc-300 leading-relaxed flex flex-col gap-3 font-sans">
            <p>
              The <strong class="text-white font-semibold">Advanced Encryption Standard (AES)</strong> is the global specification for symmetric-key block encryption, established by the National Institute of Standards and Technology (NIST) in 2001. Originating from the Rijndael cipher developed by Belgian cryptographers Joan Daemen and Vincent Rijmen, AES was chosen after a rigorous 5-year public competition to replace the aging Data Encryption Standard (DES).
            </p>
            <p>
              <strong class="text-white font-semibold">Why is encryption necessary?</strong> Without encryption, digital data—passwords, intelligence reports, identity records, and financial transactions—travels and rests as human-readable plaintext. Any adversary with physical or network access (unsecured Wi-Fi, ISP taps, rogue routers, stolen hardware) can freely inspect or extract it. Encryption mathematically transforms plaintext into cryptographically pseudorandom ciphertext using a secret key, ensuring that only holders of the correct key can recover the original data.
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] font-mono">
            <div class="p-3 bg-[#050505] border border-[#1A1A1A] rounded-lg flex flex-col gap-1">
              <span class="text-brand-orange font-bold uppercase">CONFIDENTIALITY</span>
              <span class="text-zinc-400">Renders data completely unintelligible to unauthorized third parties and eavesdroppers.</span>
            </div>
            <div class="p-3 bg-[#050505] border border-[#1A1A1A] rounded-lg flex flex-col gap-1">
              <span class="text-brand-orange font-bold uppercase">DATA AT REST</span>
              <span class="text-zinc-400">Protects databases, hard drives, and cloud backups if storage media is physically stolen.</span>
            </div>
            <div class="p-3 bg-[#050505] border border-[#1A1A1A] rounded-lg flex flex-col gap-1">
              <span class="text-brand-orange font-bold uppercase">DATA IN TRANSIT</span>
              <span class="text-zinc-400">Prevents packet interception, wireless snooping, and man-in-the-middle inspection over networks.</span>
            </div>
          </div>
        </section>

        <!-- TOPIC 02: Symmetric vs Asymmetric Cryptography -->
        <section class="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-5 sm:p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 rounded bg-brand-orange text-black font-mono text-xs font-bold flex items-center justify-center">02</span>
              <h3 class="text-white font-mono text-sm sm:text-base font-bold uppercase tracking-wider">Symmetric vs. Asymmetric Encryption</h3>
            </div>
            <span class="px-2 py-0.5 rounded bg-[#141414] border border-[#262626] text-zinc-400 text-[10px] font-mono">PARADIGM COMPARISON</span>
          </div>
          <p class="text-xs text-zinc-300 leading-relaxed font-sans">
            Modern security architectures use two distinct mathematical paradigms in tandem. Symmetric encryption provides high-speed bulk data transformation, while asymmetric cryptography solves the initial key distribution problem.
          </p>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr class="border-b border-[#262626] text-zinc-400 text-[11px]">
                  <th class="py-2 px-3">PROPERTY</th>
                  <th class="py-2 px-3 text-brand-orange">SYMMETRIC (AES)</th>
                  <th class="py-2 px-3 text-cyan-400">ASYMMETRIC (RSA / ECC)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1A1A1A] text-zinc-300 text-[11px]">
                <tr>
                  <td class="py-2.5 px-3 font-semibold text-white">Key Architecture</td>
                  <td class="py-2.5 px-3">Single shared secret key for both encryption and decryption.</td>
                  <td class="py-2.5 px-3">Mathematically linked key pair: Public key (encrypt) + Private key (decrypt).</td>
                </tr>
                <tr>
                  <td class="py-2.5 px-3 font-semibold text-white">Execution Speed</td>
                  <td class="py-2.5 px-3 text-emerald-400">Extremely fast (>5 GB/s with hardware AES-NI instructions).</td>
                  <td class="py-2.5 px-3 text-amber-400">Slow (100× to 1000× slower due to large modular arithmetic).</td>
                </tr>
                <tr>
                  <td class="py-2.5 px-3 font-semibold text-white">Primary Use Case</td>
                  <td class="py-2.5 px-3">Bulk file, database, volume, and application data stream encryption.</td>
                  <td class="py-2.5 px-3">Ephemeral key exchange (ECDH), digital identity signatures, certificates.</td>
                </tr>
                <tr>
                  <td class="py-2.5 px-3 font-semibold text-white">Key Distribution</td>
                  <td class="py-2.5 px-3">Challenging: Both parties must exchange the shared secret securely.</td>
                  <td class="py-2.5 px-3">Simple: Public keys can be freely published across open networks.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="p-3 bg-[#050505] border border-cyan-500/20 rounded-lg text-xs font-mono text-zinc-400 flex items-center gap-2">
            <span class="material-symbols-outlined text-cyan-400 text-base shrink-0">hub</span>
            <span><strong class="text-zinc-200">Hybrid Protocol Design:</strong> Real-world protocols (TLS 1.3, Signal) use asymmetric ECDH to negotiate an ephemeral 256-bit secret, which is then passed to AES-256-GCM for all bulk data transmission.</span>
          </div>
        </section>

        <!-- TOPIC 03: Understanding Key Lengths: AES-128, 192, and 256 -->
        <section class="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-5 sm:p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 rounded bg-brand-orange text-black font-mono text-xs font-bold flex items-center justify-center">03</span>
              <h3 class="text-white font-mono text-sm sm:text-base font-bold uppercase tracking-wider">Key Lengths: AES-128, AES-192, & AES-256</h3>
            </div>
            <span class="px-2 py-0.5 rounded bg-[#141414] border border-[#262626] text-zinc-400 text-[10px] font-mono">SPECIFICATION & QUANTUM</span>
          </div>
          <p class="text-xs text-zinc-300 leading-relaxed font-sans">
            NIST FIPS 197 standardizes three key lengths. Each length increases the mathematical search space exponentially and requires additional transformation rounds to guarantee algebraic security margins.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            <div class="p-3.5 bg-[#050505] border border-[#222222] rounded-xl flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <span class="text-zinc-300 font-bold">AES-128</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">10 ROUNDS</span>
              </div>
              <div class="text-[11px] text-zinc-400 flex flex-col gap-1">
                <div>Key Size: <strong class="text-zinc-200">128 bits (16 bytes)</strong></div>
                <div>Expanded Schedule: <strong class="text-zinc-200">176 bytes (44 words)</strong></div>
                <div>Search Space: <strong class="text-zinc-200">2¹²⁸ ≈ 3.4 × 10³⁸</strong></div>
                <div>Quantum Margin (Grover): <strong class="text-amber-400">64-bit effective</strong></div>
              </div>
              <p class="text-[11px] text-zinc-500 pt-1 border-t border-[#181818]">High-speed standard. Resistant to classical brute force; reduced margin against quantum Grover search.</p>
            </div>
            <div class="p-3.5 bg-[#050505] border border-[#222222] rounded-xl flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <span class="text-zinc-300 font-bold">AES-192</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">12 ROUNDS</span>
              </div>
              <div class="text-[11px] text-zinc-400 flex flex-col gap-1">
                <div>Key Size: <strong class="text-zinc-200">192 bits (24 bytes)</strong></div>
                <div>Expanded Schedule: <strong class="text-zinc-200">208 bytes (52 words)</strong></div>
                <div>Search Space: <strong class="text-zinc-200">2¹⁹² ≈ 6.3 × 10⁵⁷</strong></div>
                <div>Quantum Margin (Grover): <strong class="text-cyan-400">96-bit effective</strong></div>
              </div>
              <p class="text-[11px] text-zinc-500 pt-1 border-t border-[#181818]">Intermediate key length. Less common in production due to lack of distinct hardware optimization over AES-256.</p>
            </div>
            <div class="p-3.5 bg-[#050505] border border-brand-orange/40 rounded-xl flex flex-col gap-2 shadow-[0_0_15px_rgba(255,106,0,0.1)]">
              <div class="flex justify-between items-center">
                <span class="text-brand-orange font-bold">AES-256 (CASTLE DEFAULT)</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-orange/20 text-brand-orange font-bold">14 ROUNDS</span>
              </div>
              <div class="text-[11px] text-zinc-400 flex flex-col gap-1">
                <div>Key Size: <strong class="text-zinc-200">256 bits (32 bytes)</strong></div>
                <div>Expanded Schedule: <strong class="text-zinc-200">240 bytes (60 words)</strong></div>
                <div>Search Space: <strong class="text-zinc-200">2²⁵⁶ ≈ 1.16 × 10⁷⁷</strong></div>
                <div>Quantum Margin (Grover): <strong class="text-emerald-400">128-bit robust</strong></div>
              </div>
              <p class="text-[11px] text-zinc-400 pt-1 border-t border-[#181818]">Top-Secret / military grade. Retains an impregnable 128-bit security margin even under hypothetical quantum computers.</p>
            </div>
          </div>
        </section>

        <!-- TOPIC 04: Block Ciphers & 128-Bit Processing -->
        <section class="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-5 sm:p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 rounded bg-brand-orange text-black font-mono text-xs font-bold flex items-center justify-center">04</span>
              <h3 class="text-white font-mono text-sm sm:text-base font-bold uppercase tracking-wider">Block Ciphers & 128-Bit State Matrices</h3>
            </div>
            <span class="px-2 py-0.5 rounded bg-[#141414] border border-[#262626] text-zinc-400 text-[10px] font-mono">INTERNAL STRUCTURE</span>
          </div>
          <div class="text-xs text-zinc-300 leading-relaxed font-sans flex flex-col gap-3">
            <p>
              A <strong class="text-white font-semibold">block cipher</strong> is a deterministic algorithm that operates on fixed-length groups of bits called blocks. Regardless of whether AES uses a 128, 192, or 256-bit key, <strong class="text-brand-orange font-mono">the block size of AES is ALWAYS exactly 128 bits (16 bytes)</strong>. A common misconception is assuming that AES-256 uses 256-bit blocks—it does not.
            </p>
            <p>
              Internally, AES arranges the 16 bytes of each block into a <strong class="text-white font-semibold">4×4 column-major state matrix</strong>. Byte 0 fills row 0 column 0; byte 1 fills row 1 column 0; byte 4 starts column 1.
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1 text-[11px] font-mono">
            <div class="p-3 bg-[#050505] border border-[#1A1A1A] rounded-lg flex flex-col gap-1">
              <span class="text-cyan-400 font-bold uppercase">1. SubBytes</span>
              <span class="text-zinc-400">Nonlinear S-box substitution providing mathematical <strong>confusion</strong> across GF(2⁸).</span>
            </div>
            <div class="p-3 bg-[#050505] border border-[#1A1A1A] rounded-lg flex flex-col gap-1">
              <span class="text-cyan-400 font-bold uppercase">2. ShiftRows</span>
              <span class="text-zinc-400">Cyclic left rotation of rows (0, 1, 2, 3 bytes) diffusing byte dependencies horizontally.</span>
            </div>
            <div class="p-3 bg-[#050505] border border-[#1A1A1A] rounded-lg flex flex-col gap-1">
              <span class="text-cyan-400 font-bold uppercase">3. MixColumns</span>
              <span class="text-zinc-400">Galois matrix multiplication mixing bytes vertically down each column. (Omitted in final round).</span>
            </div>
            <div class="p-3 bg-[#050505] border border-[#1A1A1A] rounded-lg flex flex-col gap-1">
              <span class="text-cyan-400 font-bold uppercase">4. AddRoundKey</span>
              <span class="text-zinc-400">Bitwise XOR with derived 128-bit round key, injecting master key entropy into the state.</span>
            </div>
          </div>
        </section>

        <!-- TOPIC 05: The Secret Key & Key Expansion Schedule -->
        <section class="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-5 sm:p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 rounded bg-brand-orange text-black font-mono text-xs font-bold flex items-center justify-center">05</span>
              <h3 class="text-white font-mono text-sm sm:text-base font-bold uppercase tracking-wider">The Secret Key & Key Expansion Schedule</h3>
            </div>
            <span class="px-2 py-0.5 rounded bg-[#141414] border border-[#262626] text-zinc-400 text-[10px] font-mono">KEY DERIVATION</span>
          </div>
          <div class="text-xs text-zinc-300 leading-relaxed font-sans flex flex-col gap-3">
            <p>
              In accordance with <strong class="text-white font-semibold">Kerckhoffs's Principle</strong>, the security of AES does not rely on keeping the algorithm secret; the mathematics are completely public. Security relies entirely on keeping the secret key unknown to unauthorized parties.
            </p>
            <p>
              To resist algebraic cryptanalysis, AES never applies the raw master key repeatedly. Instead, the <strong class="text-white font-semibold">Key Expansion Schedule</strong> expands the master key into <strong class="text-brand-orange font-mono">Nᵣ + 1 discrete round keys</strong> (15 round keys / 240 bytes for AES-256). Every round injects a unique key generated using 32-bit word rotations (<code class="text-zinc-200">RotWord</code>), nonlinear S-box lookups (<code class="text-zinc-200">SubWord</code>), and round constant XOR additions (<code class="text-zinc-200">Rcon</code>).
            </p>
          </div>
        </section>

        <!-- TOPIC 06: Initialization Vectors (IV) & Nonces -->
        <section class="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-5 sm:p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 rounded bg-brand-orange text-black font-mono text-xs font-bold flex items-center justify-center">06</span>
              <h3 class="text-white font-mono text-sm sm:text-base font-bold uppercase tracking-wider">Initialization Vectors (IV) & Nonces: Uniqueness Rule</h3>
            </div>
            <span class="px-2 py-0.5 rounded bg-[#141414] border border-[#262626] text-zinc-400 text-[10px] font-mono">NIST SP 800-38D</span>
          </div>
          <div class="text-xs text-zinc-300 leading-relaxed font-sans flex flex-col gap-3">
            <p>
              An <strong class="text-white font-semibold">Initialization Vector (IV)</strong> or <strong class="text-white font-semibold">Nonce ("Number used ONCE")</strong> is a 96-bit (12-byte) parameter required by AES-GCM. Because AES-GCM operates in Counter mode, encrypting the same message twice with the same key and the same nonce would produce identical ciphertext, completely leaking traffic patterns.
            </p>
          </div>
          <div class="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-mono flex flex-col gap-2">
            <div class="flex items-center gap-2 text-red-400 font-bold uppercase">
              <span class="material-symbols-outlined text-base">warning</span>
              <span>The Catastrophic Nonce-Reuse Attack in GCM</span>
            </div>
            <p class="text-zinc-300 font-sans text-xs leading-relaxed">
              If an attacker observes two distinct ciphertexts <code class="text-zinc-200">C₁</code> and <code class="text-zinc-200">C₂</code> encrypted under the same <code class="text-zinc-200">(Key, Nonce)</code> pair, the keystream cancels out completely:
            </p>
            <div class="p-2 bg-[#000] border border-[#222] rounded text-brand-orange font-bold text-center">
              C₁ ⊕ C₂ = (P₁ ⊕ Keystream) ⊕ (P₂ ⊕ Keystream) = P₁ ⊕ P₂
            </div>
            <p class="text-zinc-400 text-[11px] font-sans">
              The attacker recovers the XOR sum of the plaintexts and can mathematically solve for the universal hash subkey <code class="text-zinc-200">H</code>, allowing them to forge valid authentication tags for arbitrary forged messages.
            </p>
          </div>
          <div class="p-3 bg-[#050505] border border-[#1E1E1E] rounded-lg text-xs font-mono text-zinc-400">
            <strong class="text-emerald-400">CASTLE Implementation:</strong> Every encryption call invokes <code class="text-zinc-200">crypto.getRandomValues(new Uint8Array(12))</code> to generate a cryptographically fresh, unpredictable 96-bit random IV. The IV is not a secret; it is transmitted openly in the container envelope.
          </div>
        </section>

        <!-- TOPIC 07: AES-GCM: Confidentiality Plus Authenticity -->
        <section class="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-5 sm:p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 rounded bg-brand-orange text-black font-mono text-xs font-bold flex items-center justify-center">07</span>
              <h3 class="text-white font-mono text-sm sm:text-base font-bold uppercase tracking-wider">AES-GCM: Confidentiality Plus Authenticity (AEAD)</h3>
            </div>
            <span class="px-2 py-0.5 rounded bg-[#141414] border border-[#262626] text-zinc-400 text-[10px] font-mono">AUTHENTICATED ENCRYPTION</span>
          </div>
          <div class="text-xs text-zinc-300 leading-relaxed font-sans flex flex-col gap-3">
            <p>
              Traditional unauthenticated encryption hides message contents, but leaves them vulnerable to <strong class="text-white font-semibold">malleability attacks</strong>. An attacker without the key can flip bits in the ciphertext stream; when the recipient decrypts it, the corresponding plaintext bits flip predictably without any warning.
            </p>
            <p>
              <strong class="text-white font-semibold">Galois/Counter Mode (GCM)</strong> solves this by computing a 128-bit authentication tag <code class="text-brand-orange font-mono">T</code> using universal polynomial hashing over the Galois Field <strong class="text-zinc-200 font-mono">GF(2¹²⁸)</strong> (GHASH).
            </p>
          </div>

          <!-- VISUAL DEMONSTRATION: ECB PATTERN LEAK VS GCM NOISE -->
          <div class="p-4 bg-[#050505] border border-[#1E1E1E] rounded-xl flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs font-bold text-white uppercase tracking-wider">Visual Pattern Leak Demonstration (Why Mode Choice Matters)</span>
              <span class="text-[10px] font-mono text-zinc-400">ECB vs GCM</span>
            </div>
            <p class="text-xs text-zinc-400 leading-relaxed font-sans">
              In Electronic Codebook (ECB) mode, identical 16-byte plaintext blocks produce identical ciphertext blocks, visibly leaking image silhouettes and structural outlines. In AES-GCM, counter-mode keystream masking produces high-entropy pseudorandom noise with zero structural leakage.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              <div class="flex flex-col gap-2 p-3 bg-black border border-red-500/20 rounded-lg">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-[11px] font-bold text-red-400">AES-ECB (INSECURE)</span>
                  <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">PATTERN LEAK</span>
                </div>
                <div class="flex justify-center bg-black p-2 rounded border border-[#1F1F1F]">
                  <canvas id="aes-ecb-canvas" class="border border-[#222] rounded bg-black max-w-full" width="160" height="90"></canvas>
                </div>
                <p class="text-[11px] text-zinc-400 font-sans leading-tight">Identical input blocks map to identical output blocks, preserving recognizable visual patterns.</p>
              </div>

              <div class="flex flex-col gap-2 p-3 bg-black border border-emerald-500/20 rounded-lg">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-[11px] font-bold text-emerald-400">AES-GCM (AUTHENTICATED)</span>
                  <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">HIGH-ENTROPY NOISE</span>
                </div>
                <div class="flex justify-center bg-black p-2 rounded border border-[#1F1F1F]">
                  <canvas id="aes-gcm-canvas" class="border border-[#222] rounded bg-black max-w-full" width="160" height="90"></canvas>
                </div>
                <p class="text-[11px] text-zinc-400 font-sans leading-tight">Counter stream encryption ensures every block is uniquely masked with high-entropy noise plus GHASH integrity.</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            <div class="p-3 bg-[#050505] border border-[#1E1E1E] rounded-xl flex flex-col gap-1.5">
              <span class="text-brand-orange font-bold uppercase">1. COUNTER-MODE STREAM CIPHER</span>
              <p class="text-zinc-400 font-sans text-xs">AES encrypts successive counter blocks <code class="text-zinc-200">IV || Counter</code> to create a pseudorandom keystream, XORed with plaintext to form ciphertext.</p>
            </div>
            <div class="p-3 bg-[#050505] border border-[#1E1E1E] rounded-xl flex flex-col gap-1.5">
              <span class="text-emerald-400 font-bold uppercase">2. GHASH AUTHENTICATION SEAL</span>
              <p class="text-zinc-400 font-sans text-xs">Computes a 16-byte cryptographic tag over the ciphertext and optional Additional Authenticated Data (AAD). If any byte is altered, verification fails.</p>
            </div>
          </div>
        </section>

        <!-- TOPIC 08: Why Auth Failures Must Strictly Purge Plaintext -->
        <section class="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-5 sm:p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 rounded bg-brand-orange text-black font-mono text-xs font-bold flex items-center justify-center">08</span>
              <h3 class="text-white font-mono text-sm sm:text-base font-bold uppercase tracking-wider">Why Authentication Failures Must Strictly Purge Plaintext</h3>
            </div>
            <span class="px-2 py-0.5 rounded bg-[#141414] border border-[#262626] text-zinc-400 text-[10px] font-mono">FAIL-STOP SECURITY</span>
          </div>
          <div class="text-xs text-zinc-300 leading-relaxed font-sans flex flex-col gap-3">
            <p>
              In cryptographic engineering, releasing unauthenticated plaintext (the <strong class="text-white font-semibold">RUP vulnerability</strong>) is considered a critical security failure. If an application decrypts a tampered payload and displays or processes the unauthenticated plaintext before verifying the authentication tag, an attacker can use the application as a decryption oracle (e.g., chosen-ciphertext attacks, padding oracle leaks, side-channel feedback).
            </p>
            <p>
              The <strong class="text-white font-semibold">Fail-Stop Security Principle</strong> mandates: If the 128-bit authentication tag does not verify with 100% mathematical precision, the cryptographic engine must instantly discard all decrypted data, wipe temporary buffers in volatile memory, and report a generic authentication error.
            </p>
          </div>
          <div class="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-mono text-red-300 flex items-center gap-2">
            <span class="material-symbols-outlined text-red-400 text-base shrink-0">shield</span>
            <span><strong>CASTLE Security Guarantee:</strong> In the GCM Tampering Lab and production decryptor, any corrupted bit in ciphertext, tag, or AAD causes WebCrypto to throw <code class="text-white">OperationError</code>, immediately redacting all displayed text.</span>
          </div>
        </section>

        <!-- TOPIC 09: Real-World Systems & Deployments -->
        <section class="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-5 sm:p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 rounded bg-brand-orange text-black font-mono text-xs font-bold flex items-center justify-center">09</span>
              <h3 class="text-white font-mono text-sm sm:text-base font-bold uppercase tracking-wider">Where AES Is Used in Real-World Systems</h3>
            </div>
            <span class="px-2 py-0.5 rounded bg-[#141414] border border-[#262626] text-zinc-400 text-[10px] font-mono">INDUSTRY DEPLOYMENT</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
            <div class="p-3.5 bg-[#050505] border border-[#1E1E1E] rounded-xl flex flex-col gap-1.5">
              <div class="flex items-center gap-2 text-white font-bold">
                <span class="material-symbols-outlined text-brand-orange text-base">lock</span>
                <span>TLS 1.3 / HTTPS</span>
              </div>
              <p class="text-zinc-400 font-sans text-[11px]">Encrypts over 95% of worldwide web browser traffic using AES-256-GCM and AES-128-GCM ciphersuites.</p>
            </div>
            <div class="p-3.5 bg-[#050505] border border-[#1E1E1E] rounded-xl flex flex-col gap-1.5">
              <div class="flex items-center gap-2 text-white font-bold">
                <span class="material-symbols-outlined text-brand-orange text-base">terminal</span>
                <span>OpenSSH</span>
              </div>
              <p class="text-zinc-400 font-sans text-[11px]">Standard remote terminal protocol protecting system administration sessions via <code class="text-zinc-200">aes256-gcm@openssh.com</code>.</p>
            </div>
            <div class="p-3.5 bg-[#050505] border border-[#1E1E1E] rounded-xl flex flex-col gap-1.5">
              <div class="flex items-center gap-2 text-white font-bold">
                <span class="material-symbols-outlined text-brand-orange text-base">hard_drive</span>
                <span>Full-Disk Encryption</span>
              </div>
              <p class="text-zinc-400 font-sans text-[11px]">BitLocker (Windows), FileVault (macOS), and LUKS (Linux) use AES in XTS mode to encrypt entire drives.</p>
            </div>
            <div class="p-3.5 bg-[#050505] border border-[#1E1E1E] rounded-xl flex flex-col gap-1.5">
              <div class="flex items-center gap-2 text-white font-bold">
                <span class="material-symbols-outlined text-brand-orange text-base">chat</span>
                <span>Signal / Messaging</span>
              </div>
              <p class="text-zinc-400 font-sans text-[11px]">End-to-end encrypted messaging applications protect millions of private messages with symmetric AES ratchets.</p>
            </div>
            <div class="p-3.5 bg-[#050505] border border-[#1E1E1E] rounded-xl flex flex-col gap-1.5">
              <div class="flex items-center gap-2 text-white font-bold">
                <span class="material-symbols-outlined text-brand-orange text-base">memory</span>
                <span>Hardware AES-NI</span>
              </div>
              <p class="text-zinc-400 font-sans text-[11px]">Modern Intel, AMD, and ARM processors include dedicated silicon instructions executing AES rounds in hardware cycles.</p>
            </div>
            <div class="p-3.5 bg-[#050505] border border-[#1E1E1E] rounded-xl flex flex-col gap-1.5">
              <div class="flex items-center gap-2 text-white font-bold">
                <span class="material-symbols-outlined text-brand-orange text-base">security</span>
                <span>CASTLE Toolkit</span>
              </div>
              <p class="text-zinc-400 font-sans text-[11px]">Our browser toolkit leverages the native browser WebCrypto API for authenticated AES-256-GCM in volatile RAM.</p>
            </div>
          </div>
        </section>

        <!-- TOPIC 10: Limitations & Common Misconceptions -->
        <section class="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-5 sm:p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 rounded bg-brand-orange text-black font-mono text-xs font-bold flex items-center justify-center">10</span>
              <h3 class="text-white font-mono text-sm sm:text-base font-bold uppercase tracking-wider">Limitations & Common Cryptographic Misconceptions</h3>
            </div>
            <span class="px-2 py-0.5 rounded bg-[#141414] border border-[#262626] text-zinc-400 text-[10px] font-mono">MYTHS VS REALITY</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div class="p-3.5 bg-[#050505] border border-[#222222] rounded-xl flex flex-col gap-1.5">
              <span class="text-red-400 font-bold uppercase">MYTH: "AES-256 ENCRYPTS 256-BIT BLOCKS"</span>
              <p class="text-zinc-400 font-sans text-[11px] leading-relaxed">
                <strong class="text-white">Reality:</strong> All AES variants process fixed 128-bit (16-byte) blocks. The number 256 refers exclusively to the key length, not the block size.
              </p>
            </div>
            <div class="p-3.5 bg-[#050505] border border-[#222222] rounded-xl flex flex-col gap-1.5">
              <span class="text-red-400 font-bold uppercase">MYTH: "AES PROTECTS WEAK PASSWORDS AUTOMATICALLY"</span>
              <p class="text-zinc-400 font-sans text-[11px] leading-relaxed">
                <strong class="text-white">Reality:</strong> AES assumes a high-entropy key. Human passphrases must pass through a computationally heavy KDF like PBKDF2 (with 250,000 iterations in CASTLE) to resist dictionary attacks.
              </p>
            </div>
            <div class="p-3.5 bg-[#050505] border border-[#222222] rounded-xl flex flex-col gap-1.5">
              <span class="text-red-400 font-bold uppercase">MYTH: "AES-GCM BY ITSELF PREVENTS REPLAY ATTACKS"</span>
              <p class="text-zinc-400 font-sans text-[11px] leading-relaxed">
                <strong class="text-white">Reality:</strong> GCM guarantees that a ciphertext was not altered, but cannot verify when it was sent. Replay protection requires protocol-level timestamps or sequence IDs.
              </p>
            </div>
            <div class="p-3.5 bg-[#050505] border border-[#222222] rounded-xl flex flex-col gap-1.5">
              <span class="text-red-400 font-bold uppercase">MYTH: "QUANTUM COMPUTERS WILL BREAK AES-256"</span>
              <p class="text-zinc-400 font-sans text-[11px] leading-relaxed">
                <strong class="text-white">Reality:</strong> Grover's quantum search provides only quadratic speedup (reducing 256 bits to 128 bits). 128 bits of remaining security requires 2¹²⁸ operations, which remains physically unbreakable.
              </p>
            </div>
          </div>
        </section>
        </div>

        <!-- Bottom Navigation Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#0A0A0A] border border-[#222222] rounded-xl text-xs font-mono mt-2 shadow-sm">
          <button id="aes-learn-theory-bottom-back" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141414] hover:bg-[#1E1E1E] text-zinc-300 hover:text-white border border-[#2E2E2E] text-xs font-bold transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>RETURN TO LEARN OVERVIEW</span>
          </button>
          <div class="flex items-center gap-3">
            <button id="aes-learn-theory-scroll-top" class="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs">
              <span class="material-symbols-outlined text-[15px]">arrow_upward</span>
              <span>BACK TO TOP</span>
            </button>
            <button id="aes-learn-theory-bottom-to-lab" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer">
              <span>LAUNCH HANDS-ON LAB</span>
              <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </div>

      </div>


      <!-- ====================================================================
           VIEW 3: HANDS-ON EXPERIENCE // INTERACTIVE SIMULATOR (PLAYGROUND)
           ==================================================================== -->
      <div id="aes-learn-lab-view" class="hidden flex flex-col gap-4" role="region" aria-label="Hands-on Experience interactive simulator">
        <!-- Sub-Navigation Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#0A0A0A] border border-[#222222] rounded-xl text-xs font-mono shadow-sm">
          <div class="flex items-center gap-2">
            <button id="aes-learn-lab-back" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141414] hover:bg-[#1E1E1E] text-zinc-300 hover:text-white border border-[#2E2E2E] text-xs font-bold transition-all cursor-pointer shadow-sm">
              <span class="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>RETURN TO LEARN OVERVIEW</span>
            </button>
            <span class="text-zinc-500 hidden md:inline">|</span>
            <span class="text-zinc-400 hidden md:inline text-[11px]">PATH 02 // HANDS-ON EXPERIENCE: INTERACTIVE SIMULATOR</span>
          </div>
          <button id="aes-learn-lab-to-theory" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange border border-brand-orange/30 text-xs font-medium transition-all cursor-pointer">
            <span>SWITCH TO WHAT & WHY THEORY</span>
            <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>

      <!-- LAB BANNER -->
      <div class="p-3.5 bg-[#0D0D0D] border border-orange-500/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div class="flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-brand-orange animate-pulse"></span>
          <span class="text-white font-bold tracking-wide uppercase">AES-256-GCM Interactive Learning Laboratory</span>
          <span class="px-2 py-0.5 rounded bg-orange-500/10 text-brand-orange border border-orange-500/20 text-[10px]">FIPS 197 & SP 800-38D VERIFIED</span>
        </div>
        <div class="flex items-center gap-2 text-zinc-400 text-[11px]">
          <span>Chapters 01–06 Active</span>
          <span class="text-zinc-500">|</span>
          <span class="text-emerald-400 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">verified</span> Full Suite Verified
          </span>
        </div>
      </div>

      <!-- Curriculum Chapter Stepper Navigation -->
      <nav aria-label="AES Curriculum Stepper" class="curriculum-chapter-stepper">
        <div class="flex items-center gap-2">
          <button id="aes-prev-chapter-btn" class="chapter-nav-btn" title="Previous chapter">
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            <span class="hidden sm:inline">Prev</span>
          </button>
        </div>

        <div class="chapter-steps-track" role="tablist">
          <button role="tab" class="chapter-step-pill aes-chapter-step-pill active" data-aes-ch="01">
            <span class="text-brand-orange font-bold">01</span>
            <span>Pipeline</span>
          </button>
          <button role="tab" class="chapter-step-pill aes-chapter-step-pill" data-aes-ch="02">
            <span class="text-brand-orange font-bold">02</span>
            <span>State Matrix</span>
          </button>
          <button role="tab" class="chapter-step-pill aes-chapter-step-pill" data-aes-ch="03">
            <span class="text-brand-orange font-bold">03</span>
            <span>Round Sim</span>
          </button>
          <button role="tab" class="chapter-step-pill aes-chapter-step-pill" data-aes-ch="04">
            <span class="text-brand-orange font-bold">04</span>
            <span>Key Sizes</span>
          </button>
          <button role="tab" class="chapter-step-pill aes-chapter-step-pill" data-aes-ch="05">
            <span class="text-brand-orange font-bold">05</span>
            <span>GCM Tamper Lab</span>
          </button>
          <button role="tab" class="chapter-step-pill aes-chapter-step-pill" data-aes-ch="06">
            <span class="text-brand-orange font-bold">06</span>
            <span>Quiz &amp; Handoff</span>
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button id="aes-next-chapter-btn" class="chapter-nav-btn" title="Next chapter">
            <span class="hidden sm:inline">Next</span>
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </nav>

      <div class="editorial-read-canvas">
        <header class="editorial-header">
          <div class="editorial-kicker">
            <span class="editorial-kicker-dot"></span>
            <span>PATH 02 // HANDS-ON EXPERIENCE: INTERACTIVE SIMULATOR</span>
          </div>
          <h1 class="editorial-title">
            AES-256-GCM Interactive Block Laboratory
          </h1>
          <p class="editorial-lede">
            Execute and inspect live 128-bit block cipher operations in real time. Manipulate plaintext inputs, examine the 4×4 state matrix and S-box transformations, evaluate key sizes, and execute cryptographic tampering attacks.
          </p>
        </header>

      <!-- ====================================================================
           CHAPTER 01: PLAINTEXT-TO-CIPHERTEXT PROCESS PIPELINE
           ==================================================================== -->
      <section id="aes-chapter-01" class="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4 flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1A1A1A]">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded bg-brand-orange text-black font-mono text-[10px] font-bold flex items-center justify-center">01</span>
            <h3 class="font-mono text-xs text-white uppercase font-bold tracking-wider">Process Pipeline // Plaintext to Authenticated Ciphertext</h3>
          </div>
          <div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="Sample Presets">
            <span class="text-[10px] font-mono text-zinc-400 mr-1">Presets:</span>
            <button id="aes-preset-castle" class="px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer bg-brand-orange text-black border-brand-orange">CASTLE (6B)</button>
            <button id="aes-preset-exact16" class="px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer bg-[#0D0D0D] text-zinc-400 border-[#222222] hover:text-white">16-BYTE EXACT</button>
            <button id="aes-preset-multiblock" class="px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer bg-[#0D0D0D] text-zinc-400 border-[#222222] hover:text-white">MULTI-BLOCK (36B)</button>
          </div>
        </div>

        <!-- Sample Ingress Control -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div class="md:col-span-8 flex flex-col gap-1.5">
            <label for="aes-round-input" class="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
              <span>Interactive Plaintext Input Buffer:</span>
              <span id="aes-pipe-byte-count" class="text-brand-orange font-bold">6 BYTES (UTF-8)</span>
            </label>
            <input id="aes-round-input" type="text" value="CASTLE" maxlength="128" 
                   class="w-full bg-[#000000] border border-[#2A2A2A] rounded px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:border-brand-orange focus:outline-none transition-all"
                   aria-label="Plaintext input buffer for educational demonstration">
          </div>
          <div class="md:col-span-4 p-2.5 bg-[#050505] border border-[#1A1A1A] rounded flex flex-col gap-1 text-[11px] font-mono">
            <div class="flex justify-between text-zinc-400">
              <span>Encoding:</span> <span class="text-zinc-200">UTF-8 Standard</span>
            </div>
            <div class="flex justify-between text-zinc-400">
              <span>AES Block Fit:</span> <span id="aes-pipe-block-fit" class="text-cyan-400">1 Block (Visual Pad)</span>
            </div>
          </div>
        </div>

        <!-- 4-Stage Reactive Pipeline Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          <!-- Stage 1 -->
          <div class="p-3 bg-[#0D0D0D] border border-[#1C1C1C] rounded-lg flex flex-col gap-2 relative">
            <div class="flex items-center justify-between text-[10px] font-mono">
              <span class="text-brand-orange font-bold uppercase tracking-wider">STAGE 01</span>
              <span class="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">INGRESS</span>
            </div>
            <div class="text-xs font-mono font-bold text-white">Secret Input</div>
            <div id="aes-pipe-stage1-desc" class="text-[11px] font-mono text-zinc-400 leading-relaxed min-h-12">
              Loading payload buffer...
            </div>
            <div class="pt-2 border-t border-[#181818] text-[10px] font-mono text-zinc-500">
              Source: Client volatile memory
            </div>
          </div>

          <!-- Stage 2 -->
          <div class="p-3 bg-[#0D0D0D] border border-[#1C1C1C] rounded-lg flex flex-col gap-2 relative">
            <div class="flex items-center justify-between text-[10px] font-mono">
              <span class="text-cyan-400 font-bold uppercase tracking-wider">STAGE 02</span>
              <span class="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">KEY DERIV</span>
            </div>
            <div class="text-xs font-mono font-bold text-white">Key Preparation</div>
            <div class="text-[11px] font-mono text-zinc-400 leading-relaxed min-h-12">
              <strong class="text-zinc-300">Passphrase:</strong> PBKDF2 (SHA-256, 250k iter, 16B salt).<br>
              <strong class="text-zinc-300">Random Key:</strong> 256-bit CSPRNG directly.
            </div>
            <div class="pt-2 border-t border-[#181818] text-[10px] font-mono text-cyan-400/90">
              Output: 256-bit master key
            </div>
          </div>

          <!-- Stage 3 -->
          <div class="p-3 bg-[#0D0D0D] border border-[#1C1C1C] rounded-lg flex flex-col gap-2 relative">
            <div class="flex items-center justify-between text-[10px] font-mono">
              <span class="text-brand-orange font-bold uppercase tracking-wider">STAGE 03</span>
              <span class="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">AES-256-GCM</span>
            </div>
            <div class="text-xs font-mono font-bold text-white">Authenticated Cipher</div>
            <div id="aes-pipe-stage3-desc" class="text-[11px] font-mono text-zinc-400 leading-relaxed min-h-12">
              128-bit block, 14 rounds, 96-bit IV, counter-mode encryption with GHASH authentication.
            </div>
            <div class="pt-2 border-t border-[#181818] text-[10px] font-mono text-orange-400/90">
              Mode: Streaming CTR + GHASH
            </div>
          </div>

          <!-- Stage 4 -->
          <div class="p-3 bg-[#0D0D0D] border border-[#1C1C1C] rounded-lg flex flex-col gap-2 relative">
            <div class="flex items-center justify-between text-[10px] font-mono">
              <span class="text-emerald-400 font-bold uppercase tracking-wider">STAGE 04</span>
              <span class="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">ENVELOPE</span>
            </div>
            <div class="text-xs font-mono font-bold text-white">Authenticated Package</div>
            <div class="text-[11px] font-mono text-zinc-400 leading-relaxed min-h-12">
              Assembles .castle envelope v1: Header metadata, 16B Salt, 12B IV, Ciphertext, and 16B Auth Tag.
            </div>
            <div class="pt-2 border-t border-[#181818] text-[10px] font-mono text-emerald-400/90">
              Format: Sealed .castle container
            </div>
          </div>
        </div>

        <!-- Multi-block GCM Notice Banner -->
        <div id="aes-pipe-multiblock-note" class="p-3 bg-[#050505] border border-cyan-500/20 rounded text-xs font-mono text-cyan-300/90 flex items-start gap-2.5">
          <span class="material-symbols-outlined text-base text-cyan-400 shrink-0 mt-0.5">info</span>
          <div>
            <strong>GCM Counter-Mode Multi-Block Processing:</strong> Plaintexts larger than 16 bytes do not fit inside a single AES matrix.
            Instead, GCM streams blocks using <code class="text-white bg-black px-1 py-0.5 rounded">E_K(IV || Counter) ⊕ Plaintext_i</code>
            and generates a single 128-bit GHASH authentication tag across all ciphertext blocks.
          </div>
        </div>
      </section>

      <!-- ====================================================================
           CHAPTER 02: 16-BYTE BLOCK EXPLORER & 4×4 STATE MATRIX
           ==================================================================== -->
      <section id="aes-chapter-02" class="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4 flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1A1A1A]">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded bg-brand-orange text-black font-mono text-[10px] font-bold flex items-center justify-center">02</span>
            <h3 class="font-mono text-xs text-white uppercase font-bold tracking-wider">16-Byte Block Explorer & 4×4 AES State Matrix</h3>
          </div>
          <div class="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span class="text-zinc-500">Mapping Rule:</span>
            <span class="text-brand-orange font-bold font-mono">s[r, c] = inputByte[r + 4*c]</span>
            <span class="text-zinc-500">(Column-Major)</span>
          </div>
        </div>

        <!-- Educational Zero-Fill Prominent Notice -->
        <div class="p-3 bg-[#0F0D05] border border-amber-500/30 rounded-lg text-xs font-mono text-amber-200/90 flex items-start gap-2.5">
          <span class="material-symbols-outlined text-base text-amber-400 shrink-0 mt-0.5">warning</span>
          <div class="leading-relaxed">
            <strong>Educational Padding Notice:</strong> Zero filling here is an educational visualization technique for a single AES block. It is not the production AES-GCM padding scheme. CASTLE's AES-GCM workflow supports arbitrary-length input without PKCS#7 block padding.
          </div>
        </div>

        <!-- Linear 16-Byte Strip -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Linear 16-Byte Ingress Buffer (Indices 0..15):</span>
            <span class="text-zinc-500 text-[10px]">Click any byte to inspect</span>
          </div>
          <div id="aes-linear-strip" class="grid grid-cols-8 sm:grid-cols-16 gap-1.5" role="listbox" aria-label="Linear 16-byte buffer strip">
            <!-- Dynamically populated -->
          </div>
        </div>

        <!-- 4x4 State Matrix + Cell Inspector -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-1">
          <!-- 4x4 State Matrix -->
          <div class="lg:col-span-7 flex flex-col gap-2">
            <div class="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span class="font-bold text-white uppercase">AES 4×4 State Matrix (Column-Major Order)</span>
              <span id="aes-matrix-block-label" class="text-brand-orange text-[10px]">Block 0 (Bytes 0–15)</span>
            </div>
            
            <div class="p-3 bg-[#050505] border border-[#1A1A1A] rounded-lg flex flex-col items-center">
              <!-- Matrix Grid with Column Headers -->
              <div class="grid grid-cols-5 gap-1.5 w-full max-w-md text-center font-mono">
                <!-- Top Header Row -->
                <div class="text-[10px] text-zinc-500 py-1 font-bold">R \ C</div>
                <div class="text-[10px] text-brand-orange py-1 font-bold">COL 0</div>
                <div class="text-[10px] text-brand-orange py-1 font-bold">COL 1</div>
                <div class="text-[10px] text-brand-orange py-1 font-bold">COL 2</div>
                <div class="text-[10px] text-brand-orange py-1 font-bold">COL 3</div>

                <!-- Row 0 -->
                <div class="text-[10px] text-brand-orange flex items-center justify-center font-bold">ROW 0</div>
                <button data-row="0" data-col="0" class="aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange transition-all cursor-pointer text-xs font-bold" tabindex="0"></button>
                <button data-row="0" data-col="1" class="aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange transition-all cursor-pointer text-xs font-bold" tabindex="0"></button>
                <button data-row="0" data-col="2" class="aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange transition-all cursor-pointer text-xs font-bold" tabindex="0"></button>
                <button data-row="0" data-col="3" class="aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange transition-all cursor-pointer text-xs font-bold" tabindex="0"></button>

                <!-- Row 1 -->
                <div class="text-[10px] text-brand-orange flex items-center justify-center font-bold">ROW 1</div>
                <button data-row="1" data-col="0" class="aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange transition-all cursor-pointer text-xs font-bold" tabindex="0"></button>
                <button data-row="1" data-col="1" class="aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange transition-all cursor-pointer text-xs font-bold" tabindex="0"></button>
                <button data-row="1" data-col="2" class="aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange transition-all cursor-pointer text-xs font-bold" tabindex="0"></button>
                <button data-row="1" data-col="3" class="aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange transition-all cursor-pointer text-xs font-bold" tabindex="0"></button>

                <!-- Row 2 -->
                <div class="text-[10px] text-brand-orange flex items-center justify-center font-bold">ROW 2</div>
                <button data-row="2" data-col="0" class="aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange transition-all cursor-pointer text-xs font-bold" tabindex="0"></button>
                <button data-row="2" data-col="1" class="aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange transition-all cursor-pointer text-xs font-bold" tabindex="0"></button>
                <button data-row="2" data-col="2" class="aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange transition-all cursor-pointer text-xs font-bold" tabindex="0"></button>
                <button data-row="2" data-col="3" class="aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange transition-all cursor-pointer text-xs font-bold" tabindex="0"></button>

                <!-- Row 3 -->
                <div class="text-[10px] text-brand-orange flex items-center justify-center font-bold">ROW 3</div>
                <button data-row="3" data-col="0" class="aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange transition-all cursor-pointer text-xs font-bold" tabindex="0"></button>
                <button data-row="3" data-col="1" class="aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange transition-all cursor-pointer text-xs font-bold" tabindex="0"></button>
                <button data-row="3" data-col="2" class="aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange transition-all cursor-pointer text-xs font-bold" tabindex="0"></button>
                <button data-row="3" data-col="3" class="aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange transition-all cursor-pointer text-xs font-bold" tabindex="0"></button>
              </div>
            </div>
            
            <p class="text-[11px] font-mono text-zinc-500 leading-normal">
              Notice: The first 4 linear bytes fill Column 0 downwards, not Row 0. In FIPS 197, states are always traversed column-first.
            </p>
          </div>

          <!-- Interactive Cell Inspector -->
          <div class="lg:col-span-5 p-3.5 bg-[#0D0D0D] border border-[#222] rounded-lg flex flex-col gap-3 font-mono">
            <div class="flex items-center justify-between pb-2 border-b border-[#1A1A1A]">
              <span class="text-xs text-brand-orange font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">troubleshoot</span> Cell Byte Inspector
              </span>
              <span id="aes-inspect-coord" class="px-2 py-0.5 rounded bg-zinc-800 text-white text-[10px] font-bold">[Row 0, Col 0]</span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-2 bg-[#050505] border border-[#1A1A1A] rounded flex flex-col gap-0.5">
                <span class="text-[10px] text-zinc-500 uppercase">Linear Index</span>
                <span id="aes-inspect-linear" class="text-white font-bold text-sm">Byte 0 / 15</span>
              </div>
              <div class="p-2 bg-[#050505] border border-[#1A1A1A] rounded flex flex-col gap-0.5">
                <span class="text-[10px] text-zinc-500 uppercase">Hex Value</span>
                <span id="aes-inspect-hex" class="text-brand-orange font-bold text-sm">0x43</span>
              </div>
              <div class="p-2 bg-[#050505] border border-[#1A1A1A] rounded flex flex-col gap-0.5">
                <span class="text-[10px] text-zinc-500 uppercase">Binary (8-Bit)</span>
                <span id="aes-inspect-bin" class="text-cyan-400 font-bold text-xs tracking-wider">01000011</span>
              </div>
              <div class="p-2 bg-[#050505] border border-[#1A1A1A] rounded flex flex-col gap-0.5">
                <span class="text-[10px] text-zinc-500 uppercase">ASCII Char</span>
                <span id="aes-inspect-ascii" class="text-emerald-400 font-bold text-sm">'C'</span>
              </div>
            </div>

            <div class="p-2 bg-[#050505] border border-[#1A1A1A] rounded flex flex-col gap-1 text-[11px]">
              <div class="flex justify-between text-zinc-400">
                <span>High Nibble:</span>
                <span id="aes-inspect-high" class="text-zinc-200">0x4 (0100)</span>
              </div>
              <div class="flex justify-between text-zinc-400">
                <span>Low Nibble:</span>
                <span id="aes-inspect-low" class="text-zinc-200">0x3 (0011)</span>
              </div>
              <div class="flex justify-between text-zinc-400">
                <span>Byte Status:</span>
                <span id="aes-inspect-status" class="text-emerald-400 font-bold">Input Byte</span>
              </div>
            </div>

            <button id="aes-inspect-sbox-btn" class="w-full py-2 px-3 rounded bg-[#151515] hover:bg-brand-orange hover:text-black text-brand-orange border border-brand-orange/40 font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5">
              <span>Inspect in S-Box Table (Chapter 03)</span>
              <span class="material-symbols-outlined text-sm">arrow_downward</span>
            </button>
          </div>
        </div>
      </section>

      <!-- ====================================================================
           CHAPTER 03: GENUINE AES-256 ROUND SIMULATOR & S-BOX
           ==================================================================== -->
      <section id="aes-chapter-03" class="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4 flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1A1A1A]">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded bg-brand-orange text-black font-mono text-[10px] font-bold flex items-center justify-center">03</span>
            <h3 class="font-mono text-xs text-white uppercase font-bold tracking-wider">Genuine AES-256 Round Simulator // R0–R14 & S-Box</h3>
          </div>
          <div class="flex items-center gap-1.5" role="group" aria-label="Simulator Vector Mode">
            <button id="aes-sim-mode-nist" class="px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer bg-brand-orange text-black border-brand-orange">NIST KAT Vector [Default]</button>
            <button id="aes-sim-mode-custom" class="px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer bg-[#0D0D0D] text-zinc-400 border-[#222222] hover:text-white">Custom Block</button>
          </div>
        </div>

        <!-- NIST KAT Verification Header Banner -->
        <div id="aes-kat-status-banner" class="p-3 bg-[#051108] border border-emerald-500/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-emerald-400">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-base text-emerald-400">verified</span>
            <span><strong>NIST FIPS 197 C.3 KAT Status:</strong> Validated Appendix C.3 AES-256 Known-Answer Test.</span>
          </div>
          <div class="text-[11px] text-zinc-400">
            Expected Ciphertext: <code class="text-emerald-300 font-bold">8ea2b7ca516745bfeafc49904b496089</code>
          </div>
        </div>

        <!-- Clickable Round Timeline R0–R14 -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Round Schedule Timeline (R0 Initial Key Whitening, R1–R13 Standard, R14 Terminal):</span>
            <span id="aes-round-indicator" class="text-brand-orange font-bold">AES-256 | Round 0 / 14</span>
          </div>
          <div id="aes-round-timeline" class="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-1" role="tablist" aria-label="AES Round Schedule">
            <!-- Dynamically populated R0..R14 buttons -->
          </div>
        </div>

        <!-- Transformation Stepper Card -->
        <div class="p-3.5 bg-[#0D0D0D] border border-[#222] rounded-lg flex flex-col gap-3 font-mono">
          <!-- Stepper Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1A1A1A]">
            <div class="flex flex-col gap-0.5">
              <span id="aes-step-title" class="text-xs text-white font-bold uppercase tracking-wider">Step 1: SubBytes</span>
              <span id="aes-step-eq" class="text-[11px] text-brand-orange font-bold font-mono">S'[r,c] = S_BOX( S[r,c] )</span>
            </div>
            
            <!-- Step Selection Tabs -->
            <div id="aes-step-pills" class="flex flex-wrap items-center gap-1">
              <!-- Dynamically populated step buttons -->
            </div>
          </div>

          <p id="aes-step-desc" class="text-xs text-zinc-400 leading-relaxed">
            Non-linear byte substitution operating independently on each byte.
          </p>

          <!-- Terminal Round Omission Callout -->
          <div id="aes-r14-omission-note" class="hidden p-2.5 bg-[#0A0D14] border border-cyan-500/30 rounded text-xs text-cyan-300 flex items-start gap-2">
            <span class="material-symbols-outlined text-sm text-cyan-400 mt-0.5 shrink-0">info</span>
            <span><strong>FIPS 197 Specification Note:</strong> In Round 14, MixColumns is omitted. The final round executes only SubBytes, ShiftRows, and AddRoundKey to preserve symmetric invertibility during decryption.</span>
          </div>

          <!-- Dual 4x4 State Display (Before -> After) -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
            <!-- Left Matrix: State Before -->
            <div class="md:col-span-5 p-2.5 bg-[#050505] border border-[#1A1A1A] rounded flex flex-col gap-1.5 items-center">
              <span class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Input State Before Step</span>
              <div id="aes-matrix-before" class="grid grid-cols-4 gap-1 w-full max-w-[200px] text-center text-[11px]"></div>
            </div>

            <!-- Center Transformation Arrow -->
            <div class="md:col-span-2 flex flex-col items-center justify-center gap-1 text-center py-2">
              <span class="material-symbols-outlined text-2xl text-brand-orange">arrow_forward</span>
              <span id="aes-arrow-op-label" class="text-[10px] font-bold uppercase text-brand-orange">SubBytes</span>
            </div>

            <!-- Right Matrix: State After -->
            <div class="md:col-span-5 p-2.5 bg-[#050505] border border-[#1A1A1A] rounded flex flex-col gap-1.5 items-center">
              <span class="text-[10px] text-brand-orange font-bold uppercase tracking-wider">Output State After Step</span>
              <div id="aes-matrix-after" class="grid grid-cols-4 gap-1 w-full max-w-[200px] text-center text-[11px]"></div>
            </div>
          </div>

          <!-- Round Key Details (When Step is AddRoundKey) -->
          <div id="aes-round-key-card" class="p-2.5 bg-[#050505] border border-[#1A1A1A] rounded flex flex-col gap-2">
            <div class="flex items-center justify-between text-[10px] text-zinc-400">
              <span class="font-bold text-white uppercase">Active 128-Bit Round Key (Key Schedule Derived)</span>
              <span id="aes-round-key-label" class="text-brand-orange font-bold">Round Key 0</span>
            </div>
            <div id="aes-round-key-hex" class="text-[11px] text-zinc-300 font-mono tracking-wider break-all bg-black p-2 rounded border border-[#181818]"></div>
          </div>

          <!-- Stepper Navigation Controls -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#181818]">
            <div class="flex items-center gap-2">
              <button id="aes-round-prev-step" class="px-3 py-1.5 rounded bg-[#181818] hover:bg-zinc-800 text-zinc-200 border border-[#2A2A2A] text-xs font-bold cursor-pointer transition-all">⏮ PREV STEP</button>
              <button id="aes-round-next" class="px-3 py-1.5 rounded bg-brand-orange hover:bg-orange-600 text-black border border-brand-orange text-xs font-bold cursor-pointer transition-all shadow-sm">NEXT STEP ⏭</button>
            </div>
            <div class="flex items-center gap-2">
              <button id="aes-round-skip" class="px-3 py-1.5 rounded bg-[#181818] hover:bg-zinc-800 text-zinc-300 border border-[#2A2A2A] text-xs font-bold cursor-pointer transition-all">NEXT ROUND ⏩</button>
              <button id="aes-sim-reset-btn" class="px-3 py-1.5 rounded bg-[#111] hover:bg-zinc-800 text-zinc-400 border border-[#222] text-xs font-bold cursor-pointer transition-all">RESET TO R0</button>
            </div>
          </div>
        </div>

        <!-- Interactive 16x16 FIPS 197 S-Box Table -->
        <div id="aes-sbox-section" class="p-3.5 bg-[#0D0D0D] border border-[#222] rounded-lg flex flex-col gap-3 font-mono">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1A1A1A]">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-base text-brand-orange">grid_on</span>
              <span class="text-xs text-white font-bold uppercase tracking-wider">FIPS 197 S-Box Interactive Matrix (256 Entries)</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <label for="aes-sbox-search" class="text-zinc-400 text-[11px]">Lookup Hex:</label>
              <input id="aes-sbox-search" type="text" maxlength="2" placeholder="1D" value="1D"
                     class="w-14 bg-black border border-[#2A2A2A] rounded px-2 py-0.5 text-center text-xs text-brand-orange font-bold uppercase focus:border-brand-orange focus:outline-none">
            </div>
          </div>

          <!-- S-Box Crosshair Active Inspector Banner -->
          <div id="aes-sbox-inspector-banner" class="p-2.5 bg-[#050505] border border-orange-500/30 rounded flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-300">
            <div class="flex items-center gap-3">
              <span>Input Byte: <strong id="aes-sbox-target-hex" class="text-brand-orange text-sm">0x1D</strong></span>
              <span class="text-zinc-400">→</span>
              <span>Row (High Nibble): <strong id="aes-sbox-target-row" class="text-cyan-400">1</strong></span>
              <span>Col (Low Nibble): <strong id="aes-sbox-target-col" class="text-cyan-400">D</strong></span>
              <span class="text-zinc-400">→</span>
              <span>S-Box Output: <strong id="aes-sbox-target-out" class="text-emerald-400 text-sm">0xA4</strong></span>
            </div>
            <div class="flex items-center gap-1.5 text-[10px]">
              <button data-sbox-test="1d" class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer">0x1D → 0xA4</button>
              <button data-sbox-test="00" class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer">0x00 → 0x63</button>
              <button data-sbox-test="ff" class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer">0xFF → 0x16</button>
            </div>
          </div>

          <!-- S-Box 16x16 Scrollable Container -->
          <div class="overflow-x-auto max-w-full pb-1 border border-[#1A1A1A] rounded bg-black" tabindex="0" aria-label="FIPS 197 S-Box 16x16 matrix table">
            <table id="aes-sbox-table" class="w-full text-center border-collapse text-[10px] min-w-[540px]">
              <thead>
                <tr class="bg-[#111] text-brand-orange font-bold border-b border-[#222]">
                  <th class="p-1 border-r border-[#222]">R \ C</th>
                  <th class="p-1">0</th><th class="p-1">1</th><th class="p-1">2</th><th class="p-1">3</th>
                  <th class="p-1">4</th><th class="p-1">5</th><th class="p-1">6</th><th class="p-1">7</th>
                  <th class="p-1">8</th><th class="p-1">9</th><th class="p-1">A</th><th class="p-1">B</th>
                  <th class="p-1">C</th><th class="p-1">D</th><th class="p-1">E</th><th class="p-1">F</th>
                </tr>
              </thead>
              <tbody id="aes-sbox-tbody">
                <!-- Dynamically populated 16 rows -->
              </tbody>
            </table>
          </div>
          <p class="text-[11px] text-zinc-500">
            Click any cell in the S-Box table or enter a hex byte above to trace row and column crosshair substitution.
          </p>
        </div>
      </section>

      <!-- ====================================================================
           CHAPTER 04: INTERACTIVE KEY-SIZE COMPARISON (STAGE A3)
           ==================================================================== -->
      <section id="aes-chapter-04" class="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4 flex flex-col gap-4 font-mono">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1A1A1A]">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded bg-brand-orange text-black font-mono text-[10px] font-bold flex items-center justify-center">04</span>
            <h3 class="font-mono text-xs text-white uppercase font-bold tracking-wider">Key-Size Comparison // AES-128 vs AES-192 vs AES-256 (NIST FIPS 197)</h3>
          </div>
          <!-- Variant Selector Tabs -->
          <div id="aes-key-variant-tabs" class="flex items-center gap-1.5" role="tablist" aria-label="AES Key Size Variants">
            <button id="aes-key-var-128" role="tab" aria-selected="false" aria-controls="aes-chapter-04" class="px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer bg-[#0D0D0D] text-zinc-400 border-[#222] hover:text-white">AES-128</button>
            <button id="aes-key-var-192" role="tab" aria-selected="false" aria-controls="aes-chapter-04" class="px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer bg-[#0D0D0D] text-zinc-400 border-[#222] hover:text-white">AES-192</button>
            <button id="aes-key-var-256" role="tab" aria-selected="true" aria-controls="aes-chapter-04" class="px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer bg-brand-orange text-black border-brand-orange">AES-256</button>
          </div>
        </div>

        <!-- Proportional Key Length Visual Bar -->
        <div class="p-3 bg-[#050505] border border-[#1A1A1A] rounded-lg flex flex-col gap-2">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-zinc-400 font-bold uppercase">Proportional Key Bit Length (Relative to 256-bit):</span>
            <span id="aes-key-var-bar-label" class="text-brand-orange font-bold">256 BITS (32 BYTES) — 100% RELATIVE KEY BIT LENGTH</span>
          </div>
          <div class="w-full h-3.5 bg-[#121212] rounded-full overflow-hidden border border-[#222] relative" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100" aria-label="Key length proportion bar">
            <div id="aes-key-var-bar" class="h-full bg-gradient-to-r from-cyan-500 via-amber-500 to-brand-orange transition-all duration-300 rounded-full" style="width: 100%;"></div>
          </div>
          <div class="flex justify-between text-[10px] text-zinc-500 pt-0.5">
            <span>128-bit (50% bits · 2¹²⁸ space)</span>
            <span>192-bit (75% bits · 2¹⁹² space)</span>
            <span>256-bit (100% bits · 2²⁵⁶ space)</span>
          </div>
          <div class="text-[10px] text-zinc-400 pt-1">
            <span class="text-zinc-300 font-bold">Cryptographic Note:</span> The percentage bar depicts linear key bit length relative to 256 bits (k / 256). Combinatorial keyspace scales exponentially (2^k), meaning AES-256 provides 2¹²⁸ times more search space than AES-128.
          </div>
        </div>

        <!-- 5 Metric Cards Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <div class="p-2.5 bg-[#0D0D0D] border border-[#1C1C1C] rounded-lg flex flex-col gap-1">
            <span class="text-[10px] text-zinc-500 uppercase font-bold">Key Length</span>
            <span id="aes-key-var-len" class="text-xs font-bold text-white">256 bits (32 B)</span>
            <span class="text-[9px] text-zinc-500">Master Secret Size</span>
          </div>
          <div class="p-2.5 bg-[#0D0D0D] border border-[#1C1C1C] rounded-lg flex flex-col gap-1">
            <span class="text-[10px] text-zinc-500 uppercase font-bold">Rounds (Nr)</span>
            <span id="aes-key-var-rounds" class="text-xs font-bold text-brand-orange">14 Rounds</span>
            <span class="text-[9px] text-zinc-500">Transform Iterations</span>
          </div>
          <div class="p-2.5 bg-[#0D0D0D] border border-[#1C1C1C] rounded-lg flex flex-col gap-1">
            <span class="text-[10px] text-zinc-500 uppercase font-bold">Expanded Words</span>
            <span id="aes-key-var-words" class="text-xs font-bold text-cyan-400">60 Words (240 B)</span>
            <span class="text-[9px] text-zinc-500">Nb × (Nr + 1)</span>
          </div>
          <div class="p-2.5 bg-[#0D0D0D] border border-[#1C1C1C] rounded-lg flex flex-col gap-1">
            <span class="text-[10px] text-zinc-500 uppercase font-bold">Round Keys</span>
            <span id="aes-key-var-keys" class="text-xs font-bold text-emerald-400">15 Keys (K₀–K₁₄)</span>
            <span class="text-[9px] text-zinc-500">Includes Initial Whitening</span>
          </div>
          <div class="p-2.5 bg-[#0D0D0D] border border-[#1C1C1C] rounded-lg flex flex-col gap-1 col-span-2 sm:col-span-1">
            <span class="text-[10px] text-zinc-500 uppercase font-bold">Block Size (Nb)</span>
            <span id="aes-key-var-block" class="text-xs font-bold text-white">128 bits (16 B)</span>
            <span class="text-[9px] text-cyan-400">Fixed for all variants</span>
          </div>
        </div>

        <!-- Comparative Explanation & Search Space -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="p-3 bg-[#050505] border border-[#1A1A1A] rounded flex flex-col gap-2 text-xs">
            <div class="flex items-center justify-between text-[11px] pb-1 border-b border-[#141414]">
              <span class="text-white font-bold uppercase">Variant Profile & Security Margin</span>
              <span id="aes-key-var-badge" class="px-1.5 py-0.5 rounded bg-orange-500/10 text-brand-orange border border-orange-500/20 text-[10px]">SELECTED</span>
            </div>
            <p id="aes-key-var-desc" class="text-zinc-300 leading-relaxed text-[11px]"></p>
            <div class="pt-1.5 border-t border-[#141414] text-[10px] text-zinc-400 flex flex-col gap-1">
              <span class="font-bold text-zinc-300">Quantum Security Margin (Grover's Algorithm):</span>
              <span id="aes-key-var-sec" class="text-zinc-400"></span>
            </div>
          </div>

          <div class="p-3 bg-[#050505] border border-[#1A1A1A] rounded flex flex-col gap-2 text-xs">
            <div class="flex items-center justify-between text-[11px] pb-1 border-b border-[#141414]">
              <span class="text-white font-bold uppercase">Brute-Force Search Space & Cross-Comparison</span>
              <span class="text-cyan-400 text-[10px] font-mono">2^k COMPLEXITY</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[10px] text-zinc-500 uppercase">Combinatorial Search Space:</span>
              <span id="aes-key-var-space" class="text-xs font-bold text-brand-orange"></span>
            </div>
            <div class="pt-1.5 border-t border-[#141414] text-[10px] text-zinc-400 flex flex-col gap-1">
              <span class="font-bold text-zinc-300">Direct Comparison With Other Variants:</span>
              <span id="aes-key-var-comp" class="text-zinc-400 leading-relaxed"></span>
            </div>
          </div>
        </div>

        <!-- Full NIST FIPS 197 Specification Table -->
        <div class="overflow-x-auto max-w-full pb-1 border border-[#1A1A1A] rounded bg-black">
          <table class="w-full text-left border-collapse text-[11px] min-w-[500px]">
            <thead>
              <tr class="bg-[#111] text-zinc-400 font-bold border-b border-[#222]">
                <th class="p-2 border-r border-[#222]">Specification Property</th>
                <th id="aes-th-var-128" class="p-2 border-r border-[#222] text-center">AES-128</th>
                <th id="aes-th-var-192" class="p-2 border-r border-[#222] text-center">AES-192</th>
                <th id="aes-th-var-256" class="p-2 text-center text-brand-orange">AES-256</th>
              </tr>
            </thead>
            <tbody class="text-zinc-300 divide-y divide-[#181818]">
              <tr><td class="p-2 text-zinc-400 border-r border-[#181818]">Key Length (bits)</td><td class="p-2 text-center border-r border-[#181818]">128 bits</td><td class="p-2 text-center border-r border-[#181818]">192 bits</td><td class="p-2 text-center text-brand-orange font-bold">256 bits</td></tr>
              <tr><td class="p-2 text-zinc-400 border-r border-[#181818]">Key Bytes</td><td class="p-2 text-center border-r border-[#181818]">16 bytes</td><td class="p-2 text-center border-r border-[#181818]">24 bytes</td><td class="p-2 text-center text-brand-orange font-bold">32 bytes</td></tr>
              <tr><td class="p-2 text-zinc-400 border-r border-[#181818]">Number of Rounds (Nr)</td><td class="p-2 text-center border-r border-[#181818]">10</td><td class="p-2 text-center border-r border-[#181818]">12</td><td class="p-2 text-center text-brand-orange font-bold">14</td></tr>
              <tr><td class="p-2 text-zinc-400 border-r border-[#181818]">Expanded Key Words</td><td class="p-2 text-center border-r border-[#181818]">44 words</td><td class="p-2 text-center border-r border-[#181818]">52 words</td><td class="p-2 text-center text-brand-orange font-bold">60 words</td></tr>
              <tr><td class="p-2 text-zinc-400 border-r border-[#181818]">Expanded Key Size</td><td class="p-2 text-center border-r border-[#181818]">176 bytes</td><td class="p-2 text-center border-r border-[#181818]">208 bytes</td><td class="p-2 text-center text-brand-orange font-bold">240 bytes</td></tr>
              <tr><td class="p-2 text-zinc-400 border-r border-[#181818]">Round Keys (Nr + 1)</td><td class="p-2 text-center border-r border-[#181818]">11</td><td class="p-2 text-center border-r border-[#181818]">13</td><td class="p-2 text-center text-brand-orange font-bold">15</td></tr>
              <tr><td class="p-2 text-zinc-400 border-r border-[#181818]">Block Size (Nb)</td><td class="p-2 text-center border-r border-[#181818] text-cyan-400 font-bold">128 bits</td><td class="p-2 text-center border-r border-[#181818] text-cyan-400 font-bold">128 bits</td><td class="p-2 text-center text-cyan-400 font-bold">128 bits</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Technical Accuracy & Caveats Banner -->
        <div class="p-3 bg-[#080808] border border-orange-500/20 rounded-lg flex flex-col gap-1.5 text-[11px] text-zinc-400">
          <div class="flex items-center gap-2 text-white font-bold">
            <span class="material-symbols-outlined text-sm text-brand-orange">info</span>
            <span>Technical Accuracy & Practical Security Principles</span>
          </div>
          <p class="leading-relaxed">
            • <strong>Constant Block Size:</strong> AES fixes the block size strictly at <strong>128 bits (16 bytes)</strong> across all three variants. Only key size and round count vary.<br>
            • <strong>Security Caveats:</strong> A larger key increases the brute-force search space ($2^{256}$ vs $2^{128}$), but larger keys alone do not guarantee application security. Real-world protection depends on high-entropy key generation, secure storage, correct mode of operation (AEAD vs ECB), and side-channel resilience.<br>
            • <strong>Production Scope:</strong> This comparison is strictly educational. CASTLE’s production suite exclusively uses <strong>AES-256-GCM</strong>. The round simulator in Chapter 03 demonstrates the AES-256 schedule only.
          </p>
        </div>
      </section>

      <!-- ====================================================================
           CHAPTER 05: GENUINE AES-GCM TAMPER LABORATORY (STAGE A4)
           ==================================================================== -->
      <section id="aes-chapter-05" class="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4 flex flex-col gap-4 font-mono">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1A1A1A]">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded bg-brand-orange text-black font-mono text-[10px] font-bold flex items-center justify-center">05</span>
            <h3 class="font-mono text-xs text-white uppercase font-bold tracking-wider">AES-GCM Authenticated Laboratory // Tamper Detection & Integrity Verification</h3>
          </div>
          <div class="flex items-center gap-2 text-[11px] text-emerald-400">
            <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real Web Crypto Engine (NIST SP 800-38D)</span>
          </div>
        </div>

        <!-- Input & Re-encryption Controls -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div class="md:col-span-6 flex flex-col gap-1.5">
            <label for="aes-gcm-plaintext-input" class="text-[11px] text-zinc-400 flex justify-between">
              <span>Sample Plaintext (Demonstration Payload):</span>
              <span class="text-brand-orange text-[10px]">Ephemeral RAM</span>
            </label>
            <input id="aes-gcm-plaintext-input" type="text" value="TACTICAL MISSION BRIEFING: VERIFY INTEGRITY BEFORE LAUNCH" maxlength="120"
                   class="w-full bg-[#000000] border border-[#2A2A2A] rounded px-3 py-2 text-xs text-white focus:border-brand-orange focus:outline-none transition-all">
          </div>

          <div class="md:col-span-4 flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <label for="aes-gcm-aad-input" class="text-[11px] text-zinc-400">Additional Authenticated Data (AAD):</label>
              <label class="inline-flex items-center gap-1 cursor-pointer text-[10px] text-zinc-400">
                <input id="aes-gcm-use-aad-toggle" type="checkbox" checked class="accent-brand-orange">
                <span>Enable AAD</span>
              </label>
            </div>
            <input id="aes-gcm-aad-input" type="text" value="hdr:v=1;src=hq;dst=field_unit_4" maxlength="80"
                   class="w-full bg-[#000000] border border-[#2A2A2A] rounded px-3 py-2 text-xs text-zinc-300 focus:border-brand-orange focus:outline-none transition-all">
          </div>

          <div class="md:col-span-2 flex flex-col justify-end">
            <button id="aes-gcm-reencrypt-btn" class="w-full px-3 py-2 rounded bg-[#181818] hover:bg-zinc-800 text-zinc-200 border border-[#2A2A2A] text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm" title="Generate fresh key and new random 96-bit IV">
              <span class="material-symbols-outlined text-[16px] text-brand-orange">refresh</span>
              <span>NEW IV / KEY</span>
            </button>
          </div>
        </div>

        <!-- 4 Component Display Cards (Demonstrating GCM Components in Memory) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <!-- Card 1: Key -->
          <div class="p-2.5 bg-[#0D0D0D] border border-[#1C1C1C] rounded-lg flex flex-col gap-1.5">
            <div class="flex items-center justify-between text-[10px]">
              <span class="text-zinc-400 font-bold uppercase">1. 256-Bit Master Key</span>
              <span class="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[9px]">AES-256</span>
            </div>
            <div id="aes-gcm-key-display" class="text-[10px] text-zinc-300 bg-black p-2 rounded border border-[#181818] break-all leading-relaxed font-mono">Loading...</div>
            <span class="text-[9px] text-zinc-500">Transient volatile memory only</span>
          </div>

          <!-- Card 2: IV -->
          <div class="p-2.5 bg-[#0D0D0D] border border-[#1C1C1C] rounded-lg flex flex-col gap-1.5">
            <div class="flex items-center justify-between text-[10px]">
              <span class="text-cyan-400 font-bold uppercase">2. 96-Bit Nonce / IV</span>
              <span class="px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 text-[9px]">12 BYTES</span>
            </div>
            <div id="aes-gcm-iv-display" class="text-[10px] text-cyan-300 bg-black p-2 rounded border border-[#181818] break-all leading-relaxed font-mono">Loading...</div>
            <span class="text-[9px] text-cyan-400/80">Fresh random IV on each encryption</span>
          </div>

          <!-- Card 3: Ciphertext -->
          <div class="p-2.5 bg-[#0D0D0D] border border-[#1C1C1C] rounded-lg flex flex-col gap-1.5">
            <div class="flex items-center justify-between text-[10px]">
              <span class="text-zinc-300 font-bold uppercase">3. Ciphertext (CTR Stream)</span>
              <span id="aes-gcm-ct-len-badge" class="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[9px]">0 BYTES</span>
            </div>
            <div id="aes-gcm-ct-display" class="text-[10px] text-zinc-300 bg-black p-2 rounded border border-[#181818] break-all leading-relaxed max-h-20 overflow-y-auto custom-scrollbar font-mono">Loading...</div>
            <span class="text-[9px] text-zinc-500">Encrypted via counter mode stream</span>
          </div>

          <!-- Card 4: Tag -->
          <div class="p-2.5 bg-[#0D0D0D] border border-[#1C1C1C] rounded-lg flex flex-col gap-1.5">
            <div class="flex items-center justify-between text-[10px]">
              <span class="text-brand-orange font-bold uppercase">4. 128-Bit Auth Tag (T)</span>
              <span class="px-1.5 py-0.5 rounded bg-orange-950/60 text-brand-orange border border-orange-800/40 text-[9px]">16 BYTES</span>
            </div>
            <div id="aes-gcm-tag-display" class="text-[10px] text-brand-orange bg-black p-2 rounded border border-[#181818] break-all leading-relaxed font-mono">Loading...</div>
            <span class="text-[9px] text-brand-orange/80">GHASH Galois Field universal tag</span>
          </div>
        </div>

        <!-- Controlled Tamper Scenarios -->
        <div class="p-3 bg-[#050505] border border-[#1A1A1A] rounded-lg flex flex-col gap-2.5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span class="text-[11px] font-bold text-white uppercase tracking-wider">Select Decryption & Tamper Verification Scenario:</span>
            <span class="text-[10px] text-zinc-500">Executes real Web Crypto crypto.subtle.decrypt()</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2" role="group" aria-label="GCM Tamper Scenarios">
            <button id="aes-gcm-scen-valid" class="px-2.5 py-2 rounded text-xs font-bold uppercase transition-all border cursor-pointer bg-brand-orange text-black border-brand-orange text-left flex flex-col gap-0.5 shadow-sm">
              <span class="flex items-center gap-1 text-[11px]"><span class="material-symbols-outlined text-sm">verified</span> 1. Authentic Payload</span>
              <span class="text-[9px] opacity-80 normal-case font-normal">Original untouched ciphertext + tag + AAD</span>
            </button>
            <button id="aes-gcm-scen-ct" class="px-2.5 py-2 rounded text-xs font-bold uppercase transition-all border cursor-pointer bg-[#0D0D0D] text-zinc-300 border-[#222] hover:text-white text-left flex flex-col gap-0.5">
              <span class="flex items-center gap-1 text-[11px]"><span class="material-symbols-outlined text-sm text-red-400">gpp_bad</span> 2. Tamper Ciphertext</span>
              <span class="text-[9px] text-zinc-500 normal-case font-normal">Flip bit 0 in ciphertext (tag untouched)</span>
            </button>
            <button id="aes-gcm-scen-tag" class="px-2.5 py-2 rounded text-xs font-bold uppercase transition-all border cursor-pointer bg-[#0D0D0D] text-zinc-300 border-[#222] hover:text-white text-left flex flex-col gap-0.5">
              <span class="flex items-center gap-1 text-[11px]"><span class="material-symbols-outlined text-sm text-red-400">key_off</span> 3. Tamper Auth Tag</span>
              <span class="text-[9px] text-zinc-500 normal-case font-normal">Flip bit 0 in 128-bit tag (ciphertext intact)</span>
            </button>
            <button id="aes-gcm-scen-aad" class="px-2.5 py-2 rounded text-xs font-bold uppercase transition-all border cursor-pointer bg-[#0D0D0D] text-zinc-300 border-[#222] hover:text-white text-left flex flex-col gap-0.5">
              <span class="flex items-center gap-1 text-[11px]"><span class="material-symbols-outlined text-sm text-amber-400">alt_route</span> 4. Tamper AAD Header</span>
              <span class="text-[9px] text-zinc-500 normal-case font-normal">Corrupt metadata (confirms AAD authentication)</span>
            </button>
          </div>
        </div>

        <!-- Decryption Result & Verification Card -->
        <div id="aes-gcm-result-card" class="p-3.5 bg-[#050505] border border-emerald-500/30 rounded-lg flex flex-col gap-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1A1A1A]">
            <div class="flex items-center gap-2">
              <span id="aes-gcm-auth-icon" class="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
              <span class="text-xs font-bold text-white uppercase">Cryptographic Verification Outcome:</span>
              <span id="aes-gcm-auth-badge" class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">AUTHENTICATION SUCCEEDED</span>
            </div>
            <span id="aes-gcm-engine-label" class="text-[10px] text-zinc-500 font-mono">crypto.subtle.decrypt()</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
            <div class="md:col-span-7 flex flex-col gap-1.5">
              <span class="text-[10px] text-zinc-400 uppercase font-bold">Recovered Plaintext Buffer (Volatile RAM):</span>
              <div id="aes-gcm-recovered-plaintext" class="p-2.5 bg-black rounded border border-[#222] text-xs text-white font-mono break-all min-h-12 flex items-center">
                Loading...
              </div>
              <div id="aes-gcm-byte-match-status" class="text-[10px] text-emerald-400 flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">verified</span>
                <span>Original bytes perfectly recovered (Byte-for-byte exact match)</span>
              </div>
            </div>

            <div class="md:col-span-5 flex flex-col gap-1.5 bg-[#0D0D0D] p-2.5 rounded border border-[#1A1A1A] text-[11px] text-zinc-400">
              <span class="font-bold text-white text-[10px] uppercase">Cryptographic Rationale:</span>
              <p id="aes-gcm-scenario-desc" class="leading-relaxed text-[10px] text-zinc-300">
                All ciphertext bytes, authentication tag, and AAD header match the Galois Field polynomial evaluation. Web Crypto verified tag T = GHASH(H, A, C) ⊕ AES_K(J0) before releasing plaintext.
              </p>
              <div class="pt-1.5 border-t border-[#181818] text-[9px] text-zinc-500">
                Strict Security Protocol: If authentication fails, Web Crypto throws an OperationError exception. The plaintext buffer is purged immediately to prevent unauthenticated plaintext leakage.
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ====================================================================
           CHAPTER 06: PRODUCTION WORKFLOW HANDOFFS & ARCHITECTURE BRIDGE (STAGE A5)
           ==================================================================== -->
      <section id="aes-chapter-06" class="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4 flex flex-col gap-4 font-mono">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1A1A1A]">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded bg-brand-orange text-black font-mono text-[10px] font-bold flex items-center justify-center">06</span>
            <h3 class="font-mono text-xs text-white uppercase font-bold tracking-wider">Production Workflow Handoffs // Learn to Studio Bridge</h3>
          </div>
          <span class="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 text-[10px]">ARCHITECTURAL BRIDGE</span>
        </div>

        <!-- Architectural Comparison: Simulator vs Production GCM -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Left: Educational Block Cipher -->
          <div class="p-3 bg-[#050505] border border-[#1A1A1A] rounded-lg flex flex-col gap-2">
            <div class="flex items-center gap-2 pb-1.5 border-b border-[#141414]">
              <span class="material-symbols-outlined text-brand-orange text-base">school</span>
              <span class="text-white text-xs font-bold uppercase">Educational Round Simulator (FIPS 197)</span>
            </div>
            <ul class="text-[11px] text-zinc-400 space-y-1.5 leading-relaxed">
              <li>• <strong>Scope:</strong> Demonstrates single 128-bit block permutations and key expansion.</li>
              <li>• <strong>Transformations:</strong> Explicit SubBytes, ShiftRows, MixColumns, and AddRoundKey steps.</li>
              <li>• <strong>Limitations:</strong> Does NOT provide data integrity, nonce management, or streaming encryption.</li>
              <li>• <strong>Purpose:</strong> Conceptual insight into cipher algebra and intermediate matrix states.</li>
            </ul>
          </div>

          <!-- Right: Production AES-GCM -->
          <div class="p-3 bg-[#050505] border border-[#1A1A1A] rounded-lg flex flex-col gap-2">
            <div class="flex items-center gap-2 pb-1.5 border-b border-[#141414]">
              <span class="material-symbols-outlined text-emerald-400 text-base">verified_user</span>
              <span class="text-white text-xs font-bold uppercase">Production CASTLE Suite (NIST SP 800-38D)</span>
            </div>
            <ul class="text-[11px] text-zinc-400 space-y-1.5 leading-relaxed">
              <li>• <strong>AEAD Standard:</strong> Combines AES-CTR streaming with GHASH universal authentication.</li>
              <li>• <strong>Integrity Tag:</strong> Generates a 128-bit tag ensuring any modification is rejected.</li>
              <li>• <strong>Key Management:</strong> PBKDF2-HMAC-SHA-256 (250,000 iterations) with 16B salt or random key.</li>
              <li>• <strong>Envelope:</strong> Standardized, tamper-evident <code class="text-brand-orange">.castle</code> v1 format.</li>
            </ul>
          </div>
        </div>

        <!-- =====================================================================
             INTERACTIVE KNOWLEDGE CHECK AUDIT (3 TECHNICAL CHALLENGES)
             ===================================================================== -->
        <div class="flex flex-col gap-3 pt-2">
          <div class="flex items-center justify-between border-b border-[#1A1A1A] pb-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-brand-orange text-lg">quiz</span>
              <h4 class="font-mono text-xs text-white uppercase font-bold tracking-wider">
                AES Protocol Comprehension Audit
              </h4>
            </div>
            <span class="text-[10px] font-mono text-zinc-400 bg-[#050505] px-2 py-0.5 rounded border border-[#222]">
              3 CHALLENGES // INSTANT FEEDBACK
            </span>
          </div>

          <!-- Challenge 1 -->
          <div class="knowledge-check-card aes-knowledge-card" data-quiz-id="aq1">
            <div class="flex items-center gap-2 text-xs font-mono text-brand-orange font-bold uppercase">
              <span>Challenge 01 // Cipher Modes & Semantic Security</span>
            </div>
            <p class="text-xs text-white font-medium">
              Why is AES-GCM (Galois/Counter Mode) strictly required for modern applications, while AES-ECB (Electronic Codebook) is banned?
            </p>
            <div class="flex flex-col gap-2">
              <button type="button" class="knowledge-option-btn" data-correct="false">
                <span class="font-mono font-bold text-zinc-400 shrink-0">A.</span>
                <span>AES-ECB can only encrypt 64-bit blocks, whereas AES-GCM supports 256-bit blocks.</span>
              </button>
              <button type="button" class="knowledge-option-btn" data-correct="true">
                <span class="font-mono font-bold text-zinc-400 shrink-0">B.</span>
                <span>AES-ECB encrypts identical plaintext blocks into identical ciphertext blocks (leaking patterns like the ECB Penguin), and lacks authentication. AES-GCM provides randomized semantic security and an authentication tag that detects any modification.</span>
              </button>
              <button type="button" class="knowledge-option-btn" data-correct="false">
                <span class="font-mono font-bold text-zinc-400 shrink-0">C.</span>
                <span>AES-GCM is an asymmetric cipher that requires public and private keys.</span>
              </button>
            </div>
            <div class="knowledge-feedback-banner bg-[#050505] border border-[#222222] text-xs font-mono"></div>
          </div>

          <!-- Challenge 2 -->
          <div class="knowledge-check-card aes-knowledge-card" data-quiz-id="aq2">
            <div class="flex items-center gap-2 text-xs font-mono text-brand-orange font-bold uppercase">
              <span>Challenge 02 // Nonce / IV Replay Catastrophe</span>
            </div>
            <p class="text-xs text-white font-medium">
              What catastrophic vulnerability occurs if a developer encrypts two different messages using the same AES-256 key and the exact same 96-bit Initialization Vector (IV)?
            </p>
            <div class="flex flex-col gap-2">
              <button type="button" class="knowledge-option-btn" data-correct="true">
                <span class="font-mono font-bold text-zinc-400 shrink-0">A.</span>
                <span>Both ciphertext streams use the identical keystream (C1 ⊕ C2 = P1 ⊕ P2), leaking plaintext XOR differences, and destroying the Galois authenticator, allowing adversaries to forge valid tags and tamper with data undetected.</span>
              </button>
              <button type="button" class="knowledge-option-btn" data-correct="false">
                <span class="font-mono font-bold text-zinc-400 shrink-0">B.</span>
                <span>The WebCrypto API automatically revokes the private key certificate.</span>
              </button>
              <button type="button" class="knowledge-option-btn" data-correct="false">
                <span class="font-mono font-bold text-zinc-400 shrink-0">C.</span>
                <span>The CPU hardware registers overheat due to simultaneous Galois field multiplication collisions.</span>
              </button>
            </div>
            <div class="knowledge-feedback-banner bg-[#050505] border border-[#222222] text-xs font-mono"></div>
          </div>

          <!-- Challenge 3 -->
          <div class="knowledge-check-card aes-knowledge-card" data-quiz-id="aq3">
            <div class="flex items-center gap-2 text-xs font-mono text-brand-orange font-bold uppercase">
              <span>Challenge 03 // Standard Round Transformations</span>
            </div>
            <p class="text-xs text-white font-medium">
              What are the four official NIST FIPS 197 algebraic operations that comprise each standard round of AES encryption?
            </p>
            <div class="flex flex-col gap-2">
              <button type="button" class="knowledge-option-btn" data-correct="false">
                <span class="font-mono font-bold text-zinc-400 shrink-0">A.</span>
                <span>Modular Exponentiation, RSA Padding, SHA Hashing, and Feistel Splitting.</span>
              </button>
              <button type="button" class="knowledge-option-btn" data-correct="false">
                <span class="font-mono font-bold text-zinc-400 shrink-0">B.</span>
                <span>Bit Reversal, Compression Loop, Message Expansion, and Avalanche Permutation.</span>
              </button>
              <button type="button" class="knowledge-option-btn" data-correct="true">
                <span class="font-mono font-bold text-zinc-400 shrink-0">C.</span>
                <span>SubBytes (non-linear byte substitution), ShiftRows (cyclic row transposition), MixColumns (Galois Field matrix multiplication), and AddRoundKey (XOR key addition).</span>
              </button>
            </div>
            <div class="knowledge-feedback-banner bg-[#050505] border border-[#222222] text-xs font-mono"></div>
          </div>
        </div>

        <!-- Workflow Handoff Action Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <!-- Handoff to Encrypt -->
          <div class="p-3.5 bg-[#0D0D0D] border border-orange-500/30 rounded-lg flex flex-col justify-between gap-3">
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-brand-orange text-sm">lock</span>
                  Encrypt Studio Handoff
                </span>
                <span class="text-[10px] text-brand-orange font-bold">TAB 02</span>
              </div>
              <p class="text-[11px] text-zinc-400 leading-relaxed">
                Transition smoothly to Tab 02 (Encrypt). Automatically primes the plaintext workspace with an educational sample payload if empty, without performing silent key generation or unintended encryption.
              </p>
            </div>
            <button id="aes-handoff-encrypt-btn" class="w-full px-3 py-2 rounded bg-brand-orange hover:bg-orange-600 text-black font-bold text-xs uppercase cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm">
              <span>Try AES-GCM in Encrypt Studio</span>
              <span class="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </button>
          </div>

          <!-- Handoff to Decrypt -->
          <div class="p-3.5 bg-[#0D0D0D] border border-cyan-500/30 rounded-lg flex flex-col justify-between gap-3">
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-cyan-400 text-sm">lock_open</span>
                  Decrypt Studio Inspection
                </span>
                <span class="text-[10px] text-cyan-400 font-bold">TAB 03</span>
              </div>
              <p class="text-[11px] text-zinc-400 leading-relaxed">
                Navigate to Tab 03 (Decrypt) to test authenticated envelope decryption. Use the standard download/upload file workflow to verify authentic <code class="text-cyan-300">.castle</code> packages or observe authentication rejection on tampered envelopes.
              </p>
            </div>
            <button id="aes-handoff-decrypt-btn" class="w-full px-3 py-2 rounded bg-[#181818] hover:bg-zinc-800 text-zinc-200 border border-[#2A2A2A] hover:border-cyan-500/50 font-bold text-xs uppercase cursor-pointer transition-all flex items-center justify-center gap-2">
              <span>Inspect in Decrypt Studio</span>
              <span class="material-symbols-outlined text-sm text-cyan-400">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      <!-- ====================================================================
           DEEP-DIVE CRYPTOGRAPHY REFERENCE DRAWER (BACKWARD COMPATIBLE)
           ==================================================================== -->
      <details id="aes-theory-drawer" class="armor-plate p-3.5 rounded-lg border border-[#222] bg-[#0A0A0A] font-mono">
        <summary class="cursor-pointer text-xs font-bold text-brand-orange uppercase tracking-wider flex items-center justify-between">
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined text-base">menu_book</span>
            <span>Educational Reference & Theory (What, Why, How)</span>
          </span>
          <span class="text-[10px] text-zinc-500 font-normal">Click to expand theoretical lessons</span>
        </summary>

        <div class="mt-4 flex flex-col gap-3 pt-3 border-t border-[#1A1A1A]">
          <!-- Subtabs for legacy backward compatibility -->
          <div class="grid grid-cols-3 gap-2" role="tablist">
            <button id="learn-tab-what" role="tab" aria-controls="learn-what" aria-selected="true" class="p-2 rounded bg-brand-orange text-black font-bold text-xs uppercase cursor-pointer">WHAT</button>
            <button id="learn-tab-why" role="tab" aria-controls="learn-why" aria-selected="false" class="p-2 rounded bg-[#111] text-zinc-400 font-bold text-xs uppercase hover:text-white cursor-pointer">WHY</button>
            <button id="learn-tab-how" role="tab" aria-controls="learn-how" aria-selected="false" class="p-2 rounded bg-[#111] text-zinc-400 font-bold text-xs uppercase hover:text-white cursor-pointer">HOW</button>
          </div>

          <section id="learn-what" role="tabpanel" aria-labelledby="learn-tab-what" class="p-3 bg-[#050505] rounded border border-[#1A1A1A] flex flex-col gap-2 text-xs text-zinc-300">
            <h4 class="text-white font-bold">1. Encryption vs Hashing</h4>
            <p class="text-zinc-400 leading-relaxed">
              Encryption is a two-way mathematical process designed to hide sensitive plaintext inside unreadable ciphertext using a secret key, permitting full recovery upon decryption. Hashing is a one-way fingerprint designed to be mathematically irreversible.
            </p>
          </section>

          <section id="learn-why" role="tabpanel" aria-labelledby="learn-tab-why" class="hidden p-3 bg-[#050505] rounded border border-[#1A1A1A] flex flex-col gap-2 text-xs text-zinc-300">
            <h4 class="text-white font-bold">2. Why AES-256-GCM?</h4>
            <p class="text-zinc-400 leading-relaxed">
              Galois/Counter Mode (GCM) combines high-performance counter-mode encryption with GHASH universal hash authentication. It prevents ciphertext tampering and guarantees confidentiality plus integrity in one pass.
            </p>
            <p class="text-xs text-zinc-500 italic mt-1">
              Interactive ECB vs GCM pattern comparison is featured directly in Topic 07 above.
            </p>
          </section>

          <section id="learn-how" role="tabpanel" aria-labelledby="learn-tab-how" class="hidden p-3 bg-[#050505] rounded border border-[#1A1A1A] flex flex-col gap-2 text-xs text-zinc-300">
            <h4 class="text-white font-bold">3. How AES-256 Operates</h4>
            <p class="text-zinc-400 leading-relaxed">
              AES-256 executes 14 successive rounds of algebraic substitutions (SubBytes), cyclic row shifts (ShiftRows), Galois Field column mixing (MixColumns), and round-key injections (AddRoundKey).
            </p>
          </section>
        </div>
      </details>
      </div>


        <!-- Bottom Return Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#0A0A0A] border border-[#222222] rounded-xl text-xs font-mono mt-2 shadow-sm">
          <button id="aes-learn-lab-bottom-back" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141414] hover:bg-[#1E1E1E] text-zinc-300 hover:text-white border border-[#2E2E2E] text-xs font-bold transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>RETURN TO LEARN OVERVIEW</span>
          </button>
          <button id="aes-learn-lab-scroll-top" class="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs">
            <span class="material-symbols-outlined text-[15px]">arrow_upward</span>
            <span>BACK TO TOP</span>
          </button>
        </div>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // 5. CHAPTER 01 UPDATE LOGIC
  // ---------------------------------------------------------------------------
  function updateChapter01() {
    const rawBytes = Array.from(new TextEncoder().encode(state.inputText));
    const byteLen = rawBytes.length;

    // Byte counter
    const counterEl = document.getElementById('aes-pipe-byte-count');
    if (counterEl) {
      counterEl.textContent = `${byteLen} ${byteLen === 1 ? 'BYTE' : 'BYTES'} (UTF-8)`;
    }

    // Block fit indicator
    const blockFitEl = document.getElementById('aes-pipe-block-fit');
    if (blockFitEl) {
      if (byteLen === 0) {
        blockFitEl.textContent = 'Empty Buffer';
        blockFitEl.className = 'text-zinc-500';
      } else if (byteLen < 16) {
        blockFitEl.textContent = `1 Block (${16 - byteLen}B Visual Pad)`;
        blockFitEl.className = 'text-cyan-400';
      } else if (byteLen === 16) {
        blockFitEl.textContent = 'Exact 1 Block (16 Bytes)';
        blockFitEl.className = 'text-emerald-400';
      } else {
        const blocks = Math.ceil(byteLen / 16);
        blockFitEl.textContent = `${blocks} Blocks (CTR Stream)`;
        blockFitEl.className = 'text-brand-orange';
      }
    }

    // Stage 1 Description
    const stage1El = document.getElementById('aes-pipe-stage1-desc');
    if (stage1El) {
      stage1El.innerHTML = `Loaded <strong class="text-white">${byteLen} UTF-8 bytes</strong> from plaintext input. Buffer size: ${byteLen * 8} bits.`;
    }

    // Stage 3 Description
    const stage3El = document.getElementById('aes-pipe-stage3-desc');
    if (stage3El) {
      if (byteLen > 16) {
        stage3El.innerHTML = `<strong class="text-brand-orange">Multi-block CTR stream:</strong> 12-byte IV + counter increments across ${Math.ceil(byteLen / 16)} blocks. GHASH authenticates all bytes.`;
      } else {
        stage3El.innerHTML = `128-bit state cipher, 14 rounds with 256-bit key, 96-bit IV, counter streaming with 128-bit GHASH authentication tag.`;
      }
    }

    // Multi-block notice visibility
    const multiblockEl = document.getElementById('aes-pipe-multiblock-note');
    if (multiblockEl) {
      if (byteLen > 16) {
        multiblockEl.classList.remove('hidden');
      } else {
        multiblockEl.classList.add('hidden');
      }
    }

    // Update preset button active states
    ['castle', 'exact16', 'multiblock'].forEach(id => {
      const btn = document.getElementById(`aes-preset-${id}`);
      if (!btn) return;
      if (state.activePreset === id) {
        btn.className = 'px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer bg-brand-orange text-black border-brand-orange shadow-sm';
      } else {
        btn.className = 'px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer bg-[#0D0D0D] text-zinc-400 border-[#222222] hover:text-white';
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 6. CHAPTER 02 UPDATE LOGIC
  // ---------------------------------------------------------------------------
  function updateChapter02() {
    const { rawBytes, block, padCount } = getEducationalBlockBytes();

    // Multi-block label on matrix
    const matrixLabel = document.getElementById('aes-matrix-block-label');
    if (matrixLabel) {
      if (rawBytes.length > 16) {
        matrixLabel.textContent = `Block 0 (Bytes 0–15 Preview of ${rawBytes.length} Total Bytes)`;
      } else {
        matrixLabel.textContent = `Block 0 (16 Bytes)`;
      }
    }

    // 1. Render Linear Strip
    const stripContainer = document.getElementById('aes-linear-strip');
    if (stripContainer) {
      stripContainer.innerHTML = block.map((val, idx) => {
        const isPad = idx >= rawBytes.length;
        const isSelected = idx === state.selectedByteIndex;
        const hex = val.toString(16).padStart(2, '0').toUpperCase();
        const ascii = byteToAscii(val);

        let borderClass = 'border-[#222] bg-[#0A0A0A] text-zinc-300';
        if (isSelected) {
          borderClass = 'border-brand-orange bg-brand-orange/10 text-brand-orange ring-1 ring-brand-orange font-bold';
        } else if (isPad) {
          borderClass = 'border-dashed border-zinc-700 bg-[#050505] text-zinc-500';
        }

        return `
          <button data-linear-idx="${idx}" class="p-1 rounded border ${borderClass} flex flex-col items-center gap-0.5 font-mono text-center cursor-pointer transition-all hover:border-brand-orange" tabindex="0">
            <span class="text-[9px] text-zinc-500">${idx}</span>
            <span class="text-xs font-bold">${hex}</span>
            <span class="text-[9px] text-zinc-400">${isPad ? 'PAD' : ascii}</span>
          </button>
        `;
      }).join('');

      stripContainer.querySelectorAll('[data-linear-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.selectedByteIndex = parseInt(btn.dataset.linearIdx, 10);
          updateChapter02();
        });
      });
    }

    // 2. Render 4x4 State Matrix in Column-Major Order: s[r, c] = inputByte[r + 4*c]
    const cells = document.querySelectorAll('.aes-state-cell');
    cells.forEach(cell => {
      const r = parseInt(cell.dataset.row, 10);
      const c = parseInt(cell.dataset.col, 10);
      const linearIdx = r + 4 * c; // Column-major mapping rule!
      const byteVal = block[linearIdx];
      const isPad = linearIdx >= rawBytes.length;
      const isSelected = linearIdx === state.selectedByteIndex;

      cell.textContent = byteVal.toString(16).padStart(2, '0').toUpperCase();

      if (isSelected) {
        cell.className = 'aes-state-cell p-2 rounded border border-brand-orange bg-brand-orange/20 text-brand-orange ring-1 ring-brand-orange font-bold text-xs transition-all cursor-pointer shadow-sm';
      } else if (isPad) {
        cell.className = 'aes-state-cell p-2 rounded border border-dashed border-zinc-700 bg-[#050505] text-zinc-500 text-xs font-mono transition-all cursor-pointer hover:border-zinc-500';
      } else {
        cell.className = 'aes-state-cell p-2 rounded border border-[#222] bg-[#0A0A0A] text-white hover:border-brand-orange text-xs font-mono transition-all cursor-pointer';
      }
    });

    // 3. Update Cell Inspector
    const selIdx = state.selectedByteIndex;
    const selRow = selIdx % 4;
    const selCol = Math.floor(selIdx / 4);
    const selVal = block[selIdx];
    const isPad = selIdx >= rawBytes.length;
    const hexStr = selVal.toString(16).padStart(2, '0').toUpperCase();
    const binStr = selVal.toString(2).padStart(8, '0');
    const highNib = (selVal >> 4) & 0x0F;
    const lowNib = selVal & 0x0F;

    const inspectCoord = document.getElementById('aes-inspect-coord');
    if (inspectCoord) inspectCoord.textContent = `[Row ${selRow}, Col ${selCol}]`;

    const inspectLinear = document.getElementById('aes-inspect-linear');
    if (inspectLinear) inspectLinear.textContent = `Byte ${selIdx} / 15`;

    const inspectHex = document.getElementById('aes-inspect-hex');
    if (inspectHex) inspectHex.textContent = `0x${hexStr}`;

    const inspectBin = document.getElementById('aes-inspect-bin');
    if (inspectBin) inspectBin.textContent = binStr;

    const inspectAscii = document.getElementById('aes-inspect-ascii');
    if (inspectAscii) {
      if (isPad) {
        inspectAscii.textContent = '[ZERO-FILL PAD]';
        inspectAscii.className = 'text-zinc-500 font-bold text-xs';
      } else {
        const char = byteToAscii(selVal);
        inspectAscii.textContent = char === '·' ? '[NON-PRINTABLE]' : `'${char}'`;
        inspectAscii.className = 'text-emerald-400 font-bold text-sm';
      }
    }

    const inspectHigh = document.getElementById('aes-inspect-high');
    if (inspectHigh) {
      inspectHigh.textContent = `0x${highNib.toString(16).toUpperCase()} (${highNib.toString(2).padStart(4, '0')})`;
    }

    const inspectLow = document.getElementById('aes-inspect-low');
    if (inspectLow) {
      inspectLow.textContent = `0x${lowNib.toString(16).toUpperCase()} (${lowNib.toString(2).padStart(4, '0')})`;
    }

    const inspectStatus = document.getElementById('aes-inspect-status');
    if (inspectStatus) {
      if (isPad) {
        inspectStatus.textContent = 'Educational Zero-Fill Pad';
        inspectStatus.className = 'text-zinc-500 font-bold';
      } else {
        inspectStatus.textContent = 'Legitimate Ingress Byte';
        inspectStatus.className = 'text-emerald-400 font-bold';
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 7. CHAPTER 03 UPDATE LOGIC (ROUND SIMULATOR & S-BOX)
  // ---------------------------------------------------------------------------
  function updateChapter03() {
    const trace = getActiveTrace();
    const roundIdx = state.activeRound;
    const roundData = trace.rounds[roundIdx];
    const stepsCount = roundData.steps.length;

    // Ensure step index stays in bounds
    if (state.activeStep >= stepsCount) {
      state.activeStep = Math.max(0, stepsCount - 1);
    }
    const stepIdx = state.activeStep;
    const currentStep = roundData.steps[stepIdx];

    // 1. Vector Mode Toggle UI
    const nistBtn = document.getElementById('aes-sim-mode-nist');
    const customBtn = document.getElementById('aes-sim-mode-custom');
    const katBanner = document.getElementById('aes-kat-status-banner');
    if (nistBtn && customBtn) {
      if (state.simVectorMode === 'nist') {
        nistBtn.className = 'px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer bg-brand-orange text-black border-brand-orange shadow-sm';
        customBtn.className = 'px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer bg-[#0D0D0D] text-zinc-400 border-[#222222] hover:text-white';
        if (katBanner) {
          katBanner.className = 'p-3 bg-[#051108] border border-emerald-500/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-emerald-400';
          katBanner.innerHTML = `
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-base text-emerald-400">verified</span>
              <span><strong>NIST FIPS 197 C.3 KAT Status:</strong> Validated Appendix C.3 AES-256 Known-Answer Test.</span>
            </div>
            <div class="text-[11px] text-zinc-400">
              Expected Ciphertext: <code class="text-emerald-300 font-bold">8ea2b7ca516745bfeafc49904b496089</code>
            </div>
          `;
        }
      } else {
        customBtn.className = 'px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer bg-brand-orange text-black border-brand-orange shadow-sm';
        nistBtn.className = 'px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer bg-[#0D0D0D] text-zinc-400 border-[#222222] hover:text-white';
        if (katBanner) {
          katBanner.className = 'p-3 bg-[#110A05] border border-orange-500/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-brand-orange';
          katBanner.innerHTML = `
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-base text-brand-orange">science</span>
              <span><strong>Custom Block Simulation Mode:</strong> Transforming Block 0 from Chapter 02 through 14 genuine AES rounds.</span>
            </div>
            <div class="text-[11px] text-zinc-400">
              Key: Derived 256-bit demonstration key schedule.
            </div>
          `;
        }
      }
    }

    // 2. Round Indicator
    const indicatorEl = document.getElementById('aes-round-indicator');
    if (indicatorEl) {
      indicatorEl.textContent = `AES-256 | Round ${roundIdx} / 14`;
    }

    // 3. Round Schedule Timeline Buttons (R0..R14)
    const timelineContainer = document.getElementById('aes-round-timeline');
    if (timelineContainer) {
      timelineContainer.innerHTML = trace.rounds.map((_, r) => {
        const isCurrent = r === roundIdx;
        let btnClass = 'p-1.5 text-xs font-mono rounded border border-[#222] bg-[#0A0A0A] text-zinc-400 hover:text-white hover:border-zinc-500 cursor-pointer transition-all';
        if (isCurrent) {
          btnClass = 'p-1.5 text-xs font-mono font-bold rounded border border-brand-orange bg-brand-orange text-black shadow-sm';
        } else if (r === 14) {
          btnClass = 'p-1.5 text-xs font-mono rounded border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 hover:border-emerald-400 cursor-pointer transition-all';
        }

        return `
          <button data-round-btn="${r}" class="${btnClass}">R${r}</button>
        `;
      }).join('');

      timelineContainer.querySelectorAll('[data-round-btn]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.activeRound = parseInt(btn.dataset.roundBtn, 10);
          state.activeStep = 0;
          updateChapter03();
        });
      });
    }

    // 4. Step Pills for Current Round
    const stepPillsContainer = document.getElementById('aes-step-pills');
    if (stepPillsContainer) {
      stepPillsContainer.innerHTML = roundData.steps.map((st, i) => {
        const isStepActive = i === stepIdx;
        let pillClass = 'px-2 py-0.5 rounded font-mono text-[10px] font-bold border border-[#222] bg-[#0A0A0A] text-zinc-400 hover:text-white cursor-pointer';
        if (isStepActive) {
          pillClass = 'px-2 py-0.5 rounded font-mono text-[10px] font-bold border border-brand-orange bg-brand-orange/20 text-brand-orange';
        }
        return `
          <button data-step-btn="${i}" class="${pillClass}">
            ${st.name}
          </button>
        `;
      }).join('');

      stepPillsContainer.querySelectorAll('[data-step-btn]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.activeStep = parseInt(btn.dataset.stepBtn, 10);
          updateChapter03();
        });
      });
    }

    // 5. Update Step Details
    const titleEl = document.getElementById('aes-step-title');
    if (titleEl) titleEl.textContent = currentStep.title;

    const eqEl = document.getElementById('aes-step-eq');
    if (eqEl) eqEl.textContent = currentStep.eq;

    const descEl = document.getElementById('aes-step-desc');
    if (descEl) descEl.textContent = currentStep.desc;

    const arrowOp = document.getElementById('aes-arrow-op-label');
    if (arrowOp) arrowOp.textContent = currentStep.name;

    // R14 omission callout
    const r14Callout = document.getElementById('aes-r14-omission-note');
    if (r14Callout) {
      if (roundIdx === 14) {
        r14Callout.classList.remove('hidden');
      } else {
        r14Callout.classList.add('hidden');
      }
    }

    // 6. Dual 4x4 Matrices: Before and After
    render4x4Grid('aes-matrix-before', currentStep.inState);
    render4x4Grid('aes-matrix-after', currentStep.outState);

    // 7. Round Key Card
    const roundKeyCard = document.getElementById('aes-round-key-card');
    const roundKeyLabel = document.getElementById('aes-round-key-label');
    const roundKeyHex = document.getElementById('aes-round-key-hex');
    if (roundKeyCard && roundKeyLabel && roundKeyHex) {
      if (currentStep.name === 'AddRoundKey') {
        roundKeyCard.classList.remove('hidden');
        roundKeyLabel.textContent = `Round Key ${roundIdx}`;
        roundKeyHex.textContent = bytesToHex(roundData.roundKey);
      } else {
        roundKeyCard.classList.add('hidden');
      }
    }

    // 8. Next Step Button Label
    const nextStepBtn = document.getElementById('aes-round-next');
    if (nextStepBtn) {
      nextStepBtn.textContent = `NEXT STEP (${stepIdx + 1}/${stepsCount}) ⏭`;
    }

    // 9. Update S-Box Crosshairs
    updateSboxDisplay();
  }

  // Render a 16-byte array into a 4x4 column-major grid inside targetId
  function render4x4Grid(targetId, byteArr) {
    const el = document.getElementById(targetId);
    if (!el) return;

    let html = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = byteArr[r + 4 * c];
        const hex = val.toString(16).padStart(2, '0').toUpperCase();
        html += `<span class="p-1 border border-[#1F1F1F] rounded bg-[#0A0A0A] font-mono text-zinc-300 font-bold">${hex}</span>`;
      }
    }
    el.innerHTML = html;
  }

  // ---------------------------------------------------------------------------
  // 8. INTERACTIVE FIPS 197 S-BOX TABLE
  // ---------------------------------------------------------------------------
  function updateSboxDisplay() {
    const byteVal = state.activeSboxByte & 0xFF;
    const highNib = (byteVal >> 4) & 0x0F;
    const lowNib = byteVal & 0x0F;
    const outByte = OFFICIAL_SBOX[byteVal];

    // Banner elements
    const targetHex = document.getElementById('aes-sbox-target-hex');
    if (targetHex) targetHex.textContent = '0x' + byteVal.toString(16).padStart(2, '0').toUpperCase();

    const targetRow = document.getElementById('aes-sbox-target-row');
    if (targetRow) targetRow.textContent = highNib.toString(16).toUpperCase();

    const targetCol = document.getElementById('aes-sbox-target-col');
    if (targetCol) targetCol.textContent = lowNib.toString(16).toUpperCase();

    const targetOut = document.getElementById('aes-sbox-target-out');
    if (targetOut) targetOut.textContent = '0x' + outByte.toString(16).padStart(2, '0').toUpperCase();

    // Render 16x16 table rows if not yet built or update crosshairs
    const tbody = document.getElementById('aes-sbox-tbody');
    if (!tbody) return;

    let rowsHtml = '';
    for (let r = 0; r < 16; r++) {
      const isRowActive = r === highNib;
      const rowHeaderHex = r.toString(16).toUpperCase();
      let rowHeaderClass = 'p-1 font-bold border-r border-[#222] bg-[#111] text-zinc-400';
      if (isRowActive) {
        rowHeaderClass = 'p-1 font-bold border-r border-brand-orange bg-brand-orange/20 text-brand-orange';
      }

      rowsHtml += `<tr class="${isRowActive ? 'bg-orange-500/5' : ''}">`;
      rowsHtml += `<td class="${rowHeaderClass}">${rowHeaderHex}</td>`;

      for (let c = 0; c < 16; c++) {
        const curByte = (r << 4) | c;
        const curOut = OFFICIAL_SBOX[curByte];
        const hex = curOut.toString(16).padStart(2, '0').toUpperCase();
        const isTarget = r === highNib && c === lowNib;
        const isColActive = c === lowNib;

        let cellClass = 'p-1 border border-[#1A1A1A] text-zinc-400 hover:bg-zinc-800 cursor-pointer transition-all';
        if (isTarget) {
          cellClass = 'p-1 border border-brand-orange bg-brand-orange text-black font-bold shadow-md';
        } else if (isRowActive || isColActive) {
          cellClass = 'p-1 border border-[#262626] bg-[#161616] text-white font-semibold cursor-pointer';
        }

        rowsHtml += `
          <td data-sbox-cell="${curByte}" class="${cellClass}" tabindex="0" title="Input: 0x${curByte.toString(16).padStart(2, '0').toUpperCase()} → Output: 0x${hex}">
            ${hex}
          </td>
        `;
      }
      rowsHtml += `</tr>`;
    }
    tbody.innerHTML = rowsHtml;

    // Attach click listeners on S-Box cells
    tbody.querySelectorAll('[data-sbox-cell]').forEach(td => {
      td.addEventListener('click', () => {
        state.activeSboxByte = parseInt(td.dataset.sboxCell, 10);
        const searchInput = document.getElementById('aes-sbox-search');
        if (searchInput) {
          searchInput.value = state.activeSboxByte.toString(16).padStart(2, '0').toUpperCase();
        }
        updateSboxDisplay();
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 7. CHAPTER 04 LOGIC: KEY-SIZE COMPARISON (STAGE A3)
  // ---------------------------------------------------------------------------
  function selectKeyVariant(variantId) {
    if (!AES_VARIANTS[variantId]) return;
    state.activeKeyVariant = variantId;
    updateChapter04();
  }

  function updateChapter04() {
    if (typeof document === 'undefined') return;
    const v = AES_VARIANTS[state.activeKeyVariant];
    if (!v) return;

    // 1. Update variant tab buttons
    ['128', '192', '256'].forEach(id => {
      const btn = document.getElementById(`aes-key-var-${id}`);
      if (!btn) return;
      const isSel = id === state.activeKeyVariant;
      btn.setAttribute('aria-selected', isSel ? 'true' : 'false');
      btn.className = isSel
        ? 'px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer bg-brand-orange text-black border-brand-orange'
        : 'px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer bg-[#0D0D0D] text-zinc-400 border-[#222] hover:text-white';
    });

    // 2. Update visual proportional bar
    const bar = document.getElementById('aes-key-var-bar');
    const barLabel = document.getElementById('aes-key-var-bar-label');
    if (bar) {
      bar.style.width = `${v.barPercent}%`;
      bar.setAttribute('aria-valuenow', v.barPercent);
    }
    if (barLabel) {
      barLabel.textContent = `${v.keyBits} BITS (${v.keyBytes} BYTES) — ${v.barPercent}% RELATIVE KEY BIT LENGTH`;
    }

    // 3. Update 5 metric cards
    const lenEl = document.getElementById('aes-key-var-len');
    const roundsEl = document.getElementById('aes-key-var-rounds');
    const wordsEl = document.getElementById('aes-key-var-words');
    const keysEl = document.getElementById('aes-key-var-keys');
    const blockEl = document.getElementById('aes-key-var-block');

    if (lenEl) lenEl.textContent = `${v.keyBits} bits (${v.keyBytes} B)`;
    if (roundsEl) roundsEl.textContent = `${v.rounds} Rounds`;
    if (wordsEl) wordsEl.textContent = `${v.expandedWords} Words (${v.expandedBytes} B)`;
    if (keysEl) keysEl.textContent = `${v.roundKeys} Keys (K₀–K${v.rounds})`;
    if (blockEl) blockEl.textContent = `${v.blockSizeBits} bits (16 B)`;

    // 4. Update description, search space, and comparison details
    const descEl = document.getElementById('aes-key-var-desc');
    const secEl = document.getElementById('aes-key-var-sec');
    const spaceEl = document.getElementById('aes-key-var-space');
    const compEl = document.getElementById('aes-key-var-comp');

    if (descEl) descEl.textContent = v.desc;
    if (secEl) secEl.textContent = v.securityMargin;
    if (spaceEl) spaceEl.textContent = v.searchSpace;
    if (compEl) compEl.textContent = v.comparison;

    // 5. Highlight table columns
    ['128', '192', '256'].forEach(id => {
      const th = document.getElementById(`aes-th-var-${id}`);
      if (th) {
        th.className = id === state.activeKeyVariant
          ? 'p-2 text-center text-brand-orange font-bold bg-orange-500/10'
          : 'p-2 border-r border-[#222] text-center text-zinc-400';
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 8. CHAPTER 05 LOGIC: GENUINE AES-GCM TAMPER LAB (STAGE A4)
  // ---------------------------------------------------------------------------
  async function runGcmLabEncrypt() {
    const webCrypto = (typeof window !== 'undefined' && window.crypto && window.crypto.subtle)
      ? window.crypto
      : (typeof crypto !== 'undefined' && crypto.subtle ? crypto : null);

    if (!webCrypto || !webCrypto.subtle) {
      return;
    }

    // Monotonic sequence token to guard against race conditions
    state.gcmLab.opSeq = (state.gcmLab.opSeq || 0) + 1;
    const currentOp = state.gcmLab.opSeq;

    const ptInput = document.getElementById('aes-gcm-plaintext-input');
    const aadInput = document.getElementById('aes-gcm-aad-input');
    const aadToggle = document.getElementById('aes-gcm-use-aad-toggle');

    // Allow genuine empty string input for zero-length ciphertext testing
    if (ptInput) {
      state.gcmLab.samplePlaintext = (typeof ptInput.value === 'string')
        ? ptInput.value
        : 'TACTICAL MISSION BRIEFING: VERIFY INTEGRITY BEFORE LAUNCH';
    }
    if (aadInput) state.gcmLab.aadText = (typeof aadInput.value === 'string') ? aadInput.value : 'hdr:v=1';
    if (aadToggle) state.gcmLab.useAad = aadToggle.checked;

    const ptBytes = new TextEncoder().encode(state.gcmLab.samplePlaintext);
    const aadBytes = state.gcmLab.useAad ? new TextEncoder().encode(state.gcmLab.aadText) : new Uint8Array(0);

    // Generate fresh random 256-bit key and fresh random 96-bit IV
    state.gcmLab.rawKey = webCrypto.getRandomValues(new Uint8Array(32));
    const importedKey = await webCrypto.subtle.importKey(
      'raw',
      state.gcmLab.rawKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
    if (currentOp !== state.gcmLab.opSeq) return;
    state.gcmLab.cryptoKey = importedKey;
    state.gcmLab.iv = webCrypto.getRandomValues(new Uint8Array(12));

    const encParams = {
      name: 'AES-GCM',
      iv: state.gcmLab.iv,
      tagLength: 128
    };
    if (state.gcmLab.useAad && aadBytes.byteLength > 0) {
      encParams.additionalData = aadBytes;
    }

    const encryptedBuffer = await webCrypto.subtle.encrypt(encParams, state.gcmLab.cryptoKey, ptBytes);
    if (currentOp !== state.gcmLab.opSeq) return;

    const combined = new Uint8Array(encryptedBuffer);
    state.gcmLab.ciphertext = combined.slice(0, combined.length - 16);
    state.gcmLab.tag = combined.slice(combined.length - 16);

    state.gcmLab.activeScenario = 'valid';
    updateChapter05Components();
    await runGcmLabDecrypt('valid');
  }

  function updateChapter05Components() {
    if (typeof document === 'undefined') return;

    const keyEl = document.getElementById('aes-gcm-key-display');
    const ivEl = document.getElementById('aes-gcm-iv-display');
    const ctEl = document.getElementById('aes-gcm-ct-display');
    const ctLenBadge = document.getElementById('aes-gcm-ct-len-badge');
    const tagEl = document.getElementById('aes-gcm-tag-display');

    if (keyEl && state.gcmLab.rawKey) {
      keyEl.textContent = bytesToHex(Array.from(state.gcmLab.rawKey));
    }
    if (ivEl && state.gcmLab.iv) {
      ivEl.textContent = bytesToHex(Array.from(state.gcmLab.iv));
    }
    if (ctEl && state.gcmLab.ciphertext) {
      ctEl.textContent = state.gcmLab.ciphertext.length > 0
        ? bytesToHex(Array.from(state.gcmLab.ciphertext))
        : '(0-byte stream / empty)';
    }
    if (ctLenBadge && state.gcmLab.ciphertext) {
      ctLenBadge.textContent = `${state.gcmLab.ciphertext.length} BYTES`;
    }
    if (tagEl && state.gcmLab.tag) {
      tagEl.textContent = bytesToHex(Array.from(state.gcmLab.tag));
    }
  }

  async function runGcmLabDecrypt(scenario) {
    const webCrypto = (typeof window !== 'undefined' && window.crypto && window.crypto.subtle)
      ? window.crypto
      : (typeof crypto !== 'undefined' && crypto.subtle ? crypto : null);

    if (!webCrypto || !webCrypto.subtle) return;
    if (!state.gcmLab.cryptoKey || !state.gcmLab.ciphertext || !state.gcmLab.tag) return;

    // Monotonic sequence token to prevent out-of-order promise resolution
    state.gcmLab.opSeq = (state.gcmLab.opSeq || 0) + 1;
    const currentOp = state.gcmLab.opSeq;

    state.gcmLab.activeScenario = scenario;

    let testCt = state.gcmLab.ciphertext.slice();
    let testTag = state.gcmLab.tag.slice();
    let testAad = state.gcmLab.useAad ? new TextEncoder().encode(state.gcmLab.aadText) : new Uint8Array(0);

    let scenarioTitle = '';
    let scenarioDesc = '';

    if (scenario === 'valid') {
      scenarioTitle = 'Authentic Payload (Untouched)';
      scenarioDesc = 'Ciphertext, 128-bit authentication tag, and AAD are completely authentic. Web Crypto verified tag T = GHASH(H, A, C) ⊕ AES_K(J0) and successfully released the plaintext buffer.';
    } else if (scenario === 'tamper_ct') {
      scenarioTitle = 'Ciphertext Tampering (Bit-Flip in Stream)';
      // SEC-A4-02: If ciphertext contains bytes, flip bit 0 of byte 0; if empty, mutate tag instead
      if (testCt.length > 0) {
        testCt[0] ^= 0x01;
        scenarioDesc = 'A single bit in the ciphertext stream was inverted. Web Crypto recalculated the GHASH universal hash over the altered ciphertext, resulting in a tag mismatch. Decryption was immediately aborted.';
      } else {
        testTag[0] ^= 0x01;
        scenarioDesc = 'The ciphertext payload is empty (0 bytes). To demonstrate tampering on an empty message, a bit in the authentication tag was inverted. Web Crypto detected the tag disparity and rejected the message without decrypting.';
      }
    } else if (scenario === 'tamper_tag') {
      scenarioTitle = 'Authentication Tag Tampering (Corrupted Tag)';
      // Flip bit 0 of byte 0 in authentication tag
      testTag[0] ^= 0x01;
      scenarioDesc = 'A bit in the 128-bit authentication tag was inverted while ciphertext remained untouched. Web Crypto detected the tag disparity and rejected the message without decrypting.';
    } else if (scenario === 'tamper_aad') {
      scenarioTitle = 'AAD Header Tampering (Corrupted Metadata)';
      // SEC-A4-01: Construct intentionally modified AAD bytes
      testAad = new TextEncoder().encode((state.gcmLab.aadText || 'hdr') + '_CORRUPTED');
      if (state.gcmLab.useAad) {
        scenarioDesc = 'The Additional Authenticated Data (AAD) header was modified. Although AAD is transmitted unencrypted, it is authenticated by the GHASH function. Any alteration to AAD causes immediate authentication rejection.';
      } else {
        scenarioDesc = 'Additional Authenticated Data (AAD) was disabled during encryption, but unexpected AAD was supplied during decryption. Because the authentication tag was calculated over zero AAD bytes, supplying unexpected AAD during decryption alters GHASH and causes immediate authentication rejection.';
      }
    }

    // Assemble payload: Web Crypto decrypt expects combined [ciphertext, tag]
    const testPayload = new Uint8Array(testCt.length + testTag.length);
    testPayload.set(testCt, 0);
    testPayload.set(testTag, testCt.length);

    const decParams = {
      name: 'AES-GCM',
      iv: state.gcmLab.iv,
      tagLength: 128
    };

    // SEC-A4-01: Pass modified AAD if AAD was enabled OR if this is the tamper_aad scenario
    if ((state.gcmLab.useAad || scenario === 'tamper_aad') && testAad.byteLength > 0) {
      decParams.additionalData = testAad;
    }

    let authSuccess = false;
    let recoveredPlaintext = null;
    let errorDetail = null;

    try {
      const decBuf = await webCrypto.subtle.decrypt(decParams, state.gcmLab.cryptoKey, testPayload);
      if (currentOp !== state.gcmLab.opSeq) return;
      recoveredPlaintext = new TextDecoder().decode(decBuf);
      authSuccess = true;
    } catch (err) {
      if (currentOp !== state.gcmLab.opSeq) return;
      authSuccess = false;
      errorDetail = err.name || 'OperationError';
      // CRITICAL RULE: NEVER DISPLAY OR STORE UNAUTHENTICATED PLAINTEXT ON FAILURE
      recoveredPlaintext = null;
    }

    if (currentOp !== state.gcmLab.opSeq) return;

    state.gcmLab.lastDecryptResult = {
      scenario,
      authSuccess,
      recoveredPlaintext,
      errorDetail,
      scenarioTitle,
      scenarioDesc
    };

    updateChapter05Result();
  }

  function updateChapter05Result() {
    if (typeof document === 'undefined') return;
    const res = state.gcmLab.lastDecryptResult;
    if (!res) return;

    // Update scenario button styles
    ['valid', 'ct', 'tag', 'aad'].forEach(key => {
      const btn = document.getElementById(`aes-gcm-scen-${key}`);
      if (!btn) return;
      const isSel = (key === 'valid' && res.scenario === 'valid') ||
                    (key === 'ct' && res.scenario === 'tamper_ct') ||
                    (key === 'tag' && res.scenario === 'tamper_tag') ||
                    (key === 'aad' && res.scenario === 'tamper_aad');
      btn.setAttribute('aria-pressed', isSel ? 'true' : 'false');
      if (isSel) {
        btn.className = 'px-2.5 py-2 rounded text-xs font-bold uppercase transition-all border cursor-pointer bg-brand-orange text-black border-brand-orange text-left flex flex-col gap-0.5 shadow-sm';
      } else {
        btn.className = 'px-2.5 py-2 rounded text-xs font-bold uppercase transition-all border cursor-pointer bg-[#0D0D0D] text-zinc-300 border-[#222] hover:text-white text-left flex flex-col gap-0.5';
      }
    });

    const card = document.getElementById('aes-gcm-result-card');
    const badge = document.getElementById('aes-gcm-auth-badge');
    const icon = document.getElementById('aes-gcm-auth-icon');
    const recoveredBox = document.getElementById('aes-gcm-recovered-plaintext');
    const matchStatus = document.getElementById('aes-gcm-byte-match-status');
    const descEl = document.getElementById('aes-gcm-scenario-desc');

    if (res.authSuccess) {
      if (card) {
        card.className = 'p-3.5 bg-[#050505] border border-emerald-500/30 rounded-lg flex flex-col gap-3';
      }
      if (badge) {
        badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-500/40';
        badge.textContent = 'AUTHENTICATION SUCCEEDED';
      }
      if (icon) {
        icon.className = 'material-symbols-outlined text-emerald-400 text-lg';
        icon.textContent = 'check_circle';
      }
      if (recoveredBox) {
        recoveredBox.className = 'p-2.5 bg-black rounded border border-emerald-500/40 text-xs text-white font-mono break-all min-h-12 flex items-center';
        recoveredBox.textContent = res.recoveredPlaintext;
      }
      if (matchStatus) {
        matchStatus.className = 'text-[10px] text-emerald-400 flex items-center gap-1';
        matchStatus.innerHTML = '<span class="material-symbols-outlined text-sm">verified</span><span>Original bytes perfectly recovered (Byte-for-byte exact match)</span>';
      }
    } else {
      if (card) {
        card.className = 'p-3.5 bg-[#050505] border border-red-500/30 rounded-lg flex flex-col gap-3';
      }
      if (badge) {
        badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950/60 text-red-400 border border-red-500/40';
        badge.textContent = 'AUTHENTICATION FAILED';
      }
      if (icon) {
        icon.className = 'material-symbols-outlined text-red-400 text-lg';
        icon.textContent = 'error';
      }
      if (recoveredBox) {
        recoveredBox.className = 'p-2.5 bg-black rounded border border-red-500/40 text-xs text-red-400 font-mono break-all min-h-12 flex items-center';
        recoveredBox.textContent = '[RESTRICTED / PURGED: Decryption aborted by Web Crypto. Authentication tag mismatch in Galois Field. No unauthenticated plaintext displayed.]';
      }
      if (matchStatus) {
        matchStatus.className = 'text-[10px] text-red-400 flex items-center gap-1';
        matchStatus.innerHTML = '<span class="material-symbols-outlined text-sm">block</span><span>Integrity check rejected: Plaintext buffer withheld to preserve confidentiality.</span>';
      }
    }

    if (descEl) {
      descEl.textContent = res.scenarioDesc;
    }
  }

  // ---------------------------------------------------------------------------
  // 9. CHAPTER 06 LOGIC: PRODUCTION WORKFLOW HANDOFFS (STAGE A5)
  // ---------------------------------------------------------------------------
  function handoffToEncrypt() {
    if (root.CastleAESUI && typeof root.CastleAESUI.selectTab === 'function') {
      root.CastleAESUI.selectTab('encrypt');
    }

    const plainTextEl = document.getElementById('aes-plain-text');
    if (plainTextEl) {
      // If empty, populate safe educational sample payload
      if (!plainTextEl.value || plainTextEl.value.trim() === '') {
        plainTextEl.value = '[EDUCATIONAL SAMPLE] Tactical encrypted payload test vector from AES Studio Learn Lab.';
        // Dispatch input event so character counters/analysis update
        plainTextEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
      plainTextEl.focus();
    }
  }

  function handoffToDecrypt() {
    if (root.CastleAESUI && typeof root.CastleAESUI.selectTab === 'function') {
      root.CastleAESUI.selectTab('decrypt');
    }

    const cipherTextEl = document.getElementById('aes-cipher-text');
    if (cipherTextEl) {
      cipherTextEl.focus();
    }
  }

  // ---------------------------------------------------------------------------
  // 10. EVENT BINDING & INTERACTIVITY
  // ---------------------------------------------------------------------------
  function bindEvents() {

    // 0. Learn Navigation Sub-Views (Landing, What & Why Theory, Hands-on Lab)
    const chooseTheoryBtn = document.getElementById('aes-learn-btn-choose-theory');
    const chooseTheoryCard = document.getElementById('aes-learn-card-theory');
    if (chooseTheoryBtn) chooseTheoryBtn.addEventListener('click', (e) => { e.stopPropagation(); setLearnView('theory'); });
    if (chooseTheoryCard) {
      chooseTheoryCard.addEventListener('click', () => setLearnView('theory'));
      chooseTheoryCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLearnView('theory'); }
      });
    }

    const chooseLabBtn = document.getElementById('aes-learn-btn-choose-lab');
    const chooseLabCard = document.getElementById('aes-learn-card-lab');
    if (chooseLabBtn) chooseLabBtn.addEventListener('click', (e) => { e.stopPropagation(); setLearnView('lab'); });
    if (chooseLabCard) {
      chooseLabCard.addEventListener('click', () => setLearnView('lab'));
      chooseLabCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLearnView('lab'); }
      });
    }

    const theoryBackBtn = document.getElementById('aes-learn-theory-back');
    if (theoryBackBtn) theoryBackBtn.addEventListener('click', () => setLearnView('landing'));

    const theoryBottomBackBtn = document.getElementById('aes-learn-theory-bottom-back');
    if (theoryBottomBackBtn) theoryBottomBackBtn.addEventListener('click', () => setLearnView('landing'));

    const labBackBtn = document.getElementById('aes-learn-lab-back');
    if (labBackBtn) labBackBtn.addEventListener('click', () => setLearnView('landing'));

    const labBottomBackBtn = document.getElementById('aes-learn-lab-bottom-back');
    if (labBottomBackBtn) labBottomBackBtn.addEventListener('click', () => setLearnView('landing'));

    const theoryToLabBtn = document.getElementById('aes-learn-theory-to-lab');
    if (theoryToLabBtn) theoryToLabBtn.addEventListener('click', () => setLearnView('lab'));

    const theoryBottomToLabBtn = document.getElementById('aes-learn-theory-bottom-to-lab');
    if (theoryBottomToLabBtn) theoryBottomToLabBtn.addEventListener('click', () => setLearnView('lab'));

    const labToTheoryBtn = document.getElementById('aes-learn-lab-to-theory');
    if (labToTheoryBtn) labToTheoryBtn.addEventListener('click', () => setLearnView('theory'));

    const theoryScrollTop = document.getElementById('aes-learn-theory-scroll-top');
    if (theoryScrollTop) {
      theoryScrollTop.addEventListener('click', () => {
        const modal = document.getElementById('aes-studio-modal');
        if (modal) {
          const scrollable = modal.querySelector('.overflow-y-auto');
          if (scrollable) scrollable.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    const labScrollTop = document.getElementById('aes-learn-lab-scroll-top');
    if (labScrollTop) {
      labScrollTop.addEventListener('click', () => {
        const modal = document.getElementById('aes-studio-modal');
        if (modal) {
          const scrollable = modal.querySelector('.overflow-y-auto');
          if (scrollable) scrollable.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    // 1. Text input listener on #aes-round-input
    const inputEl = document.getElementById('aes-round-input');
    if (inputEl) {
      inputEl.addEventListener('input', () => {
        state.inputText = inputEl.value;
        state.activePreset = 'custom';
        updateChapter01();
        updateChapter02();
        if (state.simVectorMode === 'custom') {
          updateChapter03();
        }
      });
    }

    // 2. Preset buttons
    ['castle', 'exact16', 'multiblock'].forEach(id => {
      const btn = document.getElementById(`aes-preset-${id}`);
      if (btn) {
        btn.addEventListener('click', () => {
          const p = PRESETS[id];
          state.activePreset = id;
          state.inputText = p.text;
          if (inputEl) inputEl.value = p.text;
          updateChapter01();
          updateChapter02();
          if (state.simVectorMode === 'custom') {
            updateChapter03();
          }
        });
      }
    });

    // 3. Matrix cell clicking
    document.querySelectorAll('.aes-state-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const r = parseInt(cell.dataset.row, 10);
        const c = parseInt(cell.dataset.col, 10);
        state.selectedByteIndex = r + 4 * c;
        updateChapter02();
      });
    });

    // 4. "Inspect in S-Box" button
    const inspectSboxBtn = document.getElementById('aes-inspect-sbox-btn');
    if (inspectSboxBtn) {
      inspectSboxBtn.addEventListener('click', () => {
        const { block } = getEducationalBlockBytes();
        state.activeSboxByte = block[state.selectedByteIndex];
        const searchInput = document.getElementById('aes-sbox-search');
        if (searchInput) {
          searchInput.value = state.activeSboxByte.toString(16).padStart(2, '0').toUpperCase();
        }
        updateSboxDisplay();
        const sboxSection = document.getElementById('aes-sbox-section');
        if (sboxSection) {
          sboxSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // 5. Simulator Vector Mode Toggle
    const nistBtn = document.getElementById('aes-sim-mode-nist');
    const customBtn = document.getElementById('aes-sim-mode-custom');
    if (nistBtn && customBtn) {
      nistBtn.addEventListener('click', () => {
        state.simVectorMode = 'nist';
        state.activeRound = 0;
        state.activeStep = 0;
        updateChapter03();
      });
      customBtn.addEventListener('click', () => {
        state.simVectorMode = 'custom';
        state.activeRound = 0;
        state.activeStep = 0;
        updateChapter03();
      });
    }

    // 6. Stepper Controls
    const prevStepBtn = document.getElementById('aes-round-prev-step');
    if (prevStepBtn) {
      prevStepBtn.addEventListener('click', () => {
        if (state.activeStep > 0) {
          state.activeStep--;
        } else if (state.activeRound > 0) {
          state.activeRound--;
          const trace = getActiveTrace();
          state.activeStep = trace.rounds[state.activeRound].steps.length - 1;
        }
        updateChapter03();
      });
    }

    const nextStepBtn = document.getElementById('aes-round-next');
    if (nextStepBtn) {
      nextStepBtn.addEventListener('click', () => {
        const trace = getActiveTrace();
        const stepsCount = trace.rounds[state.activeRound].steps.length;
        if (state.activeStep < stepsCount - 1) {
          state.activeStep++;
        } else if (state.activeRound < 14) {
          state.activeRound++;
          state.activeStep = 0;
        }
        updateChapter03();
      });
    }

    const nextRoundBtn = document.getElementById('aes-round-skip');
    if (nextRoundBtn) {
      nextRoundBtn.addEventListener('click', () => {
        if (state.activeRound < 14) {
          state.activeRound++;
          state.activeStep = 0;
        }
        updateChapter03();
      });
    }

    const resetSimBtn = document.getElementById('aes-sim-reset-btn');
    if (resetSimBtn) {
      resetSimBtn.addEventListener('click', () => {
        state.activeRound = 0;
        state.activeStep = 0;
        updateChapter03();
      });
    }

    // 7. S-Box search input
    const sboxSearch = document.getElementById('aes-sbox-search');
    if (sboxSearch) {
      sboxSearch.addEventListener('input', () => {
        const val = sboxSearch.value.trim();
        if (/^[0-9a-fA-F]{1,2}$/.test(val)) {
          state.activeSboxByte = parseInt(val, 16);
          updateSboxDisplay();
        }
      });
    }

    // 8. S-Box quick test buttons
    document.querySelectorAll('[data-sbox-test]').forEach(btn => {
      btn.addEventListener('click', () => {
        const hex = btn.dataset.sboxTest;
        state.activeSboxByte = parseInt(hex, 16);
        if (sboxSearch) sboxSearch.value = hex.toUpperCase();
        updateSboxDisplay();
      });
    });

    // 9. Chapter 04: Variant selector tabs & keyboard navigation
    ['128', '192', '256'].forEach((id, idx, arr) => {
      const btn = document.getElementById(`aes-key-var-${id}`);
      if (btn) {
        btn.addEventListener('click', () => {
          selectKeyVariant(id);
        });
        btn.addEventListener('keydown', (e) => {
          let nextIdx = null;
          if (e.key === 'ArrowRight') nextIdx = (idx + 1) % arr.length;
          else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + arr.length) % arr.length;
          if (nextIdx !== null) {
            e.preventDefault();
            const nextId = arr[nextIdx];
            const nextBtn = document.getElementById(`aes-key-var-${nextId}`);
            if (nextBtn) {
              nextBtn.focus();
              selectKeyVariant(nextId);
            }
          }
        });
      }
    });

    // 10. Chapter 05: GCM Lab controls
    const gcmPt = document.getElementById('aes-gcm-plaintext-input');
    if (gcmPt) {
      gcmPt.addEventListener('change', () => {
        runGcmLabEncrypt();
      });
    }

    const gcmAad = document.getElementById('aes-gcm-aad-input');
    if (gcmAad) {
      gcmAad.addEventListener('change', () => {
        runGcmLabEncrypt();
      });
    }

    const gcmToggle = document.getElementById('aes-gcm-use-aad-toggle');
    if (gcmToggle) {
      gcmToggle.addEventListener('change', () => {
        runGcmLabEncrypt();
      });
    }

    const reencryptBtn = document.getElementById('aes-gcm-reencrypt-btn');
    if (reencryptBtn) {
      reencryptBtn.addEventListener('click', () => {
        runGcmLabEncrypt();
      });
    }

    const scenValidBtn = document.getElementById('aes-gcm-scen-valid');
    if (scenValidBtn) {
      scenValidBtn.addEventListener('click', () => {
        runGcmLabDecrypt('valid');
      });
    }

    const scenCtBtn = document.getElementById('aes-gcm-scen-ct');
    if (scenCtBtn) {
      scenCtBtn.addEventListener('click', () => {
        runGcmLabDecrypt('tamper_ct');
      });
    }

    const scenTagBtn = document.getElementById('aes-gcm-scen-tag');
    if (scenTagBtn) {
      scenTagBtn.addEventListener('click', () => {
        runGcmLabDecrypt('tamper_tag');
      });
    }

    const scenAadBtn = document.getElementById('aes-gcm-scen-aad');
    if (scenAadBtn) {
      scenAadBtn.addEventListener('click', () => {
        runGcmLabDecrypt('tamper_aad');
      });
    }

    // Modal dismissal handlers to invalidate pending GCM async operations
    const closeBtn = document.getElementById('aes-studio-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        state.gcmLab.opSeq = (state.gcmLab.opSeq || 0) + 1;
      });
    }
    const modalEl = document.getElementById('aes-studio-modal');
    const backdropEl = document.getElementById('aes-studio-backdrop');
    if (modalEl) {
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl || (backdropEl && e.target === backdropEl)) {
          state.gcmLab.opSeq = (state.gcmLab.opSeq || 0) + 1;
        }
      });
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        state.gcmLab.opSeq = (state.gcmLab.opSeq || 0) + 1;
      }
    });

    // 11. Chapter 06: Production handoffs
    const handoffEncBtn = document.getElementById('aes-handoff-encrypt-btn');
    if (handoffEncBtn) {
      handoffEncBtn.addEventListener('click', () => {
        handoffToEncrypt();
      });
    }

    const handoffDecBtn = document.getElementById('aes-handoff-decrypt-btn');
    if (handoffDecBtn) {
      handoffDecBtn.addEventListener('click', () => {
        handoffToDecrypt();
      });
    }

    // 12. Legacy theory sub-tabs
    ['what', 'why', 'how'].forEach(tabId => {
      const tabBtn = document.getElementById(`learn-tab-${tabId}`);
      if (!tabBtn) return;
      tabBtn.addEventListener('click', () => {
        ['what', 'why', 'how'].forEach(id => {
          const b = document.getElementById(`learn-tab-${id}`);
          const p = document.getElementById(`learn-${id}`);
          if (id === tabId) {
            if (b) {
              b.className = 'p-2 rounded bg-brand-orange text-black font-bold text-xs uppercase cursor-pointer';
              b.setAttribute('aria-selected', 'true');
            }
            if (p) p.classList.remove('hidden');
          } else {
            if (b) {
              b.className = 'p-2 rounded bg-[#111] text-zinc-400 font-bold text-xs uppercase hover:text-white cursor-pointer';
              b.setAttribute('aria-selected', 'false');
            }
            if (p) p.classList.add('hidden');
          }
        });
      });
    });

    // Draw ECB/GCM canvas demos in background
    drawModeCanvases();

    // 13. AES Curriculum Stepper Navigation
    const aesChIds = ['01', '02', '03', '04', '05', '06'];
    let activeAesChIdx = 0;

    function showAesChapter(idx) {
      if (idx < 0 || idx >= aesChIds.length) return;
      activeAesChIdx = idx;

      const pills = document.querySelectorAll('.aes-chapter-step-pill');
      pills.forEach((pill, i) => {
        pill.classList.toggle('active', i === idx);
      });

      const prevBtn = document.getElementById('aes-prev-chapter-btn');
      const nextBtn = document.getElementById('aes-next-chapter-btn');
      if (prevBtn) prevBtn.disabled = (idx === 0);
      if (nextBtn) {
        if (idx === aesChIds.length - 1) {
          nextBtn.innerHTML = `<span>Encrypt Studio</span><span class="material-symbols-outlined text-sm">arrow_forward</span>`;
        } else {
          nextBtn.innerHTML = `<span>Next</span><span class="material-symbols-outlined text-sm">arrow_forward</span>`;
        }
      }

      const targetEl = document.getElementById(`aes-chapter-${aesChIds[idx]}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    const aesPills = document.querySelectorAll('.aes-chapter-step-pill');
    aesPills.forEach((pill, i) => {
      pill.addEventListener('click', () => showAesChapter(i));
    });

    const aesPrevBtn = document.getElementById('aes-prev-chapter-btn');
    if (aesPrevBtn) {
      aesPrevBtn.addEventListener('click', () => {
        if (activeAesChIdx > 0) showAesChapter(activeAesChIdx - 1);
      });
    }

    const aesNextBtn = document.getElementById('aes-next-chapter-btn');
    if (aesNextBtn) {
      aesNextBtn.addEventListener('click', () => {
        if (activeAesChIdx < aesChIds.length - 1) {
          showAesChapter(activeAesChIdx + 1);
        } else {
          handoffToEncrypt();
        }
      });
    }

    // 14. AES Knowledge Check Quiz
    const aesQuizCards = document.querySelectorAll('.aes-knowledge-card');
    aesQuizCards.forEach(card => {
      const qId = card.getAttribute('data-quiz-id');
      const optionBtns = card.querySelectorAll('.knowledge-option-btn');
      const feedbackBanner = card.querySelector('.knowledge-feedback-banner');

      optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const isCorrect = btn.getAttribute('data-correct') === 'true';

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
              <p class="text-zinc-300 font-sans text-xs">
                ${getAesQuizExplanation(qId, true)}
              </p>
            `;
          } else {
            btn.classList.add('selected-incorrect');
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
              <p class="text-zinc-300 font-sans text-xs">
                ${getAesQuizExplanation(qId, false)}
              </p>
            `;
          }
        });
      });
    });
  }

  function getAesQuizExplanation(qId, isCorrect) {
    switch (qId) {
      case 'aq1':
        return `AES-ECB encrypts each 16-byte block independently with no randomness or authentication, preserving structural patterns in data. AES-GCM uses CTR mode with a unique 96-bit IV for randomized confidentiality and computes a GHASH authentication tag over both ciphertext and Associated Data (AAD), providing full Authenticated Encryption with Associated Data (AEAD).`;
      case 'aq2':
        return `Reusing an IV/Nonce in counter mode (AES-CTR/GCM) produces identical keystreams, causing C1 ⊕ C2 = P1 ⊕ P2 (complete keystream reuse disaster). Furthermore, in Galois/Counter Mode, nonces are mathematically bound to the GHASH authentication polynomial; reusing an IV allows an attacker to solve for the authentication subkey H, completely breaking tag integrity and enabling forgery.`;
      case 'aq3':
        return `NIST FIPS 197 defines the four standard round transformations: SubBytes (non-linear S-Box substitution over GF(2⁸)), ShiftRows (cyclic permutation of rows), MixColumns (matrix multiplication in GF(2⁸) with polynomial c(x)), and AddRoundKey (bitwise XOR with the scheduled round key). MixColumns is omitted in the final round.`;
      default:
        return `Review the NIST FIPS 197 specifications in the previous chapters.`;
    }
  }

  function drawModeCanvases() {
    const e = document.getElementById('aes-ecb-canvas');
    const g = document.getElementById('aes-gcm-canvas');
    if (!e || !g) return;

    [e, g].forEach(c => { c.width = 160; c.height = 90; });

    const x = e.getContext('2d');
    if (x) {
      x.fillStyle = '#181818';
      x.fillRect(0, 0, 160, 90);
      x.fillStyle = '#ffb84d';
      x.fillRect(55, 16, 50, 58);
      x.fillStyle = '#181818';
      x.fillRect(66, 28, 8, 8);
      x.fillRect(86, 28, 8, 8);
    }

    const y = g.getContext('2d');
    if (y) {
      const d = y.createImageData(160, 90);
      for (let i = 0; i < d.data.length; i += 4) {
        const v = (i * 73 + 19) % 256;
        d.data[i] = v;
        d.data[i + 1] = v >> 1;
        d.data[i + 2] = 40;
        d.data[i + 3] = 255;
      }
      y.putImageData(d, 0, 0);
    }
  }

  // ---------------------------------------------------------------------------
  // 10. PUBLIC API
  // ---------------------------------------------------------------------------
  root.CastleAESLearn = {
    init,
    reset,
    calculateTrace,
    expandKey,
    selectKeyVariant,
    runGcmLabEncrypt,
    runGcmLabDecrypt,
    setLearnView,
    getLearnView: () => state.learnView,
    cancelPendingGcmOperations: () => { state.gcmLab.opSeq = (state.gcmLab.opSeq || 0) + 1; },
    getState: () => state,
    state,
    handoffToEncrypt,
    handoffToDecrypt,
    AES_VARIANTS,
    OFFICIAL_SBOX,
    NIST_KAT_PLAINTEXT,
    NIST_KAT_KEY,
    NIST_KAT_EXPECTED_CIPHERTEXT
  };

})(window);
