'use strict';

import PhotoPreview from 'photo-preview';

/*
* Галерея фотографий
* @constructor
*/
function Gallery() {
  this._photoPreview = new PhotoPreview();
  this._picturesData = null;
  this._currentPicture = 0;
  this._currentPhoto = null;

  this.element = document.querySelector('.gallery-overlay');
  this._closeButton = this.element.querySelector('.gallery-overlay-close');
  this._image = this.element.querySelector('.gallery-overlay-image');

  this._onCloseClick = this._onCloseClick.bind(this);
  this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
  this._onPhotoClick = this._onPhotoClick.bind(this);
}

/**
* Показ галереи с установкой обработчиков событий
*/
Gallery.prototype.show = function() {
  this.element.classList.remove('invisible');
  this._closeButton.addEventListener('click', this._onCloseClick);
  this._image.addEventListener('click', this._onPhotoClick);
  document.addEventListener('keydown', this._onDocumentKeyDown);
};

/**
* Скрывает галерею и удаляет обработчики событий
*/
Gallery.prototype.hide = function() {
  location.hash = '';
  this.element.classList.add('invisible');
  this._closeButton.removeEventListener('click', this._onCloseClick);
  this._image.removeEventListener('click', this._onPhotoClick);
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
* @param {PhotoData[]} data - массив фотографий
*/
Gallery.prototype.setPicturesData = function(data) {
  this._picturesData = data;
};

/**
* Установка фотографии, которую отображает галерея
* @param {number|string} pictureId - номер фотографии в массиве или url фотографии
*/
Gallery.prototype.setCurrentPicture = function(pictureId) {
  let currentPicture = null;
  switch (typeof pictureId) {
    case 'number': {
      if ((pictureId >= 0) && (pictureId < this._picturesData.length)) {
        this._currentPicture = pictureId;
        currentPicture = this._picturesData[this._currentPicture];
      }
      break;
    }
    case 'string': {
      for (let i = 0; i < this._picturesData.length; i++) {
        if (this._picturesData[i].getImageSrc() === pictureId) {
          this._currentPicture = i;
          currentPicture = this._picturesData[this._currentPicture];
          break;
        }
      }
    }
  }

  this._photoPreview.setData(currentPicture);
  this._photoPreview.render();
};

/**
* Возвращает фотографию по индексу в массиве
* @param {number} pictureNumber - номер фото в массиве
* @private
*/
Gallery.prototype._getPictureByNumber = function(pictureNumber) {
  if ((pictureNumber >= 0) && (pictureNumber < this._picturesData.length)) {
    return this._picturesData[pictureNumber];
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

export default Gallery;
