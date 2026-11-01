/**
 * Castle Hash Toolkit — Main Controller & Entrypoint
 */
document.addEventListener('DOMContentLoaded', () => {
  if (window.CastleHashUI) {
    window.CastleHashUI.initUI();
  }
});

function openHashToolkitModal(options = {}) {
  if (window.CastleModalMotion) {
    window.CastleModalMotion.open('hash-toolkit-modal', () => {
      if (window.CastleHashUI) {
        window.CastleHashUI.initUI();
        window.CastleHashUI.selectTab((options && options.tab) || 'learn');
      }
      if (options && options.file && window.CastleHashVerifier) {
        window.CastleHashVerifier.loadModeAFile(options.file, options.expectedHash);
      }
    });
  } else {
    const modal = document.getElementById('hash-toolkit-modal');
    if (modal) {
      modal.classList.add('castle-modal', 'is-open');
      modal.classList.remove('hidden', 'is-closing');
      document.body.style.overflow = 'hidden';
      if (window.CastleHashUI) {
        window.CastleHashUI.initUI();
        window.CastleHashUI.selectTab((options && options.tab) || 'learn');
      }
      if (options && options.file && window.CastleHashVerifier) {
        window.CastleHashVerifier.loadModeAFile(options.file, options.expectedHash);
      }
    }
  }
}

function closeHashToolkitModal() {
  if (window.CastleModalMotion) {
    window.CastleModalMotion.close('hash-toolkit-modal');
  } else {
    const modal = document.getElementById('hash-toolkit-modal');
    if (modal) {
      modal.classList.remove('is-open');
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
}

window.openHashToolkitModal = openHashToolkitModal;
// Public cross-tool handoff API. The file never leaves browser memory.
window.openHashToolkitVerify = function(file, expectedHash) {
  openHashToolkitModal({ tab: 'verify', file, expectedHash });
};
window.closeHashToolkitModal = closeHashToolkitModal;

// Direct delegated click trigger ensuring immediate modal opening from cards and buttons
document.addEventListener('click', (e) => {
  const launch = e.target.closest('[data-launch-tool="hash-toolkit-modal"], [data-launch-tool="hash-toolkit"], [data-launch-tool="hash-generator"], [data-launch-tool="hash-verifier"]');
  if (launch) {
    openHashToolkitModal();
  }
});
