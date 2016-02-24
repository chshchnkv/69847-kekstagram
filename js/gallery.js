'use strict';
(function(gl) {
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

  Gallery.prototype.show = function() {
    this.element.classList.remove('invisible');
    this._image.addEventListener('click', this._onPhotoClick);
    this._closeButton.addEventListener('click', this._onCloseClick);
    this._likeButton.addEventListener('click', this._onLikeClick);
    document.addEventListener('keydown', this._onDocumentKeyDown);
  };

  Gallery.prototype.hide = function() {
    this.element.classList.add('invisible');
    this._image.removeEventListener('click', this._onPhotoClick);
    this._closeButton.removeEventListener('click', this._onCloseClick);
    this._likeButton.removeAttribute('click', this._onLikeClick);
    document.removeEventListener('keydown', this._onDocumentKeyDown);
  };

  Gallery.prototype._onPhotoClick = function() {
    this.nextPicture();
  };

  Gallery.prototype._onCloseClick = function() {
    this.hide();
  };

  Gallery.prototype._onLikeClick = function() {
    this._currentPhoto.like(!this._likes.classList.contains('likes-count-liked'));
    this._updateLikes();
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

  Gallery.prototype._updateLikes = function() {
    var photo = this._data[this._currentPicture];
    this._likes.textContent = photo.getLikes();
    if (photo.isLiked()) {
      this._likes.classList.add('likes-count-liked');
    } else {
      this._likes.classList.remove('likes-count-liked');
    }
  };

  Gallery.prototype.setCurrentPicture = function(pictureNumber) {
    if ((pictureNumber >= 0) && (pictureNumber < this._data.length)) {
      this._currentPicture = pictureNumber;
      this._currentPhoto = this._data[pictureNumber];

      this._image.src = this._currentPhoto.getImageSrc();
      this._updateLikes();

      var comments = this._currentPhoto.getComments();
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
