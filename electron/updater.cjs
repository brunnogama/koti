// OTA updater for the web UI (dist/). Downloads a signed-by-hash bundle from
// GitHub Releases into userData/web and makes the app load it instead of the
// copy embedded in the package. Native/Electron changes still need a new RPM.
const { app, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFile } = require('child_process');

const REPO = 'brunnogama/koti';
const LATEST_URL = `https://github.com/${REPO}/releases/latest/download`;

const webRoot = () => path.join(app.getPath('userData'), 'web');
const currentDir = () => path.join(webRoot(), 'current');
const metaFile = () => path.join(webRoot(), 'meta.json');

function cmp(a, b) {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
}

function readMeta() {
  try {
    return JSON.parse(fs.readFileSync(metaFile(), 'utf8'));
  } catch {
    return null;
  }
}

// Version of the UI that will actually be loaded.
function activeWebVersion() {
  const meta = readMeta();
  if (meta && fs.existsSync(path.join(currentDir(), 'index.html')) && cmp(meta.version, app.getVersion()) > 0) {
    return meta.version;
  }
  return app.getVersion();
}

// Path of index.html to load: downloaded UI if newer than the bundled one.
function resolveIndexHtml(bundledDir) {
  const meta = readMeta();
  const idx = path.join(currentDir(), 'index.html');
  if (meta && fs.existsSync(idx) && cmp(meta.version, app.getVersion()) > 0) return idx;
  return path.join(bundledDir, 'index.html');
}

async function fetchJson(url) {
  const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'koti-updater' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function checkForUpdate() {
  const info = await fetchJson(`${LATEST_URL}/version.json`);
  const current = activeWebVersion();
  return {
    current,
    latest: info.version,
    available: cmp(info.version, current) > 0,
    notes: info.notes || '',
  };
}

function run(cmd, args) {
  return new Promise((resolve, reject) =>
    execFile(cmd, args, (err, _o, stderr) => (err ? reject(new Error(stderr || err.message)) : resolve()))
  );
}

async function downloadAndInstall() {
  const info = await fetchJson(`${LATEST_URL}/version.json`);
  if (cmp(info.version, activeWebVersion()) <= 0) return { version: info.version, installed: false };

  const res = await fetch(`${LATEST_URL}/${info.file || 'koti-web.tar.gz'}`, {
    redirect: 'follow',
    headers: { 'User-Agent': 'koti-updater' },
  });
  if (!res.ok) throw new Error(`Falha ao baixar (HTTP ${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());

  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  if (!info.sha256 || hash !== String(info.sha256).toLowerCase()) {
    throw new Error('Verificação de integridade falhou (SHA-256 diferente). Atualização cancelada.');
  }

  fs.mkdirSync(webRoot(), { recursive: true });
  const tmpTar = path.join(webRoot(), 'download.tar.gz');
  const staging = path.join(webRoot(), 'staging');
  fs.writeFileSync(tmpTar, buf);
  fs.rmSync(staging, { recursive: true, force: true });
  fs.mkdirSync(staging, { recursive: true });
  await run('tar', ['-xzf', tmpTar, '-C', staging]);
  fs.rmSync(tmpTar, { force: true });

  if (!fs.existsSync(path.join(staging, 'index.html'))) {
    fs.rmSync(staging, { recursive: true, force: true });
    throw new Error('Pacote de atualização inválido (index.html ausente).');
  }

  // Swap atomically-ish: keep old one until the new one is in place.
  fs.rmSync(currentDir(), { recursive: true, force: true });
  fs.renameSync(staging, currentDir());
  fs.writeFileSync(metaFile(), JSON.stringify({ version: info.version, sha256: hash }));
  return { version: info.version, installed: true };
}

function registerUpdaterIpc(getWindow, bundledDir) {
  ipcMain.handle('koti:app-version', () => ({ shell: app.getVersion(), web: activeWebVersion() }));
  ipcMain.handle('koti:update-check', async () => {
    try {
      return { ok: true, ...(await checkForUpdate()) };
    } catch (e) {
      return { ok: false, error: `Não foi possível consultar atualizações: ${e.message}` };
    }
  });
  ipcMain.handle('koti:update-install', async () => {
    try {
      return { ok: true, ...(await downloadAndInstall()) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  ipcMain.handle('koti:update-apply', () => {
    const win = getWindow();
    if (win) win.loadFile(resolveIndexHtml(bundledDir));
  });
}

module.exports = { registerUpdaterIpc, resolveIndexHtml };
