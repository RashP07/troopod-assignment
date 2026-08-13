/**
 * Purelane — reveal on scroll.
 *
 * The prototype hid every `.rv` element in CSS and relied on an
 * IntersectionObserver to bring it back. That is a blank-section risk: if the
 * observer never runs the content stays invisible forever. It also breaks in
 * the theme editor, where a section re-renders while already scrolled past.
 *
 * Here CSS only hides elements once this file has set `pl-rv-ready`, and every
 * newly rendered section is re-scanned on `shopify:section:load`.
 */
(function () {
  'use strict';

  var SUPPORTED = 'IntersectionObserver' in window;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function showAll(root) {
    (root || document).querySelectorAll('.pl-rv').forEach(function (el) {
      el.classList.add('pl-in');
    });
  }

  if (!SUPPORTED || reduce.matches) {
    document.addEventListener('DOMContentLoaded', function () {
      showAll();
    });
    document.addEventListener('shopify:section:load', function (event) {
      showAll(event.target);
    });
    return;
  }

  document.documentElement.classList.add('pl-rv-ready');

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('pl-in');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
  );

  function scan(root) {
    (root || document).querySelectorAll('.pl-rv:not(.pl-in)').forEach(function (el) {
      observer.observe(el);
    });
  }

  scan();
  document.addEventListener('DOMContentLoaded', function () {
    scan();
  });

  /* Theme editor: a section that re-renders brings new, unobserved nodes. */
  document.addEventListener('shopify:section:load', function (event) {
    scan(event.target);
  });

  /* Selecting a block in the editor should never leave it mid-fade. */
  document.addEventListener('shopify:block:select', function (event) {
    var el = event.target.closest('.pl-rv') || event.target;
    el.classList.add('pl-in');
    el.querySelectorAll('.pl-rv').forEach(function (child) {
      child.classList.add('pl-in');
    });
  });

  /* Honour a mid-session change to the OS reduced-motion setting. */
  reduce.addEventListener('change', function (event) {
    if (event.matches) showAll();
  });
})();
