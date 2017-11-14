const mergeFonts = (font0, font1) => {

    const combinedFont = [font0, font1].sort().join('-');
    switch (combinedFont) {
        case 'bold-italic':
            return 'bold-italic';
        default:
            return font1;
    }

};

/**
 * Optimize the operations for usage with pdfkit
 *
 * @param operations
 * @returns {Array}
 */
export default (operations, options) => {

    // some operations cannot be mixed with others
    // when calling pdfkit
    const output = [...operations];

    if (!options || options.debug) {
        console.log('\nOperations:\n', JSON.stringify(operations, null, 4));
    }

    // ensure "continued" operations are merged with the latest text node
    for (let i = operations.length - 1; i >= 0; i--) {
        const currentOperation = operations[i];
        const hasContinuedProperty = currentOperation.hasOwnProperty('continued');
        const hasTextProperty = currentOperation.hasOwnProperty('text');
        // must move the continued property to the nearest previous text node
        if (hasContinuedProperty && !hasTextProperty) {
            // find previous text operation
            for (let j = i - 1; j >= 0; j--) {
                const previousOperation = operations[j];
                if (previousOperation.hasOwnProperty('text')) {
                    previousOperation.continued = currentOperation.continued;
                    if (Object.keys(currentOperation).length === 1) {
                        // remove continued operation (if empty)
                        operations.splice(i, 1);
                    } else {
                        // remove the continued key
                        delete currentOperation.continued;
                    }
                    break;
                }
            }
        }
    }

    // handle font changes
    let fontStack = ['default'];
    output.forEach(op => {

        if (op.font) {
            const mergedFont = mergeFonts(fontStack[fontStack.length - 1], op.font);
            fontStack.push(mergedFont);
            op.font = mergedFont;
        }

        if (op.restoreFont) {
            delete op.restoreFont;
            fontStack.pop();
            op.font = fontStack[fontStack.length - 1];
        }

    });

    const next = {
        text: (minIndex = 0) => (op, index) => index >= minIndex && op.hasOwnProperty('text'),
        font: (minIndex = 0) => (op, index) => index >= minIndex && op.hasOwnProperty('font'),
        linkEnd: (minIndex = 0) => (op, index) => index >= minIndex && op.endLink,
        listEnd: (minIndex = 0) => (op, index) => index >= minIndex && op.endList,
    };

    const prev = {
        text: (maxIndex) => (op, index) => index <= maxIndex && op.hasOwnProperty('text')
    };

    // remove font changes without impact on text
    for (let i = 0; i < output.length; i++) {
        const indexOfNextOperationWithText = output.findIndex(next.text(i + 1));
        const indexOfNextOperationWithFont = output.findIndex(next.font(i + 1));
        const hasFondChangeBeforeNextText = indexOfNextOperationWithFont < indexOfNextOperationWithText;
        const hasNoFurtherText = indexOfNextOperationWithText === -1;
        if (indexOfNextOperationWithFont > i && (hasFondChangeBeforeNextText || hasNoFurtherText)) {
            // remove font change
            delete output[i].font;
            // remove operation if empty
            if (Object.keys(output[i]).length === 0) {
                output.splice(i, 1);
                i--;
            }
        }
    }

    // merge link and actual text
    for (let i = 0; i < output.length; i++) {

        const op = output[i];

        if (op.hasOwnProperty('startLink')) {

            const linkEndIndex = output.findIndex(next.linkEnd(i + 1));
            const nextTexts = output.filter((op, index) => index >= i && op.hasOwnProperty('text') && index <= linkEndIndex);

            if (nextTexts.length > 0) {
                nextTexts.forEach(nt => {
                    nt.link = op.link;
                    nt.underline = op.underline;
                });
                // remove the original link start information
                delete op.link;
                delete op.underline;
                // remove the original link start/end information
                delete output[linkEndIndex].endLink;
                delete op.startLink;
            }

        }

    }

    // merge lists
    for (let i = 0; i < output.length; i++) {
        const op = output[i];
        if (op.startList) {
            let endListIndex = output.findIndex(next.listEnd(i + 1));
            const listItems = [];
            for (let j = i + 1; j < endListIndex; j++) {
                if (output[j].hasOwnProperty('text')) {
                    listItems.push(output[j].text);
                } else if (output[j].moveDown) {
                    //
                }
                output.splice(j, 1);
                j--;
                endListIndex--;
            }
            delete output[endListIndex].endList;
            delete op.startList;
            op.list = listItems;
        }
    }

    // add missing space at softbreaks between texts
    for (let i = 1; i < output.length - 1; i++) {
        const op = output[i];
        if (op.softbreak) {
            const prevOp = output.filter(prev.text(i - 1)).pop();
            const prevOpIndex = output.indexOf(prevOp);
            const nextOp = output.find(next.text(i + 1));
            if (prevOp && nextOp) {
                if (prevOp.continued) {
                    if (prevOp.hasOwnProperty('text') && nextOp.hasOwnProperty('text')) {
                        const prevIsLink = prevOp.hasOwnProperty('link');
                        // do not change the text for links
                        if (prevOp.text.substr(-1) !== ' ' && !prevIsLink) {
                            prevOp.text += ' ';
                        } else if (prevIsLink && nextOp.text.substr(0, 1) !== ' ') {
                            nextOp.text = ' ' + nextOp.text;
                        }
                    }
                }
            }
            // remove softbreak
            output.splice(i, 1);
            i--;
        }
    }

    // remove unnecessary save operations
    // triggered by font removals
    for (let i = 0; i < output.length; i++) {
        const op = output[i];
        if (op.hasOwnProperty('save') && Object.keys(op).length === 1) {
            output.splice(i, 1);
            i--;
        }
    }

    // ensure we have an equal number of saves and restores
    let saves = 0;
    for (let i = 0; i < output.length; i++) {
        saves += output[i].save === true;
        saves -= output[i].restore === true;
        if (saves < 0) {
            // remove this restore
            delete output[i].restore;
            // undo the restore for the sum of saves
            saves++;
            // if object is empty, remove completely
            if (Object.keys(output[i]).length === 0) {
                output.splice(i, 1);
                // we removed the current element, we
                // need to decrement the index by one
                // to ensure not skipping one element
                i--;
            }
        }
    }

    // remove trailing moveDown
    const last = output[output.length - 1];
    if (last.moveDown) {
        delete last.moveDown;
        if (Object.keys(last).length === 0) {
            output.pop();
        }
    }

    return output;

};

