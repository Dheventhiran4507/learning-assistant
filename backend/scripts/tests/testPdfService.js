const pdfService = require('../services/pdfService');
const path = require('path');

async function testService() {
    try {
        const filePath = path.resolve(__dirname, '../syallabus/cse syallabus.pdf');
        console.log('Testing PDFService with file:', filePath);

        console.log('Extracting text...');
        const text = await pdfService.extractText(filePath);
        console.log('Extracted text length:', text.length);
        console.log('Text snippet:', text.substring(0, 500));

        if (text.length > 0) {
            console.log('Parsing syllabus...');
            const structuredData = pdfService.parseSyllabus(text, 1);
            console.log('Found subjects:', structuredData.length);

            structuredData.forEach(subject => {
                console.log(`- ${subject.subjectCode}: ${subject.subjectName} (${subject.units.length} units)`);
            });
        }

    } catch (error) {
        console.error('Error testing PDFService:', error);
    }
}

testService();
