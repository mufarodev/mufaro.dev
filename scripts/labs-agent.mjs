// Resource collector for the hero "labs" widget. No dependencies; Node 20+ or Bun.
//
//   LABS_TOKEN=... LAB_ID=vm HOST=127.0.0.1 PEER_URL=http://<tailnet-ip>:9477/ node scripts/labs-agent.mjs
//
// Every box runs this. A box with PEER_URL set also merges the peers' snapshots into its own,
// so the site only has to talk to one machine. Output is percentages and online flags only:
// no hostnames, addresses, kernel versions or process names ever leave the machine.
import { execFile } from 'node:child_process';
import { createHash, timingSafeEqual } from 'node:crypto';
import { readFileSync, statfsSync } from 'node:fs';
import { createServer } from 'node:http';

const TOKEN = process.env.LABS_TOKEN ?? '';
const ID = process.env.LAB_ID ?? 'lab';
const HOST = process.env.HOST ?? '127.0.0.1'; // bind to loopback or one tailnet IP, never 0.0.0.0
const PORT = Number(process.env.PORT ?? 9477);
const PEERS = (process.env.PEER_URL ?? '').split(',').filter(Boolean);
const STEP = 5000;
const HISTORY = 48; // 4 minutes at 5s, so the charts have shape on first paint
const STALE = STEP * 4;

if (TOKEN.length < 24) throw new Error('LABS_TOKEN must be at least 24 characters');

const hash = (value) => createHash('sha256').update(value).digest();
const tokenHash = hash(TOKEN);
const pct = (value) => Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
const push = (list, value) => {
	list.push(value);
	if (list.length > HISTORY) list.shift();
};

// --- sampling -----------------------------------------------------------------------------
let lastCpu = null;
function cpu() {
	const [, ...fields] = readFileSync('/proc/stat', 'utf8').split('\n')[0].split(/\s+/);
	const values = fields.map(Number);
	const total = values.reduce((sum, value) => sum + value, 0);
	const idle = values[3] + (values[4] ?? 0);
	const previous = lastCpu;
	lastCpu = { total, idle };
	if (!previous || total === previous.total) return 0;
	return pct((1 - (idle - previous.idle) / (total - previous.total)) * 100);
}

function memory() {
	const info = Object.fromEntries(
		readFileSync('/proc/meminfo', 'utf8')
			.split('\n')
			.map((line) => line.split(/:\s+/))
			.map(([key, value]) => [key, parseInt(value, 10)])
	);
	return pct((1 - info.MemAvailable / info.MemTotal) * 100);
}

function disk() {
	const stats = statfsSync('/');
	const used = stats.blocks - stats.bfree;
	return pct((used / (used + stats.bavail)) * 100); // matches df
}

let hasGpu = true;
function gpu() {
	if (!hasGpu) return Promise.resolve(null);
	return new Promise((resolve) => {
		execFile(
			'nvidia-smi',
			['--query-gpu=utilization.gpu,memory.used,memory.total', '--format=csv,noheader,nounits'],
			{ timeout: 2000 },
			(error, stdout) => {
				if (error) {
					// ponytail: a missing binary is permanent; a driver hiccup just skips this sample.
					if (error.code === 'ENOENT') hasGpu = false;
					return resolve(null);
				}
				const rows = stdout
					.trim()
					.split('\n')
					.map((row) => row.split(',').map(Number));
				if (!rows.length || rows.some((row) => row.some(Number.isNaN))) return resolve(null);
				const used = rows.reduce((sum, row) => sum + row[1], 0);
				const total = rows.reduce((sum, row) => sum + row[2], 0);
				const util = rows.reduce((sum, row) => sum + row[0], 0) / rows.length;
				resolve({ util: pct(util), mem: pct((used / total) * 100) });
			}
		);
	});
}

const local = {
	id: ID,
	online: true,
	cpu: 0,
	mem: 0,
	disk: 0,
	gpu: null,
	hist: { cpu: [], mem: [], gpu: [] }
};
async function sample() {
	try {
		local.cpu = cpu();
		local.mem = memory();
		local.disk = disk();
		local.gpu = await gpu();
		push(local.hist.cpu, local.cpu);
		push(local.hist.mem, local.mem);
		if (local.gpu) push(local.hist.gpu, local.gpu.util);
		else local.hist.gpu.length = 0;
	} catch {
		/* keep the previous sample; the next tick tries again */
	}
}

// --- peers --------------------------------------------------------------------------------
const peers = new Map(); // url -> { at, labs }
async function pull(url) {
	try {
		const response = await fetch(url, {
			headers: { authorization: `Bearer ${TOKEN}` },
			signal: AbortSignal.timeout(2000),
			redirect: 'error'
		});
		if (!response.ok) throw new Error(String(response.status));
		const body = await response.json();
		peers.set(url, { at: Date.now(), labs: Array.isArray(body.labs) ? body.labs : [] });
	} catch {
		/* the stale check below flips the peer to offline */
	}
}

// Peers are untrusted input: rebuild their lab objects instead of forwarding them.
const num = (value) => (typeof value === 'number' && Number.isFinite(value) ? pct(value) : 0);
const series = (list) => (Array.isArray(list) ? list.slice(-HISTORY).map(num) : []);
function lab(raw) {
	return {
		id: String(raw.id ?? '').slice(0, 16),
		online: raw.online === true,
		cpu: num(raw.cpu),
		mem: num(raw.mem),
		disk: num(raw.disk),
		gpu:
			raw.gpu && typeof raw.gpu === 'object'
				? { util: num(raw.gpu.util), mem: num(raw.gpu.mem) }
				: null,
		hist: { cpu: series(raw.hist?.cpu), mem: series(raw.hist?.mem), gpu: series(raw.hist?.gpu) }
	};
}

function snapshot() {
	const labs = [lab(local)];
	for (const url of PEERS) {
		const peer = peers.get(url);
		for (const remote of peer?.labs ?? []) {
			const copy = lab(remote);
			if (Date.now() - peer.at > STALE) copy.online = false;
			labs.push(copy);
		}
	}
	return JSON.stringify({ ts: Date.now(), labs });
}

// --- server -------------------------------------------------------------------------------
const authorized = (header) =>
	typeof header === 'string' &&
	header.startsWith('Bearer ') &&
	timingSafeEqual(hash(header.slice(7)), tokenHash);

const server = createServer((request, response) => {
	const path = (request.url ?? '').split('?')[0];
	// "/" and "/labs": Tailscale may or may not strip the mount path before proxying.
	const ok = request.method === 'GET' && (path === '/' || path === '/labs');
	const status = !ok ? 404 : authorized(request.headers.authorization) ? 200 : 401;
	response.writeHead(status, {
		'content-type': 'application/json',
		'cache-control': 'no-store',
		'x-content-type-options': 'nosniff'
	});
	response.end(status === 200 ? snapshot() : '{}');
});
server.headersTimeout = 5000;
server.requestTimeout = 5000;
server.maxHeadersCount = 20;

await sample();
await Promise.all(PEERS.map(pull));
setInterval(sample, STEP);
setInterval(() => PEERS.forEach(pull), STEP);
server.listen(PORT, HOST, () => console.log(`labs-agent ${ID} on ${HOST}:${PORT}`));
