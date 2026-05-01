'use strict';
const path = require('path');
const fs = require('fs');

const TEST_FILES = [
  'ga-tc01-commands-exist.test.js',
  'ga-tc02-commands-format.test.js',
  'ga-tc03-upgrade-guardrails.test.js',
  'ga-tc04-export-guardrails.test.js',
  'ga-tc05-ga-commands.test.js',
  'ga-tc06-ga-skills.test.js',
  'sk-tc01-frontmatter.test.js',
  'sk-tc02-validate.test.js',
  'sk-tc03-git-init.test.js',
  'sk-tc04-gitignore.test.js',
  'sk-tc05-version.test.js',
  'sk-tc06-changelog.test.js',
];

const TEST_DIR = path.join(process.cwd(), 'ga-test');
const { execSync } = require('child_process');

let total = TEST_FILES.length;
let passed = 0;
let failed = 0;

console.log('========================================');
console.log('  GA Test Suite — General Openspec v0.1');
console.log('========================================\n');

for (const testFile of TEST_FILES) {
  const testPath = path.join(TEST_DIR, testFile);
  if (!fs.existsSync(testPath)) {
    console.log(`${testFile}: FAIL (file not found)`);
    failed++;
    continue;
  }

  process.stdout.write(`${testFile}... `);
  try {
    execSync(`node "${testPath}"`, { stdio: 'pipe', encoding: 'utf-8' });
    console.log('PASS');
    passed++;
  } catch (e) {
    console.log('FAIL');
    failed++;
  }
}

console.log('\n========================================');
console.log(`  Results: ${passed}/${total} PASS`);
console.log('========================================\n');

if (failed > 0) {
  console.log(`FAIL: ${failed} test(s) failed.`);
  process.exit(1);
} else {
  console.log('All tests passed.');
}
