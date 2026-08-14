/**
 * Purelane — hero product stage.
 *
 * Rewritten as a custom element so each hero on the page owns its own state.
 * The prototype hung its carousel off document-level ids (#hstage, #hdots),
 * which meant a second hero — trivially created in the theme editor — was
 * inert, and its `setInterval` was never cleared when a section re-rendered,
 * leaving orphan timers running against detached nodes.
 *
 * Behaviour kept from the prototype: autoplay, pause on hover, pause when
 * scrolled out of view, dot navigation, scroll parallax.
 * Behaviour added: a real pause control (WCAG 2.2.2), keyboard arrow support,
 * and a live region so the slide change is announced.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  /* The prototype gated its pointer parallax to pointer-driven widths; the
     backdrop layers use the same query, so the two stay in step. */
  var desktop = window.matchMedia('(min-width: 1024px)');

  class PurelaneHeroStage extends HTMLElement {
    connectedCallback() {
      this.slides = Array.from(this.querySelectorAll('[data-pl-slide]'));
      this.dots = Array.from(this.querySelectorAll('[data-pl-dot]'));
      this.toggle = this.querySelector('[data-pl-toggle]');
      this.stage = this.querySelector('[data-pl-stage]');
      this.status = this.querySelector('[data-pl-status]');
      this.index = 0;
      this.timer = null;
      this.paused = false;
      this.mouseX = 0;
      this.mouseY = 0;

      if (this.slides.length < 2) return;

      this.interval = parseInt(this.dataset.plInterval, 10) || 3800;
      this.autoplay = this.dataset.plAutoplay === 'true' && !reduce.matches;

      this.onDotClick = this.onDotClick.bind(this);
      this.onToggleClick = this.onToggleClick.bind(this);
      this.onKeydown = this.onKeydown.bind(this);
      this.onEnter = this.stop.bind(this);
      this.onLeave = this.play.bind(this);
      this.onScroll = this.onScroll.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.paint = this.paint.bind(this);

      this.dots.forEach(function (dot) {
        dot.addEventListener('click', this.onDotClick);
      }, this);

      if (this.toggle) this.toggle.addEventListener('click', this.onToggleClick);
      this.addEventListener('keydown', this.onKeydown);
      this.addEventListener('mouseenter', this.onEnter);
      this.addEventListener('mouseleave', this.onLeave);
      this.addEventListener('focusin', this.onEnter);
      this.addEventListener('focusout', this.onLeave);

      /* Only run the timer while the stage is actually on screen. */
      this.visible = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              this.play();
            } else {
              this.stop();
            }
          }, this);
        }.bind(this),
        { threshold: 0.2 }
      );
      this.visible.observe(this);

      if (!reduce.matches) {
        window.addEventListener('scroll', this.onScroll, { passive: true });
        if (desktop.matches) {
          window.addEventListener('mousemove', this.onMouseMove, { passive: true });
        }
      }
    }

    disconnectedCallback() {
      /* Everything below is why a re-rendered section leaves nothing behind. */
      this.stop();
      if (this.visible) this.visible.disconnect();
      if (this.frame) cancelAnimationFrame(this.frame);
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('mousemove', this.onMouseMove);
    }

    goTo(next, announce) {
      this.index = (next + this.slides.length) % this.slides.length;

      this.slides.forEach(function (slide, i) {
        slide.classList.toggle('pl-is-on', i === this.index);
      }, this);

      this.dots.forEach(function (dot, i) {
        dot.setAttribute('aria-current', i === this.index ? 'true' : 'false');
      }, this);

      /* Announce only when the visitor drove the change, never on autoplay —
         an autoplaying carousel that talks over a screen reader every few
         seconds is worse than one that stays quiet. */
      if (announce && this.status) {
        this.status.textContent = (this.status.dataset.plTemplate || '%index% / %total%')
          .replace('%index%', this.index + 1)
          .replace('%total%', this.slides.length);
      }
    }

    play() {
      if (!this.autoplay || this.paused || this.timer) return;
      this.timer = setInterval(
        function () {
          this.goTo(this.index + 1, false);
        }.bind(this),
        this.interval
      );
    }

    stop() {
      if (!this.timer) return;
      clearInterval(this.timer);
      this.timer = null;
    }

    onDotClick(event) {
      var target = event.currentTarget.getAttribute('data-pl-dot');
      this.stop();
      this.goTo(parseInt(target, 10), true);
      this.play();
    }

    onToggleClick() {
      this.paused = !this.paused;
      this.toggle.setAttribute('aria-pressed', this.paused ? 'true' : 'false');

      var label = this.toggle.querySelector('[data-pl-toggle-label]');
      if (label) {
        label.textContent = this.paused ? this.toggle.dataset.plPlayLabel : this.toggle.dataset.plPauseLabel;
      }

      if (this.paused) {
        this.stop();
      } else {
        this.play();
      }
    }

    onKeydown(event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      this.stop();
      this.goTo(event.key === 'ArrowRight' ? this.index + 1 : this.index - 1, true);
      this.play();
    }

    onScroll() {
      if (!this.frame) this.frame = requestAnimationFrame(this.paint);
    }

    /* The event carries the coordinates, so this reads nothing off the DOM
       either — normalised to -1..1 about the viewport centre, as the backdrop
       layers do, so the product and the water behind it track together. */
    onMouseMove(event) {
      this.mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      this.mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
      this.onScroll();
    }

    /* Parallax: writes only, no layout reads, one rAF per frame. */
    paint() {
      this.frame = null;
      var progress = Math.min((window.scrollY || window.pageYOffset) / 700, 1);
      var shiftX = this.mouseX * -16;
      var shiftY = -progress * 54 + this.mouseY * -10;
      this.style.transform = 'translate3d(' + shiftX.toFixed(2) + 'px,' + shiftY.toFixed(2) + 'px,0) scale(' + (1 - progress * 0.06).toFixed(3) + ')';
      this.style.opacity = (1 - progress * 0.55).toFixed(3);
    }
  }

  if (!customElements.get('purelane-hero-stage')) {
    customElements.define('purelane-hero-stage', PurelaneHeroStage);
  }

  /* Selecting a slide block in the theme editor should show that slide. */
  document.addEventListener('shopify:block:select', function (event) {
    var slide = event.target.closest('[data-pl-slide]');
    if (!slide) return;
    var stage = slide.closest('purelane-hero-stage');
    if (!stage || !stage.slides) return;
    stage.stop();
    stage.goTo(stage.slides.indexOf(slide), false);
  });

  document.addEventListener('shopify:block:deselect', function (event) {
    var stage = event.target.closest('purelane-hero-stage');
    if (stage && stage.play) stage.play();
  });
})();
