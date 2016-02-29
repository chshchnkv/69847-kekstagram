'use strict';

/**
* Модель данных для фотографии
* @constructor
* @param {Object} data - данные, загруженные для одной фотографии
*/
function PhotoData(data) {
  this._data = data;
}

/**
* @type {Object}
* @private
*/
PhotoData.prototype._data = null;

/**
* @type {boolean}
* @private
*/
PhotoData.prototype._liked = false;

/**
* Возвращает число лайков
* @return {number}
*/
PhotoData.prototype.getLikes = function() {
  return (this._data ? this._data.likes : 0);
};

/**
* Возвращает true, если пользователь сам уже лайкнул фотографию
* @return {boolean}
*/
PhotoData.prototype.isLiked = function() {
  return this._liked;
};

/**
* Пользователь ставит/снимает лайк с фотографии
* @param {boolean} bool - лайк/дизлайк
* @param {boolean} - лайк/дизлайк
*/
PhotoData.prototype.setLike = function(bool) {
  this._liked = bool;
  if (this._data) {
    this._data.likes += (this._liked ? 1 : -1);
  }
};

/**
* Возвращает количество комментариев к фотографии
* @return {number}
*/
PhotoData.prototype.getComments = function() {
  return (this._data ? this._data.comments : 0);
};

/**
* Возвращает дату фотографии
* @return {Date}
*/
PhotoData.prototype.getDate = function() {
  return (this._data ? new Date(this._data.date) : new Date());
};

/**
* Возвращает url фотографии
* @return {string}
*/
PhotoData.prototype.getImageSrc = function() {
  return (this._data ? this._data.url : '');
};

export default PhotoData;
