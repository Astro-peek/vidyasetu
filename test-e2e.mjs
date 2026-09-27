import fs from 'fs';

async function testApi() {
  const base = 'http://localhost:3001/api/v1';
  let passed = 0;
  let failed = 0;
  
  const report = [];

  const log = (msg, success = true) => {
    if (success) passed++;
    else failed++;
    const mark = success ? '✓' : '✗';
    console.log(`${mark} ${msg}`);
    report.push(`${mark} ${msg}`);
  };

  const errLog = (msg, err) => {
    failed++;
    console.error(`✗ ${msg}`);
    console.error(`  Error:`, err.message);
    report.push(`✗ ${msg} - Error: ${err.message}`);
  };

  try {
    const health = await fetch(`${base}/health`);
    const healthData = await health.json();
    if (healthData.status === 'ok') log('Health check passed');
    else throw new Error(`Status ${health.status}`);
  } catch (err) {
    errLog('Health check failed', err);
  }

  // 1. Unauthenticated Schemes
  try {
    const schemes = await fetch(`${base}/schemes`);
    const data = await schemes.json();
    if (data.success && Array.isArray(data.data)) log('GET /schemes passed');
    else throw new Error(JSON.stringify(data));
  } catch (err) {
    errLog('GET /schemes failed', err);
  }

  // 2. Auth checking (unauthorized)
  try {
    const me = await fetch(`${base}/me`);
    if (me.status === 401) log('GET /me 401 works properly');
    else throw new Error(`Status ${me.status}`);
  } catch (err) {
    errLog('GET /me unauthorized handling failed', err);
  }

  // Create mock authenticated token logic using Supabase anon key...
  // Wait, I can't easily sign valid Supabase JWTs without the JWT secret.
  // Instead of guessing, I'll test frontend using `build` output or simply review the auth middleware.

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

testApi();
