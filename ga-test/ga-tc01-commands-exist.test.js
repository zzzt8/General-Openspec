'use strict';
const fs = require('fs');
const path = require('path');

const EXPECTED_COMMANDS = [
  'opsx-onboard.md',
  'opsx-sync.md',
  'opsx-explore.md',
  'opsx-propose.md',
  'opsx-review.md',
  'opsx-apply.md',
  'opsx-verify.md',
  'opsx-archive.md',
  'opsx-debug.md',
  'opsx-plan.md',
  'opsx-continue.md',
  'opsx-skip.md',
  'opsx-sync-specs.md',
];

const commandsDir = path.join(process.cwd(), '.cursor', 'commands');
let pass = 0;
let fail = 0;

for (const cmd of EXPECTED_COMMANDS) {
  const filePath = path.join(commandsDir, cmd);
  if (fs.existsSync(filePath)) {
    console.log(`GA-TC01 [${cmd}]: PASS`);
    pass++;
  } else {
    console.log(`GA-TC01 [${cmd}]: FAIL`);
    fail++;
  }
}

console.log(`\nGA-TC01: ${pass}/${EXPECTED_COMMANDS.length} PASS`);
if (fail > 0) process.exit(1);
