/**
 * Purelane — backdrop scene switching + water parallax.
 *
 * The prototype recomputed this on every scroll event by walking each zone's
 * `offsetTop`/`offsetParent` chain, which forces a synchronous layout on every
 * frame of every scroll — one of the more expensive things a theme can do to
 * INP. Scene selection here is an IntersectionObserver keyed on the middle of
 * the viewport, and the scroll handler only writes CSS custom properties.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var desktop = window.matchMedia('(min-width: 1024px)');

  function init() {
    var backdrop = document.querySelector('[data-pl-backdrop]');
    if (!backdrop) return;

    /* Let the first paint happen without the water: see the note in
       `purelane-backdrop.css` for the measurements. One frame after load is
       late enough that the expensive composite lands off the critical path,
       and early enough that the fade reads as part of the page arriving. */
    function reveal() {
      requestAnimationFrame(function () {
        backdrop.classList.add('pl-is-ready');
        /* A second frame so the browser has a transparent starting value to
           transition from; adding both at once would jump straight to full. */
        requestAnimationFrame(function () {
          backdrop.classList.add('pl-is-lit');
        });
      });
    }

    if (document.readyState === 'complete') {
      reveal();
    } else {
      window.addEventListener('load', reveal, { once: true });
    }

    var layers = backdrop.querySelectorAll('[data-pl-water] .pl-wl');
    var scenes = backdrop.querySelectorAll('.pl-scene');
    var depths = [0.05, 0.09, 0.03, 0.02];
    var current = 1;
    var frame = null;
    var mouseX = 0;
    var mouseY = 0;

    function setScene(n) {
      if (n === current) return;
      current = n;
      backdrop.setAttribute('data-pl-depth', String(n));
      scenes.forEach(function (scene, index) {
        scene.classList.toggle('pl-is-on', index + 1 === n);
      });
    }

    /* ---------- which scene are we in ---------- */
    var sceneObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var value = parseInt(entry.target.getAttribute('data-pl-scene'), 10);
          if (value >= 1 && value <= 4) setScene(value);
        });
      },
      /* fires as an element crosses the vertical middle of the viewport */
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );

    function observeZones(root) {
      (root || document).querySelectorAll('[data-pl-scene]').forEach(function (zone) {
        sceneObserver.observe(zone);
      });
    }

    observeZones();
    document.addEventListener('shopify:section:load', function (event) {
      observeZones(event.target);
    });

    /* ---------- parallax ---------- */
    if (!layers.length) return;

    function paint() {
      frame = null;
      var y = window.scrollY || window.pageYOffset;
      layers.forEach(function (layer, index) {
        var depth = depths[index] || 0.05;
        layer.style.setProperty('--pl-px', (mouseX * depth * 130).toFixed(1) + 'px');
        layer.style.setProperty('--pl-py', (-y * depth + mouseY * depth * 90).toFixed(1) + 'px');
      });
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(paint);
    }

    function enableParallax() {
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      if (desktop.matches) {
        window.addEventListener('mousemove', onMouseMove, { passive: true });
      }
      schedule();
    }

    function disableParallax() {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('mousemove', onMouseMove);
      layers.forEach(function (layer) {
        layer.style.removeProperty('--pl-px');
        layer.style.removeProperty('--pl-py');
      });
    }

    function onMouseMove(event) {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
      schedule();
    }

    if (!reduce.matches) enableParallax();

    reduce.addEventListener('change', function (event) {
      if (event.matches) {
        disableParallax();
      } else {
        enableParallax();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* The backdrop itself can be added, removed or re-rendered in the editor. */
  document.addEventListener('shopify:section:load', function (event) {
    if (event.target.querySelector('[data-pl-backdrop]')) init();
  });
})();
