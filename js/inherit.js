'use strict';

module.exports = function(child, parent) {
  function EmptyCtor() {}
  EmptyCtor.prototype = parent.prototype;
  child.prototype = new EmptyCtor();
};
