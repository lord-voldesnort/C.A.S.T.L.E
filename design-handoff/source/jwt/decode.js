/*
 * JWT Decode & Verify Tab Controller.
 * Manages user token input, debounced parsing, signature verification,
 * claims explainer details, token status checks, and secret strength evaluation.
 */

window.CastleJwtDecode = window.CastleJwtDecode || {};

(function(exports) {
  'use strict';

  let debounceTimer = null;
  let countdownTimer = null;
  let activeTokenData = null; // Stores parsed data for in-memory session only

  function init() {
    setupEventListeners();
    resetState();
  }

  function setupEventListeners() {
    const tokenInput = document.getElementById('jwt-input');
    const secretInput = document.getElementById('jwt-secret-input');
    const algSelect = document.getElementById('jwt-alg-select');
    const resetBtn = document.getElementById('jwt-reset-btn');
    const copyAuthBtn = document.getElementById('jwt-copy-auth-btn');

    if (tokenInput) {
      tokenInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(handleTokenInput, 150);
      });
    }

    if (secretInput) {
      secretInput.addEventListener('input', () => {
        handleSignatureVerification();
      });
    }

    if (algSelect) {
      algSelect.addEventListener('change', () => {
        handleSignatureVerification();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetState();
      });
    }

    if (copyAuthBtn) {
      copyAuthBtn.addEventListener('click', () => {
        const authField = document.getElementById('jwt-auth-header');
        if (authField && authField.textContent) {
          navigator.clipboard.writeText(authField.textContent).then(() => {
            const originalText = copyAuthBtn.textContent;
            copyAuthBtn.textContent = "COPIED!";
            setTimeout(() => { copyAuthBtn.textContent = originalText; }, 1500);
          });
        }
      });
    }
  }

  function resetState() {
    // Clear in-memory sensitive state
    activeTokenData = null;
    clearTimeout(debounceTimer);
    clearInterval(countdownTimer);

    // Clear UI inputs
    const tokenInput = document.getElementById('jwt-input');
    const secretInput = document.getElementById('jwt-secret-input');
    const algSelect = document.getElementById('jwt-alg-select');

    if (tokenInput) tokenInput.value = "";
    if (secretInput) secretInput.value = "";
    if (algSelect) {
      algSelect.value = "HS256";
      algSelect.disabled = false;
    }

    // Hide results panel, show initial instructions
    const resultsContainer = document.getElementById('jwt-results-container');
    const emptyContainer = document.getElementById('jwt-empty-container');
    const errorContainer = document.getElementById('jwt-error-container');

    if (resultsContainer) resultsContainer.classList.add('hidden');
    if (emptyContainer) emptyContainer.classList.remove('hidden');
    if (errorContainer) {
      errorContainer.classList.add('hidden');
      errorContainer.textContent = "";
    }
  }

  function handleTokenInput() {
    const tokenInput = document.getElementById('jwt-input');
    const tokenVal = tokenInput ? tokenInput.value.trim() : "";

    const resultsContainer = document.getElementById('jwt-results-container');
    const emptyContainer = document.getElementById('jwt-empty-container');
    const errorContainer = document.getElementById('jwt-error-container');

    if (!tokenVal) {
      resetState();
      return;
    }

    try {
      // Clear previous error and countdown
      if (errorContainer) {
        errorContainer.classList.add('hidden');
        errorContainer.textContent = "";
      }
      clearInterval(countdownTimer);

      // Strict parse JWT
      const parsed = window.CastleJwtCrypto.parseJwt(tokenVal);
      activeTokenData = parsed;

      // Show results, hide empty instruction
      if (emptyContainer) emptyContainer.classList.add('hidden');
      if (resultsContainer) resultsContainer.classList.remove('hidden');

      // 1. Render formatted JSON via textContent (never innerHTML with raw decoded content)
      const headerJsonEl = document.getElementById('jwt-header-json');
      const payloadJsonEl = document.getElementById('jwt-payload-json');

      if (headerJsonEl) {
        headerJsonEl.textContent = JSON.stringify(parsed.header, null, 2);
      }
      if (payloadJsonEl) {
        payloadJsonEl.textContent = JSON.stringify(parsed.payload, null, 2);
      }

      // Auto-set the algorithm dropdown to match header (if supported)
      const algSelect = document.getElementById('jwt-alg-select');
      const declaredAlg = parsed.header.alg || 'none';
      if (algSelect) {
        if (['HS256', 'HS384', 'HS512'].includes(declaredAlg)) {
          algSelect.value = declaredAlg;
          algSelect.disabled = false;
        } else if (declaredAlg.toLowerCase() === 'none') {
          algSelect.value = 'HS256'; // Default back to HS256 for validation tries
          algSelect.disabled = true;
        } else {
          // Unsupported algorithm (e.g. RS256)
          algSelect.value = 'HS256';
          algSelect.disabled = false;
        }
      }

      // Duplicate Key Warnings (flag only)
      const duplicateWarningEl = document.getElementById('jwt-duplicate-warning');
      if (duplicateWarningEl) {
        const duplicateKeys = [...parsed.headerDuplicates, ...parsed.payloadDuplicates];
        if (duplicateKeys.length > 0) {
          duplicateWarningEl.classList.remove('hidden');
          const isHeaderDup = parsed.headerDuplicates.length > 0;
          const locationStr = isHeaderDup ? "header" : "payload";
          duplicateWarningEl.textContent = `⚠ Duplicate key detected in ${locationStr}: '${duplicateKeys[0]}'. Different systems may interpret duplicate keys differently — this can be a sign of a deliberately malformed token.`;
        } else {
          duplicateWarningEl.classList.add('hidden');
          duplicateWarningEl.textContent = "";
        }
      }

      // Claims translation & countdown init
      renderClaimsExplainer(parsed.payload);
      startCountdownTimer(parsed.payload.exp);

      // Sensitive fields scan
      renderSensitiveFields(parsed.payload);

      // Authorization header preview
      renderAuthHeader(tokenVal);

      // Run verification checks
      handleSignatureVerification();

    } catch (err) {
      if (resultsContainer) resultsContainer.classList.add('hidden');
      if (emptyContainer) emptyContainer.classList.add('hidden');
      if (errorContainer) {
        errorContainer.classList.remove('hidden');
        errorContainer.textContent = err.message;
      }
    }
  }

  async function handleSignatureVerification() {
    if (!activeTokenData) return;

    const secretInput = document.getElementById('jwt-secret-input');
    const algSelect = document.getElementById('jwt-alg-select');
    const statusBanner = document.getElementById('jwt-status-banner');
    
    const secretVal = secretInput ? secretInput.value : "";
    const selectedAlg = algSelect ? algSelect.value : "HS256";
    const declaredAlg = activeTokenData.header.alg || 'none';

    // Update Algorithm warning flags
    const algStatusLabel = document.getElementById('jwt-status-alg');
    if (algStatusLabel) {
      if (declaredAlg.toLowerCase() === 'none') {
        algStatusLabel.innerHTML = `<span class="text-danger">⚠ None (Unsigned)</span>`;
      } else if (!['HS256', 'HS384', 'HS512'].includes(declaredAlg)) {
        algStatusLabel.innerHTML = `<span class="text-warning">⚠ ${declaredAlg} (Unsupported signature)</span>`;
      } else {
        algStatusLabel.innerHTML = `<span class="text-success">✓ ${declaredAlg}</span>`;
      }
    }

    // Handle "none" declared algorithm warning panel
    const algNoneWarning = document.getElementById('jwt-algnone-warning');
    const unsupportedAlgWarning = document.getElementById('jwt-unsupported-warning');

    if (algNoneWarning) {
      if (declaredAlg.toLowerCase() === 'none') {
        algNoneWarning.classList.remove('hidden');
      } else {
        algNoneWarning.classList.add('hidden');
      }
    }

    if (unsupportedAlgWarning) {
      if (declaredAlg.toLowerCase() !== 'none' && !['HS256', 'HS384', 'HS512', 'RS256', 'ES256'].includes(declaredAlg)) {
        unsupportedAlgWarning.classList.remove('hidden');
        unsupportedAlgWarning.textContent = `⚠ This tool does not support verifying signatures for algorithm: ${declaredAlg}. Decoding works, but signature validation is unavailable.`;
      } else if (['RS256', 'ES256'].includes(declaredAlg)) {
        unsupportedAlgWarning.classList.remove('hidden');
        unsupportedAlgWarning.textContent = `⚠ This tool only verifies symmetric HMAC signatures (HS256/384/512). Asymmetric signatures (${declaredAlg}) are explicitly out of scope.`;
      } else {
        unsupportedAlgWarning.classList.add('hidden');
      }
    }

    // Checklist signature status element
    const sigChecklistEl = document.getElementById('jwt-status-signature');

    // 1. If no secret entered
    if (!secretVal) {
      statusBanner.textContent = "⚠ TOKEN DECODED — SIGNATURE NOT VERIFIED";
      statusBanner.className = "p-sm font-bold text-center rounded border bg-warning/10 border-warning/30 text-warning text-xs";
      if (sigChecklistEl) {
        sigChecklistEl.className = "text-text-muted";
        sigChecklistEl.textContent = "— (secret not entered yet)";
      }
      renderSecretStrength(""); // empty
      updateSummaryPanel();
      return;
    }

    // 2. Evaluate secret strength
    renderSecretStrength(secretVal);

    // 3. Check for alg:none
    if (declaredAlg.toLowerCase() === 'none') {
      statusBanner.textContent = "✗ SIGNATURE INVALID — alg:none is unsigned";
      statusBanner.className = "p-sm font-bold text-center rounded border bg-danger/10 border-danger/30 text-danger text-xs";
      if (sigChecklistEl) {
        sigChecklistEl.className = "text-danger font-bold";
        sigChecklistEl.textContent = "✗ Unsigned (alg: none)";
      }
      updateSummaryPanel();
      return;
    }

    // 4. Verify signature via single HMAC path
    let isSignatureCorrect = false;
    if (['HS256', 'HS384', 'HS512'].includes(declaredAlg)) {
      isSignatureCorrect = await window.CastleJwtCrypto.verifyHmac(
        activeTokenData.headerBase64Url,
        activeTokenData.payloadBase64Url,
        activeTokenData.signatureBase64Url,
        secretVal,
        selectedAlg
      );
    }

    // Ensure selected algorithm matches declared to prevent alg confusion
    if (selectedAlg !== declaredAlg) {
      isSignatureCorrect = false;
    }

    if (isSignatureCorrect) {
      statusBanner.innerHTML = `
        <div class="flex flex-col gap-xs">
          <div class="text-success font-bold text-sm">✓ SIGNATURE VERIFIED</div>
          <div class="text-[10px] text-text-secondary leading-normal font-normal">
            <strong>Signature verified ≠ issuer trusted.</strong> This confirms the token matches the secret you supplied — it does not prove who created the token or that they're trustworthy.
          </div>
        </div>
      `;
      statusBanner.className = "p-sm rounded border bg-success/10 border-success/30 text-xs";
      if (sigChecklistEl) {
        sigChecklistEl.className = "text-success font-bold";
        sigChecklistEl.textContent = "✓ Verified (HMAC)";
      }
    } else {
      statusBanner.textContent = "✗ SIGNATURE INVALID — wrong secret, tampered token, or wrong algorithm selected.";
      statusBanner.className = "p-sm font-bold text-center rounded border bg-danger/10 border-danger/30 text-danger text-xs";
      if (sigChecklistEl) {
        sigChecklistEl.className = "text-danger font-bold";
        sigChecklistEl.textContent = "✗ Invalid";
      }
    }

    updateSummaryPanel();
  }

  function renderClaimsExplainer(payload) {
    const claimsContainer = document.getElementById('jwt-claims-explainer');
    if (!claimsContainer) return;

    const claims = window.CastleJwtClaims.analyzeClaims(payload);
    if (claims.length === 0) {
      claimsContainer.innerHTML = `
        <p class="text-xs text-text-muted italic">No standard claims (iss, sub, aud, exp, nbf, iat, jti) found in payload.</p>
        <p class="text-[10px] text-text-muted mt-sm leading-relaxed">
          The absence of claims doesn't make a token invalid. However, custom parameters should be reviewed carefully.
        </p>
      `;
      return;
    }

    let html = `
      <div class="p-xs bg-surface-container/50 border border-border/80 rounded text-[10px] text-text-secondary mb-sm leading-normal">
        <strong>Trust Disclaimer:</strong> The presence of a claim doesn't make its content true or trustworthy — a token can claim <code>"iss": "Google"</code> without actually being issued by Google. Castle can only tell you what the token claims, not verify real-world identity.
      </div>
      <div class="space-y-sm">
    `;

    claims.forEach(c => {
      html += `
        <div class="p-xs border border-border/60 rounded bg-bg-main">
          <div class="flex justify-between items-center text-xs mb-[2px]">
            <span class="text-primary font-code font-bold">${c.name}</span>
            <code class="text-text-primary bg-surface px-xs rounded text-[10px]">${c.formatted}</code>
          </div>
          <p class="text-[10px] text-text-secondary leading-normal">${c.desc}</p>
        </div>
      `;
    });

    html += `</div>`;
    claimsContainer.innerHTML = html;
  }

  function startCountdownTimer(exp) {
    const countdownEl = document.getElementById('jwt-status-expiry');
    const liveCountdownContainer = document.getElementById('jwt-live-countdown-container');
    const liveCountdownVal = document.getElementById('jwt-live-countdown-value');

    if (!countdownEl) return;

    if (typeof exp !== 'number') {
      countdownEl.className = "text-warning";
      countdownEl.textContent = "⚠ No exp claim";
      if (liveCountdownContainer) liveCountdownContainer.classList.add('hidden');
      return;
    }

    const updateTimer = () => {
      const formatted = window.CastleJwtClaims.formatExpiration(exp);
      const nowSecs = Math.floor(Date.now() / 1000);
      const isExpired = exp < nowSecs;

      if (isExpired) {
        countdownEl.className = "text-danger font-bold";
        countdownEl.textContent = `⚠ Expired (${formatted})`;
        if (liveCountdownVal) liveCountdownVal.textContent = formatted;
        if (liveCountdownContainer) {
          liveCountdownContainer.classList.remove('hidden');
          liveCountdownContainer.className = "p-xs bg-danger/10 border border-danger/20 rounded text-[11px] text-danger font-bold text-center";
        }
      } else {
        countdownEl.className = "text-success";
        countdownEl.textContent = `✓ Active (${formatted})`;
        if (liveCountdownVal) liveCountdownVal.textContent = formatted;
        if (liveCountdownContainer) {
          liveCountdownContainer.classList.remove('hidden');
          liveCountdownContainer.className = "p-xs bg-success/10 border border-success/20 rounded text-[11px] text-success font-bold text-center";
        }
      }
      updateSummaryPanel();
    };

    updateTimer();
    countdownTimer = setInterval(updateTimer, 60000); // Update every minute
  }

  function renderSensitiveFields(payload) {
    const sensitiveContainer = document.getElementById('jwt-sensitive-fields');
    const warningChecklistEl = document.getElementById('jwt-status-sensitive');
    if (!sensitiveContainer) return;

    const foundKeys = window.CastleJwtClaims.scanSensitiveFields(payload);

    if (foundKeys.length === 0) {
      sensitiveContainer.innerHTML = `
        <div class="text-success text-xs flex items-center gap-xs">
          <span class="material-symbols-outlined text-[16px]">check_circle</span>
          <span>No potentially sensitive parameter names detected in payload.</span>
        </div>
      `;
      if (warningChecklistEl) {
        warningChecklistEl.className = "text-success";
        warningChecklistEl.textContent = "✓ None detected";
      }
      return;
    }

    if (warningChecklistEl) {
      warningChecklistEl.className = "text-warning font-bold";
      warningChecklistEl.textContent = `⚠ ${foundKeys.length} found`;
    }

    sensitiveContainer.innerHTML = `
      <div class="p-xs bg-danger/10 border border-danger/30 rounded text-xs text-danger flex flex-col gap-xs leading-normal">
        <div class="flex items-center gap-xs font-bold">
          <span class="material-symbols-outlined text-[18px]">warning</span>
          <span>Potentially sensitive field detected: ${foundKeys.map(k => `'${k}'`).join(', ')}</span>
        </div>
        <p class="text-[11px] text-text-secondary">
          JWT payloads are encoded, not encrypted — anyone who obtains this token can read this value without any secret. Avoid storing passwords, PINs, card numbers, or API keys inside JWT claims.
        </p>
      </div>
    `;
  }

  function renderSecretStrength(secret) {
    const strengthContainer = document.getElementById('jwt-secret-strength');
    const checklistStrengthEl = document.getElementById('jwt-status-secret');

    if (!strengthContainer) return;

    if (!secret) {
      strengthContainer.innerHTML = `
        <p class="text-xs text-text-muted italic">Enter a secret key to evaluate its resistance to brute-force cracking.</p>
      `;
      if (checklistStrengthEl) {
        checklistStrengthEl.className = "text-text-muted";
        checklistStrengthEl.textContent = "— (secret not entered)";
      }
      return;
    }

    if (!window.CastlePassword || !window.CastlePassword.Entropy) {
      strengthContainer.innerHTML = `
        <p class="text-xs text-warning">Password strength engine unavailable.</p>
      `;
      return;
    }

    const evaluation = window.CastlePassword.Entropy.evaluateStrength(secret);
    const crackTime = window.CastlePassword.Entropy.calculateCrackTime(secret);

    let levelColor = "text-danger";
    let bgLevelColor = "bg-danger/25";
    if (evaluation.level.includes("STRONG")) {
      levelColor = "text-success";
      bgLevelColor = "bg-success/20";
    } else if (evaluation.level.includes("FAIR")) {
      levelColor = "text-warning";
      bgLevelColor = "bg-warning/20";
    } else if (evaluation.level.includes("FORTRESS")) {
      levelColor = "text-primary";
      bgLevelColor = "bg-primary/20";
    }

    if (checklistStrengthEl) {
      if (evaluation.scoreStep >= 3) {
        checklistStrengthEl.className = "text-success font-bold";
        checklistStrengthEl.textContent = `✓ Strong (${evaluation.level})`;
      } else {
        checklistStrengthEl.className = "text-warning font-bold";
        checklistStrengthEl.textContent = `⚠ Weak (${evaluation.level})`;
      }
    }

    strengthContainer.innerHTML = `
      <div class="flex flex-col gap-xs text-xs">
        <div class="flex justify-between items-center">
          <span class="text-text-secondary">Strength Rating:</span>
          <span class="font-code font-bold px-xs py-[2px] rounded ${levelColor} ${bgLevelColor}">${evaluation.level}</span>
        </div>
        <div class="flex justify-between items-center font-code text-[11px]">
          <span class="text-text-secondary">Entropy:</span>
          <span class="text-text-primary">${evaluation.entropy} bits</span>
        </div>
        <div class="flex justify-between items-center font-code text-[11px]">
          <span class="text-text-secondary">Offline Crack Guess Time:</span>
          <span class="text-text-primary">${crackTime.text}</span>
        </div>

        <div class="p-xs bg-surface-container/60 border border-border/80 text-[10px] text-text-secondary rounded mt-xs leading-normal">
          <strong class="text-primary">SECRET STRENGTH — EDUCATIONAL ESTIMATE</strong><br>
          This estimate is based on Castle's password analysis model. It is not a prediction of actual attack time — real-world cracking feasibility depends on how the secret was obtained, whether offline guessing is possible, rate limiting, and other factors this tool cannot know.
        </div>
      </div>
    `;
  }

  function renderAuthHeader(token) {
    const authHeaderEl = document.getElementById('jwt-auth-header');
    if (authHeaderEl) {
      authHeaderEl.textContent = `Authorization: Bearer ${token}`;
    }
  }

  function updateSummaryPanel() {
    if (!activeTokenData) return;

    const summaryEl = document.getElementById('jwt-one-line-summary');
    if (!summaryEl) return;

    const sub = activeTokenData.payload.sub || "unknown user";
    const iss = activeTokenData.payload.iss || "unknown issuer";
    const alg = activeTokenData.header.alg || "none";

    let timeText = "no expiration";
    if (typeof activeTokenData.payload.exp === 'number') {
      const nowSecs = Math.floor(Date.now() / 1000);
      const diff = activeTokenData.payload.exp - nowSecs;
      if (diff < 0) {
        timeText = "expired";
      } else {
        const mins = Math.round(diff / 60);
        if (mins < 60) {
          timeText = `expiring in ${mins}m`;
        } else {
          timeText = `expiring in ${Math.round(mins / 60)}h`;
        }
      }
    }

    summaryEl.textContent = `Token for '${sub}', issued by '${iss}', ${timeText}, signed via ${alg}.`;
  }

  function loadTokenIntoDecoder(token, secret) {
    const tokenInput = document.getElementById('jwt-input');
    const secretInput = document.getElementById('jwt-secret-input');

    if (tokenInput) {
      tokenInput.value = token;
    }
    if (secretInput && secret) {
      secretInput.value = secret;
    }

    // Trigger update
    handleTokenInput();
  }

  // Export methods
  exports.init = init;
  exports.resetState = resetState;
  exports.loadTokenIntoDecoder = loadTokenIntoDecoder;

})(window.CastleJwtDecode);
