import { spawnSync, spawn } from 'node:child_process';

function runPowerShell(command) {
  const result = spawnSync(
    'powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command],
    { stdio: 'inherit' }
  );

  if (result.error) {
    console.warn('[dev:app] PowerShell command failed:', result.error.message);
  }
}

function cleanupStaleProcesses() {
  if (process.platform !== 'win32') {
    return;
  }

  const cwd = process.cwd().replace(/\\/g, '\\\\');

  // Stop existing app windows so Cargo can rebuild the executable.
  runPowerShell("Get-Process ai-study-game -ErrorAction SilentlyContinue | Stop-Process -Force");

  // Stop stale project-scoped Tauri/Cargo trees that can cause duplicate watchers/restarts.
  runPowerShell(`
    Get-CimInstance Win32_Process |
      Where-Object {
        ($_.Name -eq 'cargo.exe' -and $_.CommandLine -like '*${cwd}*') -or
        ($_.Name -eq 'node.exe' -and $_.CommandLine -like '*@tauri-apps\\\\cli\\\\tauri.js*dev*' -and $_.CommandLine -like '*${cwd}*') -or
        ($_.Name -eq 'cmd.exe'  -and $_.CommandLine -like '*npm run tauri dev*' -and $_.CommandLine -like '*${cwd}*')
      } |
      ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  `);

  // Stop stale project-scoped Vite dev servers without using Get-NetTCPConnection.
  // On some Windows setups that networking cmdlet can hang before Tauri starts.
  runPowerShell(`
    Get-CimInstance Win32_Process |
      Where-Object {
        $_.Name -eq 'node.exe' -and
        $_.CommandLine -like '*vite*' -and
        $_.CommandLine -like '*${cwd}*'
      } |
      ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  `);
}

cleanupStaleProcesses();

const child = spawn('npm run tauri dev', {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
