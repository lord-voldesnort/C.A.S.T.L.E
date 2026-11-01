/*
 * JWT Decoder & Verifier UI Manager.
 * Dynamically inserts the JWT workspace modal, manages tabs with ARIA accessibility,
 * and clears sensitive in-memory data on close.
 */

window.CastleJwtUI = window.CastleJwtUI || {};

(function(root) {
  'use strict';

  let initialized = false;
  let activeTab = 'learn';

  function init() {
    if (initialized) return;
    initialized = true;

    insertModalHTML();
    setupTabNavigation();
    setupModalEvents();

    // Initialize individual tab logics
    if (root.CastleJwtLearn) root.CastleJwtLearn.init(document.getElementById('jwt-tab-panel-learn'));
    if (root.CastleJwtDecode) root.CastleJwtDecode.init();
    if (root.CastleJwtBuild) root.CastleJwtBuild.init();
  }

  function insertModalHTML() {
    const modalHTML = `
      <div id="jwt-modal" class="fixed inset-0 z-50 flex items-center justify-center p-xs md:p-md hidden">
        <div id="jwt-backdrop" class="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
        <div class="armor-plate bg-surface border border-border/90 rounded-lg p-sm md:p-md max-w-3xl w-full my-auto shadow-2xl relative z-10 flex flex-col gap-sm max-h-[92vh] overflow-y-auto">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between gap-sm">
            <div>
              <p class="text-primary text-[10px] font-code uppercase tracking-wider">Web Security workspace</p>
              <h2 class="font-headline-sm text-lg text-text-primary uppercase">JWT Decoder & Verifier</h2>
            </div>
            <button id="jwt-close" class="text-text-muted hover:text-primary p-xs cursor-pointer" title="Close JWT Decoder & Verifier" aria-label="Close JWT Decoder & Verifier">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Privacy Banner -->
          <div class="p-xs border border-primary/30 bg-primary/5 text-xs text-text-secondary rounded leading-relaxed">
            Castle itself makes zero network requests involving your token, secret, or decoded data — everything is processed locally in your browser. 
            <span class="text-primary font-semibold">Closing or resetting this tool clears the token and secret from the page's active state.</span>
          </div>

          <!-- Tab Bar -->
          <div role="tablist" aria-label="JWT Toolkit tabs" class="flex gap-xs bg-bg-main p-xs rounded border border-border/60">
            <button role="tab" aria-selected="true" aria-controls="jwt-tab-panel-learn" data-tab-name="learn" tabindex="0" class="flex-1 py-xs md:py-sm px-md text-xs md:text-sm font-headline-sm font-semibold rounded border border-primary bg-primary/20 text-primary transition-all uppercase cursor-pointer outline-none focus:ring-1 focus:ring-primary">
              Learn
            </button>
            <button role="tab" aria-selected="false" aria-controls="jwt-tab-panel-decode" data-tab-name="decode" tabindex="-1" class="flex-1 py-xs md:py-sm px-md text-xs md:text-sm font-headline-sm font-semibold rounded border border-border/50 bg-surface-container-lowest text-text-secondary hover:text-on-surface hover:border-outline transition-all uppercase cursor-pointer outline-none focus:ring-1 focus:ring-primary">
              Decode & Verify
            </button>
            <button role="tab" aria-selected="false" aria-controls="jwt-tab-panel-build" data-tab-name="build" tabindex="-1" class="flex-1 py-xs md:py-sm px-md text-xs md:text-sm font-headline-sm font-semibold rounded border border-border/50 bg-surface-container-lowest text-text-secondary hover:text-on-surface hover:border-outline transition-all uppercase cursor-pointer outline-none focus:ring-1 focus:ring-primary">
              Build
            </button>
          </div>

          <!-- Tab 1: Learn -->
          <div id="jwt-tab-panel-learn" data-jwt-panel="learn" role="tabpanel" class="flex flex-col gap-sm">
            <!-- Rendered by learn.js -->
          </div>

          <!-- Tab 2: Decode & Verify -->
          <div id="jwt-tab-panel-decode" data-jwt-panel="decode" role="tabpanel" class="hidden flex flex-col gap-sm">
            <div class="flex flex-col gap-xs">
              <label for="jwt-input" class="text-xs font-code text-primary uppercase">Paste JWT Token:</label>
              <textarea id="jwt-input" class="w-full min-h-24 bg-bg-main border border-border rounded p-sm text-xs font-code text-text-primary outline-none focus:border-primary/50" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"></pre></textarea>
            </div>

            <!-- Error Banner -->
            <div id="jwt-error-container" class="hidden p-xs bg-danger/10 border border-danger/30 text-danger text-xs font-code rounded"></div>

            <!-- Initial state message -->
            <div id="jwt-empty-container" class="text-center py-md border border-dashed border-border rounded text-xs text-text-muted font-code">
              Waiting for JWT input... Paste a token above to analyze its claims and structure.
            </div>

            <!-- Parsed Results Container -->
            <div id="jwt-results-container" class="hidden flex flex-col gap-sm">
              
              <!-- One line English summary (P1) -->
              <div class="p-xs bg-surface-container border border-border/80 rounded text-xs font-semibold text-primary font-code" id="jwt-one-line-summary"></div>

              <!-- Duplicate warning banner -->
              <div id="jwt-duplicate-warning" class="hidden p-xs bg-warning/10 border border-warning/30 text-warning text-xs font-code rounded"></div>

              <!-- Signature Verification results banner -->
              <div id="jwt-status-banner" class="p-sm font-bold text-center rounded border text-xs"></div>

              <!-- Live Expiry banner (P1) -->
              <div id="jwt-live-countdown-container" class="hidden">
                <span id="jwt-live-countdown-value"></span>
              </div>

              <!-- Decoded Output Layout -->
              <div class="grid md:grid-cols-2 gap-sm">
                <div class="armor-plate p-sm rounded flex flex-col h-full gap-xs">
                  <span class="text-xs text-danger font-bold font-code">Header (Decoded)</span>
                  <pre id="jwt-header-json" class="p-xs bg-bg-main border border-border rounded text-text-primary text-[10px] font-code overflow-x-auto select-text"></pre>
                </div>
                <div class="armor-plate p-sm rounded flex flex-col h-full gap-xs">
                  <span class="text-xs text-primary font-bold font-code">Payload (Decoded)</span>
                  <pre id="jwt-payload-json" class="p-xs bg-bg-main border border-border rounded text-text-primary text-[10px] font-code overflow-x-auto select-text"></pre>
                </div>
              </div>

              <div class="text-[10px] text-text-muted italic px-xs">
                Base64URL is ENCODING, not encryption. Anyone can decode a JWT's header and payload without any secret or key — decoding just reverses the encoding.
              </div>

              <!-- Secret Verification inputs -->
              <div class="armor-plate p-sm rounded flex flex-col gap-sm border-border/85">
                <h3 class="text-primary font-headline-sm text-xs uppercase">Verify Signature (HMAC)</h3>
                
                <div class="grid md:grid-cols-2 gap-sm">
                  <div class="flex flex-col gap-xs">
                    <label for="jwt-alg-select" class="text-[11px] font-code text-text-secondary">Expected Algorithm:</label>
                    <select id="jwt-alg-select" class="bg-bg-main border border-border text-xs rounded p-xs text-text-primary outline-none cursor-pointer">
                      <option value="HS256">HS256 (HMAC-SHA256)</option>
                      <option value="HS384">HS384 (HMAC-SHA384)</option>
                      <option value="HS512">HS512 (HMAC-SHA512)</option>
                    </select>
                    <span class="text-[10px] text-text-muted mt-[2px] leading-relaxed">
                      The algorithm a token claims should not automatically be trusted — applications should explicitly decide which algorithms they accept.
                    </span>
                  </div>

                  <div class="flex flex-col gap-xs">
                    <label for="jwt-secret-input" class="text-[11px] font-code text-text-secondary">HMAC Secret (Text/UTF-8):</label>
                    <input type="password" id="jwt-secret-input" class="bg-bg-main border border-border text-xs rounded p-xs text-text-primary outline-none" placeholder="Enter signing secret">
                  </div>
                </div>

                <!-- Alg validation banners -->
                <div id="jwt-algnone-warning" class="hidden p-xs bg-danger/10 border border-danger/30 text-danger text-xs rounded leading-relaxed font-code">
                  ⚠ This token's header declares no signature algorithm (alg: none) — it is unsigned. Never treat an unsigned token as verified.
                </div>
                <div id="jwt-unsupported-warning" class="hidden p-xs bg-warning/10 border border-warning/30 text-warning text-xs rounded leading-relaxed font-code"></div>
              </div>

              <!-- Token Checklist Panel -->
              <div class="armor-plate p-sm rounded flex flex-col gap-xs">
                <h3 class="text-primary font-headline-sm text-xs uppercase">Token Status Panel</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-sm text-[11px] font-code mt-xs">
                  <div class="p-xs bg-bg-main border border-border rounded flex flex-col justify-between">
                    <span class="text-text-muted">Structure</span>
                    <span class="text-success font-bold mt-xs">✓ Valid Structure</span>
                  </div>
                  <div class="p-xs bg-bg-main border border-border rounded flex flex-col justify-between">
                    <span class="text-text-muted">Algorithm</span>
                    <span id="jwt-status-alg" class="mt-xs"></span>
                  </div>
                  <div class="p-xs bg-bg-main border border-border rounded flex flex-col justify-between">
                    <span class="text-text-muted">Expiration (exp)</span>
                    <span id="jwt-status-expiry" class="mt-xs"></span>
                  </div>
                  <div class="p-xs bg-bg-main border border-border rounded flex flex-col justify-between">
                    <span class="text-text-muted">Signature</span>
                    <span id="jwt-status-signature" class="mt-xs text-text-muted">—</span>
                  </div>
                  <div class="p-xs bg-bg-main border border-border rounded flex flex-col justify-between">
                    <span class="text-text-muted">Secret strength</span>
                    <span id="jwt-status-secret" class="mt-xs text-text-muted">—</span>
                  </div>
                  <div class="p-xs bg-bg-main border border-border rounded flex flex-col justify-between col-span-1 md:col-span-3">
                    <span class="text-text-muted">Sensitive Fields Scan</span>
                    <span id="jwt-status-sensitive" class="mt-xs text-text-muted">—</span>
                  </div>
                </div>
              </div>

              <!-- Collapsible Technical Details (Progressive Disclosure) -->
              <div class="space-y-xs">
                <details class="armor-plate p-sm rounded cursor-pointer select-none">
                  <summary class="text-primary text-xs font-bold font-headline-sm uppercase">Claims Details & Translations</summary>
                  <div id="jwt-claims-explainer" class="mt-sm space-y-xs select-text cursor-default"></div>
                </details>

                <details class="armor-plate p-sm rounded cursor-pointer select-none">
                  <summary class="text-primary text-xs font-bold font-headline-sm uppercase">Sensitive Data Analysis</summary>
                  <div id="jwt-sensitive-fields" class="mt-sm select-text cursor-default"></div>
                </details>

                <details class="armor-plate p-sm rounded cursor-pointer select-none">
                  <summary class="text-primary text-xs font-bold font-headline-sm uppercase">HMAC Secret Strength Estimate</summary>
                  <div id="jwt-secret-strength" class="mt-sm select-text cursor-default"></div>
                </details>

                <details class="armor-plate p-sm rounded cursor-pointer select-none">
                  <summary class="text-primary text-xs font-bold font-headline-sm uppercase">Authorization Header Preview</summary>
                  <div class="mt-sm flex flex-col gap-xs select-text cursor-default">
                    <code id="jwt-auth-header" class="p-xs bg-bg-main border border-border rounded text-[11px] font-code break-all text-text-primary"></code>
                    <button id="jwt-copy-auth-btn" class="px-sm py-xs bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 text-[10px] font-bold uppercase rounded cursor-pointer self-start transition-colors">
                      Copy Header
                    </button>
                  </div>
                </details>
              </div>

              <!-- Reset Actions -->
              <div class="flex gap-xs mt-xs">
                <button id="jwt-reset-btn" class="px-md py-sm bg-surface-container-highest/60 hover:bg-surface-container-highest border border-border text-text-secondary text-xs font-bold uppercase rounded cursor-pointer transition-colors">
                  Reset Form
                </button>
              </div>

            </div>
          </div>

          <!-- Tab 3: Build -->
          <div id="jwt-tab-panel-build" data-jwt-panel="build" role="tabpanel" class="hidden flex flex-col gap-sm">
            <div class="p-xs bg-surface-container border border-border/80 text-[11px] text-text-secondary rounded leading-relaxed">
              <strong>Local Generation:</strong> This form creates and signs JWT tokens completely in your browser. 
              The signature is calculated using the standard SubtleCrypto HMAC engine and your provided secret.
            </div>

            <!-- Build Error Banner -->
            <div id="jwt-build-error" class="hidden p-xs bg-danger/10 border border-danger/30 text-danger text-xs font-code rounded"></div>

            <!-- Configuration Fields -->
            <div class="grid md:grid-cols-2 gap-sm">
              <div class="flex flex-col gap-xs">
                <label for="jwt-build-sub" class="text-[11px] font-code text-primary uppercase">Subject (sub):</label>
                <input type="text" id="jwt-build-sub" class="bg-bg-main border border-border text-xs rounded p-xs text-text-primary outline-none focus:border-primary/50">
              </div>

              <div class="flex flex-col gap-xs">
                <label for="jwt-build-role" class="text-[11px] font-code text-primary uppercase">Custom Claim (role):</label>
                <input type="text" id="jwt-build-role" class="bg-bg-main border border-border text-xs rounded p-xs text-text-primary outline-none focus:border-primary/50">
              </div>

              <div class="flex flex-col gap-xs">
                <label for="jwt-build-iss" class="text-[11px] font-code text-primary uppercase">Issuer (iss):</label>
                <input type="text" id="jwt-build-iss" class="bg-bg-main border border-border text-xs rounded p-xs text-text-primary outline-none focus:border-primary/50">
              </div>

              <div class="flex flex-col gap-xs">
                <label for="jwt-build-exp" class="text-[11px] font-code text-primary uppercase">Expires In:</label>
                <select id="jwt-build-exp" class="bg-bg-main border border-border text-xs rounded p-xs text-text-primary outline-none cursor-pointer">
                  <option value="900">15 Minutes</option>
                  <option value="3600">1 Hour</option>
                  <option value="86400">1 Day</option>
                  <option value="604800">7 Days</option>
                </select>
              </div>

              <div class="flex flex-col gap-xs">
                <label for="jwt-build-alg" class="text-[11px] font-code text-primary uppercase">Signature Algorithm:</label>
                <select id="jwt-build-alg" class="bg-bg-main border border-border text-xs rounded p-xs text-text-primary outline-none cursor-pointer">
                  <option value="HS256">HS256 (HMAC-SHA256)</option>
                  <option value="HS384">HS384 (HMAC-SHA384)</option>
                  <option value="HS512">HS512 (HMAC-SHA512)</option>
                </select>
              </div>

              <div class="flex flex-col gap-xs">
                <label for="jwt-build-iat" class="text-[11px] font-code text-primary uppercase">Issued At epoch (iat):</label>
                <input type="number" id="jwt-build-iat" class="bg-bg-main border border-border text-xs rounded p-xs text-text-primary outline-none focus:border-primary/50">
              </div>

              <div class="flex flex-col gap-xs md:col-span-2">
                <label for="jwt-build-secret" class="text-[11px] font-code text-primary uppercase">HMAC Signing Secret (Required):</label>
                <input type="password" id="jwt-build-secret" class="bg-bg-main border border-border text-xs rounded p-xs text-text-primary outline-none focus:border-primary/50" placeholder="Enter password/secret to sign with">
              </div>
            </div>

            <div class="flex gap-xs">
              <button id="jwt-build-generate-btn" class="flex-1 py-xs md:py-sm bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 font-label-md rounded uppercase cursor-pointer transition-colors text-xs font-bold">
                Generate Signed JWT
              </button>
              <button id="jwt-build-reset-btn" class="px-sm py-xs bg-surface-container-highest/60 hover:bg-surface-container-highest border border-border text-text-secondary font-label-md rounded uppercase cursor-pointer transition-colors text-xs">
                Reset
              </button>
            </div>

            <!-- Build Output Container -->
            <div id="jwt-build-output-container" class="hidden flex flex-col gap-sm border-t border-border pt-sm">
              <div class="grid md:grid-cols-2 gap-sm">
                <div class="armor-plate p-xs rounded flex flex-col gap-xs">
                  <span class="text-xs text-danger font-bold font-code">Generated Header</span>
                  <pre id="jwt-build-header-out" class="p-xs bg-bg-main border border-border rounded text-[10px] font-code overflow-x-auto text-text-primary"></pre>
                </div>
                <div class="armor-plate p-xs rounded flex flex-col gap-xs">
                  <span class="text-xs text-primary font-bold font-code">Generated Payload</span>
                  <pre id="jwt-build-payload-out" class="p-xs bg-bg-main border border-border rounded text-[10px] font-code overflow-x-auto text-text-primary"></pre>
                </div>
              </div>

              <div class="flex flex-col gap-xs">
                <label for="jwt-build-token-out" class="text-[11px] font-code text-success uppercase">Generated Signed Token:</label>
                <textarea id="jwt-build-token-out" readonly class="w-full min-h-16 bg-bg-main border border-success/30 rounded p-sm text-xs font-code text-success select-all outline-none"></textarea>
              </div>

              <div class="flex gap-xs">
                <button id="jwt-build-copy-token-btn" class="py-xs px-sm bg-success/20 hover:bg-success/30 text-success border border-success/50 font-bold uppercase rounded text-xs cursor-pointer transition-colors">
                  Copy Signed Token
                </button>
                <button id="jwt-build-analyze-btn" class="py-xs px-sm bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 font-bold uppercase rounded text-xs cursor-pointer transition-colors">
                  Analyze this token →
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  function setupTabNavigation() {
    const tabList = document.querySelector('#jwt-modal [role="tablist"]');
    const tabs = document.querySelectorAll('#jwt-modal [role="tab"]');

    if (!tabs || tabs.length === 0) return;

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        selectTab(tab.getAttribute('data-tab-name'));
      });

      tab.addEventListener('keydown', (e) => {
        let targetIndex = null;
        if (e.key === 'ArrowRight') {
          targetIndex = (index + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft') {
          targetIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
          targetIndex = 0;
        } else if (e.key === 'End') {
          targetIndex = tabs.length - 1;
        }

        if (targetIndex !== null) {
          e.preventDefault();
          tabs[targetIndex].focus();
          selectTab(tabs[targetIndex].getAttribute('data-tab-name'));
        }
      });
    });
  }

  function selectTab(tabName) {
    if (!tabName) return;
    activeTab = tabName;

    const tabs = document.querySelectorAll('#jwt-modal [role="tab"]');
    const panels = {
      'learn': document.getElementById('jwt-tab-panel-learn'),
      'decode': document.getElementById('jwt-tab-panel-decode'),
      'build': document.getElementById('jwt-tab-panel-build')
    };

    tabs.forEach(tab => {
      const name = tab.getAttribute('data-tab-name');
      const isSelected = name === tabName;

      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');

      if (isSelected) {
        tab.className = 'flex-1 py-xs md:py-sm px-md text-xs md:text-sm font-headline-sm font-semibold rounded border border-primary bg-primary/20 text-primary transition-all flex items-center justify-center gap-xs uppercase tracking-wider cursor-pointer outline-none focus:ring-1 focus:ring-primary';
      } else {
        tab.className = 'flex-1 py-xs md:py-sm px-md text-xs md:text-sm font-headline-sm font-semibold rounded border border-border/50 bg-surface-container-lowest text-text-secondary hover:text-on-surface hover:border-outline transition-all flex items-center justify-center gap-xs uppercase tracking-wider cursor-pointer outline-none focus:ring-1 focus:ring-primary';
      }
    });

    Object.keys(panels).forEach(key => {
      if (panels[key]) {
        if (key === tabName) {
          panels[key].classList.remove('hidden');
        } else {
          panels[key].classList.add('hidden');
        }
      }
    });
  }

  function setupModalEvents() {
    const modal = document.getElementById('jwt-modal');
    const closeBtn = document.getElementById('jwt-close');
    const backdrop = document.getElementById('jwt-backdrop');

    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) close();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        close();
      }
    });
  }

  function open() {
    init(); // Ensure modal is inserted and initialized
    const modal = document.getElementById('jwt-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      selectTab('learn');
    }
  }

  function close() {
    const modal = document.getElementById('jwt-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      
      // Wipe sensitive state on close to guarantee privacy
      if (window.CastleJwtDecode) window.CastleJwtDecode.resetState();
      if (window.CastleJwtBuild) window.CastleJwtBuild.resetState();
    }
  }

  // Expose triggers
  root.openJwtModal = open;
  root.closeJwtModal = close;

})(window);
