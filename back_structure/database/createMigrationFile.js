const fs = require('fs');
const path = require('path');

const migrationDirectory = path.join(process.cwd(), 'database', 'neo4j', 'migrations');
const filePrefix = 'V';
const fileExtension = '.cypher';

function getNextAvailableNumber(files) {
    const numbers = files.map(file => {
        return parseInt(file.substring(filePrefix.length, filePrefix.length + 3));
    }).sort((a, b) => a - b);

    let nextNumber = 1;
    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] !== nextNumber) {
            break;
        }
        nextNumber++;
    }
    return nextNumber;
}

function createMigration(customName) {
    const files = fs.readdirSync(migrationDirectory);
    const nextNumber = getNextAvailableNumber(files);
    const newFilename = `${filePrefix}${String(nextNumber).padStart(3, '0')}__${customName.replaceAll(" ","")}${fileExtension}`;
    const filePath = path.join(migrationDirectory, newFilename);
    fs.writeFileSync(filePath, '');
    console.log('New migration file created:', filePath);
}

const customName = process.argv[2];
if (!customName) {
    console.error('Custom name is required.');
    process.exit(1);
}

createMigration(customName);
