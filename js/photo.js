'use strict';
(function(gl) {
  function Photo(data) {
    this._data = data;
    this.element = null;
  }

  Photo.prototype.getLikes = function() {
    return (this._data ? this._data.likes : 0);
  };

  Photo.prototype.getComments = function() {
    return (this._data ? this._data.comments : 0);
  };

  Photo.prototype.getDate = function() {
    return (this._data ? new Date(this._data.date) : new Date());
  };

  Photo.prototype.render = function() {
    var template = document.querySelector('#picture-template');
    this.element = ('content' in template) ? template.content.children[0].cloneNode(true) : template.children[0].cloneNode(true);

    var templateImage = this.element.querySelector('img');

    if (this.element.classList.contains('picture')) {
      this.element.href = this._data.url;
      this.element.querySelector('.picture-comments').textContent = this._data.comments;
      this.element.querySelector('.picture-likes').textContent = this._data.likes;

      var img = new Image();

      img.onload = function() {
        clearTimeout(imageLoadTimeout);
        img.width = 182;
        img.height = 182;
        this.element.replaceChild(img, templateImage);
      }.bind(this);

      img.onerror = function() {
        this._imageLoadFailure();
      }.bind(this);

      var imageLoadTimeout = setTimeout(function() {
        this._imageLoadFailure();
      }.bind(this), gl.IMAGE_TIMEOUT);

      img.src = this._data.url;

    }
    return this.element;
  };

  Photo.prototype._imageLoadFailure = function() {
    this.element.classList.add('picture-load-failure');
  };

  gl.Photo = Photo;
})(window);
