(function (gl) {

  "use strict";

  gl.getMessage = function getMessage(a, b) {
    if (a === true) {
      return "Переданное GIF-изображение анимировано и содержит [" + b + "] кадров";
    } else if (a === false) {
      return "Переданное GIF-изображение не анимировано";
    } else if (typeof a === "number" && typeof b === "number") {
      return "Переданное SVG-изображение содержит " + a + " объектов и " + b * 4 + " аттрибутов";
    } else if (a.length > 0) {
      
      var square = 0, i = 0, sum = 0;
      if (b.length > 0 && a.length === b.length) {
        
        for (i = 0; i < a.length; i += 1) {
          square += a[i] * b[i];
        }
        
        return "Общая площадь артефактов сжатия: " + square + " пикселей";
      } else {
        sum = a.reduce(function (sum, current) {
          return sum + current;
        });

        return "Количество красных точек во всех строчках изображения: " + sum;
      }
      
    }
  };
  
  
}(window));