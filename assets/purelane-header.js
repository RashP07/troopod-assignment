/**
 * Purelane — header.
 *
 * Two behaviours: the pill rises when you scroll past a threshold, and the
 * progress rail marks the section you are looking at.
 *
 * The prototype did both inside its global scroll handler, recomputing every
 * target's `offsetTop` on every frame. Here the rail is an
 * IntersectionObserver and the scroll listener does one comparison and toggles
 * one class.
 */
(function () {
  'use strict';

  class PurelaneHeader extends HTMLElement {
    connectedCallback() {
      this.threshold = parseInt(this.dataset.plScrollThreshold, 10);
      if (isNaN(this.threshold)) this.threshold = 90;

      this.toggle = this.querySelector('[data-pl-menu-toggle]');
      this.menu = this.querySelector('[data-pl-menu]');
      this.frame = null;
      this.up = null;

      this.onScroll = this.onScroll.bind(this);
      this.paint = this.paint.bind(this);
      this.onToggle = this.onToggle.bind(this);
      this.onDocumentClick = this.onDocumentClick.bind(this);
      this.onKeydown = this.onKeydown.bind(this);

      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.paint();

      if (this.toggle && this.menu) {
        this.toggle.addEventListener('click', this.onToggle);
        document.addEventListener('click', this.onDocumentClick);
        document.addEventListener('keydown', this.onKeydown);
      }
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScroll);
      document.removeEventListener('click', this.onDocumentClick);
      document.removeEventListener('keydown', this.onKeydown);
      if (this.frame) cancelAnimationFrame(this.frame);
    }

    onScroll() {
      if (!this.frame) this.frame = requestAnimationFrame(this.paint);
    }

    paint() {
      this.frame = null;
      var up = (window.scrollY || window.pageYOffset) > this.threshold;
      /* Only touch the DOM when the state actually changes. */
      if (up === this.up) return;
      this.up = up;
      this.classList.toggle('pl-is-up', up);
    }

    openMenu(open) {
      this.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        this.menu.setAttribute('data-pl-open', '');
      } else {
        this.menu.removeAttribute('data-pl-open');
      }
    }

    onToggle() {
      this.openMenu(this.toggle.getAttribute('aria-expanded') !== 'true');
    }

    onDocumentClick(event) {
      if (this.contains(event.target)) return;
      this.openMenu(false);
    }

    onKeydown(event) {
      if (event.key !== 'Escape') return;
      if (this.toggle.getAttribute('aria-expanded') !== 'true') return;
      this.openMenu(false);
      this.toggle.focus();
    }
  }

  if (!customElements.get('purelane-header')) {
    customElements.define('purelane-header', PurelaneHeader);
  }

  /* ---------- progress rail ---------- */
  function initRail() {
    var rail = document.querySelector('[data-pl-rail]');
    if (!rail || !('IntersectionObserver' in window)) return;

    var links = Array.from(rail.querySelectorAll('a'));
    var byId = {};

    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (target) byId[id] = link;
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var active = byId[entry.target.id];
          if (!active) return;
          links.forEach(function (link) {
            link.setAttribute('aria-current', link === active ? 'true' : 'false');
          });
        });
      },
      { rootMargin: '-42% 0px -58% 0px', threshold: 0 }
    );

    Object.keys(byId).forEach(function (id) {
      observer.observe(document.getElementById(id));
    });

    rail.plObserver = observer;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRail);
  } else {
    initRail();
  }

  /* Sections the rail points at can be added, removed or reordered. */
  document.addEventListener('shopify:section:load', function () {
    var rail = document.querySelector('[data-pl-rail]');
    if (rail && rail.plObserver) rail.plObserver.disconnect();
    initRail();
  });
})();
