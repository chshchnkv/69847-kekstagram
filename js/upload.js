/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

var Resizer = require('./resizer');

module.exports = function(gl) {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    let images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    let backgroundElement = document.querySelector('.upload');
    let randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    let resizeLeft = +resizeForm.elements['resize-x'].value;
    let resizeTop = +resizeForm.elements['resize-y'].value;
    let resizeSize = +resizeForm.elements['resize-size'].value;

    if ((resizeLeft < 0) || (resizeTop < 0) || (resizeSize < 0)) {
      return false;
    } else if ((resizeLeft + resizeSize) > currentResizer._image.naturalWidth) {
      return false;
    } else if ((resizeTop + resizeSize) > currentResizer._image.naturalHeight) {
      return false;
    }
    return true;
  }

  function validateResizeForm(valid) {
    if (valid) {
      resizeFormSubmit.removeAttribute('disabled');
      if (errorMsg) {
        resizeControls.removeChild(errorMsg);
        errorMsg = null;
      }
    } else {
      resizeFormSubmit.setAttribute('disabled', true);
      if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'resize-error';
        errorMsg.innerHTML = 'Проверьте правильность введённых данных';
        resizeControls.appendChild(errorMsg);
      }
    }
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];
  var resizeControls = resizeForm.querySelector('.upload-resize-controls');
  var resizeFormSubmit = resizeForm.elements['resize-fwd'];
  var errorMsg = resizeControls.querySelector('.resize-error');

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    let isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.addEventListener('change', (evt) => {
    let element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        let fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.onload = () => {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
        };

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  });

  function updateResizeForm() {
    validateResizeForm(resizeFormIsValid());
    if (currentResizer !== null) {
      let constraint = currentResizer.getConstraint();
      resizeForm.elements['resize-x'].value = Math.floor(constraint.x);
      resizeForm.elements['resize-y'].value = Math.floor(constraint.y);
      resizeForm.elements['resize-size'].value = Math.floor(constraint.side);
    }
  }

  function updateResizer() {
    validateResizeForm(resizeFormIsValid());
    if (currentResizer !== null) {
      currentResizer.setConstraint(+resizeForm.elements['resize-x'].value, +resizeForm.elements['resize-y'].value, +resizeForm.elements['resize-size'].value);
    }
  }

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', (evt) => {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  /*global docCookies*/
  resizeForm.addEventListener('submit', (evt) => {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
      setSelectedFilter(docCookies.getItem('filter'));
    }
  });

  resizeForm.addEventListener('change', onResizeFormChange);
  function onResizeFormChange() {
    errorMsg = resizeControls.querySelector('.resize-error');

    updateResizer();
  }

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', (evt) => {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */

  filterForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    docCookies.setItem('filter', getSelectedFilter(), cookieEspires());

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  function cookieEspires() {
    let now = new Date();
    let lastBirthday = new Date(now.getFullYear(), 2, 23);
    if ((now.valueOf() - lastBirthday.valueOf()) < 0) {
      lastBirthday.setFullYear(lastBirthday.getFullYear() - 1);
    }
    return new Date(+now + Math.abs(now.valueOf() - lastBirthday.valueOf()));
  }

  function getSelectedFilter() {
    return [].filter.call(filterForm['upload-filter'], (item) => {
      return item.checked;
    })[0].value;
  }

  function setSelectedFilter(filterValue) {
    var itemToCheck = [].filter.call(filterForm['upload-filter'], (item) => {
      return item.value === filterValue;
    });

    if (itemToCheck.length > 0) {
      itemToCheck[0].checked = true;
      onFilterFormChange();
    }
  }

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', onFilterFormChange);

  function onFilterFormChange() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[getSelectedFilter()];
  }

  gl.addEventListener('resizerchange', updateResizeForm);

  cleanupResizer();
  updateBackground();
};
