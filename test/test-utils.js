import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const outputFilePath = (name) => {
    return path.join(__dirname, `_${name.replace(/[^a-z0-9]+/ig, '_')}.pdf`);
};
