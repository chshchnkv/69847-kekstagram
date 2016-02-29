'use strict';

/**
 * @constructor
 * @param {string} image
 */
var Resizer = function(image) {
  // Изображение, с которым будет вестись работа.
  this._image = new Image();
  this._image.src = image;

  // Холст.
  this._container = document.createElement('canvas');
  this._ctx = this._container.getContext('2d');

  // Создаем холст только после загрузки изображения.
  this._image.onload = function() {
    // Размер холста равен размеру загруженного изображения. Это нужно
    // для удобства работы с координатами.
    this._container.width = this._image.naturalWidth;
    this._container.height = this._image.naturalHeight;

    /**
     * Предлагаемый размер кадра в виде коэффициента относительно меньшей
     * стороны изображения.
     * @const
     * @type {number}
     */
    var INITIAL_SIDE_RATIO = 0.75;
    // Размер меньшей стороны изображения.
    var side = Math.min(
        this._container.width * INITIAL_SIDE_RATIO,
        this._container.height * INITIAL_SIDE_RATIO);

    // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
    // от размера меньшей стороны.
    this._resizeConstraint = new Square(
        this._container.width / 2 - side / 2,
        this._container.height / 2 - side / 2,
        side);

    // Отрисовка изначального состояния канваса.
    this.redraw();
  }.bind(this);

  // Фиксирование контекста обработчиков.
  this._onDragStart = this._onDragStart.bind(this);
  this._onDragEnd = this._onDragEnd.bind(this);
  this._onDrag = this._onDrag.bind(this);
};

Resizer.prototype = {
  /**
   * Родительский элемент канваса.
   * @type {Element}
   * @private
   */
  _element: null,

  /**
   * Положение курсора в момент перетаскивания. От положения курсора
   * рассчитывается смещение на которое нужно переместить изображение
   * за каждую итерацию перетаскивания.
   * @type {Coordinate}
   * @private
   */
  _cursorPosition: null,

  /**
   * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
   * от верхнего левого угла исходного изображения.
   * @type {Square}
   * @private
   */
  _resizeConstraint: null,

  /**
   * Отрисовка канваса.
   */
  redraw: function() {
    // Очистка изображения.
    this._ctx.clearRect(0, 0, this._container.width, this._container.height);

    // Параметры линии.
    // NB! Такие параметры сохраняются на время всего процесса отрисовки
    // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
    // чего-либо с другой обводкой.

    // Толщина линии.
    // this._ctx.lineWidth = 6;
    // Цвет обводки.
    this._ctx.strokeStyle = '#ffe753';
    // Размер штрихов. Первый элемент массива задает длину штриха, второй
    // расстояние между соседними штрихами.
    this._ctx.setLineDash([15, 10]);
    // Смещение первого штриха от начала линии.
    this._ctx.lineDashOffset = 7;

    // Сохранение состояния канваса.
    // Подробней см. строку 132.
    this._ctx.save();

    // Установка начальной точки системы координат в центр холста.
    this._ctx.translate(this._container.width / 2, this._container.height / 2);

    let displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
    let displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
    // Отрисовка изображения на холсте. Параметры задают изображение, которое
    // нужно отрисовать и координаты его верхнего левого угла.
    // Координаты задаются от центра холста.
    this._ctx.drawImage(this._image, displX, displY);

    // Отрисовка затенения
    this._ctx.beginPath();
    this._ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';

    // Задаём внешний контур
    this._ctx.moveTo(-this._container.width / 2, -this._container.height / 2);
    this._ctx.lineTo(this._container.width / 2, -this._container.height / 2);
    this._ctx.lineTo(this._container.width / 2, this._container.height / 2);
    this._ctx.lineTo(-this._container.width / 2, this._container.height / 2);
    this._ctx.lineTo(-this._container.width / 2, -this._container.height / 2);

    let lineWidth = 6;
    let gap = 7;
    // Задаём внутренний контур
    let topX = -this._resizeConstraint.side / 2;
    let topY = -this._resizeConstraint.side / 2 - lineWidth;

    this._ctx.moveTo(topX, topY);
    this._ctx.lineTo(topX + this._resizeConstraint.side, topY);
    this._ctx.lineTo(topX + this._resizeConstraint.side, topY + this._resizeConstraint.side);
    this._ctx.lineTo(topX, topY + this._resizeConstraint.side);
    this._ctx.lineTo(topX, topY);
    // Заполняем пространство между контурами
    this._ctx.fill('evenodd');

    // Выводим размер изображения
    var fontSize = 20;
    this._ctx.font = `${fontSize}px sans-serif`;
    this._ctx.textAlign = 'center';
    this._ctx.fillStyle = '#fff';

    let sizeText = `${this._image.naturalWidth} x ${this._image.naturalHeight}`;

    this._ctx.fillText(sizeText, 0, topY - this._ctx.lineWidth - (fontSize / 2), this._resizeConstraint.side);

    // Отрисовка прямоугольника, обозначающего область изображения после
    // кадрирования. Координаты задаются от центра.
    // уменьшил размер потому что рамка выходила за область с заданием значений
    this._createBorder(
      topX, topY,
      this._resizeConstraint.side,
      lineWidth,
      gap,
      '#ffe753',
      'dotted');

    // Восстановление состояния канваса, которое было до вызова ctx.save
    // и последующего изменения системы координат. Нужно для того, чтобы
    // следующий кадр рисовался с привычной системой координат, где точка
    // 0 0 находится в левом верхнем углу холста, в противном случае
    // некорректно сработает даже очистка холста или нужно будет использовать
    // сложные рассчеты для координат прямоугольника, который нужно очистить.
    this._ctx.restore();
  },

  /**
   * Отрисовка стороны обрезающего прямоугольника заданным способом
   * @param {number} x
   * @param {number} y
   * @param {number} sideSize
   * @param {number} lineWeight
   * @param {number} gap
   * @param {string} lineColor
   * @param {string} lineType
   * @private
  */
  _createBorder: function(x, y, sideSize, lineWeight, gap, lineColor, lineType) {
    x += lineWeight / 2;
    y += lineWeight / 2;
    sideSize -= lineWeight;

    if (!lineType) {
      this._ctx.lineWidth = lineWeight;
      this._ctx.strokeStyle = lineColor;
      this._ctx.strokeRect(x, y,
                           sideSize, sideSize);
    } else {
      var offset = 0;
      offset = this._createBorderSide(x, y, offset, sideSize, lineWeight, gap, lineColor, lineType, 1, 0);
      offset = this._createBorderSide(x + sideSize, y, offset, sideSize, lineWeight, gap, lineColor, lineType, 0, 1);
      offset = this._createBorderSide(x + sideSize, y + sideSize, offset, sideSize, lineWeight, gap, lineColor, lineType, -1, 0);
      this._createBorderSide(x, y + sideSize, offset, sideSize, lineWeight, gap, lineColor, lineType, 0, -1);
    }
  },

  /**
   * Отрисовка стороны обрезающего прямоугольника заданным способом
   * @param {number} x
   * @param {number} y
   * @param {number} offset
   * @param {number} sideSize
   * @param {number} lineWeight
   * @param {number} gap
   * @param {string} lineColor
   * @param {string} lineType
   * @param {number} directionX
   * @param {number} directionY
   * @private
  */
  _createBorderSide: function(x, y, offset, sideSize, lineWeight, gap, lineColor, lineType, directionX, directionY) {
    let step = lineWeight + gap;
    let limitX = x + directionX * sideSize;
    let limitY = y + directionY * sideSize;
    let d = 0;

    x += directionX * offset;
    y += directionY * offset;

    this._ctx.fillStyle = lineColor;
    while ((directionX !== 0 && directionX * x <= directionX * limitX) || (directionY !== 0 && directionY * y <= directionY * limitY)) {
      if (lineType === 'dotted') {
        this._ctx.beginPath();
        this._ctx.arc(x, y, lineWeight / 2, 0, Math.PI * 2);
        this._ctx.fill();
      }
      d++;
      x += directionX * step;
      y += directionY * step;
    }
    return directionX !== 0 ? directionX * (x - limitX) : directionY * (y - limitY);
  },

  /**
   * Включение режима перемещения. Запоминается текущее положение курсора,
   * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
   * позволяющие перерисовывать изображение по мере перетаскивания.
   * @param {number} x
   * @param {number} y
   * @private
   */
  _enterDragMode: function(x, y) {
    this._cursorPosition = new Coordinate(x, y);
    document.body.addEventListener('mousemove', this._onDrag);
    document.body.addEventListener('mouseup', this._onDragEnd);
  },

  /**
   * Выключение режима перемещения.
   * @private
   */
  _exitDragMode: function() {
    this._cursorPosition = null;
    document.body.removeEventListener('mousemove', this._onDrag);
    document.body.removeEventListener('mouseup', this._onDragEnd);
  },

  /**
   * Перемещение изображения относительно кадра.
   * @param {number} x
   * @param {number} y
   * @private
   */
  updatePosition: function(x, y) {
    this.moveConstraint(
        this._cursorPosition.x - x,
        this._cursorPosition.y - y);
    this._cursorPosition = new Coordinate(x, y);
  },

  /**
   * @param {MouseEvent} evt
   * @private
   */
  _onDragStart: function(evt) {
    this._enterDragMode(evt.clientX, evt.clientY);
  },

  /**
   * Обработчик окончания перетаскивания.
   * @private
   */
  _onDragEnd: function() {
    this._exitDragMode();
  },

  /**
   * Обработчик события перетаскивания.
   * @param {MouseEvent} evt
   * @private
   */
  _onDrag: function(evt) {
    this.updatePosition(evt.clientX, evt.clientY);
  },

  /**
   * Добавление элемента в DOM.
   * @param {Element} element
   */
  setElement: function(element) {
    if (this._element === element) {
      return;
    }

    this._element = element;
    this._element.insertBefore(this._container, this._element.firstChild);
    // Обработчики начала и конца перетаскивания.
    this._container.addEventListener('mousedown', this._onDragStart);
  },

  /**
   * Возвращает кадрирование элемента.
   * @return {Square}
   */
  getConstraint: function() {
    return this._resizeConstraint;
  },

  /**
   * Смещает кадрирование на значение указанное в параметрах.
   * @param {number} deltaX
   * @param {number} deltaY
   * @param {number} deltaSide
   */
  moveConstraint: function(deltaX, deltaY, deltaSide) {
    this.setConstraint(
        this._resizeConstraint.x + (deltaX || 0),
        this._resizeConstraint.y + (deltaY || 0),
        this._resizeConstraint.side + (deltaSide || 0));
  },

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} side
   */
  setConstraint: function(x, y, side) {
    if (typeof x !== 'undefined') {
      this._resizeConstraint.x = x;
    }

    if (typeof y !== 'undefined') {
      this._resizeConstraint.y = y;
    }

    if (typeof side !== 'undefined') {
      this._resizeConstraint.side = side;
    }

    requestAnimationFrame(() => {
      this.redraw();
      window.dispatchEvent(new CustomEvent('resizerchange'));
    });
  },

  /**
   * Удаление. Убирает контейнер из родительского элемента, убирает
   * все обработчики событий и убирает ссылки.
   */
  remove: function() {
    this._element.removeChild(this._container);

    this._container.removeEventListener('mousedown', this._onDragStart);
    this._container = null;
  },

  /**
   * Экспорт обрезанного изображения как HTMLImageElement и исходником
   * картинки в src в формате dataURL.
   * @return {Image}
   */
  exportImage: function() {
    // Создаем Image, с размерами, указанными при кадрировании.
    let imageToExport = new Image();

    // Создается новый canvas, по размерам совпадающий с кадрированным
    // изображением, в него добавляется изображение взятое из канваса
    // с измененными координатами и сохраняется в dataURL, с помощью метода
    // toDataURL. Полученный исходный код, записывается в src у ранее
    // созданного изображения.
    let temporaryCanvas = document.createElement('canvas');
    let temporaryCtx = temporaryCanvas.getContext('2d');
    temporaryCanvas.width = this._resizeConstraint.side;
    temporaryCanvas.height = this._resizeConstraint.side;
    temporaryCtx.drawImage(this._image,
        -this._resizeConstraint.x,
        -this._resizeConstraint.y);
    imageToExport.src = temporaryCanvas.toDataURL('image/png');

    return imageToExport;
  }
};

/**
 * Вспомогательный тип, описывающий квадрат.
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} side
 * @private
 */
var Square = function(x, y, side) {
  this.x = x;
  this.y = y;
  this.side = side;
};

/**
 * Вспомогательный тип, описывающий координату.
 * @constructor
 * @param {number} x
 * @param {number} y
 * @private
 */
var Coordinate = function(x, y) {
  this.x = x;
  this.y = y;
};

export default Resizer;
