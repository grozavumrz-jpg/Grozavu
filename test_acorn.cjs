const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');

const code = fs.readFileSync('src/components/GlobeComponent.jsx', 'utf8');

try {
  const parser = acorn.Parser.extend(jsx());
  parser.parse(code, { sourceType: 'module', ecmaVersion: 2020 });
  console.log('Acorn parsed successfully');
} catch (e) {
  console.log(e.name, e.message, e.loc);
}
