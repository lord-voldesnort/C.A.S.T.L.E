/**
 * Castle Cybersecurity Toolbox - Application Controller
 * Handles homepage interactivity, card filtering, category tabs, and modal window management.
 */

document.addEventListener('DOMContentLoaded', () => {
  initSearchAndFilter();
  initModalManager();
});

function initSearchAndFilter() {
  const searchInput = document.querySelector('input[placeholder*="Search tools"]');
  const categoryButtons = document.querySelectorAll('section > div > button.font-label-md');
  const toolCards = document.querySelectorAll('.armor-plate[data-tool], .grid > .armor-plate');

  let activeCategory = 'All Tools';
  let searchQuery = '';

  function filterCards() {
    toolCards.forEach(card => {
      // Ignore hero section card
      if (card.closest('section.relative')) return;

      const titleEl = card.querySelector('h3');
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
          b.className = 'font-label-md text-label-md px-md py-xs rounded-full bg-surface border border-border/50 text-text-secondary hover:text-on-surface hover:border-outline transition-colors';
        });

        btn.className = 'font-label-md text-label-md px-md py-xs rounded-full bg-surface-container-highest text-primary border border-primary/30';
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

  // Delegated click event for Launch buttons
  document.addEventListener('click', (e) => {
    const launchBtn = e.target.closest('[data-launch-tool]');
    if (launchBtn) {
      const toolName = launchBtn.getAttribute('data-launch-tool');
      if (toolName === 'password-modal' || toolName === 'password-generator') {
        openPasswordModal();
      } else if (toolName === 'hash-toolkit-modal' || toolName === 'hash-generator' || toolName === 'hash-verifier') {
        if (window.openHashToolkitModal) window.openHashToolkitModal();
      } else if (toolName === 'aes-studio-modal') {
        openAESStudioModal();
      } else if (toolName === 'url-phishing-modal') {
        if (window.openUrlPhishingModal) window.openUrlPhishingModal();
      } else if (toolName === 'jwt-modal') {
        if (window.openJwtModal) window.openJwtModal();
      }
    }
  });

  const pwCloseBtn = document.getElementById('pw-modal-close');
  const pwBackdrop = document.getElementById('pw-modal-backdrop');

  if (pwCloseBtn) pwCloseBtn.addEventListener('click', closePasswordModal);
  if (pwBackdrop) pwBackdrop.addEventListener('click', (e) => { if (e.target === pwBackdrop) closePasswordModal(); });

  if (hashCloseBtn) hashCloseBtn.addEventListener('click', () => { if (window.closeHashToolkitModal) window.closeHashToolkitModal(); });
  if (hashBackdrop) hashBackdrop.addEventListener('click', (e) => { if (e.target === hashBackdrop && window.closeHashToolkitModal) window.closeHashToolkitModal(); });
  if (aesCloseBtn) aesCloseBtn.addEventListener('click', closeAESStudioModal);
  if (aesBackdrop) aesBackdrop.addEventListener('click', (e) => { if (e.target === aesBackdrop) closeAESStudioModal(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const pwModal = document.getElementById('password-modal');
      if (pwModal && !pwModal.classList.contains('hidden')) {
        closePasswordModal();
      }
      if (hashModal && !hashModal.classList.contains('hidden')) {
        if (window.closeHashToolkitModal) window.closeHashToolkitModal();
      }
      if (aesModal && !aesModal.classList.contains('hidden')) closeAESStudioModal();
    }
  });
}

function openPasswordModal() {
  const modal = document.getElementById('password-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Initialize or render password app
    if (window.castlePasswordApp) {
      window.castlePasswordApp.render();
    }
  }
}

function closePasswordModal() {
  const modal = document.getElementById('password-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// Make modal openers accessible globally
window.openPasswordModal = openPasswordModal;
window.closePasswordModal = closePasswordModal;

function openAESStudioModal() {
  const modal = document.getElementById('aes-studio-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  if (window.CastleAESUI) { window.CastleAESUI.init(); window.CastleAESUI.selectTab('learn'); }
}

function closeAESStudioModal() {
  const modal = document.getElementById('aes-studio-modal');
  if (modal) { modal.classList.add('hidden'); document.body.style.overflow = ''; }
}

window.openAESStudioModal = openAESStudioModal;
window.closeAESStudioModal = closeAESStudioModal;
