param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$GradleArgs
)

$ErrorActionPreference = "Stop"

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

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$androidDir = Join-Path $repoRoot "android"

if (-not (Test-Path $androidDir)) {
  throw "Android project not found at $androidDir. Run npm run android:twa:sync first."
}

$jdkHome = Get-Jdk17Home
$env:JAVA_HOME = $jdkHome
$env:PATH = "$jdkHome\bin;$env:PATH"

if (-not $GradleArgs -or $GradleArgs.Length -eq 0) {
  $GradleArgs = @("help")
}

Write-Host "Using JDK: $jdkHome"
Write-Host "Gradle command: .\\gradlew.bat $($GradleArgs -join ' ')"

Push-Location $androidDir
try {
  & .\gradlew.bat @GradleArgs
} finally {
  Pop-Location
}
