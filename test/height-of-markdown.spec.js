import {describe, it} from 'mocha';
import {expect} from 'chai';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import commonmark from 'commonmark';
import CommonmarkPDFRenderer from '../src/commonmark-pdfkit-renderer';

const recursiveTestTitle = (ctx, tail = '') => {
    if (ctx) {
        return recursiveTestTitle(ctx.parent, ctx.title + ' ' + tail);
    }
    return tail;
};

const outputFilePath = (ctx) => path.join(__dirname, `${recursiveTestTitle(ctx.test || ctx.suite).replace(/[^a-z]+/ig, '_')}.pdf`);

describe('dimensionsOfMarkdown', function () {

    const reader = new commonmark.Parser();
    const writer = new CommonmarkPDFRenderer();

    describe('for a single paragraph markdown', function () {

        const markdown = 'This is *emphasized*.';
        const parsed = reader.parse(markdown);

        describe('with default (page) width', function () {

            const doc = new PDFDocument();

            doc.pipe(fs.createWriteStream(outputFilePath(this)));

            const calculatedDimensions = writer.dimensionsOfMarkdown(doc, parsed, {});

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

            it('is equal to the rendered height', function () {
                expect(calculatedDimensions.h).to.be.eql(renderedDimensions.h);
            });

            it('returns same height from heightOfMarkdown', function () {
                expect(writer.heightOfMarkdown(doc, parsed, {})).to.be.eql(calculatedDimensions.h);
            });

        });

        describe('with limited width', function () {

            const doc = new PDFDocument();

            doc.pipe(fs.createWriteStream(outputFilePath(this)));

            const pdfkitOptions = {width: 80};

            const calculatedDimensions = writer.dimensionsOfMarkdown(doc, parsed, pdfkitOptions);

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

            it('is equal to the rendered height', function () {
                // TODO: Improve precision of this text
                expect(calculatedDimensions.h).to.be.closeTo(renderedDimensions.h, .001);
            });

        });

    });

    describe('for a two paragraphs markdown', function () {

        const markdown = 'This is *emphasized*.\n\nAnd another **strong** paragraph.';
        const parsed = reader.parse(markdown);

        it('is equal to the rendered height', function () {

            const doc = new PDFDocument();

            doc.pipe(fs.createWriteStream(outputFilePath(this)));

            const calculatedDimensions = writer.dimensionsOfMarkdown(doc, parsed, {});

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

    describe('for lists', function () {

        const markdown = 'This is an introduction sentence:\n\n- And one\m- Two\n- Three list items';
        const parsed = reader.parse(markdown);

        it('is equal to the rendered height', function () {

            const doc = new PDFDocument();

            doc.pipe(fs.createWriteStream(outputFilePath(this)));

            const calculatedDimensions = writer.dimensionsOfMarkdown(doc, parsed, {});

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

        it('is equal to the rendered height for a very narrow list', function () {

            const doc = new PDFDocument();

            doc.pipe(fs.createWriteStream(outputFilePath(this)));

            const calculatedDimensions = writer.dimensionsOfMarkdown(doc, parsed, {width: 50});

            doc.rect(calculatedDimensions.x, calculatedDimensions.y, calculatedDimensions.w, calculatedDimensions.h)
                .save()
                .fill('lightgreen')
                .restore();

            const renderedDimensions = writer.render(doc, parsed, {width: 50});

            doc.rect(renderedDimensions.x, renderedDimensions.y, renderedDimensions.w, renderedDimensions.h)
                .save()
                .stroke('ccc')
                .restore();

            doc.end();

            expect(calculatedDimensions.h).to.be.closeTo(renderedDimensions.h, .001);

        });

    });

});
