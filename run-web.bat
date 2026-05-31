@echo off
cd /d "C:\UsersALPHA\Desktop\VIBE CODING PROJECTS\AI STUDY GAME WINDOWS 11"
start "AI Study Game" "C:\UsersALPHA\Desktop\VIBE CODING PROJECTS\AI STUDY GAME WINDOWS 11\node\npm.cmd" run dev
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:1430'"
