# clean-start.ps1
# Use this to rebuild your project while keeping your disk clean.

Write-Host "--- Stopping CIMR Project ---" -ForegroundColor Cyan
docker compose down

Write-Host "--- Cleaning up unused Docker layers and build cache ---" -ForegroundColor Yellow
# This removes all dangling images and build cache without deleting your volumes (database data)
docker system prune -f

Write-Host "--- Rebuilding and Starting Microservices ---" -ForegroundColor Green
# --build ensures your latest code changes are included
# -d runs it in the background
docker compose up --build -d

Write-Host "--- Done! Your project is running and your disk is clean. ---" -ForegroundColor Cyan
docker compose ps
