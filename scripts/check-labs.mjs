// Run with: node scripts/check-labs.mjs
// Starts the agent on a random loopback port and checks auth plus payload shape.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const port = 20000 + Math.floor(Math.random() * 20000);
const token = 'test-token-that-is-long-enough-123';
const agent = spawn('node', ['scripts/labs-agent.mjs'], {
	env: { ...process.env, LABS_TOKEN: token, LAB_ID: 'vm', PORT: String(port), PEER_URL: '' },
	stdio: ['ignore', 'pipe', 'inherit']
});
await new Promise((resolve) => agent.stdout.once('data', resolve));
const url = `http://127.0.0.1:${port}/labs`;
const get = (headers, path = '/labs', method = 'GET') =>
	fetch(`http://127.0.0.1:${port}${path}`, { headers, method });

try {
	assert.equal((await get({})).status, 401, 'no token');
	assert.equal((await get({ authorization: 'Bearer nope' })).status, 401, 'wrong token');
	assert.equal(
		(await get({ authorization: `Bearer ${token}` }, '/other')).status,
		404,
		'other path'
	);
	assert.equal(
		(await get({ authorization: `Bearer ${token}` }, '/labs', 'POST')).status,
		404,
		'POST'
	);

	const response = await get({ authorization: `Bearer ${token}` });
	assert.equal(response.status, 200);
	const body = await response.json();
	assert.deepEqual(Object.keys(body).sort(), ['labs', 'ts']);
	const [lab] = body.labs;
	assert.deepEqual(Object.keys(lab).sort(), ['cpu', 'disk', 'gpu', 'hist', 'id', 'mem', 'online']);
	assert.equal(lab.id, 'vm');
	assert.ok(lab.mem > 0 && lab.mem <= 100 && lab.disk > 0 && lab.disk <= 100);
	assert.ok(lab.hist.cpu.length >= 1 && lab.hist.mem.length >= 1);
	console.log('labs agent ok', JSON.stringify(lab).slice(0, 120), url);
} finally {
	agent.kill();
}
