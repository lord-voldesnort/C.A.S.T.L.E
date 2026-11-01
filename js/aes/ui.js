(function(root) {
  let initialized = false;
  let activeTab = 'learn';

  function init() {
    if (initialized) return;
    initialized = true;

    setupTabNavigation();
    setupResetButton();

    if (root.CastleAESEncrypt && root.CastleAESEncrypt.init) root.CastleAESEncrypt.init();
    if (root.CastleAESDecrypt && root.CastleAESDecrypt.init) root.CastleAESDecrypt.init();
    if (root.CastleAESLearn && root.CastleAESLearn.init) root.CastleAESLearn.init();
  }

  function setupTabNavigation() {
    const tabs = document.querySelectorAll('#aes-primary-tabs [role="tab"]');
    if (!tabs || tabs.length === 0) return;

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        selectTab(tab.getAttribute('data-tab-name'));
      });

      tab.addEventListener('keydown', (e) => {
        let targetIndex = null;
        if (e.key === 'ArrowRight') {
          targetIndex = (index + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft') {
          targetIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
          targetIndex = 0;
        } else if (e.key === 'End') {
          targetIndex = tabs.length - 1;
        }

        if (targetIndex !== null) {
          e.preventDefault();
          tabs[targetIndex].focus();
          selectTab(tabs[targetIndex].getAttribute('data-tab-name'));
        }
      });
    });
  }

  function selectTab(name) {
    if (!name) return;
    activeTab = name;

    const tabs = document.querySelectorAll('#aes-primary-tabs [role="tab"]');
    tabs.forEach(tab => {
      const tabName = tab.getAttribute('data-tab-name');
      const isSelected = tabName === name;
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.tabIndex = isSelected ? 0 : -1;

      if (isSelected) {
        tab.className = 'flex-1 sm:flex-none inline-flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2 rounded bg-brand-orange text-black font-mono text-[11px] sm:text-xs md:text-sm font-bold tracking-wider uppercase shadow-[0_0_18px_rgba(255,106,0,0.4)] border border-brand-orange transition-all cursor-pointer';
      } else {
        tab.className = 'flex-1 sm:flex-none inline-flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2 rounded text-zinc-400 hover:text-white hover:bg-[#181818] font-mono text-[11px] sm:text-xs md:text-sm font-medium tracking-wider uppercase transition-all border border-transparent cursor-pointer';
      }
    });

    document.querySelectorAll('[data-aes-panel]').forEach(panel => {
      const isCurrent = panel.dataset.aesPanel === name;
      panel.classList.toggle('hidden', !isCurrent);
    });
  }

  function setupResetButton() {
    const resetBtn = document.getElementById('aes-reset-workspace-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetWorkspace);
    }
  }

  function resetWorkspace() {
    // 1. Reset Tab 2 (Encrypt)
    if (root.CastleAESEncrypt && typeof root.CastleAESEncrypt.reset === 'function') {
      root.CastleAESEncrypt.reset();
    } else {
      const plainText = document.getElementById('aes-plain-text');
      if (plainText) plainText.value = '';

      const passphrase = document.getElementById('aes-passphrase');
      if (passphrase) passphrase.value = '';

      const passphraseAnalysis = document.getElementById('aes-passphrase-analysis');
      if (passphraseAnalysis) passphraseAnalysis.textContent = '';

      const encryptFileInput = document.getElementById('aes-encrypt-file');
      if (encryptFileInput) encryptFileInput.value = '';

      const encryptFileInfo = document.getElementById('aes-encrypt-file-info');
      if (encryptFileInfo) encryptFileInfo.textContent = '';

      const encryptResult = document.getElementById('aes-encrypt-result');
      if (encryptResult) encryptResult.innerHTML = '';

      const encryptProgress = document.getElementById('aes-encrypt-progress');
      if (encryptProgress) encryptProgress.classList.add('hidden');

      const sourceTextBtn = document.getElementById('aes-encrypt-source-text');
      if (sourceTextBtn) sourceTextBtn.click();

      const keyPassphraseBtn = document.getElementById('aes-key-passphrase');
      if (keyPassphraseBtn) keyPassphraseBtn.click();
    }

    // 2. Reset Tab 3 (Decrypt)
    if (root.CastleAESDecrypt && typeof root.CastleAESDecrypt.reset === 'function') {
      root.CastleAESDecrypt.reset();
    } else {
      const cipherText = document.getElementById('aes-cipher-text');
      if (cipherText) cipherText.value = '';

      const decryptFileInput = document.getElementById('aes-decrypt-file');
      if (decryptFileInput) decryptFileInput.value = '';

      const decryptFileInfo = document.getElementById('aes-decrypt-file-info');
      if (decryptFileInfo) decryptFileInfo.textContent = '';

      const decryptSecret = document.getElementById('aes-decrypt-secret');
      if (decryptSecret) decryptSecret.value = '';

      const decryptResult = document.getElementById('aes-decrypt-result');
      if (decryptResult) decryptResult.innerHTML = '';

      const decryptProgress = document.getElementById('aes-decrypt-progress');
      if (decryptProgress) decryptProgress.classList.add('hidden');

      const decryptMode = document.getElementById('aes-decrypt-mode');
      if (decryptMode) decryptMode.textContent = 'The encrypted payload automatically detects whether it requires a passphrase or a saved random key.';
    }

    // 3. Reset Tab 1 (Learn) simulator input if present
    if (root.CastleAESLearn && typeof root.CastleAESLearn.reset === 'function') {
      root.CastleAESLearn.reset();
    } else {
      const roundInput = document.getElementById('aes-round-input');
      if (roundInput) {
        roundInput.value = 'CASTLE';
        roundInput.dispatchEvent(new Event('input'));
      }
    }

    // 4. Return to Tab 1: Learn
    selectTab('learn');
  }

  root.CastleAESUI = { init, selectTab, resetWorkspace };
})(window);
