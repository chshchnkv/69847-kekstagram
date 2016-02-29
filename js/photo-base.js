'use strict';

/**
* Базовый объект для фотографий
* @constructor
*/
function PhotoBase() {}

/**
* @type {PhotoData}
* @private
*/
PhotoBase.prototype._photoData = null;

/**
* @type {boolean}
* @private
*/
PhotoBase.prototype._liked = false;

/**
* Отрисовка фотографии
*/
PhotoBase.prototype.render = function() {};

/**
* Удаление фотографии
*/
PhotoBase.prototype.remove = function() {};

/**
* Обработчик щелчка по фотографии с вызовом callback onClick
* @param {Event} event - событие щелчка
* @listens click
* @private
*/
PhotoBase.prototype._onClick = function(event) {
  event.preventDefault();
  if (event.target.tagName === 'IMG') {
    if (typeof this.onClick === 'function') {
      this.onClick();
    }
  }
};

/**
* callback для обработки щелчка
* @type {Function}
*/
PhotoBase.prototype.onClick = null;

export default PhotoBase;
