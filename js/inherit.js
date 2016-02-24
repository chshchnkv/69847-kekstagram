'use strict';
(function(gl) {
  /**
  * Продляет цепочку прототипов
  * @param {Function} - child of parent
  * @param {Function} - parent of child
  */
  gl.inherit = function(child, parent) {
    function EmptyCtor() {}
    EmptyCtor.prototype = parent.prototype;
    child.prototype = new EmptyCtor();
  };
})(window);
