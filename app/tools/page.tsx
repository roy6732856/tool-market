"use client"

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tools } from "./data/toolsData";

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return tools;
    
    return tools.filter((tool) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        tool.name.toLowerCase().includes(searchLower) ||
        tool.description.toLowerCase().includes(searchLower)
      );
    });
  }, [searchQuery]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 md:p-6 mx-auto w-full max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Developer Tools</h1>
            <p className="text-muted-foreground">
              A collection of useful utilities to help with common development tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <Link href={tool.path} key={tool.id}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <tool.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>{tool.name}</CardTitle>
                    </div>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-primary font-medium">Try it now →</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
