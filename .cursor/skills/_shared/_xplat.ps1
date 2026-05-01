#requires -Version 5.1
<#
.SYNOPSIS
    OpenSpec Cross-Platform Abstraction Layer — Windows PowerShell
.DESCRIPTION
    提供跨平台一致的配置读取、命令检测、文件写入、layer 检测、验证执行接口。
    所有 skill 在 Windows 环境下通过 source 引用此文件。
    接口与 _xplat.sh 完全对应。
.NOTES
    source 方式: . .\_shared\_xplat.ps1
    依赖: PowerShell 5.1+
#>

# ─── 内部工具 ────────────────────────────────────────────────────────────────

# NOTE: This file is for reference. On Windows, these functions are
# called automatically by the Skill system. Do not source this file manually.
# For manual testing on Windows, translate bash && to ; in chained commands.

function Get-ConfigValue([string]$Key, [string]$ConfigPath = "openspec/config.yaml") {
    <#
    .SYNOPSIS
        从 openspec/config.yaml 读取指定 key 的值。
    .PARAMETER Key
        配置键名（支持点号路径，如 "package_manager"）
    .PARAMETER ConfigPath
        config.yaml 路径，默认 "openspec/config.yaml"
    .OUTPUTS
        string — 读取到的值，找不到返回空字符串
    #>
    if (-not (Test-Path $ConfigPath)) {
        Write-Verbose "[_xplat] config.yaml 不存在: $ConfigPath"
        return ""
    }

    $lines = Get-Content $ConfigPath -Raw -Encoding UTF8
    $lines = $lines -replace '\r\n', "`n" -replace '\r', "`n"

    # 支持嵌套 key（如 openspec.changes_dir）
    $parts = $Key -split '\.'
    $currentIndent = 0
    $inSection = $false
    $sectionIndent = 0

    foreach ($line in ($lines -split "`n")) {
        if ($line -match '^(\s*)(\w+):\s*(.*)$') {
            $indent = $matches[1].Length
            $k = $matches[2]
            $v = $matches[3].Trim()

            if ($parts.Count -eq 1 -and $k -eq $Key) {
                return $v
            }

            if ($parts.Count -gt 1 -and $k -eq $parts[0]) {
                # 进入子 section，收集其下值
                $sectionIndent = $indent
                $currentIndent = $indent
                $inSection = $true
                $v = $v -replace '^\s*', ''

                if ($v.Length -gt 0) {
                    # inline value，如 "schema: spec-driven"（罕见）
                    $remainingKey = ($parts[1..($parts.Count-1)]) -join '.'
                    if ($remainingKey -eq $Key) {
                        return $v
                    }
                }
                continue
            }

            if ($inSection) {
                if ($indent -le $sectionIndent -and $k -ne $parts[0]) {
                    $inSection = $false
                } else {
                    # 在 section 内，匹配剩余路径
                    $remainingKey = ($parts[1..($parts.Count-1)]) -join '.'
                    if ($k -eq $remainingKey) {
                        return $v
                    }
                }
            }
        }
    }

    Write-Verbose "[_xplat] 未找到配置 key: $Key"
    return ""
}

function Get-SchemaName([string]$ConfigPath = "openspec/config.yaml") {
    return Get-ConfigValue "schema" $ConfigPath
}

function Get-PackageManager([string]$ConfigPath = "openspec/config.yaml") {
    $pkg = Get-ConfigValue "package_manager" $ConfigPath
    return if ($pkg) { $pkg } else { "pnpm" }
}

function Get-LayerPaths([string]$Layer, [string]$ConfigPath = "openspec/config.yaml") {
    <#
    .SYNOPSIS
        获取指定 layer 的路径列表。
    .OUTPUTS
        string[] — 路径数组
    #>
    if (-not (Test-Path $ConfigPath)) {
        Write-Verbose "[_xplat] config.yaml 不存在"
        return @()
    }

    $lines = Get-Content $ConfigPath -Raw -Encoding UTF8
    $lines = $lines -replace '\r\n', "`n" -replace '\r', "`n"

    $inLayer = $false
    $layerIndent = 0
    $paths = @()

    foreach ($line in ($lines -split "`n")) {
        if ($line -match '^(\s*)(\w+):\s*$') {
            $indent = $matches[1].Length
            $k = $matches[2]

            if ($k -eq "layers") {
                continue
            }

            if (-not $inLayer) {
                if ($k -eq $Layer) {
                    $inLayer = $true
                    $layerIndent = $indent
                }
                continue
            }

            if ($inLayer -and $indent -le $layerIndent) {
                $inLayer = $false
            }
        } elseif ($inLayer -and $line -match '^\s+-\s+(.+)') {
            $paths += $matches[1].Trim()
        }
    }

    return $paths
}

function Get-VerifyCommand([string]$Layer, [string]$Type = "typecheck", [string]$ConfigPath = "openspec/config.yaml") {
    <#
    .SYNOPSIS
        获取指定 layer 和验证类型的命令。
    .PARAMETER Layer
        Layer 名称（如 "engine"、"default"）
    .PARAMETER Type
        验证类型（如 "typecheck"、"test"）
    .PARAMETER ConfigPath
        config.yaml 路径
    .OUTPUTS
        string — 完整验证命令，找不到使用默认值
    #>
    $pkgMgr = Get-PackageManager $ConfigPath

    if (-not (Test-Path $ConfigPath)) {
        return "$pkgMgr $Type"
    }

    $lines = Get-Content $ConfigPath -Raw -Encoding UTF8
    $lines = $lines -replace '\r\n', "`n" -replace '\r', "`n"

    $inVerify = $false
    $inLayer = $false
    $layerIndent = 0
    $verifyIndent = 0

    foreach ($line in ($lines -split "`n")) {
        if ($line -match '^(\s*)(\w+):\s*$') {
            $indent = $matches[1].Length
            $k = $matches[2]

            if ($k -eq "verify") {
                $inVerify = $true
                $verifyIndent = $indent
                continue
            }

            if ($inVerify) {
                if ($indent -le $verifyIndent) {
                    # 离开 verify section
                    $inVerify = $false
                    $inLayer = $false
                } elseif (not $inLayer -and $k -eq $Layer) {
                    $inLayer = $true
                    $layerIndent = $indent
                } elseif ($inLayer) {
                    if ($indent -le $layerIndent) {
                        $inLayer = $false
                    } elseif ($k -eq $Type) {
                        return $line.Substring($line.IndexOf(':') + 1).Trim()
                    }
                }
            }
        } elseif ($inLayer -and $line -match "^\s+$Type:\s+(.+)") {
            return $matches[1].Trim()
        }
    }

    # 降级：尝试 default layer
    if ($Layer -ne "default") {
        $defaultCmd = Get-VerifyCommand "default" $Type $ConfigPath
        if ($defaultCmd) { return $defaultCmd }
    }

    # 硬编码回退
    return "$pkgMgr $Type"
}

function Invoke-Verify([string]$Layer = "default", [string]$Type = "typecheck", [string]$ConfigPath = "openspec/config.yaml") {
    <#
    .SYNOPSIS
        在指定 layer 上执行验证命令。
    .OUTPUTS
        bool — 验证是否通过
    #>
    $cmd = Get-VerifyCommand $Layer $Type $ConfigPath
    if (-not $cmd) {
        Write-Host "[_xplat] 无法获取验证命令 (layer=$Layer, type=$Type)"
        return $false
    }

    Write-Host "[_xplat] 执行: $cmd"

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = if ($IsWindows -or $env:OS -eq "Windows_NT") { "cmd.exe" } else { "/bin/sh" }
    $psi.Arguments = if ($IsWindows -or $env:OS -eq "Windows_NT") { "/c $cmd" } else { "-c $cmd" }
    $psi.WorkingDirectory = $PWD.Path
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $psi
    $process.Start() | Out-Null

    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()

    $exitCode = $process.ExitCode

    if ($stdout) { Write-Host $stdout }
    if ($stderr) { Write-Host $stderr -ForegroundColor Yellow }

    if ($exitCode -ne 0) {
        Write-Host "[_xplat] 验证失败 (exit $exitCode): $cmd" -ForegroundColor Red
        return $false
    }

    Write-Host "[_xplat] 验证通过: $cmd" -ForegroundColor Green
    return $true
}

function Test-CommandExists([string]$Cmd) {
    <#
    .SYNOPSIS
        检测命令是否在 PATH 中可用。
    .OUTPUTS
        bool
    #>
    if ([string]::IsNullOrWhiteSpace($Cmd)) { return $false }

    # PowerShell 原生命令检测
    $exe = ($Cmd -split '\s')[0]
    if ((Get-Command $exe -ErrorAction SilentlyContinue)) {
        return $true
    }

    # 尝试 where.exe（Windows）
    try {
        $result = & where.exe $exe 2>$null
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Write-FileFromTemplate([string]$Path, [string]$Content) {
    <#
    .SYNOPSIS
        将内容写入文件（含 UTF-8 BOM，确保跨 editor 兼容性）。
    #>
    $dir = Split-Path $Path -Parent
    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    # 使用 BOM-less UTF-8（避免 YAML 解析问题）
    [System.IO.File]::WriteAllText((Resolve-Path $Path -ErrorAction SilentlyContinue).Path, $Content, [System.Text.Encoding]::UTF8)
}

function Test-SchemaExists([string]$ConfigPath = "openspec/config.yaml") {
    <#
    .SYNOPSIS
        Schema Preflight 硬关卡检查。
    .OUTPUTS
        bool — 检查是否通过
    #>
    if (-not (Test-Path "openspec")) {
        Write-Host "[_xplat] OpenSpec 目录不存在。请先运行 openspec init 或 /opsx-onboard。" -ForegroundColor Red
        return $false
    }

    $schemaName = Get-SchemaName $ConfigPath
    if (-not $schemaName) { $schemaName = "default" }

    $schemaDir = Join-Path $PWD.Path "openspec" "schemas" $schemaName
    if (-not (Test-Path $schemaDir)) {
        Write-Host "[_xplat] Schema 缺失: $schemaName (目录不存在)" -ForegroundColor Red
        Write-Host "可用 schemas: $(Get-ChildItem openspec/schemas -Directory -ErrorAction SilentlyContinue | ForEach-Object { $_.Name } -Join ', ')"
        return $false
    }

    if (-not (Test-Path (Join-Path $schemaDir "schema.yaml"))) {
        Write-Host "[_xplat] Schema 定义文件缺失: $schemaDir/schema.yaml" -ForegroundColor Red
        return $false
    }

    return $true
}

function Get-AffectedLayers([string[]]$ChangedFiles, [string]$ConfigPath = "openspec/config.yaml") {
    <#
    .SYNOPSIS
        根据改动文件列表计算受影响的 layers。
    .OUTPUTS
        string[] — layer 名称数组
    #>
    $layers = [System.Collections.Generic.HashSet[string]]::new()
    $layerDefs = @{}

    # 读取 layers 配置
    $allLayers = @("engine", "backend", "editor", "runtime", "ui-skin", "meta")
    foreach ($l in $allLayers) {
        $paths = Get-LayerPaths $l $ConfigPath
        if ($paths) {
            $layerDefs[$l] = $paths
        }
    }

    foreach ($file in $ChangedFiles) {
        $fileNorm = $file -replace '\\', '/'
        foreach ($layer in $layerDefs.Keys) {
            foreach ($p in $layerDefs[$layer]) {
                $pNorm = $p -replace '\\', '/'
                if ($fileNorm.StartsWith($pNorm)) {
                    [void]$layers.Add($layer)
                    break
                }
            }
        }
    }

    if ($layers.Count -eq 0) {
        return @("default")
    }
    return @($layers)
}

function Invoke-GitCommit([string]$Message) {
    <#
    .SYNOPSIS
        执行 git commit（git 可用时）。
    .OUTPUTS
        bool — 是否成功或 git 不可用
    #>
    if (-not (Test-CommandExists "git") -or -not (Test-Path ".git")) {
        Write-Verbose "[_xplat] git 不可用，跳过 commit"
        return $true
    }

    try {
        # 检查是否有未提交的改动（同时检查 working tree 和 staged）
        $workingDirty = -not (git diff --quiet 2>$null)
        $stagedFiles = git diff --name-only --cached 2>$null
        if (-not $workingDirty -and [string]::IsNullOrWhiteSpace($stagedFiles)) {
            Write-Verbose "[_xplat] 无改动，跳过 commit"
            return $true
        }

        # 自动 add 所有改动
        git add -A 2>$null

        $result = git commit -m $Message 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[_xplat] git commit 失败: $result" -ForegroundColor Yellow
            return $false
        }

        Write-Host "[_xplat] git commit 成功: $Message" -ForegroundColor Green
        return $true
    } catch {
        Write-Verbose "[_xplat] git commit 出错: $_"
        return $true  # 非阻塞，不阻断流程
    }
}

function Get-GitChangedFiles([int]$Depth = 1) {
    <#
    .SYNOPSIS
        获取最近 N 次 commit 改动的文件列表。
    .OUTPUTS
        string[] — 文件路径数组
    #>
    if (-not (Test-CommandExists "git") -or -not (Test-Path ".git")) {
        return @()
    }

    try {
        $output = git diff --name-only "HEAD~$Depth" HEAD 2>$null
        if ($LASTEXITCODE -ne 0) { return @() }
        return ($output -split "`n").Where({ $_ }) | ForEach-Object { $_.Trim() }
    } catch {
        return @()
    }
}

function Test-FileExists([string]$Path) {
    <#
    .SYNOPSIS
        检测文件是否存在。
    .OUTPUTS
        bool
    #>
    if ([string]::IsNullOrWhiteSpace($Path)) { return $false }
    return Test-Path $Path
}

function Get-GitStatus {
    <#
    .SYNOPSIS
        获取 git 工作区状态。
    .OUTPUTS
        string — git status --porcelain 输出
    #>
    if (-not (Test-CommandExists "git") -or -not (Test-Path ".git")) {
        return ""
    }

    try {
        return git status --porcelain 2>$null
    } catch {
        return ""
    }
}

# ─── 导出公开 API ─────────────────────────────────────────────────────────────

# 为方便调用，将所有函数设为全局可见
# （PowerShell 中 source 后函数自动在当前 scope 可用）
