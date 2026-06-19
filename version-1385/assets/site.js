(function () {
    var navButton = document.querySelector(".nav-toggle");
    var mainNav = document.querySelector(".main-nav");
    var navSearch = document.querySelector(".nav-search");

    if (navButton && mainNav && navSearch) {
        navButton.addEventListener("click", function () {
            mainNav.classList.toggle("open");
            navSearch.classList.toggle("open");
        });
    }

    function setupHero() {
        var slider = document.querySelector(".hero-slider");
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dots button"));
        var prev = slider.querySelector(".hero-arrow.prev");
        var next = slider.querySelector(".hero-arrow.next");
        var index = 0;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });

        show(0);

        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function setupFilter() {
        var input = document.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
        var empty = document.querySelector("[data-no-results]");

        if (!input || !cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (query) {
            input.value = query;
        }

        function apply() {
            var value = input.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var text = card.getAttribute("data-search") || "";
                var matched = !value || text.indexOf(value) !== -1;
                card.classList.toggle("hidden-card", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("visible", visible === 0);
            }
        }

        input.addEventListener("input", apply);
        apply();
    }

    function loadStream(video, streamUrl) {
        if (!streamUrl) {
            return;
        }

        if (video.dataset.ready === "1") {
            return;
        }

        video.dataset.ready = "1";

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video._hls = hls;
            return;
        }

        video.src = streamUrl;
    }

    function setupPlayers() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll(".player-box"));

        boxes.forEach(function (box) {
            var video = box.querySelector(".movie-video");
            var start = box.querySelector(".play-start");

            if (!video) {
                return;
            }

            var streamUrl = video.getAttribute("data-stream");

            function startPlay() {
                loadStream(video, streamUrl);
                video.controls = true;
                box.classList.add("is-playing");
                var playResult = video.play();
                if (playResult && typeof playResult.catch === "function") {
                    playResult.catch(function () {});
                }
            }

            if (start) {
                start.addEventListener("click", startPlay);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    startPlay();
                }
            });
        });
    }

    setupHero();
    setupFilter();
    setupPlayers();
})();
