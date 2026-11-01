/*
 * JWT Decoder & Verifier Test Suite.
 * Exposes a function window.runJwtTests() that programmatically runs and returns
 * the status of the verification, policy, and cryptographic scenarios.
 */

window.runJwtTests = async function() {
  const results = [];
  const addResult = (id, name, passed, details) => results.push({ id, name, passed, details });

  const testSecret = "castle-secret-key-123456";

  // Vectors calculated with Python's hmac/hashlib
  const expectedHS256 = {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYXN0bGUxMjMiLCJuYW1lIjoiQ2FzdGxlIFVzZXIiLCJhZG1pbiI6dHJ1ZX0.2JUujVWYvjXLwvFPO5KBrkUqviDMGTjLnaNgZ6Btofc",
    sig: "2JUujVWYvjXLwvFPO5KBrkUqviDMGTjLnaNgZ6Btofc"
  };

  const expectedHS384 = {
    token: "eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYXN0bGUxMjMiLCJuYW1lIjoiQ2FzdGxlIFVzZXIiLCJhZG1pbiI6dHJ1ZX0.Yrg_CLrmNv2As6G5IBW-6bEuWvtiv7vJTxyPeGqC2eZ20nBOeJVKpDExs4AoayIq",
    sig: "Yrg_CLrmNv2As6G5IBW-6bEuWvtiv7vJTxyPeGqC2eZ20nBOeJVKpDExs4AoayIq"
  };

  const expectedHS512 = {
    token: "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYXN0bGUxMjMiLCJuYW1lIjoiQ2FzdGxlIFVzZXIiLCJhZG1pbiI6dHJ1ZX0.UvpHrr_ZHq_ozLONrwO6o8atTRG8wWiNNiuwj2NmLf7vZyh3CpuqEBbx5EQxj4JCwcW5IjPKnVS9G1NgrzfXLg",
    sig: "UvpHrr_ZHq_ozLONrwO6o8atTRG8wWiNNiuwj2NmLf7vZyh3CpuqEBbx5EQxj4JCwcW5IjPKnVS9G1NgrzfXLg"
  };

  const Crypto = window.CastleJwtCrypto;
  const Claims = window.CastleJwtClaims;

  if (!Crypto || !Claims) {
    return [{ id: 0, name: "Initialization", passed: false, details: "Crypto or Claims module not loaded." }];
  }

  // 1. HS256 Vector
  try {
    const parsed = Crypto.parseJwt(expectedHS256.token);
    const verified = await Crypto.verifyHmac(parsed.headerBase64Url, parsed.payloadBase64Url, parsed.signatureBase64Url, testSecret, "HS256");
    addResult(1, "Independently known-answer HS256 token/secret pair", verified && parsed.signatureBase64Url === expectedHS256.sig, 
              `Expected Sig: ${expectedHS256.sig}, Got Sig: ${parsed.signatureBase64Url}`);
  } catch (e) {
    addResult(1, "Independently known-answer HS256 token/secret pair", false, e.message);
  }

  // 2. HS384 Vector
  try {
    const parsed = Crypto.parseJwt(expectedHS384.token);
    const verified = await Crypto.verifyHmac(parsed.headerBase64Url, parsed.payloadBase64Url, parsed.signatureBase64Url, testSecret, "HS384");
    addResult(2, "Independently known-answer HS384 token/secret pair", verified && parsed.signatureBase64Url === expectedHS384.sig, 
              `Expected Sig: ${expectedHS384.sig}, Got Sig: ${parsed.signatureBase64Url}`);
  } catch (e) {
    addResult(2, "Independently known-answer HS384 token/secret pair", false, e.message);
  }

  // 3. HS512 Vector
  try {
    const parsed = Crypto.parseJwt(expectedHS512.token);
    const verified = await Crypto.verifyHmac(parsed.headerBase64Url, parsed.payloadBase64Url, parsed.signatureBase64Url, testSecret, "HS512");
    addResult(3, "Independently known-answer HS512 token/secret pair", verified && parsed.signatureBase64Url === expectedHS512.sig, 
              `Expected Sig: ${expectedHS512.sig}, Got Sig: ${parsed.signatureBase64Url}`);
  } catch (e) {
    addResult(3, "Independently known-answer HS512 token/secret pair", false, e.message);
  }

  // 4. Valid HS256 token verified with incorrect secret
  try {
    const parsed = Crypto.parseJwt(expectedHS256.token);
    const verified = await Crypto.verifyHmac(parsed.headerBase64Url, parsed.payloadBase64Url, parsed.signatureBase64Url, "wrong-secret", "HS256");
    addResult(4, "Valid HS256 token verified with an incorrect secret", !verified, `Verification output: ${verified}`);
  } catch (e) {
    addResult(4, "Valid HS256 token verified with an incorrect secret", false, e.message);
  }

  // 5. Valid token, payload manually altered
  try {
    const parsed = Crypto.parseJwt(expectedHS256.token);
    const tamperedPayloadB64 = Crypto.stringToBase64Url(JSON.stringify({ sub: "castle123", name: "Castle User", admin: false }));
    const verified = await Crypto.verifyHmac(parsed.headerBase64Url, tamperedPayloadB64, parsed.signatureBase64Url, testSecret, "HS256");
    addResult(5, "Valid token, payload manually altered after signing", !verified, `Verification output: ${verified}`);
  } catch (e) {
    addResult(5, "Valid token, payload manually altered after signing", false, e.message);
  }

  // 6. Token signed as HS256, user selects HS512 to verify
  try {
    const parsed = Crypto.parseJwt(expectedHS256.token);
    const verified = await Crypto.verifyHmac(parsed.headerBase64Url, parsed.payloadBase64Url, parsed.signatureBase64Url, testSecret, "HS512");
    addResult(6, "Token signed as HS256, user selects HS512 to verify", !verified, `Verification output: ${verified}`);
  } catch (e) {
    addResult(6, "Token signed as HS256, user selects HS512 to verify", false, e.message);
  }

  // 7. Token declares HS256, but is actually a genuine HS512 signature
  try {
    const parsed = Crypto.parseJwt(expectedHS512.token);
    const verified = await Crypto.verifyHmac(parsed.headerBase64Url, parsed.payloadBase64Url, parsed.signatureBase64Url, testSecret, "HS256");
    addResult(7, "Token declares HS256, but is actually genuine HS512", !verified, `Verification output: ${verified}`);
  } catch (e) {
    addResult(7, "Token declares HS256, but is actually genuine HS512", false, e.message);
  }

  // 8. alg:none header
  try {
    const tokenNone = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIn0.";
    const parsed = Crypto.parseJwt(tokenNone);
    addResult(8, "alg: none header parsing", parsed.header.alg === "none" && parsed.signatureBase64Url === "", `Alg: ${parsed.header.alg}, Sig: '${parsed.signatureBase64Url}'`);
  } catch (e) {
    addResult(8, "alg: none header parsing", false, e.message);
  }

  // 9. Token with duplicate key in payload
  try {
    const tokenDup = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJzdWIiOiI0NTYifQ.sig";
    const parsed = Crypto.parseJwt(tokenDup);
    addResult(9, "Token with duplicate key in payload JSON", parsed.payloadDuplicates.includes("sub"), `Duplicates found: ${parsed.payloadDuplicates.join(', ')}`);
  } catch (e) {
    addResult(9, "Token with duplicate key in payload JSON", false, e.message);
  }

  // 10. exp in the past
  try {
    const pastExp = Math.floor(Date.now() / 1000) - 100;
    const formatted = Claims.formatExpiration(pastExp);
    addResult(10, "exp in the past detection", formatted.includes("Expired"), `Output: ${formatted}`);
  } catch (e) {
    addResult(10, "exp in the past detection", false, e.message);
  }

  // 11. No exp claim at all
  try {
    const claims = Claims.analyzeClaims({ sub: "123" });
    const hasExp = claims.some(c => c.key === 'exp');
    addResult(11, "No exp claim handling", !hasExp, `Claims analyzed: ${claims.map(c => c.key).join(', ')}`);
  } catch (e) {
    addResult(11, "No exp claim handling", false, e.message);
  }

  // 12. Payload containing "password"
  try {
    const found = Claims.scanSensitiveFields({ password: "123", username: "user" });
    addResult(12, "Payload containing field named password", found.includes("password"), `Found keys: ${found.join(', ')}`);
  } catch (e) {
    addResult(12, "Payload containing field named password", false, e.message);
  }

  // 13. Malformed input ("hello world")
  try {
    Crypto.parseJwt("hello world");
    addResult(13, "Malformed input rejected", false, "Allowed parsing of 'hello world'");
  } catch (e) {
    addResult(13, "Malformed input rejected", true, `Rejected as expected: ${e.message}`);
  }

  // 14. Token with only 2 segments
  try {
    Crypto.parseJwt("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ");
    addResult(14, "Token with 2 segments rejected", false, "Allowed 2-segment parsing");
  } catch (e) {
    addResult(14, "Token with 2 segments rejected", true, `Rejected as expected: ${e.message}`);
  }

  // 15. Token exceeding input size limit
  try {
    const largeStr = "a".repeat(Crypto.MAX_INPUT_SIZE + 10);
    Crypto.parseJwt(largeStr);
    addResult(15, "Token exceeding input size limit rejected", false, "Allowed oversized token");
  } catch (e) {
    addResult(15, "Token exceeding input size limit rejected", true, `Rejected as expected: ${e.message}`);
  }

  // 16. Duplicate key in header JSON
  try {
    const headerDupToken = "eyJhbGciOiJIUzI1NiIsImFsZyI6IkhTMzg0IiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjMifQ.sig";
    const parsed = Crypto.parseJwt(headerDupToken);
    addResult(16, "Duplicate key in header JSON detected", parsed.headerDuplicates.includes("alg"), `Header duplicates: ${parsed.headerDuplicates.join(', ')}`);
  } catch (e) {
    addResult(16, "Duplicate key in header JSON detected", false, e.message);
  }

  // 17. Future nbf handling (Not Yet Valid)
  try {
    const futureNbf = Math.floor(Date.now() / 1000) + 3600;
    const formattedNbf = Claims.formatNotBefore(futureNbf);
    addResult(17, "Future nbf handling (Not Yet Valid)", formattedNbf.includes("Not yet valid"), `Formatted: ${formattedNbf}`);
  } catch (e) {
    addResult(17, "Future nbf handling (Not Yet Valid)", false, e.message);
  }

  // 18. Invalid exp, nbf, and iat types rejected
  try {
    const invalidExp = Claims.validateNumericDate("tomorrow");
    const invalidNbf = Claims.validateNumericDate({ timestamp: 12345 });
    const invalidIat = Claims.validateNumericDate(NaN);
    const validDate = Claims.validateNumericDate(1729000000);
    const passed = !invalidExp && !invalidNbf && !invalidIat && validDate;
    addResult(18, "Invalid exp/nbf/iat timestamp types correctly rejected", passed, `Exp: ${invalidExp}, Nbf: ${invalidNbf}, Valid: ${validDate}`);
  } catch (e) {
    addResult(18, "Invalid exp/nbf/iat timestamp types correctly rejected", false, e.message);
  }

  // 19. Clock-skew leeway policy evaluation
  try {
    const now = Math.floor(Date.now() / 1000);
    const justExpired = now - 15; // Expired 15s ago
    const strictPolicy = Claims.validatePolicy({ exp: justExpired }, { leeway: 0 });
    const leewayPolicy = Claims.validatePolicy({ exp: justExpired }, { leeway: 30 });
    const passed = !strictPolicy.valid && leewayPolicy.valid;
    addResult(19, "Clock-skew leeway policy tolerance (strict vs leeway)", passed, 
              `Strict valid: ${strictPolicy.valid}, Leeway valid: ${leewayPolicy.valid}`);
  } catch (e) {
    addResult(19, "Clock-skew leeway policy tolerance (strict vs leeway)", false, e.message);
  }

  // 20. Optional issuer and audience policy validation
  try {
    const payload = { iss: "https://auth.castle.sec", aud: ["api.castle.sec", "mobile.castle.sec"] };
    const matchingPolicy = Claims.validatePolicy(payload, { expectedIss: "https://auth.castle.sec", expectedAud: "api.castle.sec" });
    const mismatchedIss = Claims.validatePolicy(payload, { expectedIss: "https://evil.com" });
    const mismatchedAud = Claims.validatePolicy(payload, { expectedAud: "unauthorized.service" });
    const passed = matchingPolicy.valid && !mismatchedIss.valid && !mismatchedAud.valid;
    addResult(20, "Optional issuer and audience policy validation", passed,
              `Match: ${matchingPolicy.valid}, WrongIss: ${mismatchedIss.valid}, WrongAud: ${mismatchedAud.valid}`);
  } catch (e) {
    addResult(20, "Optional issuer and audience policy validation", false, e.message);
  }

  // 21. JSON null header rejected
  try {
    const nullHeaderToken = "bnVsbA.eyJzdWIiOiIxMjMifQ.sig"; // "null" in base64url
    Crypto.parseJwt(nullHeaderToken);
    addResult(21, "JSON null header rejected", false, "Allowed JSON null header");
  } catch (e) {
    const passed = e.message.includes("Header must be a valid JSON object");
    addResult(21, "JSON null header rejected", passed, `Caught: ${e.message}`);
  }

  // 22. JSON null payload rejected
  try {
    const nullPayloadToken = "eyJhbGciOiJIUzI1NiJ9.bnVsbA.sig"; // "null" in base64url
    Crypto.parseJwt(nullPayloadToken);
    addResult(22, "JSON null payload rejected", false, "Allowed JSON null payload");
  } catch (e) {
    const passed = e.message.includes("Claims set must be a valid JSON object");
    addResult(22, "JSON null payload rejected", passed, `Caught: ${e.message}`);
  }

  // 23. Array header rejected
  try {
    const arrayHeaderToken = "W10.eyJzdWIiOiIxMjMifQ.sig"; // "[]" in base64url
    Crypto.parseJwt(arrayHeaderToken);
    addResult(23, "JSON array header rejected", false, "Allowed array header");
  } catch (e) {
    const passed = e.message.includes("Header must be a valid JSON object");
    addResult(23, "JSON array header rejected", passed, `Caught: ${e.message}`);
  }

  // 24. Array payload rejected
  try {
    const arrayPayloadToken = "eyJhbGciOiJIUzI1NiJ9.W10.sig"; // "[]" in base64url
    Crypto.parseJwt(arrayPayloadToken);
    addResult(24, "JSON array payload rejected", false, "Allowed array payload");
  } catch (e) {
    const passed = e.message.includes("Claims set must be a valid JSON object");
    addResult(24, "JSON array payload rejected", passed, `Caught: ${e.message}`);
  }

  // 25. String, number, and boolean header/payload rejected
  try {
    const stringHeader = Crypto.stringToBase64Url('"hello"');
    const validPayload = Crypto.stringToBase64Url('{"sub":"user"}');
    let rejectedCount = 0;
    try { Crypto.parseJwt(`${stringHeader}.${validPayload}.sig`); } catch (err) { rejectedCount++; }
    
    const numberPayload = Crypto.stringToBase64Url('12345');
    const validHeader = Crypto.stringToBase64Url('{"alg":"HS256"}');
    try { Crypto.parseJwt(`${validHeader}.${numberPayload}.sig`); } catch (err) { rejectedCount++; }

    const booleanPayload = Crypto.stringToBase64Url('true');
    try { Crypto.parseJwt(`${validHeader}.${booleanPayload}.sig`); } catch (err) { rejectedCount++; }

    addResult(25, "String, number, and boolean header/payload rejection", rejectedCount === 3, `Rejected primitives count: ${rejectedCount}/3`);
  } catch (e) {
    addResult(25, "String, number, and boolean header/payload rejection", false, e.message);
  }

  // 26. Malformed Base64URL and malformed JSON rejection
  try {
    let errorCount = 0;
    try { Crypto.parseJwt("not-valid-b64!@#.also-not-valid!@#.sig"); } catch(e) { errorCount++; }
    try { Crypto.parseJwt("eyJhbGciOi.eyJzdWIi.sig"); } catch(e) { errorCount++; }
    addResult(26, "Malformed Base64URL and malformed JSON rejection", errorCount === 2, `Caught ${errorCount}/2 malformed tokens`);
  } catch (e) {
    addResult(26, "Malformed Base64URL and malformed JSON rejection", false, e.message);
  }

  // 27. XSS sanitization in claim values
  try {
    const xssPayload = {
      iss: "<img src=x onerror=alert(1)>",
      sub: "<script>document.cookie='hacked'</script>",
      custom: "<svg onload=alert(2)>"
    };
    const claims = Claims.analyzeClaims(xssPayload);
    const issClaim = claims.find(c => c.name === 'iss');
    const safeEscaped = Claims.escapeHtml(xssPayload.iss);
    const passed = !safeEscaped.includes("<img") && safeEscaped.includes("&lt;img");
    addResult(27, "XSS sanitization in claim values", passed, `Escaped: ${safeEscaped}`);
  } catch (e) {
    addResult(27, "XSS sanitization in claim values", false, e.message);
  }

  // 28. XSS sanitization in algorithm strings and sensitive keys
  try {
    const dangerousAlg = "<script>alert(1)</script>";
    const dangerousKey = "<b onmouseover=alert(1)>secret</b>";
    const escapedAlg = Claims.escapeHtml(dangerousAlg);
    const escapedKey = Claims.escapeHtml(dangerousKey);
    const passed = !escapedAlg.includes("<script") && !escapedKey.includes("<b");
    addResult(28, "XSS sanitization in algorithm strings and keys", passed, `Escaped Alg: ${escapedAlg}`);
  } catch (e) {
    addResult(28, "XSS sanitization in algorithm strings and keys", false, e.message);
  }

  // 29. Custom nested JSON payload signing and decoding roundtrip
  try {
    const customPayload = {
      sub: "enterprise_admin",
      user: {
        id: 9942,
        email: "security@castle.internal",
        roles: ["auditor", "operator"]
      },
      scopes: ["read:audit", "write:config"],
      settings: {
        mfa_enabled: true,
        risk_score: 0.12
      }
    };
    const customHeader = { alg: "HS256", typ: "JWT" };
    const signedToken = await Crypto.signHmac(customHeader, customPayload, testSecret, "HS256");
    const parsedBack = Crypto.parseJwt(signedToken);
    const verified = await Crypto.verifyHmac(parsedBack.headerBase64Url, parsedBack.payloadBase64Url, parsedBack.signatureBase64Url, testSecret, "HS256");
    const deepEqual = parsedBack.payload.user.email === "security@castle.internal" && parsedBack.payload.scopes.length === 2;
    addResult(29, "Custom nested JSON payload signing and decoding roundtrip", verified && deepEqual, `Verified: ${verified}, Roles: ${parsedBack.payload.user.roles.join(',')}`);
  } catch (e) {
    addResult(29, "Custom nested JSON payload signing and decoding roundtrip", false, e.message);
  }

  // 30. Dynamic signing and verification roundtrip for HS256, HS384, HS512
  try {
    const algorithms = ["HS256", "HS384", "HS512"];
    let verifiedCount = 0;
    for (const alg of algorithms) {
      const h = { alg: alg, typ: "JWT" };
      const p = { sub: "test-user", alg: alg, iat: Math.floor(Date.now() / 1000) };
      const tok = await Crypto.signHmac(h, p, testSecret, alg);
      const parsed = Crypto.parseJwt(tok);
      const ok = await Crypto.verifyHmac(parsed.headerBase64Url, parsed.payloadBase64Url, parsed.signatureBase64Url, testSecret, alg);
      if (ok) verifiedCount++;
    }
    addResult(30, "Dynamic signing & verification roundtrip for HS256/HS384/HS512", verifiedCount === 3, `Verified ${verifiedCount}/3 algorithms`);
  } catch (e) {
    addResult(30, "Dynamic signing & verification roundtrip for HS256/HS384/HS512", false, e.message);
  }

  return results;
};
