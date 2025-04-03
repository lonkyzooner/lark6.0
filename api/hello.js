// Simple Vercel serverless function
module.exports = (req, res) => {
  res.status(200).json({
    message: 'Hello from LARK API!',
    timestamp: new Date().toISOString()
  });
};
