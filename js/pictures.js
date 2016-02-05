'use strict';
(function(gl) {
  var filters = document.querySelector('.filters');
  var pictures = document.querySelector('.pictures');

  filters.classList.add('hidden');

  var picturesFragment = document.createDocumentFragment();

  gl.pictures.forEach(function(picture) {
    picturesFragment.appendChild(getElementFromTemplate(picture));
  });
  pictures.appendChild(picturesFragment);

  function getElementFromTemplate(picture) {
    var template = document.querySelector('#picture-template');
    var element = ('content' in template) ? template.content.children[0].cloneNode(true) : template.children[0].cloneNode(true);

    var templateImage = element.querySelector('img');
    var IMAGE_TIMEOUT = 10000;

    if (element.classList.contains('picture')) {
      element.href = picture.url;
      element.querySelector('.picture-comments').textContent = picture.comments;
      element.querySelector('.picture-likes').textContent = picture.likes;

      var img = new Image();

      img.onload = function() {
        clearTimeout(imageLoadTimeout);
        img.width = 182;
        img.height = 182;
        element.replaceChild(img, templateImage);
      };

      img.onerror = function() {
        imageLoadFailure();
      };

      var imageLoadTimeout = setTimeout(function() {
        imageLoadFailure();
      }, IMAGE_TIMEOUT);

      img.src = picture.url;

    }
    return element;

    function imageLoadFailure() {
      element.classList.add('picture-load-failure');
    }
  }
})(window);
