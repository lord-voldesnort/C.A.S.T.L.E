/**
 * Castle Hash Toolkit — Tab 3: Verifier Module
 * Mode A: Compare file to known hash (auto-detected algorithm by length)
 * Mode B: Compare two files (side-by-side, stacking on mobile, SHA-256 fixed)
 * Accessible green/red result banners with icons + text labels.
 */
(function(root) {
  let mode = 'modeA'; // 'modeA' | 'modeB'

  // Mode A state
  let modeAFile = null;
  let modeAExpectedHash = '';
  let isComputingModeA = false; // guard against concurrent hash runs

  // Mode B state
  let modeBFileA = null;
  let modeBFileB = null;

  function initTab3() {
    bindModeToggle();
    bindModeA();
    bindModeB();
  }

  function selectModeA() {
    const btnA = document.getElementById('hash-verify-toggle-a');
    const btnB = document.getElementById('hash-verify-toggle-b');
    const containerA = document.getElementById('hash-verify-panel-a');
    const containerB = document.getElementById('hash-verify-panel-b');
    if (!btnA || !btnB || !containerA || !containerB) return;

    mode = 'modeA';
    btnA.className = 'flex-1 py-xs px-sm rounded font-code text-xs font-bold uppercase transition-all bg-primary/20 text-primary border border-primary/50 cursor-pointer';
    btnB.className = 'flex-1 py-xs px-sm rounded font-code text-xs font-bold uppercase transition-all bg-surface-container-lowest text-text-secondary border border-border/50 hover:text-on-surface cursor-pointer';
    containerA.classList.remove('hidden');
    containerB.classList.add('hidden');
    runModeAComparison();
  }

  function bindModeToggle() {
    const btnA = document.getElementById('hash-verify-toggle-a');
    const btnB = document.getElementById('hash-verify-toggle-b');
    const containerA = document.getElementById('hash-verify-panel-a');
    const containerB = document.getElementById('hash-verify-panel-b');

    if (!btnA || !btnB || !containerA || !containerB) return;

    btnA.addEventListener('click', selectModeA);

    btnB.addEventListener('click', () => {
      mode = 'modeB';
      btnB.className = 'flex-1 py-xs px-sm rounded font-code text-xs font-bold uppercase transition-all bg-primary/20 text-primary border border-primary/50 cursor-pointer';
      btnA.className = 'flex-1 py-xs px-sm rounded font-code text-xs font-bold uppercase transition-all bg-surface-container-lowest text-text-secondary border border-border/50 hover:text-on-surface cursor-pointer';
      containerB.classList.remove('hidden');
      containerA.classList.add('hidden');
      runModeBComparison();
    });
  }

  function bindModeA() {
    const dropzone = document.getElementById('hash-verify-modea-dropzone');
    const fileInput = document.getElementById('hash-verify-modea-file-input');
    const hashInput = document.getElementById('hash-verify-modea-expected');

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
        dropzone.classList.add('border-primary', 'bg-primary/5');
      });

      dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-primary', 'bg-primary/5');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-primary', 'bg-primary/5');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleModeAFile(e.dataTransfer.files[0]);
        }
      });
    }

    if (hashInput) {
      hashInput.addEventListener('input', () => {
        modeAExpectedHash = hashInput.value.trim();
        runModeAComparison();
      });
    }
  }

  function handleModeAFile(file) {
    modeAFile = file;
    const fileName = file.name || 'decrypted-file';
    const fileInfo = document.getElementById('hash-verify-modea-file-info');
    if (fileInfo) {
      fileInfo.innerHTML = `
        <div class="flex items-center gap-xs text-xs font-code text-primary bg-primary/10 p-xs rounded border border-primary/30">
          <span class="material-symbols-outlined text-[18px]">description</span>
          <span class="font-bold truncate max-w-[200px] md:max-w-[300px]">${escapeHtml(fileName)}</span>
          <span class="text-text-muted">(${formatBytes(file.size)})</span>
        </div>
      `;
    }
    runModeAComparison();
  }

  /**
   * Loads an in-memory file into Verify Mode A without requiring a file input.
   * This is intentionally public so local Castle tools can hand off generated
   * files while keeping their contents inside the browser.
   */
  function loadModeAFile(file, expectedHash = '') {
    if (!(file instanceof Blob)) {
      throw new TypeError('Hash Toolkit handoff requires a File or Blob.');
    }
    // Set state BEFORE calling selectModeA / handleModeAFile so the comparison
    // triggered by those calls already has both the file and the expected hash.
    modeAFile = file;
    if (expectedHash) {
      modeAExpectedHash = expectedHash.trim();
      const hashInput = document.getElementById('hash-verify-modea-expected');
      if (hashInput) hashInput.value = modeAExpectedHash;
    }
    // Update the file-info label manually (handleModeAFile would overwrite modeAFile
    // with the same value and trigger a redundant second comparison, so we skip it).
    const fileName = file.name || 'decrypted-file';
    const fileInfo = document.getElementById('hash-verify-modea-file-info');
    if (fileInfo) {
      fileInfo.innerHTML = `
        <div class="flex items-center gap-xs text-xs font-code text-primary bg-primary/10 p-xs rounded border border-primary/30">
          <span class="material-symbols-outlined text-[18px]">description</span>
          <span class="font-bold truncate max-w-[200px] md:max-w-[300px]">${escapeHtml(fileName)}</span>
          <span class="text-text-muted">(${formatBytes(file.size)})</span>
        </div>
      `;
    }
    // Now switch to Mode A — this triggers exactly ONE runModeAComparison with full state.
    selectModeA();
  }

  async function runModeAComparison() {
    // Prevent two simultaneous hash computations from colliding.
    if (isComputingModeA) return;

    const resultBanner = document.getElementById('hash-verify-modea-result');
    const validationMsg = document.getElementById('hash-verify-modea-validation');
    const progressEl = document.getElementById('hash-verify-modea-progress');

    if (!resultBanner || !validationMsg) return;

    validationMsg.innerHTML = '';
    resultBanner.innerHTML = '';

    if (!modeAExpectedHash && !modeAFile) {
      return;
    }

    if (modeAExpectedHash) {
      const detectedAlgo = root.CastleHashEngine.autoDetectAlgorithm(modeAExpectedHash);
      if (!detectedAlgo) {
        validationMsg.innerHTML = `
          <div class="p-xs bg-danger/10 border border-danger/40 text-danger text-xs font-code rounded flex items-center gap-xs">
            <span class="material-symbols-outlined text-[16px]">error</span>
            <span>That doesn't look like a valid hash — check for typos or missing characters.</span>
          </div>
        `;
        return;
      }
    }

    if (!modeAFile) {
      validationMsg.innerHTML = `<div class="text-xs font-code text-text-muted">Select or drop a file above to compare.</div>`;
      return;
    }

    if (!modeAExpectedHash) {
      validationMsg.innerHTML = `<div class="text-xs font-code text-text-muted">Paste the expected hash above to complete comparison.</div>`;
      return;
    }

    const algo = root.CastleHashEngine.autoDetectAlgorithm(modeAExpectedHash);

    isComputingModeA = true;
    if (progressEl) progressEl.classList.remove('hidden');

    try {
      const computedHash = await root.CastleHashEngine.hashFile(algo, modeAFile, (pct) => {
        const bar = document.getElementById('hash-verify-modea-progress-bar');
        const text = document.getElementById('hash-verify-modea-progress-text');
        if (bar) bar.style.width = `${pct}%`;
        if (text) text.textContent = `Computing ${algo}... ${pct}%`;
      });

      const isMatch = computedHash.toLowerCase() === modeAExpectedHash.toLowerCase();

      if (isMatch) {
        resultBanner.innerHTML = `
          <div class="p-sm bg-success/15 border-2 border-success text-success rounded-lg flex flex-col gap-xs">
            <div class="flex items-center gap-xs font-bold text-sm md:text-base">
              <span class="material-symbols-outlined text-[24px]">check_circle</span>
              <span>Match — this file is identical to what the hash represents.</span>
            </div>
            <div class="flex flex-col gap-xs pl-[32px]">
              <div class="text-xs font-code text-success/80">Compared using <strong>${algo}</strong></div>
              <div class="text-xs font-code text-success/70 flex items-center gap-xs flex-wrap">
                <span>${algo} hash:</span>
                <code class="bg-black/30 px-xs py-[2px] rounded break-all select-all text-success">${computedHash}</code>
                <button data-copy-hash="${computedHash}" class="shrink-0 text-[10px] font-bold uppercase border border-success/40 px-xs py-[1px] rounded hover:bg-success/20 transition-colors cursor-pointer">Copy</button>
              </div>
            </div>
          </div>
        `;
        // Wire copy button
        const copyBtn = resultBanner.querySelector('[data-copy-hash]');
        if (copyBtn) copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(copyBtn.getAttribute('data-copy-hash')).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
          });
        });
      } else {
        resultBanner.innerHTML = `
          <div class="p-sm bg-danger/15 border-2 border-danger text-danger rounded-lg flex flex-col gap-xs">
            <div class="flex items-center gap-xs font-bold text-sm md:text-base">
              <span class="material-symbols-outlined text-[24px]">cancel</span>
              <span>No match — this file differs from what the hash represents.</span>
            </div>
            <div class="flex flex-col gap-xs pl-[32px]">
              <div class="text-xs font-code text-danger/80">Computed ${algo}:</div>
              <code class="bg-black/40 px-xs py-[2px] rounded break-all select-all text-xs font-code text-danger">${computedHash}</code>
            </div>
          </div>
        `;
      }
    } catch (err) {
      console.error('Mode A verify error:', err);
      resultBanner.innerHTML = `<div class="p-xs bg-danger/20 border border-danger text-danger text-xs font-code rounded">Error hashing file: ${escapeHtml(err.message)}</div>`;
    } finally {
      isComputingModeA = false;
      if (progressEl) progressEl.classList.add('hidden');
    }
  }

  function bindModeB() {
    setupModeBDropzone('hash-verify-modeb-dropzone-a', 'hash-verify-modeb-file-a', (file) => {
      modeBFileA = file;
      updateModeBFileInfo('a', file);
      runModeBComparison();
    });

    setupModeBDropzone('hash-verify-modeb-dropzone-b', 'hash-verify-modeb-file-b', (file) => {
      modeBFileB = file;
      updateModeBFileInfo('b', file);
      runModeBComparison();
    });
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
      dz.classList.add('border-primary', 'bg-primary/5');
    });

    dz.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dz.classList.remove('border-primary', 'bg-primary/5');
    });

    dz.addEventListener('drop', (e) => {
      e.preventDefault();
      dz.classList.remove('border-primary', 'bg-primary/5');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileSelected(e.dataTransfer.files[0]);
      }
    });
  }

  function updateModeBFileInfo(target, file) {
    const container = document.getElementById(`hash-verify-modeb-info-${target}`);
    if (container) {
      container.innerHTML = `
        <div class="flex items-center gap-xs text-xs font-code text-primary bg-primary/10 p-xs rounded border border-primary/30 mt-xs">
          <span class="material-symbols-outlined text-[18px]">description</span>
          <span class="font-bold truncate max-w-[150px]">${escapeHtml(file.name)}</span>
          <span class="text-text-muted">(${formatBytes(file.size)})</span>
        </div>
      `;
    }
  }

  async function runModeBComparison() {
    const resultBanner = document.getElementById('hash-verify-modeb-result');
    const progressEl = document.getElementById('hash-verify-modeb-progress');
    if (!resultBanner) return;

    resultBanner.innerHTML = '';

    if (!modeBFileA || !modeBFileB) {
      return;
    }

    if (progressEl) progressEl.classList.remove('hidden');

    try {
      const hashA = await root.CastleHashEngine.hashFile('SHA-256', modeBFileA, (pct) => {
        const bar = document.getElementById('hash-verify-modeb-progress-bar');
        const text = document.getElementById('hash-verify-modeb-progress-text');
        if (bar) bar.style.width = `${pct / 2}%`;
        if (text) text.textContent = `Hashing File A... ${Math.round(pct / 2)}%`;
      });

      const hashB = await root.CastleHashEngine.hashFile('SHA-256', modeBFileB, (pct) => {
        const bar = document.getElementById('hash-verify-modeb-progress-bar');
        const text = document.getElementById('hash-verify-modeb-progress-text');
        if (bar) bar.style.width = `${50 + (pct / 2)}%`;
        if (text) text.textContent = `Hashing File B... ${Math.round(50 + (pct / 2))}%`;
      });

      const isMatch = hashA === hashB;

      if (isMatch) {
        resultBanner.innerHTML = `
          <div class="p-sm bg-success/15 border-2 border-success text-success rounded-lg flex items-center gap-xs font-bold text-sm md:text-base">
            <span class="material-symbols-outlined text-[24px]">check_circle</span>
            <span>Match — these two files are identical.</span>
          </div>
        `;
      } else {
        resultBanner.innerHTML = `
          <div class="p-sm bg-danger/15 border-2 border-danger text-danger rounded-lg flex items-center gap-xs font-bold text-sm md:text-base">
            <span class="material-symbols-outlined text-[24px]">cancel</span>
            <span>No match — these two files are different.</span>
          </div>
        `;
      }
    } catch (err) {
      console.error('Mode B verify error:', err);
      resultBanner.innerHTML = `<div class="p-xs bg-danger/20 border border-danger text-danger text-xs font-code rounded">Error comparing files: ${escapeHtml(err.message)}</div>`;
    } finally {
      if (progressEl) progressEl.classList.add('hidden');
    }
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
    loadModeAFile,
    runModeAComparison,
    runModeBComparison
  };
})(typeof window !== 'undefined' ? window : this);
