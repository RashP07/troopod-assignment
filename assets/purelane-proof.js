/**
 * Purelane — proof panel product rotator.
 *
 * The prototype ran this off a document-level id (`#rot`) with a bare
 * `setInterval` that was never cleared, so a second copy of the section was
 * inert and a theme-editor re-render left an orphan timer writing into
 * detached nodes. As a custom element each panel owns its own state and tears
 * the timer down on disconnect.
 *
 * The rotator is decorative — the caption repeats product names that are
 * already elsewhere on the page — so it stays `aria-hidden` and needs no live
 * region or pause control. It simply does not run under reduced motion, and it
 * stops while scrolled out of view.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  class PurelaneRotator extends HTMLElement {
    connectedCallback() {
      this.items = Array.from(this.querySelectorAll('[data-pl-rot-item]'));
      this.dots = Array.from(this.querySelectorAll('[data-pl-rot-dot]'));
      this.name = this.querySelector('[data-pl-rot-name]');
      this.note = this.querySelector('[data-pl-rot-note]');
      this.index = 0;
      this.timer = null;

      if (this.items.length < 2 || reduce.matches) return;

      this.interval = parseInt(this.dataset.plInterval, 10) || 2600;
      this.tick = this.tick.bind(this);

      this.observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(
            function (entry) {
              if (entry.isIntersecting) {
                this.start();
              } else {
                this.stop();
              }
            }.bind(this)
          );
        }.bind(this),
        { threshold: 0 }
      );
      this.observer.observe(this);
    }

    disconnectedCallback() {
      this.stop();
      if (this.observer) this.observer.disconnect();
    }

    start() {
      if (this.timer) return;
      this.timer = setInterval(this.tick, this.interval);
    }

    stop() {
      if (!this.timer) return;
      clearInterval(this.timer);
      this.timer = null;
    }

    tick() {
      this.goTo((this.index + 1) % this.items.length);
    }

    goTo(next) {
      this.items[this.index].classList.remove('pl-is-on');
      if (this.dots[this.index]) this.dots[this.index].classList.remove('pl-is-on');

      this.index = next;
      var item = this.items[next];
      item.classList.add('pl-is-on');
      if (this.dots[next]) this.dots[next].classList.add('pl-is-on');

      if (this.name) this.name.textContent = item.dataset.plName || '';
      if (this.note) this.note.textContent = item.dataset.plNote || '';
    }
  }

  if (!customElements.get('purelane-rotator')) {
    customElements.define('purelane-rotator', PurelaneRotator);
  }

  /* Selecting a rotator block in the theme editor should show that product. */
  document.addEventListener('shopify:block:select', function (event) {
    var item = event.target.closest('[data-pl-rot-item]');
    if (!item) return;
    var rotator = item.closest('purelane-rotator');
    if (!rotator || !rotator.items) return;
    rotator.stop();
    rotator.goTo(rotator.items.indexOf(item));
  });

  document.addEventListener('shopify:block:deselect', function (event) {
    var rotator = event.target.closest('purelane-rotator');
    if (rotator && rotator.start) rotator.start();
  });
})();
