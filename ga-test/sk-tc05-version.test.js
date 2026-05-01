'use strict';
const fs = require('fs');
const path = require('path');

const ver = path.join(process.cwd(), 'VERSION');
const exists = fs.existsSync(ver);
console.log(`SK-TC05 [VERSION exists]: ${exists ? 'PASS' : 'FAIL'}`);
if (!exists) process.exit(1);

const content = fs.readFileSync(ver, 'utf-8').trim();
const valid = /^v\d+\.\d+$/.test(content);
console.log(`SK-TC05 [VERSION format "vX.X"]: ${valid ? 'PASS' : 'FAIL'} (got: ${content})`);
if (!valid) process.exit(1);
