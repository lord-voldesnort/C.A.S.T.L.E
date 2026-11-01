/*
 * JWT Claims and Token Metadata Analyzer.
 * Extracts standard claims, formats times, and runs heuristic scans for sensitive fields.
 */

window.CastleJwtClaims = window.CastleJwtClaims || {};

(function(exports) {
  'use strict';

  // Standard JWT Claims Metadata
  const STANDARD_CLAIMS = {
    iss: {
      name: "Issuer (iss)",
      desc: "Identifies the party that issued the JWT. In a real system, the recipient must check that this matches a trusted issuer."
    },
    sub: {
      name: "Subject (sub)",
      desc: "Identifies the subject of the JWT (usually the user ID or unique account identifier)."
    },
    aud: {
      name: "Audience (aud)",
      desc: "Identifies the recipients that the JWT is intended for. The receiving service should verify that this matches its own identity."
    },
    exp: {
      name: "Expiration Time (exp)",
      desc: "Identifies the exact time on or after which the JWT must not be accepted for processing."
    },
    nbf: {
      name: "Not Before (nbf)",
      desc: "Identifies the time before which the JWT must not be accepted for processing."
    },
    iat: {
      name: "Issued At (iat)",
      desc: "Identifies the exact time at which the JWT was created. Used to determine the token's age."
    },
    jti: {
      name: "JWT ID (jti)",
      desc: "A unique identifier for the token. Used to prevent replay attacks by ensuring a token is only processed once."
    }
  };

  // Case-insensitive list of potentially sensitive fields to scan for
  const SENSITIVE_KEYS = [
    'password', 'passwd', 'secret', 'credit_card', 'card_number',
    'api_key', 'private_key', 'ssn', 'ccv', 'cvv', 'pin'
  ];

  // Translates epoch timestamps to a user-friendly date string
  function formatEpoch(seconds) {
    if (typeof seconds !== 'number') return 'Invalid time';
    try {
      const date = new Date(seconds * 1000);
      return date.toLocaleString();
    } catch (_) {
      return 'Invalid date';
    }
  }

  // Formats time remaining or elapsed for expiration
  function formatExpiration(expSeconds) {
    const nowSecs = Math.floor(Date.now() / 1000);
    const diff = expSeconds - nowSecs;
    const absDiff = Math.abs(diff);

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

    if (diff >= 0) {
      return `Expires in ${amount} ${unit}`;
    } else {
      return `Expired ${amount} ${unit} ago`;
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
        if (typeof obj[key] === 'object') {
          search(obj[key]);
        }
      }
    }

    search(payload);
    return found;
  }

  // Explains all standard claims found in the payload
  function analyzeClaims(payload) {
    const claimsAnalysis = [];
    if (!payload || typeof payload !== 'object') return claimsAnalysis;

    for (const claimKey of Object.keys(STANDARD_CLAIMS)) {
      if (claimKey in payload) {
        const val = payload[claimKey];
        let humanValue = String(val);

        // Enhance dates for time claims
        if (['exp', 'iat', 'nbf'].includes(claimKey) && typeof val === 'number') {
          humanValue = `${val} (${formatEpoch(val)})`;
        }

        claimsAnalysis.push({
          key: claimKey,
          name: STANDARD_CLAIMS[claimKey].name,
          desc: STANDARD_CLAIMS[claimKey].desc,
          value: val,
          formatted: humanValue
        });
      }
    }

    return claimsAnalysis;
  }

  // Export methods
  exports.formatEpoch = formatEpoch;
  exports.formatExpiration = formatExpiration;
  exports.scanSensitiveFields = scanSensitiveFields;
  exports.analyzeClaims = analyzeClaims;

})(window.CastleJwtClaims);
