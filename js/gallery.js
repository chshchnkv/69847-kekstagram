'use strict';

/*
* Галерея фотографий
* @constructor
*/
function Gallery() {
  this._data = null;
  this._currentPicture = 0;
  this._currentPhoto = null;

  this.element = document.querySelector('.gallery-overlay');
  this._closeButton = this.element.querySelector('.gallery-overlay-close');
  this._image = this.element.querySelector('.gallery-overlay-image');
  this._likes = this.element.querySelector('.likes-count');
  this._likeButton = this.element.querySelector('.gallery-overlay-controls-like');
  this._commentsCount = this.element.querySelector('.comments-count');
  this._commentsText = this.element.querySelector('.gallery-overlay-controls-comments');

  this._onLikeClick = this._onLikeClick.bind(this);
  this._onPhotoClick = this._onPhotoClick.bind(this);
  this._onCloseClick = this._onCloseClick.bind(this);
  this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
}

/**
* Показ галереи с установкой обработчиков событий
*/
Gallery.prototype.show = function() {
  this.element.classList.remove('invisible');
  this._image.addEventListener('click', this._onPhotoClick);
  this._closeButton.addEventListener('click', this._onCloseClick);
  this._likeButton.addEventListener('click', this._onLikeClick);
  document.addEventListener('keydown', this._onDocumentKeyDown);
};

/**
* Скрывает галерею и удаляет обработчики событий
*/
Gallery.prototype.hide = function() {
  location.hash = '';
  this.element.classList.add('invisible');
  this._image.removeEventListener('click', this._onPhotoClick);
  this._closeButton.removeEventListener('click', this._onCloseClick);
  this._likeButton.removeAttribute('click', this._onLikeClick);
  document.removeEventListener('keydown', this._onDocumentKeyDown);
};

/**
* Обработчик щелчка по фотографии - при нажатии показывает следующую фотографию
* @listens click
* @private
*/
Gallery.prototype._onPhotoClick = function() {
  this.nextPicture();
};

/**
* Обработчик щелчка по крестику
* @listens click
* @private
*/
Gallery.prototype._onCloseClick = function() {
  this.hide();
};

/**
* Обработчик щелчка по лайку
* @listens click
* @private
*/
Gallery.prototype._onLikeClick = function() {
  this._currentPhoto.like(!this._likes.classList.contains('likes-count-liked'));
  this._updateLikes();
};

/**
* Обработчик нажатий клавиш
* @param {Event} event - событие нажатия клавиши
* @param {Event} - событие нажатия клавиши
* @private
*/
Gallery.prototype._onDocumentKeyDown = function(event) {
  switch (event.keyCode) {
    case 27: this.hide(); break;
    case 37: this.previousPicture(); break;
    case 39: this.nextPicture(); break;
  }
};

/**
* Установка данных для галереи
* @param {Photo[]} data - массив фотографий
*/
Gallery.prototype.setPictures = function(data) {
  this._data = data;
};

/**
* Синхронизация лайков
* @private
*/
Gallery.prototype._updateLikes = function() {
  var photo = this._data[this._currentPicture];
  this._likes.textContent = photo.getLikes();
  if (photo.isLiked()) {
    this._likes.classList.add('likes-count-liked');
  } else {
    this._likes.classList.remove('likes-count-liked');
  }
};

/**
* Установка фотографии, которую отображает галерея
* @param {number|string} pictureId - номер фотографии в массиве или url фотографии
*/
Gallery.prototype.setCurrentPicture = function(pictureId) {
  switch (typeof pictureId) {
    case 'number': {
      if ((pictureId >= 0) && (pictureId < this._data.length)) {
        this._currentPicture = pictureId;
        this._currentPhoto = this._data[pictureId];
      }
      break;
    }
    case 'string': {
      for (var i = 0; i < this._data.length; i++) {
        if (this._data[i].getImageSrc() === pictureId) {
          this._currentPicture = i;
          this._currentPhoto = this._data[i];
          break;
        }
      }
    }
  }

  if (this._currentPhoto) {
    this._image.src = this._currentPhoto.getImageSrc();
    this._updateLikes();

    var comments = this._currentPhoto.getComments();
    this._commentsCount.textContent = comments;
    this._commentsText.lastChild.nodeValue = this._getPluralCommentsCount(comments);
  }

};

/**
* Склоняет слово "комментарий" в зависимости от количества
* @param {number} count - количество комментариев
* @return {string}
* @private
*/
Gallery.prototype._getPluralCommentsCount = function(count) {
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

/**
* Возвращает фотографию по индексу в массиве
* @param {number} pictureNumber - номер фото в массиве
* @private
*/
Gallery.prototype._getPictureByNumber = function(pictureNumber) {
  if ((pictureNumber >= 0) && (pictureNumber < this._data.length)) {
    return this._data[pictureNumber];
  } else {
    return null;
  }
};

/**
* Изменение хэша в адресной строке для отображения изображения отличного от текущего
* @param {number} pictureNumber - номер фотографии претендента
* @private
*/
Gallery.prototype._switchPhoto = function(pictureNumber) {
  var newPhoto = this._getPictureByNumber(pictureNumber);
  if (newPhoto) {
    location.hash = '#photo/' + newPhoto.getImageSrc();
  }
};

/**
* Показывает следующую фотографию в массиве
*/
Gallery.prototype.nextPicture = function() {
  this._switchPhoto(this._currentPicture + 1);
};

/**
* Показывает предыдущую фотографию в массиве
*/
Gallery.prototype.previousPicture = function() {
  this._switchPhoto(this._currentPicture - 1);
};

module.exports = Gallery;
