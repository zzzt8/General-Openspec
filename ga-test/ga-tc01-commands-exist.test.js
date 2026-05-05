'use strict';
const fs = require('fs');
const path = require('path');

const EXPECTED_COMMANDS = [
  'opsx%3Aonboard.md',
  'opsx%3Async.md',
  'opsx%3Aexplore.md',
  'opsx%3Apropose.md',
  'opsx%3Areview.md',
  'opsx%3Aapply.md',
  'opsx%3Averify.md',
  'opsx%3Aarchive.md',
  'opsx%3Adebug.md',
  'opsx%3Aplan.md',
  'opsx%3Acontinue.md',
  'opsx%3Askip.md',
  'opsx%3Async-specs.md',
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
