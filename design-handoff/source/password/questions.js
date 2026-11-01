/**
 * Castle Cybersecurity Toolbox - Memory Assisted Prompt Question Library
 * Curated, privacy-safe prompts for conversational password generation.
 * NEVER requests sensitive information (passwords, PINs, OTPs, financial IDs, national IDs).
 */

window.CastlePassword = window.CastlePassword || {};

(function(exports) {
  'use strict';

  // Master Prompt Library categorized for intuitive memory anchors
  const PROMPT_LIBRARY = [
    {
      id: 'place',
      category: 'A place you remember',
      icon: 'location_city',
      question: 'What is a city or landmark that holds a fond memory for you?',
      placeholder: 'e.g., Kyoto, Brooklyn Bridge, Nainital'
    },
    {
      id: 'hobby',
      category: 'A hobby',
      icon: 'palette',
      question: 'What is a hobby or creative passion you enjoy?',
      placeholder: 'e.g., Photography, Stargazing, Baking'
    },
    {
      id: 'sport',
      category: 'A favourite sport',
      icon: 'sports_soccer',
      question: 'What is a sport or physical activity you love watching or playing?',
      placeholder: 'e.g., Cricket, Tennis, Cycling'
    },
    {
      id: 'movie',
      category: 'A movie',
      icon: 'movie',
      question: 'What is a movie or film title you can watch over and over?',
      placeholder: 'e.g., Inception, Interstellar, Matrix'
    },
    {
      id: 'character',
      category: 'A fictional character',
      icon: 'smart_toy',
      question: 'Who is a memorable fictional character from books, comics, or TV?',
      placeholder: 'e.g., Sherlock, Gandalf, Batman'
    },
    {
      id: 'event',
      category: 'A memorable event',
      icon: 'celebration',
      question: 'What is a memorable event or milestone in your life?',
      placeholder: 'e.g., Graduation, Concert, First job'
    },
    {
      id: 'colour',
      category: 'A colour',
      icon: 'format_paint',
      question: 'What is your favourite or go-to colour shade?',
      placeholder: 'e.g., Sapphire, Crimson, Emerald'
    },
    {
      id: 'season',
      category: 'A season',
      icon: 'thermostat',
      question: 'Which season of the year makes you feel most alive?',
      placeholder: 'e.g., Autumn, Monsoon, Winter'
    },
    {
      id: 'year',
      category: 'A meaningful year',
      icon: 'calendar_today',
      question: 'What is a positive year or year digit that stands out to you?',
      placeholder: 'e.g., 2018, 1999, 2024'
    },
    {
      id: 'number',
      category: 'A lucky number',
      icon: 'pin',
      question: 'What is a double or triple digit lucky number for you?',
      placeholder: 'e.g., 77, 42, 808'
    },
    {
      id: 'food',
      category: 'A favourite food',
      icon: 'restaurant',
      question: 'What is a comfort food, dish, or beverage you love?',
      placeholder: 'e.g., Espresso, Ramen, Tacos'
    },
    {
      id: 'animal',
      category: 'A favourite animal',
      icon: 'pets',
      question: 'What is an animal or creature you admire?',
      placeholder: 'e.g., Falcon, Panther, Dolphin'
    },
    {
      id: 'game',
      category: 'A favourite game',
      icon: 'sports_esports',
      question: 'What is a video game or board game you enjoy playing?',
      placeholder: 'e.g., Chess, Zelda, Minecraft'
    },
    {
      id: 'trip',
      category: 'A memorable trip',
      icon: 'flight_takeoff',
      question: 'What is a scenic destination or landscape from a trip?',
      placeholder: 'e.g., Alps, Kerala, Yosemite'
    },
    {
      id: 'subject',
      category: 'A favourite subject',
      icon: 'menu_book',
      question: 'What is an academic subject or topic you find fascinating?',
      placeholder: 'e.g., Astrophysics, History, Robotics'
    }
  ];

  // Sensitive keywords to prevent user from entering confidential credentials
  const FORBIDDEN_KEYWORDS = [
    'password', 'passcode', 'pin', 'otp', 'cvv', 'card', 'credit', 'debit',
    'bank', 'aadhaar', 'pan', 'ssn', 'account', 'secret', 'key'
  ];

  /**
   * Selects N random questions without duplicates
   */
  function getRandomPrompts(count = 4) {
    const safeCount = Math.max(3, Math.min(5, count));
    const shuffled = [...PROMPT_LIBRARY].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, safeCount);
  }

  /**
   * Validates user input to prevent sensitive data entry
   */
  function isSafeAnswer(answer) {
    if (!answer || typeof answer !== 'string') return false;
    const clean = answer.trim().toLowerCase();
    
    // Reject empty or very short strings
    if (clean.length === 0) return false;

    // Check for forbidden sensitive keywords
    const containsForbidden = FORBIDDEN_KEYWORDS.some(kw => clean.includes(kw));
    if (containsForbidden) return false;

    // Reject raw credit card numbers or 16-digit patterns
    if (/^\d{12,19}$/.test(clean.replace(/\s+/g, ''))) return false;

    return true;
  }

  exports.Questions = {
    PROMPT_LIBRARY,
    getRandomPrompts,
    isSafeAnswer
  };

})(window.CastlePassword);
