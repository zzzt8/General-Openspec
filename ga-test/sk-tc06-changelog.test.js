'use strict';
const fs = require('fs');
const path = require('path');

const cl = path.join(process.cwd(), 'CHANGELOG.md');
const exists = fs.existsSync(cl);
console.log(`SK-TC06 [CHANGELOG.md exists]: ${exists ? 'PASS' : 'FAIL'}`);
if (!exists) process.exit(1);

const content = fs.readFileSync(cl, 'utf-8');
const hasVersionHeader = /## \[v\d+\.\d+\]/.test(content);
const hasDate = /\d{4}-\d{2}-\d{2}/.test(content);
console.log(`SK-TC06 [Version header]: ${hasVersionHeader ? 'PASS' : 'FAIL'}`);
console.log(`SK-TC06 [Date present]: ${hasDate ? 'PASS' : 'FAIL'}`);
if (!hasVersionHeader || !hasDate) process.exit(1);
