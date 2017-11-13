import {expect} from 'chai';
import commonmark from 'commonmark';
import CommonmarkPDFRenderer from '../src/commonmark-pdf-renderer';

describe('intermediate "operations" format', () => {

    const instance = new CommonmarkPDFRenderer();
    const reader = new commonmark.Parser();

    describe('emphasize', () => {

        it('single *', () => {

            const parsed = reader.parse('*emp*');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        font: 'italic'
                    },
                    {
                        text: 'emp',
                        continued: false
                    },
                    {
                        font: 'default'
                    },
                    {
                        moveDown: true
                    }
                ]
            );

        });

        it('single _', () => {

            const parsed = reader.parse('_emp_');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        font: 'italic'
                    },
                    {
                        text: 'emp',
                        continued: false
                    },
                    {
                        font: 'default'
                    },
                    {
                        moveDown: true
                    }
                ]
            );

        });

        it('strongly emphasized ***', () => {

            const parsed = reader.parse('***strongemp***');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        font: 'bold-italic'
                    },
                    {
                        text: 'strongemp',
                        continued: false
                    },
                    {
                        font: 'default'
                    },
                    {
                        moveDown: true
                    }
                ]
            );

        });

        it('emphasized and strong on one line', () => {

            const parsed = reader.parse('This is *emphasized* followed by another __strong__ word.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        text: 'This is ',
                        continued: true
                    },
                    {
                        font: 'italic'
                    },
                    {
                        text: 'emphasized',
                        continued: true
                    },
                    {
                        font: 'default'
                    },
                    {
                        text: ' followed by another ',
                        continued: true
                    },
                    {
                        font: 'bold'
                    },
                    {
                        text: 'strong',
                        continued: true
                    },
                    {
                        font: 'default'
                    },
                    {
                        text: ' word.',
                        continued: false
                    },
                    {
                        moveDown: true
                    }
                ]
            );

        });

    });

    describe('strong', () => {

        it('single **', () => {

            const parsed = reader.parse('**strong**');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        font: 'bold'
                    },
                    {
                        text: 'strong',
                        continued: false
                    },
                    {
                        font: 'default'
                    },
                    {
                        moveDown: true
                    }
                ]
            );

        });

        it('single __', () => {

            const parsed = reader.parse('__strong__');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        font: 'bold'
                    },
                    {
                        text: 'strong',
                        continued: false
                    },
                    {
                        font: 'default'
                    },
                    {
                        moveDown: true
                    }
                ]
            );

        });

    });

    describe('links', () => {

        it('standalone', () => {

            const parsed = reader.parse('[text](link)');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        save: true,
                        fillColor: 'blue',
                    },
                    {
                        link: 'link',
                        underline: true,
                        text: 'text',
                        continued: false,
                    },
                    {
                        restore: true
                    },
                    {
                        moveDown: true
                    }
                ]
            );

        });

        it('with surrounding text', () => {

            const parsed = reader.parse('A [link](href) within some text.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        text: 'A ',
                        continued: true
                    },
                    {
                        save: true,
                        fillColor: 'blue'
                    },
                    {
                        text: 'link',
                        link: 'href',
                        underline: true,
                        continued: true
                    },
                    {
                        restore: true
                    },
                    {
                        text: ' within some text.',
                        continued: false
                    },
                    {
                        moveDown: true
                    }
                ]
            );

        });

        it('Another link within a sentence', () => {

            const parsed = reader.parse('This is [a link](https://www.example.com) within some text.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        text: 'This is ',
                        continued: true
                    },
                    {
                        save: true,
                        fillColor: 'blue'
                    },
                    {
                        text: 'a link',
                        link: 'https://www.example.com',
                        underline: true,
                        continued: true
                    },
                    {
                        restore: true
                    },
                    {
                        text: ' within some text.',
                        continued: false
                    },
                    {
                        moveDown: true
                    }
                ]
            );

        });

        it('wrapped in inline style', () => {

            const parsed = reader.parse('*[text](link)*');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        font: 'italic'
                    },
                    {
                        save: true,
                        fillColor: 'blue'
                    },
                    {
                        text: 'text',
                        link: 'link',
                        underline: true,
                        continued: false
                    },
                    {
                        restore: true
                    },
                    {
                        font: 'default'
                    },
                    {
                        moveDown: true
                    }
                ]
            );

        });

        it('partly styled', () => {

            const parsed = reader.parse('[text with some *of it* emphasized](link)');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        save: true,
                        fillColor: 'blue'
                    },
                    {
                        text: 'text with some ',
                        link: 'link',
                        underline: true,
                        continued: true
                    },
                    {
                        font: 'italic'
                    },
                    {
                        text: 'of it',
                        continued: true,
                        link: 'link',
                        underline: true
                    },
                    {
                        font: 'default'
                    },
                    {
                        text: ' emphasized',
                        continued: false,
                        link: 'link',
                        underline: true
                    },
                    {
                        restore: true
                    },
                    {
                        moveDown: true
                    }
                ]
            );

        });

    });

    describe('single paragraph text', () => {

        it('add missing whitespace to adjacent texts', () => {

            const parsed = reader.parse('This is the part with a missing whitespace\nat the end.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        text: 'This is the part with a missing whitespace ',
                        continued: true
                    },
                    {
                        text: 'at the end.',
                        continued: false
                    },
                    {
                        moveDown: true
                    }
                ]
            );

        });

        it('add missing whitespace to adjacent texts', () => {

            const parsed = reader.parse('This is the part with a missing whitespace\nat the end.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        text: 'This is the part with a missing whitespace ',
                        continued: true
                    },
                    {
                        text: 'at the end.',
                        continued: false
                    },
                    {
                        moveDown: true
                    }
                ]
            );

        });

    });

    describe('multi paragraph text', () => {

        it('two paragraphs, simple text', () => {

            const parsed = reader.parse('Line one.\n\nLine two.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        text: 'Line one.',
                        continued: false
                    },
                    {
                        moveDown: true
                    },
                    {
                        text: 'Line two.',
                        continued: false
                    },
                    {
                        moveDown: true
                    }
                ]
            );

        });

    });

    describe('list', () => {

        it('simple, with 2 items', () => {

            const parsed = reader.parse('- Item 1\n- Item 2');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        listItemStyle: 'disc',
                        list: [
                            'Item 1',
                            'Item 2'
                        ]
                    },
                    {
                        moveDown: true
                    }
                ]
            );

        });


    });

});