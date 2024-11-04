"use client";

import React from "react";

interface AlgorithmCardProps {
  title: string;
  children: React.ReactNode;
}

export const AlgorithmCard: React.FC<AlgorithmCardProps> = ({
  title,
  children,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};
