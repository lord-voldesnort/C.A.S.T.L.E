(function(root) {
  let encryptedFile = null;
  function init() {
    const fileInput = document.getElementById('aes-decrypt-file'), dropzone = document.getElementById('aes-decrypt-dropzone');
    document.getElementById('aes-decrypt-run').addEventListener('click', decrypt);
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => setFile(fileInput.files[0]));
    dropzone.addEventListener('dragover', event => { event.preventDefault(); dropzone.classList.add('border-primary'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('border-primary'));
    dropzone.addEventListener('drop', event => { event.preventDefault(); dropzone.classList.remove('border-primary'); setFile(event.dataTransfer.files[0]); });
  }
  function setFile(file) { if (!file) return; encryptedFile = file; document.getElementById('aes-decrypt-file-info').textContent = file.name; }
  async function decrypt() {
    const result = document.getElementById('aes-decrypt-result'), progress = document.getElementById('aes-decrypt-progress'); result.innerHTML = '';
    try {
      const text = document.getElementById('aes-cipher-text').value.trim(); let envelope;
      if (encryptedFile) { progress.classList.remove('hidden'); envelope = await root.CastleAES.parseEncryptedFile(encryptedFile, updateProgress); }
      else if (text) envelope = root.CastleAES.parseTextEnvelope(text);
      else throw new Error('Paste a ciphertext or choose an encrypted file.');
      document.getElementById('aes-decrypt-mode').textContent = envelope.mode === 'random' ? 'This payload requires its saved random key.' : 'This payload requires its original secret passphrase.';
      const secret = document.getElementById('aes-decrypt-secret').value; if (!secret) throw new Error(envelope.mode === 'random' ? 'Enter the saved random key.' : 'Enter the secret passphrase.');
      updateProgress(70); const decrypted = await root.CastleAES.decryptEnvelope(envelope, secret); updateProgress(100); renderResult(result, decrypted, secret);
    } catch (error) { result.innerHTML = `<div class="p-sm border border-danger text-danger text-xs font-code rounded">${escapeHtml(error.message)}</div>`; }
    finally { progress.classList.add('hidden'); }
  }
  function renderResult(container, decrypted, secret) {
    const envelope = decrypted.envelope;
    const file = new File([decrypted.bytes], envelope.name || 'restored-file', { type: envelope.mime || 'application/octet-stream' });
    const coach = root.CastleAESCoach.review(envelope.mode, envelope.mode === 'passphrase' ? secret : '');
    const isFile = envelope.type === 'file';

    // Build the result HTML. The verify button lives in its OWN row, separated from Download.
    container.innerHTML = `
      <div class="p-sm border border-success/50 bg-success/10 rounded flex flex-col gap-sm">
        <div class="text-success font-bold text-sm">Decryption complete and authentication verified</div>

        ${!isFile
          ? `<textarea readonly class="w-full min-h-20 bg-bg-main border border-border rounded p-xs text-xs font-code text-primary">${escapeHtml(root.CastleAES.decoder.decode(decrypted.bytes))}</textarea>`
          : `<div class="text-xs font-code text-primary">Restored: ${escapeHtml(file.name)}</div>
             <div class="text-xs font-code text-text-secondary">SHA-256: <code data-aes-decrypted-hash class="text-primary break-all">Computing…</code></div>`
        }

        <!-- Row 1: primary actions (copy / download) -->
        <div class="flex gap-sm">
          ${!isFile ? '<button data-aes-copy-plain class="text-primary text-xs font-bold uppercase">Copy plaintext</button>' : ''}
          <button data-aes-restored-download class="text-primary text-xs font-bold uppercase">Download restored file</button>
        </div>

        ${isFile ? `
        <!-- Row 2: integrity verification — visually separated so it is not confused with Download -->
        <div class="border-t border-border/30 pt-xs flex items-center gap-xs">
          <span class="material-symbols-outlined text-[14px] text-text-secondary" title="Hash integrity check">verified</span>
          <button data-aes-verify
            class="text-text-secondary text-xs font-bold uppercase opacity-50 cursor-not-allowed"
            disabled
            title="Computing SHA-256… please wait">
            Generating hash…
          </button>
        </div>` : ''}

        <details class="text-xs text-text-secondary">
          <summary class="cursor-pointer text-primary font-code">Security review: ${coach.score} / 100</summary>
          <p>AES-256-GCM authentication passed. ${coach.recommendation}</p>
        </details>
      </div>`;

    // Wire: Download
    container.querySelector('[data-aes-restored-download]').addEventListener('click', () => download(file));

    // Wire: Copy plaintext (text mode only)
    const copyBtn = container.querySelector('[data-aes-copy-plain]');
    if (copyBtn) copyBtn.addEventListener('click', () => navigator.clipboard.writeText(root.CastleAES.decoder.decode(decrypted.bytes)));

    if (!isFile) return; // No verify button for text payloads

    const hashDisplay = container.querySelector('[data-aes-decrypted-hash]');
    const verifyBtn   = container.querySelector('[data-aes-verify]');

    // Compute the hash in the background. Enable the verify button only when done.
    const hashPromise = root.CastleHashEngine.hashFile('SHA-256', file)
      .then(hash => {
        if (hashDisplay) hashDisplay.textContent = hash;
        if (verifyBtn) {
          verifyBtn.textContent = 'Verify hash in Hash Toolkit';
          verifyBtn.disabled = false;
          verifyBtn.title = '';
          verifyBtn.className = 'text-primary text-xs font-bold uppercase cursor-pointer hover:underline transition-opacity';
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

    // Wire: Verify — opens Hash Toolkit with the computed hash pre-filled
    verifyBtn.addEventListener('click', async () => {
      if (verifyBtn.disabled) return;
      const originalLabel = verifyBtn.textContent;
      verifyBtn.textContent = 'Opening…';
      verifyBtn.disabled = true;
      try {
        const hash = await hashPromise; // Already resolved by this point
        if (hash) root.openHashToolkitVerify(file, hash);
      } catch (_) {
        verifyBtn.textContent = 'Error — try again';
        return;
      } finally {
        setTimeout(() => {
          verifyBtn.textContent = originalLabel;
          verifyBtn.disabled = false;
        }, 500);
      }
    });
  }
  function updateProgress(value) { document.getElementById('aes-decrypt-progress-bar').style.width = `${value}%`; }
  function download(file) { const link = document.createElement('a'); link.href = URL.createObjectURL(file); link.download = file.name; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 0); }
  function escapeHtml(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
  root.CastleAESDecrypt = { init };
})(window);
