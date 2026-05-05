# Schema Preflight Step

> This step is referenced by openspec-apply and other skills. Execute when `opsx.gates.schema_preflight` is true (strict-review/enterprise profiles).

## Schema Exists Check

```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../_shared/_xplat.sh"

if ! test_schema_exists "openspec/config.yaml"; then
  echo "[opsx-apply] Schema 缺失，硬关卡触发。"
  echo "openspec/config.yaml 引用了 schema '$(get_schema_name "openspec/config.yaml")', 但目录不存在。"
  echo "排查：ls openspec/schemas/"
  echo "停止执行。"
  exit 1
fi
```

## Artifact Precondition Check

Only `tasks.md` is required. `review.md` and `test-design.md` (if present) are read as references but are NOT hard gates.

```bash
if [ ! -f "openspec/changes/<name>/tasks.md" ]; then
  echo "[opsx-apply] 缺少前置 artifact（tasks.md），请先完成 /opsx:propose 或 /opsx:plan"
  exit 1
fi
```

## Profile-Based Execution

Read the profile from config:

```bash
PROFILE=$(get_config_value "opsx.profile" "openspec/config.yaml" "core-light")
GATE_SCHEMA_PREFLIGHT=$(get_config_value "opsx.gates.schema_preflight" "openspec/config.yaml" "false")

if [ "$GATE_SCHEMA_PREFLIGHT" = "true" ]; then
  # Run schema prefight checks above
fi
```
