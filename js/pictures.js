'use strict';

import Gallery from 'gallery';
import Photo from 'photo';
import PhotoData from 'photo-data';

export default function(gl) {
  /**
  * @const
  * @type {number}
  */
  gl.IMAGE_TIMEOUT = 10000;

  /**
  * @type {Gallery}
  */
  var gallery = new Gallery();

  /**
  * @const
  * @type {number}
  */
  const PAGE_SIZE = 12;

  /**
  * @type {number}
  */
  var currentPicturesPage = 0;

  /**
  * @type {string}
  */
  var activeFilter = '';

  /**
  * @type {HTMLElement}
  */
  var filters = document.querySelector('.filters');
  filters.classList.remove('hidden');

  /// Обработка событий при кликах на фильтрах
  filters.addEventListener('change', (event) => {
    if (event.target.classList.contains('filters-radio')) {
      setActiveFilter(event.target.id);
    }
  });

  /**
  * В момент загрузки определяет какой фильтр нужно установить. Если фильтр ранее не был сохранен в localStorage, то выбирается элемент, который установлен в html-документе
  * @return {string}
  */
  function restoreActiveFilter() {
    var filterToCheck = localStorage.getItem('activeFilter') || getCheckedFilter();
    setCheckedFilter(filterToCheck);
    return filterToCheck;
  }

  /**
  * Возвращает Id элемента, который установлен в html
  * @return {string}
  */
  function getCheckedFilter() {
    var filtersRadio = document.querySelectorAll('.filters-radio');
    return [].filter.call(filtersRadio, (item) => {
      return item.checked;
    })[0].id;
  }

  /**
  * Устанавливает checked в true для radio с указанным Id
  * @param {string} id - идентификатор radio
  */
  function setCheckedFilter(id) {
    var filterRadio = document.getElementById(id);
    filterRadio.checked = true;
  }

  /**
  * Устанавливает текущий фильтр по идентификатору
  * @param {string} id - устанавливаемый фильтр
  */
  function setActiveFilter(id) {

    if (activeFilter === id) {
      return;
    }

    activeFilter = id;
    localStorage.setItem('activeFilter', activeFilter);

    switch (activeFilter) {

      case 'filter-popular':
        filteredPictures = loadedPictures.slice(0);
        filteredPictures.sort((a, b) => {
          return b.getLikes() - a.getLikes();
        }); break;

      case 'filter-new':
        filteredPictures = loadedPictures.filter((item) => {
          let itemDate = item.getDate();
          return itemDate >= (new Date().valueOf() - (14 * 24 * 60 * 60 * 1000));
        });
        filteredPictures.sort((a, b) => {
          return (b.getDate().valueOf() - a.getDate().valueOf());
        }); break;

      case 'filter-discussed':
        filteredPictures = loadedPictures.slice(0);
        filteredPictures.sort((a, b) => {
          return b.getComments() - a.getComments();
        }); break;

      default:
        filteredPictures = loadedPictures.slice(0);
    }

    gallery.setPictures(filteredPictures);
    renderPictures(filteredPictures, 0, true);
  }

  /**
  * Контейнер для загрузки изображений
  * @type {HTMLElement}
  */
  var picturesElement = document.querySelector('.pictures');

  /**
  * Загруженные с сервера фотографии
  * @type {PhotoData[]}
  */
  var loadedPictures = [];

  /**
  * Отфильтрованные фотографии
  * @type {PhotoData[]}
  */
  var filteredPictures = [];

  /**
  * Фотографии отрисованные на странице
  * @type {Photo[]}
  */
  var renderedPictures = [];

  getPictures();

  /**
  * Таймер для фильтрации событий scroll
  * @type {number}
  */
  var scrollTimeout;
  gl.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (needToRenderNextPage()) {
        renderPictures(filteredPictures, ++currentPicturesPage);
      }
    }, 100);
  });

  /**
  * Проверяет нужно ли отрисовывать следующую страницу фотографий
  * Если нижний ряд фотографий в контейнере изображений отображается на экране наполовину и больше и выведены не все фотографии, значит нужно загрузить следующую страницу
  * @return {boolean}
  */
  function needToRenderNextPage() {
    return ((PAGE_SIZE * (currentPicturesPage + 1)) < filteredPictures.length) && (picturesElement.getBoundingClientRect().bottom - (182 / 2) <= gl.innerHeight);
  }

  /**
  * Загрузка фотографий с сервера
  */
  function getPictures() {
    picturesLoading(true);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
    xhr.timeout = gl.IMAGE_TIMEOUT;
    xhr.onload = (event) => {
      let rawData = event.target.response;
      let rawDataArray = JSON.parse(rawData);
      loadedPictures = rawDataArray.map((data) => {
        return new PhotoData(data);
      });

      /* отрисовка с фильтром, установленным при загрузке страницы */
      setActiveFilter(restoreActiveFilter());
      picturesLoading(false);
      _onHashChange();
    };

    xhr.onerror = pictureFailure;
    xhr.ontimeout = pictureFailure;

    xhr.send();
  }

  /**
  * Ставит заглушку если загрузка фотографий не удалась
  */
  function pictureFailure() {
    picturesLoading(false);
    picturesElement.classList.add('pictures-failure');
  }

  /**
  * Показывает или скрывает крутилку загрузки фотографий
  * @param {boolean} start - показать или скрыть крутилку
  */
  function picturesLoading(start) {
    if (start) {
      picturesElement.classList.add('pictures-loading');
    } else {
      picturesElement.classList.remove('pictures-loading');
    }
  }

  /**
  * Отрисовка фотографий на странице
  * @param {PhotoData[]} pictures - массив фотографий для отрисовки
  * @param {number} page - номер страницы, которую нужно отрисовать
  * @param {boolean} replace - true если нужно заменить имеющиеся фотографии на странице
  */
  function renderPictures(picturesData, page, replace) {
    page = page || 0;
    if (replace) {
      currentPicturesPage = 0;
      renderedPictures.forEach((item) => {
        item.onClick = null;
        item.remove(picturesElement);
      });
      renderedPictures = [];
    }
    var picturesFragment = document.createDocumentFragment();

    let from = page * PAGE_SIZE;
    let to = from + PAGE_SIZE;
    let pagePicturesData = picturesData.slice(from, to);

    renderedPictures = renderedPictures.concat(pagePicturesData.map((pictureData) => {
      let photo = new Photo(pictureData);

      photo.render(picturesFragment);
      photo.onClick = () => {
        location.hash = location.hash.indexOf('photo') !== -1 ? '' : 'photo/' + pictureData.getImageSrc();
      };
      return photo;
    }));
    picturesElement.appendChild(picturesFragment);

    /*
      рекурсивно вызываем функцию отрисовки, пока требуется вывод фотографий на экран
      сработает, если разрешение или масштаб вьюпорта позволяет вывести больше одной страницы на экран за раз
    */
    while (needToRenderNextPage()) {
      renderPictures(picturesData, ++currentPicturesPage);
    }
  }

  window.addEventListener('hashchange', _onHashChange);

  /**
  * Обработка изменения хэша адресной строки
  * @param {Event} event - событие смены хэша адресной строки
  * @listens hashchange
  * @private
  */
  function _onHashChange() {
    let matchUrls = location.hash.match(/#photo\/(\S+)/);
    if (matchUrls) {
      gallery.setCurrentPicture(matchUrls[1]);
      gallery.show();
    }
  }
}
