/**
 * SKILL-INDEX.md 鑷姩鐢熸垚鑴氭湰 v5.3
 *
 * 浣跨敤鏂规硶锛? *   node .cursor/skills/_shared/GENERATE-INDEX.js
 *
 * 鍔熻兘锛? *   鎵弿 .cursor/skills/ 涓嬫墍鏈?SKILL.md锛岃В鏋?YAML frontmatter锛? *   鎸?category 鍒嗙粍鐢熸垚 SKILL-INDEX.md
 *
 * v5.3 鍙樻洿锛? *   - category 鎺掑簭鏇存柊锛歰nboard > sync > explore > propose > meta > apply > skip > verify > archive > debug
 *   - 鏀寔 _shared 鐩綍锛堢敓鎴?_schema 鍜?_shared-layers 鏉＄洰锛? */

const fs = require('fs');
const path = require('path');

function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  try {
    const yaml = require('yaml');
    return yaml.parse(match[1]);
  } catch (e) {
    return fallbackParse(match[1]);
  }
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
    return str.map(s => `\`${s}\``).join(', ');
  }
  return str ? `\`${str}\`` : '鈥?;
}

function generateIndex(skillsByCategory) {
  // v5.3 category 鎺掑簭锛堟柊澧?review, test-design锛?  const order = [
    'onboard', 'sync', 'explore', 'propose', 'meta',
    'apply', 'skip', 'verify', 'archive', 'debug',
    'review', 'test-design'
  ];

  const navLinks = order
    .filter(c => skillsByCategory[c])
    .map(c => `[${c}](#${c})`)
    .join(' 路 ');

  let md = `---
name: _skill-index
description: 鎵€鏈?Skill 鐨勭储寮曠洰褰曘€傛寜 category 缁勭粐銆倂4.0銆?---

# Skill Index

> 鏈?index 鐢辩敓鎴愯剼鏈嚜鍔ㄧ淮鎶ゃ€傛墍鏈?Skill 蹇呴』閬靛惊 [SCHEMA.md](./SCHEMA.md) 瀹氫箟鐨勫厓鏁版嵁 schema銆?
## 蹇€熷鑸?
${navLinks}

---

`;

  for (const cat of order) {
    const skills = skillsByCategory[cat];
    if (!skills) continue;

    md += `## ${cat}\n\n`;

    for (const skill of skills) {
      md += `### ${skill.name}\n\n`;
      md += `${skill.description || ''}\n\n`;

      md += '| 灞炴€?| 鍊?|\n';
      md += '|------|----|\n';
      md += `| name | \`${skill.name}\` |\n`;
      md += `| category | \`${cat}\` |\n`;
      if (skill.version) md += `| version | \`${skill.version}\` |\n`;
      if (skill.tags) md += `| tags | ${escapeMd(skill.tags)} |\n`;
      if (skill.aliases) md += `| aliases | ${escapeMd(skill.aliases)} |\n`;
      if (skill.depends_on && skill.depends_on.length > 0) {
        md += `| depends_on | ${escapeMd(skill.depends_on)} |\n`;
      }
      md += '\n';

      if (skill.aliases && skill.aliases.length > 0) {
        md += '```bash\n';
        md += `${skill.aliases[0]}\n`;
        md += '```\n\n';
      }

      md += '---\n\n';
    }
  }

  md += `## 鎼滅储绀轰緥

### 鎸?category 鎼滅储

\`\`\`
onboard 鈫?openspec-onboard
apply   鈫?openspec-apply, openspec-continue
verify  鈫?openspec-verify
debug   鈫?openspec-debug
meta    鈫?openspec-plan, openspec-skill
\`\`\`

## 鐩稿叧鏂囦欢

- [SCHEMA.md](./SCHEMA.md) 鈥?鍙傛暟鍖栭厤缃鑼?- [SHARED-LAYERS.md](./SHARED-LAYERS.md) 鈥?Layer 鏄犲皠鍜岄獙璇佸懡浠?`;

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
      if (entry.isDirectory()) {
        const skillFile = path.join(fullPath, 'SKILL.md');
        if (fs.existsSync(skillFile)) {
          skillFiles.push(skillFile);
        } else if (entry.name !== '_shared') {
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
  console.log(`Generated: ${indexPath}`);
  console.log(`Found ${skillFiles.length} skills in ${Object.keys(skillsByCategory).length} categories`);
  for (const [cat, list] of Object.entries(skillsByCategory)) {
    console.log(`  ${cat}: ${list.map(s => s.name).join(', ')}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseFrontmatter, generateIndex };
