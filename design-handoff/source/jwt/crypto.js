/*
 * JWT Cryptographic Core and Parsing Engine.
 * This file processes all tokens locally in the browser and makes zero network requests.
 *
 * Regression contract verified in Chromium:
 * - HS256 Vector:
 *   - Secret: "castle-secret-key-123456"
 *   - Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYXN0bGUxMjMiLCJuYW1lIjoiQ2FzdGxlIFVzZXIiLCJhZG1pbiI6dHJ1ZX0.2JUujVWYvjXLwvFPO5KBrkUqviDMGTjLnaNgZ6Btofc"
 *   - Signature: "2JUujVWYvjXLwvFPO5KBrkUqviDMGTjLnaNgZ6Btofc"
 * - HS384 Vector:
 *   - Secret: "castle-secret-key-123456"
 *   - Token: "eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYXN0bGUxMjMiLCJuYW1lIjoiQ2FzdGxlIFVzZXIiLCJhZG1pbiI6dHJ1ZX0.Yrg_CLrmNv2As6G5IBW-6bEuWvtiv7vJTxyPeGqC2eZ20nBOeJVKpDExs4AoayIq"
 *   - Signature: "Yrg_CLrmNv2As6G5IBW-6bEuWvtiv7vJTxyPeGqC2eZ20nBOeJVKpDExs4AoayIq"
 * - HS512 Vector:
 *   - Secret: "castle-secret-key-123456"
 *   - Token: "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYXN0bGUxMjMiLCJuYW1lIjoiQ2FzdGxlIFVzZXIiLCJhZG1pbiI6dHJ1ZX0.UvpHrr_ZHq_ozLONrwO6o8atTRG8wWiNNiuwj2NmLf7vZyh3CpuqEBbx5EQxj4JCwcW5IjPKnVS9G1NgrzfXLg"
 *   - Signature: "UvpHrr_ZHq_ozLONrwO6o8atTRG8wWiNNiuwj2NmLf7vZyh3CpuqEBbx5EQxj4JCwcW5IjPKnVS9G1NgrzfXLg"
 *
 * Shared dependency: js/ui/tooltip.js provides the click/tap tooltip used by
 * this module's anatomy component. Re-test both click and touch/tap behavior here
 * whenever that shared component changes.
 */

window.CastleJwtCrypto = window.CastleJwtCrypto || {};

(function(exports) {
  'use strict';

  // Constants
  const MAX_INPUT_SIZE = 1024 * 1024; // 1MB size limit safeguard

  // Base64URL Encoding & Decoding
  function base64UrlDecodeToBytes(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
  }

  function base64UrlDecode(str) {
    const bytes = base64UrlDecodeToBytes(str);
    return new TextDecoder().decode(bytes);
  }

  function bytesToBase64(bytes) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function bytesToBase64Url(bytes) {
    return bytesToBase64(bytes)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  function stringToBase64Url(str) {
    const bytes = new TextEncoder().encode(str);
    return bytesToBase64Url(bytes);
  }

  // Strict JSON parser that flags duplicate keys
  function parseJsonDetectDuplicates(str, locationName) {
    let index = 0;
    const duplicates = [];

    function skipWhitespace() {
      while (index < str.length && /\s/.test(str[index])) {
        index++;
      }
    }

    function parseValue() {
      skipWhitespace();
      if (index >= str.length) throw new Error(`Unexpected end of JSON in ${locationName}`);
      const char = str[index];
      if (char === '{') return parseObject();
      if (char === '[') return parseArray();
      if (char === '"') return parseString();
      if (char === 't' || char === 'f' || char === 'n') return parseLiteral();
      if (char === '-' || (char >= '0' && char <= '9')) return parseNumber();
      throw new Error(`Unexpected character '${char}' in ${locationName} JSON`);
    }

    function parseObject() {
      index++; // skip '{'
      const obj = {};
      const keysSeen = new Set();
      skipWhitespace();
      if (str[index] === '}') {
        index++;
        return obj;
      }
      while (true) {
        skipWhitespace();
        if (str[index] !== '"') {
          throw new Error(`Expected string key in ${locationName} object JSON`);
        }
        const key = parseString();
        skipWhitespace();
        if (str[index] !== ':') {
          throw new Error(`Expected ':' after key in ${locationName} object JSON`);
        }
        index++; // skip ':'
        const val = parseValue();
        if (keysSeen.has(key)) {
          duplicates.push(key);
        } else {
          keysSeen.add(key);
        }
        obj[key] = val;
        skipWhitespace();
        if (str[index] === '}') {
          index++;
          break;
        }
        if (str[index] !== ',') {
          throw new Error(`Expected ',' or '}' in ${locationName} object JSON`);
        }
        index++; // skip ','
      }
      return obj;
    }

    function parseArray() {
      index++; // skip '['
      const arr = [];
      skipWhitespace();
      if (str[index] === ']') {
        index++;
        return arr;
      }
      while (true) {
        arr.push(parseValue());
        skipWhitespace();
        if (str[index] === ']') {
          index++;
          break;
        }
        if (str[index] !== ',') {
          throw new Error(`Expected ',' or ']' in ${locationName} array JSON`);
        }
        index++; // skip ','
      }
      return arr;
    }

    function parseString() {
      index++; // skip '"'
      let res = "";
      while (index < str.length) {
        const char = str[index];
        if (char === '"') {
          index++;
          return res;
        }
        if (char === '\\') {
          index++;
          if (index >= str.length) throw new Error(`Unterminated string escape in ${locationName} JSON`);
          const esc = str[index];
          if (esc === '"' || esc === '\\' || esc === '/') res += esc;
          else if (esc === 'b') res += '\b';
          else if (esc === 'f') res += '\f';
          else if (esc === 'n') res += '\n';
          else if (esc === 'r') res += '\r';
          else if (esc === 't') res += '\t';
          else if (esc === 'u') {
            const code = str.substring(index + 1, index + 5);
            if (!/^[0-9a-fA-F]{4}$/.test(code)) throw new Error(`Invalid unicode escape in ${locationName} JSON`);
            res += String.fromCharCode(parseInt(code, 16));
            index += 4;
          } else {
            res += esc;
          }
        } else {
          res += char;
        }
        index++;
      }
      throw new Error(`Unterminated string in ${locationName} JSON`);
    }

    function parseLiteral() {
      if (str.startsWith("true", index)) { index += 4; return true; }
      if (str.startsWith("false", index)) { index += 5; return false; }
      if (str.startsWith("null", index)) { index += 4; return null; }
      throw new Error(`Invalid literal at index ${index} in ${locationName} JSON`);
    }

    function parseNumber() {
      const start = index;
      if (str[index] === '-') index++;
      while (index < str.length && ((str[index] >= '0' && str[index] <= '9') || str[index] === '.' || str[index] === 'e' || str[index] === 'E' || str[index] === '+' || str[index] === '-')) {
        index++;
      }
      const numStr = str.substring(start, index);
      const num = Number(numStr);
      if (isNaN(num)) throw new Error(`Invalid number '${numStr}' in ${locationName} JSON`);
      return num;
    }

    const result = parseValue();
    skipWhitespace();
    if (index < str.length) {
      throw new Error(`Trailing data in ${locationName} JSON`);
    }
    return { result, duplicates };
  }

  // Parse a JWT token string with validations
  function parseJwt(tokenString) {
    if (!tokenString) {
      throw new Error("No token provided.");
    }
    
    // Trim leading/trailing whitespace
    const token = tokenString.trim();

    if (token.length > MAX_INPUT_SIZE) {
      throw new Error("This input is unusually large for a JWT — Castle limits input size to keep the browser responsive");
    }

    // A JWT must have exactly 3 dot-separated segments
    const segments = token.split('.');
    if (segments.length !== 3) {
      throw new Error("Invalid JWT structure: A token must have exactly 3 segments separated by dots.");
    }

    const base64UrlPattern = /^[A-Za-z0-9_-]*$/;
    for (let i = 0; i < segments.length; i++) {
      if (!base64UrlPattern.test(segments[i])) {
        throw new Error(`Invalid JWT structure: Segment ${i + 1} contains unexpected characters (whitespaces or non-base64url characters).`);
      }
    }

    if (!segments[0]) throw new Error("Invalid JWT structure: Header segment is empty.");
    if (!segments[1]) throw new Error("Invalid JWT structure: Payload segment is empty.");

    // Decode header
    let headerText;
    try {
      headerText = base64UrlDecode(segments[0]);
    } catch (_) {
      throw new Error("Malformed JWT header: Failed to Base64URL-decode.");
    }

    // Decode payload
    let payloadText;
    try {
      payloadText = base64UrlDecode(segments[1]);
    } catch (_) {
      throw new Error("Malformed JWT payload: Failed to Base64URL-decode.");
    }

    // Parse header JSON and detect duplicates
    let headerParsed, headerDuplicates;
    try {
      const headerRes = parseJsonDetectDuplicates(headerText, "header");
      headerParsed = headerRes.result;
      headerDuplicates = headerRes.duplicates;
    } catch (e) {
      throw new Error(`Malformed JWT header JSON: ${e.message}`);
    }

    // Parse payload JSON and detect duplicates
    let payloadParsed, payloadDuplicates;
    try {
      const payloadRes = parseJsonDetectDuplicates(payloadText, "payload");
      payloadParsed = payloadRes.result;
      payloadDuplicates = payloadRes.duplicates;
    } catch (e) {
      throw new Error(`Malformed JWT payload JSON: ${e.message}`);
    }

    return {
      header: headerParsed,
      payload: payloadParsed,
      headerDuplicates,
      payloadDuplicates,
      signatureBase64Url: segments[2],
      headerBase64Url: segments[0],
      payloadBase64Url: segments[1],
      headerRaw: headerText,
      payloadRaw: payloadText
    };
  }

  // Single HMAC implementation for signing & verification
  async function signHmac(headerObj, payloadObj, secretStr, alg) {
    if (!secretStr) {
      throw new Error("Secret is required for signing.");
    }
    if (!['HS256', 'HS384', 'HS512'].includes(alg)) {
      throw new Error(`Unsupported signing algorithm: ${alg}`);
    }

    const headerJson = JSON.stringify(headerObj);
    const payloadJson = JSON.stringify(payloadObj);

    const headerB64 = stringToBase64Url(headerJson);
    const payloadB64 = stringToBase64Url(payloadJson);
    const signingInput = `${headerB64}.${payloadB64}`;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretStr);
    const inputBytes = encoder.encode(signingInput);

    const hashName = {
      'HS256': 'SHA-256',
      'HS384': 'SHA-384',
      'HS512': 'SHA-512'
    }[alg];

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: hashName },
      false,
      ['sign']
    );

    const signatureBuffer = await window.crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      inputBytes
    );

    const signatureB64 = bytesToBase64Url(new Uint8Array(signatureBuffer));
    return `${signingInput}.${signatureB64}`;
  }

  async function verifyHmac(headerB64, payloadB64, signatureB64, secretStr, alg) {
    if (!secretStr) {
      throw new Error("Secret is required for verification.");
    }
    if (!['HS256', 'HS384', 'HS512'].includes(alg)) {
      throw new Error(`Unsupported verification algorithm: ${alg}`);
    }

    const signingInput = `${headerB64}.${payloadB64}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretStr);
    const inputBytes = encoder.encode(signingInput);
    
    let sigBytes;
    try {
      sigBytes = base64UrlDecodeToBytes(signatureB64);
    } catch (_) {
      return false;
    }

    const hashName = {
      'HS256': 'SHA-256',
      'HS384': 'SHA-384',
      'HS512': 'SHA-512'
    }[alg];

    try {
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: hashName },
        false,
        ['verify']
      );

      return await window.crypto.subtle.verify(
        'HMAC',
        cryptoKey,
        sigBytes,
        inputBytes
      );
    } catch (_) {
      return false;
    }
  }

  // Expose API
  exports.parseJwt = parseJwt;
  exports.signHmac = signHmac;
  exports.verifyHmac = verifyHmac;
  exports.stringToBase64Url = stringToBase64Url;
  exports.base64UrlDecode = base64UrlDecode;
  exports.base64UrlDecodeToBytes = base64UrlDecodeToBytes;
  exports.MAX_INPUT_SIZE = MAX_INPUT_SIZE;

})(window.CastleJwtCrypto);
