/**
 * ============================================================================
 * CASTLE — Cybersecurity Toolkit: Horizontal Tool Showcase Engine
 * File: js/showcase.js
 * Version: 2.1.0 (Interaction Reliability & Card Click Polish)
 * ============================================================================
 * 
 * Provides:
 * 1. Mathematically Exact Vertical-to-Horizontal Scroll Translation
 *    - Uses exact coordinate calculation: T(t) = T_0 + t * (T_N - T_0)
 *    - First card and last card are centered on any viewport width
 *    - 8% Entry and Exit buffers (deadbands) for stable resting states
 * 2. Rock-Solid Hover Detection
 *    - Stable outer hit-testing shell (.showcase-card) decoupled from animated inner plate (.showcase-card-inner)
 *    - Hit-testing works across 100% of the card surface (all edges and 4 corners)
 *    - Global pointer tracking detects cards sliding underneath stationary cursors during scroll
 * 3. Directional 3D Perspective Tilt & Specular Optical Sheen
 *    - Smooth gravity-like dip where pressed
 *    - Ambient float smoothly locks out upon hover (Hover Priority)
 * 4. 100% Reliable Card Launching
 *    - Dual-path gesture detection: native click + pointerdown/pointerup tap detection (< 450ms, < 25px)
 *    - Direct delegation to debounced window.castleLaunchTool
 *    - Keyboard activation (Enter / Space)
 * 5. Focal Depth & Step Indicator Synchronization
 * 6. Dynamic Search and Category Filter Integration
 * 7. Mobile & prefers-reduced-motion Handling
 */

(function(root) {
  'use strict';

  class CastleHorizontalShowcase {
    constructor(config = {}) {
      this.config = Object.assign({
        entryBuffer: 0.08,        // 8% scroll dead zone at start (Card 0 stays resting)
        exitBuffer: 0.08,         // 8% scroll dead zone at end (Card 4 stays resting)
        floatAmplitudeY: 8,       // Ambient vertical float (px)
        maxTiltDeg: 7.5,          // Max 3D cursor tilt (deg)
        lerpFactor: 0.10,         // Smooth horizontal momentum damping
        mobileBreakpoint: 768     // Viewport width at which mobile stack is activated
      }, config);

      this.runwayEl = null;
      this.viewportEl = null;
      this.stageEl = null;
      this.trackEl = null;
      this.cardEls = [];
      this.stepEls = [];
      this.prevBtn = null;
      this.nextBtn = null;

      // Coordinate metrics
      this.viewportWidth = 0;
      this.cardCenters = [];      // Center X coordinate of each card relative to track
      this.minTranslateX = 0;     // Translation when last card is centered
      this.maxTranslateX = 0;     // Translation when first card is centered

      // Runtime states
      this.scrollProgress = 0;    // Raw progress through runway [0, 1]
      this.horizontalProgress = 0;// Clamped progress between buffers [0, 1]
      this.targetTranslateX = 0;
      this.currentTranslateX = 0;
      this.activeCardIndex = 0;
      this.hoveredCardIndex = -1;

      // Pointer tracking for stationary cursor support & resilient tap detection
      this.pointerX = -9999;
      this.pointerY = -9999;
      this.pointerActive = false;
      this.activePointerGesture = null;

      this.isMobile = false;
      this.reducedMotion = false;
      this.cardsState = [];

      this.animationFrameId = null;
      this.lastTimestamp = performance.now();
      this.isInitialized = false;
    }

    init(runwaySelector = '#showcase-runway', trackSelector = '#showcase-track') {
      this.runwayEl = document.querySelector(runwaySelector);
      this.trackEl = document.querySelector(trackSelector);
      this.viewportEl = document.querySelector('.showcase-sticky-viewport');
      this.stageEl = document.querySelector('.showcase-stage-area');
      this.cardEls = Array.from(document.querySelectorAll('.showcase-card'));
      this.stepEls = Array.from(document.querySelectorAll('.showcase-step-btn'));
      this.prevBtn = document.getElementById('showcase-nav-prev');
      this.nextBtn = document.getElementById('showcase-nav-next');

      if (!this.runwayEl || !this.trackEl || this.cardEls.length === 0) {
        return;
      }

      // Check system reduced-motion preference
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = motionQuery.matches;
      motionQuery.addEventListener('change', (e) => {
        this.reducedMotion = e.matches;
        this.updateCardTransforms(performance.now());
      });

      // Initialize card state records
      this.cardsState = this.cardEls.map((cardEl, idx) => {
        const innerEl = cardEl.querySelector('.showcase-card-inner') || cardEl;
        const sheenEl = cardEl.querySelector('.card-sheen');
        return {
          index: idx,
          cardEl: cardEl,
          innerEl: innerEl,
          sheenEl: sheenEl,
          floatPhase: idx * 1.6180339887 * Math.PI * 2, // Golden-ratio phase detuning
          tiltX: 0,
          tiltY: 0,
          targetTiltX: 0,
          targetTiltY: 0,
          isHovered: false,
          currentFloatY: 0
        };
      });

      this.checkMobile();
      this.measureLayout();
      this.bindScroll();
      this.bindResize();
      this.bindPointerTracking();
      this.bindCardInteractions();
      this.bindStepNavigation();
      this.bindQuickNavArrows();

      // Launch 60/120fps render loop
      this.isInitialized = true;
      this.tick = this.tick.bind(this);
      this.animationFrameId = requestAnimationFrame(this.tick);
    }

    checkMobile() {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= this.config.mobileBreakpoint;
      if (this.isMobile && !wasMobile) {
        if (this.trackEl) this.trackEl.style.transform = '';
        this.cardsState.forEach(state => {
          if (state.innerEl) state.innerEl.style.transform = '';
          state.cardEl.classList.remove('is-active', 'is-inactive', 'is-hovered');
        });
      }
    }

    measureLayout() {
      if (this.isMobile || !this.stageEl || !this.trackEl) return;

      this.viewportWidth = this.stageEl.clientWidth || window.innerWidth;
      const visibleCards = this.cardEls.filter(el => !el.classList.contains('hidden') && el.style.display !== 'none');
      if (visibleCards.length === 0) return;

      // Compute center X of each visible card relative to track
      this.cardCenters = visibleCards.map(card => {
        return card.offsetLeft + card.offsetWidth / 2;
      });

      const firstCenter = this.cardCenters[0];
      const lastCenter = this.cardCenters[this.cardCenters.length - 1];

      // Exact translation to center a card: T = (viewportWidth / 2) - cardCenter
      this.maxTranslateX = (this.viewportWidth / 2) - firstCenter;
      this.minTranslateX = (this.viewportWidth / 2) - lastCenter;

      if (visibleCards.length === 1) {
        this.minTranslateX = this.maxTranslateX;
      }

      this.updateScrollPositions();
    }

    bindScroll() {
      const onScroll = () => {
        if (this.isMobile || !this.runwayEl) return;
        this.updateScrollPositions();
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      this.updateScrollPositions();
    }

    updateScrollPositions() {
      if (this.isMobile || !this.runwayEl) return;

      const runwayRect = this.runwayEl.getBoundingClientRect();
      const runwayHeight = this.runwayEl.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Sticky top offset is 64px (h-16 header)
      const stickyTopOffset = 64;
      const scrollableDistance = runwayHeight - (viewportHeight - stickyTopOffset);

      if (scrollableDistance <= 0) return;

      // Current scroll depth through the runway [0, scrollableDistance]
      const currentScroll = Math.max(0, Math.min(scrollableDistance, stickyTopOffset - runwayRect.top));
      const rawProgress = currentScroll / scrollableDistance;
      this.scrollProgress = rawProgress;

      // Apply Entry & Exit Boundary Buffers
      const entry = this.config.entryBuffer;
      const exit = this.config.exitBuffer;

      let mappedT = 0;
      if (rawProgress <= entry) {
        mappedT = 0; // Card 1 stays rested and centered
      } else if (rawProgress >= 1 - exit) {
        mappedT = 1; // Card 5 stays rested and centered
      } else {
        mappedT = (rawProgress - entry) / (1 - entry - exit);
      }

      this.horizontalProgress = mappedT;

      // Exact coordinate interpolation between Card 1 centered and Card 5 centered
      this.targetTranslateX = this.maxTranslateX + mappedT * (this.minTranslateX - this.maxTranslateX);
    }

    bindResize() {
      let timer = null;
      window.addEventListener('resize', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          this.checkMobile();
          this.measureLayout();
        }, 120);
      });
    }

    /**
     * Global pointer tracking for stationary cursor support & resilient tap detection.
     * When user scrolls without moving mouse, track translates under stationary cursor.
     * This ensures the card under the cursor is detected and hovered immediately.
     */
    bindPointerTracking() {
      window.addEventListener('pointermove', (e) => {
        this.pointerX = e.clientX;
        this.pointerY = e.clientY;
        this.pointerActive = true;
        this.checkHoverUnderPointer(e.clientX, e.clientY);
      }, { passive: true });

      window.addEventListener('pointerleave', () => {
        this.pointerActive = false;
        this.pointerX = -9999;
        this.pointerY = -9999;
        this.clearAllHovers();
      });

      // Dual-path tap gesture completion
      window.addEventListener('pointerup', (e) => {
        if (!this.activePointerGesture) return;
        const gesture = this.activePointerGesture;
        this.activePointerGesture = null;

        const elapsed = performance.now() - gesture.startTime;
        const travel = Math.hypot(e.clientX - gesture.startX, e.clientY - gesture.startY);

        // Intentional tap threshold (< 450ms, < 25px drift)
        if (elapsed < 450 && travel < 25) {
          this.launchCardTool(gesture.cardEl);
        }
      }, { passive: true });

      window.addEventListener('pointercancel', () => {
        this.activePointerGesture = null;
      });
    }

    /**
     * Hit tests the current pointer against unrotated card bounding boxes.
     */
    checkHoverUnderPointer(x, y) {
      if (this.isMobile) return;

      let hoveredIdx = -1;
      const numCards = this.cardsState.length;

      for (let i = 0; i < numCards; i++) {
        const state = this.cardsState[i];
        const cardEl = state.cardEl;
        if (cardEl.classList.contains('hidden') || cardEl.style.display === 'none') {
          continue;
        }

        const rect = cardEl.getBoundingClientRect();
        // Check if pointer is within the stable outer container (edges and corners included)
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          hoveredIdx = i;

          // Normalized offset from card center in [-1, 1]
          const halfW = rect.width / 2;
          const halfH = rect.height / 2;
          const normX = Math.max(-1, Math.min(1, (x - (rect.left + halfW)) / halfW));
          const normY = Math.max(-1, Math.min(1, (y - (rect.top + halfH)) / halfH));

          // Physical gravity-like dip where pressed
          state.targetTiltY = normX * this.config.maxTiltDeg;
          state.targetTiltX = -normY * this.config.maxTiltDeg;

          // Update specular optical sheen reflection
          if (state.sheenEl) {
            const sheenX = ((normX + 1) / 2) * 100;
            const sheenY = ((normY + 1) / 2) * 100;
            state.sheenEl.style.background = `radial-gradient(circle at ${sheenX.toFixed(1)}% ${sheenY.toFixed(1)}%, rgba(255, 106, 0, 0.28), transparent 60%)`;
          }
          break;
        }
      }

      this.hoveredCardIndex = hoveredIdx;

      for (let i = 0; i < numCards; i++) {
        const state = this.cardsState[i];
        const isThisHovered = (i === hoveredIdx);
        state.isHovered = isThisHovered;
        state.cardEl.classList.toggle('is-hovered', isThisHovered);

        if (!isThisHovered) {
          state.targetTiltX = 0;
          state.targetTiltY = 0;
        }
      }
    }

    clearAllHovers() {
      this.hoveredCardIndex = -1;
      this.cardsState.forEach(state => {
        state.isHovered = false;
        state.targetTiltX = 0;
        state.targetTiltY = 0;
        state.cardEl.classList.remove('is-hovered');
      });
    }

    /**
     * Binds mouse, touch, pointer, and keyboard activation to cards.
     */
    bindCardInteractions() {
      this.cardEls.forEach((cardEl, idx) => {
        const state = this.cardsState[idx];
        if (!state) return;

        // Pointerdown gesture tracking for resilient click detection even during movement
        cardEl.addEventListener('pointerdown', (e) => {
          if (e.button !== 0) return; // Primary click only
          this.activePointerGesture = {
            cardIndex: idx,
            cardEl: cardEl,
            startX: e.clientX,
            startY: e.clientY,
            startTime: performance.now()
          };
        }, { passive: true });

        // Native click backup
        cardEl.addEventListener('click', (e) => {
          this.launchCardTool(cardEl);
        });

        // Accessible keyboard activation
        cardEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.launchCardTool(cardEl);
          }
        });
      });
    }

    /**
     * Triggers tool launch via the centralized debounced launcher.
     */
    launchCardTool(cardEl) {
      if (!cardEl) return;
      const toolName = cardEl.getAttribute('data-launch-tool') || cardEl.getAttribute('data-tool');
      if (toolName && typeof window.castleLaunchTool === 'function') {
        window.castleLaunchTool(toolName);
      }
    }

    bindStepNavigation() {
      this.stepEls.forEach((stepEl, idx) => {
        stepEl.addEventListener('click', () => {
          this.scrollToCardIndex(idx);
        });
      });
    }

    scrollToCardIndex(idx, instant = false) {
      if (this.isMobile || !this.runwayEl) {
        if (this.cardEls[idx]) {
          this.cardEls[idx].scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'center' });
        }
        return;
      }

      const runwayTop = this.runwayEl.getBoundingClientRect().top + window.scrollY;
      const runwayHeight = this.runwayEl.offsetHeight;
      const viewportHeight = window.innerHeight;
      const stickyTopOffset = 64;
      const scrollableDistance = runwayHeight - (viewportHeight - stickyTopOffset);

      const entry = this.config.entryBuffer;
      const exit = this.config.exitBuffer;
      const totalCards = this.cardEls.length;

      const targetT = totalCards > 1 ? idx / (totalCards - 1) : 0;
      const targetRawProgress = entry + targetT * (1 - entry - exit);
      const targetScrollY = runwayTop - stickyTopOffset + targetRawProgress * scrollableDistance;

      window.scrollTo({
        top: targetScrollY,
        behavior: instant ? 'auto' : 'smooth'
      });
      if (instant) {
        this.updateScrollPositions();
      }
    }

    bindQuickNavArrows() {
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => {
          const targetIdx = Math.max(0, this.activeCardIndex - 1);
          this.scrollToCardIndex(targetIdx);
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => {
          const targetIdx = Math.min(this.cardEls.length - 1, this.activeCardIndex + 1);
          this.scrollToCardIndex(targetIdx);
        });
      }
    }

    updateFilterState() {
      this.measureLayout();
    }

    // ------------------------------------------------------------------------
    // RENDER LOOP & FRAME PIPELINE
    // ------------------------------------------------------------------------
    tick(timestamp) {
      if (!this.isMobile) {
        // 1. Smooth horizontal track momentum damping
        if (!this.reducedMotion) {
          this.currentTranslateX += (this.targetTranslateX - this.currentTranslateX) * this.config.lerpFactor;
        } else {
          this.currentTranslateX = this.targetTranslateX;
        }

        // 2. Apply translation to track
        if (this.trackEl) {
          this.trackEl.style.transform = `translate3d(${this.currentTranslateX.toFixed(2)}px, -50%, 0px)`;
        }

        // 3. Stationary cursor detection: check if track translation placed a card under cursor
        if (this.pointerActive && this.pointerX >= 0) {
          this.checkHoverUnderPointer(this.pointerX, this.pointerY);
        }

        // 4. Determine active card index & focal depth
        const fractionalCard = this.horizontalProgress * (this.cardEls.length - 1);
        const activeIdx = Math.round(fractionalCard);
        this.activeCardIndex = activeIdx;

        // Synchronize step pills
        this.stepEls.forEach((stepEl, idx) => {
          stepEl.classList.toggle('active', idx === activeIdx);
          stepEl.setAttribute('aria-selected', idx === activeIdx ? 'true' : 'false');
        });

        // Synchronize navigation arrows
        if (this.prevBtn) this.prevBtn.disabled = activeIdx === 0;
        if (this.nextBtn) this.nextBtn.disabled = activeIdx === this.cardEls.length - 1;

        // 5. Update card visual states
        this.updateCardTransforms(timestamp);
      }

      this.animationFrameId = requestAnimationFrame(this.tick);
    }

    updateCardTransforms(timestamp) {
      const timeSec = timestamp / 1000;
      const fractionalCard = this.horizontalProgress * (this.cardEls.length - 1);

      this.cardsState.forEach(state => {
        const idx = state.index;
        const innerEl = state.innerEl;
        if (!innerEl) return;

        const distFromFocal = Math.abs(fractionalCard - idx);

        // Focal depth classes
        if (distFromFocal <= 0.48) {
          state.cardEl.classList.add('is-active');
          state.cardEl.classList.remove('is-inactive');
        } else {
          state.cardEl.classList.remove('is-active');
          state.cardEl.classList.add('is-inactive');
        }

        // Ambient multi-harmonic vertical float
        let targetFloatY = 0;
        if (!this.reducedMotion && !state.isHovered) {
          const p = state.floatPhase;
          targetFloatY = Math.sin(timeSec * 1.6 + p) * this.config.floatAmplitudeY +
                         Math.cos(timeSec * 0.8 + p * 1.3) * (this.config.floatAmplitudeY * 0.35);
        }

        // Hover Priority: float smoothly damps to 0px on hover
        state.currentFloatY += (targetFloatY - state.currentFloatY) * 0.2;

        // Directional 3D tilt lerp
        state.tiltX += (state.targetTiltX - state.tiltX) * 0.2;
        state.tiltY += (state.targetTiltY - state.tiltY) * 0.2;

        // Apply transforms strictly to the inner visual plate
        if (!this.reducedMotion) {
          const elevZ = state.isHovered ? 35 : (distFromFocal <= 0.48 ? 0 : -60);
          const focalScale = state.isHovered ? 1.04 : (distFromFocal <= 0.48 ? 1.0 : 0.88);
          innerEl.style.transform = `
            scale(${focalScale})
            translate3d(0px, ${state.currentFloatY.toFixed(2)}px, ${elevZ}px)
            rotateX(${state.tiltX.toFixed(2)}deg)
            rotateY(${state.tiltY.toFixed(2)}deg)
          `;
        } else {
          innerEl.style.transform = 'none';
        }
      });
    }

    destroy() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    }
  }

  // Export to global scope
  root.CastleHorizontalShowcase = CastleHorizontalShowcase;

})(window);
