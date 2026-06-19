(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    show(0);
    play();
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    function apply(value) {
      var query = value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-filter") || card.textContent || "").toLowerCase();
        card.classList.toggle("is-hidden", query.length > 0 && text.indexOf(query) === -1);
      });
    }

    if (initial) {
      input.value = initial;
    }

    input.addEventListener("input", function () {
      apply(input.value);
    });

    var form = input.closest("form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply(input.value);
      });
    }

    apply(input.value);
  }

  function initPlayer() {
    var panel = document.querySelector("[data-player]");
    if (!panel) {
      return;
    }
    var video = panel.querySelector("video");
    var playButton = panel.querySelector("[data-play]");
    var stream = panel.getAttribute("data-stream");
    var attached = false;

    function attach() {
      if (attached || !video || !stream) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    }

    function start() {
      attach();
      panel.classList.add("is-playing");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (playButton) {
      playButton.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!attached) {
          start();
        }
      });
      video.addEventListener("play", function () {
        panel.classList.add("is-playing");
      });
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
