/**
 * Castle Cybersecurity Toolbox - Password Analysis Engine (Tab 2)
 * Comprehensive local audit of custom passwords:
 * Weaknesses, suggestions, dictionary checks, keyboard patterns, and smart structural improvements.
 */

window.CastlePassword = window.CastlePassword || {};

(function(exports) {
  'use strict';

  function analyzePassword(password) {
    if (!password) {
      return {
        isEmpty: true,
        entropy: 0,
        crackTime: { seconds: 0, text: 'N/A' },
        strength: { level: 'NONE', scoreStep: 0, color: 'text-text-muted', barColor: 'bg-surface-container-highest' },
        memorabilityScore: 0,
        distribution: { uppercase: 0, lowercase: 0, numbers: 0, symbols: 0, total: 0 },
        weaknesses: [],
        suggestions: [],
        patterns: [],
        dictionaryWords: [],
        repeatedChars: [],
        lengthRating: 'Too short',
        recommendedPassword: ''
      };
    }

    const EntropyEngine = exports.Entropy;
    
    const entropy = EntropyEngine.calculateEntropy(password);
    const crackTime = EntropyEngine.calculateCrackTime(password);
    const strength = EntropyEngine.evaluateStrength(password);
    const memorabilityScore = EntropyEngine.calculateMemorabilityScore(password, 'custom');
    const distribution = EntropyEngine.getCharacterDistribution(password);
    const patterns = EntropyEngine.detectKeyboardPatterns(password);
    const dictionaryWords = EntropyEngine.detectDictionaryWords(password);
    const repeatedChars = EntropyEngine.detectRepeatedCharacters(password);

    const weaknesses = [];
    const suggestions = [];

    // Length rating & checks
    let lengthRating = 'Weak';
    if (password.length >= 16) lengthRating = 'Optimal (16+ chars)';
    else if (password.length >= 12) lengthRating = 'Good (12+ chars)';
    else if (password.length >= 8) lengthRating = 'Fair (8-11 chars)';
    else {
      lengthRating = 'Critically Short (< 8 chars)';
      weaknesses.push('Password length is under 8 characters, making it vulnerable to instant brute-force attacks.');
      suggestions.push('Increase length to at least 14-16 characters for high resistance.');
    }

    // Character set diversity checks
    let charSetCount = 0;
    if (distribution.uppercase > 0) charSetCount++;
    if (distribution.lowercase > 0) charSetCount++;
    if (distribution.numbers > 0) charSetCount++;
    if (distribution.symbols > 0) charSetCount++;

    if (charSetCount === 1) {
      weaknesses.push('Password relies on a single character set (e.g., only lowercase or only numbers).');
      suggestions.push('Mix uppercase letters, numbers, and special symbols (!@#$).');
    } else if (charSetCount === 2) {
      suggestions.push('Add special symbols or numbers to broaden the character search space.');
    }

    // Pattern warnings
    if (patterns.length > 0) {
      weaknesses.push(`Contains spatial keyboard patterns: "${patterns.join(', ')}".`);
      suggestions.push('Avoid sequential keyboard keys like "qwerty", "asdf", or "1234".');
    }

    if (dictionaryWords.length > 0) {
      weaknesses.push(`Contains common dictionary words: "${dictionaryWords.join(', ')}".`);
      suggestions.push('Avoid un-transformed dictionary words; blend them with symbols or initials.');
    }

    if (repeatedChars.length > 0) {
      weaknesses.push(`Contains repeated character blocks: "${repeatedChars.join(', ')}".`);
      suggestions.push('Avoid repeating identical characters consecutively.');
    }

    if (weaknesses.length === 0 && strength.scoreStep >= 3) {
      suggestions.push('Your password exhibits strong entropy and structure! Ensure you use a unique password for each service.');
    }

    // Generate improved recommended password preserving structure
    const recommendedPassword = generateImprovedRecommendation(password);

    return {
      isEmpty: false,
      entropy,
      crackTime,
      strength,
      memorabilityScore,
      distribution,
      weaknesses,
      suggestions,
      patterns,
      dictionaryWords,
      repeatedChars,
      lengthRating,
      recommendedPassword
    };
  }

  /**
   * Preserves user's structural cues while dramatically upgrading security
   */
  function generateImprovedRecommendation(originalPassword) {
    if (!originalPassword) return '';
    
    // Use memorable word transformation if single word, or initialism if sentence, else smart salt
    if (originalPassword.trim().includes(' ')) {
      return exports.Transformations.transformPhrase(originalPassword, 18).password;
    } else {
      return exports.Transformations.transformMemorableWord(originalPassword, 16).password;
    }
  }

  exports.Analysis = {
    analyzePassword,
    generateImprovedRecommendation
  };

})(window.CastlePassword);
