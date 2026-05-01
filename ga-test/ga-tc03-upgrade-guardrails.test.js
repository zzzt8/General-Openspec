'use strict';
const fs = require('fs');
const path = require('path');

const skillPath = path.join(process.cwd(), '.cursor', 'skills', 'ga-upgrade', 'SKILL.md');
const content = fs.readFileSync(skillPath, 'utf-8');

const required = [
  'Guardrails',
  'git',
  'tag',
  'CHANGELOG',
  'VERSION',
  'ga-reports',
];

let pass = 0;
for (const item of required) {
  if (content.includes(item)) {
    console.log(`GA-TC03 [${item}]: PASS`);
    pass++;
  } else {
    console.log(`GA-TC03 [${item}]: FAIL`);
  }
}

console.log(`\nGA-TC03: ${pass}/${required.length} PASS`);
if (pass < required.length) process.exit(1);
