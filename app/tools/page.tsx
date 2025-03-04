"use client"

import { useState, useMemo } from "react";
import { FileText, Key, RotateCw } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { categories, integrations } from "../data/integrations";

const ITEMS_PER_PAGE = 30;

const tools = [
  {
    name: "JSON Parser",
    description: "Parse, validate, and format JSON data with ease. Supports prettifying and minifying JSON.",
    path: "/tools/json-parser",
    icon: FileText
  },
  {
    name: "MD5 Generator",
    description: "Generate MD5 hash from text or files. Useful for checksum verification and basic cryptography.",
    path: "/tools/md5-generator",
    icon: Key
  },
  {
    name: "Spin the Wheel",
    description: "Create a customizable wheel to randomly select items. Perfect for making random decisions.",
    path: "/tools/spin-wheel",
    icon: RotateCw
  },
];

export default function ToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredIntegrations = useMemo(() => {
    return integrations.filter((integration) => {
      const categoryMatch =
        selectedCategory === "All" || integration.category === selectedCategory;
      const searchMatch =
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredIntegrations.length / ITEMS_PER_PAGE);
  const paginatedIntegrations = filteredIntegrations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 md:p-6  mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Developer Tools</h1>
            <p className="text-gray-600">
              A collection of useful utilities to help with common development tasks.
              Select a tool from the sidebar or explore the options below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link href={tool.path} key={tool.name}>
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
