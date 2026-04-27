const {describe, it} = require('mocha');
const fs = require('fs');
const path = require('path');
const chai = require('chai');
const {expect} = chai;
const chaiFS = require('chai-fs');

describe('test cli', () => {

    it('with README.md', () => {

        const inputFilePath = path.join(__dirname, '../README.md');
        const outputFilePath = path.join(__dirname, '../README.pdf');

        process.argv = [null, null, inputFilePath, outputFilePath];

        require('../src/cli');

    });

});
