(function () {

  "use strict";

  window.getMessage = function getMessage(a, b) {
    if (a === true) {
      return "Переданное GIF-изображение анимировано и содержит [" + b + "] кадров";
    } else if (a === false) {
      return "Переданное GIF-изображение не анимировано";
    } else if (typeof a === "number" && typeof b === "number") {
      return "Переданное SVG-изображение содержит " + a + " объектов и " + b * 4 + " аттрибутов";
    } else if (a.length > 0) {
      if (b.length > 0 && a.length === b.length) {
        var square = 0;
        
        for (var i=0; i<a.length; i++) {
          square += a[i]*b[i];
        }
        
        return "Общая площадь артефактов сжатия: " + square + " пикселей";
      } else {
        var sum = a.reduce(function (sum, current) {
          return sum + current;
        });

        return "Количество красных точек во всех строчках изображения: " + sum;
      }
      
    }
  };
  
  
}());
