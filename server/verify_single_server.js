/**
 * Verification script for single-server configuration
 * Tests:
 * 1. Root GET / loads React index.html
 * 2. SPA client routes (/templates, /login, /register, /favorites) return SPA index.html
 * 3. Backend /api/health returns JSON 200
 * 4. Non-existent API route /api/nonexistent-route returns JSON 404 (not HTML)
 * 5. GET /api/templates returns same-origin data
 * 6. Compiled JS & CSS static assets resolve with 200 OK
 */

async function verify() {
  const base = 'http://127.0.0.1:5000';
  let passed = 0;
  let failed = 0;

  function test(condition, name) {
    if (condition) {
      console.log(`✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${name}`);
      failed++;
    }
  }

  console.log('\n--- 1. Testing GET / (Root Frontend) ---');
  let res = await fetch(`${base}/`);
  let text = await res.text();
  test(res.status === 200, 'GET / responds with status 200');
  test(res.headers.get('content-type')?.includes('text/html'), 'GET / Content-Type is text/html');
  test(text.includes('id="root"') && text.includes('Mini SaaS Template Store'), 'GET / HTML contains React root and page title');

  console.log('\n--- 2. Testing SPA Fallback Routes ---');
  for (const route of ['/templates', '/login', '/register', '/favorites']) {
    res = await fetch(`${base}${route}`);
    text = await res.text();
    test(res.status === 200 && text.includes('id="root"'), `GET ${route} returns SPA index.html (200 OK)`);
  }

  console.log('\n--- 3. Testing GET /api/health ---');
  res = await fetch(`${base}/api/health`);
  const healthData = await res.json();
  test(res.status === 200 && healthData.status === 'healthy', 'GET /api/health returns JSON status 200 healthy');

  console.log('\n--- 4. Testing GET /api/nonexistent-route (Must be JSON 404, NOT HTML) ---');
  res = await fetch(`${base}/api/nonexistent-route`);
  const notFoundData = await res.json();
  test(res.status === 404, 'GET /api/nonexistent-route returns 404');
  test(notFoundData && notFoundData.success === false, 'GET /api/nonexistent-route returns JSON error payload');

  console.log('\n--- 5. Testing GET /api/templates (Same-Origin Data) ---');
  res = await fetch(`${base}/api/templates`);
  const templateData = await res.json();
  test(res.status === 200 && templateData.data?.length === 6, 'GET /api/templates returns 6 templates');

  console.log('\n--- 6. Testing Static Asset Serving (CSS / JS) ---');
  const jsMatch = text.match(/\/assets\/[a-zA-Z0-9_\-]+\.js/);
  if (jsMatch) {
    const jsRes = await fetch(`${base}${jsMatch[0]}`);
    test(jsRes.status === 200, `JavaScript bundle (${jsMatch[0]}) loads with 200 OK`);
  }
  const cssMatch = text.match(/\/assets\/[a-zA-Z0-9_\-]+\.css/);
  if (cssMatch) {
    const cssRes = await fetch(`${base}${cssMatch[0]}`);
    test(cssRes.status === 200, `CSS bundle (${cssMatch[0]}) loads with 200 OK`);
  }

  console.log('\n==============================================');
  console.log(`Single-Server Verification: ${passed} Passed, ${failed} Failed`);
  console.log('==============================================\n');

  if (failed > 0) process.exit(1);
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
