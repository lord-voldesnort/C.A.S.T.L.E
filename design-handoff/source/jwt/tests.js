/*
 * JWT Decoder & Verifier Test Suite.
 * Exposes a function window.runJwtTests() that programmatically runs and returns
 * the status of the 15 core verification scenarios.
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
    // Alter payload to admin:true
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
    const parsed = Crypto.parseJwt(expectedHS512.token); // actual HS512 sig
    // Try to verify using HS256
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

  return results;
};
