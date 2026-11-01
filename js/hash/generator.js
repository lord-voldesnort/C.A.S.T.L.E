/**
 * Castle Hash Toolkit — Tab 2: Generate Module
 * Handles text and binary file hashing across SHA-256, SHA-512, SHA-1, and MD5.
 * Features:
 * - Text mode with live UTF-8 byte telemetry and empty state handling
 * - File mode with chunked binary hashing and progress reporting
 * - Algorithm selection with clear security status distinctions
 * - Instant copy feedback with resilient fallback
 * - Cross-tab handoff to Verify tab
 * - VirusTotal search links for binary files
 */
(function(root) {
  let sourceMode = 'text'; // 'text' | 'file'
  let selectedFile = null;
  let textDebounceTimer = null;
  let isHashing = false;
  let lastComputedInput = null; // Guard against displaying stale results

  const activeAlgorithms = {
    'MD5': false,
    'SHA-1': false,
    'SHA-256': true,
    'SHA-512': false
  };

  const ALGO_METADATA = {
    'SHA-256': {
      bits: 256,
      hexChars: 64,
      badgeText: 'RECOMMENDED',
      badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      borderClass: 'border-emerald-500/30',
      statusNote: 'Collision resistant'
    },
    'SHA-512': {
      bits: 512,
      hexChars: 128,
      badgeText: 'RECOMMENDED',
      badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      borderClass: 'border-emerald-500/30',
      statusNote: 'High assurance'
    },
    'SHA-1': {
      bits: 160,
      hexChars: 40,
      badgeText: 'DEPRECATED',
      badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      borderClass: 'border-amber-500/30',
      statusNote: 'Collision-broken'
    },
    'MD5': {
      bits: 128,
      hexChars: 32,
      badgeText: 'BROKEN',
      badgeClass: 'text-red-400 bg-red-500/10 border-red-500/30',
      borderClass: 'border-red-500/30',
      statusNote: 'Collision-broken'
    }
  };

  function initTab2() {
    bindSourceToggle();
    bindAlgorithmCheckboxes();
    bindTextInput();
    bindFileInput();
    bindExecuteButton();
    updateTextTelemetry();
    renderInitialState();
  }

  function bindSourceToggle() {
    const btnText = document.getElementById('hash-gen-source-text');
    const btnFile = document.getElementById('hash-gen-source-file');
    const textPanel = document.getElementById('hash-gen-text-panel');
    const filePanel = document.getElementById('hash-gen-file-panel');

    if (!btnText || !btnFile || !textPanel || !filePanel) return;

    btnText.addEventListener('click', () => {
      sourceMode = 'text';
      btnText.className = 'flex-1 py-2 px-3 rounded font-mono text-xs font-bold uppercase transition-all bg-brand-orange text-black border border-brand-orange shadow-[0_0_12px_rgba(255,106,0,0.3)] cursor-pointer flex items-center justify-center gap-1.5';
      btnFile.className = 'flex-1 py-2 px-3 rounded font-mono text-xs font-bold uppercase transition-all bg-[#0D0D0D] text-zinc-400 border border-[#1A1A1A] hover:text-white hover:bg-[#1A1A1A] cursor-pointer flex items-center justify-center gap-1.5';
      textPanel.classList.remove('hidden');
      filePanel.classList.add('hidden');
      triggerHashing();
    });

    btnFile.addEventListener('click', () => {
      sourceMode = 'file';
      btnFile.className = 'flex-1 py-2 px-3 rounded font-mono text-xs font-bold uppercase transition-all bg-brand-orange text-black border border-brand-orange shadow-[0_0_12px_rgba(255,106,0,0.3)] cursor-pointer flex items-center justify-center gap-1.5';
      btnText.className = 'flex-1 py-2 px-3 rounded font-mono text-xs font-bold uppercase transition-all bg-[#0D0D0D] text-zinc-400 border border-[#1A1A1A] hover:text-white hover:bg-[#1A1A1A] cursor-pointer flex items-center justify-center gap-1.5';
      filePanel.classList.remove('hidden');
      textPanel.classList.add('hidden');
      triggerHashing();
    });
  }

  function bindAlgorithmCheckboxes() {
    const checkboxes = document.querySelectorAll('input[name="hash-gen-algo"]');
    checkboxes.forEach(cb => {
      activeAlgorithms[cb.value] = cb.checked;
      cb.addEventListener('change', (e) => {
        const algo = e.target.value;
        const checkedCount = Object.values(activeAlgorithms).filter(Boolean).length;

        // Block unchecking if it's the last active algorithm
        if (!e.target.checked && checkedCount <= 1) {
          e.target.checked = true;
          return;
        }

        activeAlgorithms[algo] = e.target.checked;
        triggerHashing();
      });
    });
  }

  function setAlgorithm(algo, active) {
    if (activeAlgorithms.hasOwnProperty(algo)) {
      activeAlgorithms[algo] = !!active;
      const cb = document.querySelector(`input[name="hash-gen-algo"][value="${algo}"]`);
      if (cb) cb.checked = !!active;
      triggerHashing();
    }
  }

  function bindTextInput() {
    const textInput = document.getElementById('hash-gen-text-input');
    const clearBtn = document.getElementById('hash-gen-text-clear');

    if (textInput) {
      textInput.addEventListener('input', () => {
        updateTextTelemetry();
        clearTimeout(textDebounceTimer);
        textDebounceTimer = setTimeout(triggerHashing, 120);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (!textInput) return;
        textInput.value = '';
        updateTextTelemetry();
        triggerHashing();
      });
    }
  }

  function updateTextTelemetry() {
    const textInput = document.getElementById('hash-gen-text-input');
    const charsEl = document.getElementById('hash-gen-text-chars');
    const bytesEl = document.getElementById('hash-gen-text-bytes');
    if (!textInput) return;

    const val = textInput.value;
    const charCount = val.length;
    const byteCount = new TextEncoder().encode(val).length;

    if (charsEl) charsEl.textContent = charCount;
    if (bytesEl) bytesEl.textContent = byteCount;
  }

  function bindFileInput() {
    const dropzone = document.getElementById('hash-gen-dropzone');
    const fileInput = document.getElementById('hash-gen-file-input');

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', (e) => {
      if (e.target !== fileInput) fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleSelectedFile(e.target.files[0]);
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
        handleSelectedFile(e.dataTransfer.files[0]);
      }
    });
  }

  function handleSelectedFile(file) {
    selectedFile = file;
    const fileInfo = document.getElementById('hash-gen-file-info');
    if (fileInfo) {
      const sizeFormatted = formatBytes(file.size);
      const mime = file.type || 'binary/octet-stream';
      fileInfo.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#050505] border border-brand-orange/40 rounded-lg text-xs font-mono">
          <div class="flex items-center gap-2 text-zinc-200 truncate">
            <span class="material-symbols-outlined text-brand-orange text-lg shrink-0">description</span>
            <span class="font-bold text-white truncate max-w-[220px] sm:max-w-[360px]">${escapeHtml(file.name)}</span>
            <span class="text-zinc-500">(${sizeFormatted} · ${escapeHtml(mime)})</span>
          </div>
          <button id="hash-gen-remove-file" type="button" class="text-zinc-400 hover:text-red-400 text-[11px] uppercase font-bold transition-colors cursor-pointer self-start sm:self-auto">
            Remove
          </button>
        </div>
      `;

      const removeBtn = document.getElementById('hash-gen-remove-file');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          selectedFile = null;
          const finput = document.getElementById('hash-gen-file-input');
          if (finput) finput.value = '';
          fileInfo.innerHTML = '';
          renderInitialState();
        });
      }
    }

    triggerHashing();
  }

  function bindExecuteButton() {
    const btn = document.getElementById('hash-gen-execute-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        triggerHashing(true);
      });
    }
  }

  function renderInitialState() {
    const resultsContainer = document.getElementById('hash-gen-results');
    if (!resultsContainer) return;

    if (sourceMode === 'file' && !selectedFile) {
      resultsContainer.innerHTML = `
        <div class="p-4 bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl text-xs font-mono text-zinc-400 flex items-center gap-2.5">
          <span class="material-symbols-outlined text-zinc-500 text-base">info</span>
          <span>Select or drop a file above to generate digests across all active algorithms.</span>
        </div>
      `;
    } else {
      triggerHashing();
    }
  }

  async function triggerHashing(force = false) {
    if (isHashing) return;
    const resultsContainer = document.getElementById('hash-gen-results');
    const progressEl = document.getElementById('hash-gen-progress');
    const progressBar = document.getElementById('hash-gen-progress-bar');
    const progressText = document.getElementById('hash-gen-progress-text');
    if (!resultsContainer) return;

    const checkedAlgos = Object.keys(activeAlgorithms).filter(a => activeAlgorithms[a]);
    if (checkedAlgos.length === 0) {
      resultsContainer.innerHTML = `
        <div class="p-3 bg-[#120B05] border border-amber-500/40 text-amber-400 text-xs font-mono rounded-lg flex items-center gap-2">
          <span class="material-symbols-outlined text-base">warning</span>
          <span>Select at least one algorithm above to compute digests.</span>
        </div>
      `;
      return;
    }

    if (sourceMode === 'file' && !selectedFile) {
      resultsContainer.innerHTML = `
        <div class="p-4 bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl text-xs font-mono text-zinc-400 flex items-center gap-2.5">
          <span class="material-symbols-outlined text-zinc-500 text-base">info</span>
          <span>Select or drop a file above to generate digests across all active algorithms.</span>
        </div>
      `;
      return;
    }

    const currentTextVal = document.getElementById('hash-gen-text-input')?.value ?? '';
    const currentInputKey = sourceMode === 'text'
      ? `text:${currentTextVal}`
      : `file:${selectedFile?.name}:${selectedFile?.size}:${selectedFile?.lastModified}`;

    isHashing = true;
    if (progressEl) progressEl.classList.remove('hidden');

    const results = {};
    const timings = {};

    try {
      if (sourceMode === 'text') {
        const textVal = currentTextVal;
        for (const algo of checkedAlgos) {
          const t0 = performance.now();
          results[algo] = await root.CastleHashEngine.hashString(algo, textVal);
          timings[algo] = Math.max(0.1, performance.now() - t0).toFixed(1);
        }
      } else {
        const file = selectedFile;
        const totalAlgos = checkedAlgos.length;
        let completedAlgos = 0;

        for (const algo of checkedAlgos) {
          const t0 = performance.now();
          results[algo] = await root.CastleHashEngine.hashFile(algo, file, (pct) => {
            const overallPct = Math.round(((completedAlgos * 100) + pct) / totalAlgos);
            if (progressBar) {
              progressBar.style.width = '100%';
              progressBar.style.transformOrigin = 'left';
              progressBar.style.transform = `scaleX(${Math.max(0, Math.min(100, overallPct)) / 100})`;
              progressBar.classList.add('meter-bar-fill');
            }
            if (progressText) progressText.textContent = `Computing ${algo}... ${pct}% (Overall: ${overallPct}%)`;
          });
          timings[algo] = Math.max(0.1, performance.now() - t0).toFixed(1);
          completedAlgos++;
        }
      }

      lastComputedInput = currentInputKey;
      renderResults(results, timings);
    } catch (err) {
      console.error('Error generating hash:', err);
      resultsContainer.innerHTML = `
        <div class="p-3 bg-[#120B05] border border-red-500/40 text-red-400 text-xs font-mono rounded-lg flex items-center gap-2">
          <span class="material-symbols-outlined text-base">error</span>
          <span>Error computing hash: ${escapeHtml(err.message)}</span>
        </div>
      `;
    } finally {
      isHashing = false;
      if (progressEl) progressEl.classList.add('hidden');
    }
  }

  function renderResults(resultsMap = {}, timingsMap = {}) {
    const container = document.getElementById('hash-gen-results');
    if (!container) return;

    const checkedAlgos = Object.keys(activeAlgorithms).filter(a => activeAlgorithms[a]);
    if (checkedAlgos.length === 0) return;

    const isFile = sourceMode === 'file' && selectedFile;
    const textVal = document.getElementById('hash-gen-text-input')?.value || '';
    const byteLength = isFile ? selectedFile.size : new TextEncoder().encode(textVal).length;

    let html = '';
    checkedAlgos.forEach(algo => {
      const hashVal = resultsMap[algo] || '...';
      const meta = ALGO_METADATA[algo] || {
        bits: 0,
        hexChars: hashVal.length,
        badgeText: 'CUSTOM',
        badgeClass: 'text-zinc-400 bg-zinc-800 border-zinc-700',
        borderClass: 'border-[#222]',
        statusNote: ''
      };

      const computeTime = timingsMap[algo] ? `${timingsMap[algo]} ms` : '< 1 ms';
      const vtUrl = isFile && hashVal !== '...' ? `https://www.virustotal.com/gui/search/${hashVal}` : null;

      html += `
        <div data-algo="${algo}" class="bg-[#0D0D0D] border ${meta.borderClass} rounded-xl p-3.5 sm:p-4 flex flex-col gap-2.5 shadow-md pulse-generated">
          <!-- Card Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#1A1A1A] pb-2">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs sm:text-sm font-bold text-white tracking-wider">${algo}</span>
              <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${meta.badgeClass}">${meta.badgeText}</span>
              <span class="text-[10px] font-mono text-zinc-500">${meta.bits}-BIT · ${meta.hexChars} HEX</span>
            </div>
            <div class="flex items-center gap-2 self-start sm:self-auto font-mono text-[11px] text-zinc-400">
              <span>TIME: <strong class="text-zinc-200">${computeTime}</strong></span>
              <span class="text-zinc-700">|</span>
              <span>INPUT: <strong class="text-zinc-200">${formatBytes(byteLength)}</strong></span>
            </div>
          </div>

          <!-- Digest Hex Box -->
          <div class="flex items-center gap-2 bg-[#000000] border border-[#222222] rounded-lg p-2.5">
            <input readonly type="text" value="${escapeHtml(hashVal)}" class="w-full bg-transparent font-mono text-xs md:text-sm text-brand-orange font-bold tracking-wider select-all outline-none truncate" />
            <button data-copy-hash="${escapeHtml(hashVal)}" type="button" class="hash-gen-copy-btn btn-tactile bg-brand-orange text-black hover:bg-orange-500 font-mono text-[11px] font-bold py-1 px-3 rounded uppercase cursor-pointer shrink-0 flex items-center gap-1 shadow-sm">
              <span class="material-symbols-outlined text-[13px]">content_copy</span>
              <span>COPY</span>
            </button>
          </div>

          <!-- Actions Toolbar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5 text-xs font-mono">
            <span class="text-[11px] text-zinc-500">${meta.statusNote}</span>
            <div class="flex items-center gap-2 self-end sm:self-auto">
              ${vtUrl ? `
                <a href="${vtUrl}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded bg-[#050505] hover:bg-[#1A1A1A] border border-[#262626] text-zinc-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors">
                  <span class="material-symbols-outlined text-[13px] text-cyan-400">travel_explore</span>
                  <span>VirusTotal ↗</span>
                </a>
              ` : ''}
              <button data-verify-handoff="${escapeHtml(hashVal)}" data-verify-algo="${algo}" type="button" class="hash-gen-verify-handoff-btn px-2.5 py-1 rounded bg-[#050505] hover:bg-brand-orange/20 border border-brand-orange/40 hover:border-brand-orange text-brand-orange text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer">
                <span class="material-symbols-outlined text-[13px]">verified</span>
                <span>VERIFY THIS HASH ➔</span>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Attach copy button listeners with instant visual feedback and textarea fallback
    container.querySelectorAll('.hash-gen-copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const textToCopy = btn.getAttribute('data-copy-hash');
        if (!textToCopy || textToCopy === '...') return;

        const origHtml = btn.innerHTML;
        const origClass = btn.className;
        btn.innerHTML = `<span class="material-symbols-outlined text-[13px] text-emerald-400">check</span><span class="text-emerald-400 font-bold">COPIED!</span>`;
        btn.className = 'hash-gen-copy-btn btn-tactile bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 font-mono text-[11px] font-bold py-1 px-3 rounded uppercase cursor-pointer shrink-0 flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.3)]';

        const card = btn.closest('[data-algo]');
        if (card) {
          card.classList.remove('pulse-generated');
          card.classList.add('pulse-copied');
          setTimeout(() => card.classList.remove('pulse-copied'), 600);
        }

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

    // Attach "VERIFY THIS HASH" handoff listeners
    container.querySelectorAll('.hash-gen-verify-handoff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const hash = btn.getAttribute('data-verify-handoff');
        const algo = btn.getAttribute('data-verify-algo');
        if (!hash || hash === '...') return;

        if (root.CastleHashUI && typeof root.CastleHashUI.handoffToVerify === 'function') {
          root.CastleHashUI.handoffToVerify({
            hash,
            algo,
            sourceMode,
            fileName: selectedFile ? selectedFile.name : null
          });
        }
      });
    });
  }

  function reset() {
    selectedFile = null;
    isHashing = false;
    sourceMode = 'text';
    lastComputedInput = null;

    activeAlgorithms['MD5'] = false;
    activeAlgorithms['SHA-1'] = false;
    activeAlgorithms['SHA-256'] = true;
    activeAlgorithms['SHA-512'] = false;

    const checkboxes = document.querySelectorAll('input[name="hash-gen-algo"]');
    checkboxes.forEach(cb => {
      cb.checked = (cb.value === 'SHA-256');
    });

    const textPanel = document.getElementById('hash-gen-text-panel');
    const filePanel = document.getElementById('hash-gen-file-panel');
    const btnText = document.getElementById('hash-gen-source-text');
    const btnFile = document.getElementById('hash-gen-source-file');
    if (textPanel && filePanel && btnText && btnFile) {
      textPanel.classList.remove('hidden');
      filePanel.classList.add('hidden');
      btnText.className = 'flex-1 py-2 px-3 rounded font-mono text-xs font-bold uppercase transition-all bg-brand-orange text-black border border-brand-orange shadow-[0_0_12px_rgba(255,106,0,0.3)] cursor-pointer flex items-center justify-center gap-1.5';
      btnFile.className = 'flex-1 py-2 px-3 rounded font-mono text-xs font-bold uppercase transition-all bg-[#0D0D0D] text-zinc-400 border border-[#1A1A1A] hover:text-white hover:bg-[#1A1A1A] cursor-pointer flex items-center justify-center gap-1.5';
    }

    const textInput = document.getElementById('hash-gen-text-input');
    if (textInput) textInput.value = '';

    const fileInput = document.getElementById('hash-gen-file-input');
    if (fileInput) fileInput.value = '';

    const fileInfo = document.getElementById('hash-gen-file-info');
    if (fileInfo) fileInfo.innerHTML = '';

    updateTextTelemetry();
    renderInitialState();
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

  root.CastleHashGenerator = {
    initTab2,
    setAlgorithm,
    triggerHashing,
    reset
  };
})(typeof window !== 'undefined' ? window : this);
