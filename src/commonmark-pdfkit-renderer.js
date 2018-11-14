import deepDefaults from 'deep-defaults';
import executeOperation from './logic/execute-operation';
import * as Font from './logic/font';
import defaultOptions from './default-options';
import * as List from './logic/list';

/**
 * An implementation of an renderer for commonmark. Using
 * pdfkit for rendering of the pdf.
 */
class CommonmarkPDFKitRenderer {

    constructor(options = {}) {

        if (typeof options !== 'object' || Array.isArray(options)) {
            throw new Error('options must be a plain object');
        }

        // apply default options
        deepDefaults(options, defaultOptions);

        this.options = options;

    }

    /**
     * Takes a commonmark node tree and converts it into our
     * intermediate operations format.
     *
     * For information on the commonmark nodeTree
     * {@see https://github.com/commonmark/commonmark.js#usage}.
     *
     * @param {object} nodeTree
     * @returns {Array} of operations
     */
    operations(nodeTree) {

        const walker = nodeTree.walker();
        let event, node;

        // array holding the extracted operations
        const operations = [];

        class PDFOperationPropertyStack {

            constructor() {
                this.stack = [];
            }

            /**
             * Push instance to the stack
             * @param instance
             * @returns {PDFOperationPropertyStack} the stack instance
             */
            push(instance) {
                this.stack.push(instance);
                return this;
            }

            /**
             * Remove the top-most item from the stack and return it.
             * @returns {*} the top-most item of the stack
             */
            pop() {
                return this.stack.pop();
            }

            /**
             * Returns the top-most item of the stack, {@see #pop},
             * without removing it from the stack.
             *
             * @returns {*} the top-most item of the stack
             */
            peek() {
                if (this.stack.length === 0) return undefined;
                return this.stack[this.stack.length - 1];
            }

            /**
             * Returns the union of all stack items. Where
             * properties from items higher up the stack will
             * overwrite properties from items lower in the
             * stack.
             *
             * @returns {*}
             */
            get(additional = {}) {
                let stackUnion = this.stack.reduce((reduced, current) => {
                    return Object.assign(reduced, current);
                }, {});
                return Object.assign(stackUnion, additional);
            }

            /**
             * Return the top-most object from the stack having
             * set the requested property
             *
             * @param {string|Symbol} property to search for
             * @returns {*} the top-most item on the stack having the requested property
             */
            find(property) {
                for (let i = this.stack.length - 1; i >= 0; i--) {
                    const f = this.stack[i];
                    if (f.hasOwnProperty(property)) {
                        return f;
                    }
                }
                return undefined;
            }

            /**
             * Returns the property-value from the top-most item
             * where the requested property is defined.
             *
             * {@see #find}
             *
             * @param {string|Symbol} property property to search for
             * @returns {*} the property-value of the top-most item on the stack having the requested property
             */
            getValue(property) {
                const frame = this.find(property);
                if (frame) {
                    return frame[property];
                }
                return undefined;
            }

            /**
             * Returns the incremented property value from the
             * top-most item where the requested property is
             * defined.
             *
             * @param property
             * @param {number} [inc] defaults to 1
             * @returns {number}
             */
            getIncValue(property, inc = 1) {
                const frame = this.find(property);
                if (frame) {
                    if (typeof frame[property] !== 'number') {
                        throw new Error(`property '${property}' must be a number`);
                    }
                    frame[property] += inc;
                    return frame[property];
                }
                return undefined;
            }

        }

        const stack = new PDFOperationPropertyStack();

        // define initial values
        stack.push({
            font: 'default',
            fontSize: this.options.fontSize || 12,
            fillColor: this.options.fillColor || 'black',
            strokeColor: 'black',
            fillOpacity: 1,
            strokeOpacity: 1,
            continued: false,
            listDepth: 0
        });

        /*

            text
                emp -> push(font=italic)
                    link -> push(link,fillColor,underline)
                        strong -> push(font=bold-italic)
                        /strong -> pull(font)
                    /link -> pull(link, fillColor, underline)
                /emp -> pull(font)
                text
                /text
            /text

         */


        const lastOperationWith = (property) => {
            for (let i = operations.length - 1; i >= 0; i--) {
                const operation = operations[i];
                if (operation.hasOwnProperty(property)) {
                    return operation;
                }
            }
            return undefined;
        };

        const mapListTypes = (type) => {
            const defaultListStyleType = 'disc';
            switch (type) {
                case 'bullet':
                    return 'disc';
                case 'ordered':
                    return 'arabic';
                default:
                    console.error(`unkown list type '${type}', falling back to default: ${defaultListStyleType}`);
                    return defaultListStyleType;
            }
        };

        // walk the commonmark AST
        while ((event = walker.next())) {

            node = event.node;

            const previousOperation = operations[operations.length - 1];

            const moveDown = () => {
                const moveDownIsAllowed = stack.getValue('listDepth') === 0;
                if (moveDownIsAllowed) {
                    operations.push({
                        moveDown: true
                    });
                }
            };

            switch (node.type) {
                case 'text': {
                    if (event.entering) {
                        operations.push(stack.get({
                            text: node.literal
                        })
                        );
                    }
                    break;
                }

                case 'softbreak': {
                    if (event.entering) {
                        const previousText = lastOperationWith('text');
                        // check if previous texts ends on whitespace
                        if (previousText && !/ $/.test(previousText.text)) {
                            // if not, add an additional whitespace operation
                            operations.push({
                                text: ' ',
                                continued: true
                            });
                        }
                    }
                    break;
                }
                case 'linebreak': {
                    if (event.entering) {
                        // must discontinue any open text
                        if (previousOperation && previousOperation.continued === true) {
                            previousOperation.continued = false;
                        }
                        operations.push(
                            stack.get({
                                continued: true,
                                text: '\n'
                            })
                        );
                    } else {
                        // this case is never called!
                    }
                    break;
                }
                case 'emph': {
                    if (event.entering) {
                        const nextFont = (stack.getValue('font') === 'bold') ? 'bold-italic' : 'italic';
                        operations.push(
                            stack
                                .push({font: nextFont})
                                .get()
                        );
                    } else {
                        stack.pop();
                        operations.push(stack.get());
                    }
                    break;
                }
                case 'strong': {
                    if (event.entering) {
                        const nextFont = (stack.getValue('font') === 'italic') ? 'bold-italic' : 'bold';
                        operations.push(
                            stack
                                .push({font: nextFont})
                                .get()
                        );
                    } else {
                        stack.pop();
                        operations.push(stack.get());
                    }
                    break;
                }
                case 'link': {
                    if (event.entering) {
                        operations.push(
                            stack
                                .push({
                                    fillColor: 'blue',
                                    link: node.destination,
                                    underline: true
                                })
                                .get()
                        );
                    } else {
                        stack.pop();
                        operations.push(stack.get());
                    }
                    break;
                }
                case 'image':
                    // unsupported
                    break;
                case 'code':
                    // unsupported
                    // TODO
                    break;
                case 'document':
                    // ignored
                    break;
                case 'html_inline':
                    // unsupported
                    break;
                case 'paragraph': {
                    if (event.entering) {
                        stack.push({
                            continued: true
                        });
                    } else {
                        stack.pop();

                        lastOperationWith('text').continued = false;

                        // prevent repeated move down operations
                        if (!previousOperation.moveDown) {
                            moveDown();
                        }

                    }
                    break;
                }
                case 'block_quote': {
                    // unsupported
                    // TODO
                    break;
                }
                case 'item': {
                    if (event.entering) {

                        const listItemIndex = stack.getIncValue('listItemIndex');

                        operations.push(
                            stack.get({
                                listItem: true,
                                listItemStyle: mapListTypes(node._listData.type),
                                listItemIndex: listItemIndex
                            })
                        );

                    }
                    break;
                }
                case 'list': {
                    if (event.entering) {
                        operations.push(
                            stack
                                .push({
                                    listDepth: stack.getValue('listDepth') + 1,
                                    listItemIndex: -1
                                })
                                .get({
                                    listItemStyle: mapListTypes(node._listData.type),
                                    list: true
                                })
                        );
                    } else {
                        const item = stack.pop();

                        // find start operation
                        for (let i = operations.length - 1; i >= 0; i--) {
                            const operation = operations[i];
                            // update the listItemCount (used for arabic, as there we need to
                            // space the number and the list items according to the longest
                            // number we need to print
                            if (operation.listDepth === item.listDepth) {
                                if (operation.listItem === true || operation.list === true) {
                                    operation.listItemCount = item.listItemIndex + 1;
                                }
                                if (operation.list === true) {
                                    break;
                                }
                            }

                        }

                        operations.push(stack.get());
                        moveDown();

                    }
                    break;
                }
                case 'heading': {
                    if (event.entering) {
                        operations.push(
                            stack
                                .push({
                                    font: Font.forHeadingLevel(node.level),
                                    fontSize: Font.sizeForHeadingLevel(node.level),
                                    continued: true
                                })
                                .get()
                        );
                    } else {
                        stack.pop();
                        operations.push(stack.get());

                        const previousText = lastOperationWith('text');
                        if (previousText) {
                            previousText.continued = false;
                        }

                        moveDown();

                    }
                    break;
                }
                case 'code_block': {
                    // unsupported
                    // TODO
                    break;
                }
                case 'html_block': {
                    // unsupported
                    break;
                }
                case 'thematic_break': {
                    // unsupported
                    if (event.entering) {
                        operations.push({
                            horizontalLine: true
                        });
                    }
                    break;
                }
            }
        }

        const removeRedundancies = (operation, index, operations) => {

            const previousState = operations.slice(0, index).reduce((reduced, current) => {
                return Object.assign(reduced, current);
            }, {});

            //console.log('_', index);
            //console.log('_previousState', JSON.stringify(previousState));
            //console.log('_operation____', JSON.stringify(operation));

            const PROPERTY_RULES = {
                continued: (current) => current.hasOwnProperty('text'),
                link: (current) => current.hasOwnProperty('text'),
                underline: (current) => current.hasOwnProperty('text'),
                font: (current, previous) => {
                    const hasChanged = current.font !== previous.font;
                    return (
                        // include on text operation if changed
                        (current.hasOwnProperty('text') && hasChanged)
                        // include on non-text operation if changed
                        || hasChanged
                    );
                },
                fontSize: (current, previous) => {
                    return previous.fontSize !== current.fontSize;
                },
                moveDown: () => true, // keep always
                listItemStyle: (current) => current.listItem === true || current.list === true,
                listItem: () => true, // keep always
                listItemIndex: (current) => current.listItem === true,
                listItemCount: (current) => current.listDepth > 0 || current.listItem === true
            };

            const propertiesToKeepEvenIfRedundant = [
                //'continued', 'link', 'underline'
            ];

            if (previousState) {

                const properties = Object.keys(operation);
                const propertiesToKeep = properties.filter(property => {

                    const keepAccordingToPropertyRules = PROPERTY_RULES.hasOwnProperty(property)
                        && PROPERTY_RULES[property](operation, previousState);

                    return propertiesToKeepEvenIfRedundant.includes(property)
                        || keepAccordingToPropertyRules
                        || (
                            !PROPERTY_RULES.hasOwnProperty(property)
                            && operation[property] !== previousState[property]
                        );
                });

                const reducedOperation = propertiesToKeep.reduce((reduced, property) => {
                    return Object.assign(reduced, {[property]: operation[property]});
                }, {});

                //console.log('_reduced______', JSON.stringify(reducedOperation));

                return reducedOperation;

            }

            //console.log('_original_____', JSON.stringify(operation));
            return operation;

        };

        return operations.map(removeRedundancies);

    }

    /**
     * Return the (estimated) height which the provided
     * markdown will require upon rendering.
     *
     * Similar to the 'heightOfString' function provided
     * by pdfkit. It's also used here.
     *
     * TODO: What to return if the rendering would span multiple pages?
     *
     * @param {PDFDocument} doc
     * @param {object} nodeTree
     * @param {object} pdfkitOptions
     * @returns {number} the height which the provided markdown will require upon rendering
     */
    heightOfMarkdown(doc, nodeTree, pdfkitOptions) {
        return this.dimensionsOfMarkdown(doc, nodeTree, pdfkitOptions).h;
    }


    /**
     * Return the (estimated) dimensions which the provided
     * markdown will occupy upon rendering.
     **
     * TODO: What to return if the rendering would span multiple pages?
     *
     * @param {PDFDocument} doc
     * @param {object} nodeTree
     * @param {object} pdfkitOptions
     * @returns {{x:number,y:number,w:number,h:number}} the dimensions of the bounding box of the rendered markup
     */
    dimensionsOfMarkdown(doc, nodeTree, pdfkitOptions) {

        const operations = this.operations(nodeTree);

        const targetWidth = (pdfkitOptions && pdfkitOptions.width)
            || (doc.page && doc.page.width - doc.page.margins.left - doc.page.margins.right);

        const initialPosition = {x: doc.x, y: doc.y};
        const dimensions = Object.assign({}, initialPosition, {
            w: targetWidth,
            h: 0
        });

        let currentLineHeight = 0;
        let currentFontSize = this.options.fontSize;
        let continuousText = '';
        let indent = 0;
        operations.forEach(op => {

            let heightChange = 0;

            // Must move down BEFORE changing the font!
            // As the moveDown is based on the PREVIOUS lines height,
            // not on the next lines height.
            if (op.moveDown) {
                currentLineHeight = doc._font.lineHeight(currentFontSize, true);
                heightChange += currentLineHeight * op.moveDown;
            }

            if (op.moveUp) {
                currentLineHeight = doc._font.lineHeight(currentFontSize, true);
                heightChange -= currentLineHeight * op.moveUp;
            }

            // change the font
            if (op.font) {
                const resolvedFont = Font.forInternalName(op.font, this.options);
                doc.font(resolvedFont);
            }

            // change the fontSize
            if (op.fontSize) {
                currentFontSize = op.fontSize;
                doc.fontSize(currentFontSize);
            }

            // calculate height for text
            if (op.text) {

                // if we have continuous text, we collect it all, and then do
                // a single height calculation for the full text.
                continuousText += op.text;

                if (!op.continued) {

                    const textOptions = Object.assign({}, pdfkitOptions);
                    if (pdfkitOptions && pdfkitOptions.hasOwnProperty('width')) {
                        textOptions.width = pdfkitOptions.width - indent;
                    }

                    // might be inaccurate, due to different fonts?
                    // TODO: Continuous text height might need to take different fonts into account
                    const delta = doc.heightOfString(continuousText, textOptions);

                    heightChange += delta;

                    // for each linebreak, we need to subtract one currentLineHeight
                    const numLinebreaks = ((continuousText || '').match(/\n/g) || []).length;
                    if (numLinebreaks > 0) {
                        currentLineHeight = doc._font.lineHeight(currentFontSize, true);
                        heightChange -= numLinebreaks * currentLineHeight;
                    }

                    if (this.options.debug) {
                        console.log('\t', heightChange, `from text "${continuousText}"`);
                        console.log('\t', 'currentLineHeight', doc._font.lineHeight(currentFontSize, true));
                    }

                    // make sure the text already included in the height
                    // is not evaluated again
                    continuousText = '';

                }

            }

            if (op.list === true) {
                indent = op.listDepth * List.indent(doc, op.listStyleType, op.listItemCount, pdfkitOptions.fontSize);
            }

            if (this.options.debug) {
                console.log('height change', heightChange, 'for', op);
                console.log('total height', dimensions.h + heightChange);
            }

            dimensions.h += heightChange;

        });

        return dimensions;

    }

    /**
     * Render into an pdf document.
     *
     * TODO: What to return if the rendering spans multiple pages?
     *
     * @param {PDFDocument} doc to rende into
     * @param {object} nodeTree
     * @returns {{x:number,y:number,w:number,h:number}} The dimensions of the rendered markdown.
     */
    render(doc, nodeTree, pdfkitOptions) {

        const operations = this.operations(nodeTree);

        const initialPosition = {
            y: doc.y,
            x: doc.x
        };

        operations.forEach(op => {
            executeOperation(op, doc, Object.assign({}, this.options, {pdfkit: pdfkitOptions}));
        });

        const finalPosition = {
            y: doc.y,
            x: doc.x
        };

        return {
            y: initialPosition.y,
            x: initialPosition.x,
            w: (pdfkitOptions && pdfkitOptions.width) || (doc && doc.page && (doc.page.width - doc.page.margins.left - doc.page.margins.right)) || 0,
            h: finalPosition.y - initialPosition.y
        };

    }

}

export default CommonmarkPDFKitRenderer;
