/**
 * Castle Cybersecurity Toolbox - Password Module UI Controller
 * Manages unified workspace modal, tabs, conversational wizard, dual segmented meters,
 * telemetry header, session history, architectural explanations, and real-time verification analysis.
 * Fully aligned with Google Stitch Design System specifications.
 */

window.CastlePassword = window.CastlePassword || {};

(function(exports) {
  'use strict';

  class PasswordUI {
    constructor() {
      this.generator = new exports.Generator();
      this.sessionHistory = [];
      this.currentPrompts = [];
      this.activeTab = 'create'; // 'create' | 'analyze'
      this.lastResult = null;
      this.isPracticingRecall = false;
      
      this.initDOMReferences();
      this.bindEvents();
      this.setupConversationalPrompts();

      // Initial single generation
      this.generatePassword({ addToHistory: true });

      // Initialize analysis with default value
      if (this.analyzeInputField) {
        this.renderAnalysisTab();
      }
    }

    initDOMReferences() {
      // Top Telemetry Header & Modal Controls
      this.resetWorkspaceBtn = document.getElementById('pw-reset-workspace-btn');
      this.modalCloseBtn = document.getElementById('pw-modal-close');
      this.modalBackdrop = document.getElementById('pw-modal-backdrop');
      this.passwordModal = document.getElementById('password-modal');

      // Tabs
      this.tabBtnLearn = document.getElementById('pw-tab-btn-learn');
      this.tabBtnCreate = document.getElementById('pw-tab-btn-create');
      this.tabBtnAnalyze = document.getElementById('pw-tab-btn-analyze');
      this.tabPanelLearn = document.getElementById('pw-tab-panel-learn');
      this.tabPanelCreate = document.getElementById('pw-tab-panel-create');
      this.tabPanelAnalyze = document.getElementById('pw-tab-panel-analyze');

      // Method Selectable Cards
      this.methodCards = document.querySelectorAll('[data-method-card]');
      this.activeEngineTitle = document.getElementById('pw-active-engine-title');
      this.methodInputsContainer = document.getElementById('pw-method-inputs-container');

      // Specific Method Inputs
      this.inputWord = document.getElementById('pw-input-word');
      this.inputPhrase = document.getElementById('pw-input-phrase');
      this.inputInitialism = document.getElementById('pw-input-initialism');
      this.themeButtons = document.querySelectorAll('[data-theme-btn]');

      // Conversational Wizard
      this.conversationalContainer = document.getElementById('pw-conversational-container');
      this.promptQuestionsList = document.getElementById('pw-prompt-questions-list');
      this.refreshPromptsBtn = document.getElementById('pw-refresh-prompts-btn');

      // Presets
      this.presetMaxSecurity = document.getElementById('pw-preset-max-sec');
      this.presetMaxMemorability = document.getElementById('pw-preset-max-mem');

      // Configuration Controls
      this.lengthSlider = document.getElementById('pw-length-slider');
      this.lengthVal = document.getElementById('pw-length-val');
      this.chkUppercase = document.getElementById('pw-opt-uppercase');
      this.chkLowercase = document.getElementById('pw-opt-lowercase');
      this.chkNumbers = document.getElementById('pw-opt-numbers');
      this.chkSymbols = document.getElementById('pw-opt-symbols');
      this.chkAmbiguous = document.getElementById('pw-opt-ambiguous');
      this.ambiguousBadge = document.getElementById('pw-ambiguous-badge');

      // Generated Output
      this.outputField = document.getElementById('pw-output-field');
      this.outputFormatted = document.getElementById('pw-output-formatted');
      this.toggleOutputVisibilityBtn = document.getElementById('pw-toggle-output-vis');
      this.refreshOutputBtn = document.getElementById('pw-refresh-btn');
      this.clearOutputBtn = document.getElementById('pw-clear-output-btn');
      this.copyOutputBtn = document.getElementById('pw-copy-btn');
      this.copyStatus = document.getElementById('pw-copy-status');
      this.generateActionBtn = document.getElementById('pw-generate-btn');

      // Session History
      this.historyList = document.getElementById('pw-history-list');
      this.clearHistoryBtn = document.getElementById('pw-clear-history-btn');

      // Dual Meters (Create Tab)
      this.entropyRatingPill = document.getElementById('pw-entropy-rating-pill');
      this.strengthLabel = document.getElementById('pw-strength-label');
      this.strengthBars = document.querySelectorAll('.pw-strength-bar');
      this.memorabilityLabel = document.getElementById('pw-memorability-label');
      this.memorabilityBar = document.getElementById('pw-memorability-bar');

      // Characteristics Telemetry Grid (Create Tab)
      this.entropyBits = document.getElementById('pw-entropy-bits');
      this.crackTimeText = document.getElementById('pw-crack-time');
      this.charLengthVal = document.getElementById('pw-char-length-val');
      this.charLengthRating = document.getElementById('pw-char-length-rating');
      this.charUpperVal = document.getElementById('pw-char-upper-val');
      this.charUpperPct = document.getElementById('pw-char-upper-pct');
      this.charLowerVal = document.getElementById('pw-char-lower-val');
      this.charLowerPct = document.getElementById('pw-char-lower-pct');
      this.charNumVal = document.getElementById('pw-char-num-val');
      this.charNumPct = document.getElementById('pw-char-num-pct');
      this.charSymVal = document.getElementById('pw-char-sym-val');
      this.charSymPct = document.getElementById('pw-char-sym-pct');
      this.charPoolVal = document.getElementById('pw-char-pool-val');

      // "Why this password?" Section (Section 04)
      this.whyMethodBadge = document.getElementById('pw-why-method-badge');
      this.constructionStepsContainer = document.getElementById('pw-construction-steps');
      this.whyList = document.getElementById('pw-why-list');

      // Enhanced Column B Elements
      this.memoryGuideBox = document.getElementById('pw-memory-guide-box');
      this.memoryTypePill = document.getElementById('pw-memory-type-pill');
      this.memorabilityBanner = document.getElementById('pw-memorability-banner');
      this.memorabilityBadge = document.getElementById('pw-memorability-badge');
      this.memorabilityGuidance = document.getElementById('pw-memorability-guidance');
      this.reconstructionSteps = document.getElementById('pw-reconstruction-steps');
      this.memoryHeadline = document.getElementById('pw-memory-headline');
      this.memoryAnchor = document.getElementById('pw-memory-anchor');
      this.memoryStepsList = document.getElementById('pw-memory-steps-list');
      this.memoryNumericCallout = document.getElementById('pw-memory-numeric-callout');
      this.memoryNumericText = document.getElementById('pw-memory-numeric-text');
      this.paddingLimitationCallout = document.getElementById('pw-padding-limitation-callout');
      this.paddingLimitationText = document.getElementById('pw-padding-limitation-text');
      this.memorySecurityCaveat = document.getElementById('pw-memory-security-caveat');

      // Practice Recall Controls
      this.practiceRecallBox = document.getElementById('pw-practice-recall-box');
      this.practiceToggleBtn = document.getElementById('pw-practice-toggle-btn');
      this.practiceToggleLabel = document.getElementById('pw-practice-toggle-label');
      this.practiceForm = document.getElementById('pw-practice-form');
      this.practiceInput = document.getElementById('pw-practice-input');
      this.practiceVerifyBtn = document.getElementById('pw-practice-verify-btn');
      this.practiceExitBtn = document.getElementById('pw-practice-exit-btn');
      this.practiceFeedback = document.getElementById('pw-practice-feedback');

      // Tab 2 (Analyze Tab) Controls
      this.btnDemoComplex = document.getElementById('pw-btn-demo-complex');
      this.btnDemoWeak = document.getElementById('pw-btn-demo-weak');
      this.analyzeInputField = document.getElementById('pw-analyze-input');
      this.toggleAnalyzeVisBtn = document.getElementById('pw-toggle-analyze-vis');
      this.btnClearAnalyzeInput = document.getElementById('pw-clear-analyze-input');
      this.analyzeBtn = document.getElementById('pw-analyze-btn');
      this.analyzeInputStateBadge = document.getElementById('pw-analyze-input-state-badge');

      // Tab 2 Meters & Technical Breakdown
      this.analyzeTierBadge = document.getElementById('pw-analyze-tier-badge');
      this.analyzeStrengthScore = document.getElementById('pw-analyze-strength-score');
      this.analyzeBars = document.querySelectorAll('.pw-analyze-bar');
      this.analyzeSummaryText = document.getElementById('pw-analyze-summary-text');

      // Tab 2 Characteristics
      this.analyzeCharLen = document.getElementById('pw-analyze-char-len');
      this.analyzeCharLenBadge = document.getElementById('pw-analyze-char-len-badge');
      this.analyzeCharUpper = document.getElementById('pw-analyze-char-upper');
      this.analyzeCharUpperBadge = document.getElementById('pw-analyze-char-upper-badge');
      this.analyzeCharLower = document.getElementById('pw-analyze-char-lower');
      this.analyzeCharLowerBadge = document.getElementById('pw-analyze-char-lower-badge');
      this.analyzeCharNum = document.getElementById('pw-analyze-char-num');
      this.analyzeCharNumBadge = document.getElementById('pw-analyze-char-num-badge');
      this.analyzeCharSym = document.getElementById('pw-analyze-char-sym');
      this.analyzeCharSymBadge = document.getElementById('pw-analyze-char-sym-badge');
      this.analyzeCharVariety = document.getElementById('pw-analyze-char-variety');
      this.analyzeCharVarietyBadge = document.getElementById('pw-analyze-char-variety-badge');
      this.analyzeEntropyBits = document.getElementById('pw-analyze-entropy-bits');
      this.analyzeKeyspace = document.getElementById('pw-analyze-keyspace');

      // Tab 2 Finding Cards
      this.analyzeDictBadge = document.getElementById('pw-analyze-dict-badge');
      this.analyzeDictDetected = document.getElementById('pw-analyze-dict-detected');
      this.analyzeDictAction = document.getElementById('pw-analyze-dict-action');
      this.analyzeSeqBadge = document.getElementById('pw-analyze-seq-badge');
      this.analyzeSeqDetected = document.getElementById('pw-analyze-seq-detected');
      this.analyzeSeqAction = document.getElementById('pw-analyze-seq-action');
      this.analyzeRepBadge = document.getElementById('pw-analyze-rep-badge');
      this.analyzeRepDetected = document.getElementById('pw-analyze-rep-detected');
      this.analyzeRepAction = document.getElementById('pw-analyze-rep-action');

      // Tab 2 Guessing Resistance
      this.analyzeCrackOffline = document.getElementById('pw-analyze-crack-offline');
      this.analyzeCrackOnline = document.getElementById('pw-analyze-crack-online');

      // Tab 2 Recommended Upgrade
      this.analyzeRecBox = document.getElementById('pw-analyze-rec-box');
      this.analyzeRecOutput = document.getElementById('pw-analyze-rec-output');
      this.analyzeCopyRecBtn = document.getElementById('pw-analyze-copy-rec-btn');
    }

    bindEvents() {
      // Tab switching
      if (this.tabBtnLearn) {
        this.tabBtnLearn.addEventListener('click', () => this.switchTab('learn'));
      }
      if (this.tabBtnCreate) {
        this.tabBtnCreate.addEventListener('click', () => this.switchTab('create'));
      }
      if (this.tabBtnAnalyze) {
        this.tabBtnAnalyze.addEventListener('click', () => this.switchTab('analyze'));
      }

      // Telemetry Header: Reset Workspace
      if (this.resetWorkspaceBtn) {
        this.resetWorkspaceBtn.addEventListener('click', () => this.resetWorkspace());
      }

      // Method Selection Cards
      this.methodCards.forEach(card => {
        card.addEventListener('click', () => {
          const method = card.getAttribute('data-method-card');
          this.selectMethod(method);
        });
      });

      // Specific Inputs
      if (this.inputWord) {
        this.inputWord.addEventListener('input', (e) => {
          this.generator.config.wordInput = e.target.value;
          this.generatePassword({ addToHistory: false });
        });
      }

      if (this.inputPhrase) {
        this.inputPhrase.addEventListener('input', (e) => {
          this.generator.config.phraseInput = e.target.value;
          this.generatePassword({ addToHistory: false });
        });
      }

      if (this.inputInitialism) {
        this.inputInitialism.addEventListener('input', (e) => {
          this.generator.config.initialismInput = e.target.value;
          this.generatePassword({ addToHistory: false });
        });
      }

      this.themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.themeButtons.forEach(b => {
            b.classList.remove('bg-brand-orange/20', 'border-brand-orange', 'text-brand-orange');
            b.classList.add('bg-[#141414]', 'border-[#262626]', 'text-zinc-400');
          });
          btn.classList.remove('bg-[#141414]', 'border-[#262626]', 'text-zinc-400');
          btn.classList.add('bg-brand-orange/20', 'border-brand-orange', 'text-brand-orange');
          
          this.generator.config.themeInput = btn.getAttribute('data-theme-btn');
          this.generatePassword({ addToHistory: false });
        });
      });

      if (this.refreshPromptsBtn) {
        this.refreshPromptsBtn.addEventListener('click', () => this.setupConversationalPrompts());
      }

      // Presets
      if (this.presetMaxSecurity) {
        this.presetMaxSecurity.addEventListener('click', () => {
          this.generator.config.method = 'random';
          this.generator.config.length = 16;
          this.generator.config.uppercase = true;
          this.generator.config.lowercase = true;
          this.generator.config.numbers = true;
          this.generator.config.symbols = true;
          this.generator.config.excludeAmbiguous = false;
          this.syncConfigToDOM();
          this.selectMethod('random', false);
          this.generatePassword({ addToHistory: true });
        });
      }

      if (this.presetMaxMemorability) {
        this.presetMaxMemorability.addEventListener('click', () => {
          this.generator.config.length = 24;
          this.generator.config.uppercase = true;
          this.generator.config.lowercase = true;
          this.generator.config.numbers = true;
          this.generator.config.symbols = true;
          this.syncConfigToDOM();
          this.selectMethod('random', false);
          this.generatePassword({ addToHistory: true });
        });
      }

      // Configuration Controls
      if (this.lengthSlider) {
        this.lengthSlider.addEventListener('input', (e) => {
          this.generator.config.length = parseInt(e.target.value, 10);
          if (this.lengthVal) this.lengthVal.textContent = `${this.generator.config.length} CHARACTERS`;
          this.generatePassword({ addToHistory: false });
        });
      }

      const checkToggles = [
        { el: this.chkUppercase, key: 'uppercase' },
        { el: this.chkLowercase, key: 'lowercase' },
        { el: this.chkNumbers, key: 'numbers' },
        { el: this.chkSymbols, key: 'symbols' },
        { el: this.chkAmbiguous, key: 'excludeAmbiguous' }
      ];

      checkToggles.forEach(({ el, key }) => {
        if (el) {
          el.addEventListener('change', (e) => {
            this.generator.config[key] = e.target.checked;
            
            // Prevent deselecting all character sets
            if (!this.generator.config.uppercase && !this.generator.config.lowercase && 
                !this.generator.config.numbers && !this.generator.config.symbols) {
              e.target.checked = true;
              this.generator.config[key] = true;
              this.showToast('At least one character set must remain enabled.', 'warning');
              return;
            }

            if (key === 'excludeAmbiguous' && this.ambiguousBadge) {
              this.ambiguousBadge.textContent = e.target.checked ? 'ENABLED' : 'OFF';
              this.ambiguousBadge.className = e.target.checked
                ? 'hidden sm:inline-block px-2.5 py-1 bg-[#141414] border border-emerald-500/40 text-emerald-400 font-mono text-xs rounded'
                : 'hidden sm:inline-block px-2.5 py-1 bg-[#141414] border border-[#262626] text-zinc-500 font-mono text-xs rounded';
            }

            this.generatePassword({ addToHistory: false });
          });
        }
      });

      // Actions: Explicit Generate button
      if (this.generateActionBtn) {
        this.generateActionBtn.addEventListener('click', () => {
          this.generatePassword({ addToHistory: true });
        });
      }

      // Actions: Refresh button in output box
      if (this.refreshOutputBtn) {
        this.refreshOutputBtn.addEventListener('click', () => {
          this.rotateIcon(this.refreshOutputBtn);
          this.generatePassword({ addToHistory: true });
        });
      }

      // Actions: Clear buffer
      if (this.clearOutputBtn) {
        this.clearOutputBtn.addEventListener('click', () => {
          if (this.outputField) this.outputField.value = '';
          if (this.outputFormatted) this.outputFormatted.innerHTML = '<span class="text-zinc-600 font-mono">[BUFFER CLEARED]</span>';
          if (this.copyStatus) {
            this.copyStatus.innerHTML = '<span class="material-symbols-outlined text-sm text-zinc-500">info</span><span class="text-zinc-500">Buffer empty</span>';
          }
          this.showToast('Password buffer cleared from volatile RAM', 'info');
        });
      }

      // Actions: Copy output
      if (this.copyOutputBtn) {
        this.copyOutputBtn.addEventListener('click', () => {
          const val = this.outputField ? this.outputField.value : '';
          if (!val) return;
          this.copyToClipboard(val);

          // Tactile visual confirmation on the copy button itself
          const origHtml = this.copyOutputBtn.innerHTML;
          const origClass = this.copyOutputBtn.className;
          this.copyOutputBtn.innerHTML = '<span class="material-symbols-outlined text-[15px] text-emerald-400">check</span><span class="text-emerald-400 font-bold">COPIED!</span>';
          this.copyOutputBtn.className = 'px-4 py-2 rounded font-mono text-xs font-bold uppercase transition-all bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer flex items-center gap-1.5 shrink-0';

          // Visual distinction: emerald pulse on the output container
          const outputCard = document.getElementById('pw-output-card') || (this.outputField ? this.outputField.closest('.bg-\\[\\#0D0D0D\\]') : null);
          if (outputCard) {
            outputCard.classList.remove('pulse-generated');
            outputCard.classList.add('pulse-copied');
            setTimeout(() => outputCard.classList.remove('pulse-copied'), 600);
          }

          if (this.copyStatus) {
            this.copyStatus.innerHTML = '<span class="material-symbols-outlined text-sm text-emerald-400">check_circle</span><span class="text-emerald-400 font-bold">Credential copied to clipboard (ephemeral RAM)!</span>';
          }

          setTimeout(() => {
            if (this.copyOutputBtn) {
              this.copyOutputBtn.innerHTML = origHtml;
              this.copyOutputBtn.className = origClass;
            }
            if (this.copyStatus) {
              this.copyStatus.innerHTML = '<span class="material-symbols-outlined text-sm text-emerald-400">check_circle</span><span>Ready to copy (RAM buffer)</span>';
            }
          }, 1800);
        });
      }

      // Actions: Clear History
      if (this.clearHistoryBtn) {
        this.clearHistoryBtn.addEventListener('click', () => {
          this.sessionHistory = [];
          this.renderHistory();
          this.showToast('Session history cleared', 'info');
        });
      }

      if (this.toggleOutputVisibilityBtn) {
        this.toggleOutputVisibilityBtn.addEventListener('click', () => {
          if (this.outputField) {
            const isPassword = this.outputField.type === 'password';
            this.outputField.type = isPassword ? 'text' : 'password';
            const icon = this.toggleOutputVisibilityBtn.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = isPassword ? 'visibility_off' : 'visibility';
            this.renderFormattedPassword(this.outputField.value);
          }
        });
      }

      // Practice Recall Events
      if (this.practiceToggleBtn) {
        this.practiceToggleBtn.addEventListener('click', () => this.togglePracticeRecall());
      }
      if (this.practiceVerifyBtn) {
        this.practiceVerifyBtn.addEventListener('click', () => this.verifyPracticeRecall());
      }
      if (this.practiceExitBtn) {
        this.practiceExitBtn.addEventListener('click', () => this.exitPracticeRecall());
      }
      if (this.practiceInput) {
        this.practiceInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.verifyPracticeRecall();
          }
        });
      }

      // Outside-click interaction on password modal wrapper
      if (this.passwordModal) {
        this.passwordModal.addEventListener('click', (e) => {
          if (e.target === this.passwordModal && window.closePasswordModal) {
            window.closePasswordModal();
          }
        });
      }

      // Keyboard Shortcut: [SPACE] or [ENTER] to generate when on Generator tab
      document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('password-modal');
        if (!modal || modal.classList.contains('hidden')) return;
        if (this.activeTab !== 'create') return;

        const target = e.target;
        const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
        if (isInput) return;

        // If a button or link is focused, let native event trigger click (prevent double firing)
        if (target && (target.tagName === 'BUTTON' || target.tagName === 'A')) {
          return;
        }

        if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.generatePassword({ addToHistory: true });
        }
      });

      // Tab 2 Events
      if (this.btnDemoComplex) {
        this.btnDemoComplex.addEventListener('click', () => {
          if (this.analyzeInputField) {
            this.analyzeInputField.value = 'CastleOrbit-2024!#vL8&wP4%';
            this.renderAnalysisTab();
          }
        });
      }

      if (this.btnDemoWeak) {
        this.btnDemoWeak.addEventListener('click', () => {
          if (this.analyzeInputField) {
            this.analyzeInputField.value = 'password2024!';
            this.renderAnalysisTab();
          }
        });
      }

      if (this.analyzeInputField) {
        this.analyzeInputField.addEventListener('input', () => this.renderAnalysisTab());
      }

      if (this.analyzeBtn) {
        this.analyzeBtn.addEventListener('click', () => {
          this.renderAnalysisTab();
        });
      }

      if (this.btnClearAnalyzeInput) {
        this.btnClearAnalyzeInput.addEventListener('click', () => {
          if (this.analyzeInputField) {
            this.analyzeInputField.value = '';
            this.renderAnalysisTab();
          }
        });
      }

      if (this.toggleAnalyzeVisBtn) {
        this.toggleAnalyzeVisBtn.addEventListener('click', () => {
          if (this.analyzeInputField) {
            const isPassword = this.analyzeInputField.type === 'password';
            this.analyzeInputField.type = isPassword ? 'text' : 'password';
            const icon = this.toggleAnalyzeVisBtn.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = isPassword ? 'visibility_off' : 'visibility';
          }
        });
      }

      if (this.analyzeCopyRecBtn) {
        this.analyzeCopyRecBtn.addEventListener('click', () => {
          if (this.analyzeRecOutput && this.analyzeRecOutput.textContent) {
            this.copyToClipboard(this.analyzeRecOutput.textContent);
          }
        });
      }
    }

    resetWorkspace() {
      this.generator.config = {
        method: 'random',
        length: 20,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: false,
        wordInput: 'castle',
        phraseInput: 'My favourite mountain',
        initialismInput: 'My Dog Bruno Loves Eating Chicken Every Sunday',
        themeInput: 'space',
        memoryAnswers: {}
      };

      this.syncConfigToDOM();
      this.selectMethod('random', false);
      if (this.inputWord) this.inputWord.value = 'castle';
      if (this.inputPhrase) this.inputPhrase.value = 'My favourite mountain';
      if (this.inputInitialism) this.inputInitialism.value = 'My Dog Bruno Loves Eating Chicken Every Sunday';

      this.setupConversationalPrompts();
      this.generatePassword({ addToHistory: true });

      if (this.analyzeInputField) {
        this.analyzeInputField.value = 'CastleOrbit-2024!#';
        this.renderAnalysisTab();
      }

      this.showToast('Workspace reset to factory defaults', 'success');
    }

    switchTab(tab) {
      this.activeTab = tab;
      const activeClass = 'flex-1 sm:flex-none inline-flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded bg-brand-orange text-black font-mono text-[11px] sm:text-xs md:text-sm font-bold tracking-wider uppercase shadow-[0_0_18px_rgba(255,106,0,0.4)] border border-brand-orange transition-all cursor-pointer';
      const inactiveClass = 'flex-1 sm:flex-none inline-flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded text-zinc-400 hover:text-white hover:bg-[#181818] font-mono text-[11px] sm:text-xs md:text-sm font-medium tracking-wider uppercase transition-all border border-transparent cursor-pointer';

      if (this.tabBtnLearn) this.tabBtnLearn.className = (tab === 'learn') ? activeClass : inactiveClass;
      if (this.tabBtnCreate) this.tabBtnCreate.className = (tab === 'create') ? activeClass : inactiveClass;
      if (this.tabBtnAnalyze) this.tabBtnAnalyze.className = (tab === 'analyze') ? activeClass : inactiveClass;

      if (this.tabPanelLearn) this.tabPanelLearn.classList.toggle('hidden', tab !== 'learn');
      if (this.tabPanelCreate) this.tabPanelCreate.classList.toggle('hidden', tab !== 'create');
      if (this.tabPanelAnalyze) this.tabPanelAnalyze.classList.toggle('hidden', tab !== 'analyze');

      if (tab === 'learn') {
        if (window.CastlePasswordLearn && typeof window.CastlePasswordLearn.init === 'function') {
          window.CastlePasswordLearn.init();
        }
      } else if (tab === 'create') {
        this.render(); // Re-render display only (no new password generated, no history added)
      } else if (tab === 'analyze') {
        this.renderAnalysisTab();
      }
    }

    selectMethod(method, triggerGenerate = true) {
      this.generator.config.method = method;

      const engineNames = {
        random: 'Fully Random Engine',
        word: 'Memorable Word Engine',
        phrase: 'Personal Phrase Engine',
        initialism: 'Sentence Initialism Engine',
        theme: 'Thematic Ontology Engine',
        memory_assisted: 'Castle Signature Memory Engine'
      };

      if (this.activeEngineTitle) {
        this.activeEngineTitle.textContent = `Method Settings: ${engineNames[method] || 'Custom Engine'}`;
      }

      this.methodCards.forEach(card => {
        const cardMethod = card.getAttribute('data-method-card');
        const badge = card.querySelector('[data-selected-badge]');
        const corners = card.querySelectorAll('span[class*="border-"]');
        
        if (cardMethod === method) {
          card.classList.remove('border-[#222222]', 'bg-[#0D0D0D]', 'hover:border-zinc-500');
          card.classList.add('border-2', 'border-brand-orange', 'bg-[#0D0D0D]', 'shadow-[0_0_20px_rgba(255,106,0,0.15)]');
          if (badge) badge.classList.remove('hidden');
          corners.forEach(c => {
            c.classList.remove('border-transparent', 'border-zinc-500');
            c.classList.add('border-brand-orange');
          });
        } else {
          card.classList.remove('border-2', 'border-brand-orange', 'shadow-[0_0_20px_rgba(255,106,0,0.15)]');
          card.classList.add('border', 'border-[#222222]', 'bg-[#0D0D0D]');
          if (badge) badge.classList.add('hidden');
          corners.forEach(c => {
            c.classList.remove('border-brand-orange');
            c.classList.add('border-transparent');
          });
        }
      });

      // Show/hide specific inputs
      document.querySelectorAll('[data-input-panel]').forEach(panel => panel.classList.add('hidden'));

      const activePanel = document.querySelector(`[data-input-panel="${method}"]`);
      if (activePanel) {
        activePanel.classList.remove('hidden');
      }

      if (triggerGenerate) {
        this.generatePassword({ addToHistory: false });
      }
    }

    setupConversationalPrompts() {
      this.currentPrompts = exports.Questions.getRandomPrompts(4);
      if (!this.promptQuestionsList) return;

      this.promptQuestionsList.innerHTML = '';
      
      this.currentPrompts.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'p-3 bg-[#0A0A0A] border border-[#222222] rounded flex flex-col gap-1.5';
        itemEl.innerHTML = `
          <div class="flex items-center gap-1.5 text-xs text-brand-orange font-mono uppercase font-semibold">
            <span class="material-symbols-outlined text-[16px]">${item.icon}</span>
            <span>PROMPT ${index + 1}: ${item.category}</span>
          </div>
          <p class="text-xs text-zinc-400 font-mono">${item.question}</p>
          <input type="text" data-prompt-id="${item.id}" placeholder="${item.placeholder}" class="w-full bg-[#050505] border border-[#262626] rounded px-2.5 py-1.5 text-xs font-mono text-zinc-200 focus:border-brand-orange focus:outline-none transition-all" />
        `;

        const inputEl = itemEl.querySelector('input');
        inputEl.addEventListener('input', (e) => {
          const val = e.target.value;
          if (val && !exports.Questions.isSafeAnswer(val)) {
            this.showToast('Please avoid sensitive PINs, passwords, or card numbers.', 'warning');
          }
          this.generator.config.memoryAnswers[item.id] = val;
          this.generatePassword({ addToHistory: false });
        });

        this.promptQuestionsList.appendChild(itemEl);
      });
    }

    syncConfigToDOM() {
      if (this.lengthSlider) this.lengthSlider.value = this.generator.config.length;
      if (this.lengthVal) this.lengthVal.textContent = `${this.generator.config.length} CHARACTERS`;
      if (this.chkUppercase) this.chkUppercase.checked = this.generator.config.uppercase;
      if (this.chkLowercase) this.chkLowercase.checked = this.generator.config.lowercase;
      if (this.chkNumbers) this.chkNumbers.checked = this.generator.config.numbers;
      if (this.chkSymbols) this.chkSymbols.checked = this.generator.config.symbols;
      if (this.chkAmbiguous) {
        this.chkAmbiguous.checked = this.generator.config.excludeAmbiguous;
        if (this.ambiguousBadge) {
          this.ambiguousBadge.textContent = this.generator.config.excludeAmbiguous ? 'ENABLED' : 'OFF';
          this.ambiguousBadge.className = this.generator.config.excludeAmbiguous
            ? 'hidden sm:inline-block px-2.5 py-1 bg-[#141414] border border-emerald-500/40 text-emerald-400 font-mono text-xs rounded'
            : 'hidden sm:inline-block px-2.5 py-1 bg-[#141414] border border-[#262626] text-zinc-500 font-mono text-xs rounded';
        }
      }
    }

    renderFormattedPassword(password) {
      if (!this.outputFormatted) return;

      if (this.isPracticingRecall) {
        this.outputFormatted.innerHTML = `<span class="text-amber-400 font-mono tracking-normal text-sm sm:text-base md:text-lg flex items-center gap-2 select-none">
          <span class="material-symbols-outlined text-lg animate-pulse">visibility_off</span>
          <span>•••••••••••••••• [HIDDEN DURING PRACTICE RECALL]</span>
        </span>`;
        return;
      }

      if (!password) {
        this.outputFormatted.innerHTML = '<span class="text-zinc-600 font-mono">Generating credential...</span>';
        return;
      }

      if (this.outputField && this.outputField.type === 'password') {
        this.outputFormatted.textContent = '•'.repeat(password.length);
        return;
      }

      let html = '';
      for (const char of password) {
        if (/[0-9]/.test(char)) {
          html += `<span class="text-brand-orange font-bold">${char}</span>`;
        } else if (/[^a-zA-Z0-9\s]/.test(char)) {
          html += `<span class="text-brand-orange font-bold">${char}</span>`;
        } else {
          html += `<span>${char}</span>`;
        }
      }
      this.outputFormatted.innerHTML = html;
    }

    /**
     * Centralized password generation entrypoint
     * Explicit Generate click / keyboard shortcut: addToHistory: true
     * Live preview changes (sliders/inputs/toggles): addToHistory: false
     */
    generatePassword(options = { addToHistory: true }) {
      const result = this.generator.generate();
      this.lastResult = result;

      // Reset practice feedback on new generation, but preserve practice mode if active
      if (this.practiceFeedback) {
        this.practiceFeedback.classList.add('hidden');
        this.practiceFeedback.innerHTML = '';
      }
      if (this.practiceInput) {
        this.practiceInput.value = '';
      }

      if (options.addToHistory && result.password) {
        // Avoid duplicate consecutive entries
        if (this.sessionHistory.length === 0 || this.sessionHistory[0] !== result.password) {
          this.sessionHistory.unshift(result.password);
          if (this.sessionHistory.length > 5) this.sessionHistory.pop();
          this.renderHistory();
        }
      }

      // Visual distinction: orange pulse on newly generated credential
      const outputCard = document.getElementById('pw-output-card') || (this.outputField ? this.outputField.closest('.bg-\\[\\#0D0D0D\\]') : null);
      if (outputCard) {
        outputCard.classList.remove('pulse-copied');
        outputCard.classList.add('pulse-generated');
        setTimeout(() => outputCard.classList.remove('pulse-generated'), 600);
      }

      this.render();
      return result;
    }

    render() {
      if (this.activeTab !== 'create') return;

      if (!this.lastResult) {
        this.lastResult = this.generator.generate();
      }

      const { password, explanations, metadata } = this.lastResult;
      
      if (this.outputField) {
        this.outputField.value = password;
      }
      this.renderFormattedPassword(password);

      // Evaluate Metrics
      const EntropyEngine = exports.Entropy;
      const strength = EntropyEngine.evaluateStrength(password);
      const memorabilityScore = EntropyEngine.calculateMemorabilityScore(password, this.generator.config.method);
      const crackTime = EntropyEngine.calculateCrackTime(password);
      const dist = EntropyEngine.getCharacterDistribution(password);
      const len = password.length;

      // Update Entropy Header Pill
      if (this.entropyRatingPill) {
        const ratingText = strength.entropy >= 120 ? 'FORTRESS GRADE' : (strength.entropy >= 80 ? 'HIGH DEFENSE' : 'STANDARD');
        this.entropyRatingPill.innerHTML = `
          <span class="size-2 rounded-full bg-emerald-400"></span>
          <span>${strength.entropy} BITS ENTROPY — ${ratingText}</span>
        `;
      }

      // Render Strength Meter
      if (this.strengthLabel) {
        let labelText = strength.level;
        if (strength.scoreStep === 4) labelText = 'FORTRESS GRADE';
        this.strengthLabel.textContent = labelText;
        this.strengthLabel.className = `font-mono text-xs uppercase font-bold tracking-wider ${strength.color}`;
      }

      if (this.strengthBars) {
        this.strengthBars.forEach((bar, index) => {
          bar.className = 'pw-strength-bar rounded-sm h-3 transition-colors duration-160 bg-[#1A1A1A]';
          if (index < strength.scoreStep) {
            bar.classList.add(strength.barColor || 'bg-brand-orange');
            if (strength.scoreStep === 4) {
              bar.classList.add('shadow-[0_0_10px_rgba(255,106,0,0.5)]');
            }
          }
        });
      }

      // Render Memorability Meter
      if (this.memorabilityLabel) {
        let memText = 'HIGH RECALL';
        let memColor = 'text-emerald-400';
        if (memorabilityScore < 40) {
          memText = 'LOW RECALL (RANDOM)';
          memColor = 'text-amber-400';
        } else if (memorabilityScore >= 75) {
          memText = 'EXCELLENT RECALL';
          memColor = 'text-brand-orange font-bold';
        }
        this.memorabilityLabel.textContent = `${memorabilityScore}% (${memText})`;
        this.memorabilityLabel.className = `font-mono text-xs uppercase tracking-wider ${memColor}`;
      }

      if (this.memorabilityBar) {
        const normalizedMem = Math.max(0, Math.min(100, memorabilityScore)) / 100;
        this.memorabilityBar.style.width = '100%';
        this.memorabilityBar.style.transformOrigin = 'left';
        this.memorabilityBar.style.transform = `scaleX(${normalizedMem})`;
        if (memorabilityScore >= 75) {
          this.memorabilityBar.className = 'meter-bar-fill h-full bg-brand-orange rounded-sm shadow-[0_0_8px_rgba(255,106,0,0.6)]';
        } else if (memorabilityScore >= 45) {
          this.memorabilityBar.className = 'meter-bar-fill h-full bg-emerald-400 rounded-sm';
        } else {
          this.memorabilityBar.className = 'meter-bar-fill h-full bg-amber-400 rounded-sm';
        }
      }

      // Characteristics Telemetry Grid (Section 06)
      if (this.charLengthVal) this.charLengthVal.textContent = `${len} chars`;
      if (this.charLengthRating) {
        if (len >= 20) {
          this.charLengthRating.textContent = 'Maximum defense';
          this.charLengthRating.className = 'text-emerald-400 text-[11px] font-mono mt-0.5 block font-semibold';
        } else if (len >= 16) {
          this.charLengthRating.textContent = 'High security';
          this.charLengthRating.className = 'text-emerald-400 text-[11px] font-mono mt-0.5 block';
        } else if (len >= 12) {
          this.charLengthRating.textContent = 'Moderate security';
          this.charLengthRating.className = 'text-amber-400 text-[11px] font-mono mt-0.5 block';
        } else {
          this.charLengthRating.textContent = 'Short length';
          this.charLengthRating.className = 'text-red-400 text-[11px] font-mono mt-0.5 block';
        }
      }

      const uPct = len > 0 ? Math.round((dist.uppercase / len) * 100) : 0;
      const lPct = len > 0 ? Math.round((dist.lowercase / len) * 100) : 0;
      const nPct = len > 0 ? Math.round((dist.numbers / len) * 100) : 0;
      const sPct = len > 0 ? Math.round((dist.symbols / len) * 100) : 0;

      if (this.charUpperVal) this.charUpperVal.textContent = `${dist.uppercase} chars`;
      if (this.charUpperPct) this.charUpperPct.textContent = `${uPct}% density`;
      if (this.charLowerVal) this.charLowerVal.textContent = `${dist.lowercase} chars`;
      if (this.charLowerPct) this.charLowerPct.textContent = `${lPct}% density`;
      if (this.charNumVal) this.charNumVal.textContent = `${dist.numbers} chars`;
      if (this.charNumPct) this.charNumPct.textContent = `${nPct}% density`;
      if (this.charSymVal) this.charSymVal.textContent = `${dist.symbols} chars`;
      if (this.charSymPct) this.charSymPct.textContent = `${sPct}% density`;

      // Character Pool Size
      let poolSize = 0;
      if (this.generator.config.uppercase) poolSize += 26;
      if (this.generator.config.lowercase) poolSize += 26;
      if (this.generator.config.numbers) poolSize += 10;
      if (this.generator.config.symbols) poolSize += 33;
      if (this.generator.config.excludeAmbiguous) poolSize -= 8;
      if (poolSize < 1) poolSize = 95;
      if (this.charPoolVal) this.charPoolVal.textContent = `${poolSize} chars`;

      // Estimated Crack Time
      if (this.crackTimeText) {
        this.crackTimeText.textContent = crackTime.text.toUpperCase();
      }

      // Render Section 04: "Why this password?"
      const engineNames = {
        random: 'Fully Random Engine',
        word: 'Memorable Word Engine',
        phrase: 'Personal Phrase Engine',
        initialism: 'Sentence Initialism Engine',
        theme: 'Thematic Ontology Engine',
        memory_assisted: 'Castle Signature Memory Engine'
      };

      if (this.whyMethodBadge) {
        this.whyMethodBadge.textContent = (engineNames[this.generator.config.method] || 'ACTIVE ENGINE').toUpperCase();
      }

      // 4A: Engine Construction Steps
      if (this.constructionStepsContainer) {
        this.constructionStepsContainer.innerHTML = '';
        const steps = (metadata && metadata.constructionSteps) || [];
        if (steps.length > 0) {
          steps.forEach((st, idx) => {
            const stepEl = document.createElement('div');
            stepEl.className = 'p-2.5 rounded bg-[#0A0A0A] border border-[#1E1E1E] flex items-start gap-2.5 text-xs font-mono';
            const label = st.step || st.label || `Step ${idx + 1}`;
            const detail = st.description || st.detail || '';
            stepEl.innerHTML = `
              <span class="size-5 rounded bg-brand-orange/15 text-brand-orange font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 border border-brand-orange/30">${idx + 1}</span>
              <div class="flex-1 min-w-0">
                <span class="text-white font-semibold">${label}:</span>
                <span class="text-zinc-300 ml-1">${detail}</span>
              </div>
            `;
            this.constructionStepsContainer.appendChild(stepEl);
          });
        }
      }

      // Backward-compatible explanation bullets
      if (this.whyList) {
        this.whyList.innerHTML = '';
        const expList = explanations || [];
        expList.forEach(exp => {
          const li = document.createElement('li');
          li.className = 'flex items-start gap-2 text-xs text-zinc-300 font-mono';
          li.innerHTML = `<span class="material-symbols-outlined text-emerald-400 text-[16px] shrink-0">check_circle</span> <span>${exp}</span>`;
          this.whyList.appendChild(li);
        });
      }

      // 4B: Practical Memory & Reconstruction Guide
      const guide = metadata && metadata.memoryGuide;
      const mem = metadata && metadata.memorability;

      if (guide) {
        if (this.memoryTypePill) {
          const typeLabel = guide.type || (this.generator.config.method === 'random' ? 'CSPRNG Random' : 'Mnemonic Recall');
          this.memoryTypePill.textContent = typeLabel.toUpperCase();
        }
        if (this.memoryHeadline) {
          this.memoryHeadline.textContent = guide.headline || 'How to Remember This Password';
        }
        if (this.memoryAnchor) {
          const rawAnchor = guide.anchor || guide.mnemonicText || metadata.sourceInput || '';
          const cleanAnchor = rawAnchor.replace(/^Base word: |^Original phrase: |^"/g, '').replace(/"$/g, '');
          this.memoryAnchor.textContent = cleanAnchor ? `Anchor Concept: "${cleanAnchor}"` : '';
          this.memoryAnchor.style.display = cleanAnchor ? '' : 'none';
        }

        // Memorability Status Assessment Banner
        if (this.memorabilityBadge && mem) {
          this.memorabilityBadge.textContent = mem.badgeText || (mem.status === 'FULLY_MEMORABLE' ? '100% RECONSTRUCTIBLE' : mem.status);
          if (mem.status === 'FULLY_MEMORABLE') {
            this.memorabilityBadge.className = 'px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
          } else if (mem.status === 'PARTIALLY_MEMORABLE') {
            this.memorabilityBadge.className = 'px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30';
          } else {
            this.memorabilityBadge.className = 'px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30';
          }
        }
        if (this.memorabilityGuidance && mem) {
          this.memorabilityGuidance.textContent = mem.guidance || '';
        }

        // Sequential Left-to-Right Reconstruction Order Guide
        if (this.reconstructionSteps) {
          this.reconstructionSteps.innerHTML = '';
          const recSequence = (metadata && metadata.reconstruction) || [];
          if (recSequence.length > 0) {
            recSequence.forEach((step) => {
              const stepEl = document.createElement('div');
              const isPad = !!step.isPadding;
              stepEl.className = isPad
                ? 'p-2.5 rounded bg-[#0D0A08] border border-amber-500/35 flex flex-col gap-1 text-xs font-mono'
                : 'p-2.5 rounded bg-[#0A0A0A] border border-[#1E1E1E] flex flex-col gap-1 text-xs font-mono';
              
              const badgeColor = isPad
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-brand-orange/15 text-brand-orange border-brand-orange/30';
              
              const tagText = isPad
                ? 'RANDOM PADDING'
                : (step.isMnemonic ? 'MNEMONIC' : 'CSPRNG DELIMITER');
              
              const tagStyle = isPad
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#181818] text-zinc-400 border-[#262626]';

              stepEl.innerHTML = `
                <div class="flex items-center justify-between flex-wrap gap-1.5">
                  <div class="flex items-center gap-2">
                    <span class="size-5 rounded border ${badgeColor} font-bold flex items-center justify-center text-[10px] shrink-0">${step.step}</span>
                    <span class="text-white font-semibold">${step.name}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="px-1.5 py-0.5 rounded text-[10px] border ${tagStyle}">${tagText}</span>
                    <code class="px-2 py-0.5 rounded bg-[#141414] text-brand-orange border border-[#262626] font-bold text-[11px] tracking-wider select-all">${step.value}</code>
                  </div>
                </div>
                <p class="text-zinc-400 text-[11px] mt-0.5 leading-relaxed pl-7">${step.rule}</p>
              `;
              this.reconstructionSteps.appendChild(stepEl);
            });
          }
        }

        // Backward-compatible checklist
        if (this.memoryStepsList) {
          this.memoryStepsList.innerHTML = '';
          const recallSteps = guide.recallSteps || [];
          recallSteps.forEach(rs => {
            const row = document.createElement('div');
            row.className = 'flex items-start gap-2';
            row.innerHTML = `<span class="material-symbols-outlined text-brand-orange text-sm shrink-0 mt-0.5">check</span> <span>${rs}</span>`;
            this.memoryStepsList.appendChild(row);
          });
        }

        // Numeric Mnemonic Explanation Callout
        if (this.memoryNumericCallout && this.memoryNumericText) {
          let numText = '';
          if (typeof metadata.numericExplanation === 'string') {
            numText = metadata.numericExplanation;
          } else if (metadata.numericExplanation && typeof metadata.numericExplanation === 'object') {
            numText = metadata.numericExplanation.mnemonicRule || metadata.numericExplanation.text || '';
          }
          if (numText) {
            this.memoryNumericCallout.classList.remove('hidden');
            this.memoryNumericText.textContent = numText;
          } else {
            this.memoryNumericCallout.classList.add('hidden');
          }
        }

        // Random Padding Limitation Callout
        if (this.paddingLimitationCallout && this.paddingLimitationText) {
          if (mem && mem.paddingLength > 0) {
            this.paddingLimitationCallout.classList.remove('hidden');
            this.paddingLimitationText.textContent = `${mem.paddingLength} characters in this credential ("${mem.unmemorizablePortion}") are hardware-random CSPRNG noise appended to fulfill your ${mem.totalLength}-character length requirement. This padding cannot be derived from any mnemonic rule. For full security, store this credential in an encrypted password manager, or reduce length to ${mem.memorableLength} characters for a 100% memorable passphrase.`;
          } else {
            this.paddingLimitationCallout.classList.add('hidden');
          }
        }

        // Practice Recall toggle button label & form sync
        if (this.practiceToggleLabel) {
          this.practiceToggleLabel.textContent = this.isPracticingRecall ? 'Hide Practice' : 'Start Practice';
        }
        if (this.practiceForm) {
          if (this.isPracticingRecall) {
            this.practiceForm.classList.remove('hidden');
          } else {
            this.practiceForm.classList.add('hidden');
          }
        }

        if (this.memorySecurityCaveat) {
          const secText = guide.securityNote || guide.securityCaveat || metadata.numericExplanation?.securityNote || '';
          if (secText) {
            this.memorySecurityCaveat.innerHTML = `<strong class="text-zinc-400">Security Note:</strong> ${secText}`;
          }
        }
      }
    }

    togglePracticeRecall() {
      if (this.isPracticingRecall) {
        this.exitPracticeRecall();
      } else {
        this.startPracticeRecall();
      }
    }

    startPracticeRecall() {
      this.isPracticingRecall = true;
      if (this.practiceForm) this.practiceForm.classList.remove('hidden');
      if (this.practiceToggleLabel) this.practiceToggleLabel.textContent = 'Hide Practice';
      if (this.practiceFeedback) {
        this.practiceFeedback.classList.add('hidden');
        this.practiceFeedback.innerHTML = '';
      }
      if (this.practiceInput) {
        this.practiceInput.value = '';
        setTimeout(() => this.practiceInput.focus(), 50);
      }
      if (this.lastResult) {
        this.renderFormattedPassword(this.lastResult.password);
      }
    }

    exitPracticeRecall() {
      this.isPracticingRecall = false;
      if (this.practiceForm) this.practiceForm.classList.add('hidden');
      if (this.practiceToggleLabel) this.practiceToggleLabel.textContent = 'Start Practice';
      if (this.practiceFeedback) {
        this.practiceFeedback.classList.add('hidden');
        this.practiceFeedback.innerHTML = '';
      }
      if (this.lastResult) {
        this.renderFormattedPassword(this.lastResult.password);
      }
    }

    verifyPracticeRecall() {
      if (!this.lastResult || !this.lastResult.password) return;
      if (!this.practiceFeedback) return;

      const typed = (this.practiceInput ? this.practiceInput.value : '').trim();
      const expected = this.lastResult.password;
      const reconstruction = (this.lastResult.metadata && this.lastResult.metadata.reconstruction) || [];

      this.practiceFeedback.classList.remove('hidden');

      if (!typed) {
        this.practiceFeedback.className = 'flex flex-col gap-1.5 text-xs font-mono p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300';
        this.practiceFeedback.innerHTML = `
          <div class="flex items-center gap-1.5 font-bold">
            <span class="material-symbols-outlined text-base">info</span>
            <span>Input Required</span>
          </div>
          <p class="text-zinc-300">Please enter your reconstructed password to test your recall.</p>
        `;
        return;
      }

      if (typed === expected) {
        this.practiceFeedback.className = 'flex flex-col gap-1.5 text-xs font-mono p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400';
        this.practiceFeedback.innerHTML = `
          <div class="flex items-center gap-1.5 font-bold text-sm">
            <span class="material-symbols-outlined text-lg">verified</span>
            <span>RECALL SUCCESSFUL! 100% MATCH</span>
          </div>
          <p class="text-zinc-300">You successfully reconstructed all ${expected.length} characters of the password in the exact sequence.</p>
        `;
        return;
      }

      // Step-specific guidance without exposing the complete answer!
      this.practiceFeedback.className = 'flex flex-col gap-2 text-xs font-mono p-3 rounded bg-[#0A0A0A] border border-amber-500/40 text-zinc-300';

      let diagnosticHTML = `
        <div class="flex items-center justify-between border-b border-[#222222] pb-1.5">
          <span class="text-amber-400 font-bold uppercase flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">error</span>
            Recall Mismatch Diagnosed
          </span>
          <span class="text-[11px] text-zinc-500">Entered: ${typed.length} chars / Expected: ${expected.length} chars</span>
        </div>
        <div class="flex flex-col gap-1.5 mt-1">
      `;

      let currentOffset = 0;
      reconstruction.forEach((step) => {
        const stepVal = step.value || '';
        const stepLen = stepVal.length;
        const expectedSlice = expected.slice(currentOffset, currentOffset + stepLen);
        const typedSlice = typed.slice(currentOffset, currentOffset + stepLen);

        let statusIcon = 'check_circle';
        let statusColor = 'text-emerald-400';
        let statusMsg = 'Matched accurately';

        if (typed.length < currentOffset) {
          statusIcon = 'cancel';
          statusColor = 'text-red-400';
          statusMsg = 'Component missing (input is shorter than required)';
        } else if (typedSlice !== expectedSlice) {
          statusIcon = 'cancel';
          statusColor = 'text-amber-400';

          if (step.isPadding) {
            statusMsg = `Mismatch in random padding. Note: Random padding cannot be reconstructed from memory alone.`;
          } else if (step.type === 'anchor') {
            statusMsg = `Mismatch in anchor word: check alternating capitalization and substitutions.`;
          } else if (step.type === 'number') {
            statusMsg = `Mismatch in numeric component: re-check your derivation rule (${step.rule}).`;
          } else if (step.type === 'symbol' || step.type === 'separator') {
            statusMsg = `Mismatch in symbol position or glyph.`;
          } else if (step.type === 'salt') {
            statusMsg = `Mismatch in random salt digits. Note: Salt is hardware-random.`;
          } else {
            statusMsg = `Mismatch in this component.`;
          }
        }

        diagnosticHTML += `
          <div class="p-1.5 rounded bg-[#111111] border border-[#222222] flex items-start gap-2">
            <span class="material-symbols-outlined ${statusColor} text-[15px] shrink-0 mt-0.5">${statusIcon}</span>
            <div class="flex-1 min-w-0">
              <span class="text-white font-semibold">Step ${step.step} (${step.name}):</span>
              <span class="${statusColor} ml-1">${statusMsg}</span>
            </div>
          </div>
        `;

        currentOffset += stepLen;
      });

      diagnosticHTML += `</div>`;
      this.practiceFeedback.innerHTML = diagnosticHTML;
    }

    renderHistory() {
      if (!this.historyList) return;
      this.historyList.innerHTML = '';

      if (this.sessionHistory.length === 0) {
        this.historyList.innerHTML = `<p class="text-xs text-zinc-500 font-mono italic">No passwords generated in this session yet.</p>`;
        return;
      }

      this.sessionHistory.forEach((pw) => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-2.5 bg-[#0D0D0D] border border-[#222222] rounded text-xs font-mono';
        item.innerHTML = `
          <span class="truncate max-w-[280px] sm:max-w-md text-zinc-300 font-bold">${pw}</span>
          <button class="text-brand-orange hover:text-white transition-colors text-xs font-bold uppercase cursor-pointer" title="Copy">
            Copy
          </button>
        `;
        const btn = item.querySelector('button');
        btn.addEventListener('click', () => this.copyToClipboard(pw));
        this.historyList.appendChild(item);
      });
    }

    renderAnalysisTab() {
      if (!this.analyzeInputField) return;
      const pw = this.analyzeInputField.value;
      const len = pw.length;

      // Update loaded chars state badge
      if (this.analyzeInputStateBadge) {
        this.analyzeInputStateBadge.textContent = len > 0 ? `${len} CHARS LOADED` : 'EMPTY BUFFER';
      }

      const analysis = exports.Analysis.analyzePassword(pw);

      if (analysis.isEmpty) {
        if (this.analyzeTierBadge) {
          this.analyzeTierBadge.textContent = 'EMPTY';
          this.analyzeTierBadge.className = 'px-3.5 py-1 rounded font-mono text-xs font-bold uppercase tracking-wider bg-[#1A1A1A] text-zinc-500';
        }
        if (this.analyzeStrengthScore) this.analyzeStrengthScore.textContent = '0 / 100';
        if (this.analyzeBars) {
          this.analyzeBars.forEach(b => {
            b.className = 'pw-analyze-bar rounded-sm bg-[#1A1A1A] transition-all';
          });
        }
        if (this.analyzeSummaryText) {
          this.analyzeSummaryText.textContent = 'Type or paste any password to evaluate mathematical entropy and heuristic defenses.';
        }
        if (this.analyzeCharLen) this.analyzeCharLen.textContent = '0';
        if (this.analyzeCharUpper) this.analyzeCharUpper.textContent = '0';
        if (this.analyzeCharLower) this.analyzeCharLower.textContent = '0';
        if (this.analyzeCharNum) this.analyzeCharNum.textContent = '0';
        if (this.analyzeCharSym) this.analyzeCharSym.textContent = '0';
        if (this.analyzeCharVariety) this.analyzeCharVariety.textContent = '0 / 4';
        if (this.analyzeEntropyBits) this.analyzeEntropyBits.textContent = '0 Bits';
        if (this.analyzeKeyspace) this.analyzeKeyspace.textContent = '0';
        if (this.analyzeCrackOffline) this.analyzeCrackOffline.textContent = 'N/A';
        if (this.analyzeCrackOnline) this.analyzeCrackOnline.textContent = 'N/A';
        if (this.analyzeRecBox) this.analyzeRecBox.classList.add('hidden');
        return;
      }

      // Calculate 5-Segment Defense Tier based on effective entropy and heuristic penalties
      const rawEntropy = analysis.entropy;
      let effectiveEntropy = analysis.strength.adjustedEntropy || rawEntropy;

      // Heuristic penalties
      if (analysis.dictionaryWords.length > 0) {
        if (len < 16) {
          effectiveEntropy = Math.min(effectiveEntropy, 48);
        } else {
          effectiveEntropy = Math.min(84, effectiveEntropy - 10);
        }
      }
      if (analysis.patterns.length > 0 && len < 16) {
        effectiveEntropy = Math.min(effectiveEntropy, 42);
      }
      if (analysis.repeatedChars.length > 0 && len < 16) {
        effectiveEntropy = Math.min(effectiveEntropy, 42);
      }

      let scoreStep = 1;
      let tierLabel = 'Very Weak';
      let tierBg = 'bg-red-500 text-white';
      let barColor = 'bg-red-500';
      let scoreNum = Math.min(100, Math.max(10, Math.round((effectiveEntropy / 120) * 100)));

      if (effectiveEntropy >= 90 && analysis.weaknesses.length === 0) {
        scoreStep = 5;
        tierLabel = 'Very Strong';
        tierBg = 'bg-emerald-400 text-black';
        barColor = 'bg-emerald-400';
        scoreNum = Math.min(100, 85 + Math.round((effectiveEntropy - 90) / 2));
      } else if (effectiveEntropy >= 60) {
        scoreStep = 4;
        tierLabel = 'Strong';
        tierBg = 'bg-brand-orange text-black';
        barColor = 'bg-brand-orange';
        scoreNum = Math.min(84, 65 + Math.round((effectiveEntropy - 60) * 0.7));
      } else if (effectiveEntropy >= 45) {
        scoreStep = 3;
        tierLabel = 'Fair';
        tierBg = 'bg-amber-400 text-black';
        barColor = 'bg-amber-400';
        scoreNum = Math.min(64, 45 + Math.round(effectiveEntropy - 45));
      } else if (effectiveEntropy >= 25) {
        scoreStep = 2;
        tierLabel = 'Weak';
        tierBg = 'bg-orange-500 text-white';
        barColor = 'bg-orange-500';
        scoreNum = Math.min(44, 25 + Math.round(effectiveEntropy - 25));
      } else {
        scoreStep = 1;
        tierLabel = 'Very Weak';
        tierBg = 'bg-red-500 text-white';
        barColor = 'bg-red-500';
        scoreNum = Math.max(5, Math.round(effectiveEntropy));
      }

      if (this.analyzeTierBadge) {
        this.analyzeTierBadge.textContent = tierLabel;
        this.analyzeTierBadge.className = `px-3.5 py-1 rounded font-mono text-xs font-bold uppercase tracking-wider ${tierBg}`;
      }

      if (this.analyzeStrengthScore) {
        this.analyzeStrengthScore.textContent = `${scoreNum} / 100`;
      }

      if (this.analyzeBars) {
        this.analyzeBars.forEach((bar, index) => {
          if (index < scoreStep) {
            bar.className = `pw-analyze-bar rounded-sm transition-all h-3.5 ${barColor} shadow-[0_0_8px_rgba(255,106,0,0.5)]`;
          } else {
            bar.className = 'pw-analyze-bar rounded-sm bg-[#1A1A1A] transition-all h-3.5';
          }
        });
      }

      // Summary text
      if (this.analyzeSummaryText) {
        if (scoreStep >= 4) {
          this.analyzeSummaryText.textContent = 'High character variety and adequate length provide solid defense against dictionary attacks, safely exceeding standard GPU brute-force thresholds.';
        } else if (scoreStep === 3) {
          this.analyzeSummaryText.textContent = 'Fair resistance against opportunistic automated scans, but vulnerable to customized GPU dictionaries or dictionary root rule expansions.';
        } else {
          this.analyzeSummaryText.textContent = 'Critical structural vulnerability. Low length or predictable character patterns permit rapid dictionary or brute-force cracking in seconds.';
        }
      }

      // 6-Card Characteristics Grid
      const d = analysis.distribution;
      let activePools = 0;
      if (d.uppercase > 0) activePools++;
      if (d.lowercase > 0) activePools++;
      if (d.numbers > 0) activePools++;
      if (d.symbols > 0) activePools++;

      if (this.analyzeCharLen) this.analyzeCharLen.textContent = len;
      if (this.analyzeCharLenBadge) {
        if (len >= 16) {
          this.analyzeCharLenBadge.textContent = 'OPTIMAL (≥16)';
          this.analyzeCharLenBadge.className = 'font-mono text-[11px] text-emerald-400 font-medium';
        } else if (len >= 12) {
          this.analyzeCharLenBadge.textContent = 'ACCEPTABLE (≥12)';
          this.analyzeCharLenBadge.className = 'font-mono text-[11px] text-amber-400 font-medium';
        } else {
          this.analyzeCharLenBadge.textContent = 'SHORT (<12)';
          this.analyzeCharLenBadge.className = 'font-mono text-[11px] text-red-400 font-medium';
        }
      }

      if (this.analyzeCharUpper) this.analyzeCharUpper.textContent = d.uppercase;
      if (this.analyzeCharUpperBadge) {
        this.analyzeCharUpperBadge.textContent = d.uppercase > 0 ? '[A-Z] DETECTED' : 'NONE';
        this.analyzeCharUpperBadge.className = d.uppercase > 0 ? 'font-mono text-[11px] text-brand-orange' : 'font-mono text-[11px] text-zinc-500';
      }

      if (this.analyzeCharLower) this.analyzeCharLower.textContent = d.lowercase;
      if (this.analyzeCharLowerBadge) {
        this.analyzeCharLowerBadge.textContent = d.lowercase > 0 ? '[a-z] DETECTED' : 'NONE';
        this.analyzeCharLowerBadge.className = d.lowercase > 0 ? 'font-mono text-[11px] text-brand-orange' : 'font-mono text-[11px] text-zinc-500';
      }

      if (this.analyzeCharNum) this.analyzeCharNum.textContent = d.numbers;
      if (this.analyzeCharNumBadge) {
        this.analyzeCharNumBadge.textContent = d.numbers > 0 ? '[0-9] DETECTED' : 'NONE';
        this.analyzeCharNumBadge.className = d.numbers > 0 ? 'font-mono text-[11px] text-brand-orange' : 'font-mono text-[11px] text-zinc-500';
      }

      if (this.analyzeCharSym) this.analyzeCharSym.textContent = d.symbols;
      if (this.analyzeCharSymBadge) {
        this.analyzeCharSymBadge.textContent = d.symbols > 0 ? '[!@#$...] ACTIVE' : 'NONE';
        this.analyzeCharSymBadge.className = d.symbols > 0 ? 'font-mono text-[11px] text-emerald-400' : 'font-mono text-[11px] text-zinc-500';
      }

      if (this.analyzeCharVariety) this.analyzeCharVariety.textContent = `${activePools} / 4`;
      if (this.analyzeCharVarietyBadge) {
        this.analyzeCharVarietyBadge.textContent = activePools === 4 ? 'ALL POOLS ACTIVE' : `${activePools} ACTIVE POOLS`;
        this.analyzeCharVarietyBadge.className = activePools === 4 ? 'font-mono text-[11px] text-emerald-400 font-medium' : 'font-mono text-[11px] text-amber-400 font-medium';
      }

      // Shannon Entropy & Keyspace
      if (this.analyzeEntropyBits) {
        this.analyzeEntropyBits.textContent = `${analysis.entropy.toFixed(1)} Bits`;
      }
      if (this.analyzeKeyspace) {
        const exp = Math.round(analysis.entropy * 0.30103);
        const mantissa = (Math.pow(2, analysis.entropy % 3.3219)).toFixed(2);
        this.analyzeKeyspace.innerHTML = `~${mantissa} × 10<sup>${exp}</sup>`;
      }

      // Finding 1: Dictionary Root
      if (this.analyzeDictBadge && this.analyzeDictDetected && this.analyzeDictAction) {
        if (analysis.dictionaryWords.length > 0) {
          this.analyzeDictBadge.textContent = 'DICTIONARY PATTERN';
          this.analyzeDictBadge.className = 'px-2.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 font-mono text-[11px] font-bold uppercase';
          this.analyzeDictDetected.textContent = `Root word tokens "${analysis.dictionaryWords.join('", "')}" found in dictionary wordlists.`;
          this.analyzeDictAction.textContent = 'Use random multi-word passphrases or generate raw random characters.';
          this.analyzeDictAction.className = 'text-brand-orange';
        } else {
          this.analyzeDictBadge.textContent = 'PASSED HEURISTIC';
          this.analyzeDictBadge.className = 'px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] font-bold uppercase';
          this.analyzeDictDetected.textContent = 'No dictionary word root tokens detected.';
          this.analyzeDictAction.textContent = 'Maintain random word selection or CSPRNG generated strings.';
          this.analyzeDictAction.className = 'text-emerald-400 font-medium';
        }
      }

      // Finding 2: Sequential or Keyboard Patterns
      if (this.analyzeSeqBadge && this.analyzeSeqDetected && this.analyzeSeqAction) {
        if (analysis.patterns.length > 0) {
          this.analyzeSeqBadge.textContent = 'PATTERN DETECTED';
          this.analyzeSeqBadge.className = 'px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono text-[11px] font-bold uppercase';
          this.analyzeSeqDetected.textContent = `Sequential or keyboard patterns detected: "${analysis.patterns.join('", "')}".`;
          this.analyzeSeqAction.textContent = 'Replace sequential digits or keys with non-sequential characters or symbols.';
          this.analyzeSeqAction.className = 'text-brand-orange';
        } else {
          this.analyzeSeqBadge.textContent = 'PASSED HEURISTIC';
          this.analyzeSeqBadge.className = 'px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] font-bold uppercase';
          this.analyzeSeqDetected.textContent = 'No predictable sequential runs or keyboard walks detected.';
          this.analyzeSeqAction.textContent = 'Maintain uniform symbol dispersal across keyspace.';
          this.analyzeSeqAction.className = 'text-emerald-400 font-medium';
        }
      }

      // Finding 3: Repetition & Predictability
      if (this.analyzeRepBadge && this.analyzeRepDetected && this.analyzeRepAction) {
        if (analysis.repeatedChars.length > 0) {
          this.analyzeRepBadge.textContent = 'REPETITION DETECTED';
          this.analyzeRepBadge.className = 'px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono text-[11px] font-bold uppercase';
          this.analyzeRepDetected.textContent = `Repeated character runs detected: "${analysis.repeatedChars.join('", "')}".`;
          this.analyzeRepAction.textContent = 'Diversify characters to prevent entropy degradation.';
          this.analyzeRepAction.className = 'text-brand-orange';
        } else {
          this.analyzeRepBadge.textContent = 'PASSED HEURISTIC';
          this.analyzeRepBadge.className = 'px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] font-bold uppercase';
          this.analyzeRepDetected.textContent = 'No consecutive duplicate characters or repetitive runs.';
          this.analyzeRepAction.textContent = 'Maintain unique characters throughout the credential body.';
          this.analyzeRepAction.className = 'text-emerald-400 font-medium';
        }
      }

      // Estimated Guessing Resistance
      if (this.analyzeCrackOffline) {
        this.analyzeCrackOffline.textContent = analysis.crackTime.text.toUpperCase();
      }
      if (this.analyzeCrackOnline) {
        if (len >= 12 && scoreStep >= 3) {
          this.analyzeCrackOnline.innerHTML = 'Centuries <span class="text-xs font-normal text-zinc-500 font-mono">(Account Locked)</span>';
        } else {
          this.analyzeCrackOnline.innerHTML = 'Days to Weeks <span class="text-xs font-normal text-zinc-500 font-mono">(Throttled)</span>';
        }
      }

      // Recommended Improved Password Upgrade
      if (analysis.recommendedPassword && (scoreStep < 4 || analysis.weaknesses.length > 0)) {
        if (this.analyzeRecBox) this.analyzeRecBox.classList.remove('hidden');
        if (this.analyzeRecOutput) this.analyzeRecOutput.textContent = analysis.recommendedPassword;
      } else {
        if (this.analyzeRecBox) this.analyzeRecBox.classList.add('hidden');
      }
    }

    rotateIcon(btn) {
      if (!btn) return;
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.classList.add('animate-spin');
        setTimeout(() => icon.classList.remove('animate-spin'), 400);
      }
    }

    async copyToClipboard(text) {
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        this.showToast('Copied to clipboard!', 'success');
      } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showToast('Copied to clipboard!', 'success');
      }
    }

    showToast(message, type = 'info') {
      const container = document.getElementById('castle-toast-container') || this.createToastContainer();
      const toast = document.createElement('div');
      
      let borderColor = 'border-brand-orange/50';
      let textColor = 'text-brand-orange';
      let icon = 'info';

      if (type === 'success') {
        borderColor = 'border-emerald-500/50';
        textColor = 'text-emerald-400';
        icon = 'check_circle';
      } else if (type === 'warning') {
        borderColor = 'border-amber-500/50';
        textColor = 'text-amber-400';
        icon = 'warning';
      }

      toast.className = `bg-[#0D0D0D] border ${borderColor} px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs font-mono ${textColor} transition-all duration-300 transform translate-y-2 opacity-0 z-50`;
      toast.innerHTML = `<span class="material-symbols-outlined text-[18px]">${icon}</span> <span>${message}</span>`;

      container.appendChild(toast);

      setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
      setTimeout(() => {
        toast.classList.add('opacity-0', '-translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    createToastContainer() {
      const container = document.createElement('div');
      container.id = 'castle-toast-container';
      container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
      return container;
    }
  }

  exports.UI = PasswordUI;

})(window.CastlePassword);

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('password-modal')) {
    window.castlePasswordApp = new window.CastlePassword.UI();
    window.CastlePasswordUI = window.castlePasswordApp;
  }
});
