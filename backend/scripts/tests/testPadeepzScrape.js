const axios = require('axios');
const logger = require('../utils/logger');

async function testScrape() {
    try {
        const url = 'https://padeepz.net/hs3151-syllabus-professional-english-i-regulation-2021-anna-university/';
        console.log(`Fetching: ${url}`);

        const response = await axios.get(url);
        const html = response.data;

        // Basic extraction of UNIT sections
        // Look for UNIT I, UNIT II, etc.
        const unitRegex = /UNIT\s+([IVX1-5]+)(?:[\s\-:]+)([^\n<]+)/gi;
        let match;
        const units = [];

        while ((match = unitRegex.exec(html)) !== null) {
            const unitNumber = match[1];
            const unitTitle = match[2].trim();

            // Find content until next unit or course outcomes
            const startIdx = unitRegex.lastIndex;
            let endIdx = html.indexOf('UNIT ', startIdx);
            if (endIdx === -1) endIdx = html.indexOf('COURSE OUTCOMES', startIdx);
            if (endIdx === -1) endIdx = html.indexOf('TOTAL:', startIdx);

            let content = '';
            if (endIdx !== -1) {
                content = html.substring(startIdx, endIdx);
            } else {
                content = html.substring(startIdx);
            }

            // Clean HTML tags from content
            const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

            units.push({
                unitNumber,
                unitTitle,
                content: cleanContent
            });
        }

        console.log('Extracted Units:');
        units.forEach(u => {
            console.log(`\n--- Unit ${u.unitNumber}: ${u.unitTitle} ---`);
            console.log(u.content.substring(0, 300) + '...');
        });

    } catch (error) {
        console.error('Scrape failed:', error);
    }
}

testScrape();
