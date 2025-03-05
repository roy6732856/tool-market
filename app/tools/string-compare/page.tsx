"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Files, Copy, CheckCircle2, Trash2 } from "lucide-react";
import { tools } from "@/app/tools/data/toolsData";
import { cn } from "@/lib/utils";

// Import components from their correct locations
import { Textarea } from "@/app/components/ui/textarea";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";

export default function StringComparePage() {
  const [tool, setTool] = useState<any>(null);
  const [stringA, setStringA] = useState<string>("");
  const [stringB, setStringB] = useState<string>("");
  const [result, setResult] = useState<{
    differences: number;
    diffText: string;
    charactersA: number;
    charactersB: number;
    wordsA: number;
    wordsB: number;
    linesA: number;
    linesB: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("visual");

  useEffect(() => {
    // Load tool data on client side
    const foundTool = tools.find(t => t.id === "string-compare");
    if (foundTool) {
      setTool(foundTool);
    }
  }, []);

  const handleClear = () => {
    setStringA("");
    setStringB("");
    setResult(null);
    setError(null);
  };

  // Function to find differences between two strings
  const compareStrings = () => {
    if (!stringA.trim() && !stringB.trim()) {
      setError("Both strings are empty. Please enter some text to compare.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Count basic statistics
      const charactersA = stringA.length;
      const charactersB = stringB.length;
      const wordsA = stringA.trim() ? stringA.trim().split(/\s+/).length : 0;
      const wordsB = stringB.trim() ? stringB.trim().split(/\s+/).length : 0;
      const linesA = stringA.split('\n').length;
      const linesB = stringB.split('\n').length;

      // Simple difference calculation - can be enhanced for more sophisticated comparison
      let differences = 0;
      const maxLength = Math.max(stringA.length, stringB.length);
      
      for (let i = 0; i < maxLength; i++) {
        if (stringA[i] !== stringB[i]) {
          differences++;
        }
      }

      // Generate visual diff
      const diffText = generateVisualDiff(stringA, stringB);

      setResult({
        differences,
        diffText,
        charactersA,
        charactersB,
        wordsA,
        wordsB,
        linesA,
        linesB
      });
    } catch (error) {
      console.error("Comparison error:", error);
      setError(error instanceof Error ? error.message : "An error occurred during comparison");
    } finally {
      setLoading(false);
    }
  };

  // Function to generate a visual diff between two strings
  const generateVisualDiff = (a: string, b: string) => {
    const aLines = a.split('\n');
    const bLines = b.split('\n');
    const diffLines: string[] = [];
    
    // Find the maximum number of lines to process
    const maxLines = Math.max(aLines.length, bLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const lineA = aLines[i] || '';
      const lineB = bLines[i] || '';
      
      if (lineA === lineB) {
        diffLines.push(lineA);
      } else {
        // Mark different lines
        diffLines.push(`- ${lineA}`);
        diffLines.push(`+ ${lineB}`);
      }
    }
    
    return diffLines.join('\n');
  };

  const handleCopyToClipboard = () => {
    if (!result) return;
    
    const resultText = `String Comparison Results:
Differences: ${result.differences}
String A: ${result.charactersA} characters, ${result.wordsA} words, ${result.linesA} lines
String B: ${result.charactersB} characters, ${result.wordsB} words, ${result.linesB} lines

Diff:
${result.diffText}`;
      
    navigator.clipboard.writeText(resultText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Failed to copy:", err);
        setError("Failed to copy to clipboard");
      });
  };

  // Function to render the visual diff with highlighting
  const renderVisualDiff = () => {
    if (!result) return null;
    
    const lines = result.diffText.split('\n');
    
    return lines.map((line, index) => {
      if (line.startsWith('- ')) {
        return (
          <div key={index} className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
            {line}
          </div>
        );
      } else if (line.startsWith('+ ')) {
        return (
          <div key={index} className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
            {line}
          </div>
        );
      } else {
        return (
          <div key={index} className="px-2 py-1">
            {line}
          </div>
        );
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Files className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">{tool?.name || 'String Compare'}</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          {tool?.longDescription || 'Compare two strings to find differences between them. Highlights additions, deletions, and changes.'}
        </p>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          <Card className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Input Strings</h2>
              <Button variant="outline" size="sm" onClick={handleClear}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
            
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex-1 min-h-[200px]">
                <label className="block text-sm font-medium mb-2">String A:</label>
                <Textarea
                  placeholder="Enter the first string to compare"
                  value={stringA}
                  onChange={(e) => setStringA(e.target.value)}
                  className="font-mono text-sm h-[calc(100%-2rem)] w-full resize-none"
                />
              </div>
              
              <div className="flex-1 min-h-[200px]">
                <label className="block text-sm font-medium mb-2">String B:</label>
                <Textarea
                  placeholder="Enter the second string to compare"
                  value={stringB}
                  onChange={(e) => setStringB(e.target.value)}
                  className="font-mono text-sm h-[calc(100%-2rem)] w-full resize-none"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                onClick={compareStrings} 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Comparing...' : 'Compare Strings'}
              </Button>
            </div>
          </Card>

          <Card className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Comparison Result</h2>
              {result && (
                <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Results
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {result ? (
              <div className="flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-muted p-3 rounded-md">
                    <div className="text-sm font-medium mb-1">String A</div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="font-semibold">{result.charactersA}</span>
                        <span className="text-muted-foreground ml-1">chars</span>
                      </div>
                      <div>
                        <span className="font-semibold">{result.wordsA}</span>
                        <span className="text-muted-foreground ml-1">words</span>
                      </div>
                      <div>
                        <span className="font-semibold">{result.linesA}</span>
                        <span className="text-muted-foreground ml-1">lines</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="text-sm font-medium mb-1">String B</div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="font-semibold">{result.charactersB}</span>
                        <span className="text-muted-foreground ml-1">chars</span>
                      </div>
                      <div>
                        <span className="font-semibold">{result.wordsB}</span>
                        <span className="text-muted-foreground ml-1">words</span>
                      </div>
                      <div>
                        <span className="font-semibold">{result.linesB}</span>
                        <span className="text-muted-foreground ml-1">lines</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted p-3 rounded-md mb-4">
                  <div className="text-sm font-medium mb-1">Differences</div>
                  <div className="text-2xl font-bold">{result.differences}</div>
                </div>

                <Tabs 
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex-1 flex flex-col"
                >
                  <TabsList>
                    <TabsTrigger value="visual">Visual Diff</TabsTrigger>
                    <TabsTrigger value="text">Text Diff</TabsTrigger>
                  </TabsList>
                  <TabsContent value="visual" className="flex-1 overflow-auto">
                    <div className="bg-muted p-4 rounded-md font-mono text-sm h-full overflow-auto">
                      {renderVisualDiff()}
                    </div>
                  </TabsContent>
                  <TabsContent value="text" className="flex-1 overflow-auto">
                    <div className="bg-muted p-4 rounded-md font-mono text-sm h-full overflow-auto">
                      <pre className="whitespace-pre-wrap">
                        {result.diffText}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  {error 
                    ? "An error occurred during comparison" 
                    : "Enter two strings and click 'Compare Strings' to see the differences"}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}