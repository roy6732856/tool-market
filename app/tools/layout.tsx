"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { tools } from "./data/toolsData";

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {/* Sidebar without bottom border */}
      <aside className="w-64 border-r border-gray-200 flex flex-col h-full bg-white">
        <div className="p-6">
          <Link href="/tools">
            <div>
              <h2 className="text-xl font-bold">Tools</h2>
              <p className="text-sm text-gray-500 mt-1">Useful utilities for developers</p>
            </div>
          </Link>
        </div>
        <div className="flex-1 overflow-auto">
          <nav className="space-y-1 p-4">
            {tools.map((tool) => (
              <Link href={tool.path} key={tool.id}>
                <div
                  className={`p-3 rounded-md hover:bg-gray-100 cursor-pointer ${
                    pathname === tool.path ? "bg-gray-100" : ""
                  }`}
                >
                  <div className="flex items-start">
                    <tool.icon className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-xs text-gray-500">{tool.description}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}