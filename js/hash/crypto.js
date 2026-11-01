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

  /**
   * Compares two File or Blob objects byte-by-byte directly without relying exclusively on hashes.
   * @param {Blob|File} fileA
   * @param {Blob|File} fileB
   * @param {function(number): void} [onProgress]
   * @returns {Promise<{identical: boolean, reason: string, sizeA: number, sizeB: number, mismatchOffset?: number}>}
   */
  async function compareFileBytes(fileA, fileB, onProgress) {
    if (!fileA || !fileB) {
      throw new Error('Both files must be provided for direct byte comparison.');
    }

    const sizeA = fileA.size;
    const sizeB = fileB.size;

    // Direct size check
    if (sizeA !== sizeB) {
      if (onProgress) onProgress(100);
      return {
        identical: false,
        reason: `File sizes differ: File A is ${sizeA} bytes, File B is ${sizeB} bytes.`,
        sizeA,
        sizeB
      };
    }

    // Both files empty (0 bytes)
    if (sizeA === 0) {
      if (onProgress) onProgress(100);
      return {
        identical: true,
        reason: 'Both files are empty (0 bytes) and bit-for-bit identical.',
        sizeA,
        sizeB
      };
    }

    const chunkSize = 2 * 1024 * 1024; // 2MB chunk
    let offset = 0;

    while (offset < sizeA) {
      const sliceA = fileA.slice(offset, offset + chunkSize);
      const sliceB = fileB.slice(offset, offset + chunkSize);

      const [bufA, bufB] = await Promise.all([
        sliceA.arrayBuffer(),
        sliceB.arrayBuffer()
      ]);

      const bytesA = new Uint8Array(bufA);
      const bytesB = new Uint8Array(bufB);

      for (let i = 0; i < bytesA.length; i++) {
        if (bytesA[i] !== bytesB[i]) {
          const mismatchOffset = offset + i;
          if (onProgress) onProgress(100);
          return {
            identical: false,
            reason: `Byte mismatch detected at byte offset ${mismatchOffset} (0x${mismatchOffset.toString(16).toUpperCase()}).`,
            sizeA,
            sizeB,
            mismatchOffset
          };
        }
      }

      offset += chunkSize;
      const pct = Math.min(99, Math.round((offset / sizeA) * 100));
      if (onProgress) onProgress(pct);

      // Yield to main thread
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    if (onProgress) onProgress(100);
    return {
      identical: true,
      reason: `All ${sizeA} bytes are bit-for-bit identical.`,
      sizeA,
      sizeB
    };
  }

  /**
   * Validates a hash string against an algorithm or general hex rules.
   * @param {string} hashStr
   * @param {string} [algorithm] - Optional: 'MD5', 'SHA-1', 'SHA-256', 'SHA-512'
   * @returns {{valid: boolean, error?: string, normalized: string, detectedAlgo: string|null}}
   */
  function validateHashFormat(hashStr, algorithm = null) {
    if (typeof hashStr !== 'string') {
      return { valid: false, error: 'Expected hash must be a string.', normalized: '', detectedAlgo: null };
    }

    const normalized = hashStr.trim().toLowerCase();
    if (!normalized) {
      return { valid: false, error: 'Please enter or paste an expected hash.', normalized: '', detectedAlgo: null };
    }

    if (!/^[0-9a-f]+$/.test(normalized)) {
      return {
        valid: false,
        error: 'Invalid hexadecimal format. Hashes can only contain characters 0-9 and a-f.',
        normalized,
        detectedAlgo: null
      };
    }

    const detectedAlgo = autoDetectAlgorithm(normalized);

    if (algorithm && ALGORITHMS[algorithm]) {
      const expectedLen = ALGORITHMS[algorithm].hexLength;
      if (normalized.length !== expectedLen) {
        return {
          valid: false,
          error: `Invalid digest length for ${algorithm}: expected ${expectedLen} hex characters, but received ${normalized.length}.`,
          normalized,
          detectedAlgo
        };
      }
    } else if (!detectedAlgo) {
      return {
        valid: false,
        error: `Unrecognized hash length (${normalized.length} characters). Supported lengths: 32 (MD5), 40 (SHA-1), 64 (SHA-256), 128 (SHA-512).`,
        normalized,
        detectedAlgo: null
      };
    }

    return { valid: true, normalized, detectedAlgo };
  }

  root.CastleHashEngine = {
    ALGORITHMS,
    hashString,
    hashFile,
    compareFileBytes,
    validateHashFormat,
    autoDetectAlgorithm,
    bufferToHex
  };
})(typeof window !== 'undefined' ? window : this);

