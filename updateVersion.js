const { writeFileSync } = require('fs');
const axios = require('axios');
const { get, set } = require('lodash');
const { spawnSync } = require('child_process');
const pkg = require('./package.json');

const { dependencies } = pkg;

const pkgNames = Object.keys(dependencies).filter((v) => {
    return v.startsWith('@particle-network');
});

Promise.all(
    pkgNames.map((name) => {
        return axios.get(['https://registry.npmjs.org', name].join('/')).then((res) => {
            const version = get(res, 'data.dist-tags.latest');
            // eslint-disable-next-line no-console
            console.log(name, dependencies[name], version);
            return version;
        });
    })
).then((versions) => {
    pkgNames.forEach((name, i) => {
        const version = versions[i];
        set(pkg, ['dependencies', name], version);
    });

    writeFileSync('./package.json', JSON.stringify(pkg));
    spawnSync('prettier', ['-w', 'package.json'], { stdio: 'inherit' });
    spawnSync('yarn', { stdio: 'inherit' });
});
