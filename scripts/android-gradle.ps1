param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$GradleArgs
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

    Set-Item -Path "Env:$name" -Value $value
  }
}

function Get-Jdk17Home {
  $explicit = $env:BUBBLEWRAP_JAVA_HOME

  if ($explicit -and (Test-Path $explicit)) {
    return $explicit
  }

  $installRoot = Join-Path $env:LOCALAPPDATA "Programs\JDK"
  $candidate = Get-ChildItem $installRoot -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "Temurin-jdk-17.*" } |
    Sort-Object Name |
    Select-Object -Last 1

  if (-not $candidate) {
    throw "Could not find a Temurin JDK 17 installation under $installRoot. Run scripts/install-jdk.ps1 first."
  }

  return $candidate.FullName
}

function Get-AndroidSdkHome {
  $explicit = $env:ANDROID_HOME

  if ($explicit -and (Test-Path $explicit)) {
    return $explicit
  }

  $explicit = $env:ANDROID_SDK_ROOT

  if ($explicit -and (Test-Path $explicit)) {
    return $explicit
  }

  $bubblewrapConfigPath = Join-Path $env:USERPROFILE ".bubblewrap\config.json"

  if (Test-Path $bubblewrapConfigPath) {
    $bubblewrapConfig = Get-Content $bubblewrapConfigPath -Raw | ConvertFrom-Json

    if ($bubblewrapConfig.androidSdkPath -and (Test-Path $bubblewrapConfig.androidSdkPath)) {
      return $bubblewrapConfig.androidSdkPath
    }
  }

  $defaultSdkPath = Join-Path $env:USERPROFILE ".bubblewrap\android_sdk"

  if (Test-Path $defaultSdkPath) {
    return $defaultSdkPath
  }

  throw "Could not find an Android SDK installation. Bubblewrap should have installed one under $defaultSdkPath."
}

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$androidDir = Join-Path $repoRoot "android"

if (-not (Test-Path $androidDir)) {
  throw "Android project not found at $androidDir. Run npm run android:twa:sync first."
}

Import-DotEnv (Join-Path $androidDir ".env.keystore")

$jdkHome = Get-Jdk17Home
$androidSdkHome = Get-AndroidSdkHome
$env:JAVA_HOME = $jdkHome
$env:PATH = "$jdkHome\bin;$env:PATH"
$env:ANDROID_HOME = $androidSdkHome
$env:ANDROID_SDK_ROOT = $androidSdkHome

if (-not $GradleArgs -or $GradleArgs.Length -eq 0) {
  $GradleArgs = @("help")
}

Write-Host "Using JDK: $jdkHome"
Write-Host "Using Android SDK: $androidSdkHome"
Write-Host "Gradle command: .\\gradlew.bat $($GradleArgs -join ' ')"

Push-Location $androidDir
try {
  & .\gradlew.bat @GradleArgs
} finally {
  Pop-Location
}
