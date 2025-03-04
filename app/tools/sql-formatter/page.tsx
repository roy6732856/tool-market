"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Code, Copy, CheckCircle2, UploadCloud, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { tools } from "../data/toolsData";

export default function SqlFormatterPage() {
  const tool = tools.find(t => t.id === "sql-formatter");
  
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sqlDialect, setSqlDialect] = useState("standard");

  const formatSQL = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      // Simple SQL formatting logic
      // In a real app, you might want to use a proper SQL formatter library
      const formattedSQL = formatSqlQuery(input, sqlDialect);
      setOutput(formattedSQL);
      setError(null);
    } catch (err) {
      setError("Error formatting SQL: Invalid SQL syntax");
      setOutput("");
    }
  };

  const formatSqlQuery = (sql: string, dialect: string): string => {
    // This is a simple SQL formatter that works for basic queries
    // In a production app, you'd use a dedicated library like sql-formatter
    
    // First, normalize the SQL by removing extra spaces and newlines
    let normalizedSQL = sql.replace(/\s+/g, ' ').trim();
    
    // Keywords to format with newlines before them
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
      'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'INSERT INTO',
      'VALUES', 'UPDATE', 'SET', 'DELETE FROM'
    ];
    
    // Format keywords
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      normalizedSQL = normalizedSQL.replace(regex, `\n${keyword}`);
    }
    
    // Format commas in SELECT
    normalizedSQL = normalizedSQL.replace(/,\s*/g, ',\n  ');
    
    // Add indentation
    let lines = normalizedSQL.split('\n');
    let indentLevel = 0;
    let result = [];
    
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      // Adjust indent level for brackets
      if (line.includes('(')) indentLevel++;
      if (line.includes(')')) indentLevel--;
      
      // Special formatting for SELECT items
      if (line.toUpperCase().startsWith('SELECT')) {
        result.push(line);
        indentLevel++;
      } else if (line.match(/^(FROM|WHERE|JOIN|GROUP BY|ORDER BY|HAVING)/i)) {
        indentLevel = 1;
        result.push('  '.repeat(indentLevel) + line);
      } else {
        result.push('  '.repeat(indentLevel) + line);
      }
    }
    
    return result.join('\n');
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

  const sampleSql = `SELECT id, name, email, created_at FROM users WHERE status = 'active' AND created_at > '2023-01-01' ORDER BY created_at DESC LIMIT 100;`;

  const handleLoadSample = () => {
    setInput(sampleSql);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Code className="h-5 w-5 text-primary" />
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
              <h2 className="text-lg font-semibold">Input SQL</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleLoadSample}>
                  Load Sample
                </Button>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".sql,.txt"
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
              placeholder="Paste your SQL query here..."
              className="flex-1 font-mono text-sm resize-none"
            />
            <div className="mt-4 flex items-center gap-4">
              <Button 
                onClick={formatSQL} 
                className="flex-1"
                disabled={!input.trim()}
              >
                Format SQL
              </Button>
              <Tabs value={sqlDialect} onValueChange={(value) => setSqlDialect(value)} className="w-[200px]">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="standard">Standard</TabsTrigger>
                  <TabsTrigger value="mysql">MySQL</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </Card>

          <Card className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Formatted SQL</h2>
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
            
            <div className="flex-1 overflow-auto">
              {output ? (
                <pre className="font-mono text-sm p-4 bg-muted rounded-md h-full overflow-auto">
                  {output}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {error ? "Fix the SQL errors to see the output" : "Enter SQL in the input field and click 'Format SQL' to see the result"}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
