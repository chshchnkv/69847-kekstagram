'use strict';
(function(gl) {
  var IMAGE_TIMEOUT = 10000;
  var PAGE_SIZE = 12;

  var currentPicturesPage = 0;

  var activeFilter = '';
  var filters = document.querySelector('.filters');
  filters.classList.remove('hidden');

  /// Обработка событий при кликах на фильтрах
  filters.addEventListener('change', function(event) {
    if (event.target.classList.contains('filters-radio')) {
      setActiveFilter(event.target.id);
    }
  });

  /// выбирает текущий фильтр на основе того, какому radio установлен признак checked
  /// используется при первой загрузке и позволяет сразу применить фильтр
  function getActiveFilter() {
    var filtersRadio = document.querySelectorAll('.filters-radio');
    return [].filter.call(filtersRadio, function(item) {
      return item.checked;
    })[0].id;
  }

  /// устанавливает текущий фильтр по идентификатору
  function setActiveFilter(id) {

    if (activeFilter === id) {
      return;
    }

    activeFilter = id;

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

    renderPictures(filteredPictures, 0, true);
  }

  /// Контейнер для загрузки изображений
  var picturesElement = document.querySelector('.pictures');
  var loadedPictures = [];
  var filteredPictures = [];
  getPictures();

  gl.addEventListener('scroll', function() {
    if (needToRenderNextPage()) {
      renderPictures(filteredPictures, ++currentPicturesPage);
    }
  });

  function needToRenderNextPage() {
    /*
     если нижняя граница контейнера изображений отображается на экране и выведены не все фотографии, значит нужно загрузить следующую страницу
    */
    return ((PAGE_SIZE * (currentPicturesPage + 1)) < filteredPictures.length) && (picturesElement.getBoundingClientRect().bottom <= gl.innerHeight);
  }

  function getPictures() {
    picturesLoading(true);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
    xhr.timeout = IMAGE_TIMEOUT;
    xhr.onload = function(event) {
      var rawData = event.target.response;
      loadedPictures = JSON.parse(rawData);
      /* отрисовка с фильтром, установленным при загрузке страницы */
      setActiveFilter(getActiveFilter());
      picturesLoading(false);
    };

    xhr.onerror = pictureFailure;
    xhr.ontimeout = pictureFailure;

    xhr.send();
  }

  function pictureFailure() {
    picturesElement.classList.add('pictures-failure');
  }

  function picturesLoading(start) {
    if (start) {
      picturesElement.classList.add('pictures-loading');
    } else {
      picturesElement.classList.remove('pictures-loading');
    }
  }

  function renderPictures(pictures, page, replace) {
    page = page || 0;
    if (replace) {
      currentPicturesPage = 0;
      picturesElement.innerHTML = '';
    }
    var picturesFragment = document.createDocumentFragment();

    var from = page * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var pagePictures = pictures.slice(from, to);

    pagePictures.forEach(function(picture) {
      picturesFragment.appendChild(getElementFromTemplate(picture));
    });
    picturesElement.appendChild(picturesFragment);

    /*
      рекурсивно вызываем функцию отрисовки, пока требуется вывод фотографий на экран
      сработает, если разрешение или масштаб вьюпорта позволяет вывести больше одной страницы на экран за раз
    */
    while (needToRenderNextPage()) {
      renderPictures(pictures, ++currentPicturesPage);
    }
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
})(window);
