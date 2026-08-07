import fs from 'fs';

const code = fs.readFileSync('src/components/GlobeComponent.jsx', 'utf8');

// Use a more robust stripping strategy
let stripped = code;

// Remove line comments
stripped = stripped.replace(/\/\/.*/g, '');

// Remove block comments
stripped = stripped.replace(/\/\*[\s\S]*?\*\//g, '');

// Naive paren matching, let's just use acorn to see the exact syntax error line!
// Babel gave 99:39. Let's see what Acorn gives!
