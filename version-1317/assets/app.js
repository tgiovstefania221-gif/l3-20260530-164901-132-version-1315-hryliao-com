(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initSearch() {
    var input = document.getElementById("movieSearchInput");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".search-card"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    if (!cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    var activeFilter = "all";

    if (input && initial) {
      input.value = initial;
    }

    function cardText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-category"),
        card.textContent
      ].join(" "));
    }

    function apply() {
      var keyword = input ? normalize(input.value) : normalize(initial);
      cards.forEach(function (card) {
        var text = cardText(card);
        var category = normalize(card.getAttribute("data-category"));
        var byKeyword = !keyword || text.indexOf(keyword) !== -1;
        var byFilter = activeFilter === "all" || category === normalize(activeFilter);
        card.classList.toggle("is-hidden", !(byKeyword && byFilter));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter") || "all";
        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });
    apply();
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".video-shell"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-cover");
      var url = shell.getAttribute("data-stream-url");
      var attached = false;
      var hls = null;

      function attach() {
        if (attached || !video || !url) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          attached = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          attached = true;
          return;
        }
        video.src = url;
        attached = true;
      }

      function play() {
        attach();
        shell.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("play", function () {
          shell.classList.add("is-playing");
        });
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
      }
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initSearch();
    initPlayers();
  });
})();
