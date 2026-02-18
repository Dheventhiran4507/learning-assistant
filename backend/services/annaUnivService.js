const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Service to interact with the Anna University Syllabus API
 */
class AnnaUnivService {
    constructor() {
        this.apiKey = process.env.ANNA_UNIV_API_KEY;
        this.apiUrl = process.env.ANNA_UNIV_API_URL || 'https://api.annauniv.edu';
    }

    /**
     * Fetch syllabus for a specific semester
     * @param {number} semester 
     * @returns {Promise<Array>}
     */
    async fetchSyllabusBySemester(semester) {
        if (!this.apiKey) {
            logger.warn('Anna University API Key not configured. Skipping external fetch.');
            return [];
        }

        try {
            logger.info(`Fetching syllabus for semester ${semester} from Anna University API...`);

            // This is a placeholder for the actual API call
            // Once the real endpoint is known, this will be updated
            const response = await axios.get(`${this.apiUrl}/v1/syllabus`, {
                params: { semester, regulation: 'R2021' },
                headers: { 'X-API-KEY': this.apiKey }
            });

            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            logger.error(`Error fetching from Anna University API: ${error.message}`);
            return [];
        }
    }

    /**
     * Fetch specific subject details
     * @param {string} subjectCode 
     * @returns {Promise<Object|null>}
     */
    async fetchSubjectDetails(subjectCode) {
        if (!this.apiKey) return null;

        try {
            const response = await axios.get(`${this.apiUrl}/v1/subjects/${subjectCode}`, {
                headers: { 'X-API-KEY': this.apiKey }
            });

            if (response.data && response.data.success) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            logger.error(`Error fetching subject ${subjectCode} from Anna University API: ${error.message}`);
            return null;
        }
    }
}

module.exports = new AnnaUnivService();
