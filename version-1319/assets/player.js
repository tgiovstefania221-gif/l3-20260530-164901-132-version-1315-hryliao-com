function startVideo(button) {
  const shell = button.closest('.video-shell');
  const video = shell.querySelector('video');
  const overlay = shell.querySelector('.player-overlay');
  const url = shell.getAttribute('data-url');

  function playNow() {
    video.play().catch(() => {
      video.setAttribute('controls', 'controls');
    });
  }

  if (window.Hls && window.Hls.isSupported()) {
    const hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(window.Hls.Events.MANIFEST_PARSED, playNow);
  } else {
    video.src = url;
    video.addEventListener('loadedmetadata', playNow, { once: true });
  }

  video.setAttribute('controls', 'controls');
  overlay.hidden = true;
}

window.startVideo = startVideo;
