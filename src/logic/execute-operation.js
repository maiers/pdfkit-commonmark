import * as Font from './font';

/**
 * Execute the given operation on the given document.
 *
 * @param {object} operation
 * @param {PDFDocument} doc
 * @param {object} options
 */
export default (operation, doc, options) => {

    if (!options || options.debug) {
        console.log('executing operations', operation);
    }

    if (operation.moveDown) {
        doc.moveDown();
    }

    if (operation.save) {
        doc.save();
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

    if (operation.text) {
        doc.text(operation.text, Object.assign({}, options.pdfkit, {
            continued: operation.continued,
            // requires false, to stop the link: https://github.com/devongovett/pdfkit/issues/464
            link: operation.link || false,
            underline: operation.underline || false
        }));
    }

    if (operation.list) {
        doc.list(operation.list, options.pdfkit);
    }

    if (operation.restore) {
        doc.restore();
    }

};
