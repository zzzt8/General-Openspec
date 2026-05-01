#requires -Version 5.1
$ErrorActionPreference = 'SilentlyContinue'

# v4.1: 使用 BOM-less UTF-8 编码，避免 PowerShell 5.x 解析 BOM 为命令
# 修复 Bug #5: Cursor Write tool 保存为 UTF-8 BOM 时，-File 参数将 BOM 当作命令解析
# 解决方案：所有文件读写使用 [System.Text.Encoding]::UTF8（无 BOM）和 Out-File -Encoding utf8
$Utf8NoBom = New-Object System.Text.UTF8Encoding $false

# ─── Internal helpers (local config parsing, avoids external dependencies) ─────

function Get-ConfigRaw([string]$ConfigPath = "openspec/config.yaml") {
    if (-not (Test-Path $ConfigPath)) { return "" }
    $raw = Get-Content $ConfigPath -Raw -Encoding UTF8
    return $raw -replace "`r`n", "`n" -replace "`r", "`n"
}

function Get-AllLayerKeys([string]$ConfigPath = "openspec/config.yaml") {
    $raw = Get-ConfigRaw $ConfigPath
    $keys = @()
    $inLayers = $false
    $layersIndent = 0
    foreach ($ln in ($raw -split "`n")) {
        if ($ln -match '^(\s*)(\w+):\s*$') {
            $indent = $matches[1].Length
            $k = $matches[2]
            if ($k -eq "layers") {
                $inLayers = $true
                $layersIndent = $indent
                continue
            }
            if ($inLayers) {
                if ($indent -le $layersIndent) {
                    $inLayers = $false
                } else {
                    $keys += $k
                }
            }
        }
    }
    return $keys
}

# ─── Public health-check functions ────────────────────────────────────────────

function Test-CliAvailability {
    param([string]$CmdName)
    $exe = ($CmdName -split ' ')[0]
    $avail = $false
    $ver = $null
    try {
        $cmd = Get-Command -Name $exe -ErrorAction SilentlyContinue
        if ($cmd) {
            $avail = $true
            try {
                $vout = & $exe --version 2>$null
                if ($LASTEXITCODE -eq 0 -and $vout) {
                    $ver = ($vout -split "`n")[0].Trim()
                }
            } catch {
                Write-Verbose "[health-check] $exe version check failed: $_"
            }
        }
    } catch {
        Write-Verbose "[health-check] $exe availability check failed: $_"
    }
    return [PSCustomObject]@{ name = $CmdName; available = $avail; version = $ver }
}

function Test-SchemaValidity {
    param([string]$ConfigPath = "openspec/config.yaml")
    if (-not (Test-Path $ConfigPath)) {
        return [PSCustomObject]@{
            name = "schema-validity"
            status = "FAIL"
            detail = "config.yaml not found"
            available_schemas = @()
        }
    }
    $sname = "default"
    $raw = Get-ConfigRaw $ConfigPath
    foreach ($ln in ($raw -split "`n")) {
        if ($ln -match '^\s*schema:\s*(.+)$') {
            $sname = $matches[1].Trim()
            break
        }
    }
    $sdir = $ConfigPath -replace '[^/\\]+$', '' -replace '/$', ''
    if ($sdir) {
        $sdir = Join-Path $sdir "schemas\$sname"
    } else {
        $sdir = "openspec\schemas\$sname"
    }
    $sfile = Join-Path $sdir "schema.yaml"
    $dirOk = Test-Path $sdir
    $fileOk = Test-Path $sfile
    $allSchemas = @()
    $schemaRoot = Split-Path $ConfigPath -Parent
    if (-not $schemaRoot) { $schemaRoot = "." }
    $schemasDir = Join-Path $schemaRoot "schemas"
    if (Test-Path $schemasDir) {
        $allSchemas = (Get-ChildItem $schemasDir -Directory -ErrorAction SilentlyContinue).Name
    }
    if ($dirOk -and $fileOk) {
        return [PSCustomObject]@{
            name = "schema-validity"
            status = "PASS"
            detail = "schema=$sname OK"
            available_schemas = $allSchemas
        }
    } else {
        return [PSCustomObject]@{
            name = "schema-validity"
            status = "FAIL"
            detail = "schema=$sname missing"
            available_schemas = $allSchemas
        }
    }
}

function Test-ConfigIntegrity {
    param([string]$ConfigPath = "openspec/config.yaml")
    $req = @("schema", "package_manager")
    $fields = @{}
    $missing = @()
    $raw = Get-ConfigRaw $ConfigPath

    foreach ($f in $req) {
        $val = ""
        foreach ($ln in ($raw -split "`n")) {
            $pat = '^\s*' + [regex]::Escape($f) + ':\s*(.+)$'
            if ($ln -match $pat) {
                $val = $matches[1].Trim()
                break
            }
        }
        if ([string]::IsNullOrWhiteSpace($val)) {
            $missing += $f
            $fields[$f] = "MISSING"
        } else {
            $fields[$f] = $val
        }
    }
    $layersFound = $false
    foreach ($ln in ($raw -split "`n")) {
        if ($ln -match '^\s*layers:\s*$') {
            $layersFound = $true
            break
        }
    }
    if ($layersFound) {
        $fields["layers"] = "present"
    } else {
        $missing += "layers"
        $fields["layers"] = "MISSING"
    }

    if ($missing.Count -eq 0) {
        return [PSCustomObject]@{
            name = "config-integrity"
            status = "PASS"
            detail = "all required fields present"
        }
    } else {
        $missingStr = $missing -join ", "
        return [PSCustomObject]@{
            name = "config-integrity"
            status = "FAIL"
            detail = "missing: $missingStr"
        }
    }
}

function Test-LayerPaths {
    param(
        [string]$ConfigPath = "openspec/config.yaml",
        [bool]$FailOnMissing = $false
    )
    $total = 0
    $valid = 0
    $invalid = @()
    $raw = Get-ConfigRaw $ConfigPath

    if ($raw) {
        $inLayers = $false
        $layersIndent = 0
        $allLayers = Get-AllLayerKeys $ConfigPath

        foreach ($ln in ($raw -split "`n")) {
            if ($ln -match '^(\s*)layers:\s*$') {
                $inLayers = $true
                $layersIndent = $matches[1].Length
                continue
            }
            if ($inLayers -and $ln -match '^(\s*)(\w+):\s*$') {
                $indent = $matches[1].Length
                if ($indent -le $layersIndent) {
                    $inLayers = $false
                }
            }
            if ($inLayers) {
                if ($ln -match '^\s+-\s+(.+)') {
                    $path = $matches[1].Trim()
                    $total++
                    if (Test-Path $path) {
                        $valid++
                    } else {
                        $invalid += $path
                    }
                }
            }
        }
    }

    $status = "PASS"
    if ($invalid.Count -gt 0 -and $FailOnMissing) {
        $status = "FAIL"
    } elseif ($invalid.Count -gt 0 -and $valid -eq 0) {
        $status = "WARN"
    }
    $detailStr = "$valid/$total paths valid, $($invalid.Count) missing"
    return [PSCustomObject]@{
        name = "layer-paths"
        status = $status
        detail = $detailStr
    }
}

function Invoke-HealthCheck {
    [CmdletBinding()]
    param(
        [ValidateSet("table", "json")]
        [string]$Format = "json",

        [string[]]$Checks = @("all")
    )
    $results = @{
        timestamp = (Get-Date -Format "o")
        checks = @()
        summary = @{ total = 0; passed = 0; failed = 0; warnings = 0 }
    }

    if ($Checks -contains "all" -or $Checks -contains "cli-availability") {
        $clis = @()
        foreach ($cmd in @("node", "git", "openspec")) {
            $clis += Test-CliAvailability -CmdName $cmd
        }
        $availList = $clis | Where-Object { $_.available }
        $allAvail = $availList.Count -eq $clis.Count
        $st = if ($allAvail) { "PASS" } else { "FAIL" }
        $verMap = $availList | ForEach-Object { "$($_.name)=$($_.version)" }
        $detailStr = "$($availList.Count) tools available: $($verMap -join ', ')"
        $results.checks += [PSCustomObject]@{
            name = "cli-availability"
            status = $st
            detail = $detailStr
        }
        $results.summary.total++
        if ($allAvail) {
            $results.summary.passed++
        } else {
            $results.summary.failed++
        }
    }

    if ($Checks -contains "all" -or $Checks -contains "schema-validity") {
        $sr = Test-SchemaValidity
        $results.checks += $sr
        $results.summary.total++
        if ($sr.status -eq "PASS") {
            $results.summary.passed++
        } elseif ($sr.status -eq "FAIL") {
            $results.summary.failed++
        } else {
            $results.summary.warnings++
        }
    }

    if ($Checks -contains "all" -or $Checks -contains "config-integrity") {
        $cr = Test-ConfigIntegrity
        $results.checks += $cr
        $results.summary.total++
        if ($cr.status -eq "PASS") {
            $results.summary.passed++
        } elseif ($cr.status -eq "FAIL") {
            $results.summary.failed++
        } else {
            $results.summary.warnings++
        }
    }

    if ($Checks -contains "all" -or $Checks -contains "layer-paths") {
        $lr = Test-LayerPaths
        $results.checks += $lr
        $results.summary.total++
        if ($lr.status -eq "PASS") {
            $results.summary.passed++
        } elseif ($lr.status -eq "FAIL") {
            $results.summary.failed++
        } else {
            $results.summary.warnings++
        }
    }

    if ($Format -eq "json") {
        return $results | ConvertTo-Json -Depth 10
    } else {
        Write-Host ""
        Write-Host "=== OpenSpec Skill Health Check ===" -ForegroundColor Cyan
        Write-Host ("Timestamp: " + $results.timestamp)
        Write-Host ""
        foreach ($ck in $results.checks) {
            if ($ck.status -eq "PASS") { $color = "Green" }
            elseif ($ck.status -eq "FAIL") { $color = "Red" }
            elseif ($ck.status -eq "WARN") { $color = "Yellow" }
            else { $color = "White" }
            $d = [string]$ck.detail
            if ($d.Length -gt 77) { $d = $d.Substring(0, 74) + "..." }
            $line = ("{0,-28} {1,-8} {2}" -f $ck.name, $ck.status, $d)
            Write-Host $line -ForegroundColor $color
        }
        Write-Host ""
        Write-Host ("Summary: " + $results.summary.passed + " passed, " + $results.summary.failed + " failed, " + $results.summary.warnings + " warnings")
        Write-Host ""
    }
}

# ─── Auto-execute guard ──────────────────────────────────────────────────────
if ($MyInvocation.InvocationName -ne '.') {
    Invoke-HealthCheck -Format table
}
