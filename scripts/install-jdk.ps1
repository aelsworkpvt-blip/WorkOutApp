param(
  [string]$MajorVersion = "21"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$api =
  "https://api.adoptium.net/v3/assets/latest/$MajorVersion/hotspot?os=windows&architecture=x64&image_type=jdk&jvm_impl=hotspot&heap_size=normal&vendor=eclipse"
$data = Invoke-RestMethod -Uri $api | Select-Object -First 1

$link = $data.binary.package.link
$checksum = $data.binary.package.checksum.ToLower()
$release = $data.release_name

$installRoot = Join-Path $env:LOCALAPPDATA "Programs\JDK"
$targetDir = Join-Path $installRoot ("Temurin-" + $release.Replace("+", "_"))
$zipPath = Join-Path $env:TEMP $data.binary.package.name

New-Item -ItemType Directory -Force -Path $installRoot | Out-Null

Invoke-WebRequest -Uri $link -OutFile $zipPath

$actualChecksum = (Get-FileHash -Algorithm SHA256 -Path $zipPath).Hash.ToLower()
if ($actualChecksum -ne $checksum) {
  throw "Checksum mismatch for downloaded JDK zip."
}

if (Test-Path $targetDir) {
  Remove-Item -Recurse -Force $targetDir
}

Expand-Archive -Path $zipPath -DestinationPath $installRoot -Force

$extractedDir = Get-ChildItem $installRoot -Directory |
  Where-Object { $_.Name -like "jdk-*" } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $extractedDir) {
  throw "Unable to locate extracted JDK directory."
}

if ($extractedDir.FullName -ne $targetDir) {
  Rename-Item -Path $extractedDir.FullName -NewName (Split-Path $targetDir -Leaf)
}

$javaHome = $targetDir
$javaBin = Join-Path $javaHome "bin"

[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "User")

$userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
if (-not $userPath) {
  $userPath = ""
}

$pathEntries = $userPath -split ";" | Where-Object { $_ }
if ($pathEntries -notcontains $javaBin) {
  $newPath = if ($userPath) { "$javaBin;$userPath" } else { $javaBin }
  [System.Environment]::SetEnvironmentVariable("Path", $newPath, "User")
}

Write-Output "JAVA_HOME=$javaHome"
Write-Output "JAVA_BIN=$javaBin"
& (Join-Path $javaBin "java.exe") -version
