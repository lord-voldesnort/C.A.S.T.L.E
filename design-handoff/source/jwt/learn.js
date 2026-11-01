/*
 * JWT Learn Tab Controller.
 * Manages explanations, token anatomy tooltips, the live tampering sandbox, and time visualization.
 */

window.CastleJwtLearn = window.CastleJwtLearn || {};

(function(exports) {
  'use strict';

  let hostContainer = null;
  let isTampered = false;
  let customSecretVal = "demo-secret";

  function init(container) {
    hostContainer = container;
    render();
    bindEvents();
  }

  function render() {
    if (!hostContainer) return;

    // Build the static + interactive layout
    hostContainer.innerHTML = `
      <!-- Section A: What is a JWT -->
      <section class="armor-plate p-sm rounded flex flex-col gap-xs">
        <h3 class="text-primary font-headline-sm text-sm uppercase">What is a JSON Web Token?</h3>
        <p class="text-xs text-text-secondary leading-relaxed">
          A JSON Web Token (JWT) is a compact, URL-safe way to represent claims about a user or session. 
          It is widely used for user authentication and API authorization. A JWT consists of three parts 
          separated by dots: <span class="font-code text-danger font-bold">Header</span>, 
          <span class="font-code text-primary font-bold">Payload</span>, and 
          <span class="font-code text-info font-bold">Signature</span>.
        </p>
        <div class="p-xs bg-danger/10 border border-danger/30 rounded text-xs text-danger flex items-start gap-xs mt-xs">
          <span class="material-symbols-outlined text-[16px] mt-[2px]">warning</span>
          <span>
            <strong>Base64URL is ENCODING, not encryption.</strong> Anyone who intercepts a JWT can decode the header 
            and payload without any secret or key. Encoding simply changes the text format — it does NOT keep data secret.
          </span>
        </div>
      </section>

      <!-- Section B: Interactive Anatomy -->
      <section class="armor-plate p-sm rounded flex flex-col gap-xs">
        <h3 class="text-primary font-headline-sm text-sm uppercase">Interactive Token Anatomy</h3>
        <p class="text-xs text-text-secondary">
          Click or tap each segment of the token below to discover what it represents and see its decoded value:
        </p>
        
        <div class="font-code text-xs break-all bg-bg-main p-sm rounded border border-border flex flex-wrap gap-y-xs items-center leading-normal">
          <button data-castle-tooltip aria-expanded="false" class="text-danger hover:underline text-left outline-none cursor-pointer">
            eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
            <span role="tooltip" class="hidden absolute z-20 p-sm w-64 bg-surface border border-danger text-text-secondary rounded shadow-xl text-left mt-xs">
              <strong class="text-danger">Header</strong><br>
              Defines the token type (JWT) and the algorithm used to sign it (HS256).<br>
              <code class="text-[10px] text-danger-container text-danger bg-danger/5 block mt-xs p-xs rounded font-code">{"alg":"HS256","typ":"JWT"}</code>
            </span>
          </button>
          <span class="text-text-muted px-[2px] font-bold">.</span>
          <button data-castle-tooltip aria-expanded="false" class="text-primary hover:underline text-left outline-none cursor-pointer">
            eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ
            <span role="tooltip" class="hidden absolute z-20 p-sm w-64 bg-surface border border-primary text-text-secondary rounded shadow-xl text-left mt-xs">
              <strong class="text-primary">Payload</strong><br>
              Contains claims (user info, roles, expiration).<br>
              <code class="text-[10px] text-primary-container text-primary bg-primary/5 block mt-xs p-xs rounded font-code">{"sub":"1234567890","name":"John Doe","iat":1516239022}</code>
            </span>
          </button>
          <span class="text-text-muted px-[2px] font-bold">.</span>
          <button data-castle-tooltip aria-expanded="false" class="text-info hover:underline text-left outline-none cursor-pointer">
            SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
            <span role="tooltip" class="hidden absolute z-20 p-sm w-64 bg-surface border border-info text-text-secondary rounded shadow-xl text-left mt-xs">
              <strong class="text-info">Signature</strong><br>
              Formed by signing the encoded header + payload using a secret. Verified locally by Castle.
            </span>
          </button>
        </div>
      </section>

      <!-- Section C: Decoded vs Verified -->
      <section class="armor-plate p-sm rounded flex flex-col gap-xs border-primary/20 bg-primary/5">
        <h3 class="text-primary font-headline-sm text-sm uppercase">Central Concept: Decoded ≠ Verified</h3>
        <p class="text-xs text-text-secondary leading-relaxed">
          Anyone can decode a JWT — decoding only reveals its contents. It does <strong>not</strong> prove the token 
          was created by a trusted party, or that its contents haven't been modified. Only verifying the signature 
          against the correct secret can confirm authenticity.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-sm mt-xs text-center font-code text-xs">
          <div class="p-xs bg-warning/10 border border-warning/30 text-warning rounded flex items-center justify-center gap-xs">
            <span class="material-symbols-outlined text-[16px]">warning</span>
            <span>⚠ TOKEN DECODED — SIGNATURE NOT VERIFIED</span>
          </div>
          <div class="p-xs bg-success/10 border border-success/30 text-success rounded flex items-center justify-center gap-xs">
            <span class="material-symbols-outlined text-[16px]">check_circle</span>
            <span>✓ SIGNATURE VERIFIED</span>
          </div>
        </div>
      </section>

      <!-- Section D: Live Tampering Demonstration -->
      <section class="armor-plate p-sm rounded flex flex-col gap-xs">
        <h3 class="text-primary font-headline-sm text-sm uppercase">Live Tampering Sandbox</h3>
        <p class="text-xs text-text-secondary">
          Observe how signature verification reacts to payload alterations and key changes in real time.
        </p>

        <div class="bg-bg-main p-sm rounded border border-border flex flex-col gap-sm">
          <div>
            <span class="text-xs font-code text-text-muted block mb-[2px]">JWT Token:</span>
            <div id="tamper-token-display" class="font-code text-xs break-all leading-normal"></div>
          </div>

          <div class="grid md:grid-cols-2 gap-sm text-xs font-code">
            <div>
              <span class="text-text-muted block mb-xs">Decoded Payload:</span>
              <pre id="tamper-payload-display" class="p-xs bg-surface border border-border rounded text-text-primary overflow-x-auto text-[11px]"></pre>
            </div>
            <div class="flex flex-col justify-between">
              <div>
                <span class="text-text-muted block mb-xs">Verification Key (Secret):</span>
                <input type="text" id="tamper-secret-input" class="w-full bg-surface border border-border rounded px-xs py-[2px] text-primary" value="demo-secret">
              </div>
              <div class="mt-sm">
                <span class="text-text-muted block mb-[2px]">Signature Status:</span>
                <div id="tamper-status-banner" class="p-xs font-bold text-center rounded border"></div>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-xs justify-between items-center mt-xs">
            <div class="flex gap-xs">
              <button id="tamper-btn" class="px-sm py-xs bg-danger/20 hover:bg-danger/30 text-danger border border-danger/40 rounded text-xs font-bold uppercase transition-colors cursor-pointer">
                Tamper with Payload
              </button>
              <button id="reset-tamper-btn" class="px-sm py-xs bg-surface-container-highest/50 hover:bg-surface-container-highest text-text-secondary border border-border rounded text-xs font-bold uppercase transition-colors cursor-pointer">
                Reset Demo
              </button>
            </div>
            <span class="text-[10px] text-text-muted">Uses HS256 algorithm with secret "demo-secret"</span>
          </div>

          <div id="tamper-hint-panel" class="hidden p-xs bg-primary/10 border border-primary/20 text-[11px] text-text-secondary rounded">
            <strong>Hint:</strong> Try changing the secret used to verify instead of the payload — same outcome, different cause (both cause signature validation to fail).
          </div>
        </div>
      </section>

      <!-- Section E: JWT Time Visualization -->
      <section class="armor-plate p-sm rounded flex flex-col gap-xs">
        <h3 class="text-primary font-headline-sm text-sm uppercase">JWT Time Visualization</h3>
        <p class="text-xs text-text-secondary">
          Tokens use claim values like <code class="text-primary">iat</code> (issued-at) and <code class="text-primary">exp</code> (expires) to control validity windows:
        </p>
        
        <!-- Live Timeline Demo -->
        <div class="bg-bg-main p-sm rounded border border-border flex flex-col gap-sm">
          <div class="flex justify-between items-center text-xs font-code">
            <span class="text-success">Issued: <span id="time-iat-label">Now - 5 min</span></span>
            <span id="time-status-badge" class="px-xs py-[2px] rounded text-[10px] bg-success/20 text-success border border-success/30 font-bold uppercase">Valid Token</span>
            <span class="text-danger">Expires: <span id="time-exp-label">Now + 10 min</span></span>
          </div>
          
          <div class="relative w-full h-[6px] bg-surface-container rounded-full overflow-hidden">
            <div id="time-progress-bar" class="absolute top-0 bottom-0 left-0 bg-primary shadow-sm transition-all" style="width: 33%"></div>
          </div>
          
          <div class="flex justify-between items-center text-[10px] text-text-muted font-code">
            <span>[iat]</span>
            <span id="time-now-label" class="text-primary">Current Time [now]</span>
            <span>[exp]</span>
          </div>

          <div class="flex gap-xs mt-xs">
            <button id="time-demo-valid" class="flex-1 py-xs bg-surface-container-highest/40 hover:bg-surface-container-highest text-primary border border-border text-[11px] font-bold rounded uppercase cursor-pointer transition-colors">
              Set Active Token
            </button>
            <button id="time-demo-expired" class="flex-1 py-xs bg-surface-container-highest/40 hover:bg-surface-container-highest text-danger border border-border text-[11px] font-bold rounded uppercase cursor-pointer transition-colors">
              Set Expired Token
            </button>
          </div>
        </div>
      </section>

      <!-- Section F: Pitfalls -->
      <section class="armor-plate p-sm rounded flex flex-col gap-xs">
        <h3 class="text-primary font-headline-sm text-sm uppercase">Common JWT Security Pitfalls</h3>
        <div class="grid md:grid-cols-2 gap-sm">
          <div class="p-xs border border-border rounded">
            <h4 class="text-primary text-xs font-bold mb-[2px]">1. The "alg: none" Misconfiguration</h4>
            <p class="text-[11px] text-text-secondary leading-relaxed">
              <code class="text-warning font-semibold">alg: none</code> means a JWT declares no signature algorithm — the token is unsigned. This is not automatically a vulnerability in every context, but it becomes a serious security problem when an application incorrectly accepts an unsigned token in a place where a valid signature should be required.
            </p>
          </div>
          <div class="p-xs border border-border rounded">
            <h4 class="text-primary text-xs font-bold mb-[2px]">2. Algorithm Confusion</h4>
            <p class="text-[11px] text-text-secondary leading-relaxed">
              A historical class of implementation and configuration mistakes allowed an attacker to exploit applications by submitting a token signed using a public RSA key, but declaring the algorithm was symmetric HMAC (HS256). Castle mitigates this by requiring you to explicitly declare your verification algorithm rather than blindly trusting the token's header.
            </p>
          </div>
          <div class="p-xs border border-border rounded">
            <h4 class="text-primary text-xs font-bold mb-[2px]">3. Weak/Guessable Secrets</h4>
            <p class="text-[11px] text-text-secondary leading-relaxed">
              If an HMAC secret is short or common, attackers can brute-force the secret offline using tools like hashcat. Once the secret is cracked, the attacker can sign arbitrary tokens to impersonate any user. Always use long, randomly-generated keys for signing.
            </p>
          </div>
          <div class="p-xs border border-border rounded">
            <h4 class="text-primary text-xs font-bold mb-[2px]">4. Exposing Sensitive Payload Data</h4>
            <p class="text-[11px] text-text-secondary leading-relaxed">
              Because payloads are only encoded (not encrypted), storing credit cards, SSNs, passwords, or internal database keys directly inside the token leaks this information to anyone who intercepts or holds the token.
            </p>
          </div>
        </div>
      </section>

      <!-- Section G: JWT vs Session Cookies -->
      <section class="armor-plate p-sm rounded flex flex-col gap-xs">
        <h3 class="text-primary font-headline-sm text-sm uppercase">JWT vs. Session Cookies</h3>
        <div class="grid md:grid-cols-2 gap-sm text-xs">
          <div class="p-xs border border-border/80 rounded bg-bg-main">
            <h4 class="text-primary font-bold mb-xs">Session Cookie (Stateful)</h4>
            <ul class="list-disc pl-sm space-y-[2px] text-text-secondary text-[11px]">
              <li>Server stores the session state in a database/memory.</li>
              <li>The cookie sent to the client is just a random ID (reference).</li>
              <li>Instant revocation is easy: just delete the session on the server.</li>
              <li>Requires database lookups on every single request.</li>
            </ul>
          </div>
          <div class="p-xs border border-border/80 rounded bg-bg-main">
            <h4 class="text-primary font-bold mb-xs">JSON Web Token (Stateless)</h4>
            <ul class="list-disc pl-sm space-y-[2px] text-text-secondary text-[11px]">
              <li>Self-contained: all claims are inside the token payload itself.</li>
              <li>Verifiable without database lookups using the secret/key.</li>
              <li>Revoking a token before its <code class="text-primary">exp</code> is difficult without introducing state (denylists).</li>
              <li>Increases payload size on every request.</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Section H: Honesty Note -->
      <section class="p-xs border border-border/60 bg-surface rounded text-[11px] text-text-muted">
        <strong>Honesty Note:</strong> This tool verifies HS256/HS384/HS512 signatures locally. It cannot verify RSA/ECDSA-signed tokens, cannot check a token against a live server, and cannot confirm whether an issuer is genuinely trustworthy — only that a signature does or doesn't match a secret you provide.
      </section>
    `;

    // Bind tooltip popovers
    if (window.CastleTooltip) {
      window.CastleTooltip.bind(hostContainer);
    }

    updateTamperDemo();
    updateTimelineDemo(true);
  }

  function bindEvents() {
    if (!hostContainer) return;

    // Tamper demo buttons
    const tamperBtn = hostContainer.querySelector('#tamper-btn');
    const resetTamperBtn = hostContainer.querySelector('#reset-tamper-btn');
    const secretInput = hostContainer.querySelector('#tamper-secret-input');
    const validTimeBtn = hostContainer.querySelector('#time-demo-valid');
    const expiredTimeBtn = hostContainer.querySelector('#time-demo-expired');

    if (tamperBtn) {
      tamperBtn.addEventListener('click', () => {
        isTampered = true;
        updateTamperDemo();
      });
    }

    if (resetTamperBtn) {
      resetTamperBtn.addEventListener('click', () => {
        isTampered = false;
        customSecretVal = "demo-secret";
        if (secretInput) secretInput.value = "demo-secret";
        updateTamperDemo();
      });
    }

    if (secretInput) {
      secretInput.addEventListener('input', (e) => {
        customSecretVal = e.target.value;
        updateTamperDemo();
      });
    }

    // Time demo buttons
    if (validTimeBtn) {
      validTimeBtn.addEventListener('click', () => {
        updateTimelineDemo(true);
      });
    }

    if (expiredTimeBtn) {
      expiredTimeBtn.addEventListener('click', () => {
        updateTimelineDemo(false);
      });
    }
  }

  function updateTamperDemo() {
    const tokenDisplay = hostContainer.querySelector('#tamper-token-display');
    const payloadDisplay = hostContainer.querySelector('#tamper-payload-display');
    const statusBanner = hostContainer.querySelector('#tamper-status-banner');
    const hintPanel = hostContainer.querySelector('#tamper-hint-panel');

    if (!tokenDisplay || !payloadDisplay || !statusBanner) return;

    const headerB64 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
    const sigB64 = "Mroc1BHDhuLnS-9PwiK9zUgt2sE6zyBgrpy1Py3VmkA"; // Original signature for "user" and "demo-secret"

    let payloadJson, payloadB64;
    if (isTampered) {
      payloadJson = '{\n  "sub": "alice123",\n  "role": "admin"\n}';
      payloadB64 = "eyJzdWIiOiJhbGljZTEyMyIsInJvbGUiOiJhZG1pbiJ9";
      if (hintPanel) hintPanel.classList.remove('hidden');
    } else {
      payloadJson = '{\n  "sub": "alice123",\n  "role": "user"\n}';
      payloadB64 = "eyJzdWIiOiJhbGljZTEyMyIsInJvbGUiOiJ1c2VyIn0";
      if (hintPanel) hintPanel.classList.add('hidden');
    }

    // Render token
    tokenDisplay.innerHTML = `
      <span class="text-danger">${headerB64}</span><span class="text-text-muted">.</span><span class="text-primary underline font-bold">${payloadB64}</span><span class="text-text-muted">.</span><span class="text-info">${sigB64}</span>
    `;

    // Render payload json
    payloadDisplay.textContent = payloadJson;

    // Check status
    // If payload is unchanged and secret is "demo-secret", it is VALID
    const isSecretCorrect = (customSecretVal === "demo-secret");
    const isValid = !isTampered && isSecretCorrect;

    if (isValid) {
      statusBanner.textContent = "✓ SIGNATURE VERIFIED";
      statusBanner.className = "p-xs font-bold text-center rounded border bg-success/10 border-success/30 text-success text-xs";
    } else {
      let reason = "wrong secret";
      if (isTampered && !isSecretCorrect) reason = "tampered payload AND wrong secret";
      else if (isTampered) reason = "tampered payload (signature doesn't match modified data)";
      
      statusBanner.textContent = `✗ SIGNATURE INVALID — ${reason}`;
      statusBanner.className = "p-xs font-bold text-center rounded border bg-danger/10 border-danger/30 text-danger text-xs";
    }
  }

  function updateTimelineDemo(isValidToken) {
    const iatLabel = hostContainer.querySelector('#time-iat-label');
    const expLabel = hostContainer.querySelector('#time-exp-label');
    const statusBadge = hostContainer.querySelector('#time-status-badge');
    const progressBar = hostContainer.querySelector('#time-progress-bar');
    const nowLabel = hostContainer.querySelector('#time-now-label');

    if (!iatLabel || !expLabel || !statusBadge || !progressBar) return;

    const formatTime = (date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const now = new Date();
    if (isValidToken) {
      const iatDate = new Date(now.getTime() - 5 * 60 * 1000); // 5 min ago
      const expDate = new Date(now.getTime() + 10 * 60 * 1000); // 10 min from now

      iatLabel.textContent = formatTime(iatDate);
      expLabel.textContent = formatTime(expDate);

      statusBadge.textContent = "Valid Token";
      statusBadge.className = "px-xs py-[2px] rounded text-[10px] bg-success/20 text-success border border-success/30 font-bold uppercase";
      
      // Calculate progress percentage: 5 mins elapsed out of 15 total (33.3%)
      progressBar.style.width = "33.3%";
      progressBar.className = "absolute top-0 bottom-0 left-0 bg-primary shadow-sm transition-all";
      if (nowLabel) nowLabel.textContent = `Current Time (${formatTime(now)})`;
    } else {
      const iatDate = new Date(now.getTime() - 15 * 60 * 1000); // 15 min ago
      const expDate = new Date(now.getTime() - 5 * 60 * 1000); // 5 min ago (expired)

      iatLabel.textContent = formatTime(iatDate);
      expLabel.textContent = formatTime(expDate);

      statusBadge.textContent = "Expired Token";
      statusBadge.className = "px-xs py-[2px] rounded text-[10px] bg-danger/20 text-danger border border-danger/30 font-bold uppercase";
      
      // Expired: progress is 100% since Now is past Expire
      progressBar.style.width = "100%";
      progressBar.className = "absolute top-0 bottom-0 left-0 bg-danger shadow-sm transition-all";
      if (nowLabel) nowLabel.textContent = `Current Time (${formatTime(now)}) - PAST EXPIRE`;
    }
  }

  // Export methods
  exports.init = init;

})(window.CastleJwtLearn);
