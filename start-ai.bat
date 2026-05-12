@echo off
echo Demarrage du service AI CIMR...
cd /d "%~dp0ai-agent-service"
start "" pythonw -m uvicorn app:app --host 0.0.0.0 --port 8000
echo Service AI demarre sur http://localhost:8000
timeout /t 2
