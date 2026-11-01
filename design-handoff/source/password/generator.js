/**
 * Castle Cybersecurity Toolbox - Core Password Generator Module
 * Manages crypto-random generation, presets, character pool filters,
 * and method routing.
 */

window.CastlePassword = window.CastlePassword || {};

(function(exports) {
  'use strict';

  class Generator {
    constructor() {
      this.charSets = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        ambiguous: 'l1IO0o|`\'"~'
      };

      this.config = {
        method: 'random', // 'random' | 'word' | 'phrase' | 'initialism' | 'theme' | 'memory_assisted'
        length: 16,
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
    }

    /**
     * Cryptographically secure random integer in range [0, max)
     */
    getRandomInt(max) {
      if (max <= 0) return 0;
      const randomBuffer = new Uint32Array(1);
      window.crypto.getRandomValues(randomBuffer);
      return randomBuffer[0] % max;
    }

    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
     * Generates a fully random cryptographically secure password
     */
    generateRandom() {
      const pool = this.getPool();
      if (!pool || pool.length === 0) return { password: '', explanations: [] };

      const requiredChars = [];
      if (this.config.uppercase) requiredChars.push(this.getRandomChar(this.filterSet(this.charSets.uppercase)));
      if (this.config.lowercase) requiredChars.push(this.getRandomChar(this.filterSet(this.charSets.lowercase)));
      if (this.config.numbers) requiredChars.push(this.getRandomChar(this.filterSet(this.charSets.numbers)));
      if (this.config.symbols) requiredChars.push(this.getRandomChar(this.filterSet(this.charSets.symbols)));

      const poolLength = pool.length;
      const remainingLength = Math.max(0, this.config.length - requiredChars.length);
      const randomChars = [];

      for (let i = 0; i < remainingLength; i++) {
        randomChars.push(pool[this.getRandomInt(poolLength)]);
      }

      // Combine and Fisher-Yates shuffle using crypto random
      const combined = [...requiredChars, ...randomChars];
      for (let i = combined.length - 1; i > 0; i--) {
        const j = this.getRandomInt(i + 1);
        [combined[i], combined[j]] = [combined[j], combined[i]];
      }

      const password = combined.slice(0, this.config.length).join('');
      const explanations = [
        'Generated using Web Crypto API hardware-backed random number generator',
        'Guaranteed inclusion of enabled character sets (uppercase, lowercase, numbers, symbols)',
        'Shuffled using crypto-secure Fisher-Yates algorithm'
      ];

      return { password, explanations };
    }

    /**
     * Main generation dispatcher based on active method
     */
    generate() {
      const method = this.config.method;
      const targetLen = this.config.length;

      let result = { password: '', explanations: [] };

      switch (method) {
        case 'word':
          result = exports.Transformations.transformMemorableWord(this.config.wordInput, targetLen);
          break;
        case 'phrase':
          result = exports.Transformations.transformPhrase(this.config.phraseInput, targetLen);
          break;
        case 'initialism':
          result = exports.Transformations.transformInitialism(this.config.initialismInput, targetLen);
          break;
        case 'theme':
          result = exports.Transformations.transformTheme(this.config.themeInput, targetLen);
          break;
        case 'memory_assisted':
          result = exports.Transformations.transformMemoryAssisted(this.config.memoryAnswers, targetLen);
          break;
        case 'random':
        default:
          result = this.generateRandom();
          break;
      }

      return result;
    }

    /**
     * Preset: Maximum Security (24 chars, high entropy, full pool)
     */
    applyMaxSecurityPreset() {
      this.config.method = 'random';
      this.config.length = 24;
      this.config.uppercase = true;
      this.config.lowercase = true;
      this.config.numbers = true;
      this.config.symbols = true;
      this.config.excludeAmbiguous = false;
    }

    /**
     * Preset: Maximum Memorability (Memory-Assisted or Phrase mode, high memorability)
     */
    applyMaxMemorabilityPreset() {
      this.config.method = 'memory_assisted';
      this.config.length = 18;
      this.config.uppercase = true;
      this.config.lowercase = true;
      this.config.numbers = true;
      this.config.symbols = true;
      this.config.excludeAmbiguous = false;
    }
  }

  exports.Generator = Generator;

})(window.CastlePassword);
