// Test users for demo - NO DEPENDENCIES
const TEST_USERS = [
  {
    _id: "4f40d514-c17a-4467-8818-2f9c33444b0d",
    name: "Atakan Battal",
    email: "atakan.battal@kademe.com.tr", 
    password: "atakan1234",
    role: "admin",
    department: "Kalite Kontrol ve Güvence Müdür Yardımcısı"
  },
  {
    _id: "5e30e624-d27b-4578-9929-3f0d44555c1e",
    name: "Hasan Yavuz",
    email: "hasan.yavuz@kademe.com.tr",
    password: "hasan1234", 
    role: "admin",
    department: "Kalite Güvence Uzmanı"
  },
  {
    _id: "6f20f734-e38c-4689-aa3a-4f1e55666d2f",
    name: "Mustafa Büyükköktaş",
    email: "mustafa.buyukkokten@kademe.com.tr",
    password: "mustafa1234",
    role: "quality", 
    department: "Kalite Kontrol Şefi"
  }
];

// Simple JWT implementation for demo
function generateToken(userId) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ 
    id: userId, 
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  })).toString('base64url');
  
  const signature = Buffer.from('demo_signature').toString('base64url');
  return `${header}.${payload}.${signature}`;
}

exports.handler = async (event, context) => {
  console.log('🔥 NETLIFY FUNCTION ÇAĞRILDI!', event.httpMethod, event.path);
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight CORS request
  if (event.httpMethod === 'OPTIONS') {
    console.log('🔥 OPTIONS isteği geldi');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    console.log('🔥 POST değil:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const { email, password } = JSON.parse(event.body || '{}');

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Email is required' })
      };
    }

    // Find user from test data
    const user = TEST_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }

    // Simple password check (in production, use bcrypt)
    if (password && user.password !== password) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }

    // Generate token and return user data
    const token = generateToken(user._id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: token
      })
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Server error during login' })
    };
  }
};
