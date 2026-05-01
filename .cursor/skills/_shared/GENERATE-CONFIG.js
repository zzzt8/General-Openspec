/**
 * GENERATE-CONFIG.js — OpenSpec config.yaml 统一生成器 v5.3
 *
 * 用法:
 *   node .cursor/skills/_shared/GENERATE-CONFIG.js [options]
 *
 * 参数:
 *   --template <name>   生成模板: basic | monorepo | minimal | auto (默认: auto)
 *   --merge-existing    合并已有 config.yaml 的用户自定义字段 (所有字段，layers 除外)
 *   --dry-run           仅输出内容，不写入文件
 *   --output <path>     输出路径 (默认: openspec/config.yaml)
 *
 * 输入契约:
 *   - 依赖 yaml npm 包 (如未安装，使用 fallbackParse)
 *   - fallbackParse: 纯字符串解析，不依赖外部库
 *
 * v5.3 变更: 版本注释更新；增加 review, test-design category 支持。
 */

const fs = require('fs');
const path = require('path');

// ─── fallbackParse ────────────────────────────────────────────────────────────

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

// ─── YAML 解析 ────────────────────────────────────────────────────────────────

function parseYaml(filePath) {
  try {
    const yaml = require('yaml');
    const content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return yaml.parse(content);
  } catch (e) {
    const content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (match) {
      return fallbackParse(match[1]);
    }
    return fallbackParse(content);
  }
}

// ─── 项目结构检测 ────────────────────────────────────────────────────────────

function detectProjectStructure(cwd) {
  const result = {
    packageManager: 'npm',
    isMonorepo: false,
    layers: {
      engine: [],
      backend: [],
      editor: [],
      runtime: [],
      'ui-skin': []
    }
  };

  // 检测包管理器
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) {
    result.packageManager = 'pnpm';
  } else if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
    result.packageManager = 'yarn';
  } else if (fs.existsSync(path.join(cwd, 'bun.lockb'))) {
    result.packageManager = 'bun';
  }

  // 检测 monorepo
  if (fs.existsSync(path.join(cwd, 'pnpm-workspace.yaml')) ||
      fs.existsSync(path.join(cwd, 'lerna.json')) ||
      fs.existsSync(path.join(cwd, 'nx.json'))) {
    result.isMonorepo = true;
  }

  // 检测 layers 路径（常见约定）
  const knownPaths = {
    engine: [
      'packages/engine/src', 'packages/core/src', 'packages/shared/src',
      'packages/workflow-core/src', 'packages/image-ops/src', 'packages/node-definitions/src',
      'src/engine', 'packages/engine'
    ],
    backend: [
      'server/src', 'server/prisma',
      'apps/server/src', 'apps/api/src'
    ],
    editor: [
      'apps/editor/src', 'apps/dev-tool/src', 'packages/editor/src'
    ],
    runtime: [
      'apps/app/src', 'apps/user-app/src', 'packages/app/src'
    ],
    'ui-skin': [
      'packages/ui/src', 'packages/components/src', 'packages/shared-ui/src',
      'apps/ui/src'
    ]
  };

  for (const [layer, candidates] of Object.entries(knownPaths)) {
    for (const candidate of candidates) {
      if (fs.existsSync(path.join(cwd, candidate))) {
        // 尝试找到 src/ 目录
        const srcPath = path.join(cwd, candidate, 'src');
        const pkgPath = path.join(cwd, candidate);
        if (fs.existsSync(srcPath)) {
          result.layers[layer].push(candidate + '/');
        } else if (fs.statSync(pkgPath).isDirectory()) {
          result.layers[layer].push(candidate + '/');
        }
        break;
      }
    }
  }

  return result;
}

// ─── 配置模板 ────────────────────────────────────────────────────────────────

// 纯文本提取顶级单行字段值（用于 --merge-existing）
function extractField(content, fieldName) {
  if (!content) return null;
  const lines = content.split('\n');
  for (const line of lines) {
    const t = line.trim();
    // 顶级字段: 无缩进，格式 "fieldName: value"
    if (t.startsWith(fieldName + ':') && line.indexOf(':') === line.lastIndexOf(':')) {
      const val = t.split(':').slice(1).join(':').trim();
      if (val) return val;
    }
    // 遇到缩进的顶级字段行则停止
    if (!line.startsWith(' ') && t && t.includes(':')) break;
  }
  return null;
}

// v5.1: 智能差量合并 — 纯文本替换，仅更新 layers 块，其他字段原样保留
function mergeLayersIntoYaml(existingContent, newLayersSection) {
  // 查找 layers: 和 verify: 的行位置（两者之间的行即 layers 内容）
  let layersLine = -1;
  let verifyLine = -1;
  const allLines = existingContent.split('\n');
  for (let i = 0; i < allLines.length; i++) {
    const t = allLines[i].trim();
    if (t === 'layers:') { layersLine = i; }
    else if (t === 'verify:') { verifyLine = i; break; }
  }
  if (layersLine === -1) return existingContent;

  // verify 之前通常有一个空行，属于 layers 块的末尾，一并包含在替换范围内
  const endOfLayers = verifyLine > layersLine ? verifyLine - 1 : allLines.length;
  const newLines = [
    ...allLines.slice(0, layersLine + 1),          // schema...layers:
    ...newLayersSection.split('\n'),                 // 新 layers 内容
    ...allLines.slice(endOfLayers)                  // 空行 + verify...末尾
  ];
  return newLines.join('\n');
}

function buildLayersSection(layers) {
  const section = [];
  for (const [layer, paths] of Object.entries(layers)) {
    if (Array.isArray(paths) && paths.length > 0) {
      section.push(`  ${layer}:`);
      paths.forEach(p => section.push(`    - ${p}`));
    } else {
      section.push(`  ${layer}: []`);
    }
  }
  return section.join('\n');
}

const TEMPLATES = {
  // minimal 模板：生成不含 verify/rules/meta_rules 的最简配置
  minimal: (info, existingContent) => {
    const layersSection = buildLayersSection(info.layers);
    return `schema: ${existingContent ? extractField(existingContent, 'schema') || 'spec-driven' : 'spec-driven'}

# Layer 路径（按需填写）
layers:
${layersSection}

verify:
  default:
    typecheck: ${info.packageManager} typecheck
    test: ${info.packageManager} test

openspec:
  changes_dir: openspec/changes
  archive_dir: openspec/changes/archive
  specs_dir: openspec/specs
  schema_dir: openspec/schemas

package_manager: ${existingContent ? extractField(existingContent, 'package_manager') || info.packageManager : info.packageManager}
`;
  },

  // basic 模板：生成含各 layer verify 命令的配置
  basic: (info, existingContent) => {
    const layersSection = buildLayersSection(info.layers);
    return `schema: ${existingContent ? extractField(existingContent, 'schema') || 'spec-driven' : 'spec-driven'}

# Layer 路径（按需填写）
layers:
${layersSection}

verify:
  engine:
    typecheck: ${info.packageManager} typecheck --filter=@myproject/engine
    test: ${info.packageManager} test --filter=@myproject/engine
  backend:
    typecheck: ${info.packageManager} typecheck --filter=@myproject/server
    test: ${info.packageManager} test --filter=@myproject/server
  editor:
    typecheck: ${info.packageManager} typecheck --filter=@myproject/editor
    test: ${info.packageManager} test --filter=@myproject/editor
  runtime:
    typecheck: ${info.packageManager} typecheck --filter=@myproject/app
    test: ${info.packageManager} test --filter=@myproject/app
  'ui-skin':
    typecheck: ${info.packageManager} typecheck --filter=@myproject/ui
  default:
    typecheck: ${info.packageManager} typecheck
    test: ${info.packageManager} test

openspec:
  changes_dir: openspec/changes
  archive_dir: openspec/changes/archive
  specs_dir: openspec/specs
  schema_dir: openspec/schemas

package_manager: ${existingContent ? extractField(existingContent, 'package_manager') || info.packageManager : info.packageManager}
`;
  },

  // monorepo 模板：保留 layers 内容，嵌入 verify 命令
  monorepo: (info, existingContent) => {
    const layersSection = buildLayersSection(info.layers);
    return `schema: ${existingContent ? extractField(existingContent, 'schema') || 'spec-driven' : 'spec-driven'}

# Layer 路径（从 pnpm-workspace/nx/lerna 检测）
layers:
${layersSection}

verify:
  engine:
    typecheck: ${info.packageManager} typecheck --filter=@myproject/engine
    test: ${info.packageManager} test --filter=@myproject/engine
  backend:
    typecheck: ${info.packageManager} typecheck --filter=@myproject/server
    test: ${info.packageManager} test --filter=@myproject/server
  editor:
    typecheck: ${info.packageManager} typecheck --filter=@myproject/editor
    test: ${info.packageManager} test --filter=@myproject/editor
  runtime:
    typecheck: ${info.packageManager} typecheck --filter=@myproject/app
    test: ${info.packageManager} test --filter=@myproject/app
  'ui-skin':
    typecheck: ${info.packageManager} typecheck --filter=@myproject/ui
  default:
    typecheck: ${info.packageManager} typecheck
    test: ${info.packageManager} test

openspec:
  changes_dir: openspec/changes
  archive_dir: openspec/changes/archive
  specs_dir: openspec/specs
  schema_dir: openspec/schemas

package_manager: ${existingContent ? extractField(existingContent, 'package_manager') || info.packageManager : info.packageManager}
`;
  },

  auto: (info, existingContent) => {
    if (info.isMonorepo) {
      return TEMPLATES.monorepo(info, existingContent);
    }
    return TEMPLATES.basic(info, existingContent);
  }
};

// ─── diff 报告 ───────────────────────────────────────────────────────────────

function generateDiff(oldContent, newContent) {
  const oldLines = (oldContent || '').split('\n');
  const newLines = newContent.split('\n');
  const diff = [];

  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    const o = oldLines[i];
    const n = newLines[i];
    if (o === n) {
      diff.push(`  ${n}`);
    } else {
      if (o !== undefined) diff.push(`- ${o}`);
      if (n !== undefined) diff.push(`+ ${n}`);
    }
  }

  return diff.join('\n');
}

// ─── 主程序 ─────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);

  let template = 'auto';
  let mergeExisting = false;
  let dryRun = false;
  let outputPath = 'openspec/config.yaml';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--template':
        template = args[++i] || 'auto';
        break;
      case '--merge-existing':
        mergeExisting = true;
        break;
      case '--dry-run':
        dryRun = true;
        break;
      case '--output':
        outputPath = args[++i] || 'openspec/config.yaml';
        break;
      default:
        console.warn(`[GENERATE-CONFIG] 未知参数: ${args[i]}`);
    }
  }

  const cwd = process.cwd();
  const configPath = path.resolve(cwd, 'openspec/config.yaml');

  console.log('[GENERATE-CONFIG] 开始生成 config.yaml');
  console.log(`  模板: ${template}`);
  console.log(`  合并已有配置: ${mergeExisting}`);
  console.log(`  输出: ${outputPath}`);

  // 1. 读取已有配置（纯文本，用于差量合并）
  let existingContent = null;
  if (mergeExisting && fs.existsSync(configPath)) {
    existingContent = fs.readFileSync(configPath, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const schema = extractField(existingContent, 'schema');
    const pkgMgr = extractField(existingContent, 'package_manager');
    console.log(`  检测到已有配置，schema=${schema || '(未设置)'}, package_manager=${pkgMgr || '(未设置)'}`);
    console.log(`  保留所有字段，仅更新 layers 块`);
  }

  // 2. 检测项目结构
  const projectInfo = detectProjectStructure(cwd);
  console.log(`  检测到包管理器: ${projectInfo.packageManager}`);
  console.log(`  检测到 monorepo: ${projectInfo.isMonorepo}`);
  for (const [layer, paths] of Object.entries(projectInfo.layers)) {
    if (paths.length > 0) {
      console.log(`    ${layer}: ${paths.join(', ')}`);
    }
  }

  // 3. 生成配置
  let newContent;
  if (mergeExisting && existingContent) {
    // v5.1: 差量模式 — 保持原文件所有字段，只替换 layers 块
    const layersSection = buildLayersSection(projectInfo.layers);
    newContent = mergeLayersIntoYaml(existingContent, layersSection);
  } else {
    // 全新生成模式
    const templateFn = TEMPLATES[template] || TEMPLATES.auto;
    newContent = templateFn(projectInfo, null);
  }

  // 4. 输出 diff（如有已有配置）
  if (existingContent) {
    const diff = generateDiff(existingContent, newContent);
    console.log('\n--- config.yaml diff ---');
    console.log(diff);
    console.log('------------------------\n');
  } else {
    console.log('\n--- 新生成 config.yaml ---');
    console.log(newContent);
    console.log('--------------------------\n');
  }

  // 5. 写入文件
  if (!dryRun) {
    const outputFullPath = path.resolve(cwd, outputPath);
    const dir = path.dirname(outputFullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputFullPath, newContent, 'utf8');
    console.log(`[GENERATE-CONFIG] 已写入: ${outputFullPath}`);
  } else {
    console.log('[GENERATE-CONFIG] Dry-run 模式，未写入文件');
  }

  console.log('[GENERATE-CONFIG] 完成');
}

if (require.main === module) {
  main();
}

module.exports = {
  detectProjectStructure,
  parseYaml,
  fallbackParse,
  TEMPLATES,
  mergeLayersIntoYaml,
  buildLayersSection,
  extractField
};
