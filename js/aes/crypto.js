/* Castle AES Studio: local AES-256-GCM payload and key operations. */
(function(root) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const PBKDF2_ITERATIONS = 250000;

  function toBase64(bytes) {
    let binary = '';
    new Uint8Array(bytes).forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }
  function fromBase64(value) {
    const binary = atob(value);
    return Uint8Array.from(binary, char => char.charCodeAt(0));
  }
  function randomBytes(length) { const bytes = new Uint8Array(length); crypto.getRandomValues(bytes); return bytes; }
  async function deriveKey(passphrase, salt) {
    const material = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function importRandomKey(value) {
    const bytes = fromBase64(value);
    if (bytes.length !== 32) throw new Error('The supplied random key must be a 256-bit Castle key.');
    return crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
  }
  async function createKey(mode, secret) {
    if (mode === 'random') {
      const raw = randomBytes(32);
      return { key: await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']), keyValue: toBase64(raw), salt: null };
    }
    if (!secret) throw new Error('Enter a secret passphrase before encrypting.');
    const salt = randomBytes(16);
    return { key: await deriveKey(secret, salt), salt };
  }
  async function encryptBytes(bytes, options) {
    const keyData = await createKey(options.mode, options.secret);
    const iv = randomBytes(12);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, keyData.key, bytes);
    return {
      envelope: { version: 1, algorithm: 'AES-256-GCM', mode: options.mode, salt: keyData.salt ? toBase64(keyData.salt) : null, iv: toBase64(iv), type: options.type, name: options.name || null, mime: options.mime || 'application/octet-stream', data: toBase64(ciphertext) },
      keyValue: keyData.keyValue || null
    };
  }
  async function decryptEnvelope(envelope, secret) {
    if (!envelope || envelope.version !== 1 || envelope.algorithm !== 'AES-256-GCM' || !envelope.data || !envelope.iv) throw new Error('This is not a recognized Castle encrypted file.');
    let key;
    if (envelope.mode === 'random') key = await importRandomKey(secret);
    else if (envelope.mode === 'passphrase' && envelope.salt) key = await deriveKey(secret, fromBase64(envelope.salt));
    else throw new Error('The encrypted payload has unsupported key metadata.');
    try { return { bytes: await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(envelope.iv) }, key, fromBase64(envelope.data)), envelope }; }
    catch (_) { throw new Error('File integrity check failed. This file may have been altered, or the passphrase/key is incorrect.'); }
  }
  async function readFile(file, onProgress) {
    const chunkSize = 4 * 1024 * 1024, bytes = new Uint8Array(file.size); let offset = 0;
    while (offset < file.size) { const chunk = await file.slice(offset, offset + chunkSize).arrayBuffer(); bytes.set(new Uint8Array(chunk), offset); offset += chunk.byteLength; if (onProgress) onProgress(Math.round(offset / file.size * 45)); await new Promise(resolve => setTimeout(resolve, 0)); }
    return bytes.buffer;
  }
  async function parseEncryptedFile(file, onProgress) { const bytes = await readFile(file, onProgress); try { return JSON.parse(decoder.decode(bytes)); } catch (_) { throw new Error('This file is incomplete or is not in Castle encrypted format.'); } }
  function serializeEnvelope(envelope) { return new Blob([JSON.stringify(envelope)], { type: 'application/vnd.castle.encrypted+json' }); }
  function parseTextEnvelope(text) { try { return JSON.parse(atob(text.trim())); } catch (_) { throw new Error('This ciphertext is incomplete or not a Castle encrypted text payload.'); } }
  function encodeTextEnvelope(envelope) { return btoa(JSON.stringify(envelope)); }
  root.CastleAES = { encryptBytes, decryptEnvelope, readFile, parseEncryptedFile, serializeEnvelope, parseTextEnvelope, encodeTextEnvelope, decoder };
})(window);
