# Script de compilation ultra-rapide sur l'hôte
$ROOT = Split-Path $PSScriptRoot -Parent
$MVN  = "$ROOT\tools\apache-maven-3.9.6\bin\mvn.cmd"

Write-Host "--- Compilation de tous les microservices (Vitesse Max Native) ---"
Push-Location "$ROOT\backend"
& "$MVN" clean package -DskipTests -B
Pop-Location

Write-Host ""
Write-Host "Compilation terminée ! Vous pouvez maintenant lancer Docker :"
Write-Host "docker compose up --build -d"
