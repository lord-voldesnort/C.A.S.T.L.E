/**
 * Castle Hash Toolkit — Tab 2: Generate Module
 * Source toggle (Text / File), Algorithm selection, Live hashing, VirusTotal link, Copy feedback.
 */
(function(root) {
  let sourceMode = 'text'; // 'text' | 'file'
  let selectedFile = null;
  let textDebounceTimer = null;
  let isHashing = false;

  const activeAlgorithms = {
    'MD5': false,
    'SHA-1': false,
    'SHA-256': true,
    'SHA-512': false
  };

  function initTab2() {
    bindSourceToggle();
    bindAlgorithmCheckboxes();
    bindTextInput();
    bindFileInput();
    renderResults();
  }

  function bindSourceToggle() {
    const btnText = document.getElementById('hash-gen-source-text');
    const btnFile = document.getElementById('hash-gen-source-file');
    const textPanel = document.getElementById('hash-gen-text-panel');
    const filePanel = document.getElementById('hash-gen-file-panel');

    if (!btnText || !btnFile || !textPanel || !filePanel) return;

    btnText.addEventListener('click', () => {
      sourceMode = 'text';
      btnText.className = 'flex-1 py-xs px-sm rounded font-code text-xs font-bold uppercase transition-all bg-primary/20 text-primary border border-primary/50 cursor-pointer';
      btnFile.className = 'flex-1 py-xs px-sm rounded font-code text-xs font-bold uppercase transition-all bg-surface-container-lowest text-text-secondary border border-border/50 hover:text-on-surface cursor-pointer';
      textPanel.classList.remove('hidden');
      filePanel.classList.add('hidden');
      triggerHashing();
    });

    btnFile.addEventListener('click', () => {
      sourceMode = 'file';
      btnFile.className = 'flex-1 py-xs px-sm rounded font-code text-xs font-bold uppercase transition-all bg-primary/20 text-primary border border-primary/50 cursor-pointer';
      btnText.className = 'flex-1 py-xs px-sm rounded font-code text-xs font-bold uppercase transition-all bg-surface-container-lowest text-text-secondary border border-border/50 hover:text-on-surface cursor-pointer';
      filePanel.classList.remove('hidden');
      textPanel.classList.add('hidden');
      triggerHashing();
    });
  }

  function bindAlgorithmCheckboxes() {
    const checkboxes = document.querySelectorAll('input[name="hash-gen-algo"]');
    checkboxes.forEach(cb => {
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

  function bindTextInput() {
    const textInput = document.getElementById('hash-gen-text-input');
    if (!textInput) return;

    textInput.addEventListener('input', () => {
      clearTimeout(textDebounceTimer);
      textDebounceTimer = setTimeout(triggerHashing, 100);
    });
  }

  function bindFileInput() {
    const dropzone = document.getElementById('hash-gen-dropzone');
    const fileInput = document.getElementById('hash-gen-file-input');
    const fileInfo = document.getElementById('hash-gen-file-info');

    if (!dropzone || !fileInput) return;

    // Reuse existing drop-zone click and drag-and-drop triggers
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
        handleSelectedFile(e.dataTransfer.files[0]);
      }
    });
  }

  function handleSelectedFile(file) {
    selectedFile = file;
    const fileInfo = document.getElementById('hash-gen-file-info');
    if (fileInfo) {
      const sizeFormatted = formatBytes(file.size);
      fileInfo.innerHTML = `
        <div class="flex items-center gap-xs text-xs font-code text-primary bg-primary/10 p-xs rounded border border-primary/30">
          <span class="material-symbols-outlined text-[18px]">description</span>
          <span class="font-bold truncate max-w-[200px] md:max-w-[300px]">${escapeHtml(file.name)}</span>
          <span class="text-text-muted">(${sizeFormatted})</span>
        </div>
      `;
    }
    // Auto-hash immediately on drop/select
    triggerHashing();
  }

  async function triggerHashing() {
    if (isHashing) return;
    const resultsContainer = document.getElementById('hash-gen-results');
    const progressEl = document.getElementById('hash-gen-progress');
    if (!resultsContainer) return;

    const checkedAlgos = Object.keys(activeAlgorithms).filter(a => activeAlgorithms[a]);
    if (checkedAlgos.length === 0) {
      resultsContainer.innerHTML = `<div class="text-xs font-code text-warning p-xs">Select at least one hashing algorithm above.</div>`;
      return;
    }

    isHashing = true;
    if (progressEl) progressEl.classList.remove('hidden');

    const results = {};

    try {
      if (sourceMode === 'text') {
        const textVal = document.getElementById('hash-gen-text-input')?.value || '';
        for (const algo of checkedAlgos) {
          results[algo] = await root.CastleHashEngine.hashString(algo, textVal);
        }
      } else { // file mode
        if (!selectedFile) {
          resultsContainer.innerHTML = `<div class="text-xs font-code text-text-muted p-xs bg-surface-container-lowest rounded border border-border/40">Select or drop a file above to compute checksums.</div>`;
          isHashing = false;
          if (progressEl) progressEl.classList.add('hidden');
          return;
        }

        for (const algo of checkedAlgos) {
          results[algo] = await root.CastleHashEngine.hashFile(algo, selectedFile, (pct) => {
            const bar = document.getElementById('hash-gen-progress-bar');
            const text = document.getElementById('hash-gen-progress-text');
            if (bar) bar.style.width = `${pct}%`;
            if (text) text.textContent = `Hashing ${algo}... ${pct}%`;
          });
        }
      }

      renderResults(results);
    } catch (err) {
      console.error('Error during hashing:', err);
      resultsContainer.innerHTML = `<div class="text-xs font-code text-danger p-xs">Error computing hash: ${escapeHtml(err.message)}</div>`;
    } finally {
      isHashing = false;
      if (progressEl) progressEl.classList.add('hidden');
    }
  }

  function renderResults(resultsMap = {}) {
    const container = document.getElementById('hash-gen-results');
    if (!container) return;

    const checkedAlgos = Object.keys(activeAlgorithms).filter(a => activeAlgorithms[a]);
    if (checkedAlgos.length === 0) {
      container.innerHTML = `<div class="text-xs font-code text-warning p-xs">Select at least one algorithm above.</div>`;
      return;
    }

    let html = '';
    checkedAlgos.forEach(algo => {
      const hashVal = resultsMap[algo] || '...';
      const isFileMode = sourceMode === 'file' && selectedFile && hashVal !== '...';
      const vtUrl = isFileMode ? `https://www.virustotal.com/gui/search/${hashVal}` : null;

      html += `
        <div class="flex flex-col gap-xs p-xs md:p-sm bg-surface-container-lowest border border-border/60 rounded">
          <div class="flex justify-between items-center">
            <span class="font-code text-xs font-bold text-primary uppercase">${algo}:</span>
            ${isFileMode ? `
              <a href="${vtUrl}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-code text-primary/80 hover:text-primary hover:underline flex items-center gap-[2px]">
                Search on VirusTotal ↗
              </a>
            ` : ''}
          </div>
          <div class="flex items-center gap-xs bg-bg-main border border-border/80 rounded p-xs">
            <input readonly type="text" value="${escapeHtml(hashVal)}" class="w-full bg-transparent font-code text-xs md:text-sm text-text-primary select-all outline-none truncate" />
            <button data-copy-val="${escapeHtml(hashVal)}" class="hash-gen-copy-btn btn-primary text-[10px] py-[3px] px-xs uppercase cursor-pointer shrink-0 flex items-center gap-[2px]">
              <span class="material-symbols-outlined text-[12px]">content_copy</span>
              <span>Copy</span>
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Attach copy button listeners
    container.querySelectorAll('.hash-gen-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const textToCopy = btn.getAttribute('data-copy-val');
        if (!textToCopy || textToCopy === '...') return;
        navigator.clipboard.writeText(textToCopy).then(() => {
          const origText = btn.innerHTML;
          btn.innerHTML = `<span class="material-symbols-outlined text-[12px]">check</span><span>Copied!</span>`;
          btn.classList.add('bg-success', 'text-black');
          setTimeout(() => {
            btn.innerHTML = origText;
            btn.classList.remove('bg-success', 'text-black');
          }, 1500);
        });
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

  root.CastleHashGenerator = {
    initTab2,
    triggerHashing
  };
})(typeof window !== 'undefined' ? window : this);
