/**
 * GENERATE-INDEX.js - Auto-generate SKILL-INDEX.md from SKILL.md frontmatter
 *
 * Usage: node .cursor/skills/_shared/GENERATE-INDEX.js
 *
 * v5.3 changes:
 *   - category order: onboard > sync > explore > propose > meta > apply > skip > verify > archive > debug > review
 *   - skip _shared directory
 */

const fs = require('fs');
const path = require('path');

function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  return fallbackParse(match[1]);
}

function fallbackParse(yamlContent) {
  const fm = {};
  const lines = yamlContent.replace(/\r/g, '').split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) { i++; continue; }
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    if (value !== '' || !line.endsWith(':')) {
      fm[key] = value;
      i++;
      continue;
    }
    const arr = [];
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].startsWith('  - ')) {
        arr.push(lines[j].replace(/^  - /, ''));
      } else {
        break;
      }
    }
    if (arr.length > 0) {
      fm[key] = arr;
      i += arr.length + 1;
    } else {
      fm[key] = [];
      i++;
    }
  }
  return fm;
}

function escapeMd(str) {
  if (Array.isArray(str)) {
    return str.map(s => '`' + s + '`').join(', ');
  }
  return str ? '`' + str + '`' : '""';
}

function generateIndex(skillsByCategory) {
  const order = [
    'onboard', 'sync', 'explore', 'propose', 'meta',
    'apply', 'skip', 'verify', 'archive', 'debug', 'review'
  ];

  const navLinks = order
    .filter(c => skillsByCategory[c])
    .map(c => '[' + c + '](#' + c + ')')
    .join(' | ');

  let md = '---\nname: _skill-index\ndescription: All Skill index. Organized by category. v5.3.\n---\n\n';
  md += '# Skill Index\n\n';
  md += '> **This index is auto-generated. Do not edit manually.**\n';
  md += '> Run `node .cursor/skills/_shared/GENERATE-INDEX.js` to regenerate.\n\n';
  md += '## Quick Nav\n\n' + navLinks + '\n\n---\n\n';

  for (const cat of order) {
    const skills = skillsByCategory[cat];
    if (!skills) continue;
    md += '## ' + cat + '\n\n';
    for (const skill of skills) {
      md += '### ' + skill.name + '\n\n' + (skill.description || '') + '\n\n';
      md += '| Attr | Value |\n|------|----|\n';
      md += '| name | `' + skill.name + '` |\n';
      md += '| category | `' + cat + '` |\n';
      if (skill.version) md += '| version | `' + skill.version + '` |\n';
      if (skill.tags) md += '| tags | ' + escapeMd(skill.tags) + ' |\n';
      if (skill.aliases) md += '| aliases | ' + escapeMd(skill.aliases) + ' |\n';
      if (skill.depends_on && skill.depends_on.length > 0) {
        md += '| depends_on | ' + escapeMd(skill.depends_on) + ' |\n';
      }
      md += '\n';
      if (skill.aliases && skill.aliases.length > 0) {
        md += '```bash\n' + skill.aliases[0] + '\n```\n\n';
      }
      md += '---\n\n';
    }
  }

  md += '## Search Examples\n\n';
  md += '```\nonboard  -> openspec-onboard\napply   -> openspec-apply, openspec-continue\nverify  -> openspec-verify\ndebug   -> openspec-debug\nmeta    -> openspec-plan, openspec-skill\n```\n\n';
  md += '## Related Files\n\n';
  md += '- [SCHEMA.md](./SCHEMA.md) - Configuration schema\n';
  md += '- [SHARED-LAYERS.md](./SHARED-LAYERS.md) - Layer mapping\n';

  return md;
}

function main() {
  const skillsDir = path.resolve(__dirname, '..');
  const indexPath = path.join(__dirname, 'SKILL-INDEX.md');
  const skillFiles = [];

  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.name === '_shared') continue;
      if (entry.isDirectory()) {
        const skillFile = path.join(fullPath, 'SKILL.md');
        if (fs.existsSync(skillFile)) {
          skillFiles.push(skillFile);
        } else {
          walkDir(fullPath);
        }
      }
    }
  }

  walkDir(skillsDir);

  const skills = skillFiles.map(file => {
    const fm = parseFrontmatter(file);
    if (!fm || !fm.name) return null;
    return {
      name: fm.name,
      description: fm.description,
      version: fm.version,
      category: fm.category,
      tags: fm.tags,
      aliases: fm.aliases,
      depends_on: fm.depends_on
    };
  }).filter(Boolean);

  const skillsByCategory = {};
  for (const skill of skills) {
    const cat = skill.category || 'other';
    if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
    skillsByCategory[cat].push(skill);
  }

  const index = generateIndex(skillsByCategory);
  fs.writeFileSync(indexPath, index, 'utf8');
  console.log('Generated: ' + indexPath);
  console.log('Found ' + skillFiles.length + ' skills in ' + Object.keys(skillsByCategory).length + ' categories');
  for (const [cat, list] of Object.entries(skillsByCategory)) {
    console.log('  ' + cat + ': ' + list.map(s => s.name).join(', '));
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseFrontmatter, generateIndex };
