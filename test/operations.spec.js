import {expect} from 'chai';
import commonmark from 'commonmark';
import CommonmarkPDFRenderer from '../src/commonmark-pdfkit-renderer';

describe('intermediate "operations" format', () => {

    const instance = new CommonmarkPDFRenderer({debug: true});
    const reader = new commonmark.Parser();

    describe('special markdown', function () {

        describe('escaped list character', function () {

            const chars = [['\\-', '-'], ['\\*', '*']];

            chars.forEach(c => {

                const parsed = reader.parse(c[0]);

                describe(c[0], function () {

                    it('returns a string', function () {

                        expect(instance.operations(parsed)).to.deep.eql(
                            [
                                {
                                    text: c[1],
                                    continued: false
                                }
                            ]
                        );

                    });

                });

            });

        });

        describe('escaped heading character', function () {

            const chars = [['\\#', '#']];

            chars.forEach(c => {

                const parsed = reader.parse(c[0]);

                describe(c[0], function () {

                    it('returns a string', function () {

                        expect(instance.operations(parsed)).to.deep.eql(
                            [
                                {
                                    text: c[1],
                                    continued: false
                                }
                            ]
                        );

                    });

                });

            });

        });

        describe('forced line break', function () {

            describe('with two trailing spaces', function () {

                it('works', function () {

                    const parsed = reader.parse('This is a line  \nbreak with only one newline.');
                    expect(instance.operations(parsed)).to.deep.eql(
                        [
                            {
                                text: 'This is a line',
                                continued: false
                            },
                            {
                                moveUp: true
                            },
                            {
                                text: '\nbreak with only one newline.',
                                continued: false
                            }
                        ]
                    );

                });

            });

            describe('with one trailing space', function () {

                it('does not work', function () {

                    const parsed = reader.parse('This is a line \nbreak that will be ignored.');
                    expect(instance.operations(parsed)).to.deep.eql(
                        [
                            {
                                text: 'This is a line ',
                                continued: true
                            },
                            {
                                text: 'break that will be ignored.',
                                continued: false
                            }
                        ]
                    );

                });

            });

        });

        describe('greater-than char (>)', function () {

            it('as only character', function () {

                const parsed = reader.parse('>');
                expect(instance.operations(parsed)).to.deep.eql(
                    [
                        {
                            text: '>',
                            continued: false
                        },
                        {
                            moveDown: true
                        }
                    ]
                );

            });

        });

    });

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
                    }
                ]
            );

        });

        it('add missing whitespace before softbreak followed by an emphasize', () => {

            const parsed = reader.parse('This is the part with a missing whitespace\n*at* the end.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        text: 'This is the part with a missing whitespace ',
                        continued: true
                    },
                    {
                        font: 'italic'
                    },
                    {
                        text: 'at',
                        continued: true
                    },
                    {
                        font: 'default'
                    },
                    {
                        text: ' the end.',
                        continued: false
                    }
                ]
            );

        });

        it('add missing whitespace before softbreak on an emphasize', () => {

            const parsed = reader.parse('This is the part with the *emphasize*\nfollowed with a missing whitespace.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        text: 'This is the part with the ',
                        continued: true
                    },
                    {
                        font: 'italic'
                    },
                    {
                        text: 'emphasize ',
                        continued: true
                    },
                    {
                        font: 'default'
                    },
                    {
                        text: 'followed with a missing whitespace.',
                        continued: false
                    }
                ]
            );

        });

        it('add missing whitespace after softbreak after a link', () => {

            const parsed = reader.parse('This is the part with the [linkText](linkHref)\nfollowed with a missing whitespace.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        text: 'This is the part with the ',
                        continued: true
                    },
                    {
                        fillColor: 'blue',
                        save: true
                    },
                    {
                        text: 'linkText',
                        continued: true,
                        link: 'linkHref',
                        underline: true
                    },
                    {
                        restore: true
                    },
                    {
                        text: ' followed with a missing whitespace.',
                        continued: false
                    }
                ]
            );

        });

        it('handles tailing whitespace before softbreaks correctly', () => {

            const parsed = reader.parse('This is the part with the [linkText](linkHref) \nfollowed with a missing whitespace.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        text: 'This is the part with the ',
                        continued: true
                    },
                    {
                        fillColor: 'blue',
                        save: true
                    },
                    {
                        text: 'linkText',
                        continued: true,
                        link: 'linkHref',
                        underline: true
                    },
                    {
                        restore: true
                    },
                    {
                        text: ' ',
                        continued: true
                    },
                    {
                        text: 'followed with a missing whitespace.',
                        continued: false
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
                    }
                ]
            );

        });

    });

    describe('list', () => {

        describe('only one "-"', function () {

            let parsed;

            beforeEach(function () {
                parsed = reader.parse('-');
            });

            it('returns an empty list', function () {

                expect(instance.operations(parsed)).to.deep.eql(
                    [
                        {
                            list: [],
                            listItemStyle: 'disc'
                        }
                    ]
                );

            });

        });


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
                    }
                ]
            );

        });


    });

    describe('heading', () => {

        it('level 1', () => {

            const parsed = reader.parse('# Headline');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        font: 'heading-bold',
                        fontSize: 12 * 1.4
                    },
                    {
                        text: 'Headline',
                        continued: false
                    },
                    {
                        font: 'default',
                        fontSize: 12
                    }
                ]
            );

        });

    });

});