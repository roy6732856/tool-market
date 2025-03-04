"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { FileText, Copy, CheckCircle2, DownloadCloud, UploadCloud, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

export default function JsonParser() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("pretty");

  // Parse JSON when input changes or tab changes
  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const parsedJson = JSON.parse(input);
      
      if (activeTab === "pretty") {
        setOutput(JSON.stringify(parsedJson, null, 2));
      } else {
        setOutput(JSON.stringify(parsedJson));
      }
      
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setOutput("");
    }
  }, [input, activeTab]);

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

  const handleDownload = () => {
    if (!output) return;
    
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "parsed-json.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const sampleJson = `{
  "name": "JSON Parser Tool",
  "version": "1.0.0",
  "features": ["Prettify", "Minify", "Validate"],
  "active": true,
  "stats": {
    "users": 1000,
    "rating": 4.8
  }
}`;

  const handleLoadSample = () => {
    setInput(sampleJson);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">JSON Parser</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          解析、驗證和格式化您的 JSON 資料
        </p>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          <Card className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">輸入 JSON</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleLoadSample}>
                  載入範例
                </Button>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  清除
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" size="sm">
                    <UploadCloud className="h-4 w-4 mr-1" />
                    上傳
                  </Button>
                </div>
              </div>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在此貼上您的 JSON..."
              className="flex-1 font-mono text-sm resize-none"
            />
          </Card>

          <Card className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">輸出</h2>
              <div className="flex space-x-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[200px]">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="pretty">美化</TabsTrigger>
                    <TabsTrigger value="minify">壓縮</TabsTrigger>
                  </TabsList>
                </Tabs>
                {output && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <DownloadCloud className="h-4 w-4 mr-1" />
                      下載
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                          已複製
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          複製
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            
            <div className="flex-1 overflow-auto">
              {output ? (
                <pre className="font-mono text-sm p-4 bg-muted rounded-md h-full overflow-auto">
                  {output}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {error ? "修正 JSON 錯誤以查看輸出" : "在輸入欄位中輸入 JSON 以查看解析結果"}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}