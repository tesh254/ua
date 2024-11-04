"use client";

import React, { useEffect, useRef, useState } from "react";
import { ema, doubleExponentialSmoothing } from "../utils/algorithms";

export const LineChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewportStart, setViewportStart] = useState(0);
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 5;
  const ZOOM_SENSITIVITY = 0.001;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Generate sample data
    const rawData = Array.from(
      { length: 100 },
      (_, i) => Math.sin(i * 0.1) * 50 + Math.random() * 20
    );

    const emaData = ema(rawData, 0.2);
    const desData = doubleExponentialSmoothing(rawData, 0.2, 0.1);

    const draw = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate visible data range
      const visibleDataPoints = rawData.length / zoomLevel;
      const startIdx = Math.floor(viewportStart * rawData.length);
      const endIdx = Math.min(
        Math.floor(startIdx + visibleDataPoints),
        rawData.length
      );

      // Draw grid
      const gridSpacing = 20 * zoomLevel;
      ctx.strokeStyle = "#2d374850";
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      for (let i = 0; i < rect.width; i += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, rect.height);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let i = 0; i < rect.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(rect.width, i);
        ctx.stroke();
      }

      // Draw data
      const drawLine = (data: number[], color: string) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const visibleData = data.slice(startIdx, endIdx);
        visibleData.forEach((value, index) => {
          const x = (index / visibleData.length) * rect.width;
          const y = (value + 60) * (rect.height / 120);
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      };

      drawLine(rawData, "#94a3b8");
      drawLine(emaData, "#60a5fa");
      drawLine(desData, "#34d399");

      // Draw zoom level indicator
      ctx.fillStyle = "#ffffff50";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Zoom: ${zoomLevel.toFixed(2)}x`, 10, 20);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Calculate mouse position relative to canvas
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width;

      // Calculate zoom
      const deltaY = -e.deltaY;
      const newZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, zoomLevel * (1 + deltaY * ZOOM_SENSITIVITY))
      );

      // Adjust viewport to keep mouse position stable
      if (newZoom !== zoomLevel) {
        const viewportWidth = 1 / newZoom;
        const cursorViewportOffset = mouseX / zoomLevel;
        const newViewportStart = Math.max(
          0,
          Math.min(
            1 - viewportWidth,
            viewportStart + cursorViewportOffset * (1 / zoomLevel - 1 / newZoom)
          )
        );

        setZoomLevel(newZoom);
        setViewportStart(newViewportStart);
      }
    };

    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(container);

    canvas.addEventListener("wheel", handleWheel);

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [zoomLevel, viewportStart]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px]">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full bg-gray-700" 
      />
    </div>
  );
};
