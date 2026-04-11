/**
 * Maryland Glock Ban (SB334) — Bearing Freedom
 * Scroll animations, counters, countdown, tracking, sticky header
 */

(function () {
  "use strict";

  // --- Countdown Timer ---
  var countdownEl = document.getElementById("countdownDays");

  function updateCountdown() {
    if (!countdownEl) return;
    var target = new Date("2027-01-01T00:00:00");
    var now = new Date();
    var diff = target - now;
    if (diff <= 0) {
      countdownEl.textContent = "0";
      return;
    }
    var days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    countdownEl.textContent = days.toLocaleString();
  }

  updateCountdown();
  setInterval(updateCountdown, 60000);

  // --- Scroll Depth Tracking ---
  var scrollDepthFired = {};

  function checkScrollDepth() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    var pct = (scrollTop / docHeight) * 100;

    [25, 50, 75, 100].forEach(function (threshold) {
      if (pct >= threshold && !scrollDepthFired[threshold]) {
        scrollDepthFired[threshold] = true;
        if (typeof console !== "undefined") {
          console.log("[BF] Scroll depth: " + threshold + "%");
        }
      }
    });
  }

  // --- Sticky Header ---
  var stickyHeader = document.getElementById("stickyHeader");
  var hero = document.getElementById("hero");

  function handleStickyHeader() {
    if (!stickyHeader || !hero) return;
    var heroBottom = hero.offsetTop + hero.offsetHeight;
    if (window.scrollY > heroBottom - 80) {
      stickyHeader.classList.add("is-visible");
    } else {
      stickyHeader.classList.remove("is-visible");
    }
  }

  // --- Hero Watermark Parallax ---
  var watermark = document.getElementById("heroWatermark");

  function handleParallax() {
    if (!watermark) return;
    var scrollY = window.scrollY;
    var offset = scrollY * 0.08;
    watermark.style.transform =
      "translate(-50%, calc(-50% + " + offset + "px))";
  }

  // --- Combined Scroll Handler ---
  var ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        handleStickyHeader();
        handleParallax();
        checkScrollDepth();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  // --- Animated Counter ---
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-counter"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var originalText = el.textContent;
    var duration = 1000;
    var start = null;

    var rest = "";
    var match = originalText.match(/\d+(.+)/);
    if (match && !suffix) {
      rest = match[1];
    }

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(target * eased);
      el.textContent = current + (suffix || rest);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + (suffix || rest);
      }
    }

    requestAnimationFrame(step);
  }

  // --- Bar Chart Animation ---
  function animateBars(container) {
    var fills = container.querySelectorAll("[data-bar-width]");
    fills.forEach(function (fill) {
      var width = fill.getAttribute("data-bar-width");
      fill.style.width = width + "%";
    });
  }

  // --- Vote Bar Animation ---
  function animateVoteBars(container) {
    var yes = container.querySelector("[data-vote-width]");
    var no = container.querySelectorAll("[data-vote-width]")[1];
    if (yes) yes.style.width = yes.getAttribute("data-vote-width") + "%";
    if (no) no.style.width = no.getAttribute("data-vote-width") + "%";
  }

  // --- Timeline Line Fill ---
  function animateTimeline() {
    var timeline = document.getElementById("timelineComponent");
    var fill = document.getElementById("timelineFill");
    if (!timeline || !fill) return;

    var items = timeline.querySelectorAll(".timeline__item");
    var activeIndex = -1;

    items.forEach(function (item, i) {
      if (item.classList.contains("is-active")) {
        activeIndex = i;
      }
    });

    if (activeIndex < 0) return;

    var activeItem = items[activeIndex];
    var timelineRect = timeline.getBoundingClientRect();
    var activeRect = activeItem.getBoundingClientRect();
    var fillHeight = activeRect.top - timelineRect.top + 20;

    fill.style.height = fillHeight + "px";
  }

  // --- IntersectionObserver for [data-animate] ---
  var animateElements = document.querySelectorAll("[data-animate]");

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");

          var counters = entry.target.querySelectorAll("[data-counter]");
          if (entry.target.hasAttribute("data-counter")) {
            animateCounter(entry.target);
          }
          counters.forEach(animateCounter);

          if (entry.target.id === "atfChart") {
            animateBars(entry.target);
          }

          var voteBars = entry.target.querySelectorAll(".vote-bar");
          voteBars.forEach(animateVoteBars);

          if (entry.target.id === "timelineComponent") {
            setTimeout(animateTimeline, 300);
          }

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  animateElements.forEach(function (el) {
    observer.observe(el);
  });
})();
