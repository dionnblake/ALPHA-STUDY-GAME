@echo off
cd /d "C:\Users\ALPHA\Desktop\VIBE CODING PROJECTS\AI STUDY GAME WINDOWS 11"

echo Starting AI Study Game...
echo.

rem Check if Vite already running
powershell -NoProfile -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:1430' -UseBasicParsing -TimeoutSec 2; exit 0}catch{exit 1}"
if %errorlevel% equ 0 goto :launch

echo [1/3] Starting Vite dev server...
start /min "Vite Dev Server" "C:\Program Files\nodejs\node.exe" "node_modules\vite\bin\vite.js" --port 1430 --strictPort

echo [2/3] Waiting for server (up to 20 sec)...
powershell -NoProfile -Command "$i=0; while($i -lt 20){try{$r=Invoke-WebRequest -Uri 'http://localhost:1430' -UseBasicParsing -TimeoutSec 2; if($r.StatusCode -eq 200){exit 0}}catch{}; Start-Sleep 1; $i++}; exit 1"

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Dev server did not start. Check that npm install was run.
    pause
    exit /b 1
)

:launch
echo [3/3] Launching game window...
start "" "src-tauri\target\debug\ai-study-game.exe"
echo.
echo Game launched! Close this window or it will close automatically.
timeout /t 5 >nul