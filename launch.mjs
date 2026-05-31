import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createWriteStream, existsSync } from 'node:fs';

const DIR = dirname(fileURLToPath(import.meta.url));
const VITE = resolve(DIR, 'node_modules/vite/bin/vite.js');
const EXE  = resolve(DIR, 'src-tauri/target/debug/ai-study-game.exe');
const PORT = 1430;
const LOG  = resolve(DIR, 'launch.log');

const log = createWriteStream(LOG, { flags: 'a' });
function write(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  log.write(line + '\n');
}

function isPortListening() {
  return new Promise(r => {
    const s = createConnection(PORT, '127.0.0.1');
    s.on('connect', () => { s.destroy(); r(true); });
    s.on('error',   () => { s.destroy(); r(false); });
  });
}

async function waitForPort(ms = 20000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    if (await isPortListening()) return true;
    await new Promise(r => setTimeout(r, 400));
  }
  return false;
}

async function main() {
  write('=== launch start ===');
  write('DIR=' + DIR);
  write('VITE=' + VITE + ' exists=' + existsSync(VITE));
  write('EXE=' + EXE + ' exists=' + existsSync(EXE));
  write('node=' + process.execPath);

  const already = await isPortListening();
  if (!already) {
    write('Port ' + PORT + ' free — spawning Vite');
    const vite = spawn(process.execPath, [VITE, '--port', String(PORT), '--strictPort'], {
      cwd: DIR,
      detached: true,
      stdio: ['ignore', createWriteStream(resolve(DIR, 'vite.log'), { flags: 'a' }), createWriteStream(resolve(DIR, 'vite.log'), { flags: 'a' })],
    });
    vite.on('error', e => write('vite spawn error: ' + e.message));
    vite.unref();
    write('Vite spawned pid=' + vite.pid + ', waiting for port...');
    const ready = await waitForPort(20000);
    if (!ready) {
      write('ERROR: Vite did not start in time — check vite.log');
      process.exit(1);
    }
    write('Port ' + PORT + ' is up');
  } else {
    write('Vite already running on port ' + PORT);
  }

  write('Launching EXE');
  const game = spawn(EXE, [], { cwd: DIR, detached: true, stdio: 'ignore' });
  game.on('error', e => write('exe spawn error: ' + e.message));
  game.unref();
  write('Done');
  log.end();
}

main().catch(e => { write('FATAL: ' + e); process.exit(1); });
