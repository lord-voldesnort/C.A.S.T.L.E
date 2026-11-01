/**
 * Castle Hash Toolkit — Tab 3: Verifier Module
 * Modernized for Stage 4: Tactical Cryptographic Command System
 * 
 * Three Distinct Modes:
 *   - Primary Mode A: Verify a File Against a Known Hash (Flagship)
 *   - Primary Mode B: Compare Two Files Directly via Byte-by-Byte Stream (Flagship)
 *   - Secondary Mode C: Verify Text Against a Hash (Compact)
 * 
 * Features:
 *   - Direct binary byte-by-byte comparison (compareFileBytes)
 *   - Format-based algorithm suggestions with non-dogmatic caveats
 *   - Strict hex validation distinguishing format errors from mismatches
 *   - Case-insensitive normalized comparisons
 *   - Stale result invalidation when inputs change
 *   - Generate-to-Verify handoff reception
 *   - Ephemeral in-memory file handling (loadModeAFile) for cross-tool integrations
 */
(function(root) {
  let activeMode = 'modeA'; // 'modeA' | 'modeB' | 'modeC'

  // Mode A state
  let modeAFile = null;
  let modeAExpectedHash = '';
  let modeAAlgo = 'AUTO';
  let isComputingModeA = false;

  // Mode B state
  let modeBFileA = null;
  let modeBFileB = null;
  let modeBAlgo = 'SHA-256';
  let isComputingModeB = false;

  // Mode C state
  let modeCText = '';
  let modeCExpectedHash = '';
  let modeCAlgo = 'AUTO';
  let isComputingModeC = false;

  function initTab3() {
    bindModeToggles();
    bindModeA();
    bindModeB();
    bindModeC();
    bindHandoffDismiss();
  }

  // =========================================================================
  // MODE NAVIGATION & TOGGLES
  // =========================================================================

  function selectMode(targetMode) {
    activeMode = targetMode;

    const btnA = document.getElementById('hash-verify-toggle-a');
    const btnB = document.getElementById('hash-verify-toggle-b');
    const btnC = document.getElementById('hash-verify-toggle-c');

    const panelA = document.getElementById('hash-verify-panel-a');
    const panelB = document.getElementById('hash-verify-panel-b');
    const panelC = document.getElementById('hash-verify-panel-c');

    if (!btnA || !btnB || !panelA || !panelB) return;

    // Reset all buttons to inactive style
    const inactiveClass = 'flex-1 sm:flex-none py-2 px-3 rounded font-mono text-xs font-medium uppercase transition-all bg-[#0D0D0D] text-zinc-400 border border-[#1A1A1A] hover:text-white hover:bg-[#1A1A1A] cursor-pointer flex items-center justify-center gap-1.5';
    btnA.className = inactiveClass;
    btnB.className = inactiveClass;
    if (btnC) btnC.className = inactiveClass;

    // Hide all panels
    panelA.classList.add('hidden');
    panelB.classList.add('hidden');
    if (panelC) panelC.classList.add('hidden');

    if (targetMode === 'modeA') {
      btnA.className = 'flex-1 py-2 px-3 rounded font-mono text-xs font-bold uppercase transition-all bg-brand-orange text-black border border-brand-orange shadow-[0_0_12px_rgba(255,106,0,0.3)] cursor-pointer flex items-center justify-center gap-1.5';
      panelA.classList.remove('hidden');
    } else if (targetMode === 'modeB') {
      btnB.className = 'flex-1 py-2 px-3 rounded font-mono text-xs font-bold uppercase transition-all bg-cyan-400 text-black border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer flex items-center justify-center gap-1.5';
      panelB.classList.remove('hidden');
    } else if (targetMode === 'modeC' && btnC && panelC) {
      btnC.className = 'sm:flex-none py-2 px-3 rounded font-mono text-xs font-bold uppercase transition-all bg-zinc-200 text-black border border-zinc-200 shadow-[0_0_12px_rgba(255,255,255,0.2)] cursor-pointer flex items-center justify-center gap-1.5';
      panelC.classList.remove('hidden');
    }
  }

  function bindModeToggles() {
    const btnA = document.getElementById('hash-verify-toggle-a');
    const btnB = document.getElementById('hash-verify-toggle-b');
    const btnC = document.getElementById('hash-verify-toggle-c');

    if (btnA) btnA.addEventListener('click', () => selectMode('modeA'));
    if (btnB) btnB.addEventListener('click', () => selectMode('modeB'));
    if (btnC) btnC.addEventListener('click', () => selectMode('modeC'));
  }

  function bindHandoffDismiss() {
    const dismissBtn = document.getElementById('hash-verify-handoff-dismiss');
    const banner = document.getElementById('hash-verify-handoff-alert');
    if (dismissBtn && banner) {
      dismissBtn.addEventListener('click', () => {
        banner.classList.add('hidden');
      });
    }
  }

  // =========================================================================
  // PRIMARY MODE A: VERIFY FILE AGAINST KNOWN HASH
  // =========================================================================

  function bindModeA() {
    const dropzone = document.getElementById('hash-verify-modea-dropzone');
    const fileInput = document.getElementById('hash-verify-modea-file-input');
    const hashInput = document.getElementById('hash-verify-modea-expected');
    const algoSelect = document.getElementById('hash-verify-modea-algo');
    const runBtn = document.getElementById('hash-verify-modea-run-btn');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', (e) => {
        if (e.target !== fileInput) fileInput.click();
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleModeAFile(e.target.files[0]);
        }
      });

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-brand-orange', 'bg-[#120B05]/50');
      });

      dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-brand-orange', 'bg-[#120B05]/50');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-brand-orange', 'bg-[#120B05]/50');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleModeAFile(e.dataTransfer.files[0]);
        }
      });
    }

    if (hashInput) {
      hashInput.addEventListener('input', () => {
        modeAExpectedHash = hashInput.value.trim();
        updateModeACharCount();
        updateModeASuggestion();
        invalidateModeAResults();
      });
    }

    if (algoSelect) {
      algoSelect.addEventListener('change', () => {
        modeAAlgo = algoSelect.value;
        invalidateModeAResults();
      });
    }

    if (runBtn) {
      runBtn.addEventListener('click', () => {
        runModeAComparison();
      });
    }
  }

  function handleModeAFile(file) {
    modeAFile = file;
    updateModeAFileInfo(file);
    invalidateModeAResults();
  }

  function updateModeAFileInfo(file) {
    const fileInfo = document.getElementById('hash-verify-modea-file-info');
    if (!fileInfo) return;

    if (!file) {
      fileInfo.innerHTML = '';
      return;
    }

    const fileName = file.name || 'unnamed-file';
    const formattedSize = formatBytes(file.size);
    const mime = file.type || 'binary/octet-stream';

    fileInfo.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#050505] border border-brand-orange/40 rounded-lg text-xs font-mono">
        <div class="flex items-center gap-2 text-zinc-200 truncate">
          <span class="material-symbols-outlined text-brand-orange text-lg shrink-0">description</span>
          <span class="font-bold text-white truncate max-w-[220px] sm:max-w-[360px]">${escapeHtml(fileName)}</span>
          <span class="text-zinc-500">(${formattedSize} · ${escapeHtml(mime)})</span>
        </div>
        <button id="hash-verify-modea-remove-file" type="button" class="text-zinc-400 hover:text-red-400 text-[11px] uppercase font-bold transition-colors cursor-pointer self-start sm:self-auto">
          Remove
        </button>
      </div>
    `;

    const removeBtn = document.getElementById('hash-verify-modea-remove-file');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        modeAFile = null;
        const finput = document.getElementById('hash-verify-modea-file-input');
        if (finput) finput.value = '';
        fileInfo.innerHTML = '';
        invalidateModeAResults();
      });
    }
  }

  function updateModeACharCount() {
    const charsEl = document.getElementById('hash-verify-modea-chars');
    if (!charsEl) return;
    const len = modeAExpectedHash.length;
    charsEl.textContent = `${len} HEX CHARS`;
  }

  function updateModeASuggestion() {
    const suggEl = document.getElementById('hash-verify-modea-suggestion');
    const algoSelect = document.getElementById('hash-verify-modea-algo');
    if (!suggEl) return;

    const len = modeAExpectedHash.length;
    if (len === 0) {
      suggEl.innerHTML = `
        <span class="material-symbols-outlined text-zinc-500 text-sm">info</span>
        <span>Enter expected hash to inspect format suggestion.</span>
      `;
      return;
    }

    const detected = root.CastleHashEngine.autoDetectAlgorithm(modeAExpectedHash);

    if (detected === 'MD5') {
      suggEl.innerHTML = `
        <span class="material-symbols-outlined text-yellow-400 text-sm">flag</span>
        <span><strong>32 hex characters:</strong> Strongly suggests <strong>MD5</strong> format. <em>(Legacy/Broken — length alone does not guarantee origin)</em></span>
      `;
      if (algoSelect && algoSelect.value === 'AUTO') {
        // Auto suggestion matches MD5
      }
    } else if (detected === 'SHA-1') {
      suggEl.innerHTML = `
        <span class="material-symbols-outlined text-yellow-400 text-sm">flag</span>
        <span><strong>40 hex characters:</strong> Strongly suggests <strong>SHA-1</strong> format. <em>(Legacy/Collision-vulnerable)</em></span>
      `;
    } else if (detected === 'SHA-256') {
      suggEl.innerHTML = `
        <span class="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
        <span><strong>64 hex characters:</strong> Strongly suggests <strong>SHA-256</strong> format. <em>(Recommended standard checksum)</em></span>
      `;
    } else if (detected === 'SHA-512') {
      suggEl.innerHTML = `
        <span class="material-symbols-outlined text-cyan-400 text-sm">shield</span>
        <span><strong>128 hex characters:</strong> Strongly suggests <strong>SHA-512</strong> format. <em>(High assurance 512-bit digest)</em></span>
      `;
    } else {
      suggEl.innerHTML = `
        <span class="material-symbols-outlined text-yellow-500 text-sm">help</span>
        <span>Non-standard length (${len} chars). Supported: 32 (MD5), 40 (SHA-1), 64 (SHA-256), 128 (SHA-512).</span>
      `;
    }
  }

  function invalidateModeAResults() {
    const resultBanner = document.getElementById('hash-verify-modea-result');
    const validationMsg = document.getElementById('hash-verify-modea-validation');
    if (resultBanner) resultBanner.innerHTML = '';
    if (validationMsg) validationMsg.innerHTML = '';
  }

  /**
   * Public method: loads an in-memory file into Verify Mode A.
   * Preserves compatibility with existing Castle tools and test suites.
   */
  function loadModeAFile(file, expectedHash = '', algo = 'AUTO') {
    if (!(file instanceof Blob)) {
      throw new TypeError('Hash Toolkit handoff requires a File or Blob.');
    }
    modeAFile = file;
    updateModeAFileInfo(file);

    if (expectedHash) {
      modeAExpectedHash = expectedHash.trim();
      const hashInput = document.getElementById('hash-verify-modea-expected');
      if (hashInput) hashInput.value = modeAExpectedHash;
      updateModeACharCount();
      updateModeASuggestion();
    }

    if (algo && algo !== 'AUTO') {
      modeAAlgo = algo;
      const algoSelect = document.getElementById('hash-verify-modea-algo');
      if (algoSelect) algoSelect.value = algo;
    }

    selectMode('modeA');
    runModeAComparison();
  }

  async function runModeAComparison() {
    if (isComputingModeA) return;

    const resultBanner = document.getElementById('hash-verify-modea-result');
    const validationMsg = document.getElementById('hash-verify-modea-validation');
    const progressEl = document.getElementById('hash-verify-modea-progress');
    const hashInputEl = document.getElementById('hash-verify-modea-expected');
    const algoSelectEl = document.getElementById('hash-verify-modea-algo');

    if (!resultBanner || !validationMsg) return;

    if (hashInputEl) {
      modeAExpectedHash = hashInputEl.value.trim();
    }
    if (algoSelectEl) {
      modeAAlgo = algoSelectEl.value;
    }

    validationMsg.innerHTML = '';
    resultBanner.innerHTML = '';

    // Check file presence
    if (!modeAFile) {
      validationMsg.innerHTML = `
        <div class="p-2.5 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 text-xs font-mono rounded-lg flex items-center gap-2">
          <span class="material-symbols-outlined text-base">warning</span>
          <span>Please select or drop a file to verify.</span>
        </div>
      `;
      return;
    }

    // Check expected hash presence
    if (!modeAExpectedHash) {
      validationMsg.innerHTML = `
        <div class="p-2.5 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 text-xs font-mono rounded-lg flex items-center gap-2">
          <span class="material-symbols-outlined text-base">warning</span>
          <span>Please enter or paste the expected reference hash.</span>
        </div>
      `;
      return;
    }

    // Validate expected hash format and length
    const chosenAlgo = (modeAAlgo === 'AUTO' || !modeAAlgo) ? null : modeAAlgo;
    const valResult = root.CastleHashEngine.validateHashFormat(modeAExpectedHash, chosenAlgo);

    if (!valResult.valid) {
      // Must show validation error rather than mismatch result
      validationMsg.innerHTML = `
        <div class="p-2.5 bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-mono rounded-lg flex items-center gap-2">
          <span class="material-symbols-outlined text-base">error</span>
          <span>${escapeHtml(valResult.error || "That doesn't look like a valid hash — check for typos or missing characters.")}</span>
        </div>
      `;
      return;
    }

    // Determine algorithm to compute
    let algoToRun = chosenAlgo;
    if (!algoToRun) {
      algoToRun = valResult.detectedAlgo || 'SHA-256';
    }

    isComputingModeA = true;
    if (progressEl) progressEl.classList.remove('hidden');

    try {
      const computedHash = await root.CastleHashEngine.hashFile(algoToRun, modeAFile, (pct) => {
        const bar = document.getElementById('hash-verify-modea-progress-bar');
        const text = document.getElementById('hash-verify-modea-progress-text');
        if (bar) {
          bar.style.width = '100%';
          bar.style.transformOrigin = 'left';
          bar.style.transform = `scaleX(${Math.max(0, Math.min(100, pct)) / 100})`;
          bar.classList.add('meter-bar-fill');
        }
        if (text) text.textContent = `Computing ${algoToRun}… ${pct}%`;
      });

      const isMatch = computedHash.toLowerCase() === valResult.normalized;

      if (isMatch) {
        resultBanner.innerHTML = `
          <div class="p-4 bg-[#051A10] border-2 border-emerald-500/80 rounded-xl flex flex-col gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)] pulse-verified">
            <div class="flex items-center justify-between gap-2 border-b border-emerald-500/30 pb-2">
              <div class="flex items-center gap-2 font-mono text-sm md:text-base font-bold text-emerald-400">
                <span class="material-symbols-outlined text-[24px]">check_circle</span>
                <span>MATCH // INTEGRITY VERIFIED</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold uppercase">
                ${escapeHtml(algoToRun)}
              </span>
            </div>

            <p class="font-sans text-xs text-emerald-200">
              Match — this file is identical to what the hash represents.
            </p>

            <div class="flex flex-col gap-2 font-mono text-xs">
              <div class="flex flex-col gap-1 bg-[#000000]/60 p-2.5 rounded border border-emerald-500/30">
                <span class="text-emerald-400/80 font-bold text-[11px]">EXPECTED REFERENCE DIGEST:</span>
                <div class="flex items-center justify-between gap-2">
                  <code class="text-emerald-300 break-all select-all font-mono">${escapeHtml(valResult.normalized)}</code>
                  <button data-copy-hash="${escapeHtml(valResult.normalized)}" type="button" class="hash-verify-copy-btn px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-300 text-[10px] uppercase font-bold shrink-0 cursor-pointer">Copy</button>
                </div>
              </div>

              <div class="flex flex-col gap-1 bg-[#000000]/60 p-2.5 rounded border border-emerald-500/30">
                <span class="text-emerald-400/80 font-bold text-[11px]">CALCULATED FILE DIGEST:</span>
                <div class="flex items-center justify-between gap-2">
                  <code class="text-emerald-300 break-all select-all font-mono">${escapeHtml(computedHash)}</code>
                  <button data-copy-hash="${escapeHtml(computedHash)}" type="button" class="hash-verify-copy-btn px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-300 text-[10px] uppercase font-bold shrink-0 cursor-pointer">Copy</button>
                </div>
              </div>
            </div>

            <div class="p-2.5 bg-[#000000]/50 rounded border border-emerald-500/20 text-[11px] font-sans text-zinc-400 flex items-start gap-2">
              <span class="material-symbols-outlined text-emerald-400 text-sm shrink-0 mt-0.5">verified_user</span>
              <span><strong>Cryptographic Note:</strong> Verification confirms that this local file produces an identical digest to the provided reference hash. This establishes byte equality against the reference, but does not verify the trustworthiness of the reference publisher or transmission channel.</span>
            </div>
          </div>
        `;
      } else {
        resultBanner.innerHTML = `
          <div class="p-4 bg-[#1A0A0A] border-2 border-red-500/80 rounded-xl flex flex-col gap-3 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <div class="flex items-center justify-between gap-2 border-b border-red-500/30 pb-2">
              <div class="flex items-center gap-2 font-mono text-sm md:text-base font-bold text-red-400">
                <span class="material-symbols-outlined text-[24px]">cancel</span>
                <span>MISMATCH // INTEGRITY FAILED</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-[11px] font-bold uppercase">
                ${escapeHtml(algoToRun)}
              </span>
            </div>

            <p class="font-sans text-xs text-red-200">
              No match — this file differs from what the hash represents.
            </p>

            <div class="flex flex-col gap-2 font-mono text-xs">
              <div class="flex flex-col gap-1 bg-[#000000]/60 p-2.5 rounded border border-red-500/30">
                <span class="text-zinc-400 font-bold text-[11px]">EXPECTED REFERENCE DIGEST:</span>
                <code class="text-zinc-300 break-all select-all font-mono">${escapeHtml(valResult.normalized)}</code>
              </div>

              <div class="flex flex-col gap-1 bg-[#000000]/60 p-2.5 rounded border border-red-500/30">
                <span class="text-red-400 font-bold text-[11px]">CALCULATED FILE DIGEST:</span>
                <div class="flex items-center justify-between gap-2">
                  <code class="text-red-300 break-all select-all font-mono">${escapeHtml(computedHash)}</code>
                  <button data-copy-hash="${escapeHtml(computedHash)}" type="button" class="hash-verify-copy-btn px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-300 text-[10px] uppercase font-bold shrink-0 cursor-pointer">Copy</button>
                </div>
              </div>
            </div>

            <div class="p-2.5 bg-[#000000]/50 rounded border border-red-500/20 text-[11px] font-sans text-zinc-400 flex items-start gap-2">
              <span class="material-symbols-outlined text-red-400 text-sm shrink-0 mt-0.5">report_problem</span>
              <span><strong>Warning:</strong> The file contents do not match the expected digest. The file may be corrupt, modified, truncated, or hashed using a different algorithm or encoding.</span>
            </div>
          </div>
        `;
      }

      wireResultCopyButtons(resultBanner);

    } catch (err) {
      console.error('Mode A verify error:', err);
      resultBanner.innerHTML = `
        <div class="p-3 bg-red-500/20 border border-red-500 text-red-400 text-xs font-mono rounded">
          Error computing file verification: ${escapeHtml(err.message)}
        </div>
      `;
    } finally {
      isComputingModeA = false;
      if (progressEl) progressEl.classList.add('hidden');
    }
  }

  // =========================================================================
  // PRIMARY MODE B: COMPARE TWO FILES DIRECTLY (BYTE STREAM)
  // =========================================================================

  function bindModeB() {
    setupModeBDropzone('hash-verify-modeb-dropzone-a', 'hash-verify-modeb-file-a', (file) => {
      modeBFileA = file;
      updateModeBFileInfo('a', file);
      invalidateModeBResults();
    });

    setupModeBDropzone('hash-verify-modeb-dropzone-b', 'hash-verify-modeb-file-b', (file) => {
      modeBFileB = file;
      updateModeBFileInfo('b', file);
      invalidateModeBResults();
    });

    const algoSelect = document.getElementById('hash-verify-modeb-algo');
    if (algoSelect) {
      algoSelect.addEventListener('change', () => {
        modeBAlgo = algoSelect.value;
        invalidateModeBResults();
      });
    }

    const runBtn = document.getElementById('hash-verify-modeb-run-btn');
    if (runBtn) {
      runBtn.addEventListener('click', () => {
        runModeBComparison();
      });
    }
  }

  function setupModeBDropzone(dzId, inputId, onFileSelected) {
    const dz = document.getElementById(dzId);
    const input = document.getElementById(inputId);
    if (!dz || !input) return;

    dz.addEventListener('click', (e) => {
      if (e.target !== input) input.click();
    });

    input.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        onFileSelected(e.target.files[0]);
      }
    });

    dz.addEventListener('dragover', (e) => {
      e.preventDefault();
      dz.classList.add('border-cyan-400', 'bg-[#05151A]/50');
    });

    dz.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dz.classList.remove('border-cyan-400', 'bg-[#05151A]/50');
    });

    dz.addEventListener('drop', (e) => {
      e.preventDefault();
      dz.classList.remove('border-cyan-400', 'bg-[#05151A]/50');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileSelected(e.dataTransfer.files[0]);
      }
    });
  }

  function updateModeBFileInfo(target, file) {
    const container = document.getElementById(`hash-verify-modeb-info-${target}`);
    if (!container) return;

    if (!file) {
      container.innerHTML = '';
      return;
    }

    const labelColor = target === 'a' ? 'text-brand-orange' : 'text-cyan-400';
    const borderColor = target === 'a' ? 'border-brand-orange/40' : 'border-cyan-500/40';

    container.innerHTML = `
      <div class="flex items-center justify-between gap-2 p-2.5 bg-[#000000] border ${borderColor} rounded-lg text-xs font-mono mt-1">
        <div class="flex items-center gap-2 truncate">
          <span class="material-symbols-outlined ${labelColor} text-base shrink-0">description</span>
          <span class="font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">${escapeHtml(file.name)}</span>
          <span class="text-zinc-500">(${formatBytes(file.size)})</span>
        </div>
        <button id="hash-verify-modeb-remove-${target}" type="button" class="text-zinc-500 hover:text-red-400 text-[10px] uppercase font-bold transition-colors cursor-pointer shrink-0">
          Remove
        </button>
      </div>
    `;

    const removeBtn = document.getElementById(`hash-verify-modeb-remove-${target}`);
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (target === 'a') {
          modeBFileA = null;
          const input = document.getElementById('hash-verify-modeb-file-a');
          if (input) input.value = '';
        } else {
          modeBFileB = null;
          const input = document.getElementById('hash-verify-modeb-file-b');
          if (input) input.value = '';
        }
        container.innerHTML = '';
        invalidateModeBResults();
      });
    }
  }

  function invalidateModeBResults() {
    const resultBanner = document.getElementById('hash-verify-modeb-result');
    if (resultBanner) resultBanner.innerHTML = '';
  }

  async function runModeBComparison() {
    if (isComputingModeB) return;

    const resultBanner = document.getElementById('hash-verify-modeb-result');
    const progressEl = document.getElementById('hash-verify-modeb-progress');
    const progressBar = document.getElementById('hash-verify-modeb-progress-bar');
    const progressText = document.getElementById('hash-verify-modeb-progress-text');

    if (!resultBanner) return;
    resultBanner.innerHTML = '';

    if (!modeBFileA || !modeBFileB) {
      resultBanner.innerHTML = `
        <div class="p-3 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 text-xs font-mono rounded-lg flex items-center gap-2">
          <span class="material-symbols-outlined text-base">warning</span>
          <span>Please select both File A and File B to compare.</span>
        </div>
      `;
      return;
    }

    isComputingModeB = true;
    if (progressEl) progressEl.classList.remove('hidden');

    try {
      // Step 1: Direct byte-by-byte stream comparison (decisive check)
      const byteComparison = await root.CastleHashEngine.compareFileBytes(modeBFileA, modeBFileB, (pct) => {
        const val = Math.round(pct * 0.6);
        if (progressBar) {
          progressBar.style.width = '100%';
          progressBar.style.transformOrigin = 'left';
          progressBar.style.transform = `scaleX(${Math.max(0, Math.min(100, val)) / 100})`;
          progressBar.classList.add('meter-bar-fill');
        }
        if (progressText) progressText.textContent = `Scanning byte sequences… ${val}%`;
      });

      // Step 2: Calculate supplementary digests for inspection
      if (progressText) progressText.textContent = `Computing supplementary ${modeBAlgo} digests… 70%`;
      if (progressBar) {
        progressBar.style.width = '100%';
        progressBar.style.transformOrigin = 'left';
        progressBar.style.transform = 'scaleX(0.75)';
      }

      const [hashA, hashB] = await Promise.all([
        root.CastleHashEngine.hashFile(modeBAlgo, modeBFileA),
        root.CastleHashEngine.hashFile(modeBAlgo, modeBFileB)
      ]);

      if (progressBar) {
        progressBar.style.width = '100%';
        progressBar.style.transformOrigin = 'left';
        progressBar.style.transform = 'scaleX(1)';
      }

      const isIdentical = byteComparison.identical;

      if (isIdentical) {
        resultBanner.innerHTML = `
          <div class="p-4 bg-[#051A10] border-2 border-emerald-500/80 rounded-xl flex flex-col gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <div class="flex items-center justify-between gap-2 border-b border-emerald-500/30 pb-2">
              <div class="flex items-center gap-2 font-mono text-sm md:text-base font-bold text-emerald-400">
                <span class="material-symbols-outlined text-[24px]">verified</span>
                <span>IDENTICAL // EXACT BIT-FOR-BIT MATCH</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold uppercase">
                BYTE LEVEL EQUIVALENCE
              </span>
            </div>

            <p class="font-sans text-xs text-emerald-200">
              Match — these two files are identical. ${escapeHtml(byteComparison.reason || '')}
            </p>

            <!-- Metadata Inspection Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              <div class="flex flex-col gap-1.5 p-3 rounded-lg bg-[#000000]/60 border border-emerald-500/30">
                <span class="text-brand-orange font-bold text-[11px]">FILE A (REFERENCE):</span>
                <div class="text-zinc-200 truncate"><strong>Name:</strong> ${escapeHtml(modeBFileA.name)}</div>
                <div class="text-zinc-400"><strong>Size:</strong> ${formatBytes(modeBFileA.size)} (${modeBFileA.size} bytes)</div>
                <div class="flex flex-col gap-0.5 pt-1">
                  <span class="text-[10px] text-zinc-500">${modeBAlgo} DIGEST:</span>
                  <code class="text-emerald-300 break-all select-all text-[11px]">${hashA}</code>
                </div>
              </div>

              <div class="flex flex-col gap-1.5 p-3 rounded-lg bg-[#000000]/60 border border-emerald-500/30">
                <span class="text-cyan-400 font-bold text-[11px]">FILE B (TARGET):</span>
                <div class="text-zinc-200 truncate"><strong>Name:</strong> ${escapeHtml(modeBFileB.name)}</div>
                <div class="text-zinc-400"><strong>Size:</strong> ${formatBytes(modeBFileB.size)} (${modeBFileB.size} bytes)</div>
                <div class="flex flex-col gap-0.5 pt-1">
                  <span class="text-[10px] text-zinc-500">${modeBAlgo} DIGEST:</span>
                  <code class="text-emerald-300 break-all select-all text-[11px]">${hashB}</code>
                </div>
              </div>
            </div>

            <div class="p-2.5 bg-[#000000]/50 rounded border border-emerald-500/20 text-[11px] font-sans text-zinc-400 flex items-start gap-2">
              <span class="material-symbols-outlined text-emerald-400 text-sm shrink-0 mt-0.5">info</span>
              <span><strong>Decisive Proof:</strong> Direct binary stream inspection confirmed that all ${modeBFileA.size} bytes are 100% identical in sequence and value. Even if filenames differ, their binary content is identical.</span>
            </div>
          </div>
        `;
      } else {
        resultBanner.innerHTML = `
          <div class="p-4 bg-[#1A0A0A] border-2 border-red-500/80 rounded-xl flex flex-col gap-3 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <div class="flex items-center justify-between gap-2 border-b border-red-500/30 pb-2">
              <div class="flex items-center gap-2 font-mono text-sm md:text-base font-bold text-red-400">
                <span class="material-symbols-outlined text-[24px]">cancel</span>
                <span>DIFFERENT // BYTE-LEVEL DIVERGENCE</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-[11px] font-bold uppercase">
                PAYLOAD MISMATCH
              </span>
            </div>

            <p class="font-sans text-xs text-red-200">
              No match — these two files are different.
            </p>

            <!-- Divergence Reason -->
            <div class="p-3 bg-[#000000]/60 border border-red-500/40 rounded-lg text-xs font-mono text-red-300 flex items-start gap-2">
              <span class="material-symbols-outlined text-red-400 text-base shrink-0">difference</span>
              <span><strong>Divergence Reason:</strong> ${escapeHtml(byteComparison.reason)}</span>
            </div>

            <!-- Comparison Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              <div class="flex flex-col gap-1.5 p-3 rounded-lg bg-[#000000]/60 border border-red-500/30">
                <span class="text-brand-orange font-bold text-[11px]">FILE A (REFERENCE):</span>
                <div class="text-zinc-200 truncate"><strong>Name:</strong> ${escapeHtml(modeBFileA.name)}</div>
                <div class="text-zinc-400"><strong>Size:</strong> ${formatBytes(modeBFileA.size)} (${modeBFileA.size} bytes)</div>
                <div class="flex flex-col gap-0.5 pt-1">
                  <span class="text-[10px] text-zinc-500">${modeBAlgo} DIGEST:</span>
                  <code class="text-red-300 break-all select-all text-[11px]">${hashA}</code>
                </div>
              </div>

              <div class="flex flex-col gap-1.5 p-3 rounded-lg bg-[#000000]/60 border border-red-500/30">
                <span class="text-cyan-400 font-bold text-[11px]">FILE B (TARGET):</span>
                <div class="text-zinc-200 truncate"><strong>Name:</strong> ${escapeHtml(modeBFileB.name)}</div>
                <div class="text-zinc-400"><strong>Size:</strong> ${formatBytes(modeBFileB.size)} (${modeBFileB.size} bytes)</div>
                <div class="flex flex-col gap-0.5 pt-1">
                  <span class="text-[10px] text-zinc-500">${modeBAlgo} DIGEST:</span>
                  <code class="text-red-300 break-all select-all text-[11px]">${hashB}</code>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    } catch (err) {
      console.error('Mode B verify error:', err);
      resultBanner.innerHTML = `
        <div class="p-3 bg-red-500/20 border border-red-500 text-red-400 text-xs font-mono rounded">
          Error comparing files: ${escapeHtml(err.message)}
        </div>
      `;
    } finally {
      isComputingModeB = false;
      if (progressEl) progressEl.classList.add('hidden');
    }
  }

  // =========================================================================
  // SECONDARY MODE C: VERIFY TEXT AGAINST A HASH
  // =========================================================================

  function bindModeC() {
    const textInput = document.getElementById('hash-verify-modec-text');
    const hashInput = document.getElementById('hash-verify-modec-expected');
    const algoSelect = document.getElementById('hash-verify-modec-algo');
    const runBtn = document.getElementById('hash-verify-modec-run-btn');

    if (textInput) {
      textInput.addEventListener('input', () => {
        modeCText = textInput.value;
        invalidateModeCResults();
      });
    }

    if (hashInput) {
      hashInput.addEventListener('input', () => {
        modeCExpectedHash = hashInput.value.trim();
        invalidateModeCResults();
      });
    }

    if (algoSelect) {
      algoSelect.addEventListener('change', () => {
        modeCAlgo = algoSelect.value;
        invalidateModeCResults();
      });
    }

    if (runBtn) {
      runBtn.addEventListener('click', () => {
        runModeCComparison();
      });
    }
  }

  function invalidateModeCResults() {
    const resultBanner = document.getElementById('hash-verify-modec-result');
    const valMsg = document.getElementById('hash-verify-modec-validation');
    if (resultBanner) resultBanner.innerHTML = '';
    if (valMsg) valMsg.innerHTML = '';
  }

  async function runModeCComparison() {
    if (isComputingModeC) return;

    const resultBanner = document.getElementById('hash-verify-modec-result');
    const valMsg = document.getElementById('hash-verify-modec-validation');
    const textInputEl = document.getElementById('hash-verify-modec-text');
    const hashInputEl = document.getElementById('hash-verify-modec-expected');
    const algoSelectEl = document.getElementById('hash-verify-modec-algo');

    if (!resultBanner || !valMsg) return;

    if (textInputEl) modeCText = textInputEl.value;
    if (hashInputEl) modeCExpectedHash = hashInputEl.value.trim();
    if (algoSelectEl) modeCAlgo = algoSelectEl.value;

    valMsg.innerHTML = '';
    resultBanner.innerHTML = '';

    if (!modeCExpectedHash) {
      valMsg.innerHTML = `
        <div class="p-2.5 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 text-xs font-mono rounded-lg flex items-center gap-2">
          <span class="material-symbols-outlined text-base">warning</span>
          <span>Please enter an expected hash to compare against.</span>
        </div>
      `;
      return;
    }

    const chosenAlgo = (modeCAlgo === 'AUTO' || !modeCAlgo) ? null : modeCAlgo;
    const valResult = root.CastleHashEngine.validateHashFormat(modeCExpectedHash, chosenAlgo);

    if (!valResult.valid) {
      valMsg.innerHTML = `
        <div class="p-2.5 bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-mono rounded-lg flex items-center gap-2">
          <span class="material-symbols-outlined text-base">error</span>
          <span>${escapeHtml(valResult.error || "Invalid hash format.")}</span>
        </div>
      `;
      return;
    }

    let algoToRun = chosenAlgo || valResult.detectedAlgo || 'SHA-256';
    isComputingModeC = true;

    try {
      const computedHash = await root.CastleHashEngine.hashString(algoToRun, modeCText);
      const isMatch = computedHash.toLowerCase() === valResult.normalized;

      if (isMatch) {
        resultBanner.innerHTML = `
          <div class="p-3 bg-[#051A10] border border-emerald-500/80 rounded-lg flex flex-col gap-2 font-mono text-xs pulse-verified">
            <div class="flex items-center gap-2 font-bold text-emerald-400">
              <span class="material-symbols-outlined text-base">check_circle</span>
              <span>MATCH // TEXT DIGEST VERIFIED</span>
            </div>
            <div class="text-zinc-300">Text string accurately matches expected ${algoToRun} checksum.</div>
            <div class="flex items-center gap-2 bg-[#000000] p-2 rounded border border-emerald-500/30">
              <code class="text-emerald-300 break-all select-all">${escapeHtml(computedHash)}</code>
            </div>
          </div>
        `;
      } else {
        resultBanner.innerHTML = `
          <div class="p-3 bg-[#1A0A0A] border border-red-500/80 rounded-lg flex flex-col gap-2 font-mono text-xs">
            <div class="flex items-center gap-2 font-bold text-red-400">
              <span class="material-symbols-outlined text-base">cancel</span>
              <span>MISMATCH // TEXT DIGEST MISMATCH</span>
            </div>
            <div class="text-zinc-400">Computed ${algoToRun} digest does not match expected hash.</div>
            <div class="flex flex-col gap-1 bg-[#000000] p-2 rounded border border-red-500/30">
              <span class="text-[10px] text-zinc-500">COMPUTED:</span>
              <code class="text-red-300 break-all select-all">${escapeHtml(computedHash)}</code>
            </div>
          </div>
        `;
      }
    } catch (err) {
      console.error('Mode C verify error:', err);
      resultBanner.innerHTML = `
        <div class="p-3 bg-red-500/20 border border-red-500 text-red-400 text-xs font-mono rounded">
          Error hashing text: ${escapeHtml(err.message)}
        </div>
      `;
    } finally {
      isComputingModeC = false;
    }
  }

  // =========================================================================
  // HANDOFF HANDLER (FROM GENERATE TAB)
  // =========================================================================

  function handleHandoff({ hash, algo, sourceMode, fileName }) {
    const banner = document.getElementById('hash-verify-handoff-alert');
    const msgEl = document.getElementById('hash-verify-handoff-msg');

    if (banner && msgEl) {
      banner.classList.remove('hidden');
      if (sourceMode === 'file') {
        msgEl.innerHTML = `Prepopulated <strong>${escapeHtml(algo)}</strong> digest (${escapeHtml(hash.slice(0, 16))}…) from file <em>"${escapeHtml(fileName || 'selected file')}"</em>. Select reference file to verify.`;
      } else {
        msgEl.innerHTML = `Prepopulated <strong>${escapeHtml(algo)}</strong> digest (${escapeHtml(hash.slice(0, 16))}…) from Generate text.`;
      }
    }

    if (sourceMode === 'text') {
      selectMode('modeC');
      const hashInputC = document.getElementById('hash-verify-modec-expected');
      const algoSelectC = document.getElementById('hash-verify-modec-algo');
      if (hashInputC) {
        hashInputC.value = hash;
        modeCExpectedHash = hash;
      }
      if (algoSelectC && algo) {
        algoSelectC.value = algo;
        modeCAlgo = algo;
      }
      invalidateModeCResults();
    } else {
      selectMode('modeA');
      const hashInputA = document.getElementById('hash-verify-modea-expected');
      const algoSelectA = document.getElementById('hash-verify-modea-algo');
      if (hashInputA) {
        hashInputA.value = hash;
        modeAExpectedHash = hash;
        updateModeACharCount();
        updateModeASuggestion();
      }
      if (algoSelectA && algo) {
        algoSelectA.value = algo;
        modeAAlgo = algo;
      }
      invalidateModeAResults();
    }
  }

  // =========================================================================
  // WORKSPACE RESET & UTILITIES
  // =========================================================================

  function reset() {
    // Mode A reset
    modeAFile = null;
    modeAExpectedHash = '';
    modeAAlgo = 'AUTO';
    isComputingModeA = false;

    const fileAInput = document.getElementById('hash-verify-modea-file-input');
    if (fileAInput) fileAInput.value = '';
    const fileAInfo = document.getElementById('hash-verify-modea-file-info');
    if (fileAInfo) fileAInfo.innerHTML = '';
    const expInputA = document.getElementById('hash-verify-modea-expected');
    if (expInputA) expInputA.value = '';
    const charsA = document.getElementById('hash-verify-modea-chars');
    if (charsA) charsA.textContent = '0 HEX CHARS';
    const suggA = document.getElementById('hash-verify-modea-suggestion');
    if (suggA) {
      suggA.innerHTML = `
        <span class="material-symbols-outlined text-cyan-400 text-sm">info</span>
        <span>Enter expected hash to inspect format suggestion.</span>
      `;
    }
    const algoA = document.getElementById('hash-verify-modea-algo');
    if (algoA) algoA.value = 'AUTO';
    const resultBannerA = document.getElementById('hash-verify-modea-result');
    if (resultBannerA) resultBannerA.innerHTML = '';
    const valMsgA = document.getElementById('hash-verify-modea-validation');
    if (valMsgA) valMsgA.innerHTML = '';
    const progressA = document.getElementById('hash-verify-modea-progress');
    if (progressA) progressA.classList.add('hidden');

    // Mode B reset
    modeBFileA = null;
    modeBFileB = null;
    modeBAlgo = 'SHA-256';
    isComputingModeB = false;

    const fileBInputA = document.getElementById('hash-verify-modeb-file-a');
    if (fileBInputA) fileBInputA.value = '';
    const fileBInfoA = document.getElementById('hash-verify-modeb-info-a');
    if (fileBInfoA) fileBInfoA.innerHTML = '';
    const fileBInputB = document.getElementById('hash-verify-modeb-file-b');
    if (fileBInputB) fileBInputB.value = '';
    const fileBInfoB = document.getElementById('hash-verify-modeb-info-b');
    if (fileBInfoB) fileBInfoB.innerHTML = '';
    const algoB = document.getElementById('hash-verify-modeb-algo');
    if (algoB) algoB.value = 'SHA-256';
    const resultBannerB = document.getElementById('hash-verify-modeb-result');
    if (resultBannerB) resultBannerB.innerHTML = '';
    const progressB = document.getElementById('hash-verify-modeb-progress');
    if (progressB) progressB.classList.add('hidden');

    // Mode C reset
    modeCText = '';
    modeCExpectedHash = '';
    modeCAlgo = 'AUTO';
    isComputingModeC = false;

    const textC = document.getElementById('hash-verify-modec-text');
    if (textC) textC.value = '';
    const expC = document.getElementById('hash-verify-modec-expected');
    if (expC) expC.value = '';
    const algoC = document.getElementById('hash-verify-modec-algo');
    if (algoC) algoC.value = 'AUTO';
    const resultBannerC = document.getElementById('hash-verify-modec-result');
    if (resultBannerC) resultBannerC.innerHTML = '';
    const valMsgC = document.getElementById('hash-verify-modec-validation');
    if (valMsgC) valMsgC.innerHTML = '';

    // Handoff banner reset
    const banner = document.getElementById('hash-verify-handoff-alert');
    if (banner) banner.classList.add('hidden');

    selectMode('modeA');
  }

  function wireResultCopyButtons(container) {
    if (!container) return;
    container.querySelectorAll('.hash-verify-copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const textToCopy = btn.getAttribute('data-copy-hash');
        if (!textToCopy) return;

        const origHtml = btn.innerHTML;
        const origClass = btn.className;
        btn.innerHTML = '<span class="material-symbols-outlined text-[12px] text-emerald-400">check</span><span>COPIED!</span>';
        btn.className = 'hash-verify-copy-btn px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 text-[10px] uppercase font-bold shrink-0 cursor-pointer flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.3)]';

        setTimeout(() => {
          btn.innerHTML = origHtml;
          btn.className = origClass;
        }, 1800);

        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(textToCopy);
          } else {
            throw new Error('No clipboard API');
          }
        } catch (e) {
          try {
            const ta = document.createElement('textarea');
            ta.value = textToCopy;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          } catch (err) {}
        }
      });
    });
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  root.CastleHashVerifier = {
    initTab3,
    selectMode,
    loadModeAFile,
    runModeAComparison,
    runModeBComparison,
    runModeCComparison,
    handleHandoff,
    reset
  };
})(typeof window !== 'undefined' ? window : this);
