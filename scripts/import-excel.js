const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/import-excel.js <path-to-excel-or-csv>');
  process.exit(1);
}

const resolvedPath = path.resolve(process.cwd(), filePath);
if (!fs.existsSync(resolvedPath)) {
  console.error('Error: File not found at ' + resolvedPath);
  process.exit(1);
}

console.log('Reading participants from: ' + resolvedPath);
const workbook = XLSX.readFile(resolvedPath);
const sheetName = workbook.SheetNames[0];
const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

const participants = rawRows
  .map((row, idx) => {
    const nameKey = Object.keys(row).find(
      (k) => /name|attendee|participant|full\s*name/i.test(k)
    ) || Object.keys(row)[0];

    const emailKey = Object.keys(row).find((k) => /email|mail/i.test(k));
    const phoneKey = Object.keys(row).find((k) => /phone|contact|mobile|number/i.test(k));
    const deptKey = Object.keys(row).find((k) => /dept|department|branch/i.test(k));

    const nameVal = row[nameKey];
    if (!nameVal || typeof nameVal !== 'string' || nameVal.trim().length === 0) {
      return null;
    }

    return {
      id: 'P-' + (idx + 1).toString().padStart(4, '0'),
      name: String(nameVal).trim().toUpperCase(),
      email: emailKey ? String(row[emailKey]).trim() : undefined,
      phone: phoneKey ? String(row[phoneKey]).trim() : undefined,
      department: deptKey ? String(row[deptKey]).trim() : undefined,
      customData: row,
      createdAt: new Date().toISOString(),
    };
  })
  .filter(Boolean);

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const jsonPath = path.join(dataDir, 'participants.json');
fs.writeFileSync(jsonPath, JSON.stringify(participants, null, 2), 'utf-8');

console.log('Successfully imported ' + participants.length + ' participants into database (' + jsonPath + ')!');
