import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set worker path (disabled for now)
// const workerPath = pathToFileURL(path.resolve(__dirname, '../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')).href;
// pdfjs.GlobalWorkerOptions.workerSrc = workerPath;

async function testPdf() {
    try {
        const filePath = 'backend/syallabus/cse syallabus.pdf';
        const data = new Uint8Array(fs.readFileSync(filePath));
        console.log('Buffer size:', data.length);

        const loadingTask = pdfjs.getDocument({
            data,
            useSystemFonts: true,
            disableFontFace: true,
        });

        const doc = await loadingTask.promise;
        console.log('Number of pages:', doc.numPages);

        if (doc.numPages > 0) {
            let fullText = '';
            for (let i = 1; i <= doc.numPages; i++) {
                const page = await doc.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
                if (i <= 3) {
                    console.log(`Page ${i} text length:`, pageText.length);
                    console.log(`Page ${i} snippet:`, pageText.substring(0, 100));
                }
            }
            console.log('Total text length:', fullText.length);
        }

    } catch (error) {
        console.error('Error parsing PDF:', error);
    }
}

testPdf();
