'use strict';
(function(gl) {
  function Gallery() {
    this._data = null;
    this._currentPicture = 0;

    this.element = document.querySelector('.gallery-overlay');
    this._closeButton = this.element.querySelector('.gallery-overlay-close');
    this._image = this.element.querySelector('.gallery-overlay-image');
    this._likes = this.element.querySelector('.likes-count');
    this._commentsCount = this.element.querySelector('.comments-count');
    this._commentsText = this.element.querySelector('.gallery-overlay-controls-comments');

    this._onPhotoClick = this._onPhotoClick.bind(this);
    this._onCloseClick = this._onCloseClick.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
  }

  Gallery.prototype.show = function() {
    this.element.classList.remove('invisible');
    this._image.addEventListener('click', this._onPhotoClick);
    this._closeButton.addEventListener('click', this._onCloseClick);
    document.addEventListener('keydown', this._onDocumentKeyDown);
  };

  Gallery.prototype.hide = function() {
    this.element.classList.add('invisible');
    this._image.removeEventListener('click', this._onPhotoClick);
    this._closeButton.removeEventListener('click', this._onCloseClick);
    document.removeEventListener('keydown', this._onDocumentKeyDown);
  };

  Gallery.prototype._onPhotoClick = function() {
    this.nextPicture();
  };

  Gallery.prototype._onCloseClick = function() {
    this.hide();
  };

  Gallery.prototype._onDocumentKeyDown = function(event) {
    switch (event.keyCode) {
      case 27: this.hide(); break;
      case 37: this.previousPicture(); break;
      case 39: this.nextPicture(); break;
    }
  };

  Gallery.prototype.setPictures = function(data) {
    this._data = data;
  };

  Gallery.prototype.setCurrentPicture = function(pictureNumber) {
    if ((pictureNumber >= 0) && (pictureNumber < this._data.length)) {
      this._currentPicture = pictureNumber;
      var photo = this._data[pictureNumber];

      this._image.src = photo.getImageSrc();
      this._likes.textContent = photo.getLikes();

      var comments = photo.getComments();
      this._commentsCount.textContent = comments;
      this._commentsText.lastChild.nodeValue = this._getPluralCommentsCount(comments);
    }
  };

  Gallery.prototype._getPluralCommentsCount = function(count) {
    if ((count >= 10) && (count <= 20)) {
      return ' комментариев';
    } else {
      var div = count % 10;
      if ((div >= 2) && (div <= 4)) {
        return ' комментария';
      } else if (div === 1) {
        return ' комментарий';
      } else {
        return ' комментариев';
      }
    }
  };

  Gallery.prototype.nextPicture = function() {
    this.setCurrentPicture(this._currentPicture + 1);
  };

  Gallery.prototype.previousPicture = function() {
    this.setCurrentPicture(this._currentPicture - 1);
  };

  gl.Gallery = Gallery;
})(window);
