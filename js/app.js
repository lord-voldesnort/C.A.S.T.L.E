/**
 * Castle Cybersecurity Toolbox - Application Controller
 * Handles homepage interactivity, card filtering, category tabs, and modal window management.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Horizontal Tool Showcase Engine
  if (window.CastleHorizontalShowcase) {
    const showcase = new window.CastleHorizontalShowcase();
    showcase.init('#showcase-runway', '#showcase-track');
    window.castleShowcase = showcase;
  }
  initSearchAndFilter();
  initModalManager();
});

function initSearchAndFilter() {
  const searchInput = document.querySelector('input[placeholder*="Search tools"]');
  const categoryButtons = document.querySelectorAll('button[data-category-filter], section > div > button.font-label-md');
  const toolCards = document.querySelectorAll('.showcase-card, .hero-tool-card[data-tool], .armor-plate[data-tool], .grid > .armor-plate, .grid > .hero-tool-card');

  let activeCategory = 'All Tools';
  let searchQuery = '';

  function filterCards() {
    toolCards.forEach(card => {
      // Ignore hero section card
      if (card.closest('section.relative') && !card.closest('#modules')) return;

      const titleEl = card.querySelector('h2, h3');
      const descEl = card.querySelector('p');
      const catEl = card.querySelector('span.uppercase.tracking-wider');
      
      const title = titleEl ? titleEl.textContent.toLowerCase() : '';
      const desc = descEl ? descEl.textContent.toLowerCase() : '';
      const cardCategory = card.getAttribute('data-category') || (catEl ? catEl.textContent.trim() : '');

      const matchesSearch = !searchQuery || title.includes(searchQuery) || desc.includes(searchQuery) || cardCategory.toLowerCase().includes(searchQuery);
      
      let matchesCategory = true;
      if (activeCategory !== 'All Tools') {
        const catMap = {
          'Authentication': ['auth', 'authentication'],
          'Web Security': ['web', 'web security'],
          'Encryption': ['crypto', 'encryption'],
          'Utilities': ['utils', 'utilities']
        };
        const allowedTags = catMap[activeCategory] || [activeCategory.toLowerCase()];
        matchesCategory = allowedTags.some(tag => cardCategory.toLowerCase().includes(tag));
      }

      if (matchesSearch && matchesCategory) {
        card.style.display = 'flex';
        card.classList.remove('hidden');
      } else {
        card.style.display = 'none';
        card.classList.add('hidden');
      }
    });

    if (window.castleShowcase && typeof window.castleShowcase.measureLayout === 'function') {
      window.castleShowcase.measureLayout();
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterCards();
    });
  }

  if (categoryButtons.length > 0) {
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryButtons.forEach(b => {
          b.className = 'px-3 py-1 rounded text-xs font-mono uppercase bg-[#0D0D0D] text-zinc-400 hover:text-white border border-[#222222] hover:border-zinc-600 transition-colors cursor-pointer';
        });

        btn.className = 'px-3 py-1 rounded text-xs font-mono uppercase bg-brand-orange text-black font-semibold border border-brand-orange transition-colors cursor-pointer';
        activeCategory = btn.textContent.trim();
        filterCards();
      });
    });
  }
}

function initModalManager() {
  const hashModal = document.getElementById('hash-toolkit-modal');
  const hashCloseBtn = document.getElementById('hash-toolkit-close');
  const hashBackdrop = document.getElementById('hash-toolkit-backdrop');
  const aesModal = document.getElementById('aes-studio-modal');
  const aesCloseBtn = document.getElementById('aes-studio-close');
  const aesBackdrop = document.getElementById('aes-studio-backdrop');

  // Centralized tool launcher with per-tool debounce
  let lastLaunchTimestamp = 0;
  let lastLaunchToolName = '';
  function castleLaunchTool(toolName) {
    if (!toolName) return;
    const now = performance.now();
    if (toolName === lastLaunchToolName && (now - lastLaunchTimestamp < 250)) return;
    lastLaunchTimestamp = now;
    lastLaunchToolName = toolName;

    if (toolName === 'password-modal' || toolName === 'password-generator') {
      openPasswordModal();
    } else if (toolName === 'hash-toolkit-modal' || toolName === 'hash-toolkit' || toolName === 'hash-generator' || toolName === 'hash-verifier' || toolName === 'hash') {
      openHashToolkitModal();
    } else if (toolName === 'aes-studio-modal' || toolName === 'aes-studio') {
      openAESStudioModal();
    } else if (toolName === 'url-phishing-modal' || toolName === 'url-phishing' || toolName === 'url-analyzer') {
      if (window.openUrlPhishingModal) window.openUrlPhishingModal();
    } else if (toolName === 'jwt-modal' || toolName === 'jwt-inspector') {
      if (window.openJwtModal) window.openJwtModal();
    }
  }
  window.castleLaunchTool = castleLaunchTool;

  // Delegated click event for Launch buttons and card click targets
  document.addEventListener('click', (e) => {
    const launchBtn = e.target.closest('[data-launch-tool]');
    if (launchBtn) {
      const toolName = launchBtn.getAttribute('data-launch-tool');
      castleLaunchTool(toolName);
    }
  });

  const pwModal = document.getElementById('password-modal');
  const pwCloseBtn = document.getElementById('pw-modal-close');
  const pwBackdrop = document.getElementById('pw-modal-backdrop');

  if (pwCloseBtn) pwCloseBtn.addEventListener('click', closePasswordModal);
  if (pwBackdrop) {
    pwBackdrop.addEventListener('click', (e) => {
      if (!isBackdropClickAllowed()) return;
      if (e.target === pwBackdrop) closePasswordModal();
    });
  }
  if (pwModal) {
    pwModal.addEventListener('click', (e) => {
      if (!isBackdropClickAllowed()) return;
      if (e.target === pwModal) closePasswordModal();
    });
  }

  if (hashCloseBtn) hashCloseBtn.addEventListener('click', closeHashToolkitModal);
  if (hashBackdrop) {
    hashBackdrop.addEventListener('click', (e) => {
      if (!isBackdropClickAllowed()) return;
      if (e.target === hashBackdrop) closeHashToolkitModal();
    });
  }
  if (hashModal) {
    hashModal.addEventListener('click', (e) => {
      if (!isBackdropClickAllowed()) return;
      if (e.target === hashModal) closeHashToolkitModal();
    });
  }
  if (aesCloseBtn) aesCloseBtn.addEventListener('click', closeAESStudioModal);
  if (aesBackdrop) {
    aesBackdrop.addEventListener('click', (e) => {
      if (!isBackdropClickAllowed()) return;
      if (e.target === aesBackdrop) closeAESStudioModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const pwModal = document.getElementById('password-modal');
      if (pwModal && !pwModal.classList.contains('hidden')) {
        closePasswordModal();
      }
      const hashM = document.getElementById('hash-toolkit-modal');
      if (hashM && !hashM.classList.contains('hidden')) {
        closeHashToolkitModal();
      }
      if (aesModal && !aesModal.classList.contains('hidden')) closeAESStudioModal();
      const jwtModal = document.getElementById('jwt-modal');
      if (jwtModal && !jwtModal.classList.contains('hidden')) {
        if (window.closeJwtModal) window.closeJwtModal();
      }
      const urlModal = document.getElementById('url-phishing-modal');
      if (urlModal && !urlModal.classList.contains('hidden')) {
        if (window.closeUrlPhishingModal) window.closeUrlPhishingModal();
      }
    }
  });
}

// ============================================================================
// PHASE 3B: MODAL & DIALOGUE MOTION CONTROLLER
// ============================================================================
const closingModalTimers = new Map();
let lastModalOpenTime = 0;

function isBackdropClickAllowed() {
  return (performance.now() - lastModalOpenTime) > 75;
}

function openModalWithMotion(modalId, onReady) {
  const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
  if (!modal) return;
  const id = modal.id;

  lastModalOpenTime = performance.now();

  if (closingModalTimers.has(id)) {
    clearTimeout(closingModalTimers.get(id));
    closingModalTimers.delete(id);
  }

  modal.classList.add('castle-modal');
  modal.classList.remove('hidden', 'is-closing');
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  if (typeof onReady === 'function') onReady();
}

function closeModalWithMotion(modalId, onComplete) {
  const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
  if (!modal) return;
  const id = modal.id;

  if (closingModalTimers.has(id)) {
    clearTimeout(closingModalTimers.get(id));
    closingModalTimers.delete(id);
  }

  modal.classList.remove('is-open');
  modal.classList.add('is-closing');

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const exitDuration = isReduced ? 0 : 160;

  const timer = setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('is-closing');
    closingModalTimers.delete(id);

    const openModals = document.querySelectorAll('.castle-modal.is-open:not(.hidden)');
    if (openModals.length === 0) {
      document.body.style.overflow = '';
    }

    if (typeof onComplete === 'function') onComplete();
  }, exitDuration);

  closingModalTimers.set(id, timer);
}

window.CastleModalMotion = {
  open: openModalWithMotion,
  close: closeModalWithMotion
};

function openPasswordModal() {
  openModalWithMotion('password-modal', () => {
    // Initialize or render password app
    if (window.castlePasswordApp) {
      window.castlePasswordApp.render();
    }
  });
}

function closePasswordModal() {
  closeModalWithMotion('password-modal');
}

// Make modal openers accessible globally
window.openPasswordModal = openPasswordModal;
window.closePasswordModal = closePasswordModal;

function openHashToolkitModal(options = {}) {
  openModalWithMotion('hash-toolkit-modal', () => {
    if (window.CastleHashUI) {
      window.CastleHashUI.initUI();
      window.CastleHashUI.selectTab((options && options.tab) || 'learn');
    }
    if (options && options.file && window.CastleHashVerifier) {
      window.CastleHashVerifier.loadModeAFile(options.file, options.expectedHash);
    }
  });
}

function closeHashToolkitModal() {
  closeModalWithMotion('hash-toolkit-modal');
}

window.openHashToolkitModal = openHashToolkitModal;
window.closeHashToolkitModal = closeHashToolkitModal;

function openAESStudioModal() {
  openModalWithMotion('aes-studio-modal', () => {
    if (window.CastleAESUI) {
      window.CastleAESUI.init();
      window.CastleAESUI.selectTab('learn');
    }
  });
}

function closeAESStudioModal() {
  closeModalWithMotion('aes-studio-modal');
}

window.openAESStudioModal = openAESStudioModal;
window.closeAESStudioModal = closeAESStudioModal;
