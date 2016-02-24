'use strict';

/**
* Наследует объект от другого
* @param {Function} child - child of parent
* @param {Function} parent - parent of child
*/
module.exports = function(child, parent) {
  function EmptyCtor() {}
  EmptyCtor.prototype = parent.prototype;
  child.prototype = new EmptyCtor();
};
