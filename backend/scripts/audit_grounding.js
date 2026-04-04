const fs = require('fs');
const path = require('path');

const groundingPath = path.join(__dirname, '../data/r2021_syllabus_grounding.json');
const data = JSON.parse(fs.readFileSync(groundingPath, 'utf8'));

let count = 0;
for (const [code, subject] of Object.entries(data)) {
    const unitCount = subject.units ? subject.units.length : 0;
    if (unitCount < 5) {
        console.log(`Found subject with ${unitCount} units in GROUNDING FILE: ${code}`);
        count++;
    }
}

console.log(`Total subjects with < 5 units in grounding: ${count}`);
