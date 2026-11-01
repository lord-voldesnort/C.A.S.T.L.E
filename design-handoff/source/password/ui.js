/**
 * Castle Cybersecurity Toolbox - Password Module UI Controller
 * Manages unified workspace modal, tabs, conversational wizard, dual meters,
 * session history, collapsible explanations, and real-time analysis.
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
      
      this.initDOMReferences();
      this.bindEvents();
      this.setupConversationalPrompts();
      this.render();
    }

    initDOMReferences() {
      // Tabs
      this.tabBtnCreate = document.getElementById('pw-tab-btn-create');
      this.tabBtnAnalyze = document.getElementById('pw-tab-btn-analyze');
      this.tabPanelCreate = document.getElementById('pw-tab-panel-create');
      this.tabPanelAnalyze = document.getElementById('pw-tab-panel-analyze');

      // Method Selectable Cards
      this.methodCards = document.querySelectorAll('[data-method-card]');
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

      // Generated Output
      this.outputField = document.getElementById('pw-output-field');
      this.toggleOutputVisibilityBtn = document.getElementById('pw-toggle-output-vis');
      this.refreshOutputBtn = document.getElementById('pw-refresh-btn');
      this.copyOutputBtn = document.getElementById('pw-copy-btn');
      this.generateActionBtn = document.getElementById('pw-generate-btn');

      // Session History
      this.historyContainer = document.getElementById('pw-history-container');
      this.historyList = document.getElementById('pw-history-list');

      // Dual Meters (Create Tab)
      this.strengthLabel = document.getElementById('pw-strength-label');
      this.strengthBars = document.querySelectorAll('.pw-strength-bar');
      this.memorabilityLabel = document.getElementById('pw-memorability-label');
      this.memorabilityBar = document.getElementById('pw-memorability-bar');

      // Analysis Breakdown (Create Tab)
      this.entropyBits = document.getElementById('pw-entropy-bits');
      this.crackTimeText = document.getElementById('pw-crack-time');
      this.charDistributionPills = document.getElementById('pw-char-dist-pills');

      // "Why this password?" Collapsible
      this.whyToggleBtn = document.getElementById('pw-why-toggle');
      this.whyContent = document.getElementById('pw-why-content');
      this.whyIcon = document.getElementById('pw-why-icon');
      this.whyList = document.getElementById('pw-why-list');

      // Tab 2 (Analyze Tab) Controls
      this.analyzeInputField = document.getElementById('pw-analyze-input');
      this.toggleAnalyzeVisBtn = document.getElementById('pw-toggle-analyze-vis');
      this.analyzeStrengthLabel = document.getElementById('pw-analyze-strength-label');
      this.analyzeStrengthBars = document.querySelectorAll('.pw-analyze-strength-bar');
      this.analyzeMemorabilityLabel = document.getElementById('pw-analyze-memorability-label');
      this.analyzeMemorabilityBar = document.getElementById('pw-analyze-memorability-bar');
      this.analyzeEntropyBits = document.getElementById('pw-analyze-entropy-bits');
      this.analyzeCrackTime = document.getElementById('pw-analyze-crack-time');
      this.analyzeLengthRating = document.getElementById('pw-analyze-length-rating');
      this.analyzeDistPills = document.getElementById('pw-analyze-dist-pills');
      this.analyzeWeaknessesList = document.getElementById('pw-analyze-weaknesses-list');
      this.analyzeSuggestionsList = document.getElementById('pw-analyze-suggestions-list');
      this.analyzePatternsContainer = document.getElementById('pw-analyze-patterns');
      this.analyzeRecBox = document.getElementById('pw-analyze-rec-box');
      this.analyzeRecOutput = document.getElementById('pw-analyze-rec-output');
      this.analyzeCopyRecBtn = document.getElementById('pw-analyze-copy-rec-btn');
    }

    bindEvents() {
      // Tab switching
      if (this.tabBtnCreate && this.tabBtnAnalyze) {
        this.tabBtnCreate.addEventListener('click', () => this.switchTab('create'));
        this.tabBtnAnalyze.addEventListener('click', () => this.switchTab('analyze'));
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
          this.render();
        });
      }

      if (this.inputPhrase) {
        this.inputPhrase.addEventListener('input', (e) => {
          this.generator.config.phraseInput = e.target.value;
          this.render();
        });
      }

      if (this.inputInitialism) {
        this.inputInitialism.addEventListener('input', (e) => {
          this.generator.config.initialismInput = e.target.value;
          this.render();
        });
      }

      this.themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.themeButtons.forEach(b => {
            b.classList.remove('bg-primary/20', 'border-primary', 'text-primary');
            b.classList.add('bg-surface-container-lowest', 'border-border/50', 'text-text-secondary');
          });
          btn.classList.remove('bg-surface-container-lowest', 'border-border/50', 'text-text-secondary');
          btn.classList.add('bg-primary/20', 'border-primary', 'text-primary');
          
          this.generator.config.themeInput = btn.getAttribute('data-theme-btn');
          this.render();
        });
      });

      if (this.refreshPromptsBtn) {
        this.refreshPromptsBtn.addEventListener('click', () => this.setupConversationalPrompts());
      }

      // Presets
      if (this.presetMaxSecurity) {
        this.presetMaxSecurity.addEventListener('click', () => {
          this.generator.applyMaxSecurityPreset();
          this.syncConfigToDOM();
          this.selectMethod('random');
          this.render();
          this.showToast('Applied Maximum Security Preset', 'info');
        });
      }

      if (this.presetMaxMemorability) {
        this.presetMaxMemorability.addEventListener('click', () => {
          this.generator.applyMaxMemorabilityPreset();
          this.syncConfigToDOM();
          this.selectMethod('memory_assisted');
          this.render();
          this.showToast('Applied Maximum Memorability Preset', 'info');
        });
      }

      // Configuration Controls
      if (this.lengthSlider) {
        this.lengthSlider.addEventListener('input', (e) => {
          this.generator.config.length = parseInt(e.target.value, 10);
          if (this.lengthVal) this.lengthVal.textContent = this.generator.config.length;
          this.render();
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
            
            // Prevent deselecting all
            if (!this.generator.config.uppercase && !this.generator.config.lowercase && 
                !this.generator.config.numbers && !this.generator.config.symbols) {
              e.target.checked = true;
              this.generator.config[key] = true;
              this.showToast('At least one character set must remain enabled.', 'warning');
              return;
            }
            this.render();
          });
        }
      });

      // Actions
      if (this.generateActionBtn) {
        this.generateActionBtn.addEventListener('click', () => this.render());
      }

      if (this.refreshOutputBtn) {
        this.refreshOutputBtn.addEventListener('click', () => {
          this.rotateIcon(this.refreshOutputBtn);
          this.render();
        });
      }

      if (this.copyOutputBtn) {
        this.copyOutputBtn.addEventListener('click', () => this.copyToClipboard(this.outputField ? this.outputField.value : ''));
      }

      if (this.toggleOutputVisibilityBtn) {
        this.toggleOutputVisibilityBtn.addEventListener('click', () => {
          if (this.outputField) {
            const isPassword = this.outputField.type === 'password';
            this.outputField.type = isPassword ? 'text' : 'password';
            const icon = this.toggleOutputVisibilityBtn.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = isPassword ? 'visibility_off' : 'visibility';
          }
        });
      }

      // "Why this password?" Collapsible
      if (this.whyToggleBtn) {
        this.whyToggleBtn.addEventListener('click', () => {
          const isHidden = this.whyContent.classList.contains('hidden');
          if (isHidden) {
            this.whyContent.classList.remove('hidden');
            if (this.whyIcon) this.whyIcon.style.transform = 'rotate(180deg)';
          } else {
            this.whyContent.classList.add('hidden');
            if (this.whyIcon) this.whyIcon.style.transform = 'rotate(0deg)';
          }
        });
      }

      // Tab 2 Events
      if (this.analyzeInputField) {
        this.analyzeInputField.addEventListener('input', () => this.renderAnalysisTab());
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

    switchTab(tab) {
      this.activeTab = tab;
      if (tab === 'create') {
        this.tabBtnCreate.className = 'flex-1 py-sm px-md text-sm font-headline-sm font-semibold rounded border border-primary bg-primary/20 text-primary transition-all flex items-center justify-center gap-xs uppercase tracking-wider';
        this.tabBtnAnalyze.className = 'flex-1 py-sm px-md text-sm font-headline-sm font-semibold rounded border border-border/50 bg-surface-container-lowest text-text-secondary hover:text-on-surface hover:border-outline transition-all flex items-center justify-center gap-xs uppercase tracking-wider';
        
        this.tabPanelCreate.classList.remove('hidden');
        this.tabPanelAnalyze.classList.add('hidden');
        this.render();
      } else {
        this.tabBtnAnalyze.className = 'flex-1 py-sm px-md text-sm font-headline-sm font-semibold rounded border border-primary bg-primary/20 text-primary transition-all flex items-center justify-center gap-xs uppercase tracking-wider';
        this.tabBtnCreate.className = 'flex-1 py-sm px-md text-sm font-headline-sm font-semibold rounded border border-border/50 bg-surface-container-lowest text-text-secondary hover:text-on-surface hover:border-outline transition-all flex items-center justify-center gap-xs uppercase tracking-wider';
        
        this.tabPanelAnalyze.classList.remove('hidden');
        this.tabPanelCreate.classList.add('hidden');
        this.renderAnalysisTab();
      }
    }

    selectMethod(method) {
      this.generator.config.method = method;

      this.methodCards.forEach(card => {
        const cardMethod = card.getAttribute('data-method-card');
        if (cardMethod === method) {
          card.classList.remove('border-border/50', 'bg-surface-container-lowest');
          card.classList.add('border-primary', 'bg-primary/10', 'shadow-[0_0_15px_rgba(255,213,151,0.15)]');
        } else {
          card.classList.remove('border-primary', 'bg-primary/10', 'shadow-[0_0_15px_rgba(255,213,151,0.15)]');
          card.classList.add('border-border/50', 'bg-surface-container-lowest');
        }
      });

      // Show/hide specific inputs
      document.querySelectorAll('[data-input-panel]').forEach(panel => panel.classList.add('hidden'));

      const activePanel = document.querySelector(`[data-input-panel="${method}"]`);
      if (activePanel) {
        activePanel.classList.remove('hidden');
      }

      this.render();
    }

    setupConversationalPrompts() {
      this.currentPrompts = exports.Questions.getRandomPrompts(4);
      if (!this.promptQuestionsList) return;

      this.promptQuestionsList.innerHTML = '';
      
      this.currentPrompts.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'p-sm bg-surface-container-lowest/80 border border-border/60 rounded flex flex-col gap-xs';
        itemEl.innerHTML = `
          <div class="flex items-center gap-xs text-xs text-primary font-code uppercase">
            <span class="material-symbols-outlined text-[16px]">${item.icon}</span>
            <span>PROMPT ${index + 1}: ${item.category}</span>
          </div>
          <p class="text-xs text-text-secondary">${item.question}</p>
          <input type="text" data-prompt-id="${item.id}" placeholder="${item.placeholder}" class="w-full bg-bg-main border border-border/80 rounded px-sm py-xs text-xs font-code text-text-primary focus:border-primary focus:outline-none transition-all" />
        `;

        const inputEl = itemEl.querySelector('input');
        inputEl.addEventListener('input', (e) => {
          const val = e.target.value;
          if (val && !exports.Questions.isSafeAnswer(val)) {
            this.showToast('Please do not enter sensitive PINs, passwords, or card numbers.', 'warning');
          }
          this.generator.config.memoryAnswers[item.id] = val;
          this.render();
        });

        this.promptQuestionsList.appendChild(itemEl);
      });
    }

    syncConfigToDOM() {
      if (this.lengthSlider) this.lengthSlider.value = this.generator.config.length;
      if (this.lengthVal) this.lengthVal.textContent = this.generator.config.length;
      if (this.chkUppercase) this.chkUppercase.checked = this.generator.config.uppercase;
      if (this.chkLowercase) this.chkLowercase.checked = this.generator.config.lowercase;
      if (this.chkNumbers) this.chkNumbers.checked = this.generator.config.numbers;
      if (this.chkSymbols) this.chkSymbols.checked = this.generator.config.symbols;
      if (this.chkAmbiguous) this.chkAmbiguous.checked = this.generator.config.excludeAmbiguous;
    }

    render() {
      if (this.activeTab !== 'create') return;

      const { password, explanations } = this.generator.generate();
      
      if (this.outputField) {
        this.outputField.value = password;
      }

      // Add to session history
      if (password && !this.sessionHistory.includes(password)) {
        this.sessionHistory.unshift(password);
        if (this.sessionHistory.length > 5) this.sessionHistory.pop();
        this.renderHistory();
      }

      // Evaluate Metrics
      const EntropyEngine = exports.Entropy;
      const strength = EntropyEngine.evaluateStrength(password);
      const memorabilityScore = EntropyEngine.calculateMemorabilityScore(password, this.generator.config.method);
      const crackTime = EntropyEngine.calculateCrackTime(password);
      const dist = EntropyEngine.getCharacterDistribution(password);

      // Render Strength Meter
      if (this.strengthLabel) {
        this.strengthLabel.textContent = strength.level;
        this.strengthLabel.className = `font-code text-xs tracking-wider uppercase ${strength.color} font-bold`;
      }

      if (this.strengthBars) {
        this.strengthBars.forEach((bar, index) => {
          bar.className = 'pw-strength-bar flex-1 h-2 rounded-xs transition-all duration-200 bg-surface-container-highest';
          if (index < strength.scoreStep) {
            bar.classList.add(strength.barColor);
            if (strength.scoreStep === 4) {
              bar.classList.add('shadow-[0_0_8px_rgba(255,213,151,0.6)]');
            }
          }
        });
      }

      // Render Memorability Meter
      if (this.memorabilityLabel) {
        let memText = 'HIGH RECALL';
        let memColor = 'text-success';
        if (memorabilityScore < 40) {
          memText = 'LOW RECALL (RANDOM)';
          memColor = 'text-warning';
        } else if (memorabilityScore >= 75) {
          memText = 'EXCELLENT RECALL';
          memColor = 'text-primary font-bold';
        }
        this.memorabilityLabel.textContent = `${memorabilityScore}% (${memText})`;
        this.memorabilityLabel.className = `font-code text-xs tracking-wider uppercase ${memColor}`;
      }

      if (this.memorabilityBar) {
        this.memorabilityBar.style.width = `${memorabilityScore}%`;
        if (memorabilityScore >= 75) {
          this.memorabilityBar.className = 'h-full bg-primary rounded-xs transition-all duration-300 shadow-[0_0_8px_rgba(255,213,151,0.6)]';
        } else if (memorabilityScore >= 45) {
          this.memorabilityBar.className = 'h-full bg-success rounded-xs transition-all duration-300';
        } else {
          this.memorabilityBar.className = 'h-full bg-warning rounded-xs transition-all duration-300';
        }
      }

      // Metrics display
      if (this.entropyBits) this.entropyBits.textContent = `${strength.entropy} bits`;
      if (this.crackTimeText) this.crackTimeText.textContent = crackTime.text;

      // Character distribution pills
      if (this.charDistributionPills) {
        this.charDistributionPills.innerHTML = `
          <span class="bg-surface px-xs py-[2px] rounded border border-border/50 text-[10px] font-code text-text-secondary">Upper: ${dist.uppercase}</span>
          <span class="bg-surface px-xs py-[2px] rounded border border-border/50 text-[10px] font-code text-text-secondary">Lower: ${dist.lowercase}</span>
          <span class="bg-surface px-xs py-[2px] rounded border border-border/50 text-[10px] font-code text-text-secondary">Num: ${dist.numbers}</span>
          <span class="bg-surface px-xs py-[2px] rounded border border-border/50 text-[10px] font-code text-text-secondary">Sym: ${dist.symbols}</span>
        `;
      }

      // Render "Why this password?" list
      if (this.whyList) {
        this.whyList.innerHTML = '';
        explanations.forEach(exp => {
          const li = document.createElement('li');
          li.className = 'flex items-start gap-xs text-xs text-text-secondary font-code';
          li.innerHTML = `<span class="material-symbols-outlined text-success text-[16px] shrink-0">check_circle</span> <span>${exp}</span>`;
          this.whyList.appendChild(li);
        });
      }
    }

    renderHistory() {
      if (!this.historyList) return;
      this.historyList.innerHTML = '';

      if (this.sessionHistory.length === 0) {
        this.historyList.innerHTML = `<p class="text-xs text-text-muted italic">No passwords generated in this session yet.</p>`;
        return;
      }

      this.sessionHistory.forEach((pw, idx) => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-xs bg-bg-main border border-border/40 rounded text-xs font-code';
        item.innerHTML = `
          <span class="truncate max-w-[280px] text-text-secondary">${pw}</span>
          <button class="text-primary hover:text-on-primary transition-colors text-[11px] font-bold uppercase" title="Copy">
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

      const analysis = exports.Analysis.analyzePassword(pw);

      if (analysis.isEmpty) {
        if (this.analyzeStrengthLabel) this.analyzeStrengthLabel.textContent = 'ENTER PASSWORD';
        if (this.analyzeEntropyBits) this.analyzeEntropyBits.textContent = '0 bits';
        if (this.analyzeCrackTime) this.analyzeCrackTime.textContent = 'N/A';
        if (this.analyzeLengthRating) this.analyzeLengthRating.textContent = 'N/A';
        if (this.analyzeWeaknessesList) this.analyzeWeaknessesList.innerHTML = '<li class="text-xs text-text-muted">Type or paste a password above to inspect vulnerabilities.</li>';
        if (this.analyzeSuggestionsList) this.analyzeSuggestionsList.innerHTML = '';
        if (this.analyzePatternsContainer) this.analyzePatternsContainer.innerHTML = '';
        if (this.analyzeRecBox) this.analyzeRecBox.classList.add('hidden');
        return;
      }

      // Meters
      if (this.analyzeStrengthLabel) {
        this.analyzeStrengthLabel.textContent = analysis.strength.level;
        this.analyzeStrengthLabel.className = `font-code text-xs tracking-wider uppercase ${analysis.strength.color} font-bold`;
      }

      if (this.analyzeStrengthBars) {
        this.analyzeStrengthBars.forEach((bar, index) => {
          bar.className = 'pw-analyze-strength-bar flex-1 h-2 rounded-xs transition-all duration-200 bg-surface-container-highest';
          if (index < analysis.strength.scoreStep) {
            bar.classList.add(analysis.strength.barColor);
          }
        });
      }

      if (this.analyzeMemorabilityLabel) {
        this.analyzeMemorabilityLabel.textContent = `${analysis.memorabilityScore}%`;
      }
      if (this.analyzeMemorabilityBar) {
        this.analyzeMemorabilityBar.style.width = `${analysis.memorabilityScore}%`;
      }

      // Metrics
      if (this.analyzeEntropyBits) this.analyzeEntropyBits.textContent = `${analysis.entropy} bits`;
      if (this.analyzeCrackTime) this.analyzeCrackTime.textContent = analysis.crackTime.text;
      if (this.analyzeLengthRating) this.analyzeLengthRating.textContent = analysis.lengthRating;

      // Character distribution
      if (this.analyzeDistPills) {
        const d = analysis.distribution;
        this.analyzeDistPills.innerHTML = `
          <span class="bg-surface px-xs py-[2px] rounded border border-border/50 text-[10px] font-code text-text-secondary">Upper: ${d.uppercase}</span>
          <span class="bg-surface px-xs py-[2px] rounded border border-border/50 text-[10px] font-code text-text-secondary">Lower: ${d.lowercase}</span>
          <span class="bg-surface px-xs py-[2px] rounded border border-border/50 text-[10px] font-code text-text-secondary">Num: ${d.numbers}</span>
          <span class="bg-surface px-xs py-[2px] rounded border border-border/50 text-[10px] font-code text-text-secondary">Sym: ${d.symbols}</span>
        `;
      }

      // Weaknesses
      if (this.analyzeWeaknessesList) {
        this.analyzeWeaknessesList.innerHTML = '';
        if (analysis.weaknesses.length === 0) {
          this.analyzeWeaknessesList.innerHTML = '<li class="text-xs text-success flex items-center gap-xs"><span class="material-symbols-outlined text-[16px]">verified</span> No critical structural weaknesses detected!</li>';
        } else {
          analysis.weaknesses.forEach(w => {
            const li = document.createElement('li');
            li.className = 'text-xs text-danger flex items-start gap-xs';
            li.innerHTML = `<span class="material-symbols-outlined text-[16px] shrink-0">warning</span> <span>${w}</span>`;
            this.analyzeWeaknessesList.appendChild(li);
          });
        }
      }

      // Suggestions
      if (this.analyzeSuggestionsList) {
        this.analyzeSuggestionsList.innerHTML = '';
        analysis.suggestions.forEach(s => {
          const li = document.createElement('li');
          li.className = 'text-xs text-text-secondary flex items-start gap-xs font-code';
          li.innerHTML = `<span class="material-symbols-outlined text-primary text-[16px] shrink-0">lightbulb</span> <span>${s}</span>`;
          this.analyzeSuggestionsList.appendChild(li);
        });
      }

      // Patterns
      if (this.analyzePatternsContainer) {
        this.analyzePatternsContainer.innerHTML = '';
        const allPatterns = [...analysis.patterns, ...analysis.dictionaryWords, ...analysis.repeatedChars];
        if (allPatterns.length > 0) {
          allPatterns.forEach(p => {
            const span = document.createElement('span');
            span.className = 'bg-danger/10 text-danger border border-danger/30 text-[10px] font-code px-xs py-[2px] rounded';
            span.textContent = `Pattern: "${p}"`;
            this.analyzePatternsContainer.appendChild(span);
          });
        }
      }

      // Recommended improved password
      if (analysis.recommendedPassword && analysis.strength.scoreStep < 3) {
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
      
      let borderColor = 'border-primary/50';
      let textColor = 'text-primary';
      let icon = 'info';

      if (type === 'success') {
        borderColor = 'border-success/50';
        textColor = 'text-success';
        icon = 'check_circle';
      } else if (type === 'warning') {
        borderColor = 'border-warning/50';
        textColor = 'text-warning';
        icon = 'warning';
      }

      toast.className = `armor-plate bg-surface/95 border ${borderColor} px-md py-sm rounded shadow-lg flex items-center gap-sm text-xs font-code ${textColor} transition-all duration-300 transform translate-y-2 opacity-0 z-50`;
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
      container.className = 'fixed bottom-lg right-lg z-50 flex flex-col gap-sm pointer-events-none';
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
  }
});
