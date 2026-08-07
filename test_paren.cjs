const fs = require('fs');
let code = fs.readFileSync('src/components/GlobeComponent.jsx', 'utf8');

// Strip all strings (``, '', "")
let stripped = code.replace(/`([^`\\]|\\.)*`/g, "''");
stripped = stripped.replace(/'([^'\\]|\\.)*'/g, "''");
stripped = stripped.replace(/"([^"\\]|\\.)*"/g, '""');
stripped = stripped.replace(/\/\/.*/g, ''); // comments

let lines = stripped.split('\n');
let p = 0;
let b = 0;
for (let i = 143; i <= 237; i++) {
  let line = lines[i - 1]; // lines is 0-indexed
  for(let j=0; j<line.length; j++) {
    if (line[j] === '(') p++;
    if (line[j] === ')') p--;
    if (line[j] === '{') b++;
    if (line[j] === '}') b--;
  }
  console.log(`Line ${i}: p=${p}, b=${b} | ${line}`);
}
