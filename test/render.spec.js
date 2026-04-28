import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';
import { Parser } from 'commonmark';
import CommonmarkPDFRenderer from '../src/commonmark-pdfkit-renderer.js';
import * as TestUtils from './test-utils.js';
import { comparePdf } from './visual-compare.js';

const __filename = fileURLToPath(import.meta.url);

function createDoc(outPath) {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);
    const finished = new Promise((resolve) => stream.on('finish', resolve));
    return { doc, finished };
}

const defaultMarkdown = `

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

#### Heading 4

## Try CommonMark

You can try CommonMark here. This dingus is powered by
[commonmark.js](https://github.com/jgm/commonmark.js), the
JavaScript reference implementation.

## Inline Code

Here follows some __inline__ code: \`const inline = 'code'\`, which ends here.

## Block Code

    const block = 'code';
    if (block !== 'code') {
      throw new Error('This is not code');
    }

`;

describe('final pdf render', () => {

    let instance = new CommonmarkPDFRenderer({
        debug: true
    });
    const reader = new Parser();

    it('simple', async () => {

        const name = 'final pdf render simple';
        const outPath = TestUtils.outputFilePath(name);
        const parsed = reader.parse(defaultMarkdown);

        const { doc, finished } = createDoc(outPath);
        doc.text(`Location on disc: ${__filename}`).moveDown(2);
        instance.render(doc, parsed);
        doc.end();

        await finished;

        const result = comparePdf(outPath, name);
        assert.ok(result.pass, `Visual regression: ${name} differs from baseline`);

    });

    it('use other fonts', async () => {

        instance = new CommonmarkPDFRenderer({
            fonts: {
                default: 'Helvetica',
                bold: 'Helvetica-Bold',
                italic: 'Helvetica-Oblique',
                'bold-italic': 'Helvetica-BoldOblique',
                'heading-bold': 'Courier-Bold',
                'heading-default': 'Courier',
                'code': 'Times-Roman',
            },
        });

        const name = 'final pdf render use other fonts';
        const outPath = TestUtils.outputFilePath(name);
        const parsed = reader.parse(defaultMarkdown);

        const { doc, finished } = createDoc(outPath);
        doc.text(`Location on disc: ${__filename}`).moveDown(2);
        instance.render(doc, parsed);
        doc.end();

        await finished;

        const result = comparePdf(outPath, name);
        assert.ok(result.pass, `Visual regression: ${name} differs from baseline`);

    });

    it('formated list', async () => {

        const name = 'final pdf render formated list';
        const outPath = TestUtils.outputFilePath(name);

        const parsed = reader.parse(`

# An ordered and formatted list using dashes

- _emphasized_
- __strong__
- [a link](https://www.example.com)
- *emphasized* and some text
- **strong** and some text
- [a link](https://www.example.com) and some text
- some text _emphasized_ more text
- some text __strong__ more text
- some text [a link](https://www.example.com) more text
- some text _emphasized_
- some text __strong__
- some text [a link](https://www.example.com)

# An ordered and formatted list using asterisks

* _emphasized_
* __strong__
* [a link](https://www.example.com)
* *emphasized* and some text
* **strong** and some text
* [a link](https://www.example.com) and some text
* some text _emphasized_ more text
* some text __strong__ more text
* some text [a link](https://www.example.com) more text
* some text _emphasized_
* some text __strong__
* some text [a link](https://www.example.com)

# A numbered and formatted list

1. _emphasized_
2. __strong__
3. [a link](https://www.example.com)
3. *emphasized* and some text
4. **strong** and some text
5. [a link](https://www.example.com) and some text
6. some text _emphasized_ more text
7. some text __strong__ more text
8. some text [a link](https://www.example.com) more text
9. some text _emphasized_
10. some text __strong__
11. some text [a link](https://www.example.com)


`);

        const { doc, finished } = createDoc(outPath);
        doc.text(`Location on disc: ${__filename}`).moveDown(2);
        instance.render(doc, parsed);
        doc.end();

        await finished;

        const result = comparePdf(outPath, name);
        assert.ok(result.pass, `Visual regression: ${name} differs from baseline`);

    });

    it('nested list', async () => {

        const name = 'final pdf render nested list';
        const outPath = TestUtils.outputFilePath(name);

        const parsed = reader.parse(`

# Two nested unordered lists

- List 1, Item 1
- List 1, Item 2
   - List 2, Item 1
   - List 2, Item 2
- List 1, Item 3

# Two nested ordered lists

1. List 1, Item 1
2. List 1, Item 2
   1. List 2, Item 1
   2. List 2, Item 2
3. List 1, Item 3

`);

        const { doc, finished } = createDoc(outPath);
        doc.text(`Location on disc: ${__filename}`).moveDown(2);
        instance.render(doc, parsed);
        doc.end();

        await finished;

        const result = comparePdf(outPath, name);
        assert.ok(result.pass, `Visual regression: ${name} differs from baseline`);

    });

    it('nested multiline list', async () => {

        const name = 'final pdf render nested multiline list';
        const outPath = TestUtils.outputFilePath(name);

        const parsed = reader.parse(`

# Two nested unordered lists with linebreaks

- List 1, Item 1
  Multiline_1-1
- List 1, Item 2
  Multiline_1-2
   - List 2, Item 1
  Multiline_2-1
   - List 2, Item 2
  Multiline_2-2
- List 1, Item 3
  Multiline_1-3

# Two nested ordered lists

1. List 1, Item 1
  **Multiline_1-1**
2. List 1, Item 2
  Multiline_1-2
   1. List 2, Item 1
  Multiline_2-1
   2. List 2, Item 2
  Multiline_2-2
3. List 1, Item 3
  Multiline_1-3

`);

        const { doc, finished } = createDoc(outPath);
        doc.text(`Location on disc: ${__filename}`).moveDown(2);
        instance.render(doc, parsed);
        doc.end();

        await finished;

        const result = comparePdf(outPath, name);
        assert.ok(result.pass, `Visual regression: ${name} differs from baseline`);

    });

    it('limited width', async () => {

        const name = 'final pdf render limited width';
        const outPath = TestUtils.outputFilePath(name);

        const parsed = reader.parse(`

# Some simple formats (Level 1)

This is __strong__. This is _emphasized_.

This is ***strong and emphasized***.

This is a forced
linebreak. While
the following linebreaks
will not be visible
later.

`);

        const { doc, finished } = createDoc(outPath);
        doc.text(`Location on disc: ${outPath}`).moveDown(2);

        const calculatedDimensions = instance.dimensionsOfMarkdown(doc, parsed, {
            width: 200
        });

        doc.rect(calculatedDimensions.x, calculatedDimensions.y, calculatedDimensions.w, calculatedDimensions.h)
            .save()
            .fill('lightgreen')
            .restore();

        const renderedDimensions = instance.render(doc, parsed, {
            width: 200
        });

        doc.rect(renderedDimensions.x, renderedDimensions.y, renderedDimensions.w, renderedDimensions.h)
            .save()
            .stroke()
            .restore();

        doc.end();

        await finished;

        assert.ok(renderedDimensions.x > 0);
        assert.ok(Math.abs(calculatedDimensions.h - renderedDimensions.h) <= .001);

        const result = comparePdf(outPath, name);
        assert.ok(result.pass, `Visual regression: ${name} differs from baseline`);

    });

    describe('forced linebreaks', () => {

        const parsed = reader.parse(`

Multiple **strong**
forced
[linebreaks](https://www.example.com)
over
six
lines.

`);
        const writer = instance;

        it('full width', async () => {

            const name = 'final pdf render forced linebreaks full width';
            const outPath = TestUtils.outputFilePath(name);

            const { doc, finished } = createDoc(outPath);
            doc.text(`Location on disc: ${outPath}`).moveDown(2);
            writer.render(doc, parsed);
            doc.end();

            await finished;

            const result = comparePdf(outPath, name);
            assert.ok(result.pass, `Visual regression: ${name} differs from baseline`);

        });

        it('limited width', async () => {

            const name = 'final pdf render forced linebreaks limited width';
            const outPath = TestUtils.outputFilePath(name);

            const { doc, finished } = createDoc(outPath);
            doc.text(`Location on disc: ${outPath}`).moveDown(2);
            writer.render(doc, parsed, {
                width: 200
            });
            doc.end();

            await finished;

            const result = comparePdf(outPath, name);
            assert.ok(result.pass, `Visual regression: ${name} differs from baseline`);

        });

    });

});
