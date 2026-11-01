/**
 * Castle Hash Toolkit - Cryptographic Engine
 * Wraps Web Crypto API (crypto.subtle.digest) and jsMD5.
 * Provides async chunked hashing for files with progress callbacks and UI yielding.
 */
(function(root) {
  const ALGORITHMS = {
    'MD5': { name: 'MD5', webCryptoName: null, warning: 'Broken for security use — fine for basic integrity checks only.', hexLength: 32 },
    'SHA-1': { name: 'SHA-1', webCryptoName: 'SHA-1', warning: 'Broken for security use — fine for basic integrity checks only.', hexLength: 40 },
    'SHA-256': { name: 'SHA-256', webCryptoName: 'SHA-256', warning: null, hexLength: 64 },
    'SHA-512': { name: 'SHA-512', webCryptoName: 'SHA-512', warning: null, hexLength: 128 }
  };

  /**
   * Converts ArrayBuffer to lowercase hexadecimal string.
   */
  function bufferToHex(buffer) {
    const byteArray = new Uint8Array(buffer);
    const hexCodes = new Array(byteArray.length);
    for (let i = 0; i < byteArray.length; i++) {
      const value = byteArray[i];
      hexCodes[i] = (value < 16 ? '0' : '') + value.toString(16);
    }
    return hexCodes.join('');
  }

  /**
   * Hashes string input synchronously or asynchronously.
   * Returns a promise resolving to lowercase hex string.
   */
  async function hashString(algorithm, text) {
    const algoConfig = ALGORITHMS[algorithm];
    if (!algoConfig) throw new Error(`Unsupported algorithm: ${algorithm}`);

    if (algorithm === 'MD5') {
      return root.jsMD5(text);
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algoConfig.webCryptoName, data);
    return bufferToHex(hashBuffer);
  }

  /**
   * Hashes a File object asynchronously with progress callbacks.
   * Yields control to main thread during reading to avoid UI freezing.
   * @param {string} algorithm - 'MD5', 'SHA-1', 'SHA-256', 'SHA-512'
   * @param {File} file - Browser File object
   * @param {function(number): void} [onProgress] - Callback with percentage 0-100
   * @returns {Promise<string>} Hexadecimal hash string
   */
  async function hashFile(algorithm, file, onProgress) {
    const algoConfig = ALGORITHMS[algorithm];
    if (!algoConfig) throw new Error(`Unsupported algorithm: ${algorithm}`);

    const fileSize = file.size;

    // For files smaller than 10MB, process in one pass
    if (fileSize <= 10 * 1024 * 1024) {
      if (onProgress) onProgress(30);
      const arrayBuffer = await file.arrayBuffer();
      if (onProgress) onProgress(70);

      let hashResult;
      if (algorithm === 'MD5') {
        hashResult = root.jsMD5(arrayBuffer);
      } else {
        const hashBuffer = await crypto.subtle.digest(algoConfig.webCryptoName, arrayBuffer);
        hashResult = bufferToHex(hashBuffer);
      }
      if (onProgress) onProgress(100);
      return hashResult;
    }

    // For larger files, slice into 4MB chunks and yield to UI thread
    const chunkSize = 4 * 1024 * 1024;
    let offset = 0;
    
    // For Web Crypto algorithms, if crypto.subtle stream isn't available, we read in chunks
    // or compute on full buffer after reading with yielded progress updates
    if (algorithm === 'MD5') {
      // Read chunks progressively into a Uint8Array
      const fullBytes = new Uint8Array(fileSize);
      while (offset < fileSize) {
        const slice = file.slice(offset, offset + chunkSize);
        const chunkBuffer = await slice.arrayBuffer();
        fullBytes.set(new Uint8Array(chunkBuffer), offset);
        offset += chunkSize;

        const progressPercent = Math.min(95, Math.round((offset / fileSize) * 80));
        if (onProgress) onProgress(progressPercent);

        // Yield to main thread
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      if (onProgress) onProgress(90);
      const hashResult = root.jsMD5(fullBytes);
      if (onProgress) onProgress(100);
      return hashResult;
    } else {
      // Web Crypto algorithms
      const fullBytes = new Uint8Array(fileSize);
      while (offset < fileSize) {
        const slice = file.slice(offset, offset + chunkSize);
        const chunkBuffer = await slice.arrayBuffer();
        fullBytes.set(new Uint8Array(chunkBuffer), offset);
        offset += chunkSize;

        const progressPercent = Math.min(85, Math.round((offset / fileSize) * 75));
        if (onProgress) onProgress(progressPercent);

        // Yield to UI thread
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      if (onProgress) onProgress(85);
      const hashBuffer = await crypto.subtle.digest(algoConfig.webCryptoName, fullBytes.buffer);
      const hashResult = bufferToHex(hashBuffer);
      if (onProgress) onProgress(100);
      return hashResult;
    }
  }

  /**
   * Auto-detect algorithm based on hex string length.
   * @param {string} hashStr
   * @returns {string|null} 'MD5', 'SHA-1', 'SHA-256', 'SHA-512', or null if invalid
   */
  function autoDetectAlgorithm(hashStr) {
    if (!hashStr) return null;
    const trimmed = hashStr.trim();
    if (!/^[0-9a-fA-F]+$/.test(trimmed)) return null;

    const len = trimmed.length;
    if (len === 32) return 'MD5';
    if (len === 40) return 'SHA-1';
    if (len === 64) return 'SHA-256';
    if (len === 128) return 'SHA-512';
    return null;
  }

  root.CastleHashEngine = {
    ALGORITHMS,
    hashString,
    hashFile,
    autoDetectAlgorithm,
    bufferToHex
  };
})(typeof window !== 'undefined' ? window : this);
