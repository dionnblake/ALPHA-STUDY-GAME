# AI Study Game Launcher
$ErrorActionPreference = "Stop"
$Proj = "C:\Users\ALPHA\Desktop\VIBE CODING PROJECTS\AI STUDY GAME WINDOWS 11"
$NodeExe = "C:\Program Files\nodejs\node.exe"
$ViteJs = "$Proj\node_modules\vite\bin\vite.js"
$TauriExe = "$Proj\src-tauri\target\debug\ai-study-game.exe"
$Port = 1430

Set-Location $Proj

# Check if Vite already running
$viteRunning = $false
try {
    $r = Invoke-WebRequest -Uri "http://localhost:$Port" -UseBasicParsing -TimeoutSec 2
    if ($r.StatusCode -eq 200) { $viteRunning = $true }
} catch {}

if (-not $viteRunning) {
    Write-Host "Starting Vite dev server..."
    $viteArgs = @($ViteJs, "--port", "$Port", "--strictPort")
    $viteProcess = Start-Process -FilePath $NodeExe -ArgumentList $viteArgs -WindowStyle Minimized -PassThru

    Write-Host "Waiting for dev server..."
    $maxWait = 15
    $waited = 0
    $ready = $false
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 1
        $waited++
        try {
            $r = Invoke-WebRequest -Uri "http://localhost:$Port" -UseBasicParsing -TimeoutSec 2
            if ($r.StatusCode -eq 200) { $ready = $true; break }
        } catch {}
    }
    if (-not $ready) {
        Write-Host "ERROR: Vite did not start within $maxWait seconds."
        Write-Host "Check that Node.js is installed and npm install has been run."
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "Vite is ready."
}

Write-Host "Launching Tauri app..."
Start-Process -FilePath $TauriExe -WindowStyle Normal