/**
 * Castle Cybersecurity Toolbox - Password Entropy & Metrics Calculation Engine
 * Purely local calculations for password strength, entropy, crack time, 
 * character distribution, dictionary detection, keyboard patterns, and memorability scoring.
 */

window.CastlePassword = window.CastlePassword || {};

(function(exports) {
  'use strict';

  // Common keyboard layout rows for spatial pattern detection (QWERTY layout)
  const KEYBOARD_ROWS = [
    '`1234567890-=',
    'qwertyuiop[]\\',
    "asdfghjkl;'",
    'zxcvbnm,./'
  ];

  // Common dictionary words and popular weak passwords
  const COMMON_DICTIONARY = new Set([
    'password', 'admin', 'welcome', 'castle', 'login', 'dragon', 'football',
    'monkey', 'letmein', 'access', 'master', 'shadow', 'superman', 'trustno1',
    'iloveyou', 'sunshine', 'princess', 'charlie', 'robert', 'thomas', 'hockey',
    'ranger', 'summer', 'winter', 'autumn', 'spring', 'coffee', 'baseball',
    'computer', 'security', 'system', 'matrix', 'phoenix', 'hacker', 'knight',
    'warrior', 'guardian', 'fortress', 'shield', 'banner', 'secret', 'hunter'
  ]);

  /**
   * Calculates cryptographic entropy in bits: E = L * log2(PoolSize)
   */
  function calculateEntropy(password) {
    if (!password) return 0;

    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

    if (poolSize === 0) return 0;
    return Math.round(password.length * Math.log2(poolSize));
  }

  /**
   * Estimates offline crack time assuming 10 billion guesses/sec ($10^{10}$)
   */
  function calculateCrackTime(password) {
    if (!password) return { seconds: 0, text: 'Instantaneous' };

    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

    const combinations = Math.pow(poolSize, password.length);
    const guessesPerSec = 1e10; // 10 Billion guesses per second (Offline GPU array)
    const seconds = combinations / (2 * guessesPerSec);

    return {
      seconds: seconds,
      text: formatDuration(seconds)
    };
  }

  /**
   * Formats duration in human readable time
   */
  function formatDuration(seconds) {
    if (!isFinite(seconds) || seconds > 3.154e16) return 'Trillions of years';
    if (seconds < 0.1) return 'Instantaneous';
    if (seconds < 1) return '< 1 second';
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

  /**
   * Gets character distribution counts and percentages
   */
  function getCharacterDistribution(password) {
    if (!password) return { uppercase: 0, lowercase: 0, numbers: 0, symbols: 0, total: 0 };

    const uppercase = (password.match(/[A-Z]/g) || []).length;
    const lowercase = (password.match(/[a-z]/g) || []).length;
    const numbers = (password.match(/[0-9]/g) || []).length;
    const symbols = (password.match(/[^a-zA-Z0-9]/g) || []).length;
    const total = password.length;

    return {
      uppercase,
      lowercase,
      numbers,
      symbols,
      total
    };
  }

  /**
   * Detects dictionary words embedded within the password
   */
  function detectDictionaryWords(password) {
    if (!password) return [];
    const cleanStr = password.toLowerCase().replace(/[^a-z]/g, '');
    const found = [];

    COMMON_DICTIONARY.forEach(word => {
      if (cleanStr.includes(word) && word.length >= 4) {
        found.push(word);
      }
    });

    return found;
  }

  /**
   * Detects keyboard spatial patterns (e.g. qwerty, 12345, asdf, diagonal sequences)
   */
  function detectKeyboardPatterns(password) {
    if (!password || password.length < 3) return [];
    const lower = password.toLowerCase();
    const patterns = [];

    // Horizontal row sequences
    KEYBOARD_ROWS.forEach(row => {
      for (let i = 0; i <= row.length - 3; i++) {
        const seq = row.substring(i, i + 3);
        const revSeq = seq.split('').reverse().join('');
        if (lower.includes(seq) || lower.includes(revSeq)) {
          patterns.push(seq);
        }
      }
    });

    // Sequential numbers or letters (e.g. 1234, abcd)
    for (let i = 0; i < lower.length - 2; i++) {
      const code1 = lower.charCodeAt(i);
      const code2 = lower.charCodeAt(i + 1);
      const code3 = lower.charCodeAt(i + 2);
      if (code2 === code1 + 1 && code3 === code2 + 1) {
        const seq = lower.substring(i, i + 3);
        if (!patterns.includes(seq)) patterns.push(seq);
      }
    }

    return [...new Set(patterns)];
  }

  /**
   * Detects repeated adjacent characters (e.g., "aaa", "111")
   */
  function detectRepeatedCharacters(password) {
    if (!password) return [];
    const matches = password.match(/(.)\1{2,}/g) || [];
    return [...new Set(matches)];
  }

  /**
   * Calculates human memorability score (0 - 100%)
   * Higher score means easier to remember while retaining security structure
   */
  function calculateMemorabilityScore(password, generationMethod = 'custom') {
    if (!password) return 0;
    let score = 50; // baseline

    const length = password.length;

    // Method bonus
    if (generationMethod === 'memory_assisted' || generationMethod === 'phrase' || generationMethod === 'initialism') {
      score += 25;
    } else if (generationMethod === 'word' || generationMethod === 'theme') {
      score += 20;
    } else if (generationMethod === 'random') {
      score -= 15;
    }

    // Pronounceability / word chunking heuristics
    const vowels = (password.match(/[aeiouAEIOU]/g) || []).length;
    const consonants = (password.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g) || []).length;
    
    if (vowels > 0 && consonants > 0) {
      const ratio = vowels / (vowels + consonants);
      if (ratio >= 0.25 && ratio <= 0.55) {
        score += 15; // Natural syllable flow
      }
    }

    // Delimiters / camel-casing / clear chunking
    if (/[-_ .!]/.test(password) || /[a-z][A-Z]/.test(password)) {
      score += 10;
    }

    // Penalty for excessive chaotic non-alphanumeric noise
    const symbols = (password.match(/[^a-zA-Z0-9]/g) || []).length;
    if (symbols > length * 0.4) {
      score -= 15;
    }

    // Penalty for extreme length without structure
    if (length > 30 && generationMethod === 'random') {
      score -= 10;
    }

    return Math.max(10, Math.min(99, Math.round(score)));
  }

  /**
   * Calculates overall Strength Level & Score
   */
  function evaluateStrength(password) {
    const entropy = calculateEntropy(password);
    const length = password.length;
    const patterns = detectKeyboardPatterns(password);
    const dictionary = detectDictionaryWords(password);
    const repeated = detectRepeatedCharacters(password);

    let adjustedEntropy = entropy;

    // Deduct for pattern flaws
    if (patterns.length > 0) adjustedEntropy -= patterns.length * 8;
    if (dictionary.length > 0) adjustedEntropy -= dictionary.length * 12;
    if (repeated.length > 0) adjustedEntropy -= repeated.length * 10;
    if (length < 8) adjustedEntropy = Math.min(adjustedEntropy, 25);

    let level = 'WEAK';
    let color = 'text-danger';
    let barColor = 'bg-danger';
    let scorePercent = Math.min(100, Math.max(10, Math.round((adjustedEntropy / 90) * 100)));
    let scoreStep = 1;

    if (adjustedEntropy >= 90) {
      level = 'FORTRESS (UNBREAKABLE)';
      color = 'text-primary';
      barColor = 'bg-primary';
      scoreStep = 4;
    } else if (adjustedEntropy >= 60) {
      level = 'STRONG';
      color = 'text-success';
      barColor = 'bg-success';
      scoreStep = 3;
    } else if (adjustedEntropy >= 35) {
      level = 'FAIR';
      color = 'text-warning';
      barColor = 'bg-warning';
      scoreStep = 2;
    } else {
      level = 'WEAK';
      color = 'text-danger';
      barColor = 'bg-danger';
      scoreStep = 1;
    }

    return {
      entropy: Math.max(0, entropy),
      adjustedEntropy: Math.max(0, Math.round(adjustedEntropy)),
      level,
      color,
      barColor,
      scorePercent,
      scoreStep
    };
  }

  // Export functions to global CastlePassword namespace
  exports.Entropy = {
    calculateEntropy,
    calculateCrackTime,
    formatDuration,
    getCharacterDistribution,
    detectDictionaryWords,
    detectKeyboardPatterns,
    detectRepeatedCharacters,
    calculateMemorabilityScore,
    evaluateStrength
  };

})(window.CastlePassword);
