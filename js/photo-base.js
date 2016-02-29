'use strict';

/**
* Базовый объект для фотографий
* @constructor
*/
function PhotoBase() {
}

/**
* @type {PhotoData}
* @private
*/
PhotoBase.prototype._photoData = null;

/**
* @type {HTMLElement}
*/
PhotoBase.prototype.element = null;

/**
* @type {boolean}
* @private
*/
PhotoBase.prototype._liked = false;

/*
* Установка данных для фото. При изменении данных PhotoData запустит событие change, а PhotoBase его обработает, запустив метод render
*/
PhotoBase.prototype.setData = function(data) {
  this._photoData = data;
  this._photoData.addSubscriber(this);

  this._onPhotoDataChange = this._onPhotoDataChange.bind(this);
};

/**
* Обработка изменения в данных модели - внутреннее событие PhotoDataChange
* По умолчанию вызывает обновление статистики для фотографии.
* @private
*/
PhotoBase.prototype._onPhotoDataChange = function() {
  this._updateStats();
};

/**
* Обновить статистику фотографии
* @private
*/
PhotoBase.prototype._updateStats = function() {};

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

/**
* callback для обработки изменения данных
*/

export default PhotoBase;
