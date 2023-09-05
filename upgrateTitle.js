const { readFileSync, writeFileSync } = require('fs');

const htmlFile = './build/index.html';

const content = readFileSync(htmlFile).toString();

const ChainName = process.argv[2];

const newContent = content.replace(/<title>.*<\/title>/, `<title>Particle ❤ ${ChainName} Chain</title>`);

writeFileSync(htmlFile, newContent);
