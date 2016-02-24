'use strict';

var inherit = require('./inherit');
var PhotoBase = require('./photo-base');

function Photo(data) {
  this._data = data;
  this.element = null;
  this._onClick = this._onClick.bind(this);
}

inherit(Photo, PhotoBase);

Photo.prototype.render = function(appendTo) {
  var template = document.querySelector('#picture-template');
  this.element = ('content' in template) ? template.content.children[0].cloneNode(true) : template.children[0].cloneNode(true);

  var templateImage = this.element.querySelector('img');

  if (this.element.classList.contains('picture')) {
    this.element.href = this.getImageSrc();
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
    }.bind(this), window.IMAGE_TIMEOUT);

    img.src = this._data.url;

    this.element.addEventListener('click', this._onClick);

  }

  if (appendTo) {
    appendTo.appendChild(this.element);
  }

  return this.element;
};

Photo.prototype.remove = function(from) {
  this.element.removeEventListener('click', this._onClick);
  if (from) {
    from.removeChild(this.element);
  }
};

Photo.prototype._imageLoadFailure = function() {
  this.element.classList.add('picture-load-failure');
};

Photo.prototype._onClick = function(event) {
  event.preventDefault();
  if (event.target.tagName === 'IMG' &&
     !this.element.classList.contains('picture-load-failure')) {
    if (typeof this.onClick === 'function') {
      this.onClick();
    }
  }
};

module.exports = Photo;
