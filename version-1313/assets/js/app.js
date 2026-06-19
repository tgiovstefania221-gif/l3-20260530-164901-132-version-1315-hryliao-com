(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupImages() {
    document.querySelectorAll(".poster-frame img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-missing");
      }, { once: true });
    });
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (!button || !mobileNav) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = mobileNav.classList.toggle("open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearchJump() {
    document.querySelectorAll("[data-search-jump]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        var action = form.getAttribute("action") || "rank.html";
        window.location.href = action + "?q=" + encodeURIComponent(input.value.trim());
      });
    });
  }

  function setupFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var searchInput = document.querySelector("[data-card-search]");
    var empty = document.querySelector("[data-empty-state]");
    var activeValue = "";
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (searchInput && query) {
      searchInput.value = query;
    }

    function apply() {
      var keyword = normalize(searchInput ? searchInput.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var content = normalize(card.getAttribute("data-search"));
        var category = normalize(card.getAttribute("data-category"));
        var matchesKeyword = !keyword || content.indexOf(keyword) !== -1;
        var matchesFilter = !activeValue || content.indexOf(activeValue) !== -1 || category.indexOf(activeValue) !== -1;
        var shouldShow = matchesKeyword && matchesFilter;
        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", apply);
    }

    document.querySelectorAll("[data-filter-value]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeValue = normalize(button.getAttribute("data-filter-value"));
        document.querySelectorAll("[data-filter-value]").forEach(function (other) {
          other.classList.remove("active");
        });
        button.classList.add("active");
        apply();
      });
    });

    apply();
  }

  function setupPlayers() {
    document.querySelectorAll("[data-video-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".play-overlay");
      var status = box.querySelector(".video-status");
      if (!video || !button) {
        return;
      }
      var url = video.getAttribute("data-video");
      var hlsInstance = null;
      var initialized = false;

      function message(text) {
        if (!status) {
          return;
        }
        status.textContent = text;
        status.classList.toggle("show", Boolean(text));
      }

      function initialize() {
        if (initialized || !url) {
          return;
        }
        initialized = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                message("视频暂时无法播放，请稍后再试");
              }
            }
          });
        } else {
          video.src = url;
        }
      }

      function play() {
        initialize();
        message("");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            message("点击视频控件即可开始播放");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        button.classList.add("hidden");
      });
      video.addEventListener("pause", function () {
        button.classList.remove("hidden");
      });
      video.addEventListener("ended", function () {
        button.classList.remove("hidden");
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupImages();
    setupMenu();
    setupHero();
    setupSearchJump();
    setupFilters();
    setupPlayers();
  });
})();
