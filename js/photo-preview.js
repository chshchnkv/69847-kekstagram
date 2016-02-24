'use strict';

var inherit = require('./inherit');
var PhotoBase = require('./photo-base');

function PhotoPreview() {}

inherit(PhotoPreview, PhotoBase);

module.exports = PhotoPreview;
