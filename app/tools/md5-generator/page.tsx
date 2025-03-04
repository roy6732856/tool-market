"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Key, Copy, CheckCircle2, UploadCloud, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { tools } from "@/app/tools/data/toolsData";
import Head from "next/head";
// 如果您決定使用 crypto-js，需要安裝並導入它
import { MD5 } from 'crypto-js';

export default function MD5GeneratorPage() {
  const [tool, setTool] = useState<any>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<string>(""); // 用於跟踪使用的方法

  useEffect(() => {
    // 在客戶端加載工具數據
    const foundTool = tools.find(t => t.id === "md5-generator");
    if (foundTool) {
      setTool(foundTool);
    }
  }, []);

  // 使用 useCallback 優化性能
  const generateMD5 = useCallback(async () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      let hashHex = "";
      
      // 方法 1: 嘗試使用 SubtleCrypto API
      try {
        // 檢查瀏覽器是否支持 SubtleCrypto API
        if (window.crypto && window.crypto.subtle) {
          const encoder = new TextEncoder();
          const data = encoder.encode(input);
          
          // 嘗試生成 MD5 哈希
          const hashBuffer = await crypto.subtle.digest('MD5', data);
          
          // 轉換 ArrayBuffer 為十六進制字符串
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          setMethod("Web Crypto API");
        } else {
          throw new Error("Web Crypto API not supported");
        }
      } catch (cryptoError) {
        console.warn("SubtleCrypto failed:", cryptoError);
        
        // 方法 2: 使用 crypto-js 庫
        try {
          hashHex = MD5(input).toString();
          setMethod("crypto-js");
        } catch (cryptoJsError) {
          console.error("crypto-js failed:", cryptoJsError);
          throw new Error("Failed to generate MD5 hash");
        }
      }
      
      setOutput(hashHex);
    } catch (err) {
      console.error("MD5 generation error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setOutput("");
    } finally {
      setIsGenerating(false);
    }
  }, [input]);

  // 處理文件上傳，支持大文件
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    
    // 對於較大文件，顯示警告
    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError("Large files may cause performance issues. Processing may take longer.");
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setInput(content);
      } catch (err) {
        setError("Failed to read file. Please try again.");
      }
    };
    
    reader.onerror = () => {
      setError("Error reading file. Please try again.");
    };
    
    reader.readAsText(file);
    
    // Reset file input value
    event.target.value = '';
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(output)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Failed to copy:", err);
        setError("Failed to copy to clipboard");
      });
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
    setMethod("");
  };

  return (
    <>
      <Head>
        <title>{tool?.name || 'MD5 Generator'} | Tool Market</title>
      </Head>
      <div className="flex flex-col h-screen bg-background">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">{tool?.name || 'MD5 Generator'}</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {tool?.longDescription || 'Generate MD5 hashes from text or files'}
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
                      accept=".txt,.md,.json,.csv,.html,.xml,.js,.ts,.jsx,.tsx,.css,.scss"
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
                <Alert variant={error.includes("Large files") ? "default" : "destructive"} className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              
              <div className="flex-1 flex items-center justify-center">
                {output ? (
                  <div className="w-full">
                    <div className="bg-muted p-4 rounded-md font-mono text-center overflow-x-auto">
                      {output}
                    </div>
                    <div className="text-xs text-center text-gray-500 mt-2">
                      <p>MD5 hash of your input text</p>
                      {method && <p className="mt-1">Method used: {method}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    {error && !error.includes("Large files") 
                      ? "An error occurred while generating the hash" 
                      : "Enter text and click 'Generate MD5 Hash' to see the result"}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
