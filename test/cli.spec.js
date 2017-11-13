import {describe, it} from 'mocha';
import fs from 'fs';
import path from 'path';
import chai, {expect} from 'chai';
import chaiFS from 'chai-fs';

describe('test cli', () => {

    it('with README.md', () => {

        const inputFilePath = path.join(__dirname, '../README.md');
        const outputFilePath = path.join(__dirname, '../README.pdf');

        process.argv = [null, null, inputFilePath, outputFilePath];

        require('../src/cli');

    });

});