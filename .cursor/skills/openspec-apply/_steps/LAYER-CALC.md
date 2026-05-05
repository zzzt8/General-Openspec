# Layer Calculation Step

> This step is referenced by openspec-apply. Used to determine which layers are affected by a change.

## Layer Priority

From `config.yaml`, read `opsx.layers.priority`:

```
engine > backend > editor > runtime > ui-skin > meta
```

## Calculate Affected Layers

```bash
function compute_affected_layers() {
  local changed_files="$1"
  local config_file="$2"
  local layers=()
  local layer_priority=($(get_config_value "opsx.layers.priority" "$config_file" "engine backend editor runtime ui-skin meta"))

  for file in $changed_files; do
    for layer in "${layer_priority[@]}"; do
      # Get paths for this layer from config
      local paths=$(get_layer_paths "$layer" "$config_file")
      for p in $paths; do
        if [[ "$file" == "$p"* ]]; then
          layers+=("$layer")
          break 2
        fi
      done
    done
  done

  # Deduplicate while preserving priority order
  echo "$layers" | tr ' ' '\n' | sort -u | head -5
}
```

## Baseline Tracking

For each task, store the baseline commit ref in tasks.md:

```markdown
- [x] Task 1
  baseline_ref: abc1234

- [ ] Task 2
  baseline_ref:
```

This allows accurate `git diff` between task boundaries regardless of commit history.
