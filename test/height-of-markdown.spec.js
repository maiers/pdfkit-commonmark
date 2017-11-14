import {describe, it} from 'mocha';
import {expect} from 'chai';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import commonmark from 'commonmark';
import CommonmarkPDFRenderer from '../src/commonmark-pdf-renderer';

const recursiveTestTitle = (ctx, tail = '') => {
    if (ctx) {
        return recursiveTestTitle(ctx.parent, ctx.title + ' ' + tail);
    }
    return tail;
};

const outputFilePath = (ctx) => path.join(__dirname, `${recursiveTestTitle(ctx.test || ctx.suite).replace(/[^a-z]+/ig, '_')}.pdf`);

describe('heightOfMarkdown', function () {

    const reader = new commonmark.Parser();
    const writer = new CommonmarkPDFRenderer();

    describe('for a single paragraph markdown', function () {

        const markdown = 'This is *emphasized*.';
        const parsed = reader.parse(markdown);

        it('is equal to the rendered height', function () {

            const doc = new PDFDocument();

            doc.pipe(fs.createWriteStream(outputFilePath(this)));

            const calculatedDimensions = writer.heightOfMarkdown(doc, parsed, {});

            doc.rect(calculatedDimensions.x, calculatedDimensions.y, calculatedDimensions.w, calculatedDimensions.h)
                .save()
                .fill('lightgreen')
                .restore();

            const renderedDimensions = writer.render(doc, parsed, {});

            doc.rect(renderedDimensions.x, renderedDimensions.y, renderedDimensions.w, renderedDimensions.h)
                .save()
                .stroke('ccc')
                .restore();

            doc.end();

            expect(calculatedDimensions.h).to.be.eql(renderedDimensions.h);

        });

        it('is equal to the rendered height, given a limited width', function () {

            const doc = new PDFDocument();

            doc.pipe(fs.createWriteStream(outputFilePath(this)));

            const pdfkitOptions = {width: 80};

            const calculatedDimensions = writer.heightOfMarkdown(doc, parsed, pdfkitOptions);

            doc.rect(calculatedDimensions.x, calculatedDimensions.y, calculatedDimensions.w, calculatedDimensions.h)
                .save()
                .fill('lightgreen')
                .restore();

            const renderedDimensions = writer.render(doc, parsed, pdfkitOptions);

            doc.rect(renderedDimensions.x, renderedDimensions.y, renderedDimensions.w, renderedDimensions.h)
                .save()
                .stroke('ccc')
                .restore();

            doc.end();

            // TODO: Improve precision of this text
            expect(calculatedDimensions.h).to.be.closeTo(renderedDimensions.h, .001);

        });

    });

    describe('for a two paragraphs markdown', function () {

        const markdown = 'This is *emphasized*.\n\nAnd another **strong** paragraph.';
        const parsed = reader.parse(markdown);

        it('is equal to the rendered height', function () {

            const doc = new PDFDocument();

            doc.pipe(fs.createWriteStream(outputFilePath(this)));

            const calculatedDimensions = writer.heightOfMarkdown(doc, parsed, {});

            doc.rect(calculatedDimensions.x, calculatedDimensions.y, calculatedDimensions.w, calculatedDimensions.h)
                .save()
                .fill('lightgreen')
                .restore();

            const renderedDimensions = writer.render(doc, parsed, {});

            doc.rect(renderedDimensions.x, renderedDimensions.y, renderedDimensions.w, renderedDimensions.h)
                .save()
                .stroke('ccc')
                .restore();

            doc.end();

            expect(calculatedDimensions.h).to.be.closeTo(renderedDimensions.h, .001);

        });

    });

});
