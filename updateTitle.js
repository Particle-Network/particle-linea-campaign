const { readFileSync, writeFileSync } = require('fs');

const htmlFile = './build/index.html';

const content = readFileSync(htmlFile).toString();

const ChainName = process.argv[2];

const TitleMap = {
    Combo: 'Particle ❤ COMBO Network',
    opBNB: 'Particle ❤ opBNB',
    Scroll: 'Particle ❤ Scroll',
};

const title = TitleMap[ChainName] || 'Particle Campaigns';

const newContent = content.replace(/<title>.*<\/title>/, `<title>${title}</title>`);

writeFileSync(htmlFile, newContent);
