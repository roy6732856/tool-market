
import { FileText, Key, Code, Globe } from "lucide-react";

export interface Tool {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  path: string;
  icon: any;
}

export const tools: Tool[] = [
  {
    id: "json-parser",
    name: "JSON Parser",
    description: "Parse, validate, and format JSON data",
    longDescription: "Parse, validate, and format JSON data with ease. Supports prettifying and minifying JSON.",
    path: "/tools/json-parser",
    icon: FileText
  },
  {
    id: "md5-generator",
    name: "MD5 Generator",
    description: "Generate MD5 hash from text",
    longDescription: "Generate MD5 hash from text or files. Useful for checksum verification and basic cryptography.",
    path: "/tools/md5-generator",
    icon: Key
  },
  {
    id: "sql-formatter",
    name: "SQL Formatter",
    description: "Format SQL queries for better readability",
    longDescription: "Format and beautify SQL queries to improve readability and maintainability.",
    path: "/tools/sql-formatter",
    icon: Code
  },
  /**{
    id: "api-tester",
    name: "API Tester",
    description: "Test API endpoints with different methods",
    longDescription: "Send HTTP requests to API endpoints with various methods (GET, POST, PUT, DELETE) and customize headers and request body.",
    path: "/tools/api-tester",
    icon: Globe
  }**/
];