@echo off
echo Cleaning up...
del /F /Q "src\components\ActivityPanel.tsx" >nul 2>&1
del /F /Q "src\components\FocusPanel.tsx" >nul 2>&1
del /F /Q "src\components\MasteryPanel.tsx" >nul 2>&1
del /F /Q "src\components\MissionList.tsx" >nul 2>&1
del /F /Q "src\components\StatsGrid.tsx" >nul 2>&1
del /F /Q "src\components\DashboardLayout.tsx" >nul 2>&1
del /F /Q "src\AppPremium.tsx" >nul 2>&1
del /F /Q "src\screens\AI STUDY GAME WINDOWS 11.code-workspace" >nul 2>&1
del /F /Q "dashboard_proto.html" >nul 2>&1
del /F /Q "quiz_proto.html" >nul 2>&1
del /F /Q "fix-aws.js" >nul 2>&1
del /F /Q "CreateDesktopIcon.bat" >nul 2>&1
del /F /Q "node-portable.zip" >nul 2>&1
del /F /Q "*.log" >nul 2>&1
del /F /Q "cleanup.mjs" >nul 2>&1
echo Done.
exit /b 0
