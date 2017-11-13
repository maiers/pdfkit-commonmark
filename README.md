# pdfkit-commonmark

This is a pdf renderer for 
[commonmark](https://github.com/commonmark). 
Or a commonmark renderer for 
[pdfkit](https://github.com/devongovett/pdfkit). 
Whatevery you prefer.

It relies on the commonmark feature to process the [abstract
syntax tree from the commonmark parser](https://github.com/commonmark/commonmark.js#usage) to create a custom
renderer.

The PDF version of the [README](README.pdf) is created using the 
cli script of pdfkit-commonmark.

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
    
    // render pased markdown to pdf
    writer.render(doc, parsed);
    
    // end the document
    doc.end();
    
As code is currently not supported by this renderer, this
part of the documentation is pretty empty in the pdf. Check
the README.md for code examples.

## Known issues

For whatever reason, the text color switches to blue on the 
second page for the REAME.pdf. I assume that's the color from 
the link highlighting. But why this happens is pretty unclear.

## Known limitations

This renderer does currently not support:

- explicit softbreaks
- explicit linebreaks
- html
- image
- code
- block quotes
- tables

Pull requests are welcome.

## Dependencies

There is currently only one regular dependency to "deep-defaults" 
to enable deep default options. If anyone has a better solution
for that, I am happy for a pointer.

commonmark and pdfkit are marked as peerDependencies. Technically 
you would not need either of them for this module to work 
properly. But it would be pretty pointless to do so.
