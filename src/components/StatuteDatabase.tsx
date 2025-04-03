import React, { useState, useRef } from 'react';
import { handleStatuteLookup } from './RSCodes';
import { useVoice } from '../contexts/VoiceContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { BookOpen, Search, ExternalLink, Loader2, HelpCircle, FileText } from 'lucide-react';

interface StatuteProps {
  statute: string;
  description: string;
}

const StatuteDatabase: React.FC<StatuteProps> = ({ statute, description }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [suggestedCharges, setSuggestedCharges] = useState<string[]>([]);
  const [statuteUrl, setStatuteUrl] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const { speak } = useVoice();

  // Call the handleStatuteLookup function with all required parameters
  const handleStatuteLookupLocal = () => {
    handleStatuteLookup(
      statute,
      setIsLoading,
      setResult,
      setSuggestedCharges,
      speak,
      resultRef,
      setStatuteUrl
    );
  };

  return (
    <Card className="fluid-card enhanced-card border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 mb-4 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#002166]/10 rounded-full">
            <BookOpen className="h-5 w-5 text-[#002166]" />
          </div>
          <div>
            <CardTitle className="text-[#002166]">RS CODE REFERENCE</CardTitle>
            <CardDescription>
              {statute} - {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-[#002166] border-blue-200 px-2 py-1 font-medium">
            {statute}
          </Badge>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <Button
          onClick={handleStatuteLookupLocal}
          className="bg-gradient-to-r from-[#002166] to-[#0046c7] text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active-press flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Lookup Statute</span>
            </>
          )}
        </Button>

        {/* Hidden result container for scrolling */}
        <div ref={resultRef} className="hidden"></div>

        {/* Show results if available */}
        {result && (
          <div className="mt-3 p-4 bg-blue-50 rounded-md text-sm text-slate-800 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-[#002166]" />
              <h4 className="font-medium text-[#002166]">Statute Information</h4>
            </div>
            <p className="whitespace-pre-line">{result}</p>
            {statuteUrl && (
              <a
                href={statuteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[#002166] hover:text-[#0046c7] transition-colors font-medium text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View Official Statute</span>
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatuteDatabase;
