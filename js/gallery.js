'use strict';
(function(gl) {
  function Gallery() {
    this._data = null;
    this._currentPicture = 0;

    this.element = document.querySelector('.gallery-overlay');
    this._closeButton = this.element.querySelector('.gallery-overlay-close');
    this._image = this.element.querySelector('.gallery-overlay-image');
    this._likes = this.element.querySelector('.likes-count');
    this._comments = this.element.querySelector('.comments-count');

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
      this._comments.textContent = photo.getComments();
      this._likes.textContent = photo.getLikes();
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
