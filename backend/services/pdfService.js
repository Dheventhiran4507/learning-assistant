const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { pathToFileURL } = require('url');
const logger = require('../utils/logger');

class PDFService {
    constructor() {
        this.pdfjs = null;
    }

    async init() {
        if (this.pdfjs) return;
        try {
            // Using dynamic import for ESM module
            this.pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

            // Set worker path
            const workerPath = path.resolve(__dirname, '../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
            this.pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
        } catch (error) {
            logger.error('Error initializing PDFJS:', error);
            // Don't throw here, we might use scraping instead
        }
    }

    /**
     * Extract text from PDF file
     * @param {string} filePath - Path to PDF file
     * @returns {Promise<string>} Extracted text
     */
    async extractText(filePath) {
        try {
            await this.init();
            if (!this.pdfjs) throw new Error('PDFJS not initialized');

            const dataBuffer = await fs.readFile(filePath);
            const data = new Uint8Array(dataBuffer);
            logger.info(`Reading file: ${filePath}, Buffer size: ${data.length}`);

            const loadingTask = this.pdfjs.getDocument({
                data,
                useSystemFonts: true,
                disableFontFace: true,
                isEvalSupported: false
            });

            const doc = await loadingTask.promise;
            logger.info(`PDF loaded. Number of pages: ${doc.numPages}`);

            if (doc.numPages < 2) {
                logger.warn('PDF has only one page, might be corrupted or scanned. Switched to scraping if possible.');
            }

            let fullText = '';
            for (let i = 1; i <= doc.numPages; i++) {
                const page = await doc.getPage(i);
                const textContent = await page.getTextContent();
                logger.debug(`Page ${i}: ${textContent.items.length} items found`);
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }

            logger.info(`Extraction complete. Total text length: ${fullText.length}`);
            return fullText;
        } catch (error) {
            logger.error('Error extracting PDF text:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    /**
     * Scrape subject details from Padeepz URL
     * @param {string} url - Subject syllabus URL
     * @returns {Promise<Object>} Structured subject data
     */
    async scrapeSubjectFromUrl(url) {
        try {
            logger.info(`Scraping syllabus from: ${url}`);
            const response = await axios.get(url);
            const html = response.data;

            // Extract subject code and name from title/headers
            const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([\s\S]*?)<\/title>/i);
            const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';

            // Try to find the first <h2> or <b> that looks like a subject title "CS3251 - Programming in C"
            const subjectMatch = html.match(/([A-Z]{2}\s*\d{4})\s*[\-:]?\s*([^<\n]+)/i);

            const subjectCode = subjectMatch ? subjectMatch[1].replace(/\s+/g, '').toUpperCase() : '';
            const subjectName = subjectMatch ? subjectMatch[2].trim() : title.split('Syllabus')[0].trim();

            const units = [];
            const unitRegex = /UNIT\s+([IVX1-5]+)(?:[\s\-:]+)([^\n<]+)/gi;
            let match;

            while ((match = unitRegex.exec(html)) !== null) {
                const unitNumber = this.parseUnitNumber(match[1]);
                const unitTitle = match[2].replace(/<[^>]*>/g, '').trim();

                const startIdx = unitRegex.lastIndex;
                let endIdx = html.indexOf('UNIT ', startIdx);
                if (endIdx === -1) endIdx = html.indexOf('COURSE OUTCOMES', startIdx);
                if (endIdx === -1) endIdx = html.indexOf('TOTAL:', startIdx);
                if (endIdx === -1) endIdx = html.indexOf('TEXT BOOKS', startIdx);

                let content = '';
                if (endIdx !== -1) {
                    content = html.substring(startIdx, endIdx);
                } else {
                    content = html.substring(startIdx);
                }

                // Clean content
                const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

                units.push({
                    unitNumber,
                    unitTitle,
                    topics: [{
                        topicName: cleanContent,
                        difficulty: 'medium'
                    }]
                });
            }

            return {
                subjectCode,
                subjectName,
                units
            };
        } catch (error) {
            logger.error(`Error scraping from ${url}:`, error);
            throw new Error('Failed to scrape syllabus from URL');
        }
    }

    /**
     * Scrape the main list of subjects from the Padeepz CSE syllabus page
     * @param {string} url - Main syllabus list URL
     * @returns {Promise<Array>} List of { semester, subjectCode, subjectName, url }
     */
    async scrapeSyllabusList(url) {
        try {
            logger.info(`Scraping syllabus list from: ${url}`);
            const response = await axios.get(url);
            const html = response.data;

            const results = [];
            let currentSemester = 1;

            // Split by semester sections
            const semSections = html.split(/Anna University\s+(\d+)(?:st|nd|rd|th)\s+Semester/i);

            for (let i = 1; i < semSections.length; i += 2) {
                const semester = parseInt(semSections[i]);
                const content = semSections[i + 1];

                // Find all links like [HS3151 Professional English – I Syllabus](https://...)
                // We'll use a regex that looks for typical subject patterns
                const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>([A-Z]{2}\s*\d{4})\s*([^<]+)<\/a>/gi;
                let match;

                while ((match = linkRegex.exec(content)) !== null) {
                    results.push({
                        semester,
                        url: match[1],
                        subjectCode: match[2].replace(/\s+/g, '').toUpperCase(),
                        subjectName: match[3].replace(/Syllabus/gi, '').trim()
                    });
                }
            }

            return results;
        } catch (error) {
            logger.error(`Error scraping syllabus list:`, error);
            throw new Error('Failed to scrape syllabus list');
        }
    }

    /**
     * Parse syllabus text into structured data
     * @param {string} text - Raw text from PDF
     * @param {number} semester - Semester number
     * @returns {Array} Array of subject objects with units and topics
     */
    parseSyllabus(text, semester) {
        try {
            const subjects = [];

            // Split text into lines and clean
            // Remove empty lines and lines with only whitespace
            const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

            let currentSubject = null;
            let currentUnit = null;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Detect subject (usually has subject code like CS3251, MA3251, etc.)
                // Allow optional spaces in code (e.g. CS 3251)
                const subjectMatch = line.match(/^([A-Z]{2}\s*\d{4})\s+(.+)$/i);
                if (subjectMatch) {
                    // Save previous subject if exists
                    if (currentSubject) {
                        subjects.push(currentSubject);
                    }

                    currentSubject = {
                        subjectCode: subjectMatch[1].replace(/\s+/g, '').toUpperCase(),
                        subjectName: subjectMatch[2].trim(),
                        semester: semester,
                        units: []
                    };
                    currentUnit = null;
                    continue;
                }

                // Detect unit (UNIT I, UNIT 1, Unit-I, UNIT-1 etc.)
                // More flexible regex: UNIT followed by space/dash then roman/number
                const unitMatch = line.match(/^UNIT[\s\-]+([IVX1-5]+)(?:[\s\-:]+(.*))?$/i);
                if (unitMatch && currentSubject) {
                    const unitNumber = this.parseUnitNumber(unitMatch[1]);
                    const unitTitle = (unitMatch[2] || `Unit ${unitNumber}`).trim();

                    currentUnit = {
                        unitNumber: unitNumber,
                        unitTitle: unitTitle,
                        topics: []
                    };
                    currentSubject.units.push(currentUnit);
                    continue;
                }

                // Stop processing topics if we hit non-syllabus sections
                if (this.isSectionHeader(line)) {
                    currentUnit = null; // Stop adding topics to the last unit
                    continue;
                }

                // Add topics to current unit
                if (currentUnit && line.length > 3) {
                    // Skip common headers/footers
                    if (this.isValidTopic(line)) {
                        // Split topics separated by comma or semicolon if line is long
                        /* 
                           Note: Splitting strictly by comma might break some topics. 
                           However, syllabus often lists multiple topics in one paragraph.
                           For now, let's keep line-based but clean it.
                        */

                        currentUnit.topics.push({
                            topicName: line,
                            subtopics: [],
                            difficulty: 'medium'
                        });
                    }
                }
            }

            // Add last subject
            if (currentSubject) {
                subjects.push(currentSubject);
            }

            // Validate and clean subjects
            return subjects.filter(subject =>
                subject.units.length > 0 &&
                subject.units.some(unit => unit.topics.length > 0)
            );

        } catch (error) {
            logger.error('Error parsing syllabus:', error);
            throw new Error('Failed to parse syllabus structure');
        }
    }

    /**
     * Convert roman/numeric unit identifier to number
     */
    parseUnitNumber(unitStr) {
        if (!unitStr) return 1;

        const romanMap = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 };
        const cleanStr = unitStr.toUpperCase().trim();

        // Try roman numeral first
        if (romanMap[cleanStr]) {
            return romanMap[cleanStr];
        }

        // Try numeric
        const num = parseInt(cleanStr);
        if (!isNaN(num) && num >= 1 && num <= 5) {
            return num;
        }

        return 1; // Default to unit 1
    }

    /**
     * Check if line is a section header (Time to stop adding topics)
     */
    isSectionHeader(line) {
        const headers = [
            /^TEXT\s*BOOKS/i,
            /^REFERENCES/i,
            /^COURSE\s*OUTCOMES/i,
            /^TOTAL\s*:/i,
            /^PRACTICALS/i,
            /^LIST\s*OF\s*EXPERIMENTS/i,
            /^PERIODS/i
        ];

        return headers.some(pattern => pattern.test(line));
    }

    /**
     * Check if line is a valid topic (not header/footer/page number)
     */
    isValidTopic(line) {
        // Skip page numbers
        if (/^\d+$/.test(line)) return false;

        // Skip very short lines
        if (line.length < 5) return false;

        // Skip common headers
        const skipPatterns = [
            /^page\s+\d+/i,
            /^syllabus/i,
            /^semester/i,
            /^anna\s+university/i,
            /^regulations/i,
            /^department/i,
            /^credit/i,
            /^L\s*T\s*P\s*C/i
        ];

        for (const pattern of skipPatterns) {
            if (pattern.test(line)) return false;
        }

        return true;
    }

    /**
     * Extract and parse syllabus from PDF file
     * @param {string} filePath - Path to PDF file
     * @param {number} semester - Semester number
     * @returns {Promise<Array>} Parsed syllabus data
     */
    async extractSyllabus(filePath, semester) {
        const text = await this.extractText(filePath);
        return this.parseSyllabus(text, semester);
    }
}

module.exports = new PDFService();
