import { H as Hls } from './hls-vendor.esm.js';

(function () {
    var video = document.getElementById('movie-player');
    var button = document.querySelector('[data-player-start]');
    var status = document.querySelector('[data-player-status]');

    if (!video) {
        return;
    }

    var source = video.getAttribute('data-src');
    var loaded = false;
    var hlsInstance = null;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function loadSource() {
        if (loaded || !source) {
            return;
        }

        loaded = true;
        setStatus('正在初始化播放源');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                setStatus('播放源已就绪');
            }, { once: true });
            return;
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);

            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus('播放源已就绪');
            });

            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    setStatus('网络异常，正在重新加载');
                    hlsInstance.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    setStatus('媒体异常，正在恢复');
                    hlsInstance.recoverMediaError();
                } else {
                    setStatus('当前浏览器暂时无法播放该源');
                    hlsInstance.destroy();
                }
            });
            return;
        }

        setStatus('当前浏览器不支持 HLS 播放');
    }

    function playVideo() {
        loadSource();
        if (button) {
            button.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                setStatus('点击视频控件即可继续播放');
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }
    }

    if (button) {
        button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (!loaded) {
            playVideo();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
