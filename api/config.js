// Simple Vercel serverless function to check API configuration
module.exports = (req, res) => {
  // Check if OpenAI API key is configured
  const openaiConfigured = !!process.env.OPENAI_API_KEY;
  
  // Return configuration status
  res.status(200).json({
    success: true,
    config: {
      openai: {
        configured: openaiConfigured,
        status: openaiConfigured ? 'ok' : 'missing'
      },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  });
};
