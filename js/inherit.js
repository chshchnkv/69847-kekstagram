'use strict';
(function(gl) {
  gl.inherit = function(child, parent) {
    function EmptyCtor() {}
    EmptyCtor.prototype = parent.prototype;
    child.prototype = new EmptyCtor();
  };
})(window);
