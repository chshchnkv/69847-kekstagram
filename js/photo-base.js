'use strict';
(function(gl) {
  /**
  * Базовый объект для фотографий
  * @constructor
  */
  function PhotoBase() {}

  /**
  * @type {Photo[]}
  * @private
  */
  PhotoBase.prototype._data = null;

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
  * Возвращает число лайков
  * @return {number}
  */
  PhotoBase.prototype.getLikes = function() {
    return (this._data ? this._data.likes : 0);
  };

  /**
  * Возвращает true, если пользователь сам уже лайкнул фотографию
  * @return {boolean}
  */
  PhotoBase.prototype.isLiked = function() {
    return this._liked;
  };

  /**
  * Пользователь ставит/снимает лайк с фотографии
  * @param {boolean} bool - лайк/дизлайк
  */
  PhotoBase.prototype.like = function(bool) {
    this._liked = bool;
    if (this._data) {
      this._data.likes += (this._liked ? 1 : -1);
    }
  };

  /**
  * Возвращает количество комментариев к фотографии
  * @return {number}
  */
  PhotoBase.prototype.getComments = function() {
    return (this._data ? this._data.comments : 0);
  };

  /**
  * Возвращает дату фотографии
  * @return {Date}
  */
  PhotoBase.prototype.getDate = function() {
    return (this._data ? new Date(this._data.date) : new Date());
  };

  /**
  * Возвращает url фотографии
  * @return {string}
  */
  PhotoBase.prototype.getImageSrc = function() {
    return (this._data ? this._data.url : '');
  };

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

  gl.PhotoBase = PhotoBase;
})(window);
