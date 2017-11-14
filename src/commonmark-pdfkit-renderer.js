import deepDefaults from 'deep-defaults';
import reduceOperations from './logic/reduce-operations';
import executeOperation from './logic/execute-operation';
import * as Font from './logic/font';
import defaultOptions from './default-options';

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

        // walk the commonmark AST
        while ((event = walker.next())) {

            node = event.node;

            if (event.entering) {
                switch (node.type) {
                    case 'text':
                        operations.push({
                            text: node.literal,
                            continued: true
                        });
                        break;
                    case 'softbreak':
                        operations.push({
                            softbreak: true
                        });
                        break;
                    case 'linebreak':
                        operations.push({
                            linebreak: true
                        });
                        break;
                    case 'emph':
                        operations.push({
                            font: 'italic'
                        });
                        break;
                    case 'strong':
                        operations.push({
                            font: 'bold'
                        });
                        break;
                    case 'html_inline':
                        // no plan to support this
                        break;
                    case 'link':
                        operations.push({
                            save: true,
                            fillColor: 'blue',
                            startLink: true,
                            link: node.destination,
                            underline: true
                        });
                        break;
                    case 'image':
                        // not supported yet
                        // TODO: Support image
                        break;
                    case 'code':
                        // not supported yet
                        // TODO: Support inline code
                        break;
                    case 'document':
                        // not needed?
                        break;
                    case 'paragraph':
                        // not needed
                        break;
                    case 'block_quote':
                        // not supported yet
                        // TODO: Support block quote
                        break;
                    case 'item':
                        operations.push({
                            listItem: node.literal
                        });
                        break;
                    case 'list':
                        // TODO: Support nested lists with formatting
                        operations.push({
                            startList: true,
                            listItemStyle: 'disc'
                        });
                        break;
                    case 'heading':
                        operations.push({
                            font: Font.forHeadingLevel(node.level),
                            fontSize: Font.sizeForHeadingLevel(node.level)
                        });
                        break;
                    case 'code_block':
                        // not supported yet
                        // TODO: Support code blocks
                        break;
                    case 'html_block':
                        // no plan to support this
                        break;
                    case 'thematic_break':
                        // not supported yet
                        // TODO: Support thematic breaks
                        break;
                }
            } else {
                switch (node.type) {
                    case 'text':
                        break;
                    case 'softbreak':
                        break;
                    case 'linebreak':
                        break;
                    case 'emph':
                        operations.push({
                            restoreFont: true
                        });
                        break;
                    case 'strong':
                        operations.push({
                            restoreFont: true
                        });
                        break;
                    case 'html_inline':
                        break;
                    case 'link':
                        operations.push({
                            endLink: true,
                            restore: true
                        });
                        break;
                    case 'image':
                        break;
                    case 'code':
                        break;
                    case 'document':
                        break;
                    case 'paragraph':
                        operations.push({
                            moveDown: true,
                            continued: false
                        });
                        break;
                    case 'block_quote':
                        break;
                    case 'item':
                        break;
                    case 'list':
                        operations.push({
                            endList: true,
                            moveDown: true
                        });
                        break;
                    case 'heading':
                        operations.push({
                            font: 'default',
                            fontSize: this.options.fontSize,
                            moveDown: true,
                            continued: false
                        });
                        break;
                    case 'code_block':
                        break;
                    case 'html_block':
                        break;
                    case 'thematic_break':
                        break;
                }
            }

        }

        return reduceOperations(operations, this.options);

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
        operations.forEach(op => {

            let heightChange = 0;

            // Must move down BEFORE changing the font!
            // As the moveDown is based on the PREVIOUS lines height,
            // not on the next lines height.
            if (op.moveDown) {
                currentLineHeight = doc._font.lineHeight(currentFontSize, true);
                heightChange += currentLineHeight * op.moveDown;
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

                    // might be inaccurate, due to different fonts?
                    // TODO: Continuous text height might need to take different fonts into account
                    heightChange += doc.heightOfString(continuousText, pdfkitOptions);

                    if (this.options.debug) {
                        console.log('\t', heightChange, `from text "${continuousText}"`);
                    }

                    // make sure the text already included in the height
                    // is not evaluated again
                    continuousText = '';

                }

            }

            // calculate height for lists
            if (op.list && op.list.length > 0) {

                op.list.forEach(l => {
                    // TODO: Use the actual list offset, instead of some randomly choosen value
                    const listOffsetLeft = 10;
                    heightChange += doc.heightOfString(l, {width: pdfkitOptions.width - listOffsetLeft});
                });

                if (this.options.debug) {
                    console.log('\t', heightChange, `from list`);
                }

            }

            if (this.options.debug) {
                console.log('height change', heightChange, 'for', op);
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
