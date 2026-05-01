'use strict';
const fs = require('fs');
const path = require('path');

const EXPECTED_SKILLS = [
  'ga-upgrade',
  'ga-export',
  'ga-test',
  'ga-report',
  'ga-skill',
];

const skillsDir = path.join(process.cwd(), '.cursor', 'skills');
let pass = 0;
let fail = 0;

for (const skill of EXPECTED_SKILLS) {
  const skillPath = path.join(skillsDir, skill, 'SKILL.md');
  if (fs.existsSync(skillPath)) {
    const content = fs.readFileSync(skillPath, 'utf-8');
    if (content.includes('name:') && content.includes('version:')) {
      console.log(`GA-TC06 [${skill}]: PASS`);
      pass++;
    } else {
      console.log(`GA-TC06 [${skill}]: FAIL (missing frontmatter)`);
      fail++;
    }
  } else {
    console.log(`GA-TC06 [${skill}]: FAIL (file not found)`);
    fail++;
  }
}

console.log(`\nGA-TC06: ${pass}/${EXPECTED_SKILLS.length} PASS`);
if (fail > 0) process.exit(1);
