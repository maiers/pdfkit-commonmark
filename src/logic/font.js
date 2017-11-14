export const forHeadingLevel = (level) => {
    switch (level) {
        case 1:
            return 'heading-bold';
        case 2:
            return 'heading-bold';
        case 3:
            return 'heading-default';
        default:
            return 'heading-bold';
    }
};

export const sizeForHeadingLevel = (level, baseSize = 12) => {
    switch (level) {
        case 1:
            return baseSize * 1.4;
        case 2:
            return baseSize * 1.2;
        case 3:
            return baseSize * 1.2;
        default:
            return baseSize;
    }
};

/**
 * Get the defined font for the given
 * internal name from the supplied
 * options map.
 *
 * @param {string} internalName
 * @param {object} options
 * @returns {string} The actual font name to use with pdfkit
 */
export const forInternalName = (internalName, options) => {

    if (!options || !options.fonts) {
        throw new Error('missing options.fonts');
    }

    return options.fonts[internalName];

};
