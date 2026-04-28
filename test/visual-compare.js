import * as mupdf from 'mupdf';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASELINES_DIR = path.join(__dirname, 'baselines');
const DIFFS_DIR = path.join(__dirname, 'diffs');

const UPDATE_BASELINES = process.env.UPDATE_BASELINES === '1';

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function renderPdfToPng(pdfPath) {
    const data = fs.readFileSync(pdfPath);
    const doc = mupdf.Document.openDocument(data, 'application/pdf');
    const page = doc.loadPage(0);
    const pixmap = page.toPixmap(mupdf.Matrix.identity, mupdf.ColorSpace.DeviceRGB, true, true);
    return Buffer.from(pixmap.asPNG());
}

/**
 * Compare a rendered PDF against its baseline PNG.
 *
 * The pipeline (pdfkit → PDF → mupdf → PNG) is deterministic, so we compare
 * PNG bytes directly. If they match exactly, the render is identical.
 *
 * To update baselines: run tests with UPDATE_BASELINES=1
 *
 * @param {string} pdfPath - Path to the PDF file
 * @param {string} name - Test name (used for baseline filename)
 * @returns {{ pass: boolean, updated?: boolean }}
 */
export function comparePdf(pdfPath, name) {
    ensureDir(BASELINES_DIR);

    const baselinePath = path.join(BASELINES_DIR, `${name}.png`);
    const currentPng = renderPdfToPng(pdfPath);

    if (UPDATE_BASELINES || !fs.existsSync(baselinePath)) {
        fs.writeFileSync(baselinePath, currentPng);
        return { pass: true, updated: true };
    }

    const baselinePng = fs.readFileSync(baselinePath);
    const pass = currentPng.equals(baselinePng);

    if (!pass) {
        ensureDir(DIFFS_DIR);
        fs.writeFileSync(path.join(DIFFS_DIR, `${name}_current.png`), currentPng);
    }

    return { pass };
}
