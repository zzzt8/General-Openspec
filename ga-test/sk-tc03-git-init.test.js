'use strict';
const fs = require('fs');
const path = require('path');

const gitDir = path.join(process.cwd(), '.git');
const exists = fs.existsSync(gitDir);
console.log(`SK-TC03 [.git/]: ${exists ? 'PASS' : 'FAIL'}`);
if (!exists) process.exit(1);

const { execSync } = require('child_process');

const log = execSync('git log --oneline 2>&1', { encoding: 'utf-8' }).trim();
console.log(`SK-TC03 [git log]: ${log ? 'PASS' : 'FAIL'}`);
console.log(`  -> ${log.split('\n')[0]}`);
