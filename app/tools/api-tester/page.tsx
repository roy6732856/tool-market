"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Copy, CheckCircle2, Trash2, Plus, X } from "lucide-react";
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

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestHeader {
  key: string;
  value: string;
}

export default function ApiTesterPage() {
  const [tool, setTool] = useState<any>(null);
  const [url, setUrl] = useState<string>("");
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [headers, setHeaders] = useState<RequestHeader[]>([{ key: "", value: "" }]);
  const [requestBody, setRequestBody] = useState<string>("");
  const [response, setResponse] = useState<{
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
    data?: any;
    error?: string;
    time?: number;
  }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("response");

  useEffect(() => {
    // Load tool data on client side
    const foundTool = tools.find(t => t.id === "api-tester");
    if (foundTool) {
      setTool(foundTool);
    }
  }, []);

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };
    
  const removeHeader = (index: number) => {
    const newHeaders = [...headers];
    newHeaders.splice(index, 1);
    setHeaders(newHeaders);
  };
    
  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleClear = () => {
    setUrl("");
    setMethod("GET");
    setHeaders([{ key: "", value: "" }]);
    setRequestBody("");
    setResponse({});
    setError(null);
  };

  const sendRequest = async () => {
    if (!url) {
      setError("URL is required");
      return;
    }

    // Validate URL format
    try {
      new URL(url);
      } catch (e) {
      setError("Invalid URL format. Make sure to include http:// or https://");
      return;
      }

    setLoading(true);
    setError(null);
    const startTime = performance.now();
    
    try {
      const headersObj: Record<string, string> = {};
      headers.forEach(header => {
        if (header.key && header.value) {
          headersObj[header.key] = header.value;
        }
      });

      const options: RequestInit = {
        method,
        headers: headersObj,
        // Add mode: 'cors' to handle CORS requests better
        mode: 'cors',
      };
      
      if (method !== "GET" && requestBody) {
        try {
          // Try to parse as JSON if it looks like JSON
          if (requestBody.trim().startsWith('{') || requestBody.trim().startsWith('[')) {
            // Parse to validate and then stringify to ensure it's valid JSON
            const parsedBody = JSON.parse(requestBody);
            options.body = JSON.stringify(parsedBody);
            
            // Add Content-Type header if not already set
            if (!headersObj['Content-Type'] && !headersObj['content-type']) {
              options.headers = {
                ...options.headers,
                'Content-Type': 'application/json'
              };
            }
          } else {
            // Use as-is for non-JSON content
            options.body = requestBody;
          }
        } catch (e) {
          // If JSON parsing fails, use the body as-is
          options.body = requestBody;
        }
      }

      const res = await fetch(url, options);
      const contentType = res.headers.get("content-type");
      
      let data;
      try {
        if (contentType?.includes("application/json")) {
          data = await res.json();
        } else {
          data = await res.text();
        }
      } catch (e) {
        data = await res.text();
      }

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        data,
        time: Math.round(performance.now() - startTime),
      });
      
      setActiveTab("response");
    } catch (error) {
      console.error("Fetch error:", error);
      
      let errorMessage = "Failed to fetch";
      if (error instanceof Error) {
        // Provide more detailed error information
        if (error.message.includes("CORS")) {
          errorMessage = "CORS error: The server doesn't allow requests from this origin. Try using a CORS proxy or enable CORS on the server.";
        } else if (error.message.includes("NetworkError")) {
          errorMessage = "Network error: Check your internet connection or the server might be down.";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Failed to fetch: This could be due to CORS restrictions, network issues, or an invalid URL.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setResponse({
        error: errorMessage,
        time: Math.round(performance.now() - startTime),
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    const responseText = typeof response.data === 'object' 
                          ? JSON.stringify(response.data, null, 2)
      : String(response.data || '');
      
    navigator.clipboard.writeText(responseText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Failed to copy:", err);
        setError("Failed to copy to clipboard");
      });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">{tool?.name || 'API Tester'}</h1>
                    </div>
        <p className="text-muted-foreground mt-1">
          {tool?.longDescription || 'Test API endpoints with different methods (GET, POST, PUT, DELETE) and customize headers and request body.'}
        </p>
                        </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          <Card className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Request</h2>
              <Button variant="outline" size="sm" onClick={handleClear}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              {/* Use standard HTML select element styled to match design */}
              <select 
                value={method} 
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className="w-32 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
              <Input
                placeholder="Enter URL (e.g. https://api.example.com/data)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-grow"
              />
              </div>

            <Tabs defaultValue="headers" className="flex-1 flex flex-col">
              <TabsList>
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
              </TabsList>
              <TabsContent value="headers" className="p-4 border rounded-md flex-1 overflow-auto">
                <div className="space-y-2">
                  {headers.map((header, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder="Header name"
                        value={header.key}
                        onChange={(e) => updateHeader(index, "key", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value"
                        value={header.value}
                        onChange={(e) => updateHeader(index, "value", e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeHeader(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
        </div>
                  ))}
                  <Button variant="outline" onClick={addHeader} className="mt-2">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Header
                  </Button>
      </div>
              </TabsContent>
              <TabsContent value="body" className="p-4 border rounded-md flex-1">
                <Textarea
                  placeholder="Request body (JSON, form data, etc.)"
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="min-h-[200px] font-mono text-sm resize-none h-full"
                />
              </TabsContent>
            </Tabs>
            
            <div className="mt-4">
              <Button 
                onClick={sendRequest} 
                className="w-full"
                disabled={loading || !url.trim()}
              >
                {loading ? 'Sending...' : 'Send Request'}
              </Button>
    </div>
          </Card>

          <Card className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Response</h2>
              {response.data && (
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
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {response.status ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <span 
                    className={cn(
                      "px-2 py-1 rounded text-white font-mono text-sm",
                      response.status >= 200 && response.status < 300 ? "bg-green-500" :
                      response.status >= 400 ? "bg-red-500" : "bg-yellow-500"
                    )}
                  >
                    {response.status} {response.statusText}
                  </span>
                  {response.time && (
                    <span className="text-sm text-muted-foreground">
                      {response.time} ms
                    </span>
                  )}
                </div>

                <Tabs 
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex-1 flex flex-col"
                >
                  <TabsList>
                    <TabsTrigger value="response">Response</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                  </TabsList>
                  <TabsContent value="response" className="flex-1 overflow-auto">
                    <div className="bg-muted p-4 rounded-md font-mono text-sm h-full overflow-auto">
                      <pre className="whitespace-pre-wrap">
                        {typeof response.data === 'object' 
                          ? JSON.stringify(response.data, null, 2)
                          : String(response.data || '')}
                      </pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="headers" className="flex-1 overflow-auto">
                    <div className="bg-muted p-4 rounded-md font-mono text-sm h-full overflow-auto">
                      {response.headers && Object.entries(response.headers).map(([key, value]) => (
                        <div key={key} className="mb-1">
                          <span className="font-semibold">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  {error 
                    ? "An error occurred while sending the request" 
                    : "Enter a URL and click 'Send Request' to see the response"}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
