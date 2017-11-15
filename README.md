# pdfkit-commonmark

Allows users of
[pdfkit](https://github.com/devongovett/pdfkit)
to render commonmark style markdown into 
their document (see [usage/code](#code)). 

Renders [commonmark](https://github.com/commonmark) 
style markdown to pdf (see [usage/cli](#cli)). 

## Info

It relies on the [abstract
syntax tree created by the commonmark parser](https://github.com/commonmark/commonmark.js#usage) 
to create a custom renderer using 
[pdfkit](http://pdfkit.org/docs/text.html).
To facilitate unit testing, the AST gets 
transformed into an intermediate (testable) 
list of operations which will finally be 
transformed into pdfkit api calls.

The [PDF version](README.pdf) of this README has been 
created using the pdfkit-commonmark cli script.

## Install

Installation uses the npm package manager. Just type the 
following command after installing npm.

    npm install --save pdfkit-commonmark

## Known limitations

This renderer does currently _partially_ (hey, this is an 0.x version) support:

- paragraphs
- softbreaks
- explicit linebreaks
- headers
- links
- strong
- emph
- flat lists without formatting

This renderer does currently __not__ support (order by priority):

- lists with formatting
- nested lists
- code
- block quotes
- image
- html
- tables

Pull requests are welcome.

## Known issues

For whatever reason, the text color switches to blue on the 
second page for the REAME.pdf. I assume that's the color from 
the link highlighting. But why this happens is pretty unclear.

There are some issues with missing whitespaces on linebreaks. 

## Usage

### CLI

    pdfkit-commonmark <inputFile> [<outputFile>]

As code is currently not supported by this renderer, this
part of the documentation is pretty empty in the pdf. Check
the README.md for code examples.
    
### Code

    import commonmark from 'commonmark';
    import CommonmarkPDFRenderer from 'pdfkit-commonmark';
    
    // get parser instance
    const reader = new commonmark.Parser();
    
    // parse input
    const parsed = reader.parse('This is **markdown** formatted text.');
    
    // get pdf renderer instance
    const writer = new CommonmarkPDFRenderer();
    
    // create pdf document
    const doc = new PDFDocument();
    
    // write pdf to some file in the current directory
    doc.pipe(fs.createWriteStream(__dirname + '/test.pdf'));
    
    // render parsed markdown to pdf
    writer.render(doc, parsed);
    
    // end the document
    doc.end();
    
As code is currently not supported by this renderer, this
part of the documentation is pretty empty in the pdf. Check
the README.md for code examples.

## Dependencies

There is currently only one regular dependency to "deep-defaults" 
to enable deep default options. If anyone has a better solution
for that, I am happy for a pointer.

commonmark and pdfkit are marked as peerDependencies. Technically 
you would not need either of them for this module to work 
properly. But it would be pretty pointless to do so.
