$mavenVersion = "3.9.6"
$downloadUrl = "https://archive.apache.org/dist/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip"
$installDir = "$HOME\.maven"
$zipFile = "$installDir\maven.zip"

if (!(Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir
}

Write-Host "Downloading Maven $mavenVersion..."
Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile

Write-Host "Extracting Maven..."
Expand-Archive -Path $zipFile -DestinationPath $installDir -Force

$mavenBinDir = Get-ChildItem -Path "$installDir\apache-maven-*" | Select-Object -ExpandProperty FullName
$mavenBinPath = Join-Path $mavenBinDir "bin"

Write-Host "Setting Environment Variables..."
[Environment]::SetEnvironmentVariable("M2_HOME", $mavenBinDir, "User")
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$mavenBinPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$mavenBinPath", "User")
}

Write-Host "Maven installed successfully! Please restart your terminal."
Write-Host "Bin Path: $mavenBinPath"

Remove-Item $zipFile
