param(
  [string]$OutputDir = "android",
  [string]$ManifestUrl
)

$ErrorActionPreference = "Stop"

function Import-DotEnv {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    return
  }

  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()

    if (-not $line -or $line.StartsWith("#")) {
      return
    }

    $parts = $line -split "=", 2

    if ($parts.Length -ne 2) {
      return
    }

    $name = $parts[0].Trim()
    $value = $parts[1].Trim()

    if ($value.StartsWith('"') -and $value.EndsWith('"')) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    if (-not (Test-Path "Env:$name")) {
      Set-Item -Path "Env:$name" -Value $value
    }
  }
}

function Get-AbsoluteUri {
  param(
    [string]$Value,
    [string]$Name
  )

  if (-not $Value) {
    throw "$Name must be set before running the TWA sync script."
  }

  try {
    $uri = [Uri]$Value
  } catch {
    throw "$Name must be a valid absolute URL. Received: $Value"
  }

  if (-not $uri.IsAbsoluteUri) {
    throw "$Name must be a valid absolute URL. Received: $Value"
  }

  return $uri
}

function Get-ManifestUrlFromAppUrl {
  param([Uri]$AppUri)

  return "$($AppUri.AbsoluteUri.TrimEnd('/'))/manifest.webmanifest"
}

function Get-StartUrlPath {
  param([Uri]$AppUri)

  $path = $AppUri.AbsolutePath

  if ([string]::IsNullOrWhiteSpace($path) -or $path -eq "/") {
    return "/"
  }

  return $path.TrimEnd("/")
}

function Rewrite-TwaManifestUrls {
  param(
    [string]$ManifestPath,
    [string]$BootstrapManifestUrl,
    [string]$ProductionManifestUrl
  )

  if (-not (Test-Path $ManifestPath)) {
    return $false
  }

  $bootstrapUri = Get-AbsoluteUri -Value $BootstrapManifestUrl -Name "ManifestUrl"
  $productionUri = Get-AbsoluteUri -Value $ProductionManifestUrl -Name "NEXT_PUBLIC_APP_URL"

  $productionOrigin = $productionUri.GetLeftPart([System.UriPartial]::Authority)
  $productionAppUrl = $productionUri.AbsoluteUri.TrimEnd("/") + "/"

  $manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
  $changed = $false

  if ($manifest.host -ne $productionUri.Authority) {
    $manifest.host = $productionUri.Authority
    $changed = $true
  }

  if ($manifest.webManifestUrl -ne $ProductionManifestUrl) {
    $manifest.webManifestUrl = $ProductionManifestUrl
    $changed = $true
  }

  if ($manifest.fullScopeUrl -ne $productionAppUrl) {
    $manifest.fullScopeUrl = $productionAppUrl
    $changed = $true
  }

  foreach ($shortcut in @($manifest.shortcuts)) {
    if (-not $shortcut.url) {
      continue
    }

    $shortcutUri = [Uri]$shortcut.url
    $shortcutPath = if ($shortcutUri.IsAbsoluteUri) {
      $shortcutUri.PathAndQuery
    } else {
      $shortcut.url
    }

    $targetShortcutUrl = "$productionOrigin$shortcutPath"

    if ($shortcut.url -ne $targetShortcutUrl) {
      $shortcut.url = $targetShortcutUrl
      $changed = $true
    }
  }

  if ($changed) {
    $manifest | ConvertTo-Json -Depth 100 | Set-Content -Path $ManifestPath
    Write-Host "Rewrote Bubblewrap manifest URLs to production origin: $productionOrigin"
    return $true
  }

  return $false
}

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $repoRoot

Import-DotEnv ".env"

if (-not $ManifestUrl -and $OutputDir -match "^https?://") {
  $ManifestUrl = $OutputDir
  $OutputDir = "android"
}

if (-not $env:NEXT_PUBLIC_APP_URL) {
  throw "NEXT_PUBLIC_APP_URL must be set before running the TWA sync script."
}

if (-not $env:ANDROID_PACKAGE_NAME) {
  throw "ANDROID_PACKAGE_NAME must be set before running the TWA sync script."
}

$productionAppUri = Get-AbsoluteUri -Value $env:NEXT_PUBLIC_APP_URL -Name "NEXT_PUBLIC_APP_URL"
$productionManifestUrl = Get-ManifestUrlFromAppUrl -AppUri $productionAppUri

if (-not $ManifestUrl) {
  $ManifestUrl = $productionManifestUrl
}

$env:TWA_APP_URL = $productionAppUri.AbsoluteUri
$env:TWA_HOST = $productionAppUri.Authority
$env:TWA_START_URL = Get-StartUrlPath -AppUri $productionAppUri
$env:TWA_PACKAGE_ID = $env:ANDROID_PACKAGE_NAME
$env:BUBBLEWRAP_DEBUG_LOG = Join-Path $repoRoot ".codex-bubblewrap.log"

if (Test-Path $env:BUBBLEWRAP_DEBUG_LOG) {
  Remove-Item $env:BUBBLEWRAP_DEBUG_LOG -Force
}

$bubblewrapJavaHome = $env:BUBBLEWRAP_JAVA_HOME

if (-not $bubblewrapJavaHome) {
  $candidate = Get-ChildItem (Join-Path $env:LOCALAPPDATA "Programs\JDK") -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "Temurin-jdk-17.*" } |
    Sort-Object Name |
    Select-Object -Last 1

  if ($candidate) {
    $bubblewrapJavaHome = $candidate.FullName
  }
}

if ($bubblewrapJavaHome) {
  $env:BUBBLEWRAP_JAVA_HOME = $bubblewrapJavaHome
  $env:JAVA_HOME = $bubblewrapJavaHome
  $env:PATH = "$bubblewrapJavaHome\bin;$env:PATH"
}

$javaVersionOutput = ""
try {
  $javaVersionOutput = (& java -version 2>&1 | Select-Object -First 1)
} catch {
  $javaVersionOutput = "Java not found in PATH."
}

Write-Host "Manifest URL: $ManifestUrl"
Write-Host "Production app URL: $($productionAppUri.AbsoluteUri)"
Write-Host "Android output directory: $OutputDir"
Write-Host "Detected Java: $javaVersionOutput"
if ($env:ANDROID_PACKAGE_NAME) {
  Write-Host "Android package: $($env:ANDROID_PACKAGE_NAME)"
}
Write-Host ""
Write-Host "Bubblewrap is configured to use JDK 17 for Android tooling compatibility."
Write-Host "The init prompts will default to the production host and configured package name."
Write-Host ""

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Push-Location $OutputDir
try {
  if (Test-Path "twa-manifest.json") {
    Write-Host "Existing TWA project detected. Running Bubblewrap update..."
    node ..\scripts\bubblewrap-runner.cjs update
  } else {
    Write-Host "No TWA project detected. Running Bubblewrap init..."
    node ..\scripts\bubblewrap-runner.cjs init --manifest $ManifestUrl
  }
} finally {
  Pop-Location
}

$twaManifestPath = Join-Path `
  -Path (Join-Path -Path $repoRoot -ChildPath $OutputDir) `
  -ChildPath "twa-manifest.json"
$rewroteManifestUrls = Rewrite-TwaManifestUrls `
  -ManifestPath $twaManifestPath `
  -BootstrapManifestUrl $ManifestUrl `
  -ProductionManifestUrl $productionManifestUrl

if ($rewroteManifestUrls) {
  Push-Location $OutputDir
  try {
    Write-Host "Refreshing Android project from the rewritten TWA manifest..."
    node ..\scripts\bubblewrap-runner.cjs update --skipVersionUpgrade
  } finally {
    Pop-Location
  }
}
