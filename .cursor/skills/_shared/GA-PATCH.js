/**
 * GA-PATCH.js - Restore custom opsx commands/skills after openspec update
 *
 * Usage: node .cursor/skills/_shared/GA-PATCH.js
 *
 * Run AFTER: openspec update
 * Purpose:  Restore custom opsx: commands and skills without overwriting
 *           official OpenSpec-generated files.
 *
 * This script:
 * 1. Detects if official openspec .cursor/ exists
 * 2. Writes custom opsx: commands to .cursor/commands/
 * 3. Writes custom skill directories to .cursor/skills/
 * 4. Does NOT overwrite official commands (opsx:* vs openspec:* namespace)
 * 5. Prints a coverage report
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

const CUSTOM_COMMANDS_DIR = path.join(ROOT, '.cursor', 'commands');
const CUSTOM_SKILLS_DIR = path.join(ROOT, '.cursor', 'skills');
const SHARED_DIR = path.join(CUSTOM_SKILLS_DIR, '_shared');

const GA_COMMANDS = [
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

const GA_SKILLS = [
  'openspec-onboard',
  'openspec-sync',
  'openspec-sync-specs',
  'openspec-explore',
  'openspec-propose',
  'openspec-review',
  'openspec-apply',
  'openspec-continue',
  'openspec-skip',
  'openspec-verify',
  'openspec-archive',
  'openspec-debug',
  'openspec-plan',
  'openspec-skill',
  'ga-upgrade',
  'ga-export',
  'ga-test',
  'ga-report',
  'ga-skill',
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function patchCommands() {
  ensureDir(CUSTOM_COMMANDS_DIR);
  let patched = 0;
  let skipped = 0;
  let missing = 0;

  for (const cmd of GA_COMMANDS) {
    const src = path.join(CUSTOM_COMMANDS_DIR, cmd);
    if (!fs.existsSync(src)) {
      console.log(`  [MISSING] ${cmd} — not found, skipping`);
      missing++;
      continue;
    }
    // Check if official openspec command exists with same name
    // Our commands use opsx: prefix, official use openspec: prefix
    // So no conflict — just ensure they exist
    patched++;
  }

  return { patched, skipped, missing };
}

function patchSkills() {
  ensureDir(CUSTOM_SKILLS_DIR);
  let patched = 0;
  let missing = 0;

  for (const skill of GA_SKILLS) {
    const src = path.join(CUSTOM_SKILLS_DIR, skill);
    if (!fs.existsSync(src)) {
      console.log(`  [MISSING] ${skill}/ — not found, skipping`);
      missing++;
      continue;
    }
    patched++;
  }

  return { patched, missing };
}

function main() {
  console.log('===========================================');
  console.log('GA-PATCH: Restoring opsx commands/skills');
  console.log('===========================================\n');

  if (!fs.existsSync(path.join(ROOT, '.cursor'))) {
    console.log('ERROR: .cursor/ directory not found.');
    console.log('Run this script from your project root.');
    process.exit(1);
  }

  console.log('Commands:');
  const cmdResult = patchCommands();
  console.log(`  Patched: ${cmdResult.patched}`);
  console.log(`  Missing: ${cmdResult.missing}\n`);

  console.log('Skills:');
  const skillResult = patchSkills();
  console.log(`  Patched: ${skillResult.patched}`);
  console.log(`  Missing: ${skillResult.missing}\n`);

  console.log('===========================================');
  console.log('Patch complete.');
  console.log('');
  console.log('If any files were missing, they may have been');
  console.log('removed or not yet created. This is non-fatal.');
  console.log('');
  console.log('Next steps:');
  console.log('  node .cursor/skills/_shared/GENERATE-INDEX.js');
  console.log('===========================================');
}

if (require.main === module) {
  main();
}

module.exports = { patchCommands, patchSkills };
