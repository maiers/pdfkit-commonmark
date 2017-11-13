import {describe, it} from 'mocha';
import fs from 'fs';
import path from 'path';
import chai, {expect} from 'chai';
import chaiFS from 'chai-fs';
import PDFDocument from 'pdfkit';
import commonmark from 'commonmark';
import CommonmarkPDFRenderer from '../src/commonmark-renderer';

chai.use(chaiFS);

describe('final pdf render', function () {

    const instance = new CommonmarkPDFRenderer();
    const reader = new commonmark.Parser();

    it('simple', function () {

        const outputFilePath = path.join(`${__filename}.pdf`);

        const parsed = reader.parse(`

# Some simple formats (Level 1)

This is __strong__. This is _emphasized_.

This is ***strong and emphasized***.

## Lists (Level 2)

- List a
- List b
- List c

### Links (Level 3)

This is [a link](https://www.example.com) within some text. Or another emphasized *[link](#)*. This time we 
format [only **a part** of the string as **strong**](#). 

#### Heading 4

## Try CommonMark

You can try CommonMark here. This dingus is powered by
[commonmark.js](https://github.com/jgm/commonmark.js), the
JavaScript reference implementation.

# Some simple formats (Level 1)

This is __strong__. This is _emphasized_.

This is ***strong and emphasized***.

## Lists (Level 2)

- List a
- List b
- List c

### Links (Level 3)

This is [a link](https://www.example.com) within some text. Or another emphasized *[link](#)*. This time we 
format [only **a part** of the string as **strong**](#). 

#### Heading 4

## Try CommonMark

You can try CommonMark here. This dingus is powered by
[commonmark.js](https://github.com/jgm/commonmark.js), the
JavaScript reference implementation.


`);
        const writer = instance;

        const doc = new PDFDocument();

        doc.pipe(fs.createWriteStream(outputFilePath));

        // add name of the test file
        doc.text(`Location on disc: ${__filename}`).moveDown(2);

        writer.render(doc, parsed);

        doc.end();

        console.log('written to', outputFilePath);

        expect(outputFilePath).to.be.a.file();

    });

});