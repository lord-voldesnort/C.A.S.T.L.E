/*
 * JWT Builder Tab Controller.
 * Handles the construction, local signing, copying, and handoff of JWT tokens.
 */

window.CastleJwtBuild = window.CastleJwtBuild || {};

(function(exports) {
  'use strict';

  function init() {
    autoFillIat();
    setupEventListeners();
    resetState();
  }

  function autoFillIat() {
    const iatInput = document.getElementById('jwt-build-iat');
    if (iatInput) {
      iatInput.value = Math.floor(Date.now() / 1000);
    }
  }

  function setupEventListeners() {
    const generateBtn = document.getElementById('jwt-build-generate-btn');
    const resetBtn = document.getElementById('jwt-build-reset-btn');
    const analyzeHandoffBtn = document.getElementById('jwt-build-analyze-btn');
    const copyTokenBtn = document.getElementById('jwt-build-copy-token-btn');

    if (generateBtn) {
      generateBtn.addEventListener('click', handleGenerate);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetState();
      });
    }

    if (analyzeHandoffBtn) {
      analyzeHandoffBtn.addEventListener('click', () => {
        const tokenVal = document.getElementById('jwt-build-token-out').value;
        const secretVal = document.getElementById('jwt-build-secret').value;

        if (tokenVal && window.CastleJwtUI) {
          // Pass token and secret to Decode module
          if (window.CastleJwtDecode) {
            window.CastleJwtDecode.loadTokenIntoDecoder(tokenVal, secretVal);
          }
          // Navigate to Decode & Verify tab
          window.CastleJwtUI.selectTab('decode');
        }
      });
    }

    if (copyTokenBtn) {
      copyTokenBtn.addEventListener('click', () => {
        const tokenOut = document.getElementById('jwt-build-token-out');
        if (tokenOut && tokenOut.value) {
          navigator.clipboard.writeText(tokenOut.value).then(() => {
            const originalText = copyTokenBtn.textContent;
            copyTokenBtn.textContent = "COPIED!";
            setTimeout(() => { copyTokenBtn.textContent = originalText; }, 1500);
          });
        }
      });
    }
  }

  function resetState() {
    // Reset form fields to defaults
    const subInput = document.getElementById('jwt-build-sub');
    const roleInput = document.getElementById('jwt-build-role');
    const issInput = document.getElementById('jwt-build-iss');
    const expSelect = document.getElementById('jwt-build-exp');
    const algSelect = document.getElementById('jwt-build-alg');
    const secretInput = document.getElementById('jwt-build-secret');

    if (subInput) subInput.value = "user123";
    if (roleInput) roleInput.value = "user";
    if (issInput) issInput.value = "Castle Demo";
    if (expSelect) expSelect.value = "3600"; // 1 hour
    if (algSelect) algSelect.value = "HS256";
    if (secretInput) secretInput.value = "";

    autoFillIat();

    // Hide output panel, clear warnings
    const outputContainer = document.getElementById('jwt-build-output-container');
    const buildError = document.getElementById('jwt-build-error');

    if (outputContainer) outputContainer.classList.add('hidden');
    if (buildError) {
      buildError.classList.add('hidden');
      buildError.textContent = "";
    }
  }

  async function handleGenerate() {
    const buildError = document.getElementById('jwt-build-error');
    const outputContainer = document.getElementById('jwt-build-output-container');

    if (buildError) {
      buildError.classList.add('hidden');
      buildError.textContent = "";
    }

    try {
      const sub = document.getElementById('jwt-build-sub').value.trim();
      const role = document.getElementById('jwt-build-role').value.trim();
      const iss = document.getElementById('jwt-build-iss').value.trim();
      const iatVal = parseInt(document.getElementById('jwt-build-iat').value, 10);
      const expOffset = parseInt(document.getElementById('jwt-build-exp').value, 10);
      const alg = document.getElementById('jwt-build-alg').value;
      const secret = document.getElementById('jwt-build-secret').value;

      if (!secret) {
        throw new Error("HMAC Secret is required to generate a signed JWT.");
      }
      if (isNaN(iatVal)) {
        throw new Error("Issued At (iat) must be a valid epoch number.");
      }

      // Build payload and header
      const header = {
        alg: alg,
        typ: "JWT"
      };

      const payload = {
        sub: sub,
        role: role,
        iss: iss,
        iat: iatVal,
        exp: iatVal + expOffset
      };

      // Sign locally via single implementation in crypto.js
      const token = await window.CastleJwtCrypto.signHmac(header, payload, secret, alg);

      // Display outputs
      const headerOut = document.getElementById('jwt-build-header-out');
      const payloadOut = document.getElementById('jwt-build-payload-out');
      const tokenOut = document.getElementById('jwt-build-token-out');

      if (headerOut) headerOut.textContent = JSON.stringify(header, null, 2);
      if (payloadOut) payloadOut.textContent = JSON.stringify(payload, null, 2);
      if (tokenOut) tokenOut.value = token;

      if (outputContainer) outputContainer.classList.remove('hidden');

    } catch (err) {
      if (outputContainer) outputContainer.classList.add('hidden');
      if (buildError) {
        buildError.classList.remove('hidden');
        buildError.textContent = err.message;
      }
    }
  }

  // Export methods
  exports.init = init;
  exports.resetState = resetState;

})(window.CastleJwtBuild);
