const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || 'http://localhost:5074';

const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
};
`;

const outPath = path.join(__dirname, '../src/environments/environment.prod.ts');
fs.writeFileSync(outPath, content);
console.log(`environment.prod.ts generated with apiUrl: ${apiUrl}`);
