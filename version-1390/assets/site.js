(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
      document.body.classList.toggle('menu-open', mobileNav.classList.contains('open'));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }

  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() {
      showHero(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function() {
      showHero(heroIndex + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function runFilter() {
    var list = document.querySelector('[data-movie-list]');
    if (!list) {
      return;
    }

    var input = document.querySelector('[data-search-input]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var keyword = normalize(input && input.value);
    var type = normalize(typeSelect && typeSelect.value);
    var year = normalize(yearSelect && yearSelect.value);
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var visible = 0;

    cards.forEach(function(card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' '));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var matched = (!keyword || haystack.indexOf(keyword) !== -1) &&
        (!type || cardType === type) &&
        (!year || cardYear === year);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    var empty = list.querySelector('.no-results');
    if (!visible) {
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'no-results';
        empty.textContent = '没有找到匹配的影片';
        list.appendChild(empty);
      }
    } else if (empty) {
      empty.remove();
    }
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  var input = document.querySelector('[data-search-input]');
  if (input && query) {
    input.value = query;
  }

  ['input', 'change'].forEach(function(eventName) {
    document.addEventListener(eventName, function(event) {
      if (event.target.matches('[data-search-input], [data-filter-type], [data-filter-year]')) {
        runFilter();
      }
    });
  });

  var searchButton = document.querySelector('[data-search-button]');
  if (searchButton) {
    searchButton.addEventListener('click', runFilter);
  }

  runFilter();
})();

function initPlayer(videoId, buttonId, sourceUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var hlsInstance = null;
  var started = false;

  if (!video || !button || !sourceUrl) {
    return;
  }

  function attachSource() {
    if (started) {
      return;
    }
    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function startPlay() {
    attachSource();
    button.classList.add('hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {
        button.classList.remove('hidden');
      });
    }
  }

  button.addEventListener('click', startPlay);
  video.addEventListener('click', function() {
    if (video.paused) {
      startPlay();
    }
  });
  video.addEventListener('play', function() {
    button.classList.add('hidden');
  });
  video.addEventListener('pause', function() {
    if (!video.ended) {
      button.classList.remove('hidden');
    }
  });
  video.addEventListener('ended', function() {
    button.classList.remove('hidden');
  });
  window.addEventListener('beforeunload', function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
