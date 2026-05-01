'use strict';
const fs = require('fs');
const path = require('path');

const { execSync } = require('child_process');

try {
  execSync('openspec validate --all --json', { encoding: 'utf-8', stdio: 'pipe' });
  console.log('SK-TC02: openspec validate — PASS');
} catch (e) {
  let output = '';
  try {
    output = JSON.parse(e.stdout);
  } catch {
    output = e.stdout || e.message;
  }
  if (output.summary && output.summary.invalid === 0) {
    console.log('SK-TC02: openspec validate — PASS');
  } else {
    console.log('SK-TC02: openspec validate — FAIL');
    console.log(JSON.stringify(output, null, 2));
    process.exit(1);
  }
}
