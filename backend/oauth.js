const Credentials = require('./credentials');
const fetch = require('node-fetch');

// Cache token per cloudhost then account to avoid fetching if not expired 
const tokens = {};

const fetchToken = async (cloudhost, account) => {
  const { client_credentials } = Credentials;
  if (client_credentials[cloudhost] && client_credentials[cloudhost][account]) {
    const { client_id, client_secret } = client_credentials[cloudhost][account]; 
    const token = Buffer.from(`${client_id}:${client_secret}`, 'utf-8').toString('base64');

    const response = await fetch(`https://${cloudhost}/api/oauth2/v1/token`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    const json = await response.json();
    return json.access_token;

  }
  throw new Error('Host/account is not configured. Please verify your licence and contact the extension administrator');
}

exports.fetch = fetchToken;