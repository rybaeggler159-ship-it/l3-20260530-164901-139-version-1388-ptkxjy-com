(function () {
  function setupPlayer(player) {
    var video = player.querySelector("video");
    var cover = player.querySelector("[data-player-cover]");
    var status = player.querySelector("[data-player-status]");
    var source = player.getAttribute("data-video-src");
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function start() {
      if (!video || !source) {
        setStatus("播放源暂时不可用。");
        return;
      }

      if (!initialized) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          setStatus("正在使用浏览器原生 HLS 播放。");
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);

          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("HLS 播放源已加载，可以开始播放。");
          });

          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放源加载失败，请稍后重试。");
            }
          });

          video._hlsInstance = hls;
        } else {
          video.src = source;
          setStatus("当前浏览器不支持 HLS 初始化，已尝试直接加载播放源。");
        }

        initialized = true;
      }

      if (cover) {
        cover.style.display = "none";
      }

      video.controls = true;
      video.play().catch(function () {
        setStatus("浏览器阻止了自动播放，请点击视频控件继续。");
      });
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!initialized) {
          start();
        }
      });
    }
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var players = document.querySelectorAll("[data-video-src]");
    players.forEach(setupPlayer);
  });
})();
