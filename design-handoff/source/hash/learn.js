/**
 * Castle Hash Toolkit — Tab 1: Learn Module
 * Handles live avalanche-effect demo, keystroke debouncing, and visual change highlights.
 */
(function(root) {
  let learnInputEl = null;
  let learnOutputEl = null;
  let previousHash = '';
  let debounceTimer = null;

  function initTab1() {
    learnInputEl = document.getElementById('hash-learn-input');
    learnOutputEl = document.getElementById('hash-learn-output');

    if (!learnInputEl || !learnOutputEl) return;

    learnInputEl.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateAvalancheDemo, 100);
    });

    // Initial calculation
    updateAvalancheDemo();
  }

  async function updateAvalancheDemo() {
    if (!learnInputEl || !learnOutputEl) return;

    const val = learnInputEl.value;
    try {
      const hash = await root.CastleHashEngine.hashString('SHA-256', val);
      learnOutputEl.textContent = hash;

      if (previousHash && hash !== previousHash) {
        triggerAvalancheHighlight();
      }
      previousHash = hash;
    } catch (err) {
      console.error('Error computing avalanche hash:', err);
    }
  }

  function triggerAvalancheHighlight() {
    if (!learnOutputEl) return;
    const container = learnOutputEl.closest('.hash-avalanche-container') || learnOutputEl;
    
    container.classList.add('bg-primary/30', 'border-primary', 'shadow-[0_0_15px_rgba(255,213,151,0.5)]');
    setTimeout(() => {
      container.classList.remove('bg-primary/30', 'border-primary', 'shadow-[0_0_15px_rgba(255,213,151,0.5)]');
    }, 300);
  }

  root.CastleHashLearn = {
    initTab1,
    updateAvalancheDemo
  };
})(typeof window !== 'undefined' ? window : this);
