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

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $repoRoot

Import-DotEnv ".env"

if (-not $env:ANDROID_PACKAGE_NAME) {
  throw "ANDROID_PACKAGE_NAME must be set."
}

if (-not $env:ANDROID_SHA256_CERT_FINGERPRINTS) {
  throw "ANDROID_SHA256_CERT_FINGERPRINTS must be set."
}

$fingerprints = $env:ANDROID_SHA256_CERT_FINGERPRINTS.Split(",") `
  | ForEach-Object { $_.Trim() } `
  | Where-Object { $_ }

$payload = @(
  @{
    relation = @("delegate_permission/common.handle_all_urls")
    target = @{
      namespace = "android_app"
      package_name = $env:ANDROID_PACKAGE_NAME
      sha256_cert_fingerprints = @($fingerprints)
    }
  }
)

ConvertTo-Json -InputObject $payload -Depth 5
