"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Key, Copy, CheckCircle2, UploadCloud, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { tools } from "../data/toolsData";

export default function MD5GeneratorPage() {
  const tool = tools.find(t => t.id === "md5-generator");
  
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMD5 = async () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      // Convert the string to an ArrayBuffer
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      
      // Generate the MD5 hash using the SubtleCrypto API
      const hashBuffer = await crypto.subtle.digest('MD5', data);
      
      // Convert the ArrayBuffer to a hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      setOutput(hashHex);
    } catch (err) {
      setError((err as Error).message);
      setOutput("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInput(content);
    };
    reader.readAsText(file);
    
    // Reset file input value so the same file can be uploaded again
    event.target.value = '';
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Key className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">{tool?.name}</h1>
                </div>
        <p className="text-muted-foreground mt-1">
          {tool?.longDescription}
        </p>
            </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          <Card className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Input Text</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" size="sm">
                    <UploadCloud className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                </div>
              </div>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to generate MD5 hash..."
              className="flex-1 font-mono text-sm resize-none"
                  />
            <div className="mt-4">
              <Button 
                onClick={generateMD5} 
                className="w-full"
                disabled={isGenerating || !input.trim()}
              >
                {isGenerating ? 'Generating...' : 'Generate MD5 Hash'}
              </Button>
                </div>
          </Card>

          <Card className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">MD5 Hash</h2>
              {output && (
                <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              )}
        </div>
            
            {error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            
            <div className="flex-1 flex items-center justify-center">
              {output ? (
                <div className="w-full">
                  <div className="bg-muted p-4 rounded-md font-mono text-center overflow-x-auto">
                    {output}
      </div>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    MD5 hash of your input text
                  </p>
    </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  {error ? "An error occurred while generating the hash" : "Enter text and click 'Generate MD5 Hash' to see the result"}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}