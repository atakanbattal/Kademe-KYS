exports.handler = async (event, context) => {
  console.log('🎯 HEALTH CHECK ÇAĞRILDI!');
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      message: 'NETLIFY FUNCTIONS ÇALIŞIYOR!',
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      path: event.path
    })
  };
};
