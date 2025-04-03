import React, { useState } from 'react';
import { Sparkles, Loader2, AlertTriangle, CheckCircle, ArrowRight, Lightbulb, Pencil, Scale, FileCheck, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import axios from 'axios';

// Define the props interface
interface AIReportEnhancerProps {
  reportId: string;
  reportContent: string;
  onEnhancementApplied?: (enhancedContent: string) => void;
}

// Define the enhancement result interface
interface EnhancementResult {
  grammar: {
    issues: number;
    suggestions: Array<{ original: string; corrected: string }>;
  };
  clarity: {
    score: number;
    suggestions: Array<{ section: string; suggestion: string }>;
  };
  completeness: {
    score: number;
    missingElements: string[];
  };
  legalTerminology: {
    suggestions: Array<{ original: string; preferred: string }>;
  };
  bias: {
    detected: boolean;
    suggestions: Array<{ original: string; suggestion: string }>;
  };
}

const AIReportEnhancer: React.FC<AIReportEnhancerProps> = ({ 
  reportId, 
  reportContent, 
  onEnhancementApplied 
}) => {
  // State
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('grammar');
  const [enhancedContent, setEnhancedContent] = useState<string | null>(null);
  
  // Function to enhance the report
  const enhanceReport = async () => {
    try {
      setIsEnhancing(true);
      setError(null);
      
      // Call the API to enhance the report
      const response = await axios.post(`/api/reports/${reportId}/enhance`, {
        content: reportContent
      });
      
      // Check if the request was successful
      if (response.data.success) {
        setEnhancementResult(response.data.data);
        
        // Generate enhanced content by applying all corrections
        let content = reportContent;
        
        // Apply grammar corrections
        response.data.data.grammar.suggestions.forEach((suggestion: { original: string; corrected: string }) => {
          content = content.replace(suggestion.original, suggestion.corrected);
        });
        
        // Apply legal terminology corrections
        response.data.data.legalTerminology.suggestions.forEach((suggestion: { original: string; preferred: string }) => {
          content = content.replace(suggestion.original, suggestion.preferred);
        });
        
        setEnhancedContent(content);
      } else {
        throw new Error(response.data.error || 'Failed to enhance report');
      }
    } catch (err) {
      console.error('Error enhancing report:', err);
      setError('Failed to enhance report. Please try again later.');
    } finally {
      setIsEnhancing(false);
    }
  };
  
  // Function to apply enhancements
  const applyEnhancements = () => {
    if (enhancedContent && onEnhancementApplied) {
      onEnhancementApplied(enhancedContent);
    }
  };
  
  // Calculate overall score
  const calculateOverallScore = (): number => {
    if (!enhancementResult) return 0;
    
    const grammarScore = 100 - (enhancementResult.grammar.issues * 5);
    return Math.round((grammarScore + enhancementResult.clarity.score + enhancementResult.completeness.score) / 3);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          AI Report Enhancement
        </CardTitle>
        <CardDescription>
          Use AI to improve grammar, clarity, completeness, and legal terminology
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!enhancementResult ? (
          <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-muted/20">
            <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Enhance Your Report</h3>
            <p className="text-center text-muted-foreground mb-4 max-w-md">
              Our AI will analyze your report for grammar, clarity, completeness, legal terminology, and potential bias.
            </p>
            <Button 
              variant="default" 
              size="lg" 
              className="gap-2"
              onClick={enhanceReport}
              disabled={isEnhancing}
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Report...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Enhance Report
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Overall Score */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="w-32 h-32 relative flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-muted-foreground/20"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-primary"
                    strokeWidth="8"
                    strokeDasharray={`${calculateOverallScore() * 2.51} 251`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{calculateOverallScore()}</span>
                  <span className="text-xs text-muted-foreground">Overall Score</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Grammar & Spelling</span>
                    <span className="text-sm">{100 - (enhancementResult.grammar.issues * 5)}%</span>
                  </div>
                  <Progress value={100 - (enhancementResult.grammar.issues * 5)} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Clarity</span>
                    <span className="text-sm">{enhancementResult.clarity.score}%</span>
                  </div>
                  <Progress value={enhancementResult.clarity.score} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Completeness</span>
                    <span className="text-sm">{enhancementResult.completeness.score}%</span>
                  </div>
                  <Progress value={enhancementResult.completeness.score} className="h-2" />
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Pencil className="h-3 w-3" />
                    {enhancementResult.grammar.issues} Grammar Issues
                  </Badge>
                  
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" />
                    {enhancementResult.clarity.suggestions.length} Clarity Suggestions
                  </Badge>
                  
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileCheck className="h-3 w-3" />
                    {enhancementResult.completeness.missingElements.length} Missing Elements
                  </Badge>
                  
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Scale className="h-3 w-3" />
                    {enhancementResult.legalTerminology.suggestions.length} Legal Terms
                  </Badge>
                  
                  {enhancementResult.bias.detected && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Potential Bias Detected
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            {/* Detailed Suggestions */}
            <Tabs defaultValue="grammar" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="grammar">Grammar</TabsTrigger>
                <TabsTrigger value="clarity">Clarity</TabsTrigger>
                <TabsTrigger value="completeness">Completeness</TabsTrigger>
                <TabsTrigger value="legal">Legal Terms</TabsTrigger>
                <TabsTrigger value="bias">Bias Check</TabsTrigger>
              </TabsList>
              
              <TabsContent value="grammar" className="space-y-4">
                <h3 className="text-lg font-semibold">Grammar & Spelling Suggestions</h3>
                {enhancementResult.grammar.suggestions.length === 0 ? (
                  <p className="text-muted-foreground">No grammar or spelling issues found.</p>
                ) : (
                  <div className="space-y-3">
                    {enhancementResult.grammar.suggestions.map((suggestion, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-start gap-2">
                              <Badge variant="destructive" className="mt-1">Original</Badge>
                              <p className="flex-1">{suggestion.original}</p>
                            </div>
                            <div className="flex items-center">
                              <ArrowRight className="h-4 w-4 text-muted-foreground mx-6" />
                            </div>
                            <div className="flex items-start gap-2">
                              <Badge variant="default" className="bg-green-500 mt-1">Corrected</Badge>
                              <p className="flex-1">{suggestion.corrected}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="clarity" className="space-y-4">
                <h3 className="text-lg font-semibold">Clarity Suggestions</h3>
                {enhancementResult.clarity.suggestions.length === 0 ? (
                  <p className="text-muted-foreground">No clarity issues found.</p>
                ) : (
                  <div className="space-y-3">
                    {enhancementResult.clarity.suggestions.map((suggestion, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-start gap-2">
                              <Badge variant="secondary" className="mt-1">{suggestion.section}</Badge>
                              <p className="flex-1">{suggestion.suggestion}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completeness" className="space-y-4">
                <h3 className="text-lg font-semibold">Completeness Check</h3>
                {enhancementResult.completeness.missingElements.length === 0 ? (
                  <p className="text-muted-foreground">Your report appears to be complete.</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-muted-foreground">Consider adding the following elements to your report:</p>
                    <ul className="space-y-2">
                      {enhancementResult.completeness.missingElements.map((element, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Zap className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span>{element}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="legal" className="space-y-4">
                <h3 className="text-lg font-semibold">Legal Terminology Suggestions</h3>
                {enhancementResult.legalTerminology.suggestions.length === 0 ? (
                  <p className="text-muted-foreground">No legal terminology issues found.</p>
                ) : (
                  <div className="space-y-3">
                    {enhancementResult.legalTerminology.suggestions.map((suggestion, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-start gap-2">
                              <Badge variant="outline" className="mt-1">Original</Badge>
                              <p className="flex-1">"{suggestion.original}"</p>
                            </div>
                            <div className="flex items-center">
                              <ArrowRight className="h-4 w-4 text-muted-foreground mx-6" />
                            </div>
                            <div className="flex items-start gap-2">
                              <Badge variant="secondary" className="mt-1">Preferred</Badge>
                              <p className="flex-1">"{suggestion.preferred}"</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="bias" className="space-y-4">
                <h3 className="text-lg font-semibold">Bias Check</h3>
                {!enhancementResult.bias.detected ? (
                  <div className="flex items-start gap-2 bg-green-500/10 text-green-500 p-4 rounded-md">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">No potential bias detected</p>
                      <p className="text-sm">Your report appears to use neutral and objective language.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 bg-yellow-500/10 text-yellow-500 p-4 rounded-md">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Potential bias detected</p>
                        <p className="text-sm">Consider revising the following language to be more neutral and objective.</p>
                      </div>
                    </div>
                    
                    {enhancementResult.bias.suggestions.map((suggestion, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-start gap-2">
                              <Badge variant="destructive" className="mt-1">Potentially Biased</Badge>
                              <p className="flex-1">"{suggestion.original}"</p>
                            </div>
                            <div className="flex items-center">
                              <ArrowRight className="h-4 w-4 text-muted-foreground mx-6" />
                            </div>
                            <div className="flex items-start gap-2">
                              <Badge variant="default" className="bg-green-500 mt-1">Suggested</Badge>
                              <p className="flex-1">"{suggestion.suggestion}"</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        {enhancementResult && (
          <>
            <Button 
              variant="outline" 
              onClick={() => {
                setEnhancementResult(null);
                setEnhancedContent(null);
                setError(null);
              }}
            >
              Reset
            </Button>
            <Button 
              variant="default" 
              className="gap-2"
              onClick={applyEnhancements}
              disabled={!enhancedContent}
            >
              <CheckCircle className="h-4 w-4" />
              Apply All Enhancements
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default AIReportEnhancer;
