'use strict';
const fs = require('fs');
const path = require('path');

const { execSync } = require('child_process');

const GA_COMMANDS = [
  'ga-upgrade.md',
  'ga-export.md',
  'ga-test.md',
  'ga-report.md',
  'ga-skill.md',
];

const commandsDir = path.join(process.cwd(), '.cursor', 'commands');
let pass = 0;
let fail = 0;

for (const cmd of GA_COMMANDS) {
  const filePath = path.join(commandsDir, cmd);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('SKILL.md')) {
      console.log(`GA-TC05 [${cmd}]: PASS`);
      pass++;
    } else {
      console.log(`GA-TC05 [${cmd}]: FAIL (no SKILL.md reference)`);
      fail++;
    }
  } else {
    console.log(`GA-TC05 [${cmd}]: FAIL (file not found)`);
    fail++;
  }
}

console.log(`\nGA-TC05: ${pass}/${GA_COMMANDS.length} PASS`);
if (fail > 0) process.exit(1);
