#!/usr/bin/env node
"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _pdfkit = _interopRequireDefault(require("pdfkit"));

var _commonmark = require("commonmark");

var _commonmarkPdfkitRenderer = _interopRequireDefault(require("./commonmark-pdfkit-renderer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// get input file info
var inputFilePath = process.argv[2];

var absInputFilePath = _path["default"].resolve(__dirname, inputFilePath); // check input file exists


if (!_fs["default"].existsSync(absInputFilePath)) {
  console.error('File not found:', absInputFilePath);
  process.exit(1);
} // get/define output file info


var baseName = _path["default"].basename(inputFilePath);

var outputFilePath = process.argv[3] || "".concat(baseName, ".pdf");

var absOutputFilePath = _path["default"].resolve(__dirname, outputFilePath);

var fileContents, parsed; // read input

try {
  fileContents = _fs["default"].readFileSync(absInputFilePath, 'utf8');
} catch (e) {
  console.error("Could not read file '".concat(absInputFilePath, "': ").concat(e.message));
  process.exit(2);
} // get parser instance


var reader = new _commonmark.Parser(); // parse input

try {
  parsed = reader.parse(fileContents);
} catch (e) {
  console.error("Could not parse contents of file '".concat(absInputFilePath, "': ").concat(e.message));
  process.exit(3);
} // get renderer instance


var writer = new _commonmarkPdfkitRenderer["default"](); // create pdf document

var doc = new _pdfkit["default"](); // pipe document to output file

doc.pipe(_fs["default"].createWriteStream(absOutputFilePath)); // render the parsed content

writer.render(doc, parsed); // close the document

doc.end();