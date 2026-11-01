/*
 * JWT Decode & Verify Tab Controller.
 * Manages user token input, debounced parsing, signature verification,
 * claims explainer details, token status checks, policy validation, and secret strength evaluation.
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

    const policyLeeway = document.getElementById('jwt-policy-leeway');
    const policyIss = document.getElementById('jwt-policy-iss');
    const policyAud = document.getElementById('jwt-policy-aud');

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

    const btnVerify = document.getElementById('btn-verify');
    if (btnVerify) {
      btnVerify.addEventListener('click', () => {
        handleSignatureVerification();
      });
    }

    const btnPaste = document.getElementById('btn-paste');
    if (btnPaste && tokenInput) {
      btnPaste.addEventListener('click', async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            tokenInput.value = text.trim();
            handleTokenInput();
          }
        } catch (err) {
          console.warn('Clipboard read error:', err);
        }
      });
    }

    const btnDemo = document.getElementById('btn-demo');
    if (btnDemo && tokenInput) {
      btnDemo.addEventListener('click', () => {
        const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIFNlY3VyaXR5IiwiYWRtaW4iOnRydWUsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDgwMDAwMDAwfQ.KFI5PZws7xHHtlb8lycclvLeBRvvJKXFFlt4eTj60l4";
        tokenInput.value = demoToken;
        if (secretInput) secretInput.value = "your-256-bit-secret";
        handleTokenInput();
      });
    }

    const btnClear = document.getElementById('btn-clear');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        resetState();
      });
    }

    const toggleSecret = document.getElementById('toggle-secret-visibility');
    const secretIcon = document.getElementById('secret-visibility-icon');
    if (toggleSecret && secretInput) {
      toggleSecret.addEventListener('click', () => {
        const isPass = secretInput.type === 'password';
        secretInput.type = isPass ? 'text' : 'password';
        if (secretIcon) secretIcon.textContent = isPass ? 'visibility_off' : 'visibility';
      });
    }

    const fillSecret = document.getElementById('fill-demo-secret');
    if (fillSecret && secretInput) {
      fillSecret.addEventListener('click', () => {
        secretInput.value = "your-256-bit-secret";
        handleSignatureVerification();
      });
    }

    const copyHeaderBtn = document.getElementById('jwt-copy-header-btn');
    if (copyHeaderBtn) {
      copyHeaderBtn.addEventListener('click', async () => {
        const hJson = document.getElementById('jwt-header-json');
        if (hJson && hJson.textContent) {
          const originalHtml = copyHeaderBtn.innerHTML;
          copyHeaderBtn.innerHTML = '<span class="material-symbols-outlined text-[16px] text-emerald-400">check</span>';
          const container = hJson.closest('.relative');
          if (container) {
            container.classList.remove('pulse-copied');
            void container.offsetWidth;
            container.classList.add('pulse-copied');
          }
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(hJson.textContent);
            } else {
              throw new Error('No clipboard API');
            }
          } catch (e) {
            const ta = document.createElement('textarea');
            ta.value = hJson.textContent;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          }
          setTimeout(() => { copyHeaderBtn.innerHTML = originalHtml; }, 1800);
        }
      });
    }

    const copyPayloadBtn = document.getElementById('jwt-copy-payload-btn');
    if (copyPayloadBtn) {
      copyPayloadBtn.addEventListener('click', async () => {
        const pJson = document.getElementById('jwt-payload-json');
        if (pJson && pJson.textContent) {
          const originalHtml = copyPayloadBtn.innerHTML;
          copyPayloadBtn.innerHTML = '<span class="material-symbols-outlined text-[16px] text-emerald-400">check</span>';
          const container = pJson.closest('.relative');
          if (container) {
            container.classList.remove('pulse-copied');
            void container.offsetWidth;
            container.classList.add('pulse-copied');
          }
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(pJson.textContent);
            } else {
              throw new Error('No clipboard API');
            }
          } catch (e) {
            const ta = document.createElement('textarea');
            ta.value = pJson.textContent;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          }
          setTimeout(() => { copyPayloadBtn.innerHTML = originalHtml; }, 1800);
        }
      });
    }

    if (policyLeeway) {
      policyLeeway.addEventListener('change', () => {
        if (activeTokenData) evaluateClaimsPolicy(activeTokenData.payload);
      });
    }

    if (policyIss) {
      policyIss.addEventListener('input', () => {
        if (activeTokenData) evaluateClaimsPolicy(activeTokenData.payload);
      });
    }

    if (policyAud) {
      policyAud.addEventListener('input', () => {
        if (activeTokenData) evaluateClaimsPolicy(activeTokenData.payload);
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
            const originalHtml = copyAuthBtn.innerHTML;
            copyAuthBtn.innerHTML = '<span class="material-symbols-outlined text-[14px] text-emerald-300">check</span><span>COPIED HEADER!</span>';
            copyAuthBtn.classList.add('bg-emerald-500', 'text-black', 'border-emerald-400');
            setTimeout(() => {
              copyAuthBtn.innerHTML = originalHtml;
              copyAuthBtn.classList.remove('bg-emerald-500', 'text-black', 'border-emerald-400');
            }, 1800);
          });
        }
      });
    }
  }

  function resetState() {
    // Clear in-memory sensitive state
    activeTokenData = null;
    clearTimeout(debounceTimer);
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }

    // Clear UI inputs
    const tokenInput = document.getElementById('jwt-input');
    const secretInput = document.getElementById('jwt-secret-input');
    const algSelect = document.getElementById('jwt-alg-select');
    const policyLeeway = document.getElementById('jwt-policy-leeway');
    const policyIss = document.getElementById('jwt-policy-iss');
    const policyAud = document.getElementById('jwt-policy-aud');

    if (tokenInput) tokenInput.value = "";
    if (secretInput) secretInput.value = "";
    if (algSelect) {
      algSelect.value = "HS256";
      algSelect.disabled = false;
    }
    if (policyLeeway) policyLeeway.value = "0";
    if (policyIss) policyIss.value = "";
    if (policyAud) policyAud.value = "";

    const policyResults = document.getElementById('jwt-policy-results');
    if (policyResults) {
      policyResults.classList.add('hidden');
      policyResults.innerHTML = "";
    }

    const nbfStatus = document.getElementById('jwt-status-nbf');
    if (nbfStatus) {
      nbfStatus.className = "text-text-muted";
      nbfStatus.textContent = "—";
    }

    const policyStatus = document.getElementById('jwt-status-policy');
    if (policyStatus) {
      policyStatus.className = "text-text-muted";
      policyStatus.textContent = "—";
    }

    const sigChecklistEl = document.getElementById('jwt-status-signature');
    if (sigChecklistEl) {
      sigChecklistEl.className = "text-text-muted";
      sigChecklistEl.textContent = "—";
    }

    const statusBanner = document.getElementById('jwt-status-banner');
    if (statusBanner) {
      statusBanner.textContent = "";
      statusBanner.className = "hidden";
    }

    const verifiedShutter = document.getElementById('verified-shutter');
    if (verifiedShutter) verifiedShutter.classList.add('hidden');

    const byteCounter = document.getElementById('byte-counter');
    if (byteCounter) byteCounter.textContent = '0 BYTES';

    const pillHeaderSize = document.getElementById('pill-header-size');
    const pillPayloadSize = document.getElementById('pill-payload-size');
    const pillSignatureSize = document.getElementById('pill-signature-size');
    if (pillHeaderSize) pillHeaderSize.textContent = '0 B';
    if (pillPayloadSize) pillPayloadSize.textContent = '0 B';
    if (pillSignatureSize) pillSignatureSize.textContent = '0 B';

    const entropyBadge = document.getElementById('jwt-secret-entropy-badge');
    if (entropyBadge) {
      entropyBadge.textContent = 'AWAITING INPUT';
      entropyBadge.className = 'text-zinc-500 font-mono text-[10px] bg-zinc-800/40 px-2 py-0.5 rounded border border-zinc-700/40';
    }

    const tokenSigStream = document.getElementById('token-sig-stream');
    const computedSigStream = document.getElementById('computed-sig-stream');
    if (tokenSigStream) tokenSigStream.textContent = '';
    if (computedSigStream) computedSigStream.textContent = '';

    const summaryEl = document.getElementById('jwt-one-line-summary');
    if (summaryEl) {
      summaryEl.innerHTML = `<span class="material-symbols-outlined text-brand-orange text-[18px]">info</span><span>Input an RFC 7519 Base64URL token above or click 'Load Demo Token' to analyze segments, claims, and signature validity.</span>`;
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

    const byteLen = new TextEncoder().encode(tokenVal).length;
    const byteCounter = document.getElementById('byte-counter');
    if (byteCounter) byteCounter.textContent = `${byteLen} BYTES`;

    try {
      // Clear previous error and countdown
      if (errorContainer) {
        errorContainer.classList.add('hidden');
        errorContainer.textContent = "";
      }
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }

      // Strict parse JWT
      const parsed = window.CastleJwtCrypto.parseJwt(tokenVal);
      activeTokenData = parsed;

      // Show results, hide empty instruction
      if (emptyContainer) emptyContainer.classList.add('hidden');
      if (resultsContainer) {
        resultsContainer.classList.remove('hidden');
        resultsContainer.classList.remove('pulse-generated');
        void resultsContainer.offsetWidth;
        resultsContainer.classList.add('pulse-generated');
      }

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
          algSelect.value = 'HS256';
          algSelect.disabled = true;
        } else {
          // Unsupported algorithm (e.g. RS256, ES256)
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
      startCountdownTimer(parsed.payload);

      // Sensitive fields scan
      renderSensitiveFields(parsed.payload);

      // Authorization header preview
      renderAuthHeader(tokenVal);

      // Claims policy validation
      evaluateClaimsPolicy(parsed.payload);

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

    // Update Algorithm warning flags safely escaping any untrusted characters
    const algStatusLabel = document.getElementById('jwt-status-alg');
    if (algStatusLabel) {
      const safeAlg = window.CastleJwtClaims.escapeHtml(declaredAlg);
      if (declaredAlg.toLowerCase() === 'none') {
        algStatusLabel.innerHTML = `<span class="text-danger">⚠ None (Unsigned)</span>`;
      } else if (!['HS256', 'HS384', 'HS512'].includes(declaredAlg)) {
        algStatusLabel.innerHTML = `<span class="text-warning">⚠ ${safeAlg} (Unsupported signature)</span>`;
      } else {
        algStatusLabel.innerHTML = `<span class="text-success">✓ ${safeAlg}</span>`;
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
      statusBanner.className = "p-3 font-bold text-center rounded border bg-warning/10 border-warning/30 text-warning text-xs";
      if (sigChecklistEl) {
        sigChecklistEl.className = "text-text-muted";
        sigChecklistEl.textContent = "— (secret not entered yet)";
      }
      renderSecretStrength("");
      updateSummaryPanel();
      return;
    }

    // 2. Evaluate secret strength
    renderSecretStrength(secretVal);

    // 3. Check for alg:none
    if (declaredAlg.toLowerCase() === 'none') {
      statusBanner.textContent = "✗ SIGNATURE INVALID — alg:none is unsigned";
      statusBanner.className = "p-3 font-bold text-center rounded border bg-danger/10 border-danger/30 text-danger text-xs";
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
      const verifiedShutter = document.getElementById('verified-shutter');
      if (verifiedShutter) verifiedShutter.classList.remove('hidden');
      const tokenSigStream = document.getElementById('token-sig-stream');
      const computedSigStream = document.getElementById('computed-sig-stream');
      if (tokenSigStream) tokenSigStream.textContent = activeTokenData.signatureBase64Url;
      if (computedSigStream) computedSigStream.textContent = activeTokenData.signatureBase64Url;

      statusBanner.innerHTML = `
        <div class="flex flex-col gap-2">
          <div class="text-success font-bold text-sm">✓ SIGNATURE VERIFIED</div>
          <div class="text-[10px] text-text-secondary leading-normal font-normal">
            <strong>Signature verified ≠ issuer trusted.</strong> This confirms the token matches the secret you supplied — it does not prove who created the token or that they're trustworthy.
          </div>
        </div>
      `;
      statusBanner.className = "p-3 rounded border bg-success/10 border-success/30 text-xs pulse-verified";
      if (sigChecklistEl) {
        sigChecklistEl.className = "text-success font-bold";
        sigChecklistEl.textContent = "✓ Verified (HMAC)";
      }
    } else {
      const verifiedShutter = document.getElementById('verified-shutter');
      if (verifiedShutter) verifiedShutter.classList.add('hidden');

      statusBanner.textContent = "✗ SIGNATURE INVALID — wrong secret, tampered token, or wrong algorithm selected.";
      statusBanner.className = "p-3 font-bold text-center rounded border bg-danger/10 border-danger/30 text-danger text-xs";
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
        <p class="text-[10px] text-text-muted mt-2 leading-relaxed">
          The absence of claims doesn't make a token invalid. However, custom parameters should be reviewed carefully.
        </p>
      `;
      return;
    }

    let html = `
      <div class="p-2 bg-surface-container/50 border border-border/80 rounded text-[10px] text-text-secondary mb-2 leading-normal">
        <strong>Trust Disclaimer:</strong> The presence of a claim doesn't make its content true or trustworthy — a token can claim <code>"iss": "Google"</code> without actually being issued by Google. Castle can only tell you what the token claims, not verify real-world identity.
      </div>
      <div class="space-y-2">
    `;

    claims.forEach(c => {
      const safeName = window.CastleJwtClaims.escapeHtml(c.name);
      const safeFormatted = window.CastleJwtClaims.escapeHtml(c.formatted);
      const safeDesc = window.CastleJwtClaims.escapeHtml(c.desc);
      html += `
        <div class="p-2 border border-border/60 rounded bg-bg-main">
          <div class="flex justify-between items-center text-xs mb-[2px]">
            <span class="text-primary font-code font-bold">${safeName}</span>
            <code class="text-text-primary bg-surface px-2 rounded text-[10px] break-all">${safeFormatted}</code>
          </div>
          <p class="text-[10px] text-text-secondary leading-normal">${safeDesc}</p>
        </div>
      `;
    });

    html += `</div>`;
    claimsContainer.innerHTML = html;
  }

  function startCountdownTimer(payload) {
    const countdownEl = document.getElementById('jwt-status-expiry');
    const nbfStatusEl = document.getElementById('jwt-status-nbf');
    const liveCountdownContainer = document.getElementById('jwt-live-countdown-container');
    const liveCountdownVal = document.getElementById('jwt-live-countdown-value');

    const updateTimer = () => {
      const nowSecs = Math.floor(Date.now() / 1000);

      // 1. Evaluate exp
      if (countdownEl) {
        if (payload.exp === undefined) {
          countdownEl.className = "text-warning";
          countdownEl.textContent = "⚠ No exp claim";
          if (liveCountdownContainer) liveCountdownContainer.classList.add('hidden');
        } else if (!window.CastleJwtClaims.validateNumericDate(payload.exp)) {
          countdownEl.className = "text-danger font-bold";
          countdownEl.textContent = "⚠ Malformed exp timestamp";
          if (liveCountdownContainer) liveCountdownContainer.classList.add('hidden');
        } else {
          const formatted = window.CastleJwtClaims.formatExpiration(payload.exp);
          const isExpired = payload.exp < nowSecs;
          if (isExpired) {
            countdownEl.className = "text-danger font-bold";
            countdownEl.textContent = `⚠ Expired (${formatted})`;
            if (liveCountdownVal) liveCountdownVal.textContent = formatted;
            if (liveCountdownContainer) {
              liveCountdownContainer.classList.remove('hidden');
              liveCountdownContainer.className = "p-2 bg-danger/10 border border-danger/20 rounded text-[11px] text-danger font-bold text-center";
            }
          } else {
            countdownEl.className = "text-success";
            countdownEl.textContent = `✓ Active (${formatted})`;
            if (liveCountdownVal) liveCountdownVal.textContent = formatted;
            if (liveCountdownContainer) {
              liveCountdownContainer.classList.remove('hidden');
              liveCountdownContainer.className = "p-2 bg-success/10 border border-success/20 rounded text-[11px] text-success font-bold text-center";
            }
          }
        }
      }

      // 2. Evaluate nbf
      if (nbfStatusEl) {
        if (payload.nbf === undefined) {
          nbfStatusEl.className = "text-text-muted";
          nbfStatusEl.textContent = "— (no nbf claim)";
        } else if (!window.CastleJwtClaims.validateNumericDate(payload.nbf)) {
          nbfStatusEl.className = "text-danger font-bold";
          nbfStatusEl.textContent = "⚠ Malformed nbf timestamp";
        } else {
          const formattedNbf = window.CastleJwtClaims.formatNotBefore(payload.nbf);
          const isNotYetValid = payload.nbf > nowSecs;
          if (isNotYetValid) {
            nbfStatusEl.className = "text-danger font-bold";
            nbfStatusEl.textContent = `⚠ Not Yet Valid (${formattedNbf})`;
          } else {
            nbfStatusEl.className = "text-success";
            nbfStatusEl.textContent = `✓ Active (${formattedNbf})`;
          }
        }
      }

      updateSummaryPanel();
    };

    updateTimer();
    countdownTimer = setInterval(updateTimer, 30000); // Refresh every 30s
  }

  function evaluateClaimsPolicy(payload) {
    const leewayEl = document.getElementById('jwt-policy-leeway');
    const issEl = document.getElementById('jwt-policy-iss');
    const audEl = document.getElementById('jwt-policy-aud');
    const policyStatusEl = document.getElementById('jwt-status-policy');
    const policyResultsEl = document.getElementById('jwt-policy-results');

    if (!payload || typeof payload !== 'object') return;

    const leeway = leewayEl ? parseInt(leewayEl.value, 10) || 0 : 0;
    const expectedIss = issEl ? issEl.value.trim() : "";
    const expectedAud = audEl ? audEl.value.trim() : "";

    const policy = window.CastleJwtClaims.validatePolicy(payload, { leeway, expectedIss, expectedAud });

    if (policyStatusEl) {
      if (!expectedIss && !expectedAud && leeway === 0) {
        policyStatusEl.className = "text-text-muted";
        policyStatusEl.textContent = "— (strict/default, no constraints)";
        if (policyResultsEl) {
          policyResultsEl.classList.add('hidden');
          policyResultsEl.innerHTML = "";
        }
      } else if (policy.valid) {
        policyStatusEl.className = "text-success font-bold";
        policyStatusEl.textContent = `✓ Passed (${policy.checks.length} criteria)`;
        if (policyResultsEl) {
          policyResultsEl.classList.remove('hidden');
          policyResultsEl.className = "p-2 bg-success/10 border border-success/30 rounded text-xs text-success space-y-1";
          const listItems = policy.passed.map(p => `<li>${window.CastleJwtClaims.escapeHtml(p)}</li>`).join('');
          policyResultsEl.innerHTML = `<strong>Policy Checks Passed:</strong><ul class="list-disc pl-4 text-[11px] text-text-secondary">${listItems}</ul>`;
        }
      } else {
        policyStatusEl.className = "text-danger font-bold";
        policyStatusEl.textContent = `✗ Policy Failure (${policy.failures.length})`;
        if (policyResultsEl) {
          policyResultsEl.classList.remove('hidden');
          policyResultsEl.className = "p-2 bg-danger/10 border border-danger/30 rounded text-xs text-danger space-y-1";
          const listItems = policy.failures.map(f => `<li>${window.CastleJwtClaims.escapeHtml(f.message)}</li>`).join('');
          policyResultsEl.innerHTML = `<strong>Policy Checks Failed:</strong><ul class="list-disc pl-4 text-[11px] text-danger">${listItems}</ul>`;
        }
      }
    }
  }

  function renderSensitiveFields(payload) {
    const sensitiveContainer = document.getElementById('jwt-sensitive-fields');
    const warningChecklistEl = document.getElementById('jwt-status-sensitive');
    if (!sensitiveContainer) return;

    const foundKeys = window.CastleJwtClaims.scanSensitiveFields(payload);

    if (foundKeys.length === 0) {
      sensitiveContainer.innerHTML = `
        <div class="text-success text-xs flex items-center gap-2">
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

    const safeKeys = foundKeys.map(k => `'${window.CastleJwtClaims.escapeHtml(k)}'`).join(', ');

    sensitiveContainer.innerHTML = `
      <div class="p-2 bg-danger/10 border border-danger/30 rounded text-xs text-danger flex flex-col gap-2 leading-normal">
        <div class="flex items-center gap-2 font-bold">
          <span class="material-symbols-outlined text-[18px]">warning</span>
          <span>Potentially sensitive field detected: ${safeKeys}</span>
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
      <div class="flex flex-col gap-2 text-xs">
        <div class="flex justify-between items-center">
          <span class="text-text-secondary">Strength Rating:</span>
          <span class="font-code font-bold px-2 py-[2px] rounded ${levelColor} ${bgLevelColor}">${window.CastleJwtClaims.escapeHtml(evaluation.level)}</span>
        </div>
        <div class="flex justify-between items-center font-code text-[11px]">
          <span class="text-text-secondary">Entropy:</span>
          <span class="text-text-primary">${evaluation.entropy} bits</span>
        </div>
        <div class="flex justify-between items-center font-code text-[11px]">
          <span class="text-text-secondary">Offline Crack Guess Time:</span>
          <span class="text-text-primary">${window.CastleJwtClaims.escapeHtml(crackTime.text)}</span>
        </div>

        <div class="p-2 bg-surface-container/60 border border-border/80 text-[10px] text-text-secondary rounded mt-2 leading-normal">
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

    const sub = activeTokenData.payload.sub ? String(activeTokenData.payload.sub) : "unknown user";
    const iss = activeTokenData.payload.iss ? String(activeTokenData.payload.iss) : "unknown issuer";
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
