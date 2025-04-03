// Vercel serverless function for OpenAI Chat API
const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Check if OpenAI API key is configured
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return res.status(500).json({
      success: false,
      error: 'OpenAI API key is not configured on the server'
    });
  }
  
  try {
    // Forward the request to OpenAI API
    const response = await axios({
      method: 'POST',
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      data: req.body
    });
    
    // Return the response from OpenAI
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error calling OpenAI API:', error.message);
    
    // Return error response
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to call OpenAI API'
    });
  }
};
