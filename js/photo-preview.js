'use strict';

import inherit from 'inherit';
import PhotoBase from 'photo-base';

/**
* Превью фотографии в галерее
* @constructor
*/
function PhotoPreview() {
  this.element = document.querySelector('.gallery-overlay-preview');
  this._image = this.element.querySelector('.gallery-overlay-image');
  this._likes = this.element.querySelector('.likes-count');
  this._likeButton = this.element.querySelector('.gallery-overlay-controls-like');
  this._commentsCount = this.element.querySelector('.comments-count');
  this._commentsText = this.element.querySelector('.gallery-overlay-controls-comments');

  this._onLikeClick = this._onLikeClick.bind(this);
  this._likeButton.addEventListener('click', this._onLikeClick);
}

inherit(PhotoPreview, PhotoBase);

/**
* Обработчик щелчка по лайку
* @listens click
* @private
*/
PhotoPreview.prototype._onLikeClick = function() {
  this._photoData.setLike(!this._likes.classList.contains('likes-count-liked'));
//  this._updateLikes(); // здесь должно сработать событие PhotoData.change
};

/**
* Отрисовка фотографии
*/
PhotoPreview.prototype.render = function() {
  if (this._photoData) {
    this._image.src = this._photoData.getImageSrc();
    this._updateStats();
  }
};

/**
* Удаление фотографии
*/
PhotoPreview.prototype.remove = function() {
  this._likeButton.removeAttribute('click', this._onLikeClick);
  this.setData(null);
};


/**
* Обновить статистику фотографии
* @private
*/
PhotoPreview.prototype._updateStats = function() {
  this._likes.textContent = this._photoData.getLikes();
  if (this._photoData.isLiked()) {
    this._likes.classList.add('likes-count-liked');
  } else {
    this._likes.classList.remove('likes-count-liked');
  }

  var comments = this._photoData.getComments();
  this._commentsCount.textContent = comments;
  this._commentsText.lastChild.nodeValue = this._getPluralCommentsCount(comments);
};

/**
* Склоняет слово "комментарий" в зависимости от количества
* @param {number} count - количество комментариев
* @return {string}
* @private
*/
PhotoPreview.prototype._getPluralCommentsCount = function(count) {
  if ((count >= 10) && (count <= 20)) {
    return ' комментариев';
  } else {
    let div = count % 10;
    if ((div >= 2) && (div <= 4)) {
      return ' комментария';
    } else if (div === 1) {
      return ' комментарий';
    } else {
      return ' комментариев';
    }
  }
};


export default PhotoPreview;
