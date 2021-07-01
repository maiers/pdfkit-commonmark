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

## Supported markdown features

### Paragraphs

Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. 

Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. 

### Headers (level 3)

#### Level 4

##### Level 5

### Emphasize, Strong and Links

__Lorem ipsum__ dolor _sit_ amet, __*consetetur*__ sadipscin. [source](http://www.loremipsum.de/) 

### Softbreaks (compare pdf with markdown source)

Duis autem vel eum iriure dolor in 
hendrerit in vulputate velit esse 
molestie consequat, vel illum dolore 
eu feugiat nulla facilisis at vero
eros et accumsan et iusto odio 
dignissim qui blandit praesent 
luptatum zzril delenit augue duis 
dolore te feugait nulla facilisi.

### Linebreaks (two spaces at the end of the line)

Duis autem vel eum iriure dolor in  
hendrerit in vulputate velit esse  
molestie consequat, vel illum dolore  
eu feugiat nulla facilisis at vero  
eros et accumsan et iusto odio  
dignissim qui blandit praesent  
luptatum zzril delenit augue duis  
dolore te feugait nulla facilisi.

### Horizontal rules

---

### Lists

- paragraphs
- headers
- inline formatting
   1. emphasize
   2. strong
   3. links
- softbreaks
- explicit linebreaks
- horizontal rules
- lists, including  
  __multi-line__ with    
  *formatting* and [links](http://www.example.com)
- and last but not least
   1. nested lists
   2. and ordered lists

## Unsupported markdown features

This renderer currently does __not__ (and likely never will) support:

- code
- block quotes
- images
- html
- tables

Pull requests are welcome.

## Usage

### CLI

    pdfkit-commonmark <inputFile> [<outputFile>]

_Code will not be rendered in the PDF. Check the 
[README.md](https://github.com/maiers/pdfkit-commonmark/blob/master/README.md) 
for the code examples._
    
### Code

    import commonmark from 'commonmark';
    import CommonmarkPDFRenderer from 'pdfkit-commonmark';
    import PDFDocument from 'pdfkit';
    
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
    
_Code will not be rendered in the PDF. Check the 
[README.md](https://github.com/maiers/pdfkit-commonmark/blob/master/README.md) 
for the code examples._

## Dependencies

commonmark and pdfkit are marked as peerDependencies. Technically 
you would not need either of them for this module to work 
properly. But it would be pretty pointless to do so.
