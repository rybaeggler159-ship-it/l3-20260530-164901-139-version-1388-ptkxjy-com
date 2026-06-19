(function () {
  var menuButton = document.querySelector(".mobile-menu-button");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.addEventListener(
    "error",
    function (event) {
      var target = event.target;
      if (target && target.tagName === "IMG") {
        target.classList.add("image-failed");
      }
    },
    true
  );

  var hero = document.querySelector(".hero-slider");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-arrow.prev");
    var next = hero.querySelector(".hero-arrow.next");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function filterCards(input) {
    var scopeSelector = input.getAttribute("data-scope") || ".movie-grid";
    var root = document.querySelector(scopeSelector);
    if (!root) {
      root = document;
    }
    var query = normalize(input.value);
    var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card, .rank-item"));

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search") || card.textContent);
      var matched = !query || text.indexOf(query) !== -1;
      card.classList.toggle("hide-card", !matched);
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".filter-input")).forEach(function (input) {
    input.addEventListener("input", function () {
      filterCards(input);
    });

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");
    if (initial && input.value === "") {
      input.value = initial;
      filterCards(input);
    }
  });

  Array.prototype.slice.call(document.querySelectorAll(".sort-select")).forEach(function (select) {
    select.addEventListener("change", function () {
      var scope = document.querySelector(select.getAttribute("data-scope") || ".movie-grid");
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var value = select.value;

      cards.sort(function (a, b) {
        if (value === "year-desc") {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        }
        if (value === "year-asc") {
          return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
        }
        return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
      });

      cards.forEach(function (card) {
        scope.appendChild(card);
      });
    });
  });

  window.initPlayer = function (source, poster) {
    var video = document.querySelector(".js-player");
    var overlay = document.querySelector(".player-overlay");
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".js-play"));
    var attached = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    if (poster) {
      video.setAttribute("poster", poster);
    }

    function attachSource() {
      if (attached) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (globalThis.Hls && globalThis.Hls.isSupported()) {
        hls = new globalThis.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(globalThis.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === globalThis.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === globalThis.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = source;
      }

      attached = true;
    }

    function playVideo() {
      attachSource();
      video.controls = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        playVideo();
      });
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  };
})();
