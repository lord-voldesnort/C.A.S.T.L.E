/**
 * Castle Cybersecurity Toolbox - Password Generator Component
 * Production-ready cryptographically secure password generator module
 */

class PasswordGenerator {
  constructor() {
    // Character pools
    this.charSets = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      ambiguous: 'l1IO0o|`\'"~'
    };

    // Default configuration
    this.config = {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeAmbiguous: false
    };

    this.initDOMReferences();
    this.bindEvents();
    this.generate();
  }

  initDOMReferences() {
    this.passwordOutput = document.getElementById('pg-output');
    this.lengthSlider = document.getElementById('pg-length-slider');
    this.lengthVal = document.getElementById('pg-length-val');
    this.uppercaseToggle = document.getElementById('pg-opt-uppercase');
    this.lowercaseToggle = document.getElementById('pg-opt-lowercase');
    this.numbersToggle = document.getElementById('pg-opt-numbers');
    this.symbolsToggle = document.getElementById('pg-opt-symbols');
    this.ambiguousToggle = document.getElementById('pg-opt-ambiguous');
    this.copyBtn = document.getElementById('pg-copy-btn');
    this.generateBtn = document.getElementById('pg-generate-btn');
    this.refreshBtn = document.getElementById('pg-refresh-btn');
    
    // Strength & Entropy elements
    this.strengthText = document.getElementById('pg-strength-text');
    this.strengthBars = document.querySelectorAll('.pg-strength-bar');
    this.entropyBits = document.getElementById('pg-entropy-bits');
    this.crackTime = document.getElementById('pg-crack-time');
    this.poolSize = document.getElementById('pg-pool-size');
  }

  bindEvents() {
    if (!this.lengthSlider) return;

    // Slider input event
    this.lengthSlider.addEventListener('input', (e) => {
      this.config.length = parseInt(e.target.value, 10);
      if (this.lengthVal) this.lengthVal.textContent = this.config.length;
      this.generate();
    });

    // Checkbox toggles
    const toggles = [
      { element: this.uppercaseToggle, key: 'uppercase' },
      { element: this.lowercaseToggle, key: 'lowercase' },
      { element: this.numbersToggle, key: 'numbers' },
      { element: this.symbolsToggle, key: 'symbols' },
      { element: this.ambiguousToggle, key: 'excludeAmbiguous' }
    ];

    toggles.forEach(({ element, key }) => {
      if (element) {
        element.addEventListener('change', (e) => {
          this.config[key] = e.target.checked;

          // Prevent disabling all character sets
          if (!this.config.uppercase && !this.config.lowercase && !this.config.numbers && !this.config.symbols) {
            e.target.checked = true;
            this.config[key] = true;
            this.showToast('At least one character set must be selected', 'warning');
            return;
          }

          this.generate();
        });
      }
    });

    // Buttons
    if (this.generateBtn) {
      this.generateBtn.addEventListener('click', () => this.generate());
    }
    if (this.refreshBtn) {
      this.refreshBtn.addEventListener('click', () => {
        this.rotateRefreshIcon();
        this.generate();
      });
    }
    if (this.copyBtn) {
      this.copyBtn.addEventListener('click', () => this.copyToClipboard());
    }
  }

  rotateRefreshIcon() {
    if (this.refreshBtn) {
      const icon = this.refreshBtn.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.classList.add('animate-spin');
        setTimeout(() => icon.classList.remove('animate-spin'), 400);
      }
    }
  }

  getPool() {
    let pool = '';
    if (this.config.uppercase) pool += this.charSets.uppercase;
    if (this.config.lowercase) pool += this.charSets.lowercase;
    if (this.config.numbers) pool += this.charSets.numbers;
    if (this.config.symbols) pool += this.charSets.symbols;

    if (this.config.excludeAmbiguous) {
      const ambiguousRegex = new RegExp(`[${this.escapeRegExp(this.charSets.ambiguous)}]`, 'g');
      pool = pool.replace(ambiguousRegex, '');
    }

    return pool;
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Cryptographically secure random integer generation
   */
  getRandomInt(max) {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    return randomBuffer[0] % max;
  }

  generate() {
    const pool = this.getPool();
    if (!pool || pool.length === 0) return;

    let password = '';
    const poolLength = pool.length;

    // Ensure at least one character from each enabled set is included (guaranteed coverage)
    const requiredChars = [];
    if (this.config.uppercase) requiredChars.push(this.getRandomChar(this.filterSet(this.charSets.uppercase)));
    if (this.config.lowercase) requiredChars.push(this.getRandomChar(this.filterSet(this.charSets.lowercase)));
    if (this.config.numbers) requiredChars.push(this.getRandomChar(this.filterSet(this.charSets.numbers)));
    if (this.config.symbols) requiredChars.push(this.getRandomChar(this.filterSet(this.charSets.symbols)));

    // Fill the remaining length with random pool characters
    const remainingLength = Math.max(0, this.config.length - requiredChars.length);
    const randomChars = [];
    for (let i = 0; i < remainingLength; i++) {
      randomChars.push(pool[this.getRandomInt(poolLength)]);
    }

    // Combine and shuffle using Fisher-Yates with crypto random
    const combined = [...requiredChars, ...randomChars];
    for (let i = combined.length - 1; i > 0; i--) {
      const j = this.getRandomInt(i + 1);
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    password = combined.slice(0, this.config.length).join('');

    if (this.passwordOutput) {
      this.passwordOutput.value = password;
    }

    this.evaluateMetrics(password, poolLength);
  }

  filterSet(set) {
    if (!this.config.excludeAmbiguous) return set;
    const ambiguousRegex = new RegExp(`[${this.escapeRegExp(this.charSets.ambiguous)}]`, 'g');
    const filtered = set.replace(ambiguousRegex, '');
    return filtered.length > 0 ? filtered : set;
  }

  getRandomChar(set) {
    return set[this.getRandomInt(set.length)];
  }

  /**
   * Entropy and Strength calculation
   * Entropy E = Length * log2(PoolSize)
   */
  evaluateMetrics(password, poolSize) {
    const length = password.length;
    const entropy = Math.round(length * Math.log2(poolSize));

    // Update entropy and pool size displays
    if (this.entropyBits) this.entropyBits.textContent = `${entropy} bits`;
    if (this.poolSize) this.poolSize.textContent = `${poolSize} chars`;

    // Estimate Crack Time (Assuming 10 billion / 10^10 guesses/sec offline attack)
    const guessesPerSec = 1e10;
    const totalCombinations = Math.pow(poolSize, length);
    const avgCrackSeconds = totalCombinations / (2 * guessesPerSec);
    const formattedCrackTime = this.formatDuration(avgCrackSeconds);

    if (this.crackTime) this.crackTime.textContent = formattedCrackTime;

    // Determine Strength Level
    // < 35 bits: Weak (Red)
    // 35 - 59 bits: Fair (Yellow)
    // 60 - 89 bits: Strong (Green)
    // 90+ bits: Fortress / Ultra (Primary Gold Glow)
    let score = 1;
    let label = 'WEAK';
    let colorClass = 'text-danger';

    if (entropy >= 90) {
      score = 4;
      label = 'FORTRESS (INVULNERABLE)';
      colorClass = 'text-primary font-bold';
    } else if (entropy >= 60) {
      score = 3;
      label = 'STRONG';
      colorClass = 'text-success';
    } else if (entropy >= 35) {
      score = 2;
      label = 'FAIR';
      colorClass = 'text-warning';
    } else {
      score = 1;
      label = 'WEAK';
      colorClass = 'text-danger';
    }

    if (this.strengthText) {
      this.strengthText.textContent = label;
      this.strengthText.className = `font-code text-xs tracking-wider uppercase ${colorClass}`;
    }

    // Update visual meter bars
    if (this.strengthBars && this.strengthBars.length > 0) {
      this.strengthBars.forEach((bar, index) => {
        bar.className = 'pg-strength-bar flex-1 h-2 rounded-xs transition-colors duration-200 bg-surface-container-highest';
        if (index < score) {
          if (score === 1) bar.classList.add('bg-danger');
          else if (score === 2) bar.classList.add('bg-warning');
          else if (score === 3) bar.classList.add('bg-success');
          else if (score === 4) bar.classList.add('bg-primary', 'shadow-[0_0_8px_rgba(255,176,0,0.6)]');
        }
      });
    }
  }

  formatDuration(seconds) {
    if (!isFinite(seconds) || seconds > 3.154e16) return 'Trillions of years';
    if (seconds < 1) return 'Instantaneous';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    
    const years = Math.round(seconds / 31536000);
    if (years < 1000) return `${years.toLocaleString()} years`;
    if (years < 1e6) return `${(years / 1000).toFixed(1)}k years`;
    if (years < 1e9) return `${(years / 1e6).toFixed(1)}M years`;
    return `${(years / 1e9).toFixed(1)}B years`;
  }

  async copyToClipboard() {
    if (!this.passwordOutput || !this.passwordOutput.value) return;

    try {
      await navigator.clipboard.writeText(this.passwordOutput.value);
      this.showToast('Password copied to clipboard!', 'success');
      
      if (this.copyBtn) {
        const origText = this.copyBtn.innerHTML;
        this.copyBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">check</span> COPIED!`;
        this.copyBtn.classList.add('bg-success', 'text-black', 'border-success');
        setTimeout(() => {
          this.copyBtn.innerHTML = origText;
          this.copyBtn.classList.remove('bg-success', 'text-black', 'border-success');
        }, 1800);
      }
    } catch (err) {
      // Fallback for clipboard write failure
      this.passwordOutput.select();
      document.execCommand('copy');
      this.showToast('Password copied to clipboard!', 'success');
    }
  }

  showToast(message, type = 'info') {
    const toastContainer = document.getElementById('castle-toast-container') || this.createToastContainer();
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

    toast.className = `armor-plate bg-surface/95 border ${borderColor} px-md py-sm rounded shadow-lg flex items-center gap-sm text-sm font-code ${textColor} transition-all duration-300 transform translate-y-2 opacity-0`;
    toast.innerHTML = `<span class="material-symbols-outlined text-[18px]">${icon}</span> <span>${message}</span>`;

    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    // Remove after 3s
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

// Global initialization helper
window.initPasswordGenerator = function() {
  if (!window.castlePasswordGen) {
    window.castlePasswordGen = new PasswordGenerator();
  } else {
    window.castlePasswordGen.generate();
  }
};
