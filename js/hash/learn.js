/**
 * Castle Hash Toolkit — Tab 1: Learn Module
 * Handles live avalanche-effect demo, sample presets, live bit and character diff calculations,
 * and visual highlighting of altered digest characters.
 */
(function(root) {
  let learnInputEl = null;
  let learnOutputEl = null;
  let inputLenEl = null;
  let diffStatsEl = null;
  let diffOutputEl = null;
  let preset1Btn = null;
  let preset2Btn = null;
  let preset3Btn = null;
  let resetBtn = null;
  let copyBtn = null;
  let gotoGenBtn = null;
  let gotoVerifyBtn = null;

  const DEFAULT_BASELINE = 'Castle Security';
  let currentBaseline = DEFAULT_BASELINE;
  let activeSample = 'A'; // 'A' (baseline), 'B' (symbol), 'C' (case)
  let baselineHash = '7dab3ec388cb1f9ca3183f5ecedc0599e847c9613a722e91ff5eca3823815a88';
  let previousHash = '';
  let debounceTimer = null;

  function initTab1() {
    learnInputEl = document.getElementById('hash-learn-input');
    learnOutputEl = document.getElementById('hash-learn-output');
    inputLenEl = document.getElementById('hash-learn-input-len');
    diffStatsEl = document.getElementById('hash-learn-diff-stats');
    diffOutputEl = document.getElementById('hash-learn-diff-output');
    preset1Btn = document.getElementById('hash-learn-preset-1');
    preset2Btn = document.getElementById('hash-learn-preset-2');
    preset3Btn = document.getElementById('hash-learn-preset-3');
    resetBtn = document.getElementById('hash-learn-reset-btn');
    copyBtn = document.getElementById('hash-learn-copy-btn');
    gotoGenBtn = document.getElementById('hash-learn-goto-generate');
    gotoVerifyBtn = document.getElementById('hash-learn-goto-verify');

    if (!learnInputEl || !learnOutputEl) return;

    // Asynchronously compute exact baseline hash to ensure zero simulation
    computeHash(currentBaseline).then(h => {
      if (h && h !== 'CRYPTO_API_UNAVAILABLE') {
        baselineHash = h;
      }
    }).catch(() => {});

    learnInputEl.addEventListener('input', () => {
      // User is editing directly: immediately update baseline state to this new input
      currentBaseline = learnInputEl.value;
      activeSample = 'A';
      updateInputTag('A');
      updatePresetButtons(preset1Btn);

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateAvalancheDemo, 50);
    });

    if (preset1Btn) {
      preset1Btn.addEventListener('click', () => {
        selectSample('A');
      });
    }

    if (preset2Btn) {
      preset2Btn.addEventListener('click', () => {
        selectSample('B');
      });
    }

    if (preset3Btn) {
      preset3Btn.addEventListener('click', () => {
        selectSample('C');
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetToDefault();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        if (!learnOutputEl) return;
        const text = learnOutputEl.textContent.trim();
        
        // Provide immediate visual feedback
        const origHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="material-symbols-outlined text-[14px] text-emerald-400">check</span> COPIED';
        setTimeout(() => {
          copyBtn.innerHTML = origHtml;
        }, 1500);

        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
          } else {
            throw new Error('No clipboard API');
          }
        } catch (e) {
          // Fallback for unprivileged or headless contexts
          try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          } catch (err) {}
        }
      });
    }

    if (gotoGenBtn) {
      gotoGenBtn.addEventListener('click', () => {
        if (root.CastleHashUI && typeof root.CastleHashUI.selectTab === 'function') {
          root.CastleHashUI.selectTab('generate');
        }
      });
    }

    if (gotoVerifyBtn) {
      gotoVerifyBtn.addEventListener('click', () => {
        if (root.CastleHashUI && typeof root.CastleHashUI.selectTab === 'function') {
          root.CastleHashUI.selectTab('verify');
        }
      });
    }

    // Bind Curriculum Stepper & Interactive Knowledge Check
    initHashCurriculumStepper();
    initHashKnowledgeCheck();

    // Initial calculation
    updateAvalancheDemo();
  }

  let activeHashChapter = 0;
  const totalHashChapters = 4;

  function initHashCurriculumStepper() {
    const pills = document.querySelectorAll('.hash-chapter-step-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const idx = parseInt(pill.getAttribute('data-ch-index'), 10);
        showHashChapter(idx);
      });
    });

    const prevBtn = document.getElementById('hash-prev-chapter-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (activeHashChapter > 0) {
          showHashChapter(activeHashChapter - 1);
        }
      });
    }

    const nextBtn = document.getElementById('hash-next-chapter-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (activeHashChapter < totalHashChapters - 1) {
          showHashChapter(activeHashChapter + 1);
        } else {
          if (root.CastleHashUI && typeof root.CastleHashUI.selectTab === 'function') {
            root.CastleHashUI.selectTab('generate');
          }
        }
      });
    }

    showHashChapter(0);
  }

  function showHashChapter(index) {
    if (index < 0 || index >= totalHashChapters) return;
    activeHashChapter = index;

    const pills = document.querySelectorAll('.hash-chapter-step-pill');
    pills.forEach((p, i) => {
      const isActive = (i === index);
      p.classList.toggle('active', isActive);
      p.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    const panes = document.querySelectorAll('.hash-learn-pane');
    panes.forEach((p, i) => {
      const isActive = (i === index);
      p.classList.toggle('active', isActive);
      if (isActive) {
        p.classList.remove('hidden');
        p.style.display = 'flex';
      } else {
        p.classList.add('hidden');
        p.style.display = 'none';
      }
    });

    const prevBtn = document.getElementById('hash-prev-chapter-btn');
    const nextBtn = document.getElementById('hash-next-chapter-btn');
    if (prevBtn) prevBtn.disabled = (index === 0);
    if (nextBtn) {
      if (index === totalHashChapters - 1) {
        nextBtn.innerHTML = `<span>Generate</span><span class="material-symbols-outlined text-sm">arrow_forward</span>`;
      } else {
        nextBtn.innerHTML = `<span>Next</span><span class="material-symbols-outlined text-sm">arrow_forward</span>`;
      }
    }

    const modal = document.getElementById('hash-toolkit-modal');
    if (modal) {
      const scrollable = modal.querySelector('.overflow-y-auto');
      if (scrollable) scrollable.scrollTop = 0;
    }
  }

  function initHashKnowledgeCheck() {
    const cards = document.querySelectorAll('.hash-knowledge-card');
    cards.forEach(card => {
      const qId = card.getAttribute('data-quiz-id');
      const optionBtns = card.querySelectorAll('.knowledge-option-btn');
      const feedbackBanner = card.querySelector('.knowledge-feedback-banner');

      optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const isCorrect = btn.getAttribute('data-correct') === 'true';

          optionBtns.forEach(b => {
            b.classList.remove('selected-correct', 'selected-incorrect');
            b.disabled = true;
          });

          if (isCorrect) {
            btn.classList.add('selected-correct');
            feedbackBanner.className = 'knowledge-feedback-banner show border border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
            feedbackBanner.innerHTML = `
              <div class="flex items-center gap-1.5 font-bold mb-1">
                <span class="material-symbols-outlined text-base">check_circle</span>
                <span>CORRECT VERIFICATION</span>
              </div>
              <p class="text-zinc-300 font-sans">
                ${getHashQuizExplanation(qId, true)}
              </p>
            `;
          } else {
            btn.classList.add('selected-incorrect');
            optionBtns.forEach(b => {
              if (b.getAttribute('data-correct') === 'true') {
                b.classList.add('selected-correct');
              }
            });
            feedbackBanner.className = 'knowledge-feedback-banner show border border-red-500/40 bg-red-500/10 text-red-300';
            feedbackBanner.innerHTML = `
              <div class="flex items-center gap-1.5 font-bold mb-1">
                <span class="material-symbols-outlined text-base">cancel</span>
                <span>INCORRECT ARCHITECTURE</span>
              </div>
              <p class="text-zinc-300 font-sans">
                ${getHashQuizExplanation(qId, false)}
              </p>
            `;
          }
        });
      });
    });
  }

  function getHashQuizExplanation(qId, isCorrect) {
    switch (qId) {
      case 'hq1':
        return `Hashing is a one-way mathematical function designed solely to verify integrity and detect tampering with no key or reversible path. Encryption is a two-way transform designed for confidentiality, allowing authorized holders of a secret key to decrypt the payload.`;
      case 'hq2':
        return `Cryptographic hashes like SHA-256 were designed for maximum processing speed (gigabytes per second for disk and network integrity). Because they have zero memory-hardness or iteration delay, attackers using GPU clusters can test trillions of guesses per second against password hashes. Passwords require memory-hard KDFs like Argon2id.`;
      case 'hq3':
        return `The Avalanche Effect (formalized in the Strict Avalanche Criterion) mandates that modifying even a single input bit must cause each output digest bit to change with an independent 50% probability, preventing attackers from predicting how inputs correspond to outputs.`;
      default:
        return `Review the cryptographic principles in the previous chapters.`;
    }
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getSymbolMutation(text) {
    // Append '.' dynamically to current baseline
    return (text || '') + '.';
  }

  function getCaseMutation(text) {
    const s = text || '';
    if (!s) return 'a';
    // If text contains uppercase characters, convert to lowercase
    if (s.toLowerCase() !== s) {
      return s.toLowerCase();
    }
    // If text is all lowercase, convert to uppercase
    if (s.toUpperCase() !== s) {
      return s.toUpperCase();
    }
    // If text has no casing characters (e.g. '123456'), mutate by appending 'a'
    return s + 'a';
  }

  function selectSample(sampleKey) {
    if (!learnInputEl) return;
    activeSample = sampleKey;

    if (sampleKey === 'A') {
      learnInputEl.value = currentBaseline;
      updateInputTag('A');
      updatePresetButtons(preset1Btn);
      updateAvalancheDemo();
    } else if (sampleKey === 'B') {
      const mutatedVal = getSymbolMutation(currentBaseline);
      learnInputEl.value = mutatedVal;
      updateInputTag('B');
      updatePresetButtons(preset2Btn);
      updateAvalancheDemo();
    } else if (sampleKey === 'C') {
      const mutatedVal = getCaseMutation(currentBaseline);
      learnInputEl.value = mutatedVal;
      updateInputTag('C');
      updatePresetButtons(preset3Btn);
      updateAvalancheDemo();
    }
  }

  function resetToDefault() {
    currentBaseline = DEFAULT_BASELINE;
    activeSample = 'A';
    if (learnInputEl) {
      learnInputEl.value = currentBaseline;
    }
    updateInputTag('A');
    updatePresetButtons(preset1Btn);
    updateAvalancheDemo();
  }

  function updateInputTag(sampleKey) {
    const tagEl = document.getElementById('hash-learn-input-tag');
    if (!tagEl) return;
    if (sampleKey === 'A') {
      tagEl.className = 'text-emerald-400 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 font-normal';
      tagEl.textContent = 'EDITABLE BASELINE';
    } else if (sampleKey === 'B') {
      tagEl.className = 'text-brand-orange text-[10px] bg-[#FF6A00]/10 px-1.5 py-0.5 rounded border border-[#FF6A00]/30 font-normal';
      tagEl.textContent = "SAMPLE B MUTATION (+ '.')";
    } else if (sampleKey === 'C') {
      tagEl.className = 'text-brand-orange text-[10px] bg-[#FF6A00]/10 px-1.5 py-0.5 rounded border border-[#FF6A00]/30 font-normal';
      tagEl.textContent = 'SAMPLE C MUTATION (CASE)';
    }
  }

  function updatePresetButtons(activeBtn) {
    const buttons = [preset1Btn, preset2Btn, preset3Btn].filter(Boolean);
    buttons.forEach(btn => {
      if (btn === activeBtn) {
        btn.className = 'px-2.5 py-1 text-[11px] font-mono font-bold uppercase rounded transition-all bg-brand-orange text-black border border-brand-orange cursor-pointer';
      } else {
        btn.className = 'px-2.5 py-1 text-[11px] font-mono font-medium uppercase rounded text-zinc-400 hover:text-white hover:bg-[#1A1A1A] border border-transparent transition-all cursor-pointer';
      }
    });
  }

  async function computeHash(val) {
    if (root.CastleHashEngine && typeof root.CastleHashEngine.hashString === 'function') {
      return await root.CastleHashEngine.hashString('SHA-256', val);
    } else if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(val);
      const buf = await crypto.subtle.digest('SHA-256', data);
      const byteArray = new Uint8Array(buf);
      return Array.from(byteArray).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return 'CRYPTO_API_UNAVAILABLE';
  }

  function countFlippedBits(hexA, hexB) {
    let flipped = 0;
    const len = Math.min(hexA.length, hexB.length);
    for (let i = 0; i < len; i++) {
      const a = parseInt(hexA[i], 16);
      const b = parseInt(hexB[i], 16);
      if (!isNaN(a) && !isNaN(b)) {
        let xor = a ^ b;
        while (xor > 0) {
          if (xor & 1) flipped++;
          xor >>= 1;
        }
      }
    }
    return flipped;
  }

  function countDifferentChars(hexA, hexB) {
    let diff = 0;
    const len = Math.min(hexA.length, hexB.length);
    for (let i = 0; i < len; i++) {
      if (hexA[i] !== hexB[i]) diff++;
    }
    return diff;
  }

  async function updateAvalancheDemo() {
    if (!learnInputEl || !learnOutputEl) return;

    const currentVal = learnInputEl.value;
    if (inputLenEl) {
      inputLenEl.textContent = new TextEncoder().encode(currentVal).length;
    }

    try {
      // Always ensure fresh baseline hash for currentBaseline
      baselineHash = await computeHash(currentBaseline);

      let currentHash = '';
      if (activeSample === 'A' || currentVal === currentBaseline) {
        currentHash = baselineHash;
      } else {
        currentHash = await computeHash(currentVal);
      }

      learnOutputEl.textContent = currentHash;

      // Subtle pulse animation when hash changes
      if (previousHash && currentHash !== previousHash) {
        triggerAvalancheHighlight();
      }
      previousHash = currentHash;

      // Update differential breakdown against baseline
      renderDifferential(currentHash, currentVal);
    } catch (err) {
      console.error('Error computing avalanche hash:', err);
      learnOutputEl.textContent = 'ERROR_CALCULATING_HASH';
    }
  }

  function renderDifferential(currentHash, currentInput) {
    if (!diffStatsEl || !diffOutputEl) return;

    const isBaseline = (activeSample === 'A' || currentInput === currentBaseline);

    if (isBaseline) {
      diffStatsEl.innerHTML = `
        <span class="text-emerald-400 font-bold">BASELINE READY</span>
        <span class="text-zinc-600">|</span>
        <span class="text-zinc-400">Mutate input or click Sample B/C to measure avalanche effect</span>
      `;

      let charsHtml = '';
      for (let i = 0; i < currentHash.length; i++) {
        charsHtml += `<span class="text-zinc-400 font-medium">${currentHash[i]}</span>`;
      }

      diffOutputEl.innerHTML = `
        <div class="flex flex-col gap-2.5">
          <div class="leading-relaxed select-all break-all">${charsHtml}</div>
          <div class="pt-2 border-t border-[#1A1A1A] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-zinc-500">
            <div class="flex items-center gap-1.5 truncate">
              <span class="text-zinc-400 font-semibold uppercase">ACTIVE BASELINE:</span>
              <span class="text-emerald-400 font-mono truncate">"${escapeHtml(currentBaseline)}"</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-zinc-400">HAMMING DISTANCE:</span>
              <strong class="text-zinc-300 font-mono">0 / 256 BITS (0.0%)</strong>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const totalBits = 256;
    const totalChars = 64;
    const flippedBits = countFlippedBits(currentHash, baselineHash);
    const flippedChars = countDifferentChars(currentHash, baselineHash);
    const bitPct = ((flippedBits / totalBits) * 100).toFixed(1);
    const charPct = ((flippedChars / totalChars) * 100).toFixed(1);

    diffStatsEl.innerHTML = `
      <span class="text-brand-orange font-bold">${flippedBits}/256 BITS FLIPPED (${bitPct}%)</span>
      <span class="text-zinc-600">|</span>
      <span class="text-zinc-300 font-medium">${flippedChars}/64 CHARS MUTATED (${charPct}%)</span>
      <span class="text-zinc-600 hidden sm:inline">|</span>
      <span class="text-emerald-400 font-bold hidden sm:inline">SAC ~50%</span>
    `;

    // Highlight mutated characters in brand orange and keep identical ones subdued
    let html = '';
    for (let i = 0; i < currentHash.length; i++) {
      const char = currentHash[i];
      const baseChar = baselineHash[i] || '';
      if (char !== baseChar) {
        html += `<span class="text-brand-orange font-bold bg-[#FF6A00]/20 px-0.5 rounded border border-[#FF6A00]/40">${char}</span>`;
      } else {
        html += `<span class="text-zinc-500 font-medium">${char}</span>`;
      }
    }

    const mutationLabel = activeSample === 'B' 
      ? "SAMPLE B (SYMBOL MUTATION '+')" 
      : (activeSample === 'C' ? "SAMPLE C (CASE MUTATION)" : "CUSTOM MUTATION");

    diffOutputEl.innerHTML = `
      <div class="flex flex-col gap-2.5">
        <div class="leading-relaxed select-all break-all">${html}</div>
        <div class="pt-2.5 border-t border-[#1A1A1A] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div class="p-2 bg-[#0A0A0A] rounded border border-[#1E1E1E] flex flex-col gap-1 min-w-0">
            <div class="flex items-center justify-between text-zinc-500 font-semibold">
              <span class="text-zinc-400">ORIGINAL BASELINE</span>
              <span class="text-emerald-400 text-[10px] bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">REFERENCE</span>
            </div>
            <div class="text-zinc-200 font-mono text-xs truncate" title="${escapeHtml(currentBaseline)}">"${escapeHtml(currentBaseline)}"</div>
            <div class="text-[10px] text-zinc-500 font-mono truncate select-all">${baselineHash}</div>
          </div>
          <div class="p-2 bg-[#0A0A0A] rounded border border-[#1E1E1E] flex flex-col gap-1 min-w-0">
            <div class="flex items-center justify-between text-zinc-500 font-semibold">
              <span class="text-brand-orange">${mutationLabel}</span>
              <span class="text-brand-orange font-mono text-[10px] bg-[#FF6A00]/10 px-1 py-0.2 rounded border border-[#FF6A00]/20">${bitPct}% CASCADE</span>
            </div>
            <div class="text-zinc-200 font-mono text-xs truncate" title="${escapeHtml(currentInput)}">"${escapeHtml(currentInput)}"</div>
            <div class="text-[10px] text-zinc-500 font-mono truncate select-all">${currentHash}</div>
          </div>
        </div>
      </div>
    `;
  }

  function triggerAvalancheHighlight() {
    if (!learnOutputEl) return;
    const container = learnOutputEl.closest('.hash-avalanche-container') || learnOutputEl;
    
    container.classList.add('border-brand-orange', 'shadow-[0_0_15px_rgba(255,106,0,0.35)]');
    setTimeout(() => {
      container.classList.remove('border-brand-orange', 'shadow-[0_0_15px_rgba(255,106,0,0.35)]');
    }, 250);
  }

  root.CastleHashLearn = {
    initTab1,
    updateAvalancheDemo,
    selectSample,
    resetToDefault,
    getBaseline: () => currentBaseline,
    setBaseline: (val) => {
      currentBaseline = val;
      activeSample = 'A';
      if (learnInputEl) learnInputEl.value = val;
      updateInputTag('A');
      updatePresetButtons(preset1Btn);
      updateAvalancheDemo();
    },
    getActiveSample: () => activeSample
  };
})(typeof window !== 'undefined' ? window : this);
