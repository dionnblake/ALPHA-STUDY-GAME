@echo off
setlocal
set "PROJECT=C:\UsersALPHA\Desktop\VIBE CODING PROJECTS\AI STUDY GAME WINDOWS 11"
set "APP_EXE=%PROJECT%\src-tauri\target\debug\ai-study-game.exe"
set "VITE_BAT=%PROJECT%\run-vite-dev.bat"

for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":1430 .*LISTENING"') do set "PORTPID=%%P"
if not defined PORTPID (
  start "AI Study Game Dev Server" /min cmd /c call "%VITE_BAT%"
  timeout /t 4 /nobreak >nul
)

start "AI Study Game" "%APP_EXE%"
endlocal
