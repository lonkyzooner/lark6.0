const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for report sections
const ReportSectionSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true
  }
});

// Define schema for report evidence
const EvidenceSchema = new Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'other'],
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalFilename: String,
  fileSize: Number,
  mimeType: String,
  url: String,
  thumbnailUrl: String,
  transcription: String,
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    address: String
  },
  tags: [String]
});

// Define schema for report collaborators
const CollaboratorSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'editor', 'viewer'],
    default: 'editor'
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Define schema for report revision history
const RevisionSchema = new Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  changes: [{
    field: String,
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed
  }],
  comment: String
});

// Define schema for report
const ReportSchema = new Schema({
  // Basic report information
  title: {
    type: String,
    required: true,
    trim: true
  },
  reportNumber: {
    type: String,
    unique: true
  },
  reportType: {
    type: String,
    enum: ['incident', 'arrest', 'traffic', 'investigation', 'use_of_force', 'field_interview', 'other'],
    required: true
  },
  template: {
    type: String,
    ref: 'ReportTemplate'
  },
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'approved', 'rejected', 'archived'],
    default: 'draft'
  },
  
  // Incident details
  incidentDate: {
    type: Date,
    required: true
  },
  incidentLocation: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    latitude: Number,
    longitude: Number,
    locationDescription: String
  },
  
  // Report content
  sections: [ReportSectionSchema],
  narrative: {
    type: String,
    default: ''
  },
  
  // People involved
  subjects: [{
    type: Schema.Types.Mixed,
    default: {}
  }],
  witnesses: [{
    type: Schema.Types.Mixed,
    default: {}
  }],
  officers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Evidence and attachments
  evidence: [EvidenceSchema],
  
  // Collaboration
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [CollaboratorSchema],
  
  // Workflow
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,
  
  // Revision history
  revisions: [RevisionSchema],
  
  // Department and jurisdiction
  departmentId: {
    type: String,
    required: true
  },
  jurisdiction: String,
  
  // Tags and categorization
  tags: [String],
  categories: [String],
  
  // Related reports and cases
  relatedReports: [{
    type: Schema.Types.ObjectId,
    ref: 'Report'
  }],
  caseNumber: String,
  
  // AI assistance metadata
  aiAssisted: {
    type: Boolean,
    default: false
  },
  aiMetadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  // Analytics and metrics
  completionScore: {
    type: Number,
    min: 0,
    max: 100
  },
  wordCount: {
    type: Number,
    default: 0
  },
  editTime: {
    type: Number, // Total time spent editing in seconds
    default: 0
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Generate report number before saving
ReportSchema.pre('save', async function(next) {
  if (!this.reportNumber) {
    // Get current date
    const now = new Date();
    const year = now.getFullYear().toString().substr(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    // Find the latest report number for this department and increment
    const latestReport = await this.constructor.findOne(
      { departmentId: this.departmentId },
      { reportNumber: 1 },
      { sort: { reportNumber: -1 } }
    );
    
    let sequence = 1;
    if (latestReport && latestReport.reportNumber) {
      // Extract sequence from the latest report number
      const match = latestReport.reportNumber.match(/(\d+)$/);
      if (match) {
        sequence = parseInt(match[1], 10) + 1;
      }
    }
    
    // Format: DEPT-YY-MM-SEQUENCE
    this.reportNumber = `${this.departmentId}-${year}${month}-${sequence.toString().padStart(4, '0')}`;
  }
  
  // Calculate word count
  if (this.narrative) {
    this.wordCount = this.narrative.split(/\s+/).filter(Boolean).length;
    
    // Add words from sections
    if (this.sections && this.sections.length > 0) {
      this.sections.forEach(section => {
        if (section.content) {
          this.wordCount += section.content.split(/\s+/).filter(Boolean).length;
        }
      });
    }
  }
  
  next();
});

// Method to check if user can edit this report
ReportSchema.methods.canEdit = function(userId) {
  // Creator can always edit
  if (this.createdBy.toString() === userId.toString()) {
    return true;
  }
  
  // Check collaborators
  const collaborator = this.collaborators.find(c => 
    c.user.toString() === userId.toString() && 
    (c.role === 'owner' || c.role === 'editor')
  );
  
  return !!collaborator;
};

// Method to check if report is complete
ReportSchema.methods.isComplete = function() {
  // Check if all required sections have content
  const requiredSections = this.sections.filter(s => s.required);
  const completedRequiredSections = requiredSections.filter(s => s.content && s.content.trim().length > 0);
  
  return completedRequiredSections.length === requiredSections.length;
};

// Method to get report completion percentage
ReportSchema.methods.getCompletionPercentage = function() {
  const requiredSections = this.sections.filter(s => s.required);
  if (requiredSections.length === 0) return 100;
  
  const completedRequiredSections = requiredSections.filter(s => s.content && s.content.trim().length > 0);
  return Math.round((completedRequiredSections.length / requiredSections.length) * 100);
};

module.exports = mongoose.model('Report', ReportSchema);
