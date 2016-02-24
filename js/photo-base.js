'use strict';
function PhotoBase() {}

PhotoBase.prototype._data = null;

PhotoBase.prototype._liked = false;

PhotoBase.prototype.render = function() {};

PhotoBase.prototype.remove = function() {};

PhotoBase.prototype.getLikes = function() {
  return (this._data ? this._data.likes : 0);
};

PhotoBase.prototype.isLiked = function() {
  return this._liked;
};

PhotoBase.prototype.like = function(bool) {
  this._liked = bool;
  if (this._data) {
    this._data.likes += (this._liked ? 1 : -1);
  }
};

PhotoBase.prototype.getComments = function() {
  return (this._data ? this._data.comments : 0);
};

PhotoBase.prototype.getDate = function() {
  return (this._data ? new Date(this._data.date) : new Date());
};

PhotoBase.prototype.getImageSrc = function() {
  return (this._data ? this._data.url : '');
};

PhotoBase.prototype._onClick = function(event) {
  event.preventDefault();
  if (event.target.tagName === 'IMG') {
    if (typeof this.onClick === 'function') {
      this.onClick();
    }
  }
};

PhotoBase.prototype.onClick = null;

module.exports = PhotoBase;
