'use strict';
(function(gl) {
  gl.IMAGE_TIMEOUT = 10000;
  var gallery = new gl.Gallery();

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
          return b.getLikes() - a.getLikes();
        }); break;

      case 'filter-new':
        filteredPictures = loadedPictures.filter(function(item) {
          var itemDate = item.getDate();
          return itemDate >= (new Date().valueOf() - (14 * 24 * 60 * 60 * 1000));
        });
        filteredPictures.sort(function(a, b) {
          return (b.getDate().valueOf() - a.getDate().valueOf());
        }); break;

      case 'filter-discussed':
        filteredPictures = loadedPictures.slice(0);
        filteredPictures.sort(function(a, b) {
          return b.getComments() - a.getComments();
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
  var renderedPictures = [];
  getPictures();

  var scrollTimeout;
  gl.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      if (needToRenderNextPage()) {
        renderPictures(filteredPictures, ++currentPicturesPage);
      }
    }, 100);
  });

  function needToRenderNextPage() {
    /*
     если нижняя ряд фотографий в контейнере изображений отображается на экране наполовину и больше и выведены не все фотографии, значит нужно загрузить следующую страницу
    */
    return ((PAGE_SIZE * (currentPicturesPage + 1)) < filteredPictures.length) && (picturesElement.getBoundingClientRect().bottom - (182 / 2) <= gl.innerHeight);
  }

  function getPictures() {
    picturesLoading(true);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
    xhr.timeout = gl.IMAGE_TIMEOUT;
    xhr.onload = function(event) {
      var rawData = event.target.response;
      var rawDataArray = JSON.parse(rawData);
      loadedPictures = rawDataArray.map(function(item) {
        return new gl.Photo(item);
      });

      /* отрисовка с фильтром, установленным при загрузке страницы */
      setActiveFilter(getActiveFilter());
      picturesLoading(false);
    };

    xhr.onerror = pictureFailure;
    xhr.ontimeout = pictureFailure;

    xhr.send();
  }

  function pictureFailure() {
    picturesLoading(false);
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
      renderedPictures.forEach(function(item) {
        picturesElement.removeChild(item.element);
      });
      renderedPictures = [];
    }
    var picturesFragment = document.createDocumentFragment();

    var from = page * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var pagePictures = pictures.slice(from, to);

    pagePictures.forEach(function(picture) {
      picturesFragment.appendChild(picture.render());
      renderedPictures.push(picture);

      picture.element.addEventListener('click', _onClick);
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

  function _onClick(event) {
    event.preventDefault();
    gallery.show();
  }
})(window);
