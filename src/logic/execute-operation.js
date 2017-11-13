/**
 * Get the defined font for the given
 * internal name from the supplied
 * options map.
 *
 * @param {string} internalName
 * @param {object} options
 * @returns {string} The actual font name to use with pdfkit
 */
const getFont = (internalName, options) => {

    if (!options || !options.fonts) {
        throw new Error('missing options.fonts');
    }

    return options.fonts[internalName];

};

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
        doc.font(getFont(operation.font, options));
    }

    if (operation.fontSize) {
        doc.fontSize(operation.fontSize);
    }

    if (operation.fillColor) {
        doc.fillColor(operation.fillColor);
    }

    if (operation.text) {
        doc.text(operation.text, {
            continued: operation.continued,
            // requires false, to stop the link: https://github.com/devongovett/pdfkit/issues/464
            link: operation.link || false,
            underline: operation.underline || false
        });
    }

    if (operation.list) {
        doc.list(operation.list);
    }

    if (operation.restore) {
        doc.restore();
    }

};
