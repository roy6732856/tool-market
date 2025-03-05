"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Copy, CheckCircle2, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CharacterInfo {
  char: string;
  index: number;
  type: string;
  description: string;
  code: number;
}

export default function StringInspectorPage() {
  const [input, setInput] = useState<string>("");
  const [results, setResults] = useState<CharacterInfo[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredChar, setHoveredChar] = useState<number | null>(null);

  const inspectString = () => {
    if (!input) {
      setError("Please enter text to inspect");
      return;
    }

    const findings: CharacterInfo[] = [];
    
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      const code = char.charCodeAt(0);
      
      if (char === " ") {
        findings.push({
          char,
          index: i,
          type: "space",
          description: "Half-width Space",
          code
        });
      } else if (char === "　") {
        findings.push({
          char,
          index: i,
          type: "fullwidth-space",
          description: "Full-width Space",
          code
        });
      } else if (char === "\t") {
        findings.push({
          char,
          index: i,
          type: "tab",
          description: "Tab Character",
          code
        });
      } else if (char === "\n") {
        findings.push({
          char: "↵",
          index: i,
          type: "newline",
          description: "Line Break",
          code
        });
      } else if (char === "\r") {
        findings.push({
          char: "⏎",
          index: i,
          type: "carriage-return",
          description: "Carriage Return",
          code
        });
      } else if (code > 0xFF && code <= 0xFFEF) {
        findings.push({
          char,
          index: i,
          type: "fullwidth",
          description: "Full-width Character",
          code
        });
      } else if (code < 32 || code === 127) {
        findings.push({
          char: "␣",
          index: i,
          type: "control",
          description: `Control Character (ASCII ${code})`,
          code
        });
      }
    }

    setResults(findings);
    setError(null);
  };

  const handleClear = () => {
    setInput("");
    setResults([]);
    setError(null);
  };

  const handleCopyToClipboard = () => {
    if (results.length === 0) return;
    
    const resultText = results
      .map(r => `Position ${r.index + 1}: ${r.description} (Code: ${r.code})`)
      .join("\n");
      
    navigator.clipboard.writeText(resultText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Copy failed:", err);
        setError("Failed to copy to clipboard");
      });
  };

  const renderHighlightedText = () => {
    if (!input) return null;

    return (
      <div className="relative font-mono text-sm whitespace-pre-wrap break-all">
        {input.split('').map((char, index) => {
          const finding = results.find(r => r.index === index);
          if (finding) {
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={`inline-block px-0.5 cursor-help ${
                        hoveredChar === index ? 'bg-primary text-primary-foreground' : 'bg-yellow-200 dark:bg-yellow-900'
                      }`}
                      onMouseEnter={() => setHoveredChar(index)}
                      onMouseLeave={() => setHoveredChar(null)}
                    >
                      {char === ' ' ? '␣' : char === '\t' ? '→' : char === '\n' ? '↵' : char}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{finding.description}</p>
                    <p className="text-xs">Code: {finding.code}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }
          return <span key={index}>{char}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">String Inspector</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Inspect text for special characters, whitespace, and other potentially problematic characters
        </p>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Input</h2>
              <Button variant="outline" size="sm" onClick={handleClear}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
            
            <Textarea
              placeholder="Paste your text here to inspect"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              className="font-mono text-sm min-h-[100px] mb-4"
            />
            
            <Button 
              onClick={inspectString} 
              className="w-full mb-4"
            >
              Inspect Text
            </Button>

            {results.length > 0 && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="text-sm font-semibold mb-2">Results:</h3>
                {renderHighlightedText()}
              </div>
            )}
          </Card>

          {results.length > 0 && (
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Details</h2>
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
              </div>

              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-md flex items-center justify-between ${
                      hoveredChar === result.index ? 'bg-primary/20' : 'bg-muted'
                    }`}
                    onMouseEnter={() => setHoveredChar(result.index)}
                    onMouseLeave={() => setHoveredChar(null)}
                  >
                    <div>
                      <span className="font-mono bg-primary/10 px-2 py-1 rounded mr-2">
                        Position {result.index + 1}
                      </span>
                      <span className="text-muted-foreground">
                        {result.description}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">
                        Code: {result.code}
                      </span>
                      <span className="font-mono bg-secondary px-2 py-1 rounded">
                        {result.char}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 