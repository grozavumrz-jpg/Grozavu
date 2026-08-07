import fs from 'fs';
const lines = fs.readFileSync('src/components/GlobeComponent.jsx', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('return (')) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
