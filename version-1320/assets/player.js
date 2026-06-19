(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    var playerScriptUrl = document.currentScript && document.currentScript.src ? document.currentScript.src : "";

    function getVendorUrl() {
        if (!playerScriptUrl) {
            return "./video-vendor-dru42stk.js";
        }
        return new URL("video-vendor-dru42stk.js", playerScriptUrl).href;
    }

    var hlsLoader = null;

    function loadHlsClass() {
        if (!hlsLoader) {
            hlsLoader = import(getVendorUrl()).then(function (module) {
                return module.H;
            });
        }
        return hlsLoader;
    }

    function setupPlayer(player) {
        var video = player.querySelector("video");
        var startButton = player.querySelector("[data-player-start]");
        var status = player.querySelector("[data-player-status]");
        var source = player.getAttribute("data-video-source");
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function useNativeHls() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return true;
            }
            return false;
        }

        function attachHls(Hls) {
            if (!Hls || !Hls.isSupported()) {
                return false;
            }

            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus("播放源已就绪");
                video.play().catch(function () {
                    setStatus("请再次点击播放按钮开始播放");
                });
            });
            hlsInstance.on(Hls.Events.ERROR, function (_, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    setStatus("网络异常，正在重新连接播放源");
                    hlsInstance.startLoad();
                    return;
                }
                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    setStatus("媒体异常，正在恢复播放");
                    hlsInstance.recoverMediaError();
                    return;
                }
                setStatus("播放源暂时无法加载");
                hlsInstance.destroy();
            });
            return true;
        }

        function startPlayback() {
            player.classList.add("is-started");
            setStatus("正在初始化播放源...");

            if (useNativeHls()) {
                video.play().catch(function () {
                    setStatus("请再次点击播放器开始播放");
                });
                return;
            }

            loadHlsClass()
                .then(function (Hls) {
                    if (!attachHls(Hls)) {
                        setStatus("当前浏览器不支持 HLS 播放");
                    }
                })
                .catch(function () {
                    setStatus("HLS 播放器加载失败，请通过静态网站服务访问页面");
                });
        }

        if (startButton) {
            startButton.addEventListener("click", startPlayback);
        }

        video.addEventListener("play", function () {
            player.classList.add("is-started");
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-hls-player]"));
        players.forEach(setupPlayer);
    });
})();
