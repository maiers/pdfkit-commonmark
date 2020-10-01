import {expect} from 'chai';
import { Parser } from 'commonmark';
import CommonmarkPDFRenderer from '../src/commonmark-pdfkit-renderer';

describe('intermediate "operations" format', () => {

    const instance = new CommonmarkPDFRenderer({debug: true});
    const reader = new Parser();

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
                                    "continued": false,
                                    "fillColor": "black",
                                    "fillOpacity": 1,
                                    "font": "default",
                                    "fontSize": 12,
                                    "listDepth": 0,
                                    "strokeColor": "black",
                                    "strokeOpacity": 1,
                                    "text": c[1]
                                },
                                {
                                    "moveDown": true
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
                                    "continued": false,
                                    "fillColor": "black",
                                    "fillOpacity": 1,
                                    "font": "default",
                                    "fontSize": 12,
                                    "listDepth": 0,
                                    "strokeColor": "black",
                                    "strokeOpacity": 1,
                                    "text": c[1]
                                },
                                {
                                    "moveDown": true
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
                                "continued": false,
                                "fillColor": "black",
                                "fillOpacity": 1,
                                "font": "default",
                                "fontSize": 12,
                                "listDepth": 0,
                                "strokeColor": "black",
                                "strokeOpacity": 1,
                                "text": "This is a line"
                            },
                            {
                                "continued": true,
                                "text": "\n"
                            },
                            {
                                "continued": false,
                                "text": "break with only one newline."
                            },
                            {
                                "moveDown": true
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
                                "continued": true,
                                "fillColor": "black",
                                "fillOpacity": 1,
                                "font": "default",
                                "fontSize": 12,
                                "listDepth": 0,
                                "strokeColor": "black",
                                "strokeOpacity": 1,
                                "text": "This is a line"
                            },
                            {
                                "continued": true,
                                "text": " "
                            },
                            {
                                "continued": false,
                                "text": "break that will be ignored."
                            },
                            {
                                "moveDown": true
                            }
                        ]
                    );

                });

            });

        });

        describe('escaped greater-than char (>)', function () {

            it('as only character', function () {

                const parsed = reader.parse('\\>');
                expect(instance.operations(parsed)).to.deep.eql(
                    [
                        {
                            "continued": false,
                            "fillColor": "black",
                            "fillOpacity": 1,
                            "font": "default",
                            "fontSize": 12,
                            "listDepth": 0,
                            "strokeColor": "black",
                            "strokeOpacity": 1,
                            "text": ">"
                        },
                        {
                            "moveDown": true
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
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "italic",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1
                    },
                    {
                        "continued": false,
                        "text": "emp"
                    },
                    {
                        font: 'default'
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

        it('single _', () => {

            const parsed = reader.parse('_emp_');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "italic",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1
                    },
                    {
                        "continued": false,
                        "text": "emp"
                    },
                    {
                        font: 'default'
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

        it('strongly emphasized ***', () => {

            const parsed = reader.parse('***strongemp***');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "italic",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1
                    },
                    {
                        font: 'bold-italic'
                    },
                    {
                        "continued": false,
                        "text": "strongemp"
                    },
                    {
                        font: 'italic'
                    },
                    {
                        font: 'default'
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

        it('emphasized and strong on one line', () => {

            const parsed = reader.parse('This is *emphasized* followed by another __strong__ word.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        "continued": true,
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "default",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1,
                        text: 'This is '
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
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "bold",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1
                    },
                    {
                        "continued": false,
                        "text": "strong"
                    },
                    {
                        "font": "default"
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

        it('single __', () => {

            const parsed = reader.parse('__strong__');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "bold",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1
                    },
                    {
                        "continued": false,
                        "text": "strong"
                    },
                    {
                        "font": "default"
                    },
                    {
                        "moveDown": true
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
                        "fillColor": "blue",
                        "fillOpacity": 1,
                        "font": "default",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1
                    },
                    {
                        "continued": false,
                        "link": "link",
                        "text": "text",
                        "underline": true
                    },
                    {
                        "fillColor": "black"
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

        it('with surrounding text', () => {

            const parsed = reader.parse('A [link](href) within some text.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        "continued": true,
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "default",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1,
                        "text": "A "
                    },
                    {
                        "fillColor": "blue"
                    },
                    {
                        "continued": true,
                        "link": "href",
                        "text": "link",
                        "underline": true
                    },
                    {
                        "fillColor": "black"
                    },
                    {
                        "continued": false,
                        "text": " within some text."
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

        it('Another link within a sentence', () => {

            const parsed = reader.parse('This is [a link](https://www.example.com) within some text.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        "continued": true,
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "default",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1,
                        "text": "This is "
                    },
                    {
                        "fillColor": "blue"
                    },
                    {
                        "continued": true,
                        "link": "https://www.example.com",
                        "text": "a link",
                        "underline": true
                    },
                    {
                        "fillColor": "black"
                    },
                    {
                        "continued": false,
                        "text": " within some text."
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

        it('wrapped in inline style', () => {

            const parsed = reader.parse('*[text](link)*');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "italic",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1
                    },
                    {
                        "fillColor": "blue"
                    },
                    {
                        "continued": false,
                        "link": "link",
                        "text": "text",
                        "underline": true
                    },
                    {
                        "fillColor": "black"
                    },
                    {
                        "font": "default"
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

        it('partly styled', () => {

            const parsed = reader.parse('[text with some *of it* emphasized](link)');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        "fillColor": "blue",
                        "fillOpacity": 1,
                        "font": "default",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1
                    },
                    {
                        "continued": true,
                        "link": "link",
                        "text": "text with some ",
                        "underline": true
                    },
                    {
                        "font": "italic"
                    },
                    {
                        "continued": true,
                        "link": "link",
                        "text": "of it",
                        "underline": true
                    },
                    {
                        "font": "default"
                    },
                    {
                        "continued": false,
                        "link": "link",
                        "text": " emphasized",
                        "underline": true
                    },
                    {
                        "fillColor": "black"
                    },
                    {
                        "moveDown": true
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
                        "continued": true,
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "default",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1,
                        "text": "This is the part with a missing whitespace"
                    },
                    {
                        continued: true,
                        text: ' '
                    },
                    {
                        "continued": false,
                        "text": "at the end."
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

        it('add missing whitespace before softbreak followed by an emphasize', () => {

            const parsed = reader.parse('This is the part with a missing whitespace\n*at* the end.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        "continued": true,
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "default",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1,
                        "text": "This is the part with a missing whitespace"
                    },
                    {
                        continued: true,
                        text: ' '
                    },
                    {
                        "font": "italic"
                    },
                    {
                        "continued": true,
                        "text": "at"
                    },
                    {
                        "font": "default"
                    },
                    {
                        "continued": false,
                        "text": " the end."
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

        it('add missing whitespace before softbreak after an emphasize', () => {

            const parsed = reader.parse('This is the part with the *emphasize*\nfollowed with a missing whitespace.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        "continued": true,
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "default",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1,
                        "text": "This is the part with the "
                    },
                    {
                        "font": "italic"
                    },
                    {
                        "continued": true,
                        "text": "emphasize"
                    },
                    {
                        "font": "default"
                    },
                    {
                        "continued": true,
                        "text": " "
                    },
                    {
                        "continued": false,
                        "text": "followed with a missing whitespace."
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

        it('add missing whitespace after softbreak after a link', () => {

            const parsed = reader.parse('This is the part with the [linkText](linkHref)\nfollowed with a missing whitespace.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        "continued": true,
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "default",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1,
                        "text": "This is the part with the "
                    },
                    {
                        "fillColor": "blue"
                    },
                    {
                        "continued": true,
                        "link": "linkHref",
                        "text": "linkText",
                        "underline": true
                    },
                    {
                        "fillColor": "black"
                    },
                    {
                        "continued": true,
                        "text": " "
                    },
                    {
                        "continued": false,
                        "text": "followed with a missing whitespace."
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

        it('handles tailing whitespace before softbreaks correctly', () => {

            const parsed = reader.parse('This is the part with the [linkText](linkHref) \nfollowed with a missing whitespace.');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        "continued": true,
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "default",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1,
                        "text": "This is the part with the "
                    },
                    {
                        "fillColor": "blue"
                    },
                    {
                        "continued": true,
                        "link": "linkHref",
                        "text": "linkText",
                        "underline": true
                    },
                    {
                        "fillColor": "black"
                    },
                    {
                        // apparently commonmark ignores the
                        // whitespace between the link and
                        // the softbreak?
                        "continued": true,
                        "text": ""
                    },
                    {
                        "continued": true,
                        "text": " "
                    },
                    {
                        "continued": false,
                        "text": "followed with a missing whitespace."
                    },
                    {
                        "moveDown": true
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
                        "continued": false,
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "default",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1,
                        "text": "Line one."
                    },
                    {
                        "moveDown": true
                    },
                    {
                        "continued": false,
                        "text": "Line two."
                    },
                    {
                        "moveDown": true
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
                            "fillColor": "black",
                            "fillOpacity": 1,
                            "font": "default",
                            "fontSize": 12,
                            "list": true,
                            "listDepth": 1,
                            "listItemCount": 1,
                            "listItemStyle": "disc",
                            "strokeColor": "black",
                            "strokeOpacity": 1
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 0,
                            listItemCount: 1,
                            "listItemStyle": "disc"
                        },
                        {
                            "listDepth": 0
                        },
                        {
                            "moveDown": true
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
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "default",
                        "fontSize": 12,
                        "list": true,
                        "listDepth": 1,
                        "listItemCount": 2,
                        "listItemStyle": "disc",
                        "strokeColor": "black",
                        "strokeOpacity": 1
                    },
                    {
                        "listItem": true,
                        "listItemIndex": 0,
                        listItemCount: 2,
                        "listItemStyle": "disc"
                    },
                    {
                        "continued": false,
                        "text": "Item 1"
                    },
                    {
                        "listItem": true,
                        "listItemIndex": 1,
                        listItemCount: 2,
                        "listItemStyle": "disc"
                    },
                    {
                        "continued": false,
                        "text": "Item 2"
                    },
                    {
                        "listDepth": 0
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

        describe('nested', () => {

            it('both unordered', function () {

                const parsed = reader.parse('- List 1, Item 1\n   - List 2, Item 1\n   - List 2, Item 2\n- List 1, Item 2');

                expect(instance.operations(parsed)).to.deep.eql(
                    [
                        {
                            "fillColor": "black",
                            "fillOpacity": 1,
                            "font": "default",
                            "fontSize": 12,
                            "list": true,
                            "listDepth": 1,
                            "listItemCount": 2,
                            "listItemStyle": "disc",
                            "strokeColor": "black",
                            "strokeOpacity": 1
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 0,
                            listItemCount: 2,
                            "listItemStyle": "disc"
                        },
                        {
                            "continued": false,
                            "text": "List 1, Item 1"
                        },
                        {
                            "listDepth": 2,
                            "listItemCount": 2,
                            "listItemStyle": "disc"
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 0,
                            listItemCount: 2,
                            "listItemStyle": "disc"
                        },
                        {
                            "continued": false,
                            "text": "List 2, Item 1"
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 1,
                            listItemCount: 2,
                            "listItemStyle": "disc"
                        },
                        {
                            "continued": false,
                            "text": "List 2, Item 2"
                        },
                        {
                            "listDepth": 1
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 1,
                            listItemCount: 2,
                            "listItemStyle": "disc"
                        },
                        {
                            "continued": false,
                            "text": "List 1, Item 2"
                        },
                        {
                            "listDepth": 0
                        },
                        {
                            "moveDown": true
                        }
                    ]
                );

            });

            it('inner ordered, outer unordered', function () {

                const parsed = reader.parse('- List 1, Item 1\n   1. List 2, Item 1\n   2. List 2, Item 2\n- List 1, Item 2');

                expect(instance.operations(parsed)).to.deep.eql(
                    [
                        {
                            "fillColor": "black",
                            "fillOpacity": 1,
                            "font": "default",
                            "fontSize": 12,
                            "list": true,
                            "listDepth": 1,
                            "listItemCount": 2,
                            "listItemStyle": "disc",
                            "strokeColor": "black",
                            "strokeOpacity": 1
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 0,
                            listItemCount: 2,
                            "listItemStyle": "disc"
                        },
                        {
                            "continued": false,
                            "text": "List 1, Item 1"
                        },
                        {
                            "listDepth": 2,
                            "listItemCount": 2,
                            "listItemStyle": "arabic"
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 0,
                            listItemCount: 2,
                            "listItemStyle": "arabic"
                        },
                        {
                            "continued": false,
                            "text": "List 2, Item 1"
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 1,
                            listItemCount: 2,
                            "listItemStyle": "arabic"
                        },
                        {
                            "continued": false,
                            "text": "List 2, Item 2"
                        },
                        {
                            "listDepth": 1
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 1,
                            listItemCount: 2,
                            "listItemStyle": "disc"
                        },
                        {
                            "continued": false,
                            "text": "List 1, Item 2"
                        },
                        {
                            "listDepth": 0
                        },
                        {
                            "moveDown": true
                        }
                    ]
                );

            });

            it('outer ordered, inner unordered', function () {

                const parsed = reader.parse('1. List 1, Item 1\n   - List 2, Item 1\n   - List 2, Item 2\n2. List 1, Item 2');

                expect(instance.operations(parsed)).to.deep.eql(
                    [
                        {
                            "fillColor": "black",
                            "fillOpacity": 1,
                            "font": "default",
                            "fontSize": 12,
                            "list": true,
                            "listDepth": 1,
                            "listItemCount": 2,
                            "listItemStyle": "arabic",
                            "strokeColor": "black",
                            "strokeOpacity": 1
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 0,
                            listItemCount: 2,
                            "listItemStyle": "arabic"
                        },
                        {
                            "continued": false,
                            "text": "List 1, Item 1"
                        },
                        {
                            "listDepth": 2,
                            "listItemCount": 2,
                            "listItemStyle": "disc"
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 0,
                            listItemCount: 2,
                            "listItemStyle": "disc"
                        },
                        {
                            "continued": false,
                            "text": "List 2, Item 1"
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 1,
                            listItemCount: 2,
                            "listItemStyle": "disc"
                        },
                        {
                            "continued": false,
                            "text": "List 2, Item 2"
                        },
                        {
                            "listDepth": 1
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 1,
                            listItemCount: 2,
                            "listItemStyle": "arabic"
                        },
                        {
                            "continued": false,
                            "text": "List 1, Item 2"
                        },
                        {
                            "listDepth": 0
                        },
                        {
                            "moveDown": true
                        }
                    ]
                );

            });

            it('both ordered', function () {

                const parsed = reader.parse('1. List 1, Item 1\n   1. List 2, Item 1\n   2. List 2, Item 2\n2. List 1, Item 2');

                expect(instance.operations(parsed)).to.deep.eql(
                    [
                        {
                            "fillColor": "black",
                            "fillOpacity": 1,
                            "font": "default",
                            "fontSize": 12,
                            "list": true,
                            "listDepth": 1,
                            "listItemCount": 2,
                            "listItemStyle": "arabic",
                            "strokeColor": "black",
                            "strokeOpacity": 1
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 0,
                            listItemCount: 2,
                            "listItemStyle": "arabic"
                        },
                        {
                            "continued": false,
                            "text": "List 1, Item 1"
                        },
                        {
                            "listDepth": 2,
                            "listItemCount": 2,
                            "listItemStyle": "arabic"
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 0,
                            listItemCount: 2,
                            "listItemStyle": "arabic"
                        },
                        {
                            "continued": false,
                            "text": "List 2, Item 1"
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 1,
                            listItemCount: 2,
                            "listItemStyle": "arabic"
                        },
                        {
                            "continued": false,
                            "text": "List 2, Item 2"
                        },
                        {
                            "listDepth": 1
                        },
                        {
                            "listItem": true,
                            "listItemIndex": 1,
                            listItemCount: 2,
                            "listItemStyle": "arabic"
                        },
                        {
                            "continued": false,
                            "text": "List 1, Item 2"
                        },
                        {
                            "listDepth": 0
                        },
                        {
                            "moveDown": true
                        }
                    ]
                );

            });

        });

    });

    describe('heading', () => {

        it('level 1', () => {

            const parsed = reader.parse('# Headline');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "heading-bold",
                        "fontSize": 16.799999999999997,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1
                    },
                    {
                        "continued": false,
                        "text": "Headline"
                    },
                    {
                        "font": "default",
                        "fontSize": 12
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

        it('level 2', () => {

            const parsed = reader.parse('## Headline');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "heading-bold",
                        "fontSize": 14.399999999999999,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1
                    },
                    {
                        "continued": false,
                        "text": "Headline"
                    },
                    {
                        "font": "default",
                        "fontSize": 12
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

        it('level 3', () => {

            const parsed = reader.parse('### Headline');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "heading-default",
                        "fontSize": 14.399999999999999,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1
                    },
                    {
                        "continued": false,
                        "text": "Headline"
                    },
                    {
                        "font": "default",
                        "fontSize": 12
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

        it('level 4', () => {

            const parsed = reader.parse('#### Headline');

            expect(instance.operations(parsed)).to.deep.eql(
                [
                    {
                        "fillColor": "black",
                        "fillOpacity": 1,
                        "font": "heading-bold",
                        "fontSize": 12,
                        "listDepth": 0,
                        "strokeColor": "black",
                        "strokeOpacity": 1
                    },
                    {
                        "continued": false,
                        "text": "Headline"
                    },
                    {
                        "font": "default"
                    },
                    {
                        "moveDown": true
                    }
                ]
            );

        });

    });

});
