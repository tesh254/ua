"use client";

import React from "react";
import { Github } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-700/50 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <img src="/ua.svg" alt="Underrated Algorithms" className="h-12 w-12" />
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/tesh254"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-100 transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>
    </header>
  );
};
