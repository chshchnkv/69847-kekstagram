'use strict';

import inherit from 'inherit';
import PhotoBase from 'photo-base';

/**
* Фотография в списке.
* @constructor
* @param {PhotoData} data - данные, загруженные для одной фотографии
*/
function Photo(data) {
  this._onClick = this._onClick.bind(this);
  this.setData(data);
}

inherit(Photo, PhotoBase);

/**
* Генерация DOM-элемента по шаблону для представления фотографии в списке.
* @param {HTMLElement} appendTo - Если не null, то сгенерированный DOM-элемент будет включен последним дочерним элементом к appendTo
* @return {HTMLElement} - возвращает сгенерированный DOM-элемент
*/
Photo.prototype.render = function(appendTo) {
  let template = document.querySelector('#picture-template');
  this.element = ('content' in template) ? template.content.children[0].cloneNode(true) : template.children[0].cloneNode(true);

  let templateImage = this.element.querySelector('img');

  if (this.element.classList.contains('picture')) {
    this.element.href = this._photoData.getImageSrc();
    this._updateStats();

    let img = new Image();

    img.onload = () => {
      clearTimeout(imageLoadTimeout);
      img.width = 182;
      img.height = 182;
      this.element.replaceChild(img, templateImage);
    };

    img.onerror = () => {
      this._imageLoadFailure();
    };

    var imageLoadTimeout = setTimeout(() => {
      this._imageLoadFailure();
    }, window.IMAGE_TIMEOUT);

    img.src = this._photoData.getImageSrc();

    this.element.addEventListener('click', this._onClick);
  }

  if (appendTo) {
    appendTo.appendChild(this.element);
  }

  return this.element;
};

/**
* Обновить статистику фотографии
* @private
*/
Photo.prototype._updateStats = function() {
  if (this.element) {
    this.element.querySelector('.picture-comments').textContent = this._photoData.getComments();
    this.element.querySelector('.picture-likes').textContent = this._photoData.getLikes();
  }
};


/**
* Удаляет обработчики событий с DOM-элемента фотографии и удаляет его из DOM-дерева
* @param {HTMLElement} from - DOM-элемент, из которого нужно удалить DOM-элемент фотографии
*/
Photo.prototype.remove = function(from) {
  this.element.removeEventListener('click', this._onClick);
  if (from) {
    from.removeChild(this.element);
  }
};

/**
* Отображает заглушку, если загрузка фотографии не удалась
* @private
*/
Photo.prototype._imageLoadFailure = function() {
  this.element.classList.add('picture-load-failure');
};

/**
* Обработчик клика по элементу фотографии, вызывает колбэк onClick
* @param {event} event - событие клика
* @private
*/
Photo.prototype._onClick = function(event) {
  event.preventDefault();
  if (event.target.tagName === 'IMG' &&
     !this.element.classList.contains('picture-load-failure')) {
    if (typeof this.onClick === 'function') {
      this.onClick();
    }
  }
};

export default Photo;
