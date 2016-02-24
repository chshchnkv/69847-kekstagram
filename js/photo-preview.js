'use strict';

var inherit = require('./inherit');
var PhotoBase = require('./photo-base');

/**
* Превью фотографии в галерее
* @constructor
*/
function PhotoPreview() {}

inherit(PhotoPreview, PhotoBase);

module.exports = PhotoPreview;
