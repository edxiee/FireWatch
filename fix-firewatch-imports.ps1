param(
    [switch]$NoBuild
)

$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

$srcRoot = Join-Path $PSScriptRoot "src"

if (-not (Test-Path $srcRoot)) {
    throw "ERROR: src folder could not be found."
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " FireWatch Automatic Import Repair" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# --------------------------------------------------
# BACKUP
# --------------------------------------------------

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $PSScriptRoot ".import-fix-backup-$timestamp"

New-Item `
    -ItemType Directory `
    -Path $backupRoot `
    -Force | Out-Null

Write-Host "Backup folder:" -ForegroundColor DarkGray
Write-Host $backupRoot -ForegroundColor DarkGray
Write-Host ""

# --------------------------------------------------
# KNOWN FIREWATCH FILE LOCATIONS
# --------------------------------------------------

# These help when filenames were renamed slightly or moved far away.
$knownTargets = @{
    "firebase"           = "services\firebase.js"
    "firebase.js"        = "services\firebase.js"

    "App.css"            = "app\App.css"

    "ProtectedRoute"     = "components\routing\ProtectedRoute.jsx"
    "ProtectedRoute.jsx" = "components\routing\ProtectedRoute.jsx"

    # PowerShell hashtable keys are case-insensitive.
    # These entries also match AdminNavBar / AdminNavbar.
    "AdminNavbar"        = "components\navigation\AdminNavBar.jsx"
    "AdminNavbar.jsx"    = "components\navigation\AdminNavBar.jsx"

    # These also match UserNavBar / UserNavbar.
    "UserNavbar"         = "components\navigation\UserNavBar.jsx"
    "UserNavbar.jsx"     = "components\navigation\UserNavBar.jsx"
}

# --------------------------------------------------
# FILE COLLECTION
# --------------------------------------------------

$allProjectFiles = @(
    Get-ChildItem `
        -Path $srcRoot `
        -Recurse `
        -File
)

$sourceFiles = @(
    $allProjectFiles |
        Where-Object {
            $_.Extension -in @(
                ".js",
                ".jsx",
                ".ts",
                ".tsx"
            )
        }
)

Write-Host "React/JS files found: $($sourceFiles.Count)"
Write-Host ""

# --------------------------------------------------
# CHECK WHETHER AN IMPORT ALREADY EXISTS
# --------------------------------------------------

function Test-ImportExists {

    param(
        [System.IO.FileInfo]$SourceFile,
        [string]$ImportPath
    )

    # Packages such as firebase/auth or react-router-dom
    # are not local imports, so ignore them.
    if (-not $ImportPath.StartsWith(".")) {
        return $true
    }

    $normalizedImport = $ImportPath.Replace(
        "/",
        [System.IO.Path]::DirectorySeparatorChar
    )

    $candidate = Join-Path `
        $SourceFile.DirectoryName `
        $normalizedImport

    # Exact file exists
    if (Test-Path -LiteralPath $candidate -PathType Leaf) {
        return $true
    }

    # Import without extension
    $extensions = @(
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        ".css",
        ".json"
    )

    foreach ($extension in $extensions) {

        if (
            Test-Path `
                -LiteralPath "$candidate$extension" `
                -PathType Leaf
        ) {
            return $true
        }
    }

    # Directory/index imports
    foreach ($extension in @(".js", ".jsx", ".ts", ".tsx")) {

        $indexCandidate = Join-Path `
            $candidate `
            "index$extension"

        if (
            Test-Path `
                -LiteralPath $indexCandidate `
                -PathType Leaf
        ) {
            return $true
        }
    }

    return $false
}

# --------------------------------------------------
# FIND MOVED FILE
# --------------------------------------------------

function Find-ImportTarget {

    param(
        [string]$ImportPath
    )

    $leaf = Split-Path $ImportPath -Leaf

    # ------------------------------------------------
    # First check known FireWatch paths
    # ------------------------------------------------

    if ($knownTargets.ContainsKey($leaf)) {

        $knownPath = Join-Path `
            $srcRoot `
            $knownTargets[$leaf]

        if (Test-Path $knownPath -PathType Leaf) {
            return Get-Item $knownPath
        }
    }

    # ------------------------------------------------
    # Search by exact filename
    # ------------------------------------------------

    $extension = [System.IO.Path]::GetExtension($leaf)

    if ($extension) {

        $matches = @(
            $allProjectFiles |
                Where-Object {
                    $_.Name -ieq $leaf
                }
        )
    }
    else {

        $matches = @(
            $allProjectFiles |
                Where-Object {
                    $_.BaseName -ieq $leaf
                }
        )
    }

    if ($matches.Count -eq 1) {
        return $matches[0]
    }

    return $null
}

# --------------------------------------------------
# CALCULATE NEW RELATIVE IMPORT PATH
# --------------------------------------------------

function Get-NewRelativeImport {

    param(
        [string]$SourceFile,
        [string]$TargetFile
    )

    $sourceDirectory = Split-Path `
        $SourceFile `
        -Parent

    $sourceDirectory = (
        [System.IO.Path]::GetFullPath($sourceDirectory)
    ).TrimEnd(
        [System.IO.Path]::DirectorySeparatorChar
    )

    $sourceDirectory += [System.IO.Path]::DirectorySeparatorChar

    $targetFullPath = [System.IO.Path]::GetFullPath(
        $TargetFile
    )

    $sourceUri = New-Object System.Uri(
        $sourceDirectory
    )

    $targetUri = New-Object System.Uri(
        $targetFullPath
    )

    $relative = $sourceUri.MakeRelativeUri(
        $targetUri
    ).ToString()

    $relative = [System.Uri]::UnescapeDataString(
        $relative
    )

    # Always use forward slashes in JavaScript imports
    $relative = $relative.Replace("\", "/")

    if (-not $relative.StartsWith(".")) {
        $relative = "./$relative"
    }

    return $relative
}

# --------------------------------------------------
# REGEX PATTERNS
# --------------------------------------------------

# Example:
# import Something from "../old/location";
$fromPattern = '(?<prefix>\bfrom\s*["''])(?<path>\.{1,2}/[^"'']+)(?<suffix>["''])'

# Example:
# import "./Something.css";
$bareImportPattern = '(?<prefix>\bimport\s*["''])(?<path>\.{1,2}/[^"'']+)(?<suffix>["''])'

$patterns = @(
    $fromPattern,
    $bareImportPattern
)

# --------------------------------------------------
# REPAIR IMPORTS
# --------------------------------------------------

$changedFiles = @{}
$fixedImportCount = 0
$unresolvedImports = @()

foreach ($file in $sourceFiles) {

    $content = Get-Content `
        -LiteralPath $file.FullName `
        -Raw

    $originalContent = $content

    foreach ($pattern in $patterns) {

        $matches = [regex]::Matches(
            $content,
            $pattern
        )

        foreach ($match in $matches) {

            $importPath = $match.Groups["path"].Value

            # Import still works; leave it alone.
            if (
                Test-ImportExists `
                    -SourceFile $file `
                    -ImportPath $importPath
            ) {
                continue
            }

            # Find where the file moved.
            $target = Find-ImportTarget `
                -ImportPath $importPath

            if ($null -eq $target) {

                $unresolvedImports += [PSCustomObject]@{
                    File   = $file.FullName
                    Import = $importPath
                }

                continue
            }

            $newImport = Get-NewRelativeImport `
                -SourceFile $file.FullName `
                -TargetFile $target.FullName

            $newStatement = (
                $match.Groups["prefix"].Value +
                $newImport +
                $match.Groups["suffix"].Value
            )

            $content = $content.Replace(
                $match.Value,
                $newStatement
            )

            Write-Host "FIXED" -ForegroundColor Green -NoNewline
            Write-Host " $($file.Name)"
            Write-Host "      $importPath"
            Write-Host "   -> $newImport" -ForegroundColor Green
            Write-Host ""

            $fixedImportCount++
        }
    }

    # ------------------------------------------------
    # SAVE MODIFIED FILE
    # ------------------------------------------------

    if ($content -ne $originalContent) {

        $relativePath = $file.FullName.Substring(
            $srcRoot.Length
        )

        $relativePath = $relativePath -replace "^[\\/]+", ""

        $backupFile = Join-Path `
            $backupRoot `
            $relativePath

        $backupDirectory = Split-Path `
            $backupFile `
            -Parent

        New-Item `
            -ItemType Directory `
            -Path $backupDirectory `
            -Force | Out-Null

        Copy-Item `
            -LiteralPath $file.FullName `
            -Destination $backupFile `
            -Force

        Set-Content `
            -LiteralPath $file.FullName `
            -Value $content `
            -Encoding UTF8

        $changedFiles[$file.FullName] = $true
    }
}

# --------------------------------------------------
# RESULTS
# --------------------------------------------------

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " Import Repair Results" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Imports repaired : $fixedImportCount"
Write-Host "Files modified   : $($changedFiles.Count)"
Write-Host ""

# --------------------------------------------------
# REPORT IMPORTS THAT COULD NOT BE FIXED SAFELY
# --------------------------------------------------

if ($unresolvedImports.Count -gt 0) {

    Write-Host "Imports requiring manual review:" `
        -ForegroundColor Yellow

    Write-Host ""

    foreach ($problem in $unresolvedImports) {

        $shortPath = $problem.File.Replace(
            "$PSScriptRoot\",
            ""
        )

        Write-Host "$shortPath" -ForegroundColor Yellow
        Write-Host "    $($problem.Import)"
    }

    Write-Host ""
}
else {

    Write-Host "No unresolved local imports detected." `
        -ForegroundColor Green

    Write-Host ""
}

Write-Host "Backup saved at:"
Write-Host $backupRoot -ForegroundColor DarkGray
Write-Host ""

# --------------------------------------------------
# BUILD FIREWATCH
# --------------------------------------------------

if (-not $NoBuild) {

    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host " Running FireWatch Production Build" -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host ""

    & npm.cmd run build

    if ($LASTEXITCODE -eq 0) {

        Write-Host ""
        Write-Host "==============================================" -ForegroundColor Green
        Write-Host " FIREWATCH BUILD SUCCESSFUL" -ForegroundColor Green
        Write-Host "==============================================" -ForegroundColor Green
    }
    else {

        Write-Host ""
        Write-Host "==============================================" -ForegroundColor Yellow
        Write-Host " Build still has remaining errors." -ForegroundColor Yellow
        Write-Host " Review the errors shown above." -ForegroundColor Yellow
        Write-Host "==============================================" -ForegroundColor Yellow

        exit $LASTEXITCODE
    }
}