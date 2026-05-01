'use strict';
const fs = require('fs');
const path = require('path');

const skillsDir = path.join(process.cwd(), '.cursor', 'skills');
const skillFiles = [];

function collect(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '_shared') continue;
    if (entry.isDirectory()) {
      const skillFile = path.join(dir, entry.name, 'SKILL.md');
      if (fs.existsSync(skillFile)) skillFiles.push(skillFile);
    }
  }
}

collect(skillsDir);

let pass = 0;
let fail = 0;
let noVersion = 0;

for (const file of skillFiles) {
  let content = fs.readFileSync(file, 'utf-8');
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    console.log(`SK-TC01 [${path.relative(process.cwd(), file)}]: FAIL (no frontmatter)`);
    fail++;
    continue;
  }
  const yamlMatch = match[1].match(/^version:\s*["']?([\w.-]+)["']?\s*$/m);
  if (!yamlMatch) {
    console.log(`SK-TC01 [${path.relative(process.cwd(), file)}]: FAIL (no version field)`);
    noVersion++;
    continue;
  }
  console.log(`SK-TC01 [${path.relative(process.cwd(), file)}]: PASS (v${yamlMatch[1]})`);
  pass++;
}

console.log(`\nSK-TC01: ${pass} PASS, ${noVersion} no version, ${fail} FAIL`);
if (fail > 0 || noVersion > 0) process.exit(1);
