const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for template sections
const TemplateSectionSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  helpText: {
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
  },
  type: {
    type: String,
    enum: ['text', 'longtext', 'number', 'date', 'time', 'select', 'multiselect', 'checkbox', 'radio', 'location'],
    default: 'text'
  },
  options: [String], // For select, multiselect, checkbox, radio types
  validation: {
    type: Schema.Types.Mixed,
    default: {}
  },
  defaultValue: Schema.Types.Mixed,
  maxLength: Number,
  minLength: Number
});

// Define schema for template fields
const TemplateFieldSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'longtext', 'number', 'date', 'time', 'select', 'multiselect', 'checkbox', 'radio', 'location'],
    default: 'text'
  },
  placeholder: String,
  helpText: String,
  required: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true
  },
  options: [String], // For select, multiselect, checkbox, radio types
  validation: {
    type: Schema.Types.Mixed,
    default: {}
  },
  defaultValue: Schema.Types.Mixed,
  section: {
    type: String,
    default: 'general'
  },
  showCondition: {
    field: String,
    operator: {
      type: String,
      enum: ['equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'lessThan']
    },
    value: Schema.Types.Mixed
  }
});

// Define schema for report template
const ReportTemplateSchema = new Schema({
  // Basic template information
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  reportType: {
    type: String,
    enum: ['incident', 'arrest', 'traffic', 'investigation', 'use_of_force', 'field_interview', 'other'],
    required: true
  },
  icon: {
    type: String,
    default: 'file-text'
  },
  color: {
    type: String,
    default: '#3b82f6' // Blue
  },
  
  // Template structure
  sections: [TemplateSectionSchema],
  fields: [TemplateFieldSchema],
  
  // Narrative guidance
  narrativeGuidance: {
    type: String,
    default: ''
  },
  narrativePrompts: [String],
  
  // Template metadata
  departmentId: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  requiredSubscriptionTier: {
    type: String,
    enum: ['free', 'basic', 'standard', 'premium', 'enterprise'],
    default: 'free'
  },
  
  // Template management
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Version control
  version: {
    type: String,
    default: '1.0'
  },
  previousVersion: {
    type: Schema.Types.ObjectId,
    ref: 'ReportTemplate'
  },
  
  // AI assistance configuration
  aiPrompts: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  // Legal and compliance
  statutes: [String],
  regulations: [String],
  
  // Usage statistics
  usageCount: {
    type: Number,
    default: 0
  },
  averageCompletionTime: {
    type: Number, // In minutes
    default: 0
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Method to check if user can access this template
ReportTemplateSchema.methods.canAccess = function(user) {
  // Public templates are accessible to all
  if (this.isPublic) return true;
  
  // Check if user belongs to the same department
  if (user.departmentId === this.departmentId) {
    // Check subscription tier requirement
    const tierLevels = {
      'free': 0,
      'basic': 1,
      'standard': 2,
      'premium': 3,
      'enterprise': 4
    };
    
    return tierLevels[user.subscriptionTier] >= tierLevels[this.requiredSubscriptionTier];
  }
  
  return false;
};

// Method to increment usage count
ReportTemplateSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  await this.save();
};

// Method to update average completion time
ReportTemplateSchema.methods.updateCompletionTime = async function(newCompletionTime) {
  if (this.usageCount <= 1) {
    this.averageCompletionTime = newCompletionTime;
  } else {
    // Calculate new average
    const totalTime = this.averageCompletionTime * (this.usageCount - 1);
    this.averageCompletionTime = (totalTime + newCompletionTime) / this.usageCount;
  }
  
  await this.save();
};

module.exports = mongoose.model('ReportTemplate', ReportTemplateSchema);
