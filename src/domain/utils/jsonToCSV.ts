import fs from 'fs';

function jsonToCSV(json: any[]): string {
  const headers = Object.keys(json[0]);

  const csvRows = json.map((row) => headers.map((header) => JSON.stringify(row[header])).join(','));

  return [headers.join(','), ...csvRows].join('\n');
}

const csvData = jsonToCSV([]);

fs.writeFileSync('provinces.csv', csvData);
