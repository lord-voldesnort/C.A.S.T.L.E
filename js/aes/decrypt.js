/* Castle AES Studio: Local AES-256-GCM Decryption Interface */
(function(root) {
  let encryptedFile = null;
  let isDecrypting = false;
  let opSeq = 0;
  let activeDecryptedBytes = null;
  let activeDecryptedFile = null;

  function init() {
    const fileInput = document.getElementById('aes-decrypt-file');
    const dropzone = document.getElementById('aes-decrypt-dropzone');
    const fileRemoveBtn = document.getElementById('aes-decrypt-file-remove');
    const cipherText = document.getElementById('aes-cipher-text');
    const cipherClearBtn = document.getElementById('aes-cipher-clear');
    const secretInput = document.getElementById('aes-decrypt-secret');
    const toggleSecret = document.getElementById('aes-toggle-decrypt-secret');
    const runBtn = document.getElementById('aes-decrypt-run');

    if (runBtn) runBtn.addEventListener('click', decrypt);

    // Ciphertext input inspection
    if (cipherText) {
      cipherText.addEventListener('input', inspectCiphertextInput);
    }
    if (cipherClearBtn) {
      cipherClearBtn.addEventListener('click', () => {
        if (cipherText) {
          cipherText.value = '';
          const modeEl = document.getElementById('aes-decrypt-mode');
          if (modeEl) {
            modeEl.textContent = 'The encrypted payload automatically detects whether it requires a passphrase or a saved random key.';
          }
          cipherText.focus();
        }
      });
    }

    // Show/hide secret toggle
    if (toggleSecret && secretInput) {
      toggleSecret.addEventListener('click', () => {
        const isPassword = secretInput.type === 'password';
        secretInput.type = isPassword ? 'text' : 'password';
        const icon = toggleSecret.querySelector('.material-symbols-outlined');
        if (icon) {
          icon.textContent = isPassword ? 'visibility_off' : 'visibility';
        }
        toggleSecret.title = isPassword ? 'Hide secret' : 'Show secret';
      });
    }

    // File input & Drag-and-drop
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropzone.classList.add('border-brand-orange');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-brand-orange');
      });
      dropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropzone.classList.remove('border-brand-orange');
        if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          setFile(event.dataTransfer.files[0]);
        }
      });
    }
    if (fileInput) {
      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
          setFile(fileInput.files[0]);
        }
      });
    }
    if (fileRemoveBtn) {
      fileRemoveBtn.addEventListener('click', clearFileSelection);
    }
  }

  function inspectCiphertextInput() {
    const cipherText = document.getElementById('aes-cipher-text');
    const modeEl = document.getElementById('aes-decrypt-mode');
    if (!cipherText || !modeEl) return;
    const text = cipherText.value.trim();
    if (!text) {
      modeEl.textContent = 'The encrypted payload automatically detects whether it requires a passphrase or a saved random key.';
      return;
    }

    try {
      let envelope;
      if (text.startsWith('{') && text.endsWith('}')) {
        envelope = JSON.parse(text);
      } else {
        envelope = root.CastleAES.parseTextEnvelope(text);
      }
      if (envelope && envelope.version === 1) {
        if (envelope.mode === 'random') {
          modeEl.innerHTML = '<span class="text-amber-400 font-bold">Random Key Required:</span> Enter the 256-bit key saved during encryption.';
        } else if (envelope.mode === 'passphrase') {
          modeEl.innerHTML = '<span class="text-emerald-400 font-bold">Passphrase Required:</span> Enter the secret passphrase used during encryption.';
        }
      }
    } catch (_) {
      // Not yet a complete or valid envelope, keep default
    }
  }

  function setFile(file) {
    if (!file) return;
    encryptedFile = file;
    const fileInfo = document.getElementById('aes-decrypt-file-info');
    const fileSelectedBox = document.getElementById('aes-decrypt-file-selected');
    if (fileInfo) {
      fileInfo.textContent = `${file.name} (${formatBytes(file.size)})`;
    }
    if (fileSelectedBox) {
      fileSelectedBox.classList.remove('hidden');
    }

    const modeEl = document.getElementById('aes-decrypt-mode');
    if (modeEl) {
      modeEl.textContent = `Encrypted file selected: ${file.name}. Validating envelope metadata on decryption.`;
    }
  }

  function clearFileSelection() {
    encryptedFile = null;
    const fileInput = document.getElementById('aes-decrypt-file');
    const fileInfo = document.getElementById('aes-decrypt-file-info');
    const fileSelectedBox = document.getElementById('aes-decrypt-file-selected');
    if (fileInput) fileInput.value = '';
    if (fileInfo) fileInfo.textContent = '';
    if (fileSelectedBox) fileSelectedBox.classList.add('hidden');
    const modeEl = document.getElementById('aes-decrypt-mode');
    if (modeEl) {
      modeEl.textContent = 'The encrypted payload automatically detects whether it requires a passphrase or a saved random key.';
    }
  }

  function validateEnvelopeStructure(envelope) {
    if (!envelope || typeof envelope !== 'object') {
      throw new Error('Invalid Castle encrypted payload: malformed envelope object.');
    }
    if (envelope.version !== 1) {
      throw new Error(`Unsupported Castle envelope version (${envelope.version}). Only version 1 is supported.`);
    }
    if (envelope.algorithm !== 'AES-256-GCM') {
      throw new Error(`Unsupported encryption algorithm (${envelope.algorithm}). Expected AES-256-GCM.`);
    }
    if (!envelope.data || typeof envelope.data !== 'string') {
      throw new Error('Malformed Castle envelope: missing or invalid ciphertext data.');
    }
    if (!envelope.iv || typeof envelope.iv !== 'string') {
      throw new Error('Malformed Castle envelope: missing initialization vector (IV).');
    }
    if (envelope.mode !== 'passphrase' && envelope.mode !== 'random') {
      throw new Error(`Unsupported key mode (${envelope.mode}). Expected passphrase or random.`);
    }
    if (envelope.mode === 'passphrase' && (!envelope.salt || typeof envelope.salt !== 'string')) {
      throw new Error('Malformed Castle envelope: missing salt for passphrase-derived key.');
    }
  }

  async function decrypt() {
    if (isDecrypting) return;
    const currentOp = ++opSeq;
    isDecrypting = true;

    const result = document.getElementById('aes-decrypt-result');
    const progress = document.getElementById('aes-decrypt-progress');
    const runBtn = document.getElementById('aes-decrypt-run');
    const modeEl = document.getElementById('aes-decrypt-mode');

    // CRITICAL SECURITY REQUIREMENT:
    // Always clear previous decrypted plaintext before starting a new decryption attempt!
    if (result) result.innerHTML = '';
    activeDecryptedBytes = null;
    activeDecryptedFile = null;

    if (progress) progress.classList.remove('hidden');
    updateProgress(10);

    if (runBtn) {
      runBtn.disabled = true;
      runBtn.classList.add('opacity-70', 'cursor-not-allowed');
      runBtn.innerHTML = `
        <span class="material-symbols-outlined text-[18px] animate-spin">refresh</span>
        <span>Decrypting & Verifying Authentication...</span>
      `;
    }

    try {
      const text = document.getElementById('aes-cipher-text')?.value.trim() || '';
      let envelope;

      if (encryptedFile) {
        updateProgress(25);
        envelope = await root.CastleAES.parseEncryptedFile(encryptedFile, (p) => updateProgress(25 + Math.round(p * 0.35)));
      } else if (text) {
        if (text.startsWith('{') && text.endsWith('}')) {
          try {
            envelope = JSON.parse(text);
          } catch (_) {
            envelope = root.CastleAES.parseTextEnvelope(text);
          }
        } else {
          envelope = root.CastleAES.parseTextEnvelope(text);
        }
      } else {
        throw new Error('Paste a ciphertext or choose an encrypted file.');
      }

      if (currentOp !== opSeq) return;

      // Strict pre-validation of envelope structure
      validateEnvelopeStructure(envelope);

      if (modeEl) {
        modeEl.textContent = envelope.mode === 'random'
          ? 'This payload requires its saved 256-bit random key.'
          : 'This payload requires its original secret passphrase.';
      }

      const secret = document.getElementById('aes-decrypt-secret')?.value || '';
      if (!secret) {
        throw new Error(envelope.mode === 'random'
          ? 'Enter the saved random key.'
          : 'Enter the secret passphrase.');
      }

      updateProgress(70);

      // Authenticated WebCrypto AES-256-GCM Decryption
      const decrypted = await root.CastleAES.decryptEnvelope(envelope, secret);

      if (currentOp !== opSeq) return;
      updateProgress(100);

      // Store authentic decrypted state
      activeDecryptedBytes = decrypted.bytes;

      renderResult(result, decrypted, secret);
    } catch (error) {
      // CRITICAL SECURITY REQUIREMENT:
      // On authentication failure or malformed payload, NEVER release plaintext.
      activeDecryptedBytes = null;
      activeDecryptedFile = null;

      if (currentOp === opSeq && result) {
        result.innerHTML = `
          <div class="p-3.5 border border-red-500/50 bg-red-500/10 text-red-400 text-xs font-mono rounded-lg flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] shrink-0">gpp_bad</span>
            <span>${escapeHtml(error.message)}</span>
          </div>
        `;
      }
    } finally {
      if (currentOp === opSeq) {
        if (progress) progress.classList.add('hidden');
        if (runBtn) {
          runBtn.disabled = false;
          runBtn.classList.remove('opacity-70', 'cursor-not-allowed');
          runBtn.innerHTML = `
            <span class="material-symbols-outlined text-[18px]">lock_open</span>
            <span>Decrypt Locally & Verify Authentication</span>
          `;
        }
        isDecrypting = false;
      }
    }
  }

  function renderResult(container, decrypted, secret) {
    if (!container) return;
    const envelope = decrypted.envelope;
    const isFile = envelope.type === 'file';

    const safeName = sanitizeFilename(envelope.name || (isFile ? 'restored-file.bin' : 'castle-message.txt'));
    const safeMime = sanitizeMime(envelope.mime || (isFile ? 'application/octet-stream' : 'text/plain'));
    const file = new File([decrypted.bytes], safeName, { type: safeMime });
    activeDecryptedFile = file;

    const coach = root.CastleAESCoach
      ? root.CastleAESCoach.review(envelope.mode, envelope.mode === 'passphrase' ? secret : '')
      : { score: 96, recommendation: '' };

    container.innerHTML = `
      <div class="p-4 border border-emerald-500/50 bg-[#0A1A12] rounded-lg flex flex-col gap-3 pulse-verified shadow-[0_0_24px_rgba(16,185,129,0.15)]">
        <div class="flex items-center justify-between pb-2 border-b border-emerald-500/20">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-400 text-[20px]">verified_user</span>
            <span class="text-emerald-400 font-bold text-xs uppercase font-mono tracking-wider">Decryption Complete & Authentication Verified</span>
          </div>
          <span class="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">AES-256-GCM TAG VERIFIED</span>
        </div>

        ${!isFile ? `
          <div class="flex flex-col gap-1.5">
            <label class="font-mono text-xs text-zinc-300 uppercase">Recovered Plaintext (Authenticity Confirmed):</label>
            <textarea id="aes-decrypted-plaintext" readonly class="w-full min-h-24 bg-[#000000] border border-[#262626] rounded-lg p-2.5 text-xs font-mono text-white select-all custom-scrollbar"></textarea>
            <div class="flex flex-wrap gap-2 pt-1">
              <button data-aes-copy-plain type="button" class="px-3 py-1.5 bg-brand-orange hover:bg-[#e05e00] text-black font-mono text-xs font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[15px]">content_copy</span> Copy Plaintext
              </button>
              <button data-aes-restored-download type="button" class="px-3 py-1.5 bg-[#141414] hover:bg-[#202020] text-zinc-300 hover:text-white border border-[#2A2A2A] font-mono text-xs font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[15px]">download</span> Download as Text File
              </button>
              <button data-aes-clear-plain type="button" class="px-3 py-1.5 bg-[#141414] hover:bg-[#202020] text-zinc-400 hover:text-white border border-[#2A2A2A] font-mono text-xs uppercase rounded cursor-pointer transition-all">
                Clear Plaintext
              </button>
            </div>
          </div>
        ` : `
          <div class="flex flex-col gap-2">
            <div class="p-2.5 bg-[#000000] rounded-lg border border-[#222222] text-xs font-mono flex items-center justify-between">
              <div class="flex items-center gap-2 truncate">
                <span class="material-symbols-outlined text-emerald-400 text-[18px] shrink-0">check_circle</span>
                <span class="text-zinc-200 truncate">Restored: <strong class="text-white">${escapeHtml(safeName)}</strong></span>
              </div>
              <span class="text-zinc-500 text-[11px] shrink-0">${formatBytes(file.size)}</span>
            </div>
            <div class="text-xs font-mono text-zinc-400 flex items-center gap-2">
              <span>SHA-256:</span>
              <code data-aes-decrypted-hash class="text-brand-orange break-all">Computing...</code>
            </div>

            <!-- Actions Row -->
            <div class="flex flex-wrap gap-2 pt-1">
              <button data-aes-restored-download type="button" class="px-3 py-1.5 bg-brand-orange hover:bg-[#e05e00] text-black font-mono text-xs font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[15px]">download</span> Download Restored File
              </button>
              <button data-aes-clear-plain type="button" class="px-3 py-1.5 bg-[#141414] hover:bg-[#202020] text-zinc-400 hover:text-white border border-[#2A2A2A] font-mono text-xs uppercase rounded cursor-pointer transition-all">
                Clear Plaintext
              </button>
            </div>

            <!-- Integrity Verification in Hash Toolkit -->
            <div class="border-t border-[#1A1A1A] pt-2 flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px] text-zinc-500">verified</span>
              <button data-aes-verify type="button" class="text-zinc-500 text-xs font-mono uppercase font-bold opacity-50 cursor-not-allowed transition-colors" disabled title="Computing SHA-256...">
                Generating hash...
              </button>
            </div>
          </div>
        `}

        <details class="text-xs font-mono text-zinc-400 bg-[#000000] p-2.5 rounded border border-[#1A1A1A]">
          <summary class="cursor-pointer text-brand-orange hover:underline">Authentication Audit Details</summary>
          <div class="mt-2 text-[11px] leading-relaxed text-zinc-400 flex flex-col gap-1">
            <div>Authentication Verification: <strong class="text-emerald-400">PASSED (128-bit GHASH tag matches computed polynomial)</strong></div>
            <div>Decryption Engine: <strong class="text-zinc-200">Local WebCrypto AES-256-GCM</strong></div>
            <div>Key Derivation: <strong class="text-zinc-200">${envelope.mode === 'passphrase' ? 'PBKDF2-HMAC-SHA-256 (250,000 iterations)' : '256-bit imported key'}</strong></div>
            <div>Data Security: <strong class="text-zinc-200">Ephemeral volatile RAM; zero persistent plaintext storage</strong></div>
          </div>
        </details>

        <div class="flex items-center justify-between pt-1 border-t border-[#1A1A1A] text-[11px] font-mono">
          <span class="text-zinc-400">Security Score: <strong class="text-emerald-400">${coach.score} / 100</strong></span>
          <button data-aes-new-decrypt type="button" class="text-zinc-400 hover:text-white uppercase transition-colors cursor-pointer">Start New Decryption</button>
        </div>
      </div>
    `;

    // Render plaintext via property assignment (NEVER innerHTML) to safely prevent XSS and preserve all Unicode/formatting
    if (!isFile) {
      const plainTextArea = container.querySelector('#aes-decrypted-plaintext');
      if (plainTextArea) {
        plainTextArea.value = root.CastleAES.decoder.decode(decrypted.bytes);
      }
    }

    // Wire: Download restored file
    const downloadBtn = container.querySelector('[data-aes-restored-download]');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => download(file, safeName));
    }

    // Wire: Copy plaintext
    const copyPlainBtn = container.querySelector('[data-aes-copy-plain]');
    if (copyPlainBtn && !isFile) {
      copyPlainBtn.addEventListener('click', () => {
        const textVal = root.CastleAES.decoder.decode(decrypted.bytes);
        navigator.clipboard.writeText(textVal);
        const origHtml = copyPlainBtn.innerHTML;
        const origClass = copyPlainBtn.className;
        copyPlainBtn.innerHTML = '<span class="material-symbols-outlined text-[15px] text-emerald-400">check</span><span class="text-emerald-400 font-bold">COPIED PLAINTEXT!</span>';
        copyPlainBtn.className = 'px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 font-mono text-xs font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
        setTimeout(() => {
          copyPlainBtn.innerHTML = origHtml;
          copyPlainBtn.className = origClass;
        }, 1800);
      });
    }

    // Wire: Clear plaintext
    const clearPlainBtn = container.querySelector('[data-aes-clear-plain]');
    if (clearPlainBtn) {
      clearPlainBtn.addEventListener('click', () => {
        activeDecryptedBytes = null;
        activeDecryptedFile = null;
        container.innerHTML = `
          <div class="p-3 border border-[#222222] bg-[#0A0A0A] rounded-lg text-xs font-mono text-zinc-400 flex items-center justify-between">
            <span>Plaintext cleared from volatile memory.</span>
            <button data-aes-reopen-decrypt type="button" class="text-brand-orange hover:text-white uppercase font-bold text-[11px]">Ready</button>
          </div>
        `;
        const readyBtn = container.querySelector('[data-aes-reopen-decrypt]');
        if (readyBtn) {
          readyBtn.addEventListener('click', () => { container.innerHTML = ''; });
        }
      });
    }

    // Wire: New decryption
    const newDecryptBtn = container.querySelector('[data-aes-new-decrypt]');
    if (newDecryptBtn) {
      newDecryptBtn.addEventListener('click', () => {
        container.innerHTML = '';
        activeDecryptedBytes = null;
        activeDecryptedFile = null;
        const cipherText = document.getElementById('aes-cipher-text');
        if (cipherText) {
          cipherText.value = '';
          cipherText.focus();
        }
        const secretInput = document.getElementById('aes-decrypt-secret');
        if (secretInput) secretInput.value = '';
        clearFileSelection();
      });
    }

    if (!isFile) return;

    // Hash computation for restored binary files
    const hashDisplay = container.querySelector('[data-aes-decrypted-hash]');
    const verifyBtn = container.querySelector('[data-aes-verify]');

    if (root.CastleHashEngine) {
      const hashPromise = root.CastleHashEngine.hashFile('SHA-256', file)
        .then((hash) => {
          if (hashDisplay) hashDisplay.textContent = hash;
          if (verifyBtn) {
            verifyBtn.textContent = 'Verify hash in Hash Toolkit';
            verifyBtn.disabled = false;
            verifyBtn.title = '';
            verifyBtn.className = 'text-brand-orange hover:text-white text-xs font-mono font-bold uppercase cursor-pointer hover:underline transition-colors';
          }
          return hash;
        })
        .catch(() => {
          if (hashDisplay) hashDisplay.textContent = 'Unavailable';
          if (verifyBtn) {
            verifyBtn.textContent = 'Hash unavailable';
            verifyBtn.title = 'Could not compute hash for this file.';
          }
          return '';
        });

      if (verifyBtn) {
        verifyBtn.addEventListener('click', async () => {
          if (verifyBtn.disabled) return;
          const originalLabel = verifyBtn.textContent;
          verifyBtn.textContent = 'Opening Hash Toolkit...';
          verifyBtn.disabled = true;
          try {
            const hash = await hashPromise;
            if (hash && typeof root.openHashToolkitVerify === 'function') {
              root.openHashToolkitVerify(file, hash);
            }
          } catch (_) {
            verifyBtn.textContent = 'Error opening Hash Toolkit';
          } finally {
            setTimeout(() => {
              verifyBtn.textContent = originalLabel;
              verifyBtn.disabled = false;
            }, 600);
          }
        });
      }
    }
  }

  function sanitizeFilename(name) {
    if (!name || typeof name !== 'string') return 'restored-file.bin';
    // Remove path traversal characters (/, \, .., :, etc.)
    let clean = name.replace(/^.*[\\\/]/, '');
    clean = clean.replace(/[\x00-\x1f\x7f<>:"/\\|?*]/g, '_');
    clean = clean.replace(/^\.+/, '');
    clean = clean.trim();
    const baseNoExt = clean.split('.')[0].toUpperCase();
    const reserved = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    if (reserved.includes(baseNoExt)) {
      clean = 'safe_' + clean;
    }
    if (!clean || clean === '.' || clean === '..') return 'restored-file.bin';
    return clean;
  }

  function sanitizeMime(mime) {
    if (!mime || typeof mime !== 'string' || !/^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/.test(mime)) {
      return 'application/octet-stream';
    }
    return mime;
  }

  function updateProgress(value) {
    const bar = document.getElementById('aes-decrypt-progress-bar');
    if (bar) {
      bar.style.width = '100%';
      bar.style.transformOrigin = 'left';
      bar.style.transform = `scaleX(${Math.max(0, Math.min(100, value)) / 100})`;
      bar.classList.add('meter-bar-fill');
    }
  }

  function formatBytes(value) {
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  }

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value || '';
    return div.innerHTML;
  }

  function download(file, name) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = name || file.name || 'restored-file';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function reset() {
    opSeq++;
    isDecrypting = false;
    activeDecryptedBytes = null;
    activeDecryptedFile = null;
    clearFileSelection();
    const cipherText = document.getElementById('aes-cipher-text');
    if (cipherText) cipherText.value = '';
    const decryptSecret = document.getElementById('aes-decrypt-secret');
    if (decryptSecret) decryptSecret.value = '';
    const result = document.getElementById('aes-decrypt-result');
    if (result) result.innerHTML = '';
    const progress = document.getElementById('aes-decrypt-progress');
    if (progress) progress.classList.add('hidden');
    const modeEl = document.getElementById('aes-decrypt-mode');
    if (modeEl) {
      modeEl.textContent = 'The encrypted payload automatically detects whether it requires a passphrase or a saved random key.';
    }
  }

  root.CastleAESDecrypt = { init, reset, decrypt };
})(window);
