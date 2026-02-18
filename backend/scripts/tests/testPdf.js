const { PDFJS } = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

async function test() {
    try {
        const pdfPath = path.join(__dirname, '../syallabus/cse syallabus.pdf');
        console.log('Testing PDF:', pdfPath);
        const dataBuffer = await fs.readFile(pdfPath);
        console.log('Buffer size:', dataBuffer.length);

        const uint8 = new Uint8Array(dataBuffer);

        try {
            const loadingTask = PDFJS.getDocument({ data: uint8 });
            const doc = await loadingTask.promise;
            console.log('Document loaded successfully!');
            console.log('Number of pages:', doc.numPages);

            if (doc.numPages > 0) {
                const firstPage = await doc.getPage(1);
                const content = await firstPage.getTextContent();
                const text = content.items.map(item => item.str).join(' ');
                console.log('First page text snippet length:', text.length);
                console.log('First page text snippet:', text.substring(0, 200));
            }

            await doc.destroy();
        } catch (err) {
            console.error('PDFJS error:', err.message);
        }
    } catch (e) {
        console.error('File read failed:', e);
    }
}

test();
