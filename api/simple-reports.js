// Simple Vercel serverless function for reports API
module.exports = (req, res) => {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return res.status(200).json({
        success: true,
        message: 'Reports API endpoint is working',
        timestamp: new Date().toISOString(),
        data: [
          {
            id: '1',
            title: 'Sample Report',
            status: 'draft',
            createdAt: new Date().toISOString()
          }
        ]
      });
    case 'POST':
      return res.status(200).json({
        success: true,
        message: 'Report created successfully',
        timestamp: new Date().toISOString(),
        data: {
          id: '1',
          title: req.body?.title || 'New Report',
          status: 'draft',
          createdAt: new Date().toISOString()
        }
      });
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
  }
};
