"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var Font = _interopRequireWildcard(require("./font"));

var List = _interopRequireWildcard(require("./list"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Execute the given operation on the given document.
 *
 * @param {object} operation
 * @param {PDFDocument} doc
 * @param {object} options
 */
var _default = function _default(operation, doc, options) {
  if (!options || options.debug) {
    console.log('executing operations', operation);
  }

  if (operation.moveDown) {
    doc.moveDown();
  }

  if (operation.moveUp) {
    doc.moveUp();
  }

  if (operation.font) {
    doc.font(Font.forInternalName(operation.font, options));
  }

  if (operation.fontSize) {
    doc.fontSize(operation.fontSize);
  }

  if (operation.fillColor) {
    doc.fillColor(operation.fillColor);
  }

  if (operation.horizontalLine) {
    doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke('#999999');
  }

  if (operation.listItem) {
    var textHeight = doc.heightOfString('The quick brown fox jumps over the lazy dog');

    if (textHeight + doc.y > doc.page.height - doc.page.margins.bottom) {
      var oldX = doc.x;
      doc.addPage();
      doc.x = oldX;
    }

    var renderDisc = function renderDisc(doc) {
      var radius = (options.fontSize || 12) * .25;
      var x = doc.x - 3 * radius;
      var y = doc.y + textHeight / 2 - radius / 2;
      doc.circle(x, y, radius).fill();
    };

    var renderArabic = function renderArabic(doc) {
      var oldX = doc.x;
      var x = doc.x - List.arabicIndent(doc, operation.listItemCount);
      var y = doc.y;
      var index = operation.listItemIndex + 1;
      console.log('_renderArabic', x, y, operation.listItemIndex, index);
      doc.text("".concat(index, "."), x, y, {
        continued: false
      });
      doc.moveUp();
      doc.x = oldX;
    };

    switch (operation.listItemStyle) {
      case 'arabic':
        renderArabic(doc);
        break;

      case 'disc':
      default:
        renderDisc(doc);
    }
  } // indent for lists


  if (operation.listDepth >= 0) {
    var indent = List.indent(doc, operation.listItemStyle, operation.listItemCount, options.fontSize);
    doc.x = doc.page.margins.left + operation.listDepth * indent;
  }

  if (Object.prototype.hasOwnProperty.call(operation, 'text')) {
    var textOptions = Object.assign({}, options.pdfkit, {
      continued: operation.continued,
      // requires false, to stop the link: https://github.com/devongovett/pdfkit/issues/464
      // this was changed (seemingly before) 0.8.3 to require null instead of false ...
      // anyway, this now works wit 0.8.3 + 0.11.0,
      // using `false` did not work with 0.11.0
      link: operation.link || null,
      underline: operation.underline || false
    });

    if (Object.prototype.hasOwnProperty.call(options.pdfkit || {}, 'width')) {
      var _indent = doc.x - doc.page.margins.left;

      if (_indent > 0) {
        textOptions.width -= _indent;
      }
    } // the space on empty/missing text is required, as pdfkit
    // would otherwise ignore the command


    doc.text(operation.text || ' ', textOptions);
  }
};

exports["default"] = _default;