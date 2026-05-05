# Incremental Verification Step

> This step is referenced by openspec-apply. Executed after each task completes.

## Principle

Do NOT rely on the Agent's estimated `files` field. Use `git diff --name-only` to get the actual list of changed files after each task.

## Incremental File Detection

```bash
# At task start: record baseline
BASELINE=$(git rev-parse HEAD 2>/dev/null || echo "none")

# At task end: get changed files
if [ "$BASELINE" != "none" ]; then
  CHANGED_FILES=$(git diff --name-only $BASELINE...HEAD 2>/dev/null)
else
  CHANGED_FILES=$(git diff --name-only 2>/dev/null || echo "")
fi
```

## Compute Affected Layers

From `config.yaml` layers configuration (via xplat):

```bash
# Get affected layers based on changed files
AFFECTED_LAYERS=()
for file in $CHANGED_FILES; do
  for layer in engine backend editor runtime ui-skin meta; do
    # Read layer paths from config
    paths=$(get_layer_paths "$layer" "openspec/config.yaml")
    for p in $paths; do
      if [[ "$file" == "$p"* ]]; then
        AFFECTED_LAYERS+=("$layer")
        break 2
      fi
    done
  done
done
```

## Run Incremental Verification

```bash
# Deduplicate affected layers
UNIQUE_LAYERS=($(echo "${AFFECTED_LAYERS[@]}" | tr ' ' '\n' | sort -u | tr '\n' ' '))

for layer in "${UNIQUE_LAYERS[@]}"; do
  VERIFY_CMD=$(get_verify_command "$layer" "typecheck" "openspec/config.yaml")
  invoke_verify "$layer" "typecheck" "openspec/config.yaml"
  if [ $? -ne 0 ]; then
    echo "[opsx-apply] Incremental verify failed for layer: $layer"
    echo "Failing to: /opsx:debug"
    exit 1
  fi
done
```

## Verification Rules

- Incremental verification failure → stop immediately, go to `/opsx:debug`
- Do NOT accumulate errors until the end
- If git is unavailable → degrade to full verification
