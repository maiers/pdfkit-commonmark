import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import { Parser } from 'commonmark';
import CommonmarkPDFRenderer from '../src/commonmark-pdfkit-renderer.js';
import * as TestUtils from './test-utils.js';
import { comparePdf } from './visual-compare.js';

function createDoc(outPath) {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);
    const finished = new Promise((resolve) => stream.on('finish', resolve));
    return { doc, finished };
}

describe('dimensionsOfMarkdown', () => {

    const reader = new Parser();
    const writer = new CommonmarkPDFRenderer({debug: true});

    describe('for a single paragraph markdown', () => {

        const markdown = 'This is *emphasized*.';
        const parsed = reader.parse(markdown);

        describe('with default (page) width', () => {

            it('is equal to the rendered height', async () => {

                const name = 'dimensionsOfMarkdown single paragraph default width';
                const outPath = TestUtils.outputFilePath(name);
                const { doc, finished } = createDoc(outPath);

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
                await finished;

                assert.ok(Math.abs(calculatedDimensions.h - renderedDimensions.h) <= .001);

                const result = comparePdf(outPath, name);
                assert.ok(result.pass, `Visual regression: ${name} differs from baseline`);
            });

            it('returns same height from heightOfMarkdown', async () => {

                const name = 'dimensionsOfMarkdown single paragraph heightOfMarkdown';
                const outPath = TestUtils.outputFilePath(name);
                const { doc, finished } = createDoc(outPath);

                const calculatedDimensions = writer.dimensionsOfMarkdown(doc, parsed, {});

                doc.rect(calculatedDimensions.x, calculatedDimensions.y, calculatedDimensions.w, calculatedDimensions.h)
                    .save()
                    .fill('lightgreen')
                    .restore();

                writer.render(doc, parsed, {});

                const height = writer.heightOfMarkdown(doc, parsed, {});

                doc.end();
                await finished;

                assert.ok(Math.abs(height - calculatedDimensions.h) <= .001);

                const result = comparePdf(outPath, name);
                assert.ok(result.pass, `Visual regression: ${name} differs from baseline`);
            });

        });

        describe('with limited width', () => {

            it('is equal to the rendered height', async () => {

                const name = 'dimensionsOfMarkdown single paragraph limited width';
                const outPath = TestUtils.outputFilePath(name);
                const { doc, finished } = createDoc(outPath);

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
                await finished;

                // TODO: Improve precision of this text
                assert.strictEqual(Math.round(calculatedDimensions.h), Math.round(renderedDimensions.h));

                const result = comparePdf(outPath, name);
                assert.ok(result.pass, `Visual regression: ${name} differs from baseline`);
            });

        });

    });

    describe('for a two paragraphs markdown', () => {

        const markdown = 'This is *emphasized*.\n\nAnd another **strong** paragraph.';
        const parsed = reader.parse(markdown);

        it('is equal to the rendered height', async () => {

            const name = 'dimensionsOfMarkdown two paragraphs';
            const outPath = TestUtils.outputFilePath(name);
            const { doc, finished } = createDoc(outPath);

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
            await finished;

            assert.ok(Math.abs(calculatedDimensions.h - renderedDimensions.h) <= .001);

            const result = comparePdf(outPath, name);
            assert.ok(result.pass, `Visual regression: ${name} differs from baseline`);

        });

    });

    describe('for linebreaks', () => {

        const markdown = 'This is *emphasized*.  \nAnd another  \n**strong** paragraph.';
        const parsed = reader.parse(markdown);

        it('is equal to the rendered height', async () => {

            const name = 'dimensionsOfMarkdown linebreaks';
            const outPath = TestUtils.outputFilePath(name);
            const { doc, finished } = createDoc(outPath);

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
            await finished;

            assert.ok(Math.abs(calculatedDimensions.h - renderedDimensions.h) <= .001);

            const result = comparePdf(outPath, name);
            assert.ok(result.pass, `Visual regression: ${name} differs from baseline`);

        });

    });

    describe('for lists', () => {

        const markdown = 'This is an introduction sentence:\n\n- And one\n- Two\n- Three list items';
        const parsed = reader.parse(markdown);

        it('is equal to the rendered height', async () => {

            const name = 'dimensionsOfMarkdown lists';
            const outPath = TestUtils.outputFilePath(name);
            const { doc, finished } = createDoc(outPath);

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
            await finished;

            assert.ok(Math.abs(calculatedDimensions.h - renderedDimensions.h) <= .001);

            const result = comparePdf(outPath, name);
            assert.ok(result.pass, `Visual regression: ${name} differs from baseline`);

        });

        it('is equal to the rendered height for a very narrow list', async () => {

            const name = 'dimensionsOfMarkdown lists narrow';
            const outPath = TestUtils.outputFilePath(name);
            const { doc, finished } = createDoc(outPath);

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
            await finished;

            assert.ok(Math.abs(calculatedDimensions.h - renderedDimensions.h) <= .001);

            const result = comparePdf(outPath, name);
            assert.ok(result.pass, `Visual regression: ${name} differs from baseline`);

        });

    });

});
