'use strict';

/**
* Продляет цепочку прототипов
* @param {Function} - child of parent
* @param {Function} - parent of child
*/
module.exports = function(child, parent) {
  function EmptyCtor() {}
  EmptyCtor.prototype = parent.prototype;
  child.prototype = new EmptyCtor();
};
