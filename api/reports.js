// Vercel API endpoint for reports
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware for security
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://lark-law.com'] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Mock data for reports
const MOCK_REPORTS = [
  {
    id: '1',
    title: 'Traffic Stop on Highway 101',
    reportNumber: 'LAPD-23-05-0001',
    reportType: 'traffic',
    status: 'draft',
    incidentDate: '2023-05-15T14:30:00Z',
    createdAt: '2023-05-15T16:45:00Z',
    updatedAt: '2023-05-15T17:30:00Z',
    createdBy: {
      id: '101',
      name: 'Officer Johnson'
    },
    completionScore: 65,
    tags: ['traffic', 'citation', 'speeding']
  },
  {
    id: '2',
    title: 'Domestic Disturbance at 123 Main St',
    reportNumber: 'LAPD-23-05-0002',
    reportType: 'incident',
    status: 'pending_review',
    incidentDate: '2023-05-14T21:15:00Z',
    createdAt: '2023-05-14T22:30:00Z',
    updatedAt: '2023-05-15T09:15:00Z',
    createdBy: {
      id: '102',
      name: 'Officer Martinez'
    },
    completionScore: 95,
    tags: ['domestic', 'disturbance', 'noise complaint']
  },
  {
    id: '3',
    title: 'Arrest of Suspect in Convenience Store Robbery',
    reportNumber: 'LAPD-23-05-0003',
    reportType: 'arrest',
    status: 'approved',
    incidentDate: '2023-05-13T02:45:00Z',
    createdAt: '2023-05-13T04:30:00Z',
    updatedAt: '2023-05-14T10:00:00Z',
    createdBy: {
      id: '103',
      name: 'Officer Williams'
    },
    completionScore: 100,
    tags: ['robbery', 'arrest', 'convenience store']
  },
  {
    id: '4',
    title: 'Investigation of Vehicle Break-in at Downtown Parking Garage',
    reportNumber: 'LAPD-23-05-0004',
    reportType: 'investigation',
    status: 'draft',
    incidentDate: '2023-05-12T18:20:00Z',
    createdAt: '2023-05-12T19:45:00Z',
    updatedAt: '2023-05-12T20:30:00Z',
    createdBy: {
      id: '104',
      name: 'Officer Thompson'
    },
    completionScore: 40,
    tags: ['vehicle', 'break-in', 'theft', 'downtown']
  },
  {
    id: '5',
    title: 'Use of Force During Arrest of Resisting Suspect',
    reportNumber: 'LAPD-23-05-0005',
    reportType: 'use_of_force',
    status: 'pending_review',
    incidentDate: '2023-05-11T23:10:00Z',
    createdAt: '2023-05-12T00:30:00Z',
    updatedAt: '2023-05-12T10:15:00Z',
    createdBy: {
      id: '105',
      name: 'Officer Davis'
    },
    completionScore: 90,
    tags: ['use of force', 'resisting arrest', 'bodycam']
  }
];

// Mock data for report templates
const MOCK_TEMPLATES = [
  {
    id: '1',
    name: 'Incident Report',
    description: 'Standard template for documenting incidents',
    reportType: 'incident',
    sections: [
      {
        title: 'Incident Details',
        description: 'Provide details about the incident',
        required: true,
        order: 1
      },
      {
        title: 'Persons Involved',
        description: 'List all persons involved in the incident',
        required: true,
        order: 2
      },
      {
        title: 'Evidence',
        description: 'Document any evidence collected',
        required: false,
        order: 3
      },
      {
        title: 'Narrative',
        description: 'Provide a detailed narrative of the incident',
        required: true,
        order: 4
      }
    ]
  },
  {
    id: '2',
    name: 'Arrest Report',
    description: 'Template for documenting arrests',
    reportType: 'arrest',
    sections: [
      {
        title: 'Arrestee Information',
        description: 'Provide details about the person arrested',
        required: true,
        order: 1
      },
      {
        title: 'Charges',
        description: 'List all charges filed',
        required: true,
        order: 2
      },
      {
        title: 'Probable Cause',
        description: 'Document the probable cause for the arrest',
        required: true,
        order: 3
      },
      {
        title: 'Evidence',
        description: 'Document any evidence collected',
        required: false,
        order: 4
      },
      {
        title: 'Narrative',
        description: 'Provide a detailed narrative of the arrest',
        required: true,
        order: 5
      }
    ]
  },
  {
    id: '3',
    name: 'Traffic Stop Report',
    description: 'Template for documenting traffic stops',
    reportType: 'traffic',
    sections: [
      {
        title: 'Vehicle Information',
        description: 'Provide details about the vehicle stopped',
        required: true,
        order: 1
      },
      {
        title: 'Driver Information',
        description: 'Provide details about the driver',
        required: true,
        order: 2
      },
      {
        title: 'Violation',
        description: 'Document the traffic violation',
        required: true,
        order: 3
      },
      {
        title: 'Action Taken',
        description: 'Document the action taken (warning, citation, arrest)',
        required: true,
        order: 4
      },
      {
        title: 'Narrative',
        description: 'Provide a detailed narrative of the traffic stop',
        required: false,
        order: 5
      }
    ]
  },
  {
    id: '4',
    name: 'Use of Force Report',
    description: 'Template for documenting use of force incidents',
    reportType: 'use_of_force',
    sections: [
      {
        title: 'Subject Information',
        description: 'Provide details about the subject force was used against',
        required: true,
        order: 1
      },
      {
        title: 'Force Used',
        description: 'Document the type and level of force used',
        required: true,
        order: 2
      },
      {
        title: 'Justification',
        description: 'Explain the justification for using force',
        required: true,
        order: 3
      },
      {
        title: 'Injuries',
        description: 'Document any injuries to the subject or officers',
        required: true,
        order: 4
      },
      {
        title: 'Witnesses',
        description: 'List any witnesses to the use of force',
        required: false,
        order: 5
      },
      {
        title: 'Medical Attention',
        description: 'Document any medical attention provided',
        required: true,
        order: 6
      },
      {
        title: 'Narrative',
        description: 'Provide a detailed narrative of the incident',
        required: true,
        order: 7
      }
    ]
  },
  {
    id: '5',
    name: 'Investigation Report',
    description: 'Template for documenting investigations',
    reportType: 'investigation',
    sections: [
      {
        title: 'Case Overview',
        description: 'Provide an overview of the case',
        required: true,
        order: 1
      },
      {
        title: 'Persons of Interest',
        description: 'List all persons of interest',
        required: false,
        order: 2
      },
      {
        title: 'Evidence Collected',
        description: 'Document all evidence collected',
        required: true,
        order: 3
      },
      {
        title: 'Interviews Conducted',
        description: 'Document all interviews conducted',
        required: false,
        order: 4
      },
      {
        title: 'Findings',
        description: 'Document the findings of the investigation',
        required: true,
        order: 5
      },
      {
        title: 'Recommendations',
        description: 'Provide recommendations based on the findings',
        required: false,
        order: 6
      },
      {
        title: 'Narrative',
        description: 'Provide a detailed narrative of the investigation',
        required: true,
        order: 7
      }
    ]
  }
];

// GET all reports
app.get('/api/reports', apiLimiter, (req, res) => {
  res.json({
    success: true,
    data: MOCK_REPORTS
  });
});

// GET a single report by ID
app.get('/api/reports/:id', apiLimiter, (req, res) => {
  const report = MOCK_REPORTS.find(r => r.id === req.params.id);
  
  if (!report) {
    return res.status(404).json({
      success: false,
      error: 'Report not found'
    });
  }
  
  res.json({
    success: true,
    data: report
  });
});

// POST create a new report
app.post('/api/reports', 
  apiLimiter,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('reportType').isIn(['incident', 'arrest', 'traffic', 'investigation', 'use_of_force', 'field_interview', 'other']).withMessage('Invalid report type'),
    body('incidentDate').isISO8601().withMessage('Invalid incident date')
  ],
  (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    // In a real app, we would save to database
    // For now, just return a mock response
    const newReport = {
      id: (MOCK_REPORTS.length + 1).toString(),
      reportNumber: `LAPD-23-05-${(MOCK_REPORTS.length + 1).toString().padStart(4, '0')}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completionScore: 0,
      ...req.body,
      createdBy: {
        id: '101',
        name: 'Officer Johnson'
      }
    };
    
    res.status(201).json({
      success: true,
      data: newReport
    });
  }
);

// PUT update a report
app.put('/api/reports/:id', 
  apiLimiter,
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('reportType').optional().isIn(['incident', 'arrest', 'traffic', 'investigation', 'use_of_force', 'field_interview', 'other']).withMessage('Invalid report type'),
    body('incidentDate').optional().isISO8601().withMessage('Invalid incident date')
  ],
  (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const report = MOCK_REPORTS.find(r => r.id === req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    // In a real app, we would update in database
    // For now, just return a mock response
    const updatedReport = {
      ...report,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedReport
    });
  }
);

// DELETE a report
app.delete('/api/reports/:id', apiLimiter, (req, res) => {
  const report = MOCK_REPORTS.find(r => r.id === req.params.id);
  
  if (!report) {
    return res.status(404).json({
      success: false,
      error: 'Report not found'
    });
  }
  
  // In a real app, we would delete from database
  // For now, just return a success response
  res.json({
    success: true,
    message: 'Report deleted successfully'
  });
});

// GET all report templates
app.get('/api/reports/templates', apiLimiter, (req, res) => {
  res.json({
    success: true,
    data: MOCK_TEMPLATES
  });
});

// GET a single report template by ID
app.get('/api/reports/templates/:id', apiLimiter, (req, res) => {
  const template = MOCK_TEMPLATES.find(t => t.id === req.params.id);
  
  if (!template) {
    return res.status(404).json({
      success: false,
      error: 'Template not found'
    });
  }
  
  res.json({
    success: true,
    data: template
  });
});

// POST create a report from a template
app.post('/api/reports/from-template/:templateId', 
  apiLimiter,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('incidentDate').isISO8601().withMessage('Invalid incident date')
  ],
  (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const template = MOCK_TEMPLATES.find(t => t.id === req.params.templateId);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    // Create a new report based on the template
    const newReport = {
      id: (MOCK_REPORTS.length + 1).toString(),
      reportNumber: `LAPD-23-05-${(MOCK_REPORTS.length + 1).toString().padStart(4, '0')}`,
      reportType: template.reportType,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completionScore: 0,
      ...req.body,
      createdBy: {
        id: '101',
        name: 'Officer Johnson'
      },
      sections: template.sections.map(section => ({
        ...section,
        content: ''
      }))
    };
    
    res.status(201).json({
      success: true,
      data: newReport
    });
  }
);

// POST endpoint for voice-to-report conversion
app.post('/api/reports/voice-to-report', 
  apiLimiter,
  [
    body('audio').optional(),
    body('transcript').optional()
  ],
  async (req, res) => {
    try {
      const { audio, transcript } = req.body;
      
      if (!audio && !transcript) {
        return res.status(400).json({
          success: false,
          error: 'Either audio or transcript is required'
        });
      }
      
      // In a real implementation, we would:
      // 1. If audio is provided, transcribe it using OpenAI Whisper API
      // 2. Process the transcript using GPT-4 to structure it into a report
      
      // For now, return a mock response
      const mockReport = {
        title: transcript ? `Report based on: ${transcript.substring(0, 30)}...` : 'Voice Recorded Report',
        reportType: 'incident',
        incidentDate: new Date().toISOString(),
        sections: [
          {
            title: 'Incident Details',
            content: 'Details extracted from voice recording',
            required: true,
            order: 1
          },
          {
            title: 'Persons Involved',
            content: 'Persons mentioned in the recording',
            required: true,
            order: 2
          },
          {
            title: 'Narrative',
            content: transcript || 'Full transcript would be here',
            required: true,
            order: 3
          }
        ],
        aiAssisted: true,
        aiMetadata: {
          confidence: 0.85,
          processingTime: 2.3
        }
      };
      
      res.json({
        success: true,
        data: mockReport
      });
    } catch (error) {
      console.error('Error processing voice-to-report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process voice recording'
      });
    }
  }
);

// POST endpoint for AI-assisted report enhancement
app.post('/api/reports/:id/enhance', 
  apiLimiter,
  async (req, res) => {
    try {
      const report = MOCK_REPORTS.find(r => r.id === req.params.id);
      
      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Report not found'
        });
      }
      
      // In a real implementation, we would:
      // 1. Use GPT-4 to enhance the report content
      // 2. Check for grammar, clarity, completeness, bias, etc.
      
      // For now, return a mock response
      const enhancementResults = {
        grammar: {
          issues: 3,
          suggestions: [
            { original: 'The suspect were seen', corrected: 'The suspect was seen' },
            { original: 'Officer Smith and me responded', corrected: 'Officer Smith and I responded' },
            { original: 'their was evidence', corrected: 'there was evidence' }
          ]
        },
        clarity: {
          score: 85,
          suggestions: [
            { section: 'Narrative', suggestion: 'Consider providing more specific details about the sequence of events' }
          ]
        },
        completeness: {
          score: 92,
          missingElements: [
            'Witness contact information',
            'Description of weather conditions'
          ]
        },
        legalTerminology: {
          suggestions: [
            { original: 'illegal substance', preferred: 'controlled substance' },
            { original: 'ran away', preferred: 'fled the scene' }
          ]
        },
        bias: {
          detected: false,
          suggestions: []
        }
      };
      
      res.json({
        success: true,
        data: enhancementResults
      });
    } catch (error) {
      console.error('Error enhancing report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to enhance report'
      });
    }
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Export for Vercel serverless functions
module.exports = app;
