'use strict';
(function(gl) {
  /**
  * Наследует объект от другого
  * @param {Function} - child of parent
  * @param {Function} - parent of child
  */
  gl.inherit = function(child, parent) {
    function EmptyCtor() {}
    EmptyCtor.prototype = parent.prototype;
    child.prototype = new EmptyCtor();
  };
})(window);
