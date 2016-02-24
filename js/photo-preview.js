'use strict';

function PhotoPreview() {}

require('./inherit')(PhotoPreview, require('./photo-base'));

module.exports = PhotoPreview;
