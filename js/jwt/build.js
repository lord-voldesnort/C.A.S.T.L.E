/*
 * JWT Builder Tab Controller.
 * Handles the construction, local signing, copying, custom JSON editing, and handoff of JWT tokens.
 */

window.CastleJwtBuild = window.CastleJwtBuild || {};

(function(exports) {
  'use strict';

  let currentMode = 'quick'; // 'quick' | 'custom'
  let isSigning = false;

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

  function getDefaultCustomJson() {
    const now = Math.floor(Date.now() / 1000);
    return JSON.stringify({
      sub: "user123",
      name: "Alex Developer",
      role: "admin",
      iss: "Castle Demo",
      permissions: [
        "read:reports",
        "write:settings"
      ],
      iat: now,
      exp: now + 3600
    }, null, 2);
  }

  function setupEventListeners() {
    const generateBtn = document.getElementById('jwt-build-generate-btn');
    const resetBtn = document.getElementById('jwt-build-reset-btn');
    const analyzeHandoffBtn = document.getElementById('jwt-build-analyze-btn');
    const copyTokenBtn = document.getElementById('jwt-build-copy-token-btn');

    const modeQuickBtn = document.getElementById('jwt-build-mode-quick');
    const modeCustomBtn = document.getElementById('jwt-build-mode-custom');
    const customJsonTextarea = document.getElementById('jwt-build-custom-json');
    const secretInput = document.getElementById('jwt-build-secret');

    // Composition mode toggles
    if (modeQuickBtn) {
      modeQuickBtn.addEventListener('click', () => setMode('quick'));
    }
    if (modeCustomBtn) {
      modeCustomBtn.addEventListener('click', () => setMode('custom'));
    }

    // Custom JSON live syntax validation
    if (customJsonTextarea) {
      customJsonTextarea.addEventListener('input', () => {
        validateCustomJsonInput();
      });
    }

    // Secret strength real-time feedback
    if (secretInput) {
      secretInput.addEventListener('input', () => {
        renderBuildSecretStrength(secretInput.value);
      });
    }

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
        const tokenOut = document.getElementById('jwt-build-token-out');
        const secretIn = document.getElementById('jwt-build-secret');

        const tokenVal = tokenOut ? tokenOut.value : "";
        const secretVal = secretIn ? secretIn.value : "";

        if (tokenVal && window.CastleJwtUI) {
          // Pass token and secret to Decode module in memory
          if (window.CastleJwtDecode) {
            window.CastleJwtDecode.loadTokenIntoDecoder(tokenVal, secretVal);
          }
          // Navigate to Decode & Verify tab
          if (typeof window.CastleJwtUI.selectTab === 'function') {
            window.CastleJwtUI.selectTab('decode');
          }
        }
      });
    }

    if (copyTokenBtn) {
      copyTokenBtn.addEventListener('click', async () => {
        const tokenOut = document.getElementById('jwt-build-token-out');
        if (tokenOut && tokenOut.value) {
          const originalHtml = copyTokenBtn.innerHTML;
          copyTokenBtn.innerHTML = '<span class="material-symbols-outlined text-[16px] text-emerald-400">check</span><span class="text-emerald-400 font-bold">COPIED TOKEN!</span>';
          const outputContainer = document.getElementById('jwt-build-output-container');
          if (outputContainer) {
            outputContainer.classList.remove('pulse-copied');
            void outputContainer.offsetWidth;
            outputContainer.classList.add('pulse-copied');
          }
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(tokenOut.value);
            } else {
              throw new Error('No clipboard API');
            }
          } catch (e) {
            const ta = document.createElement('textarea');
            ta.value = tokenOut.value;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          }
          setTimeout(() => { copyTokenBtn.innerHTML = originalHtml; }, 1800);
        }
      });
    }
  }

  function setMode(mode) {
    currentMode = mode;
    const modeQuickBtn = document.getElementById('jwt-build-mode-quick');
    const modeCustomBtn = document.getElementById('jwt-build-mode-custom');
    const quickContainer = document.getElementById('jwt-build-quick-container');
    const customContainer = document.getElementById('jwt-build-custom-container');
    const customJsonTextarea = document.getElementById('jwt-build-custom-json');

    if (mode === 'quick') {
      if (modeQuickBtn) {
        modeQuickBtn.className = "px-3 py-1.5 rounded-lg bg-brand-orange text-black font-mono font-bold text-xs uppercase shadow-[0_0_12px_rgba(255,106,0,0.25)] transition-all cursor-pointer";
      }
      if (modeCustomBtn) {
        modeCustomBtn.className = "px-3 py-1.5 rounded-lg bg-[#0D0D0D] text-zinc-400 hover:text-white font-mono text-xs uppercase border border-[#222222] transition-colors cursor-pointer";
      }
      if (quickContainer) quickContainer.classList.remove('hidden');
      if (customContainer) customContainer.classList.add('hidden');
    } else {
      if (modeCustomBtn) {
        modeCustomBtn.className = "px-3 py-1.5 rounded-lg bg-brand-orange text-black font-mono font-bold text-xs uppercase shadow-[0_0_12px_rgba(255,106,0,0.25)] transition-all cursor-pointer";
      }
      if (modeQuickBtn) {
        modeQuickBtn.className = "px-3 py-1.5 rounded-lg bg-[#0D0D0D] text-zinc-400 hover:text-white font-mono text-xs uppercase border border-[#222222] transition-colors cursor-pointer";
      }
      if (quickContainer) quickContainer.classList.add('hidden');
      if (customContainer) customContainer.classList.remove('hidden');

      if (customJsonTextarea && !customJsonTextarea.value.trim()) {
        customJsonTextarea.value = getDefaultCustomJson();
      }
      validateCustomJsonInput();
    }
  }

  function validateCustomJsonInput() {
    const customJsonTextarea = document.getElementById('jwt-build-custom-json');
    const jsonError = document.getElementById('jwt-build-json-error');
    if (!customJsonTextarea || !jsonError) return null;

    const val = customJsonTextarea.value.trim();
    if (!val) {
      jsonError.classList.remove('hidden');
      jsonError.textContent = "Payload JSON cannot be empty.";
      return null;
    }

    try {
      const parsed = JSON.parse(val);
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        jsonError.classList.remove('hidden');
        jsonError.textContent = "Claims set must be a JSON object (cannot be an array, null, or primitive value).";
        return null;
      }
      jsonError.classList.add('hidden');
      jsonError.textContent = "";
      return parsed;
    } catch (err) {
      jsonError.classList.remove('hidden');
      jsonError.textContent = `Invalid JSON: ${err.message}`;
      return null;
    }
  }

  function renderBuildSecretStrength(secret) {
    const container = document.getElementById('jwt-build-secret-strength');
    if (!container) return;

    if (!secret) {
      container.innerHTML = "";
      return;
    }

    if (!window.CastlePassword || !window.CastlePassword.Entropy) {
      container.innerHTML = "";
      return;
    }

    const evaluation = window.CastlePassword.Entropy.evaluateStrength(secret);
    const crackTime = window.CastlePassword.Entropy.calculateCrackTime(secret);

    let levelColor = "text-danger";
    let bgLevelColor = "bg-danger/20 border-danger/30";
    let isWeak = evaluation.scoreStep < 3;

    if (evaluation.level.includes("STRONG")) {
      levelColor = "text-success";
      bgLevelColor = "bg-success/20 border-success/30";
    } else if (evaluation.level.includes("FAIR")) {
      levelColor = "text-warning";
      bgLevelColor = "bg-warning/20 border-warning/30";
    } else if (evaluation.level.includes("FORTRESS")) {
      levelColor = "text-primary";
      bgLevelColor = "bg-primary/20 border-primary/30";
    }

    const safeLevel = window.CastleJwtClaims ? window.CastleJwtClaims.escapeHtml(evaluation.level) : evaluation.level;
    const safeCrack = window.CastleJwtClaims ? window.CastleJwtClaims.escapeHtml(crackTime.text) : crackTime.text;

    let warningHtml = "";
    if (isWeak) {
      warningHtml = `
        <div class="mt-2 text-[10px] text-warning leading-normal border-t border-warning/20 pt-1">
          ⚠ <strong>Weak Secret Warning:</strong> In production systems, HMAC signing keys must be high-entropy, cryptographically random strings (at least 256 bits). For educational & testing purposes in CASTLE, this secret can still be signed.
        </div>
      `;
    }

    container.innerHTML = `
      <div class="p-2 rounded border ${bgLevelColor} text-xs flex flex-col gap-1">
        <div class="flex justify-between items-center">
          <span class="text-text-secondary text-[11px]">Key Entropy Rating:</span>
          <span class="font-code font-bold px-1.5 py-0.5 rounded ${levelColor}">${safeLevel} (${evaluation.entropy} bits)</span>
        </div>
        <div class="text-[10px] text-text-muted">
          Offline Brute-Force Guess Time: <span class="text-text-primary font-mono">${safeCrack}</span>
        </div>
        ${warningHtml}
      </div>
    `;
  }

  function resetState() {
    // Reset mode
    setMode('quick');

    // Reset form fields to defaults
    const subInput = document.getElementById('jwt-build-sub');
    const roleInput = document.getElementById('jwt-build-role');
    const issInput = document.getElementById('jwt-build-iss');
    const expSelect = document.getElementById('jwt-build-exp');
    const algSelect = document.getElementById('jwt-build-alg');
    const secretInput = document.getElementById('jwt-build-secret');
    const customJsonTextarea = document.getElementById('jwt-build-custom-json');
    const strengthContainer = document.getElementById('jwt-build-secret-strength');

    if (subInput) subInput.value = "user123";
    if (roleInput) roleInput.value = "user";
    if (issInput) issInput.value = "Castle Demo";
    if (expSelect) expSelect.value = "3600"; // 1 hour
    if (algSelect) algSelect.value = "HS256";
    if (secretInput) secretInput.value = "";
    if (customJsonTextarea) customJsonTextarea.value = getDefaultCustomJson();
    if (strengthContainer) strengthContainer.innerHTML = "";

    autoFillIat();

    // Hide output panel, clear warnings
    const outputContainer = document.getElementById('jwt-build-output-container');
    const buildError = document.getElementById('jwt-build-error');
    const jsonError = document.getElementById('jwt-build-json-error');

    if (outputContainer) outputContainer.classList.add('hidden');
    if (buildError) {
      buildError.classList.add('hidden');
      buildError.textContent = "";
    }
    if (jsonError) {
      jsonError.classList.add('hidden');
      jsonError.textContent = "";
    }
  }

  async function handleGenerate() {
    if (isSigning) return;

    const buildError = document.getElementById('jwt-build-error');
    const outputContainer = document.getElementById('jwt-build-output-container');
    const generateBtn = document.getElementById('jwt-build-generate-btn');

    if (buildError) {
      buildError.classList.add('hidden');
      buildError.textContent = "";
    }

    isSigning = true;
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.textContent = "Signing...";
    }

    try {
      const alg = document.getElementById('jwt-build-alg').value;
      const secret = document.getElementById('jwt-build-secret').value;

      if (!secret) {
        throw new Error("HMAC Secret is required to generate a signed JWT.");
      }

      if (!['HS256', 'HS384', 'HS512'].includes(alg)) {
        throw new Error(`Unsupported signing algorithm '${alg}'. Only HS256, HS384, and HS512 are supported.`);
      }

      let payload = null;

      if (currentMode === 'quick') {
        const sub = document.getElementById('jwt-build-sub').value.trim();
        const role = document.getElementById('jwt-build-role').value.trim();
        const iss = document.getElementById('jwt-build-iss').value.trim();
        const iatVal = parseInt(document.getElementById('jwt-build-iat').value, 10);
        const expOffset = parseInt(document.getElementById('jwt-build-exp').value, 10);

        if (isNaN(iatVal)) {
          throw new Error("Issued At (iat) must be a valid epoch number.");
        }

        payload = {
          sub: sub,
          role: role,
          iss: iss,
          iat: iatVal,
          exp: iatVal + expOffset
        };
      } else {
        // Custom JSON mode
        const validated = validateCustomJsonInput();
        if (!validated) {
          throw new Error("Please correct errors in the Custom JSON payload before signing.");
        }
        payload = validated;
      }

      // Build header
      const header = {
        alg: alg,
        typ: "JWT"
      };

      // Sign locally via Web Crypto HMAC implementation in crypto.js
      const token = await window.CastleJwtCrypto.signHmac(header, payload, secret, alg);

      // Display outputs
      const headerOut = document.getElementById('jwt-build-header-out');
      const payloadOut = document.getElementById('jwt-build-payload-out');
      const tokenOut = document.getElementById('jwt-build-token-out');

      if (headerOut) headerOut.textContent = JSON.stringify(header, null, 2);
      if (payloadOut) payloadOut.textContent = JSON.stringify(payload, null, 2);
      if (tokenOut) tokenOut.value = token;

      if (outputContainer) {
        outputContainer.classList.remove('hidden');
        outputContainer.classList.remove('pulse-generated');
        void outputContainer.offsetWidth;
        outputContainer.classList.add('pulse-generated');
      }

    } catch (err) {
      if (outputContainer) outputContainer.classList.add('hidden');
      if (buildError) {
        buildError.classList.remove('hidden');
        buildError.textContent = err.message;
      }
    } finally {
      isSigning = false;
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate Token";
      }
    }
  }

  // Export methods
  exports.init = init;
  exports.resetState = resetState;
  exports.setMode = setMode;

})(window.CastleJwtBuild);
