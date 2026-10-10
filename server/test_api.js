/**
 * Automated Verification Script for Mini SaaS Template Store REST APIs
 * Runs comprehensive end-to-end HTTP tests covering:
 * - Registration, Validation, Duplicate Email Handling
 * - Password Hashing & JWT Token Generation
 * - Login with Valid & Invalid Credentials
 * - Auth Middleware & Unauthorized Access Rejection
 * - Templates Catalog Listing, Search & Category Filters, Details & 404s
 * - Favorites Addition, Duplicate Prevention, Removal, and Multi-User Isolation
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_gnxtace_internship_task_2026';

const app = require('./src/app');
const db = require('./src/db');

let server;
let baseUrl;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  return { status: response.status, body: data };
}

async function runTests() {
  console.log('\n======================================================');
  console.log(' Starting Automated API Verification Suite');
  console.log('======================================================\n');

  // Start test HTTP server on an available random port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`Test server running on ${baseUrl}\n`);
      resolve();
    });
  });

  const uniqueId = Date.now();
  const userA = {
    name: 'Alice Developer',
    email: `alice_${uniqueId}@test.com`,
    password: 'Password123!'
  };
  const userB = {
    name: 'Bob Tester',
    email: `bob_${uniqueId}@test.com`,
    password: 'Password456!'
  };

  let tokenA = '';
  let tokenB = '';
  let userIdA = null;
  let userIdB = null;

  try {
    // -----------------------------------------------------------------
    // 1. Health Check
    // -----------------------------------------------------------------
    console.log('Test Group 1: Server Health & Routing');
    const healthRes = await request('/api/health');
    assert(healthRes.status === 200 && healthRes.body.status === 'healthy', 'GET /api/health responds with 200 OK');

    const notFoundRes = await request('/api/nonexistent-route');
    assert(notFoundRes.status === 404 && notFoundRes.body.success === false, 'Non-existent route returns 404 Not Found');

    // -----------------------------------------------------------------
    // 2. Authentication Validation & Registration
    // -----------------------------------------------------------------
    console.log('\nTest Group 2: User Registration & Validation');
    
    // Short password rejection
    const shortPassRes = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Alice', email: userA.email, password: '123' }
    });
    assert(shortPassRes.status === 400, 'Registration rejects password < 6 characters with 400 Bad Request');

    // Invalid email rejection
    const badEmailRes = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Alice', email: 'not-an-email', password: userA.password }
    });
    assert(badEmailRes.status === 400, 'Registration rejects invalid email format with 400 Bad Request');

    // Valid registration for User A
    const regResA = await request('/api/auth/register', {
      method: 'POST',
      body: userA
    });
    assert(regResA.status === 201 && regResA.body.success === true, 'Registration succeeds with 201 Created');
    assert(typeof regResA.body.token === 'string', 'Registration returns JWT token');
    assert(regResA.body.user && !regResA.body.user.password_hash, 'Registration response NEVER exposes password_hash');
    tokenA = regResA.body.token;
    userIdA = regResA.body.user.id;

    // Duplicate registration rejection
    const duplicateRegRes = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Alice Duplicate', email: userA.email.toUpperCase(), password: 'AnotherPassword!' }
    });
    assert(duplicateRegRes.status === 409, 'Duplicate registration returns 409 Conflict with normalized email check');

    // Register User B for multi-user isolation tests
    const regResB = await request('/api/auth/register', {
      method: 'POST',
      body: userB
    });
    assert(regResB.status === 201, 'User B registered successfully');
    tokenB = regResB.body.token;
    userIdB = regResB.body.user.id;

    // -----------------------------------------------------------------
    // 3. User Login & Credential Verification
    // -----------------------------------------------------------------
    console.log('\nTest Group 3: User Login & Credentials');

    // Wrong password login
    const wrongPassRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: userA.email, password: 'WrongPassword999' }
    });
    assert(wrongPassRes.status === 401, 'Login with wrong password rejected with 401 Unauthorized');

    // Non-existent email login
    const wrongEmailRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'nonexistent@example.com', password: userA.password }
    });
    assert(wrongEmailRes.status === 401, 'Login with nonexistent email rejected with 401 Unauthorized');

    // Correct login
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: userA.email.toUpperCase(), password: userA.password }
    });
    assert(loginRes.status === 200 && loginRes.body.success === true, 'Login succeeds with 200 OK (case-insensitive email)');
    assert(typeof loginRes.body.token === 'string', 'Login returns valid JWT token');
    assert(!loginRes.body.user.password_hash, 'Login response NEVER exposes password_hash');

    // -----------------------------------------------------------------
    // 4. JWT Authentication Middleware
    // -----------------------------------------------------------------
    console.log('\nTest Group 4: JWT Middleware Security');

    // Protected route with missing token
    const noTokenRes = await request('/api/auth/me');
    assert(noTokenRes.status === 401, 'Protected route rejects missing token with 401 Unauthorized');

    // Protected route with invalid token
    const badTokenRes = await request('/api/auth/me', {
      headers: { Authorization: 'Bearer this.is.an.invalid.token' }
    });
    assert(badTokenRes.status === 401, 'Protected route rejects invalid token with 401 Unauthorized');

    // Protected route with valid token
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(meRes.status === 200 && meRes.body.user.id === userIdA, 'GET /api/auth/me succeeds with valid token');

    // -----------------------------------------------------------------
    // 5. Templates API
    // -----------------------------------------------------------------
    console.log('\nTest Group 5: Templates API');

    // Get all templates
    const allTemplatesRes = await request('/api/templates');
    assert(allTemplatesRes.status === 200 && Array.isArray(allTemplatesRes.body.data), 'GET /api/templates returns 200 array');
    assert(allTemplatesRes.body.data.length >= 6, `At least 6 templates returned (found: ${allTemplatesRes.body.data.length})`);

    const firstTemplate = allTemplatesRes.body.data[0];
    assert(
      firstTemplate.id && firstTemplate.name && firstTemplate.description && firstTemplate.thumbnail_url && firstTemplate.category,
      'Template schema has all required fields (id, name, description, thumbnail_url, category)'
    );

    // Get template by valid ID
    const singleTemplateRes = await request(`/api/templates/${firstTemplate.id}`);
    assert(singleTemplateRes.status === 200 && singleTemplateRes.body.data.id === firstTemplate.id, 'GET /api/templates/:id returns correct template');

    // Get template by nonexistent ID
    const notFoundTemplateRes = await request('/api/templates/999999');
    assert(notFoundTemplateRes.status === 404, 'GET /api/templates/:id with nonexistent ID returns 404');

    // Filter by category
    const catRes = await request('/api/templates?category=Analytics');
    assert(catRes.status === 200 && catRes.body.data.every(t => t.category === 'Analytics'), 'Filter by category=Analytics works');

    // Search query
    const searchRes = await request('/api/templates?search=Nova');
    assert(searchRes.status === 200 && searchRes.body.data.some(t => t.name.includes('Nova')), 'Search query ?search=Nova returns matching template');

    // -----------------------------------------------------------------
    // 6. Favorites API & Multi-User Isolation
    // -----------------------------------------------------------------
    console.log('\nTest Group 6: Favorites API & User Isolation');

    // Favorites requires authentication
    const unauthFavRes = await request(`/api/favorites/${firstTemplate.id}`, { method: 'POST' });
    assert(unauthFavRes.status === 401, 'POST /api/favorites/:id rejects unauthenticated request with 401');

    // Add favorite for User A
    const addFavResA = await request(`/api/favorites/${firstTemplate.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(addFavResA.status === 201 && addFavResA.body.success === true, 'User A adds template to favorites (201 Created)');

    // Duplicate favorite handled gracefully (409 Conflict, NOT 500)
    const duplicateFavRes = await request(`/api/favorites/${firstTemplate.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(duplicateFavRes.status === 409, 'Duplicate favorite returns 409 Conflict without server error');

    // Non-existent template favorite
    const badFavRes = await request('/api/favorites/999999', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(badFavRes.status === 404, 'Favoriting nonexistent template returns 404');

    // User A can see their favorited template
    const userAFavs = await request('/api/favorites', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(
      userAFavs.status === 200 && userAFavs.body.data.some(f => f.id === firstTemplate.id),
      'User A retrieves their favorited template in GET /api/favorites'
    );

    // Multi-User Isolation: User B cannot see User A's favorites
    const userBFavsInitial = await request('/api/favorites', {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(
      userBFavsInitial.status === 200 && userBFavsInitial.body.data.length === 0,
      'User Isolation: User B has 0 favorites and CANNOT see User A\'s favorites'
    );

    // User B favorites a different template (template #2)
    const secondTemplate = allTemplatesRes.body.data[1];
    const addFavResB = await request(`/api/favorites/${secondTemplate.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(addFavResB.status === 201, 'User B adds template #2 to favorites');

    const userBFavsAfter = await request('/api/favorites', {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(
      userBFavsAfter.body.data.length === 1 && userBFavsAfter.body.data[0].id === secondTemplate.id,
      'User B list contains exclusively template #2'
    );

    // Extra feature: DELETE /api/favorites/:templateId
    console.log('\nTest Group 7: Remove Favorite (DELETE /api/favorites/:id)');
    const deleteFavRes = await request(`/api/favorites/${firstTemplate.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(deleteFavRes.status === 200, 'User A removes favorite with DELETE 200 OK');

    const userAFavsAfterDelete = await request('/api/favorites', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(userAFavsAfterDelete.body.data.length === 0, 'User A favorites list is now empty');

    const deleteAgainRes = await request(`/api/favorites/${firstTemplate.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(deleteAgainRes.status === 404, 'Deleting already removed favorite returns 404');

  } catch (err) {
    console.error('\nFatal test runner error:', err);
    failed++;
  } finally {
    // Clean up test users created during test run
    if (userIdA || userIdB) {
      await db('users').whereIn('id', [userIdA, userIdB].filter(Boolean)).del();
    }

    // Close server and database connection
    await new Promise((res) => server.close(res));
    await db.destroy();

    console.log('\n======================================================');
    console.log(` Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runTests();
