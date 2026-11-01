/**
 * Castle Hash Toolkit — Main Controller & Entrypoint
 */
document.addEventListener('DOMContentLoaded', () => {
  if (window.CastleHashUI) {
    window.CastleHashUI.initUI();
  }
});

function openHashToolkitModal(options = {}) {
  const modal = document.getElementById('hash-toolkit-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    if (window.CastleHashUI) {
      window.CastleHashUI.initUI();
      window.CastleHashUI.selectTab(options.tab || 'learn');
    }

    if (options.file && window.CastleHashVerifier) {
      window.CastleHashVerifier.loadModeAFile(options.file, options.expectedHash);
    }
  }
}

function closeHashToolkitModal() {
  const modal = document.getElementById('hash-toolkit-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

window.openHashToolkitModal = openHashToolkitModal;
// Public cross-tool handoff API. The file never leaves browser memory.
window.openHashToolkitVerify = function(file, expectedHash) {
  openHashToolkitModal({ tab: 'verify', file, expectedHash });
};
window.closeHashToolkitModal = closeHashToolkitModal;
