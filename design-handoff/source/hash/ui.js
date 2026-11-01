/**
 * Castle Hash Toolkit — UI Manager
 * Handles tab switching, ARIA attributes, keyboard accessibility (Arrow keys, Enter, Space),
 * and integrates sub-modules (Learn, Generator, Verifier).
 */
(function(root) {
  let activeTab = 'learn'; // 'learn' | 'generate' | 'verify'
  let initialized = false;

  function initUI() {
    if (initialized) return;
    initialized = true;
    setupTabNavigation();
    
    // Initialize child tabs
    if (root.CastleHashLearn) root.CastleHashLearn.initTab1();
    if (root.CastleHashGenerator) root.CastleHashGenerator.initTab2();
    if (root.CastleHashVerifier) root.CastleHashVerifier.initTab3();
  }

  function setupTabNavigation() {
    const tabList = document.querySelector('#hash-toolkit-modal [role="tablist"]');
    const tabs = document.querySelectorAll('#hash-toolkit-modal [role="tab"]');
    
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

  function selectTab(tabName) {
    if (!tabName) return;
    activeTab = tabName;

    const tabs = document.querySelectorAll('#hash-toolkit-modal [role="tab"]');
    const panels = {
      'learn': document.getElementById('hash-tab-panel-learn'),
      'generate': document.getElementById('hash-tab-panel-generate'),
      'verify': document.getElementById('hash-tab-panel-verify')
    };

    tabs.forEach(tab => {
      const name = tab.getAttribute('data-tab-name');
      const isSelected = name === tabName;

      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');

      if (isSelected) {
        tab.className = 'flex-1 py-xs md:py-sm px-md text-xs md:text-sm font-headline-sm font-semibold rounded border border-primary bg-primary/20 text-primary transition-all flex items-center justify-center gap-xs uppercase tracking-wider cursor-pointer outline-none focus:ring-1 focus:ring-primary';
      } else {
        tab.className = 'flex-1 py-xs md:py-sm px-md text-xs md:text-sm font-headline-sm font-semibold rounded border border-border/50 bg-surface-container-lowest text-text-secondary hover:text-on-surface hover:border-outline transition-all flex items-center justify-center gap-xs uppercase tracking-wider cursor-pointer outline-none focus:ring-1 focus:ring-primary';
      }
    });

    Object.keys(panels).forEach(key => {
      if (panels[key]) {
        if (key === tabName) {
          panels[key].classList.remove('hidden');
        } else {
          panels[key].classList.add('hidden');
        }
      }
    });

    // Trigger tab-specific refresh if needed
    if (tabName === 'learn' && root.CastleHashLearn) {
      root.CastleHashLearn.updateAvalancheDemo();
    } else if (tabName === 'generate' && root.CastleHashGenerator) {
      root.CastleHashGenerator.triggerHashing();
    }
  }

  root.CastleHashUI = {
    initUI,
    selectTab
  };
})(typeof window !== 'undefined' ? window : this);
