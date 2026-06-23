// Simple test script to check backend endpoints
const API_BASE = 'http://localhost:8000';

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`✓ ${method} ${endpoint} - Status: ${response.status}`);
    console.log(`  Response:`, JSON.stringify(data, null, 2));
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error(`✗ ${method} ${endpoint} - Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('Testing Backend API Endpoints...\n');
  
  // Test root endpoint
  await testEndpoint('/');
  
  // Test doctors endpoint
  await testEndpoint('/api/doctors');
  
  // Test auth register with different email
  await testEndpoint('/api/auth/register', 'POST', {
    name: 'Test User',
    email: 'testuser2@gmail.com',
    password: 'password123',
    role: 'patient'
  });
  
  // Test auth login
  await testEndpoint('/api/auth/login', 'POST', {
    email: 'testuser2@gmail.com',
    password: 'password123'
  });
  
  console.log('\nTests completed.');
}

runTests();
