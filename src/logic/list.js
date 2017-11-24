export const arabicIndent = (doc, count) => doc.widthOfString(`${count}.`) + 5;

export const discIndent = (doc, fontSize) => (fontSize || 12) * 1; // eslint-disable-line no-unused-vars

/**
 * Return the calculated indent for the given listStyle,
 * listCount, fontSize and document.
 *
 * @param {PDFKitDocument} document
 * @param {string} listStyle
 * @param {number} listCount
 * @param {number} fontSize
 * @returns {number} The indent for the given list parameters
 */
export const indent = (document, listStyle, listCount, fontSize) => {

    switch (listStyle) {
        case 'arabic':
            return arabicIndent(document, listCount);
        case 'disc':
        default:
            return discIndent(document, fontSize);
    }

};
