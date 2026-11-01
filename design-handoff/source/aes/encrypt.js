(function(root) {
  let selectedFile = null;
  let selectedSource = 'text';
  let selectedKeyMode = 'passphrase';
  function init() {
    const fileInput = document.getElementById('aes-encrypt-file');
    const dropzone = document.getElementById('aes-encrypt-dropzone');
    document.getElementById('aes-encrypt-source-text').addEventListener('click', () => setSource('text'));
    document.getElementById('aes-encrypt-source-file').addEventListener('click', () => setSource('file'));
    document.getElementById('aes-key-passphrase').addEventListener('click', () => setKeyMode('passphrase'));
    document.getElementById('aes-key-random').addEventListener('click', () => setKeyMode('random'));
    document.getElementById('aes-encrypt-run').addEventListener('click', encrypt);
    document.getElementById('aes-passphrase').addEventListener('input', renderPassphraseAnalysis);
    document.getElementById('aes-open-password').addEventListener('click', () => root.openPasswordModal && root.openPasswordModal());
    if (dropzone) { dropzone.addEventListener('click', () => fileInput.click()); dropzone.addEventListener('dragover', event => { event.preventDefault(); dropzone.classList.add('border-primary'); }); dropzone.addEventListener('dragleave', () => dropzone.classList.remove('border-primary')); dropzone.addEventListener('drop', event => { event.preventDefault(); dropzone.classList.remove('border-primary'); setFile(event.dataTransfer.files[0]); }); }
    fileInput.addEventListener('change', () => setFile(fileInput.files[0]));
  }
  function setSource(source) { selectedSource = source; document.getElementById('aes-plain-text').classList.toggle('hidden', source !== 'text'); document.getElementById('aes-encrypt-file-area').classList.toggle('hidden', source !== 'file'); document.getElementById('aes-encrypt-source-text').className = buttonClass(source === 'text'); document.getElementById('aes-encrypt-source-file').className = buttonClass(source === 'file'); }
  function setKeyMode(mode) { selectedKeyMode = mode; document.getElementById('aes-passphrase-area').classList.toggle('hidden', mode !== 'passphrase'); document.getElementById('aes-random-key-warning').classList.toggle('hidden', mode !== 'random'); document.getElementById('aes-key-passphrase').className = buttonClass(mode === 'passphrase'); document.getElementById('aes-key-random').className = buttonClass(mode === 'random'); }
  function buttonClass(active) { return `flex-1 py-xs px-sm rounded font-code text-xs font-bold uppercase transition-all border cursor-pointer ${active ? 'bg-primary/20 text-primary border-primary/50' : 'bg-surface-container-lowest text-text-secondary border-border/50 hover:text-on-surface'}`; }
  function setFile(file) { if (!file) return; selectedFile = file; document.getElementById('aes-encrypt-file-info').textContent = `${file.name} (${formatBytes(file.size)})`; document.getElementById('aes-advisor').textContent = root.CastleAESAdvisor.getAdvice(file); }
  function mode() { return selectedKeyMode; }
  function source() { return selectedSource; }
  async function encrypt() {
    const result = document.getElementById('aes-encrypt-result'), progress = document.getElementById('aes-encrypt-progress'), passphrase = document.getElementById('aes-passphrase').value, keyMode = mode(), selectedSource = source(); result.innerHTML = '';
    try {
      let bytes, name, mime;
      if (selectedSource === 'file') { if (!selectedFile) throw new Error('Choose a file to encrypt.'); progress.classList.remove('hidden'); bytes = await root.CastleAES.readFile(selectedFile, updateProgress); name = selectedFile.name; mime = selectedFile.type; }
      else { const text = document.getElementById('aes-plain-text').value; if (!text) throw new Error('Enter text to encrypt.'); bytes = new TextEncoder().encode(text); name = 'castle-message.txt'; mime = 'text/plain'; }
      updateProgress(65); const encrypted = await root.CastleAES.encryptBytes(bytes, { mode: keyMode, secret: passphrase, type: selectedSource, name, mime }); updateProgress(100);
      const payload = selectedSource === 'text' ? root.CastleAES.encodeTextEnvelope(encrypted.envelope) : root.CastleAES.serializeEnvelope(encrypted.envelope);
      renderResult(result, payload, encrypted, name, keyMode, passphrase, selectedSource);
    } catch (error) { result.innerHTML = `<div class="p-sm border border-danger text-danger text-xs font-code rounded">${escapeHtml(error.message)}</div>`; }
    finally { progress.classList.add('hidden'); }
  }
  function renderResult(container, payload, encrypted, name, keyMode, passphrase, selectedSource) {
    const display = typeof payload === 'string' ? payload : `${name}.castle`;
    const coach = root.CastleAESCoach.review(keyMode, passphrase);
    container.innerHTML = `<div class="p-sm border border-success/50 bg-success/10 rounded flex flex-col gap-sm"><div class="text-success font-bold text-sm">Encryption complete</div>${keyMode === 'random' ? `<div class="p-xs border border-warning/50 bg-warning/10 text-warning text-xs font-code">This key is the only recovery path. Save it exactly as shown.<br><code class="break-all text-primary">${encrypted.keyValue}</code><button data-aes-copy-key class="ml-xs text-primary underline">Copy key</button></div>` : ''}${selectedSource === 'text' ? `<textarea readonly class="w-full min-h-20 bg-bg-main border border-border rounded p-xs text-xs font-code text-primary">${display}</textarea><button data-aes-copy-text class="text-primary text-xs font-bold uppercase">Copy ciphertext</button>` : ''}<div class="flex gap-xs"><button data-aes-download class="text-primary text-xs font-bold uppercase">Download encrypted file</button>${selectedSource === 'file' ? '<button data-aes-hash class="text-primary text-xs font-bold uppercase">Generate integrity hash</button>' : ''}</div><details class="text-xs text-text-secondary"><summary class="cursor-pointer text-primary font-code">Encryption details</summary><p>AES-256-GCM uses a fresh random IV and authentication tag. ${keyMode === 'passphrase' ? 'A random salt protects the PBKDF2 passphrase derivation.' : 'A 256-bit random key was generated; no salt is needed.'}</p></details><details class="text-xs text-text-secondary"><summary class="cursor-pointer text-primary font-code">Security review: ${coach.score} / 100</summary><p>AES-256-GCM: enabled. Random IV: enabled. Authentication: enabled. ${coach.recommendation}</p></details><div class="text-xs text-text-secondary">Send the passphrase/key separately. Verify recipient identity. Keep an original backup.</div></div>`;
    const blob = typeof payload === 'string' ? new Blob([payload], { type: 'text/plain' }) : payload;
    container.querySelector('[data-aes-download]').addEventListener('click', () => download(blob, `${name}.castle`));
    const copyText = container.querySelector('[data-aes-copy-text]'); if (copyText) copyText.addEventListener('click', () => navigator.clipboard.writeText(payload));
    const copyKey = container.querySelector('[data-aes-copy-key]'); if (copyKey) copyKey.addEventListener('click', () => navigator.clipboard.writeText(encrypted.keyValue));
    const hash = container.querySelector('[data-aes-hash]'); if (hash) hash.addEventListener('click', async () => { hash.textContent = 'Computing SHA-256...'; const file = new File([blob], `${name}.castle`); const value = await root.CastleHashEngine.hashFile('SHA-256', file); hash.outerHTML = `<code class="break-all text-primary text-xs">SHA-256: ${value}</code>`; });
  }
  function renderPassphraseAnalysis() { const target = document.getElementById('aes-passphrase-analysis'), value = document.getElementById('aes-passphrase').value; if (!root.CastlePassword || !root.CastlePassword.Analysis || !value) { target.textContent = ''; return; } const analysis = root.CastlePassword.Analysis.analyzePassword(value); target.textContent = `${analysis.strength.level} | ${analysis.crackTime.text}${analysis.weaknesses.length ? ' | ' + analysis.weaknesses[0] : ''}`; }
  function updateProgress(value) { document.getElementById('aes-encrypt-progress-bar').style.width = `${value}%`; }
  function formatBytes(value) { return value < 1024 * 1024 ? `${Math.round(value / 1024)} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`; }
  function escapeHtml(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
  function download(blob, name) { const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 0); }
  root.CastleAESEncrypt = { init };
})(window);
