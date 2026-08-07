const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');
const parser = acorn.Parser.extend(jsx());

function testCode(code) {
  try {
    parser.parse(code, { sourceType: 'module', ecmaVersion: 2020 });
    return true;
  } catch (e) {
    return false;
  }
}

let code = fs.readFileSync('src/components/GlobeComponent.jsx', 'utf8');

function removeBlock(str, trigger) {
  const startIndex = str.indexOf(trigger);
  if (startIndex === -1) return str;
  let braceCount = 0;
  let endIndex = -1;
  let started = false;
  for (let i = startIndex; i < str.length; i++) {
     if (str[i] === '{') {
        braceCount++;
        started = true;
     }
     if (str[i] === '}') {
        braceCount--;
     }
     if (started && braceCount === 0) {
        endIndex = i;
        break;
     }
  }
  if (endIndex !== -1) {
     return str.slice(0, startIndex) + str.slice(endIndex + 1);
  }
  return str;
}

let without = removeBlock(code, 'const htmlElements = useMemo(() => {');
if (testCode(without)) {
   console.log('Error IS inside htmlElements useMemo!');
} else {
   console.log('Error is NOT inside htmlElements useMemo.');
}

without = removeBlock(code, 'const playerCountryGroups = useMemo(() => {');
if (testCode(without)) {
   console.log('Error IS inside playerCountryGroups useMemo!');
}
without = removeBlock(code, 'useEffect(() => {');
if (testCode(without)) {
   console.log('Error IS inside the first useEffect!');
}

