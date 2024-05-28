export const nameForHeadingLevel = (level) => {
    switch (level) {
        case 1:
            return 'heading-bold';
        case 2:
            return 'heading-bold';
        case 3:
            return 'heading-default';
        case 4:
            return 'heading-bold';
        default:
            return 'heading-default';
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

export const nameForCode = () => 'code';

export const sizeForCode = (options) => {
    if (!options || !options.fonts) {
        throw new Error('missing options.fonts');
    }
    // TODO: Adjusting the font-size requires adjusting the baseline to make sure
    //  inline-code is aligned with the surrounding text.
    return options.fontSize * 1;
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
