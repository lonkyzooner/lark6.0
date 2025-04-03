import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Search, 
  BookOpen, 
  HelpCircle, 
  Video, 
  FileText, 
  MessageSquare, 
  Mic, 
  Shield, 
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  X,
  ChevronRight,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define FAQ items
const FAQ_ITEMS = [
  {
    question: "How do I activate the voice assistant?",
    answer: "You can activate the voice assistant by saying 'Hey LARK' or by tapping the microphone icon in the bottom right corner of the screen.",
    category: "voice"
  },
  {
    question: "Can I use LARK offline?",
    answer: "Yes, LARK has offline capabilities for core features like Miranda rights and statute lookup. However, some advanced features require an internet connection.",
    category: "general"
  },
  {
    question: "How do I read Miranda rights in different languages?",
    answer: "Navigate to the Miranda tab and select the desired language from the dropdown menu, or use the voice command 'Read Miranda rights in [language]'.",
    category: "miranda"
  },
  {
    question: "How do I search for a specific statute?",
    answer: "Go to the Statutes tab and use the search bar to find statutes by number, keyword, or description. You can also use voice commands like 'Look up statute [number]'.",
    category: "statutes"
  },
  {
    question: "How do I create a new report?",
    answer: "You can create a new report by navigating to the Reports section and clicking 'New Report', or by using the voice command 'Start new report'.",
    category: "reports"
  },
  {
    question: "How do I update my subscription?",
    answer: "Go to Settings > Subscription to view and manage your current subscription plan. You can upgrade, downgrade, or update your payment information.",
    category: "account"
  },
  {
    question: "Is my data secure?",
    answer: "Yes, LARK uses industry-standard encryption and security practices to protect your data. All sensitive information is encrypted both in transit and at rest.",
    category: "security"
  },
  {
    question: "How do I customize LARK to my preferences?",
    answer: "Go to Settings to customize various aspects of LARK, including voice recognition, notification preferences, and display options.",
    category: "settings"
  },
  {
    question: "Can I share reports with other officers?",
    answer: "Yes, if you have a Standard plan or higher, you can share reports with other officers in your department who also use LARK.",
    category: "reports"
  },
  {
    question: "How do I get help if I encounter an issue?",
    answer: "You can contact support through the Help Center, or email support@larkassistant.com for assistance.",
    category: "support"
  }
];

// Define quick start guides
const QUICK_START_GUIDES = [
  {
    title: "Getting Started with LARK",
    description: "Learn the basics of LARK and get up and running quickly",
    icon: <BookOpen className="h-5 w-5" />,
    category: "general",
    duration: "5 min"
  },
  {
    title: "Voice Assistant Basics",
    description: "Master the voice commands and hands-free operation",
    icon: <Mic className="h-5 w-5" />,
    category: "voice",
    duration: "3 min"
  },
  {
    title: "Miranda Rights Module",
    description: "Learn how to use the Miranda rights feature effectively",
    icon: <Shield className="h-5 w-5" />,
    category: "miranda",
    duration: "4 min"
  },
  {
    title: "Statute Lookup Guide",
    description: "Quickly find and reference legal statutes",
    icon: <FileText className="h-5 w-5" />,
    category: "statutes",
    duration: "6 min"
  },
  {
    title: "Report Writing 101",
    description: "Create professional reports efficiently",
    icon: <FileSpreadsheet className="h-5 w-5" />,
    category: "reports",
    duration: "8 min"
  },
  {
    title: "Threat Assessment Features",
    description: "Understand and use the threat assessment tools",
    icon: <AlertTriangle className="h-5 w-5" />,
    category: "threats",
    duration: "7 min"
  }
];

// Define video tutorials
const VIDEO_TUTORIALS = [
  {
    title: "Complete LARK Overview",
    description: "A comprehensive tour of all LARK features",
    thumbnail: "/assets/videos/overview-thumbnail.jpg",
    duration: "12:34",
    category: "general"
  },
  {
    title: "Voice Command Mastery",
    description: "Learn all the voice commands available in LARK",
    thumbnail: "/assets/videos/voice-thumbnail.jpg",
    duration: "8:21",
    category: "voice"
  },
  {
    title: "Advanced Report Writing",
    description: "Create detailed, professional reports with LARK",
    thumbnail: "/assets/videos/reports-thumbnail.jpg",
    duration: "15:47",
    category: "reports"
  },
  {
    title: "Statute Search Techniques",
    description: "Find the right statutes quickly and efficiently",
    thumbnail: "/assets/videos/statutes-thumbnail.jpg",
    duration: "6:18",
    category: "statutes"
  },
  {
    title: "Miranda Rights in Multiple Languages",
    description: "Deliver Miranda rights correctly in any situation",
    thumbnail: "/assets/videos/miranda-thumbnail.jpg",
    duration: "5:32",
    category: "miranda"
  },
  {
    title: "Threat Assessment in the Field",
    description: "Use LARK to assess and respond to threats",
    thumbnail: "/assets/videos/threats-thumbnail.jpg",
    duration: "10:05",
    category: "threats"
  }
];

const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  
  // Filter FAQ items based on search query and category
  const filteredFAQs = FAQ_ITEMS.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Filter guides based on search query and category
  const filteredGuides = QUICK_START_GUIDES.filter(guide => {
    const matchesSearch = searchQuery === '' || 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || guide.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Filter videos based on search query and category
  const filteredVideos = VIDEO_TUTORIALS.filter(video => {
    const matchesSearch = searchQuery === '' || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || video.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle category filter change
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };
  
  // Handle article expansion
  const handleArticleExpand = (articleId: string) => {
    setExpandedArticle(expandedArticle === articleId ? null : articleId);
  };
  
  // Get badge color based on category
  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      voice: 'bg-blue-100 text-blue-800',
      miranda: 'bg-green-100 text-green-800',
      statutes: 'bg-purple-100 text-purple-800',
      reports: 'bg-amber-100 text-amber-800',
      threats: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800',
      account: 'bg-indigo-100 text-indigo-800',
      security: 'bg-emerald-100 text-emerald-800',
      settings: 'bg-slate-100 text-slate-800',
      support: 'bg-pink-100 text-pink-800'
    };
    
    return categoryColors[category] || 'bg-gray-100 text-gray-800';
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Help Center</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Search for help..." 
                className="pl-10"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={selectedCategory === null ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleCategoryChange(null)}
              >
                All
              </Button>
              <Button 
                variant={selectedCategory === 'voice' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleCategoryChange('voice')}
              >
                Voice
              </Button>
              <Button 
                variant={selectedCategory === 'miranda' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleCategoryChange('miranda')}
              >
                Miranda
              </Button>
              <Button 
                variant={selectedCategory === 'statutes' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleCategoryChange('statutes')}
              >
                Statutes
              </Button>
              <Button 
                variant={selectedCategory === 'reports' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleCategoryChange('reports')}
              >
                Reports
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="faq" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b px-6">
            <TabsList className="h-14">
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>FAQ</span>
              </TabsTrigger>
              <TabsTrigger value="guides" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Quick Start Guides</span>
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span>Video Tutorials</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span>Contact Support</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <ScrollArea className="flex-1 p-6">
            <TabsContent value="faq" className="mt-0 h-full">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h3>
                
                {filteredFAQs.length === 0 ? (
                  <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No results found</h4>
                    <p className="text-gray-500">
                      Try adjusting your search or filter to find what you're looking for.
                    </p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="space-y-4">
                    {filteredFAQs.map((faq, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`faq-${index}`}
                        className="border rounded-lg px-2"
                      >
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex flex-col items-start text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{faq.question}</span>
                              <Badge className={`ml-2 ${getCategoryColor(faq.category)}`}>
                                {faq.category}
                              </Badge>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">
                          <p className="text-gray-700">{faq.answer}</p>
                          <div className="flex items-center justify-end gap-4 mt-4">
                            <span className="text-sm text-gray-500">Was this helpful?</span>
                            <Button variant="outline" size="sm" className="h-8 px-3">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Yes
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 px-3">
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              No
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="guides" className="mt-0 h-full">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Quick Start Guides</h3>
                
                {filteredGuides.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No guides found</h4>
                    <p className="text-gray-500">
                      Try adjusting your search or filter to find what you're looking for.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredGuides.map((guide, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${getCategoryColor(guide.category).split(' ')[0]}`}>
                                {guide.icon}
                              </div>
                              <div>
                                <CardTitle className="text-lg">{guide.title}</CardTitle>
                                <CardDescription>{guide.description}</CardDescription>
                              </div>
                            </div>
                            <Badge variant="outline">{guide.duration}</Badge>
                          </div>
                        </CardHeader>
                        <CardFooter className="pt-3 border-t">
                          <Button variant="ghost" className="ml-auto flex items-center gap-1">
                            Read Guide
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="videos" className="mt-0 h-full">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Video Tutorials</h3>
                
                {filteredVideos.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No videos found</h4>
                    <p className="text-gray-500">
                      Try adjusting your search or filter to find what you're looking for.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredVideos.map((video, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative aspect-video bg-gray-100">
                          {/* In a real implementation, this would be an actual thumbnail image */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm">
                              <Video className="h-6 w-6" />
                            </Button>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {video.duration}
                          </div>
                        </div>
                        <CardHeader className="pb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg">{video.title}</CardTitle>
                              <Badge className={getCategoryColor(video.category)}>
                                {video.category}
                              </Badge>
                            </div>
                            <CardDescription>{video.description}</CardDescription>
                          </div>
                        </CardHeader>
                        <CardFooter className="pt-3 border-t">
                          <Button variant="ghost" className="ml-auto flex items-center gap-1">
                            Watch Video
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="mt-0 h-full">
              <div className="max-w-2xl mx-auto space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Contact Support</h3>
                
                <p className="text-gray-600">
                  Need help with something specific? Our support team is here to assist you.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        Email Support
                      </CardTitle>
                      <CardDescription>
                        Send us an email and we'll respond within 24 hours
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-blue-600 font-medium">support@larkassistant.com</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Send Email</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        Live Chat
                      </CardTitle>
                      <CardDescription>
                        Chat with a support agent in real-time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">Available Monday-Friday, 9am-5pm ET</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Start Chat</Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Support Hours
                  </h4>
                  <p className="text-blue-700 mb-4">
                    Our support team is available during the following hours:
                  </p>
                  <ul className="space-y-2 text-blue-700">
                    <li className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span>9:00 AM - 8:00 PM ET</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Saturday:</span>
                      <span>10:00 AM - 6:00 PM ET</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Sunday:</span>
                      <span>Closed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};

export default HelpCenter;
