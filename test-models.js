const https = require('https');

const options = {
  hostname: 'api.groq.com',
  path: '/openai/v1/models',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY}`,
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log(parsed.data.map(m => m.id).join(', '));
    } catch(e) { console.log(data); }
  });
});

req.on('error', (e) => { console.error(e); });
req.end();
