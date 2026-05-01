'use strict';
const fs = require('fs');
const path = require('path');

const commandsDir = path.join(process.cwd(), '.cursor', 'commands');
const files = fs.readdirSync(commandsDir).filter(f => f.startsWith('opsx-') && f.endsWith('.md'));
let pass = 0;
let fail = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(commandsDir, file), 'utf-8');
  if (content.includes('SKILL.md')) {
    console.log(`GA-TC02 [${file}]: PASS`);
    pass++;
  } else {
    console.log(`GA-TC02 [${file}]: FAIL (no SKILL.md reference)`);
    fail++;
  }
}

console.log(`\nGA-TC02: ${pass}/${files.length} PASS`);
if (fail > 0) process.exit(1);
