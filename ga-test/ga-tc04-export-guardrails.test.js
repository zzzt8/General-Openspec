'use strict';
const fs = require('fs');
const path = require('path');

const skillPath = path.join(process.cwd(), '.cursor', 'skills', 'ga-export', 'SKILL.md');
const content = fs.readFileSync(skillPath, 'utf-8');

const required = [
  'Guardrails',
  'export',
  '.cursor',
  'openspec/schemas',
  'README',
];

let pass = 0;
for (const item of required) {
  if (content.includes(item)) {
    console.log(`GA-TC04 [${item}]: PASS`);
    pass++;
  } else {
    console.log(`GA-TC04 [${item}]: FAIL`);
  }
}

console.log(`\nGA-TC04: ${pass}/${required.length} PASS`);
if (pass < required.length) process.exit(1);
