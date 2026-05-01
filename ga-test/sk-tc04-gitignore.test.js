'use strict';
const fs = require('fs');
const path = require('path');

const gitignore = path.join(process.cwd(), '.gitignore');
const exists = fs.existsSync(gitignore);
console.log(`SK-TC04 [.gitignore exists]: ${exists ? 'PASS' : 'FAIL'}`);
if (!exists) process.exit(1);

const content = fs.readFileSync(gitignore, 'utf-8');
const patterns = ['node_modules', 'openspec/changes', '*.log'];
// Note: ga-reports is intentionally NOT ignored — tracked by git with `git add -f`
let pass = 0;

for (const p of patterns) {
  if (content.includes(p)) {
    console.log(`SK-TC04 ["${p}"]: PASS`);
    pass++;
  } else {
    console.log(`SK-TC04 ["${p}"]: FAIL`);
  }
}

console.log(`\nSK-TC04: ${pass}/${patterns.length} PASS`);
if (pass < patterns.length) process.exit(1);
