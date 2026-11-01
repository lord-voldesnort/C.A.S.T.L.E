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
    setupResetButton();
    
    // Initialize child tabs
    if (root.CastleHashLearn) root.CastleHashLearn.initTab1();
    if (root.CastleHashGenerator) root.CastleHashGenerator.initTab2();
    if (root.CastleHashVerifier) root.CastleHashVerifier.initTab3();
  }

  function setupResetButton() {
    const resetBtn = document.getElementById('hash-reset-workspace-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetWorkspace);
    }
  }

  function setupTabNavigation() {
    const tabs = document.querySelectorAll('#hash-toolkit-modal [data-tab-name]');
    
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

    const tabs = document.querySelectorAll('#hash-toolkit-modal [data-tab-name]');
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
        tab.className = 'flex-1 sm:flex-none inline-flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2 rounded bg-brand-orange text-black font-mono text-[11px] sm:text-xs md:text-sm font-bold tracking-wider uppercase shadow-[0_0_18px_rgba(255,106,0,0.4)] border border-brand-orange transition-all cursor-pointer';
      } else {
        tab.className = 'flex-1 sm:flex-none inline-flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2 rounded text-zinc-400 hover:text-white hover:bg-[#181818] font-mono text-[11px] sm:text-xs md:text-sm font-medium tracking-wider uppercase transition-all border border-transparent cursor-pointer';
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

  function handoffToVerify(options) {
    if (!options) return;
    selectTab('verify');
    if (root.CastleHashVerifier && typeof root.CastleHashVerifier.handleHandoff === 'function') {
      root.CastleHashVerifier.handleHandoff(options);
    }
  }

  function resetWorkspace() {
    // 1. Reset Tab 1 Learn
    const learnInput = document.getElementById('hash-learn-input');
    if (learnInput) {
      learnInput.value = 'Castle Security';
      if (root.CastleHashLearn && root.CastleHashLearn.updateAvalancheDemo) {
        root.CastleHashLearn.updateAvalancheDemo();
      }
    }

    // 2. Reset Tab 2 Generate
    const genTextInput = document.getElementById('hash-gen-text-input');
    if (genTextInput) {
      genTextInput.value = '';
    }
    const genFileInput = document.getElementById('hash-gen-file-input');
    if (genFileInput) {
      genFileInput.value = '';
    }
    const genFileInfo = document.getElementById('hash-gen-file-info');
    if (genFileInfo) {
      genFileInfo.innerHTML = '';
    }
    if (root.CastleHashGenerator && typeof root.CastleHashGenerator.reset === 'function') {
      root.CastleHashGenerator.reset();
    }

    // 3. Reset Tab 3 Verify
    if (root.CastleHashVerifier && typeof root.CastleHashVerifier.reset === 'function') {
      root.CastleHashVerifier.reset();
    }

    // 4. Return to Tab 1: Learn
    selectTab('learn');
  }

  root.CastleHashUI = {
    initUI,
    selectTab,
    handoffToVerify,
    resetWorkspace
  };
})(typeof window !== 'undefined' ? window : this);
