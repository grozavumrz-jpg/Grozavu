const babel = require('@babel/core');
const fs = require('fs');
try {
  babel.parseSync(fs.readFileSync('src/components/GlobeComponent.jsx', 'utf8'), {
    presets: ['@babel/preset-react'],
    filename: 'src/components/GlobeComponent.jsx'
  });
  console.log('OK');
} catch (e) {
  console.error(e.message);
}
