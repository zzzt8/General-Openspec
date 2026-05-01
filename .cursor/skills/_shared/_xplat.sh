#!/usr/bin/env bash
# =============================================================================
# OpenSpec Cross-Platform Abstraction Layer — Unix / Git Bash
# =============================================================================
# 提供跨平台一致的配置读取、命令检测、文件写入、layer 检测、验证执行接口。
# 所有 skill 在 Unix 环境下通过 source 引用此文件。
# 接口与 _xplat.ps1 完全对应。
#
# 使用方式:
#   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
#   source "$SCRIPT_DIR/_xplat.sh"
# =============================================================================

# ─── 内部工具 ────────────────────────────────────────────────────────────────

_xplat_err() { echo "[_xplat] $*" >&2; }
_xplat_log() { echo "[_xplat] $*" >&2; }

# ── get_config_value ──────────────────────────────────────────────────────────
# 从 config.yaml 读取指定 key 的值。
# 用法: value=$(get_config_value "package_manager" ["config.yaml"])
_xplat_get_config_value() {
    local key="${1:-}"
    local config_path="${2:-openspec/config.yaml}"

    if [ ! -f "$config_path" ]; then
        _xplat_log "config.yaml 不存在: $config_path"
        echo ""
        return
    fi

    # 使用 awk 实现多行 YAML 值读取（支持 inline 和多行列表）
    local value
    value=$(awk -v key="$key" '
    BEGIN { in_target=0; target_indent=0; depth=0 }
    /^[[:space:]]*#/ { next }
    /^[[:space:]]*$/ { next }

    {
        # 计算当前行缩进级别
        match($0, /^[[:space:]]*/)
        indent = RLENGTH

        # 检测 key: [value] 或 key:
        if (match($0, /^[[:space:]]*([^:]+):[[:space:]]*(.*)/, arr)) {
            k = arr[1]
            v = arr[2]

            if (k == key && !in_target) {
                # 找到目标 key
                if (v != "") {
                    # inline value
                    print v
                    exit
                }
                in_target = 1
                target_indent = indent
                next
            } else if (in_target && indent <= target_indent) {
                # 离开目标 section，停止
                in_target = 0
            }
        }

        if (in_target && match($0, /^[[:space:]]*-[[:space:]]+(.+)/, arr)) {
            print arr[1]
            next
        }
    }
    ' "$config_path" 2>/dev/null)

    if [ -z "$value" ]; then
        _xplat_log "未找到配置 key: $key"
    fi

    echo "$value"
}

# ── get_schema_name ───────────────────────────────────────────────────────────
_xplat_get_schema_name() {
    local config_path="${1:-openspec/config.yaml}"
    _xplat_get_config_value "schema" "$config_path"
}

# ── get_package_manager ───────────────────────────────────────────────────────
_xplat_get_package_manager() {
    local config_path="${1:-openspec/config.yaml}"
    local pkg
    pkg=$(_xplat_get_config_value "package_manager" "$config_path")
    echo "${pkg:-pnpm}"
}

# ── get_layer_paths ───────────────────────────────────────────────────────────
# 获取指定 layer 的路径列表。
# 用法: paths=($(get_layer_paths "engine" ["config.yaml"]))
_xplat_get_layer_paths() {
    local layer="${1:-}"
    local config_path="${2:-openspec/config.yaml}"

    if [ ! -f "$config_path" ]; then
        return
    fi

    awk -v layer="$layer" '
    /^[[:space:]]*#/ { next }
    /^[[:space:]]*$/ { next }

    {
        match($0, /^[[:space:]]*/)
        indent = RLENGTH

        match($0, /^[[:space:]]*([^:]+):[[:space:]]*/)
        key = substr($0, RSTART, RLENGTH-1)
        gsub(/^[[:space:]]+/, "", key)

        if (key == "layers") { next }

        if (!in_layer) {
            if (key == layer) {
                in_layer = 1
                layer_indent = indent
            }
            next
        }

        if (indent <= layer_indent && key != layer) {
            in_layer = 0
            next
        }

        if (in_layer && match($0, /^[[:space:]]+-[[:space:]]+(.+)/, arr)) {
            print arr[1]
        }
    }
    ' "$config_path" 2>/dev/null
}

# ── get_verify_command ────────────────────────────────────────────────────────
# 获取指定 layer 和验证类型的命令。
# 用法: cmd=$(get_verify_command "engine" "typecheck" ["config.yaml"])
_xplat_get_verify_command() {
    local layer="${1:-default}"
    local type="${2:-typecheck}"
    local config_path="${3:-openspec/config.yaml}"
    local pkg_mgr
    pkg_mgr=$(_xplat_get_package_manager "$config_path")

    if [ ! -f "$config_path" ]; then
        echo "$pkg_mgr $type"
        return
    fi

    local cmd
    cmd=$(awk -v layer="$layer" -v type="$type" '
    /^[[:space:]]*#/ { next }
    /^[[:space:]]*$/ { next }

    {
        match($0, /^[[:space:]]*/)
        indent = RLENGTH

        if (match($0, /^[[:space:]]*([^:]+):[[:space:]]*$/)) {
            key = substr($0, RSTART, RLENGTH-1)
            gsub(/^[[:space:]]+/, "", key)

            if (key == "verify") {
                in_verify = 1
                verify_indent = indent
                next
            }

            if (in_verify) {
                if (indent <= verify_indent) {
                    in_verify = 0
                    in_layer = 0
                } else if (!in_layer && key == layer) {
                    in_layer = 1
                    layer_indent = indent
                } else if (in_layer) {
                    if (indent <= layer_indent) {
                        in_layer = 0
                    } else if (key == type) {
                        # 找到目标
                        if (match($0, /^[[:space:]]*[^:]+:[[:space:]]+(.+)/, arr)) {
                            print arr[1]
                            exit
                        }
                    }
                }
            }
        }
    }
    ' "$config_path" 2>/dev/null)

    if [ -n "$cmd" ]; then
        echo "$cmd"
        return
    fi

    # 降级：尝试 default layer
    if [ "$layer" != "default" ]; then
        cmd=$(_xplat_get_verify_command "default" "$type" "$config_path")
        if [ -n "$cmd" ]; then
            echo "$cmd"
            return
        fi
    fi

    # 硬编码回退
    echo "$pkg_mgr $type"
}

# ── invoke_verify ─────────────────────────────────────────────────────────────
# 在指定 layer 上执行验证命令。
# 用法: invoke_verify "engine" "typecheck" ["config.yaml"]
_xplat_invoke_verify() {
    local layer="${1:-default}"
    local type="${2:-typecheck}"
    local config_path="${3:-openspec/config.yaml}"

    local cmd
    cmd=$(_xplat_get_verify_command "$layer" "$type" "$config_path")

    if [ -z "$cmd" ]; then
        _xplat_err "无法获取验证命令 (layer=$layer, type=$type)"
        return 1
    fi

    echo "[_xplat] 执行: $cmd"

    eval "$cmd"
    local exit_code=$?

    if [ $exit_code -ne 0 ]; then
        _xplat_err "验证失败 (exit $exit_code): $cmd"
        return 1
    fi

    echo "[_xplat] 验证通过: $cmd"
    return 0
}

# ── test_command_exists ──────────────────────────────────────────────────────
# 检测命令是否在 PATH 中可用。
# 用法: if test_command_exists "node"; then ...
_xplat_test_command_exists() {
    local cmd="${1:-}"
    [ -n "$cmd" ] || return 1
    command -v "$cmd" >/dev/null 2>&1
}

# ── write_file_from_template ─────────────────────────────────────────────────
# 将内容写入文件。
# 用法: write_file_from_template "$path" "$content"
_xplat_write_file_from_template() {
    local path="$1"
    local content="$2"

    local dir
    dir=$(dirname "$path")
    if [ -n "$dir" ] && [ ! -d "$dir" ]; then
        mkdir -p "$dir"
    fi

    echo "$content" > "$path"
}

# ── test_schema_exists ────────────────────────────────────────────────────────
# Schema Preflight 硬关卡检查。
# 用法: if test_schema_exists; then echo "OK"; fi
_xplat_test_schema_exists() {
    local config_path="${1:-openspec/config.yaml}"

    if [ ! -d "openspec" ]; then
        _xplat_err "OpenSpec 目录不存在。请先运行 openspec init 或 /opsx-onboard。"
        return 1
    fi

    local schema_name
    schema_name=$(_xplat_get_schema_name "$config_path")
    schema_name="${schema_name:-default}"

    if [ ! -d "openspec/schemas/$schema_name" ]; then
        _xplat_err "Schema 缺失: $schema_name"
        _xplat_err "可用 schemas: $(ls -1 openspec/schemas/ 2>/dev/null | tr '\n' ' ')"
        return 1
    fi

    if [ ! -f "openspec/schemas/$schema_name/schema.yaml" ]; then
        _xplat_err "Schema 定义文件缺失: openspec/schemas/$schema_name/schema.yaml"
        return 1
    fi

    return 0
}

# ── get_affected_layers ──────────────────────────────────────────────────────
# 根据改动文件列表计算受影响的 layers。
# 用法: layers=($(get_affected_layers "file1" "file2" "config.yaml"))
_xplat_get_affected_layers() {
    local config_path="${3:-openspec/config.yaml}"
    local layers_result=""

    local all_layers=("engine" "backend" "editor" "runtime" "ui-skin")

    for file in "$@"; do
        case "$file" in --config|-*) continue;; esac
        for layer in "${all_layers[@]}"; do
            local layer_paths
            layer_paths=$(get_layer_paths "$layer" "$config_path" 2>/dev/null)
            [ -z "$layer_paths" ] && continue

            while IFS= read -r p; do
                [ -z "$p" ] && continue
                case "$file" in
                    "$p" | "$p"/* | "$p"\\*)
                        layers_result="${layers_result}${layer} "
                        break
                        ;;
                esac
            done <<< "$layer_paths"
        done
    done

    if [ -n "$layers_result" ]; then
        printf '%s\n' "$layers_result" | tr ' ' '\n' | grep . | sort -u | tr '\n' ' '
        echo
    fi
}

# ── invoke_git_commit ────────────────────────────────────────────────────────
# 执行 git commit（git 可用时）。
# 用法: invoke_git_commit "message"
_xplat_git_commit() {
    local message="$1"

    if ! _xplat_test_command_exists "git" || [ ! -d ".git" ]; then
        _xplat_log "git 不可用，跳过 commit"
        return 0
    fi

    if git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
        _xplat_log "无改动，跳过 commit"
        return 0
    fi

    git add -A 2>/dev/null
    if git commit -m "$message" 2>&1; then
        _xplat_log "git commit 成功: $message"
        return 0
    else
        _xplat_err "git commit 失败"
        return 1
    fi
}

# ── get_git_changed_files ────────────────────────────────────────────────────
# 获取最近 N 次 commit 改动的文件列表。
# 用法: files=($(get_git_changed_files 1))
_xplat_get_git_changed_files() {
    local depth="${1:-1}"

    if ! _xplat_test_command_exists "git" || [ ! -d ".git" ]; then
        return
    fi

    git diff --name-only "HEAD~$depth" HEAD 2>/dev/null
}

# ── test_file_exists ─────────────────────────────────────────────────────────
# 检测文件是否存在。
# 用法: if test_file_exists "path/to/file"; then ...
_xplat_test_file_exists() {
    local path="${1:-}"
    [ -n "$path" ] && [ -f "$path" ]
}

# ── get_git_status ──────────────────────────────────────────────────────────
# 获取 git 工作区状态。
# 用法: status=$(get_git_status)
_xplat_get_git_status() {
    if _xplat_test_command_exists "git" && [ -d ".git" ]; then
        git status --porcelain
    fi
}

# ─── 公开 API 别名（兼容旧命名） ─────────────────────────────────────────────

get_config_value()     { _xplat_get_config_value "$@"; }
get_schema_name()       { _xplat_get_schema_name "$@"; }
get_package_manager()   { _xplat_get_package_manager "$@"; }
get_layer_paths()      { _xplat_get_layer_paths "$@"; }
get_verify_command()   { _xplat_get_verify_command "$@"; }
invoke_verify()         { _xplat_invoke_verify "$@"; }
test_command_exists()   { _xplat_test_command_exists "$@"; }
test_file_exists()      { _xplat_test_file_exists "$@"; }
write_file_from_template() { _xplat_write_file_from_template "$@"; }
test_schema_exists()    { _xplat_test_schema_exists "$@"; }
invoke_git_commit()     { _xplat_git_commit "$@"; }
get_git_changed_files() { _xplat_get_git_changed_files "$@"; }
get_git_status()       { _xplat_get_git_status "$@"; }
