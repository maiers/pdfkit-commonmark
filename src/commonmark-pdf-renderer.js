import deepDefaults from 'deep-defaults';
import reduceOperations from './logic/reduce-operations';
import executeOperation from './logic/execute-operation';
import * as Font from './logic/font';

const defaultOptions = {
    fonts: {
        'default': 'Times-Roman',
        bold: 'Times-Bold',
        italic: 'Times-Italic',
        'bold-italic': 'Times-BoldItalic',
        'heading-bold': 'Helvetica-Bold',
        'heading-default': 'Helvetica'
    }
};

/**
 * An implementation of an renderer for commonmark. Using
 * pdfkit for rendering of the pdf.
 */
class CommonmarkPDFRenderer {

    constructor(options = {}) {

        if (typeof options !== 'object' || Array.isArray(options)) {
            throw new Error('options must be a plain object');
        }

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
                        // not supported yet
                        break;
                    case 'linebreak':
                        // not supported yet
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
                        // not supported yet
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
                        break;
                    case 'code':
                        // not supported yet
                        break;
                    case 'document':
                        // not needed?
                        break;
                    case 'paragraph':
                        // not needed
                        break;
                    case 'block_quote':
                        // not supported yet
                        break;
                    case 'item':
                        operations.push({

                            listItem: node.literal
                        });
                        break;
                    case 'list':
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
                        // ignore
                        break;
                    case 'html_block':
                        // ignore
                        break;
                    case 'thematic_break':
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
                            restoreFont: true,
                            restoreFontSize: true,
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

        return reduceOperations(operations);

    }

    /**
     * Render into an pdf document
     *
     * @param {PDFDocument} doc to rende into
     * @param {object} nodeTree
     */
    render(doc, nodeTree) {

        const operations = this.operations(nodeTree);

        operations.forEach(op => {
            executeOperation(op, doc, this.options);
        });

    }

}

export default CommonmarkPDFRenderer;
