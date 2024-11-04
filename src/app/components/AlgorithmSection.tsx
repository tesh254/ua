"use client";

import React from "react";
import { Code2, BookOpen } from "lucide-react";

interface AlgorithmSectionProps {
  title: string;
  description: string;
  useCases: string[];
  children: React.ReactNode;
}

export const AlgorithmSection: React.FC<AlgorithmSectionProps> = ({
  title,
  description,
  useCases,
  children,
}) => {
  return (
    <section className="min-h-[calc(100vh-4rem)] py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-100">{title}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {children}
        </div>
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Code2 className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-100">
                About the Algorithm
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed">{description}</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-gray-100">
                Common Use Cases
              </h3>
            </div>
            <ul className="space-y-2">
              {useCases.map((useCase, index) => (
                <li
                  key={index}
                  className="text-gray-300 flex items-center space-x-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
