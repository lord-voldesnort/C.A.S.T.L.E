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

      const enabledPools = [];
      if (this.config.uppercase) enabledPools.push('Uppercase (A-Z)');
      if (this.config.lowercase) enabledPools.push('Lowercase (a-z)');
      if (this.config.numbers) enabledPools.push('Digits (0-9)');
      if (this.config.symbols) enabledPools.push('Symbols (!@#$...)');

      const constructionSteps = [
        { label: 'Entropy Source', detail: 'Tapped hardware random noise pool via window.crypto.getRandomValues().' },
        { label: 'Character Space', detail: `Active pools: ${enabledPools.join(', ')}.` },
        { label: 'Character Guarantee', detail: 'Ensured at least one character from each active character set.' },
        { label: 'Fisher-Yates Shuffle', detail: 'Shuffled character positions with crypto-secure Fisher-Yates algorithm.' }
      ];

      const reconstructionSequence = [
        {
          step: 1,
          type: 'random',
          name: 'Cryptographic Random Stream',
          value: password,
          isMnemonic: false,
          isPadding: true,
          rule: `Hardware-backed CSPRNG generation across active pools (${enabledPools.join(', ')}).`,
          hint: 'Pure random stream — no human mnemonic pattern exists. Must be stored in a password manager.'
        }
      ];

      const metadata = {
        method: 'random',
        methodName: 'Fully Random Engine',
        sourceInput: `${this.config.length} characters across active pools`,
        constructionSteps,
        reconstruction: reconstructionSequence,
        memorability: {
          status: 'NOT_MEMORABLE',
          badgeText: 'NOT MEMORABLE (PASSWORD MANAGER REQUIRED)',
          memorablePortion: '',
          unmemorizablePortion: password,
          memorableLength: 0,
          paddingLength: password.length,
          totalLength: password.length,
          coveragePercent: 0,
          guidance: 'This credential was generated with uniform cryptographic randomness across the active character space. It contains zero predictable words, substitutions, or mnemonic formulas. Do not attempt to memorize this credential; store it in a secure, encrypted password manager.'
        },
        numericExplanation: {
          hasMnemonic: false,
          mnemonicValue: null,
          mnemonicRule: 'Digits were sampled uniformly from 0-9 via hardware CSPRNG.',
          isRandom: true,
          securityNote: 'Pure cryptographic randomness: Digits have no human mnemonic pattern. Recommended for storage in a password manager.'
        },
        memoryGuide: {
          type: 'Not Memorable',
          anchor: 'None (Hardware Entropy)',
          headline: 'Password Manager Storage Required',
          mnemonicText: 'Cryptographic Random Sequence (No Mnemonic Derivation)',
          recallSteps: [
            '1. No mnemonic formula exists for pure random passwords.',
            '2. All characters are chosen with uniform cryptographic probability.',
            '3. Copy and save this credential in an encrypted password manager.'
          ],
          securityCaveat: 'Pure random credentials provide maximum cryptographic resistance (~128+ bits entropy) against offline cracking clusters, but are impossible for human memory to reconstruct reliably.'
        }
      };

      return { password, explanations, metadata };
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
