import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import { Parser } from 'commonmark';
import CommonmarkPDFRenderer from '../src/commonmark-pdfkit-renderer.js';
import * as TestUtils from './test-utils.js';

describe('dimensionsOfMarkdown', () => {

    const reader = new Parser();
    const writer = new CommonmarkPDFRenderer({debug: true});

    describe('for a single paragraph markdown', () => {

        const markdown = 'This is *emphasized*.';
        const parsed = reader.parse(markdown);

        describe('with default (page) width', () => {

            it('is equal to the rendered height', () => {

                const doc = new PDFDocument();

                doc.pipe(fs.createWriteStream(TestUtils.outputFilePath('dimensionsOfMarkdown for a single paragraph markdown with default page width')));

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

                assert.ok(Math.abs(calculatedDimensions.h - renderedDimensions.h) <= .001);
            });

            it('returns same height from heightOfMarkdown', () => {

                const doc = new PDFDocument();
                doc.pipe(fs.createWriteStream(TestUtils.outputFilePath('dimensionsOfMarkdown for a single paragraph markdown heightOfMarkdown')));

                const calculatedDimensions = writer.dimensionsOfMarkdown(doc, parsed, {});

                doc.rect(calculatedDimensions.x, calculatedDimensions.y, calculatedDimensions.w, calculatedDimensions.h)
                    .save()
                    .fill('lightgreen')
                    .restore();

                writer.render(doc, parsed, {});

                const height = writer.heightOfMarkdown(doc, parsed, {});

                doc.end();

                assert.ok(Math.abs(height - calculatedDimensions.h) <= .001);
            });

        });

        describe('with limited width', () => {

            it('is equal to the rendered height', () => {

                const doc = new PDFDocument();

                const outPath = TestUtils.outputFilePath('dimensionsOfMarkdown for a single paragraph markdown with limited width');
                doc.pipe(fs.createWriteStream(outPath));

                const pdfkitOptions = {width: 80};

                const calculatedDimensions = writer.dimensionsOfMarkdown(doc, parsed, pdfkitOptions);

                doc.rect(calculatedDimensions.x, calculatedDimensions.y, calculatedDimensions.w, calculatedDimensions.h)
                    .save()
                    .fill('lightgreen')
                    .restore();

                const renderedDimensions = writer.render(doc, parsed, pdfkitOptions);

                doc.rect(renderedDimensions.x, renderedDimensions.y, renderedDimensions.w, renderedDimensions.h)
                    .save()
                    .strokeOpacity(.1)
                    .stroke('eee')
                    .restore();

                doc.end();

                // TODO: Improve precision of this text
                assert.strictEqual(Math.round(calculatedDimensions.h), Math.round(renderedDimensions.h));
            });

        });

    });

    describe('for a two paragraphs markdown', () => {

        const markdown = 'This is *emphasized*.\n\nAnd another **strong** paragraph.';
        const parsed = reader.parse(markdown);

        it('is equal to the rendered height', () => {

            const doc = new PDFDocument();

            doc.pipe(fs.createWriteStream(TestUtils.outputFilePath('dimensionsOfMarkdown for two paragraphs')));

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

            assert.ok(Math.abs(calculatedDimensions.h - renderedDimensions.h) <= .001);

        });

    });

    describe('for linebreaks', () => {

        const markdown = 'This is *emphasized*.  \nAnd another  \n**strong** paragraph.';
        const parsed = reader.parse(markdown);

        it('is equal to the rendered height', () => {

            const doc = new PDFDocument();

            doc.pipe(fs.createWriteStream(TestUtils.outputFilePath('dimensionsOfMarkdown for linebreaks')));

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

            assert.ok(Math.abs(calculatedDimensions.h - renderedDimensions.h) <= .001);

        });

    });

    describe('for lists', () => {

        const markdown = 'This is an introduction sentence:\n\n- And one\n- Two\n- Three list items';
        const parsed = reader.parse(markdown);

        it('is equal to the rendered height', () => {

            const doc = new PDFDocument();

            doc.pipe(fs.createWriteStream(TestUtils.outputFilePath('dimensionsOfMarkdown for lists')));

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

            assert.ok(Math.abs(calculatedDimensions.h - renderedDimensions.h) <= .001);

        });

        it('is equal to the rendered height for a very narrow list', () => {

            const doc = new PDFDocument();

            doc.pipe(fs.createWriteStream(TestUtils.outputFilePath('dimensionsOfMarkdown for lists narrow')));

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

            assert.ok(Math.abs(calculatedDimensions.h - renderedDimensions.h) <= .001);

        });

    });

});
