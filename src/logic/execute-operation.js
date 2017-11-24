import * as Font from './font';
import * as List from './list';

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

    if (operation.moveUp) {
        doc.moveUp();
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

    if (operation.listItem) {

        const textHeight = doc.heightOfString('The quick brown fox jumps over the lazy dog');
        if (textHeight + doc.y > doc.page.height - doc.page.margins.bottom) {
            const oldX = doc.x;
            doc.addPage();
            doc.x = oldX;
        }

        const renderDisc = (doc) => {
            const radius = (options.fontSize || 12) * .25;
            const x = doc.x - 3 * radius;
            const y = doc.y + (textHeight / 2) - (radius / 2);
            doc.circle(x, y, radius).fill();
        };

        const renderArabic = (doc) => {
            const oldX = doc.x;
            const x = doc.x - List.arabicIndent(doc, operation.listItemCount);
            const y = doc.y;
            const index = operation.listItemIndex + 1;
            console.log('_renderArabic', x, y, operation.listItemIndex, index);
            doc.text(`${index}.`, x, y, {continued: false});
            doc.moveUp();
            doc.x = oldX;
        };

        switch (operation.listItemStyle) {
            case 'arabic':
                renderArabic(doc);
                break;
            case 'disc':
            default:
                renderDisc(doc);
        }

    }

    // indent for lists
    if (operation.listDepth >= 0) {
        const indent = List.indent(doc, operation.listItemStyle, operation.listItemCount, options.fontSize);
        doc.x = doc.page.margins.left + (operation.listDepth * indent);
    }

    if (operation.hasOwnProperty('text')) {
        // the space on empty/missing text is required, as pdfkit
        // would otherwise ignore the command
        const textOptions = Object.assign({}, options.pdfkit, {
            continued: operation.continued,
            // requires false, to stop the link: https://github.com/devongovett/pdfkit/issues/464
            link: operation.link || false,
            underline: operation.underline || false
        });

        if ((options.pdfkit || {}).hasOwnProperty('width')) {
            const indent = doc.x - doc.page.margins.left;
            if (indent > 0) {
                textOptions.width -= indent;
            }
        }

        doc.text(operation.text || ' ', textOptions);
    }

};
