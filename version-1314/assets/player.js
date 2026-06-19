(function () {
  function mountPlayer(video) {
    var source = video.getAttribute("data-player-src");
    if (!source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      video.src = source;
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        video.play().catch(function () {});
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player-src]")).forEach(mountPlayer);
  });
})();
