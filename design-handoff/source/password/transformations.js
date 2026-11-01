/**
 * Castle Cybersecurity Toolbox - Password Transformation Engine
 * Applies intelligent transformations, l33t substitutions, phonetic blending, 
 * initialism extraction, and cryptographic entropy injection.
 */

window.CastlePassword = window.CastlePassword || {};

(function(exports) {
  'use strict';

  // L33t substitution map for intelligent character replacement
  const LEET_MAP = {
    'a': '@', 'A': '4',
    'e': '3', 'E': '3',
    'i': '!', 'I': '1',
    'o': '0', 'O': '0',
    's': '$', 'S': '5',
    't': '7', 'T': '7',
    'b': '8', 'B': '8'
  };

  const SYMBOLS_POOL = ['!', '@', '#', '$', '%', '^', '&', '*', '-', '_', '+', '='];

  const THEME_DICTIONARY = {
    space: ['Nebula', 'Pulsar', 'Quasar', 'Starlight', 'Eclipse', 'Supernova', 'Cosmic', 'Orbit'],
    ocean: ['Abyssal', 'Tsunami', 'Trident', 'Coral', 'Mariner', 'Current', 'Kraken', 'Neptune'],
    technology: ['Quantum', 'Kernel', 'Cipher', 'Vector', 'Matrix', 'Silicon', 'Binary', 'Synapse'],
    nature: ['Sequoia', 'Thunder', 'Glacier', 'Wildfire', 'Breeze', 'Volcano', 'Aurora', 'Timber'],
    mountains: ['Everest', 'Summit', 'Zenith', 'Cascade', 'Alpine', 'Granite', 'Ridge', 'Valleys'],
    fantasy: ['Dragon', 'Phoenix', 'Valiant', 'Griffin', 'Excalibur', 'Warlock', 'Shadow', 'Elven']
  };

  /**
   * Cryptographically secure random integer
   */
  function getRandomInt(max) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] % max;
  }

  function getRandomSymbol() {
    return SYMBOLS_POOL[getRandomInt(SYMBOLS_POOL.length)];
  }

  function getRandomNumberStr(len = 2) {
    let res = '';
    for (let i = 0; i < len; i++) {
      res += getRandomInt(10);
    }
    return res;
  }

  /**
   * Transforms a single Memorable Word intelligently
   */
  function transformMemorableWord(word, targetLength = 16) {
    const clean = (word || 'castle').trim().replace(/\s+/g, '');
    const explanations = [];

    explanations.push(`Original anchor: "${clean}"`);

    // Step 1: Capitalize strategically (Alternate casing)
    let cased = clean.split('').map((char, index) => {
      return (index === 0 || index % 2 === 0) ? char.toUpperCase() : char.toLowerCase();
    }).join('');
    explanations.push('Applied strategic alternating case formatting');

    // Step 2: Intelligent L33t substitution on 1 or 2 characters
    let substituted = '';
    let subCount = 0;
    for (let char of cased) {
      if (LEET_MAP[char] && subCount < 2 && Math.random() > 0.3) {
        substituted += LEET_MAP[char];
        subCount++;
      } else {
        substituted += char;
      }
    }
    if (subCount > 0) explanations.push('Replaced vowels/consonants with smart symbol substitutions');

    // Step 3: Insert random secure salt (symbols + numbers)
    const prefixSym = getRandomSymbol();
    const suffixSym = getRandomSymbol();
    const numSalt = getRandomNumberStr(3);

    let password = `${prefixSym}${substituted}${suffixSym}${numSalt}`;
    explanations.push('Interleaved crypto-random symbols and numeric salt');

    // Step 4: If still shorter than target length, pad with secure random noise
    if (password.length < targetLength) {
      const paddingPool = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
      const padLen = targetLength - password.length;
      let pad = '';
      for (let i = 0; i < padLen; i++) {
        pad += paddingPool[getRandomInt(paddingPool.length)];
      }
      password += pad;
      explanations.push('Padded with cryptographic random characters to maximize entropy');
    }

    return {
      password,
      explanations
    };
  }

  /**
   * Transforms a Phrase into a secure password
   */
  function transformPhrase(phrase, targetLength = 16) {
    const words = (phrase || 'My favourite mountain').trim().split(/\s+/);
    const explanations = [];

    explanations.push(`Phrase concept: "${words.join(' ')}"`);

    // Extract word roots & capitalize
    const parts = words.map((w, idx) => {
      const clean = w.replace(/[^a-zA-Z0-9]/g, '');
      if (clean.length === 0) return '';
      // Capitalize first letter, replace vowels occasionally
      const cap = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
      return cap;
    }).filter(Boolean);

    explanations.push('Extracted word roots and applied CamelCase structure');

    const sep = getRandomSymbol();
    let combined = parts.join(sep);
    explanations.push(`Joined phrase concepts with separator '${sep}'`);

    // Apply l33t to first part
    if (combined.length > 0) {
      combined = combined.replace(/a/g, '@').replace(/e/g, '3').replace(/i/g, '!');
      explanations.push('Applied subtle symbol substitutions');
    }

    const numSalt = getRandomNumberStr(2);
    let password = `${combined}${numSalt}${getRandomSymbol()}`;
    explanations.push('Appended numeric salt and final boundary symbol');

    if (password.length < targetLength) {
      const padPool = 'abcdefghjkmnpqrstuvwxyz23456789!@#$%';
      while (password.length < targetLength) {
        password += padPool[getRandomInt(padPool.length)];
      }
      explanations.push('Adjusted length to meet target security requirements');
    }

    return {
      password,
      explanations
    };
  }

  /**
   * Transforms a Sentence into an Initialism Password
   */
  function transformInitialism(sentence, targetLength = 16) {
    const words = (sentence || 'My Dog Bruno Loves Eating Chicken Every Sunday').trim().split(/\s+/);
    const explanations = [];

    explanations.push(`Sentence input: "${words.slice(0, 6).join(' ')}..." (${words.length} words)`);

    // Take initials of each word with alternating casing
    let initials = words.map((w, i) => {
      const char = w.replace(/[^a-zA-Z0-9]/g, '').charAt(0);
      return (i % 2 === 0) ? char.toUpperCase() : char.toLowerCase();
    }).join('');

    explanations.push(`Extracted initial letters: "${initials}" with alternating casing`);

    // Interleave symbols and word count
    const numWords = words.length.toString();
    const sym1 = getRandomSymbol();
    const sym2 = getRandomSymbol();
    const randomSalt = getRandomNumberStr(3);

    let password = `${sym1}${initials}${sym2}${numWords}${randomSalt}`;
    explanations.push('Interleaved word count metadata, boundary symbols, and random numeric salt');

    if (password.length < targetLength) {
      const extraPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      while (password.length < targetLength) {
        password += extraPool[getRandomInt(extraPool.length)];
      }
      explanations.push('Expanded length with cryptographically generated characters');
    }

    return {
      password,
      explanations
    };
  }

  /**
   * Generates a Theme-based password
   */
  function transformTheme(themeName, targetLength = 16) {
    const key = (themeName || 'space').toLowerCase();
    const lex = THEME_DICTIONARY[key] || THEME_DICTIONARY.space;
    const explanations = [];

    const word1 = lex[getRandomInt(lex.length)];
    let word2 = lex[getRandomInt(lex.length)];
    while (word2 === word1) word2 = lex[getRandomInt(lex.length)];

    explanations.push(`Theme selected: "${themeName}" (Anchors: ${word1}, ${word2})`);

    const sep = getRandomSymbol();
    let transformedWord1 = word1.replace(/a/i, '@').replace(/e/i, '3');
    explanations.push('Applied theme word blending and character substitutions');

    const numSalt = getRandomNumberStr(3);
    const endSym = getRandomSymbol();

    let password = `${transformedWord1}${sep}${word2}${numSalt}${endSym}`;
    explanations.push('Combined theme anchors with secure separators and numeric salt');

    if (password.length < targetLength) {
      const padPool = 'abcdefghjkmnpqrstuvwxyz23456789!@#$%';
      while (password.length < targetLength) {
        password += padPool[getRandomInt(padPool.length)];
      }
      explanations.push('Adjusted length to high-entropy standard');
    }

    return {
      password,
      explanations
    };
  }

  /**
   * Castle's Signature Feature: Memory Assisted Conversational Password Generator
   * Transforms 3-5 prompt responses without exposing raw answers!
   */
  function transformMemoryAssisted(answers, targetLength = 16) {
    const explanations = [];

    // Filter valid user answers
    const validAnswers = Object.values(answers).map(a => (a || '').trim()).filter(a => a.length > 0);

    if (validAnswers.length === 0) {
      return transformMemorableWord('castle', targetLength);
    }

    explanations.push(`Blended ${validAnswers.length} personal memory prompts safely`);

    // Extract fragments from each answer without leaking full word
    const fragments = validAnswers.map((ans, idx) => {
      const clean = ans.replace(/[^a-zA-Z0-9]/g, '');
      if (clean.length === 0) return '';
      
      // Take first 2-3 characters or numbers
      let frag = clean.substring(0, Math.min(3, clean.length));
      
      // Alternate casing
      if (idx % 2 === 0) {
        frag = frag.toUpperCase();
      } else {
        frag = frag.toLowerCase();
      }

      // Apply l33t substitution to fragment
      frag = frag.replace(/a/g, '@').replace(/e/g, '3').replace(/i/g, '!').replace(/o/g, '0');
      return frag;
    }).filter(Boolean);

    explanations.push('Extracted transformed memory fragments (never exposing raw answers)');

    // Shuffle fragment order using Fisher-Yates with Web Crypto
    for (let i = fragments.length - 1; i > 0; i--) {
      const j = getRandomInt(i + 1);
      [fragments[i], fragments[j]] = [fragments[j], fragments[i]];
    }
    explanations.push('Shuffled fragment positions cryptographically');

    // Interleave symbols between fragments
    let password = '';
    fragments.forEach((frag, idx) => {
      password += frag;
      if (idx < fragments.length - 1) {
        password += getRandomSymbol();
      }
    });

    // Add random numeric salt and ending symbol
    const numSalt = getRandomNumberStr(3);
    const endSym = getRandomSymbol();
    password = `${getRandomSymbol()}${password}${endSym}${numSalt}`;

    explanations.push('Interleaved random symbols, mixed casing, and numeric salt');

    // Pad if needed to reach target length
    if (password.length < targetLength) {
      const noisePool = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
      while (password.length < targetLength) {
        password += noisePool[getRandomInt(noisePool.length)];
      }
      explanations.push('Padded with cryptographic noise to achieve high entropy');
    }

    return {
      password,
      explanations
    };
  }

  exports.Transformations = {
    transformMemorableWord,
    transformPhrase,
    transformInitialism,
    transformTheme,
    transformMemoryAssisted
  };

})(window.CastlePassword);
