const babel = require('@babel/core');
const fs = require('fs');
let code = fs.readFileSync('src/components/GlobeComponent.jsx', 'utf8');

try {
  babel.parseSync(code, {
    presets: ['@babel/preset-react'],
    filename: 'src/components/GlobeComponent.jsx'
  });
  console.log('OK');
} catch (e) {
  console.log(e.message);
}
