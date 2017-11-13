#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import commonmark from 'commonmark';
import CommonmarkPDFRenderer from './commonmark-pdf-renderer';

// get input file info
const inputFilePath = process.argv[2];
const absInputFilePath = path.resolve(__dirname, inputFilePath);

// check input file exists
if (!fs.existsSync(absInputFilePath)) {
    console.error('File not found:', absInputFilePath);
    process.exit(1);
}

// get/define output file info
const baseName = path.basename(inputFilePath);
const outputFilePath = process.argv[3] || `${baseName}.pdf`;
const absOutputFilePath = path.resolve(__dirname, outputFilePath);

let fileContents, parsed;

// read input
try {
    fileContents = fs.readFileSync(absInputFilePath, 'utf8');
} catch (e) {
    console.error(`Could not read file '${absInputFilePath}': ${e.message}`);
    process.exit(2);
}

console.log('fileContents', fileContents);

// get parser instance
const reader = new commonmark.Parser();

// parse input
try {
    parsed = reader.parse(fileContents);
} catch (e) {
    console.error(`Could not parse contents of file '${absInputFilePath}': ${e.message}`);
    process.exit(3);
}

// get renderer instance
const writer = new CommonmarkPDFRenderer();

// create pdf document
const doc = new PDFDocument();

// pipe document to output file
doc.pipe(fs.createWriteStream(absOutputFilePath));

// render the parsed content
writer.render(doc, parsed);

// close the document
doc.end();
