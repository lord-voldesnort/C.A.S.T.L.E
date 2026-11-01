/*
 * JWT Claims Analysis and Translation.
 * Provides human-readable explanations of standard claims,
 * detects potential sensitive fields, formats timestamps,
 * and validates claims policy (exp, nbf, iss, aud) with optional clock-skew leeway.
 */

window.CastleJwtClaims = window.CastleJwtClaims || {};

(function(exports) {
  'use strict';

  // Standard registered claims according to RFC 7519
  const STANDARD_CLAIMS = {
    iss: {
      name: "Issuer (iss)",
      desc: "Identifies the principal that issued the JWT. In identity systems, this is usually an auth server URL.",
      isDate: false
    },
    sub: {
      name: "Subject (sub)",
      desc: "Identifies the principal that is the subject of the JWT (e.g., user ID, account number, or client ID).",
      isDate: false
    },
    aud: {
      name: "Audience (aud)",
      desc: "Identifies the recipients that the JWT is intended for. The receiving service must identify itself with this value.",
      isDate: false
    },
    exp: {
      name: "Expiration Time (exp)",
      desc: "Identifies the expiration time on or after which the JWT MUST NOT be accepted for processing.",
      isDate: true
    },
    nbf: {
      name: "Not Before (nbf)",
      desc: "Identifies the time before which the JWT MUST NOT be accepted for processing.",
      isDate: true
    },
    iat: {
      name: "Issued At (iat)",
      desc: "Identifies the time at which the JWT was issued. Used to determine the age of the token.",
      isDate: true
    },
    jti: {
      name: "JWT ID (jti)",
      desc: "Provides a unique identifier for the JWT. Can be used to prevent the JWT from being replayed.",
      isDate: false
    }
  };

  // Common sensitive parameter names that should NEVER appear in plaintext JWT payloads
  const SENSITIVE_KEYS = [
    'password', 'pass', 'pwd', 'secret', 'apikey', 'api_key', 'token',
    'privatekey', 'private_key', 'ssn', 'socialsecurity', 'creditcard',
    'credit_card', 'cc_num', 'cvv', 'pin', 'auth_token', 'access_token'
  ];

  // Context-aware HTML entity escaping utility to prevent DOM-based XSS
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Translates epoch timestamps to a user-friendly date string
  function formatEpoch(seconds) {
    if (typeof seconds !== 'number' || !isFinite(seconds) || seconds < 0) return 'Invalid timestamp';
    try {
      const date = new Date(seconds * 1000);
      return date.toLocaleString();
    } catch (_) {
      return 'Invalid date';
    }
  }

  // Validates an RFC 7519 NumericDate value (returns boolean)
  function validateNumericDate(val) {
    return typeof val === 'number' && isFinite(val) && !isNaN(val) && val >= 0;
  }

  // Helper for human-readable time intervals
  function formatRelativeInterval(diffSecs) {
    const absDiff = Math.abs(diffSecs);
    let unit = "";
    let amount = 0;

    if (absDiff < 60) {
      amount = absDiff;
      unit = amount === 1 ? "second" : "seconds";
    } else if (absDiff < 3600) {
      amount = Math.round(absDiff / 60);
      unit = amount === 1 ? "minute" : "minutes";
    } else if (absDiff < 86400) {
      amount = Math.round(absDiff / 3600);
      unit = amount === 1 ? "hour" : "hours";
    } else {
      amount = Math.round(absDiff / 86400);
      unit = amount === 1 ? "day" : "days";
    }
    return `${amount} ${unit}`;
  }

  // Formats time remaining or elapsed for expiration
  function formatExpiration(expSeconds) {
    if (!validateNumericDate(expSeconds)) return 'Invalid exp timestamp';
    const nowSecs = Math.floor(Date.now() / 1000);
    const diff = expSeconds - nowSecs;
    const intervalStr = formatRelativeInterval(diff);

    if (diff >= 0) {
      return `Expires in ${intervalStr}`;
    } else {
      return `Expired ${intervalStr} ago`;
    }
  }

  // Formats time remaining or elapsed for Not Before (nbf)
  function formatNotBefore(nbfSeconds) {
    if (!validateNumericDate(nbfSeconds)) return 'Invalid nbf timestamp';
    const nowSecs = Math.floor(Date.now() / 1000);
    const diff = nbfSeconds - nowSecs;
    const intervalStr = formatRelativeInterval(diff);

    if (diff > 0) {
      return `Not yet valid (active in ${intervalStr})`;
    } else {
      return `Active (valid since ${intervalStr} ago)`;
    }
  }

  // Scans the payload object recursively to find any potentially sensitive keys
  function scanSensitiveFields(payload) {
    const found = [];

    function search(obj) {
      if (!obj || typeof obj !== 'object') return;
      for (const key of Object.keys(obj)) {
        if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
          found.push(key);
        }
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          search(obj[key]);
        }
      }
    }

    search(payload);
    return Array.from(new Set(found));
  }

  // Analyzes payload claims and returns an array of explained items
  function analyzeClaims(payload) {
    if (!payload || typeof payload !== 'object') return [];

    const claimsAnalysis = [];
    const nowSecs = Math.floor(Date.now() / 1000);

    for (const [key, meta] of Object.entries(STANDARD_CLAIMS)) {
      if (key in payload) {
        const rawVal = payload[key];
        let formattedVal = "";
        let timeWarning = null;

        if (meta.isDate) {
          if (!validateNumericDate(rawVal)) {
            formattedVal = `Malformed timestamp (${String(rawVal)})`;
            timeWarning = "Claim value must be a non-negative numeric epoch timestamp.";
          } else {
            formattedVal = formatEpoch(rawVal);
            if (key === 'exp') {
              formattedVal += ` (${formatExpiration(rawVal)})`;
              if (rawVal < nowSecs) {
                timeWarning = "This token has expired.";
              }
            } else if (key === 'nbf') {
              formattedVal += ` (${formatNotBefore(rawVal)})`;
              if (rawVal > nowSecs) {
                timeWarning = "This token is not yet valid.";
              }
            } else if (key === 'iat') {
              const ageSecs = nowSecs - rawVal;
              if (ageSecs >= 0) {
                formattedVal += ` (${formatRelativeInterval(ageSecs)} ago)`;
              } else {
                formattedVal += ` (in the future)`;
              }
            }
          }
        } else {
          if (typeof rawVal === 'object' && rawVal !== null) {
            formattedVal = JSON.stringify(rawVal);
          } else {
            formattedVal = String(rawVal);
          }
        }

        claimsAnalysis.push({
          key: key,
          name: meta.name,
          desc: meta.desc,
          raw: rawVal,
          formatted: formattedVal,
          warning: timeWarning
        });
      }
    }

    return claimsAnalysis;
  }

  // Validates claims policy (exp, nbf, iss, aud) with optional clock-skew leeway
  function validatePolicy(payload, options = {}) {
    const nowSecs = Math.floor(Date.now() / 1000);
    const leeway = Math.max(0, parseInt(options.leewaySeconds, 10) || parseInt(options.leeway, 10) || 0);
    const expectedIss = (options.expectedIss || '').trim();
    const expectedAud = (options.expectedAud || '').trim();

    const passed = [];
    const failures = [];
    const checks = [];

    if (!payload || typeof payload !== 'object') {
      failures.push({ check: "structure", message: "Invalid payload object" });
      return {
        valid: false,
        passed,
        failures,
        checks: ["structure"],
        expStatus: 'invalid',
        expMessage: "Invalid payload object",
        nbfStatus: 'invalid',
        nbfMessage: "Invalid payload object",
        issMatch: false,
        issMessage: "Invalid payload object",
        audMatch: false,
        audMessage: "Invalid payload object"
      };
    }

    let expStatus = null;
    let expMessage = '';
    if ('exp' in payload) {
      checks.push("exp");
      if (!validateNumericDate(payload.exp)) {
        expStatus = 'invalid';
        expMessage = 'Invalid exp claim: timestamp must be a valid non-negative epoch number';
        failures.push({ check: 'exp', message: expMessage });
      } else {
        const expVal = payload.exp;
        if (nowSecs > expVal + leeway) {
          expStatus = 'expired';
          expMessage = formatExpiration(expVal);
          failures.push({ check: 'exp', message: expMessage });
        } else if (nowSecs > expVal) {
          expStatus = 'near-expiry';
          expMessage = `${formatExpiration(expVal)} (allowed within ${leeway}s clock-skew leeway)`;
          passed.push(expMessage);
        } else {
          expStatus = 'valid';
          expMessage = formatExpiration(expVal);
          passed.push(`Expiration: ${expMessage}`);
        }
      }
    }

    let nbfStatus = null;
    let nbfMessage = '';
    if ('nbf' in payload) {
      checks.push("nbf");
      if (!validateNumericDate(payload.nbf)) {
        nbfStatus = 'invalid';
        nbfMessage = 'Invalid nbf claim: timestamp must be a valid non-negative epoch number';
        failures.push({ check: 'nbf', message: nbfMessage });
      } else {
        const nbfVal = payload.nbf;
        if (nowSecs < nbfVal - leeway) {
          nbfStatus = 'future';
          nbfMessage = formatNotBefore(nbfVal);
          failures.push({ check: 'nbf', message: nbfMessage });
        } else if (nowSecs < nbfVal) {
          nbfStatus = 'valid';
          nbfMessage = `${formatNotBefore(nbfVal)} (allowed within ${leeway}s clock-skew leeway)`;
          passed.push(nbfMessage);
        } else {
          nbfStatus = 'valid';
          nbfMessage = formatNotBefore(nbfVal);
          passed.push(`Not-before: ${nbfMessage}`);
        }
      }
    }

    let issMatch = null;
    let issMessage = '';
    if (expectedIss) {
      checks.push("iss");
      if (!payload.iss) {
        issMatch = false;
        issMessage = `Missing expected issuer: '${expectedIss}'`;
        failures.push({ check: 'iss', message: issMessage });
      } else if (payload.iss === expectedIss) {
        issMatch = true;
        issMessage = `Issuer matches: '${expectedIss}'`;
        passed.push(issMessage);
      } else {
        issMatch = false;
        issMessage = `Issuer mismatch: expected '${expectedIss}', got '${payload.iss}'`;
        failures.push({ check: 'iss', message: issMessage });
      }
    }

    let audMatch = null;
    let audMessage = '';
    if (expectedAud) {
      checks.push("aud");
      if (!payload.aud) {
        audMatch = false;
        audMessage = `Missing expected audience: '${expectedAud}'`;
        failures.push({ check: 'aud', message: audMessage });
      } else if (typeof payload.aud === 'string') {
        if (payload.aud === expectedAud) {
          audMatch = true;
          audMessage = `Audience matches: '${expectedAud}'`;
          passed.push(audMessage);
        } else {
          audMatch = false;
          audMessage = `Audience mismatch: expected '${expectedAud}', got '${payload.aud}'`;
          failures.push({ check: 'aud', message: audMessage });
        }
      } else if (Array.isArray(payload.aud)) {
        if (payload.aud.includes(expectedAud)) {
          audMatch = true;
          audMessage = `Audience matches: '${expectedAud}' found in array`;
          passed.push(audMessage);
        } else {
          audMatch = false;
          audMessage = `Audience mismatch: expected '${expectedAud}' not in array [${payload.aud.join(', ')}]`;
          failures.push({ check: 'aud', message: audMessage });
        }
      } else {
        audMatch = false;
        audMessage = `Audience is not a valid string or array`;
        failures.push({ check: 'aud', message: audMessage });
      }
    }

    return {
      valid: failures.length === 0,
      checks,
      passed,
      failures,
      expStatus,
      expMessage,
      nbfStatus,
      nbfMessage,
      issMatch,
      issMessage,
      audMatch,
      audMessage
    };
  }

  // Export methods
  exports.escapeHtml = escapeHtml;
  exports.formatEpoch = formatEpoch;
  exports.formatExpiration = formatExpiration;
  exports.formatNotBefore = formatNotBefore;
  exports.validateNumericDate = validateNumericDate;
  exports.scanSensitiveFields = scanSensitiveFields;
  exports.analyzeClaims = analyzeClaims;
  exports.validatePolicy = validatePolicy;

})(window.CastleJwtClaims);
