import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

describe('test cli', () => {

    it('with README.md', () => {

        const inputFilePath = path.join(projectRoot, 'README.md');
        const outputFilePath = path.join(projectRoot, 'README.pdf');

        execSync(`node dist/cjs/cli.js ${inputFilePath} ${outputFilePath}`, {
            cwd: projectRoot
        });

        assert.ok(fs.existsSync(outputFilePath));

    });

});
