'use strict';
(function() {
  var IMAGE_TIMEOUT = 10000;
  var filters = document.querySelector('.filters');
  filters.classList.remove('hidden');

  var activeFilter = '';
  filters.onchange = function(event) {
    filterPictures(event.target.id);
  };

  function getCurrentFilter() {
    var filtersRadio = document.querySelectorAll('.filters-radio');
    return [].filter.call(filtersRadio, function(item) {
      return item.checked;
    })[0].id;
  }

  function filterPictures(id) {

    if (activeFilter === id) {
      return;
    }

    activeFilter = id;

    var filteredPictures;
    switch (activeFilter) {

      case 'filter-popular':
        filteredPictures = loadedPictures.slice(0);
        filteredPictures.sort(function(a, b) {
          return b.likes - a.likes;
        }); break;

      case 'filter-new':
        filteredPictures = loadedPictures.filter(function(item) {
          var itemDate = new Date(item.date);
          return itemDate >= (new Date().valueOf() - (14 * 24 * 60 * 60 * 1000));
        });
        filteredPictures.sort(function(a, b) {
          return (new Date(b.date).valueOf() - new Date(a.date).valueOf());
        }); break;

      case 'filter-discussed':
        filteredPictures = loadedPictures.slice(0);
        filteredPictures.sort(function(a, b) {
          return b.comments - a.comments;
        }); break;

      default:
        filteredPictures = loadedPictures.slice(0);
    }

    renderPictures(filteredPictures);
  }

  /// Контейнер для загрузки изображений
  var picturesElement = document.querySelector('.pictures');
  var loadedPictures = null;
  getPictures();

  function getPictures() {
    picturesElement.classList.add('pictures-loading');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
    xhr.timeout = IMAGE_TIMEOUT;
    xhr.onload = function(event) {
      var rawData = event.target.response;
      loadedPictures = JSON.parse(rawData);
      /* отрисовка с фильтром, установленным при загрузке страницы */
      filterPictures(getCurrentFilter());
      picturesElement.classList.remove('pictures-loading');
    };

    xhr.onerror = function() {
      picturesElement.classList.add('pictures-failure');
    };

    xhr.ontimeout = function() {
      picturesElement.classList.add('pictures-failure');
    };

    xhr.send();
  }

  function renderPictures(pictures) {
    picturesElement.innerHTML = '';
    var picturesFragment = document.createDocumentFragment();

    pictures.forEach(function(picture) {
      picturesFragment.appendChild(getElementFromTemplate(picture));
    });
    picturesElement.appendChild(picturesFragment);
  }

  function getElementFromTemplate(picture) {
    var template = document.querySelector('#picture-template');
    var element = ('content' in template) ? template.content.children[0].cloneNode(true) : template.children[0].cloneNode(true);

    var templateImage = element.querySelector('img');

    if (element.classList.contains('picture')) {
      element.href = picture.url;
      element.querySelector('.picture-comments').textContent = picture.comments;
      element.querySelector('.picture-likes').textContent = picture.likes;

      var img = new Image();

      img.onload = function() {
        clearTimeout(imageLoadTimeout);
        img.width = 182;
        img.height = 182;
        element.replaceChild(img, templateImage);
      };

      img.onerror = function() {
        imageLoadFailure();
      };

      var imageLoadTimeout = setTimeout(function() {
        imageLoadFailure();
      }, IMAGE_TIMEOUT);

      img.src = picture.url;

    }
    return element;

    function imageLoadFailure() {
      element.classList.add('picture-load-failure');
    }
  }
})();
