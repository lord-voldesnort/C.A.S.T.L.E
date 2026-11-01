/**
 * Castle Cybersecurity Toolbox - Password Transformation Engine
 * Applies intelligent transformations, character substitutions, phonetic blending, 
 * initialism extraction, genuine numeric mnemonics, and cryptographic entropy injection.
 * Fully backed by WebCrypto CSPRNG (zero Math.random).
 */

window.CastlePassword = window.CastlePassword || {};

(function(exports) {
  'use strict';

  // Substitution map for deliberate character replacements
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
   * Cryptographically secure random integer in range [0, max)
   */
  function getRandomInt(max) {
    if (max <= 0) return 0;
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
      res += getRandomInt(10).toString();
    }
    return res;
  }

  /**
   * Transforms a single Memorable Word
   * Numeric mnemonic: 2-digit length of the anchor word (e.g. "castle" = 6 letters -> "06")
   */
  function transformMemorableWord(word, targetLength = 16) {
    const clean = (word || 'castle').trim().replace(/\s+/g, '');
    const safeWord = clean.length > 0 ? clean : 'castle';
    const explanations = [];
    const constructionSteps = [];

    constructionSteps.push({
      label: 'Anchor Concept',
      detail: `Selected base anchor word: "${safeWord}" (${safeWord.length} letters).`
    });
    explanations.push(`Base anchor word: "${safeWord}"`);

    // Step 1: Capitalize strategically (Alternating casing)
    const cased = safeWord.split('').map((char, index) => {
      return (index % 2 === 0) ? char.toUpperCase() : char.toLowerCase();
    }).join('');
    constructionSteps.push({
      label: 'Casing Transformation',
      detail: `Applied alternating casing: "${cased}".`
    });
    explanations.push('Applied alternating uppercase and lowercase formatting');

    // Step 2: Intelligent substitution on select characters (using CSPRNG, not Math.random)
    let substituted = '';
    const appliedSubstitutions = [];
    let subCount = 0;
    for (const char of cased) {
      if (LEET_MAP[char] && subCount < 2 && getRandomInt(10) >= 3) {
        substituted += LEET_MAP[char];
        appliedSubstitutions.push(`${char} → ${LEET_MAP[char]}`);
        subCount++;
      } else {
        substituted += char;
      }
    }

    if (appliedSubstitutions.length > 0) {
      const subDetails = appliedSubstitutions.join(', ');
      constructionSteps.push({
        label: 'Character Substitutions',
        detail: `Replaced characters: ${subDetails}.`
      });
      explanations.push(`Substituted characters: ${subDetails}`);
    } else {
      constructionSteps.push({
        label: 'Character Substitutions',
        detail: 'Retained standard letter forms without symbol substitutions.'
      });
    }

    // Step 3: Reproducible Numeric Mnemonic: 2-digit length of anchor word
    const wordLen = safeWord.length;
    const mnemonicDigits = (wordLen < 10 ? '0' : '') + wordLen;
    const prefixSym = getRandomSymbol();
    const suffixSym = getRandomSymbol();

    constructionSteps.push({
      label: 'Numeric Component',
      detail: `Derived "${mnemonicDigits}" from anchor word length (${wordLen} letters).`,
      isMnemonic: true
    });
    explanations.push(`Numeric mnemonic: "${mnemonicDigits}" represents the character count of "${safeWord}" (${wordLen} letters)`);

    constructionSteps.push({
      label: 'Boundary Delimiters',
      detail: `Added CSPRNG boundary symbols '${prefixSym}' and '${suffixSym}'.`
    });
    explanations.push(`Enclosed with cryptographic boundary symbols: '${prefixSym}' and '${suffixSym}'`);

    let corePassword = `${prefixSym}${substituted}${suffixSym}${mnemonicDigits}`;
    let password = corePassword;
    let pad = '';

    // Step 4: If shorter than target length, pad with CSPRNG noise
    if (password.length < targetLength) {
      const paddingPool = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
      const padLen = targetLength - password.length;
      for (let i = 0; i < padLen; i++) {
        pad += paddingPool[getRandomInt(paddingPool.length)];
      }
      password += pad;
      constructionSteps.push({
        label: 'Entropy Padding',
        detail: `Appended ${padLen} CSPRNG characters ("${pad}") to satisfy the ${targetLength}-character length requirement.`
      });
      explanations.push(`Padded with ${padLen} hardware-random characters to achieve target length (${targetLength})`);
    }

    // Ordered Sequential Reconstruction (in exact left-to-right order)
    const reconstructionSequence = [
      {
        step: 1,
        type: 'symbol',
        name: 'Leading Boundary Symbol',
        value: prefixSym,
        isMnemonic: false,
        isPadding: false,
        rule: `Hardware CSPRNG symbol '${prefixSym}' placed at index 0.`,
        hint: `Begins with the symbol '${prefixSym}'`
      },
      {
        step: 2,
        type: 'anchor',
        name: 'Transformed Anchor Word',
        value: substituted,
        isMnemonic: true,
        isPadding: false,
        rule: `Anchor "${safeWord}" with alternating case ("${cased}") and substitutions (${appliedSubstitutions.length > 0 ? appliedSubstitutions.join(', ') : 'none'}).`,
        hint: `Recall your word "${safeWord}" → alternating case "${cased}" → apply replacements: ${appliedSubstitutions.length > 0 ? appliedSubstitutions.join(', ') : 'none'}`
      },
      {
        step: 3,
        type: 'symbol',
        name: 'Trailing Boundary Symbol',
        value: suffixSym,
        isMnemonic: false,
        isPadding: false,
        rule: `Hardware CSPRNG symbol '${suffixSym}' closing the word block.`,
        hint: `Follows with the symbol '${suffixSym}'`
      },
      {
        step: 4,
        type: 'number',
        name: 'Length-Derived Number',
        value: mnemonicDigits,
        isMnemonic: true,
        isPadding: false,
        rule: `2-digit length count of anchor word "${safeWord}" (${wordLen} letters → "${mnemonicDigits}").`,
        hint: `Append 2-digit length count of "${safeWord}" (${wordLen} → "${mnemonicDigits}")`
      }
    ];

    if (pad.length > 0) {
      reconstructionSequence.push({
        step: 5,
        type: 'padding',
        name: 'Random Entropy Padding',
        value: pad,
        isMnemonic: false,
        isPadding: true,
        rule: `${pad.length} hardware-random CSPRNG characters appended to reach ${targetLength} characters.`,
        hint: `Contains ${pad.length} unmemorizable random characters ("${pad}"). Must be stored in a password manager.`
      });
    }

    const hasPadding = pad.length > 0;
    const memorabilityStatus = hasPadding ? 'PARTIALLY_MEMORABLE' : 'FULLY_MEMORABLE';
    const coveragePercent = Math.round((corePassword.length / password.length) * 100);

    const metadata = {
      method: 'word',
      methodName: 'Memorable Word Engine',
      sourceInput: safeWord,
      constructionSteps,
      reconstruction: reconstructionSequence,
      memorability: {
        status: memorabilityStatus,
        badgeText: hasPadding ? `PARTIALLY MEMORABLE (${coveragePercent}% FORMULA, ${pad.length} CHARS RANDOM PADDING)` : '100% RECONSTRUCTIBLE VIA MNEMONIC',
        memorablePortion: corePassword,
        unmemorizablePortion: pad,
        memorableLength: corePassword.length,
        paddingLength: pad.length,
        totalLength: password.length,
        coveragePercent,
        guidance: hasPadding
          ? `The core formula "${corePassword}" (${corePassword.length} chars) is fully memorable, but ${pad.length} trailing characters are hardware-random padding added to fulfill your ${targetLength}-character length setting. Random padding cannot be reconstructed from memory. For 100% human recall without a password manager, reduce length to ${corePassword.length} characters.`
          : `All ${password.length} characters derive from your mnemonic rules and can be reconstructed from memory.`
      },
      numericExplanation: {
        hasMnemonic: true,
        mnemonicValue: mnemonicDigits,
        mnemonicRule: `Anchor word character count: "${safeWord}" has ${wordLen} letters → "${mnemonicDigits}"`,
        isRandom: false,
        securityNote: 'Convenience mnemonic: The digits derive directly from word length. While easier to recall than random digits, predictable numbers reduce the search keyspace.'
      },
      memoryGuide: {
        type: hasPadding ? 'Partially Memorable' : 'Word Mnemonic',
        anchor: safeWord,
        headline: hasPadding ? `Remembering "${safeWord}" (With Random Padding)` : `Remembering "${safeWord}"`,
        mnemonicText: safeWord,
        recallSteps: [
          `1. Anchor: Recall your chosen word "${safeWord}".`,
          `2. Casing: Apply alternating casing (${cased}).`,
          `3. Substitutions: ${appliedSubstitutions.length > 0 ? appliedSubstitutions.join(', ') : 'Kept original letter forms'}.`,
          `4. Boundary Symbols: Enclose transformed word between '${prefixSym}' and '${suffixSym}'.`,
          `5. Number: Append "${mnemonicDigits}" (the ${wordLen}-letter length of "${safeWord}").`,
          hasPadding ? `6. Random Padding: "${pad}" (${pad.length} CSPRNG chars) cannot be memorized and requires password manager storage.` : '6. Complete: No random padding was added.'
        ],
        securityCaveat: 'Predictable substitutions and length-derived numbers enhance recall, but dedicated rule-based password crackers specifically test these heuristics. Use Fully Random for high-value root credentials.'
      }
    };

    return { password, explanations, metadata };
  }

  /**
   * Transforms a Phrase into a secure password
   * Numeric mnemonic: 2-digit count of words in the phrase (e.g. 3 words -> "03")
   */
  function transformPhrase(phrase, targetLength = 16) {
    const rawPhrase = (phrase || 'My favourite mountain').trim();
    const words = rawPhrase.split(/\s+/).filter(Boolean);
    const safeWords = words.length > 0 ? words : ['Castle', 'Obsidian', 'Tower'];
    const explanations = [];
    const constructionSteps = [];

    constructionSteps.push({
      label: 'Phrase Input',
      detail: `Processed phrase: "${safeWords.join(' ')}" (${safeWords.length} words).`
    });
    explanations.push(`Phrase concept: "${safeWords.join(' ')}" (${safeWords.length} words)`);

    // Extract word roots & capitalize
    const parts = safeWords.map((w) => {
      const clean = w.replace(/[^a-zA-Z0-9]/g, '');
      if (clean.length === 0) return '';
      return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    }).filter(Boolean);

    constructionSteps.push({
      label: 'Root Extraction',
      detail: `Extracted sanitized word roots with TitleCase: [${parts.join(', ')}].`
    });
    explanations.push('Extracted word roots and applied TitleCase formatting');

    const sep = getRandomSymbol();
    let combined = parts.join(sep);
    constructionSteps.push({
      label: 'Component Delimiter',
      detail: `Joined word roots using separator symbol '${sep}'.`
    });
    explanations.push(`Joined concepts using separator symbol '${sep}'`);

    // Subtle substitution on the first root
    let substitutionNote = 'No symbol substitutions applied';
    if (combined.includes('a') || combined.includes('e') || combined.includes('i')) {
      const beforeSub = combined;
      combined = combined.replace(/a/, '@').replace(/e/, '3').replace(/i/, '!');
      if (combined !== beforeSub) {
        substitutionNote = 'Applied subtle symbol substitution to vowels (a→@, e→3, i→!)';
        constructionSteps.push({
          label: 'Symbol Substitutions',
          detail: 'Replaced select vowels with standard symbols (a→@, e→3, i→!).'
        });
        explanations.push('Applied subtle symbol substitutions to vowel positions');
      }
    }

    // Numeric Mnemonic: Word count of the phrase formatted as 2 digits
    const wordCount = safeWords.length;
    const mnemonicDigits = (wordCount < 10 ? '0' : '') + wordCount;
    const endSym = getRandomSymbol();

    constructionSteps.push({
      label: 'Numeric Component',
      detail: `Derived "${mnemonicDigits}" from total phrase word count (${wordCount} words).`,
      isMnemonic: true
    });
    explanations.push(`Numeric mnemonic: "${mnemonicDigits}" equals the number of words in your phrase (${wordCount})`);

    constructionSteps.push({
      label: 'Boundary Symbol',
      detail: `Appended final boundary symbol '${endSym}'.`
    });
    explanations.push(`Appended final boundary symbol '${endSym}'`);

    let corePassword = `${combined}${mnemonicDigits}${endSym}`;
    let password = corePassword;
    let pad = '';

    if (password.length < targetLength) {
      const padPool = 'abcdefghjkmnpqrstuvwxyz23456789!@#$%';
      const padLen = targetLength - password.length;
      for (let i = 0; i < padLen; i++) {
        pad += padPool[getRandomInt(padPool.length)];
      }
      password += pad;
      constructionSteps.push({
        label: 'Entropy Extension',
        detail: `Added ${padLen} CSPRNG characters ("${pad}") to satisfy target length of ${targetLength}.`
      });
      explanations.push(`Adjusted length with ${padLen} characters to reach target ${targetLength}`);
    }

    const reconstructionSequence = [
      {
        step: 1,
        type: 'anchor',
        name: 'Transformed Words with Delimiters',
        value: combined,
        isMnemonic: true,
        isPadding: false,
        rule: `TitleCase word roots [${parts.join(', ')}] joined by separator '${sep}', with vowel substitutions (${substitutionNote}).`,
        hint: `Recall phrase "${safeWords.join(' ')}" → TitleCase roots joined by '${sep}' → apply substitutions`
      },
      {
        step: 2,
        type: 'number',
        name: 'Phrase Word-Count Number',
        value: mnemonicDigits,
        isMnemonic: true,
        isPadding: false,
        rule: `2-digit count of words in phrase: ${wordCount} words → "${mnemonicDigits}".`,
        hint: `Append 2-digit word count: ${wordCount} → "${mnemonicDigits}"`
      },
      {
        step: 3,
        type: 'symbol',
        name: 'Trailing Boundary Symbol',
        value: endSym,
        isMnemonic: false,
        isPadding: false,
        rule: `Hardware CSPRNG closing symbol '${endSym}'.`,
        hint: `Conclude core phrase with symbol '${endSym}'`
      }
    ];

    if (pad.length > 0) {
      reconstructionSequence.push({
        step: 4,
        type: 'padding',
        name: 'Random Entropy Padding',
        value: pad,
        isMnemonic: false,
        isPadding: true,
        rule: `${pad.length} hardware-random CSPRNG characters appended to reach ${targetLength} characters.`,
        hint: `Contains ${pad.length} unmemorizable random characters ("${pad}"). Must be stored in a password manager.`
      });
    }

    const hasPadding = pad.length > 0;
    const memorabilityStatus = hasPadding ? 'PARTIALLY_MEMORABLE' : 'FULLY_MEMORABLE';
    const coveragePercent = Math.round((corePassword.length / password.length) * 100);

    const metadata = {
      method: 'phrase',
      methodName: 'Personal Phrase Engine',
      sourceInput: safeWords.join(' '),
      constructionSteps,
      reconstruction: reconstructionSequence,
      memorability: {
        status: memorabilityStatus,
        badgeText: hasPadding ? `PARTIALLY MEMORABLE (${coveragePercent}% FORMULA, ${pad.length} CHARS RANDOM PADDING)` : '100% RECONSTRUCTIBLE VIA MNEMONIC',
        memorablePortion: corePassword,
        unmemorizablePortion: pad,
        memorableLength: corePassword.length,
        paddingLength: pad.length,
        totalLength: password.length,
        coveragePercent,
        guidance: hasPadding
          ? `The core passphrase "${corePassword}" (${corePassword.length} chars) is fully memorable, but ${pad.length} trailing characters are hardware-random padding added to meet your ${targetLength}-character length setting. Random padding cannot be reconstructed from memory. For 100% human recall without a password manager, reduce length to ${corePassword.length} characters.`
          : `All ${password.length} characters derive from your mnemonic rules and can be reconstructed from memory.`
      },
      numericExplanation: {
        hasMnemonic: true,
        mnemonicValue: mnemonicDigits,
        mnemonicRule: `Phrase word count: "${safeWords.join(' ')}" has ${wordCount} words → "${mnemonicDigits}"`,
        isRandom: false,
        securityNote: 'Convenience mnemonic: The digits equal the word count. Because word counts fall within a narrow range (typically 2-10), they provide less entropy than CSPRNG digits.'
      },
      memoryGuide: {
        type: hasPadding ? 'Partially Memorable' : 'Phrase Mnemonic',
        anchor: safeWords.join(' '),
        headline: hasPadding ? 'Remembering Your Phrase Password (With Random Padding)' : 'Remembering Your Phrase Password',
        mnemonicText: safeWords.join(' '),
        recallSteps: [
          `1. Phrase: Recall your sentence "${safeWords.join(' ')}".`,
          `2. Structure: TitleCase words joined by the '${sep}' symbol.`,
          `3. Substitutions: Vowel substitutions applied (${substitutionNote}).`,
          `4. Number: "${mnemonicDigits}" represents the ${wordCount} words in the phrase.`,
          `5. Boundary Symbol: Concludes core phrase with '${endSym}'.`,
          hasPadding ? `6. Random Padding: "${pad}" (${pad.length} CSPRNG chars) cannot be memorized and requires password manager storage.` : '6. Complete: No random padding was added.'
        ],
        securityCaveat: 'Phrase passwords achieve strong entropy primarily through length. Avoid common cultural quotes or song lyrics that appear in public dictionaries.'
      }
    };

    return { password, explanations, metadata };
  }

  /**
   * Transforms a Sentence into an Initialism Password
   * Numeric mnemonic: Count of words in sentence, plus 3 CSPRNG random salt digits
   */
  function transformInitialism(sentence, targetLength = 16) {
    const raw = (sentence || 'My Dog Bruno Loves Eating Chicken Every Sunday').trim();
    const words = raw.split(/\s+/).filter(Boolean);
    const safeWords = words.length > 0 ? words : ['My', 'Dog', 'Bruno', 'Loves', 'Eating', 'Sunday'];
    const explanations = [];
    const constructionSteps = [];

    constructionSteps.push({
      label: 'Sentence Input',
      detail: `Analyzed sentence with ${safeWords.length} words: "${safeWords.slice(0, 5).join(' ')}...".`
    });
    explanations.push(`Sentence input: "${safeWords.slice(0, 5).join(' ')}..." (${safeWords.length} words)`);

    // Take initials of each word with alternating casing
    const initials = safeWords.map((w, i) => {
      const cleanChar = w.replace(/[^a-zA-Z0-9]/g, '').charAt(0);
      const char = cleanChar || 'X';
      return (i % 2 === 0) ? char.toUpperCase() : char.toLowerCase();
    }).join('');

    constructionSteps.push({
      label: 'Initialism Extraction',
      detail: `Extracted leading initials with alternating casing: "${initials}".`
    });
    explanations.push(`Extracted initial letters: "${initials}" with alternating casing`);

    const numWords = safeWords.length.toString();
    const sym1 = getRandomSymbol();
    const sym2 = getRandomSymbol();
    const randomSalt = getRandomNumberStr(3);

    constructionSteps.push({
      label: 'Numeric Component',
      detail: `Derived first digit "${numWords}" from word count (${safeWords.length}), followed by 3 CSPRNG random digits "${randomSalt}".`,
      isMnemonic: true
    });
    explanations.push(`First digit "${numWords}" reflects word count; remaining digits "${randomSalt}" are hardware-random salt`);

    constructionSteps.push({
      label: 'Symbol Framing',
      detail: `Enclosed acronym with symbols '${sym1}' and '${sym2}'.`
    });
    explanations.push(`Framed with boundary symbols '${sym1}' and '${sym2}'`);

    let corePassword = `${sym1}${initials}${sym2}${numWords}${randomSalt}`;
    let password = corePassword;
    let pad = '';

    if (password.length < targetLength) {
      const extraPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      const padLen = targetLength - password.length;
      for (let i = 0; i < padLen; i++) {
        pad += extraPool[getRandomInt(extraPool.length)];
      }
      password += pad;
      constructionSteps.push({
        label: 'Entropy Expansion',
        detail: `Appended ${padLen} CSPRNG characters ("${pad}") to fulfill target length (${targetLength}).`
      });
      explanations.push(`Expanded length with ${padLen} cryptographically generated characters`);
    }

    const reconstructionSequence = [
      {
        step: 1,
        type: 'symbol',
        name: 'Opening Boundary Symbol',
        value: sym1,
        isMnemonic: false,
        isPadding: false,
        rule: `Hardware CSPRNG boundary symbol '${sym1}' leading the initialism.`,
        hint: `Begins with boundary symbol '${sym1}'`
      },
      {
        step: 2,
        type: 'anchor',
        name: 'Alternating-Case Sentence Initials',
        value: initials,
        isMnemonic: true,
        isPadding: false,
        rule: `First letter of each word in "${safeWords.join(' ')}" with alternating upper/lower casing: "${initials}".`,
        hint: `Take first letter of each word in "${safeWords.join(' ')}" with alternating case → "${initials}"`
      },
      {
        step: 3,
        type: 'symbol',
        name: 'Internal Boundary Symbol',
        value: sym2,
        isMnemonic: false,
        isPadding: false,
        rule: `Hardware CSPRNG delimiter '${sym2}' separating letters from numbers.`,
        hint: `Insert internal symbol '${sym2}'`
      },
      {
        step: 4,
        type: 'number',
        name: 'Sentence Word Count Digit',
        value: numWords,
        isMnemonic: true,
        isPadding: false,
        rule: `Single digit representing sentence word count: ${safeWords.length} words → "${numWords}".`,
        hint: `Append sentence word count: ${safeWords.length} → "${numWords}"`
      },
      {
        step: 5,
        type: 'salt',
        name: 'CSPRNG Random Salt Digits',
        value: randomSalt,
        isMnemonic: false,
        isPadding: true,
        rule: `3 hardware-random CSPRNG digits ("${randomSalt}") added for anti-mask defense.`,
        hint: `3 random digits ("${randomSalt}") cannot be reconstructed via mnemonic and must be referenced.`
      }
    ];

    if (pad.length > 0) {
      reconstructionSequence.push({
        step: 6,
        type: 'padding',
        name: 'Random Entropy Padding',
        value: pad,
        isMnemonic: false,
        isPadding: true,
        rule: `${pad.length} hardware-random CSPRNG characters appended to reach ${targetLength} characters.`,
        hint: `Contains ${pad.length} unmemorizable random characters ("${pad}"). Must be stored in a password manager.`
      });
    }

    const unmemorizableChars = randomSalt + pad;
    const mnemonicPart = `${sym1}${initials}${sym2}${numWords}`;
    const coveragePercent = Math.round((mnemonicPart.length / password.length) * 100);

    const metadata = {
      method: 'initialism',
      methodName: 'Sentence Initialism Engine',
      sourceInput: safeWords.join(' '),
      constructionSteps,
      reconstruction: reconstructionSequence,
      memorability: {
        status: 'PARTIALLY_MEMORABLE',
        badgeText: `PARTIALLY MEMORABLE (${coveragePercent}% MNEMONIC, ${unmemorizableChars.length} CHARS RANDOM NOISE)`,
        memorablePortion: mnemonicPart,
        unmemorizablePortion: unmemorizableChars,
        memorableLength: mnemonicPart.length,
        paddingLength: unmemorizableChars.length,
        totalLength: password.length,
        coveragePercent,
        guidance: `The letters and word count ("${mnemonicPart}") are mnemonic, but the 3-digit salt "${randomSalt}"${pad.length > 0 ? ` and ${pad.length} padding characters "${pad}"` : ''} are hardware random noise added for security. This cannot be reconstructed from memory alone without storing the random digits.`
      },
      numericExplanation: {
        hasMnemonic: true,
        mnemonicValue: numWords,
        mnemonicRule: `Sentence word count: ${safeWords.length} words → "${numWords}"`,
        randomSaltValue: randomSalt,
        randomSaltRule: `3 CSPRNG hardware-random digits: "${randomSalt}"`,
        isRandom: false,
        securityNote: `Hybrid numeric system: The first digit (${numWords}) is a mnemonic for word count. The following 3 digits (${randomSalt}) are cryptographically random to resist automated mask attacks.`
      },
      memoryGuide: {
        type: 'Partially Memorable',
        anchor: safeWords.join(' '),
        headline: 'Remembering Your Initialism Password (Hybrid Salt)',
        mnemonicText: safeWords.join(' '),
        recallSteps: [
          `1. Sentence: Mentally recite "${safeWords.join(' ')}".`,
          `2. Boundary Symbol: Opens with '${sym1}'.`,
          `3. Initials: Take the first letter of each word with alternating case (${initials}).`,
          `4. Inner Symbol: Intermediate delimiter '${sym2}'.`,
          `5. Word Count: First digit is ${numWords} (${safeWords.length} words).`,
          `6. Random Salt: Followed by 3 random digits "${randomSalt}" (cannot be derived; store in password manager).`,
          pad.length > 0 ? `7. Random Padding: "${pad}" (${pad.length} CSPRNG chars) must be stored in a password manager.` : '7. Complete: No extra padding.'
        ],
        securityCaveat: 'Acronym passwords resist direct dictionary lookup because initials lack grammatical structure, while the trailing CSPRNG digits provide key diversification.'
      }
    };

    return { password, explanations, metadata };
  }

  /**
   * Generates a Theme-based password
   * Numeric mnemonic: Combined lengths of the two selected theme words (e.g. 6 and 6 -> "66")
   */
  function transformTheme(themeName, targetLength = 16) {
    const key = (themeName || 'space').toLowerCase();
    const lex = THEME_DICTIONARY[key] || THEME_DICTIONARY.space;
    const explanations = [];
    const constructionSteps = [];

    const word1 = lex[getRandomInt(lex.length)];
    let word2 = lex[getRandomInt(lex.length)];
    while (word2 === word1) {
      word2 = lex[getRandomInt(lex.length)];
    }

    constructionSteps.push({
      label: 'Thematic Dictionary',
      detail: `Selected domain "${themeName}": anchor words "${word1}" and "${word2}".`
    });
    explanations.push(`Theme selected: "${themeName}" (Anchors: ${word1}, ${word2})`);

    const sep = getRandomSymbol();
    let transformedWord1 = word1.replace(/a/i, '@').replace(/e/i, '3');
    constructionSteps.push({
      label: 'Anchor Substitution',
      detail: `Substituted characters in primary anchor: "${word1}" → "${transformedWord1}".`
    });
    explanations.push(`Applied character substitutions: "${word1}" → "${transformedWord1}"`);

    // Numeric mnemonic: Combined character lengths of both words
    const mnemonicDigits = `${word1.length}${word2.length}`;
    const endSym = getRandomSymbol();

    constructionSteps.push({
      label: 'Numeric Component',
      detail: `Derived "${mnemonicDigits}" from lengths of "${word1}" (${word1.length}) and "${word2}" (${word2.length}).`,
      isMnemonic: true
    });
    explanations.push(`Numeric mnemonic: "${mnemonicDigits}" equals lengths of "${word1}" (${word1.length}) and "${word2}" (${word2.length})`);

    constructionSteps.push({
      label: 'Separators & Delimiters',
      detail: `Separated anchors with '${sep}' and ended with '${endSym}'.`
    });
    explanations.push(`Combined theme anchors with separator '${sep}' and final symbol '${endSym}'`);

    let corePassword = `${transformedWord1}${sep}${word2}${mnemonicDigits}${endSym}`;
    let password = corePassword;
    let pad = '';

    if (password.length < targetLength) {
      const padPool = 'abcdefghjkmnpqrstuvwxyz23456789!@#$%';
      const padLen = targetLength - password.length;
      for (let i = 0; i < padLen; i++) {
        pad += padPool[getRandomInt(padPool.length)];
      }
      password += pad;
      constructionSteps.push({
        label: 'Length Adjustment',
        detail: `Appended ${padLen} CSPRNG characters ("${pad}") to satisfy target length (${targetLength}).`
      });
      explanations.push(`Adjusted length with ${padLen} characters to reach target ${targetLength}`);
    }

    const reconstructionSequence = [
      {
        step: 1,
        type: 'anchor',
        name: 'Transformed Primary Anchor',
        value: transformedWord1,
        isMnemonic: true,
        isPadding: false,
        rule: `First theme word "${word1}" with vowel substitutions (a→@, e→3): "${transformedWord1}".`,
        hint: `Theme word "${word1}" with replacements (a→@, e→3) → "${transformedWord1}"`
      },
      {
        step: 2,
        type: 'separator',
        name: 'Theme Delimiter Symbol',
        value: sep,
        isMnemonic: false,
        isPadding: false,
        rule: `Hardware CSPRNG symbol '${sep}' separating the two theme words.`,
        hint: `Insert separator symbol '${sep}'`
      },
      {
        step: 3,
        type: 'anchor',
        name: 'Secondary Anchor Word',
        value: word2,
        isMnemonic: true,
        isPadding: false,
        rule: `Second theme word "${word2}" in standard title-case.`,
        hint: `Follow with second theme word "${word2}"`
      },
      {
        step: 4,
        type: 'number',
        name: 'Combined Word-Length Number',
        value: mnemonicDigits,
        isMnemonic: true,
        isPadding: false,
        rule: `Combined character counts of "${word1}" (${word1.length}) and "${word2}" (${word2.length}) → "${mnemonicDigits}".`,
        hint: `Append word lengths: ${word1.length} + ${word2.length} → "${mnemonicDigits}"`
      },
      {
        step: 5,
        type: 'symbol',
        name: 'Trailing Boundary Symbol',
        value: endSym,
        isMnemonic: false,
        isPadding: false,
        rule: `Hardware CSPRNG closing symbol '${endSym}'.`,
        hint: `Conclude theme formula with symbol '${endSym}'`
      }
    ];

    if (pad.length > 0) {
      reconstructionSequence.push({
        step: 6,
        type: 'padding',
        name: 'Random Entropy Padding',
        value: pad,
        isMnemonic: false,
        isPadding: true,
        rule: `${pad.length} hardware-random CSPRNG characters appended to reach ${targetLength} characters.`,
        hint: `Contains ${pad.length} unmemorizable random characters ("${pad}"). Must be stored in a password manager.`
      });
    }

    const hasPadding = pad.length > 0;
    const memorabilityStatus = hasPadding ? 'PARTIALLY_MEMORABLE' : 'FULLY_MEMORABLE';
    const coveragePercent = Math.round((corePassword.length / password.length) * 100);

    const metadata = {
      method: 'theme',
      methodName: 'Thematic Ontology Engine',
      sourceInput: `${themeName}: ${word1}, ${word2}`,
      constructionSteps,
      reconstruction: reconstructionSequence,
      memorability: {
        status: memorabilityStatus,
        badgeText: hasPadding ? `PARTIALLY MEMORABLE (${coveragePercent}% FORMULA, ${pad.length} CHARS RANDOM PADDING)` : '100% RECONSTRUCTIBLE VIA MNEMONIC',
        memorablePortion: corePassword,
        unmemorizablePortion: pad,
        memorableLength: corePassword.length,
        paddingLength: pad.length,
        totalLength: password.length,
        coveragePercent,
        guidance: hasPadding
          ? `The core formula "${corePassword}" (${corePassword.length} chars) is fully memorable, but ${pad.length} trailing characters are hardware-random padding added to meet your ${targetLength}-character length setting. Random padding cannot be reconstructed from memory. For 100% human recall without a password manager, reduce length to ${corePassword.length} characters.`
          : `All ${password.length} characters derive from your thematic mnemonic rules and can be reconstructed from memory.`
      },
      numericExplanation: {
        hasMnemonic: true,
        mnemonicValue: mnemonicDigits,
        mnemonicRule: `Theme anchor lengths: "${word1}" (${word1.length}) + "${word2}" (${word2.length}) → "${mnemonicDigits}"`,
        isRandom: false,
        securityNote: 'Convenience mnemonic: Digits represent anchor word lengths. While memorable, dictionary-based words have lower entropy than fully randomized strings.'
      },
      memoryGuide: {
        type: hasPadding ? 'Partially Memorable' : 'Domain Anchors',
        anchor: `${word1} & ${word2}`,
        headline: hasPadding ? `Theme: ${themeName.toUpperCase()} (With Random Padding)` : `Theme: ${themeName.toUpperCase()}`,
        mnemonicText: `${word1} & ${word2}`,
        recallSteps: [
          `1. Theme: Remember the domain topic (${themeName}).`,
          `2. Anchors: Two thematic words: "${word1}" and "${word2}".`,
          `3. Substitution: First word transformed to "${transformedWord1}".`,
          `4. Separator: Anchors joined with '${sep}'.`,
          `5. Number: "${mnemonicDigits}" equals the letter count of both words (${word1.length} and ${word2.length}).`,
          `6. Ending: Boundary symbol '${endSym}'.`,
          hasPadding ? `7. Random Padding: "${pad}" (${pad.length} CSPRNG chars) cannot be memorized and requires password manager storage.` : '7. Complete: No random padding was added.'
        ],
        securityCaveat: 'Thematic words come from curated lexicons. If an adversary suspects a thematic pattern, dictionary cracking masks can efficiently target common terms.'
      }
    };

    return { password, explanations, metadata };
  }

  /**
   * Castle Signature: Memory Assisted Conversational Generator
   * Transforms guided prompt responses without saving or exposing raw answers.
   */
  function transformMemoryAssisted(answers, targetLength = 16) {
    const explanations = [];
    const constructionSteps = [];

    const validAnswers = Object.values(answers || {}).map(a => (a || '').trim()).filter(a => a.length > 0);

    if (validAnswers.length === 0) {
      return transformMemorableWord('castle', targetLength);
    }

    constructionSteps.push({
      label: 'Prompt Answers',
      detail: `Processed ${validAnswers.length} memory prompt response(s) in local volatile RAM.`
    });
    explanations.push(`Blended ${validAnswers.length} personal memory prompts safely`);

    // Extract fragments from each answer without exposing full words
    const fragments = validAnswers.map((ans, idx) => {
      const clean = ans.replace(/[^a-zA-Z0-9]/g, '');
      if (clean.length === 0) return '';
      let frag = clean.substring(0, Math.min(3, clean.length));
      frag = (idx % 2 === 0) ? frag.toUpperCase() : frag.toLowerCase();
      frag = frag.replace(/a/g, '@').replace(/e/g, '3').replace(/i/g, '!').replace(/o/g, '0');
      return frag;
    }).filter(Boolean);

    constructionSteps.push({
      label: 'Fragment Derivation',
      detail: `Extracted ${fragments.length} transformed 2-3 character syllables with mixed casing and substitutions.`
    });
    explanations.push('Extracted transformed memory fragments (raw answers are discarded from memory)');

    // Shuffle fragment order using Fisher-Yates with WebCrypto CSPRNG
    for (let i = fragments.length - 1; i > 0; i--) {
      const j = getRandomInt(i + 1);
      [fragments[i], fragments[j]] = [fragments[j], fragments[i]];
    }
    constructionSteps.push({
      label: 'Crypto Shuffling',
      detail: 'Shuffled fragment order using WebCrypto CSPRNG to prevent direct semantic reconstruction.'
    });
    explanations.push('Shuffled fragment positions cryptographically');

    // Interleave symbols between fragments
    let core = '';
    fragments.forEach((frag, idx) => {
      core += frag;
      if (idx < fragments.length - 1) {
        core += getRandomSymbol();
      }
    });

    // Mnemonic: Number of answered prompts + 2 CSPRNG salt digits
    const promptCount = validAnswers.length;
    const mnemonicCount = (promptCount < 10 ? '0' : '') + promptCount;
    const saltDigits = getRandomNumberStr(2);
    const numericPart = `${mnemonicCount}${saltDigits}`;
    const startSym = getRandomSymbol();
    const endSym = getRandomSymbol();

    constructionSteps.push({
      label: 'Numeric Component',
      detail: `First 2 digits "${mnemonicCount}" represent answered prompt count (${promptCount}); trailing digits "${saltDigits}" are CSPRNG salt.`,
      isMnemonic: true
    });
    explanations.push(`Numeric component: "${mnemonicCount}" represents ${promptCount} memory prompts; "${saltDigits}" is cryptographic salt`);

    constructionSteps.push({
      label: 'Boundary Delimiters',
      detail: `Enclosed within boundary symbols '${startSym}' and '${endSym}'.`
    });

    let corePassword = `${startSym}${core}${endSym}${numericPart}`;
    let password = corePassword;
    let pad = '';

    if (password.length < targetLength) {
      const noisePool = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
      const padLen = targetLength - password.length;
      for (let i = 0; i < padLen; i++) {
        pad += noisePool[getRandomInt(noisePool.length)];
      }
      password += pad;
      constructionSteps.push({
        label: 'Entropy Padding',
        detail: `Appended ${padLen} CSPRNG characters ("${pad}") to achieve target length (${targetLength}).`
      });
      explanations.push(`Padded with ${padLen} cryptographic characters to achieve high entropy`);
    }

    const reconstructionSequence = [
      {
        step: 1,
        type: 'symbol',
        name: 'Opening Boundary Symbol',
        value: startSym,
        isMnemonic: false,
        isPadding: false,
        rule: `Hardware CSPRNG boundary symbol '${startSym}'.`,
        hint: `Begins with boundary symbol '${startSym}'`
      },
      {
        step: 2,
        type: 'anchor',
        name: 'Shuffled Memory Cues Core',
        value: core,
        isMnemonic: true,
        isPadding: false,
        rule: `${fragments.length} transformed syllables from prompt answers, shuffled via WebCrypto CSPRNG and interleaved with symbols: "${core}".`,
        hint: `Recall your ${validAnswers.length} personal prompt answers → transformed and shuffled syllables`
      },
      {
        step: 3,
        type: 'symbol',
        name: 'Core Delimiter Symbol',
        value: endSym,
        isMnemonic: false,
        isPadding: false,
        rule: `Hardware CSPRNG symbol '${endSym}' closing the memory syllables core.`,
        hint: `Close syllables block with symbol '${endSym}'`
      },
      {
        step: 4,
        type: 'number',
        name: 'Prompt Count Mnemonic',
        value: mnemonicCount,
        isMnemonic: true,
        isPadding: false,
        rule: `2-digit count of answered memory prompts: ${promptCount} prompts → "${mnemonicCount}".`,
        hint: `Append 2-digit prompt count: ${promptCount} → "${mnemonicCount}"`
      },
      {
        step: 5,
        type: 'salt',
        name: 'CSPRNG Random Salt Digits',
        value: saltDigits,
        isMnemonic: false,
        isPadding: true,
        rule: `2 hardware-random CSPRNG digits ("${saltDigits}") added for cryptographic diversification.`,
        hint: `2 random digits ("${saltDigits}") cannot be recalled via mnemonic and must be referenced.`
      }
    ];

    if (pad.length > 0) {
      reconstructionSequence.push({
        step: 6,
        type: 'padding',
        name: 'Random Entropy Padding',
        value: pad,
        isMnemonic: false,
        isPadding: true,
        rule: `${pad.length} hardware-random CSPRNG characters appended to reach ${targetLength} characters.`,
        hint: `Contains ${pad.length} unmemorizable random characters ("${pad}"). Must be stored in a password manager.`
      });
    }

    const unmemorizableChars = saltDigits + pad;
    const mnemonicPart = `${startSym}${core}${endSym}${mnemonicCount}`;
    const coveragePercent = Math.round((mnemonicPart.length / password.length) * 100);

    const metadata = {
      method: 'memory_assisted',
      methodName: 'Castle Signature Memory Engine',
      sourceInput: `${validAnswers.length} personal prompts`,
      constructionSteps,
      reconstruction: reconstructionSequence,
      memorability: {
        status: 'PARTIALLY_MEMORABLE',
        badgeText: `PARTIALLY MEMORABLE (${coveragePercent}% MNEMONIC, ${unmemorizableChars.length} CHARS RANDOM NOISE)`,
        memorablePortion: mnemonicPart,
        unmemorizablePortion: unmemorizableChars,
        memorableLength: mnemonicPart.length,
        paddingLength: unmemorizableChars.length,
        totalLength: password.length,
        coveragePercent,
        guidance: `The prompt cues and prompt count ("${mnemonicPart}") are mnemonic, but the 2-digit salt "${saltDigits}"${pad.length > 0 ? ` and ${pad.length} padding characters "${pad}"` : ''} are hardware random noise added for security. This cannot be reconstructed from memory alone without storing the random digits.`
      },
      numericExplanation: {
        hasMnemonic: true,
        mnemonicValue: mnemonicCount,
        mnemonicRule: `Number of answered prompts: ${promptCount} prompts → "${mnemonicCount}"`,
        randomSaltValue: saltDigits,
        randomSaltRule: `2 CSPRNG random digits: "${saltDigits}"`,
        isRandom: false,
        securityNote: `Hybrid numeric system: "${mnemonicCount}" reminds you how many prompts you answered, while "${saltDigits}" provides cryptographic diversification.`
      },
      memoryGuide: {
        type: 'Partially Memorable',
        anchor: `${promptCount} Personal Prompts`,
        headline: 'Remembering Your Memory-Assisted Password (Hybrid Salt)',
        mnemonicText: `${promptCount} Personal Prompts`,
        recallSteps: [
          `1. Prompts: Recall the answers to your ${promptCount} memory questions.`,
          `2. Fragments: Uses the first 2-3 characters of each answer with mixed case and substitutions.`,
          `3. Boundary Symbols: Framed between '${startSym}' and '${endSym}'.`,
          `4. Number: "${mnemonicCount}" reflects your ${promptCount} answered questions.`,
          `5. Random Salt: Suffix digits "${saltDigits}" are hardware-random and must be stored in a password manager.`,
          pad.length > 0 ? `6. Random Padding: "${pad}" (${pad.length} CSPRNG chars) cannot be memorized and requires password manager storage.` : '6. Complete: No extra padding.'
        ],
        securityCaveat: 'Raw prompt answers are never stored, logged, or hashed into rainbow-table targets. The password exists solely in your volatile browser memory.'
      }
    };

    return { password, explanations, metadata };
  }

  exports.Transformations = {
    getRandomInt,
    getRandomSymbol,
    getRandomNumberStr,
    transformMemorableWord,
    transformPhrase,
    transformInitialism,
    transformTheme,
    transformMemoryAssisted
  };

})(window.CastlePassword);

