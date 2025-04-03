import React, { useState, useRef } from 'react';
import { 
  FileUp, 
  Image, 
  FileText, 
  File, 
  Trash2, 
  AlertTriangle, 
  Loader2, 
  CheckCircle,
  MapPin,
  Camera,
  Mic,
  Video,
  Download,
  Search,
  Tag
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import axios from 'axios';

// Define the props interface
interface EvidenceUploaderProps {
  reportId: string;
  onEvidenceAdded?: (evidence: Evidence) => void;
  onEvidenceRemoved?: (evidenceId: string) => void;
}

// Define the evidence interface
interface Evidence {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  transcription?: string;
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    pageCount?: number;
    createdAt?: string;
    deviceInfo?: string;
    [key: string]: any;
  };
  addedBy: {
    id: string;
    name: string;
  };
  addedAt: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address: string;
  };
  tags: string[];
}

// Mock data for evidence
const MOCK_EVIDENCE: Evidence[] = [
  {
    id: '1',
    type: 'image',
    filename: 'crime_scene_photo_1.jpg',
    originalFilename: 'IMG_1234.jpg',
    fileSize: 2500000,
    mimeType: 'image/jpeg',
    url: 'https://placehold.co/600x400',
    thumbnailUrl: 'https://placehold.co/300x200',
    metadata: {
      width: 3024,
      height: 4032,
      createdAt: '2023-05-15T14:35:00Z',
      deviceInfo: 'iPhone 13 Pro'
    },
    addedBy: {
      id: '101',
      name: 'Officer Johnson'
    },
    addedAt: '2023-05-15T16:50:00Z',
    location: {
      latitude: 34.0522,
      longitude: -118.2437,
      accuracy: 10,
      address: '123 Main St, Los Angeles, CA'
    },
    tags: ['crime scene', 'evidence', 'photo']
  },
  {
    id: '2',
    type: 'audio',
    filename: 'witness_statement_1.mp3',
    originalFilename: 'Voice Recording 001.mp3',
    fileSize: 5000000,
    mimeType: 'audio/mpeg',
    url: 'https://example.com/audio.mp3',
    transcription: 'I was walking down the street when I heard a loud noise coming from the alley. When I looked, I saw a man running away from the convenience store.',
    metadata: {
      duration: 120,
      createdAt: '2023-05-15T15:00:00Z',
      deviceInfo: 'Digital Recorder Model XYZ'
    },
    addedBy: {
      id: '101',
      name: 'Officer Johnson'
    },
    addedAt: '2023-05-15T17:00:00Z',
    location: {
      latitude: 34.0522,
      longitude: -118.2437,
      accuracy: 15,
      address: '123 Main St, Los Angeles, CA'
    },
    tags: ['witness', 'statement', 'audio']
  },
  {
    id: '3',
    type: 'document',
    filename: 'incident_report_draft.pdf',
    originalFilename: 'Report_Draft_v1.pdf',
    fileSize: 1500000,
    mimeType: 'application/pdf',
    url: 'https://example.com/document.pdf',
    metadata: {
      pageCount: 5,
      createdAt: '2023-05-15T16:00:00Z'
    },
    addedBy: {
      id: '102',
      name: 'Officer Martinez'
    },
    addedAt: '2023-05-15T17:15:00Z',
    tags: ['report', 'draft', 'document']
  }
];

const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({ 
  reportId, 
  onEvidenceAdded, 
  onEvidenceRemoved 
}) => {
  // State
  const [evidence, setEvidence] = useState<Evidence[]>(MOCK_EVIDENCE);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Function to handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
      
      // Reset tags
      setTags([]);
      
      // Determine file type and add appropriate tags
      const file = files[0];
      const fileType = file.type.split('/')[0];
      
      if (fileType === 'image') {
        setTags(['photo', 'evidence']);
      } else if (fileType === 'video') {
        setTags(['video', 'evidence']);
      } else if (fileType === 'audio') {
        setTags(['audio', 'recording']);
      } else if (file.type === 'application/pdf') {
        setTags(['document', 'pdf']);
      } else {
        setTags(['evidence']);
      }
    }
  };
  
  // Function to add a tag
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  // Function to remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Function to upload evidence
  const uploadEvidence = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 300);
      
      // In a real app, you would upload the file to your server
      // For now, we'll simulate a successful upload
      
      // Get current location
      let location = null;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          address: 'Location data captured' // In a real app, you would use reverse geocoding
        };
      } catch (locationError) {
        console.warn('Could not get location:', locationError);
      }
      
      // Determine file type
      let fileType: 'image' | 'video' | 'audio' | 'document' | 'other' = 'other';
      const mimeType = selectedFile.type;
      
      if (mimeType.startsWith('image/')) {
        fileType = 'image';
      } else if (mimeType.startsWith('video/')) {
        fileType = 'video';
      } else if (mimeType.startsWith('audio/')) {
        fileType = 'audio';
      } else if (
        mimeType === 'application/pdf' || 
        mimeType === 'application/msword' || 
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        fileType = 'document';
      }
      
      // Create new evidence object
      const newEvidence: Evidence = {
        id: `new-${Date.now()}`,
        type: fileType,
        filename: `evidence_${Date.now()}_${selectedFile.name}`,
        originalFilename: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        url: URL.createObjectURL(selectedFile),
        thumbnailUrl: fileType === 'image' ? URL.createObjectURL(selectedFile) : undefined,
        metadata: {
          createdAt: new Date().toISOString(),
          deviceInfo: navigator.userAgent
        },
        addedBy: {
          id: '101', // In a real app, this would be the current user's ID
          name: 'Officer Johnson' // In a real app, this would be the current user's name
        },
        addedAt: new Date().toISOString(),
        location,
        tags
      };
      
      // Wait for "upload" to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear the progress interval if it's still running
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Update state
      setEvidence([...evidence, newEvidence]);
      
      // Call callback
      if (onEvidenceAdded) {
        onEvidenceAdded(newEvidence);
      }
      
      // Reset form
      setSelectedFile(null);
      setTags([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Wait a bit before resetting upload progress
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    } catch (err) {
      console.error('Error uploading evidence:', err);
      setError('Failed to upload evidence. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Function to remove evidence
  const removeEvidence = async (evidenceId: string) => {
    try {
      // In a real app, you would call your API to remove the evidence
      
      // Update state
      setEvidence(evidence.filter(e => e.id !== evidenceId));
      
      // Call callback
      if (onEvidenceRemoved) {
        onEvidenceRemoved(evidenceId);
      }
    } catch (err) {
      console.error('Error removing evidence:', err);
      setError('Failed to remove evidence. Please try again.');
    }
  };
  
  // Function to view evidence details
  const viewEvidenceDetails = (evidenceItem: Evidence) => {
    setSelectedEvidence(evidenceItem);
    setIsViewDialogOpen(true);
  };
  
  // Function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
  };
  
  // Function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Function to get icon for file type
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'audio':
        return <Mic className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };
  
  // Filter evidence based on search query
  const filteredEvidence = evidence.filter(item => 
    item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.originalFilename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          Evidence & Attachments
        </CardTitle>
        <CardDescription>
          Upload and manage evidence related to this report
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Upload Form */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="evidence-file">Upload Evidence</Label>
              <Input
                id="evidence-file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={isUploading}
                className="cursor-pointer"
              />
              {selectedFile && (
                <div className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              )}
            </div>
            
            {selectedFile && (
              <div className="space-y-2">
                <Label htmlFor="evidence-tags">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button 
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="evidence-tags"
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    disabled={isUploading}
                  />
                  <Button 
                    variant="outline" 
                    onClick={addTag}
                    disabled={isUploading || !newTag.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                variant="default" 
                onClick={uploadEvidence}
                disabled={isUploading || !selectedFile}
                className="gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileUp className="h-4 w-4" />
                    Upload Evidence
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Evidence List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Uploaded Evidence</h3>
            <div className="relative w-[250px]">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search evidence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          {filteredEvidence.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/20">
              <div className="flex justify-center mb-2">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No evidence found</h3>
              <p className="text-muted-foreground">
                {evidence.length === 0 
                  ? 'Upload evidence to get started' 
                  : 'No evidence matches your search criteria'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvidence.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  {/* Preview */}
                  <div 
                    className="h-40 bg-muted flex items-center justify-center cursor-pointer"
                    onClick={() => viewEvidenceDetails(item)}
                  >
                    {item.type === 'image' ? (
                      <img 
                        src={item.thumbnailUrl || item.url} 
                        alt={item.filename} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        {getFileIcon(item.type)}
                        <span className="mt-2 text-sm font-medium">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <CardContent className="p-3 space-y-2">
                    <div>
                      <h4 className="font-medium text-sm truncate" title={item.originalFilename}>
                        {item.originalFilename}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatFileSize(item.fileSize)}</span>
                        <span>{formatDate(item.addedAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-between pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => viewEvidenceDetails(item)}
                      >
                        <Search className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 px-2 text-xs text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={() => removeEvidence(item.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Evidence Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            {selectedEvidence && (
              <>
                <DialogHeader>
                  <DialogTitle>Evidence Details</DialogTitle>
                  <DialogDescription>
                    {selectedEvidence.originalFilename}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  {/* Preview */}
                  <div className="bg-muted rounded-lg flex items-center justify-center p-2 min-h-[200px]">
                    {selectedEvidence.type === 'image' ? (
                      <img 
                        src={selectedEvidence.url} 
                        alt={selectedEvidence.filename} 
                        className="max-h-[300px] max-w-full object-contain"
                      />
                    ) : selectedEvidence.type === 'video' ? (
                      <video 
                        src={selectedEvidence.url} 
                        controls 
                        className="max-h-[300px] max-w-full"
                      />
                    ) : selectedEvidence.type === 'audio' ? (
                      <audio 
                        src={selectedEvidence.url} 
                        controls 
                        className="w-full"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        {getFileIcon(selectedEvidence.type)}
                        <span className="mt-2 text-sm font-medium">
                          {selectedEvidence.type.charAt(0).toUpperCase() + selectedEvidence.type.slice(1)} File
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          Preview not available
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">File Information</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>Type:</div>
                        <div className="font-medium">{selectedEvidence.type.charAt(0).toUpperCase() + selectedEvidence.type.slice(1)}</div>
                        
                        <div>Size:</div>
                        <div className="font-medium">{formatFileSize(selectedEvidence.fileSize)}</div>
                        
                        <div>Added:</div>
                        <div className="font-medium">{formatDate(selectedEvidence.addedAt)}</div>
                        
                        <div>Added By:</div>
                        <div className="font-medium">{selectedEvidence.addedBy.name}</div>
                        
                        {selectedEvidence.metadata.createdAt && (
                          <>
                            <div>Created:</div>
                            <div className="font-medium">{formatDate(selectedEvidence.metadata.createdAt)}</div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {selectedEvidence.location && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <div>{selectedEvidence.location.address}</div>
                            <div className="text-xs text-muted-foreground">
                              Lat: {selectedEvidence.location.latitude.toFixed(6)}, 
                              Lng: {selectedEvidence.location.longitude.toFixed(6)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvidence.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {selectedEvidence.transcription && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Transcription</h3>
                        <div className="bg-muted p-3 rounded-md text-sm max-h-[100px] overflow-y-auto">
                          {selectedEvidence.transcription}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open(selectedEvidence.url, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="gap-2"
                    onClick={() => {
                      removeEvidence(selectedEvidence.id);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EvidenceUploader;
