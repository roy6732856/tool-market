"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Trash2, Download, Copy } from "lucide-react";
import { Textarea } from "@/app/components/ui/textarea";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

interface JsonError {
  message: string;
  line?: number;
  column?: number;
  position?: number;
}

const sampleJson = {
  name: "John Doe",
  age: 30,
  email: "john@example.com",
  address: {
    street: "123 Main St",
    city: "New York",
    country: "USA"
  },
  hobbies: ["reading", "gaming", "traveling"]
};

export default function JsonParserPage() {
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<JsonError | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPretty, setIsPretty] = useState(true);

  // 自動解析 JSON
  useEffect(() => {
    if (input.trim()) {
      formatJson(isPretty);
    } else {
      setOutput("");
      setError(null);
    }
  }, [input, isPretty]);

  const getErrorDetails = (err: Error, input: string): JsonError => {
    const message = err.message;
    let line = 1;
    let column = 0;
    let position: number | undefined;

    const positionMatch = message.match(/position (\d+)/);
    if (positionMatch) {
      position = parseInt(positionMatch[1], 10);
      
      const inputUpToError = input.slice(0, position);
      const lines = inputUpToError.split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    let errorType = "Format Error";
    if (message.includes("Unexpected token")) {
      errorType = "Unexpected Token";
    } else if (message.includes("Unexpected end of JSON input")) {
      errorType = "Incomplete JSON";
    } else if (message.includes("Unexpected end of input")) {
      errorType = "Incomplete Input";
    }

    return {
      message: `${errorType}${line ? ` (Line ${line}, Column ${column})` : ''}`,
      line,
      column,
      position
    };
  };

  const formatJson = (pretty: boolean = true) => {
    if (!input.trim()) {
      return;
    }

    try {
      const cleanInput = input
        .replace(/\\n/g, '')
        .replace(/\\t/g, '')
        .replace(/\\r/g, '')
        .trim();

      const parsed = JSON.parse(cleanInput);
      
      const formatted = pretty
        ? JSON.stringify(parsed, null, 2)
        : JSON.stringify(parsed);
      
      setOutput(formatted);
      setError(null);
    } catch (err) {
      console.error("JSON parsing error:", err);
      setError(getErrorDetails(err as Error, input));
      setOutput("");
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const handleLoadSample = () => {
    setInput(JSON.stringify(sampleJson, null, 2));
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setInput(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderErrorHighlight = () => {
    if (!error?.position || !input) return null;

    const lines = input.split('\n');
    const errorLine = error.line ? error.line - 1 : 0;
    const errorColumn = error.column ? error.column - 1 : 0;

    return (
      <div className="font-mono text-sm mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">
        <div className="text-red-600 dark:text-red-400 mb-1">
          {error.message}
        </div>
        <div className="whitespace-pre">
          {lines[errorLine]}
        </div>
        {error.column && (
          <div className="text-red-600 dark:text-red-400">
            {' '.repeat(errorColumn)}^ Error position
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">JSON Parser</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Parse, validate, and format JSON data with ease. Supports prettifying and minifying JSON.
        </p>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Input JSON</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleLoadSample}>
                  Load Sample
                </Button>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                <Button variant="outline" size="sm" onClick={handleUpload}>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              </div>
            </div>
            
            <Textarea
              placeholder="Paste your JSON here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="font-mono text-sm min-h-[300px] mb-4"
            />
            
            {error && renderErrorHighlight()}
          </Card>

          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Output</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsPretty(true)}
                  variant={isPretty ? "default" : "outline"}
                  size="sm"
                >
                  Pretty
                </Button>
                <Button 
                  onClick={() => setIsPretty(false)}
                  variant={!isPretty ? "default" : "outline"}
                  size="sm"
                >
                  Minify
                </Button>
                {output && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="h-4 w-4 mr-1" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            <div className="font-mono text-sm whitespace-pre bg-muted p-4 rounded-md min-h-[300px] overflow-auto">
              {output || (
                <span className="text-muted-foreground">
                  Enter JSON in the input field to see the parsed result
                </span>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}