"use client";

import React, { useEffect, useRef, useState } from "react";
import { catmullRom } from "../utils/algorithms";

interface Point {
  x: number;
  y: number;
}

export const GestureCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (points.length < 4) {
        ctx.beginPath();
        ctx.strokeStyle = "#60a5fa";
        ctx.lineWidth = 2;
        points.forEach((point, i) => {
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        return;
      }

      ctx.beginPath();
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2;

      for (let i = 0; i < points.length - 3; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const p2 = points[i + 2];
        const p3 = points[i + 3];

        ctx.moveTo(p1.x, p1.y);

        for (let t = 0; t <= 1; t += 0.1) {
          const x = catmullRom(p0.x, p1.x, p2.x, p3.x, t);
          const y = catmullRom(p0.y, p1.y, p2.y, p3.y, t);
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      points.forEach((point) => {
        ctx.beginPath();
        ctx.fillStyle = "#34d399";
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsDrawing(true);
      const rect = canvas.getBoundingClientRect();
      setPoints([
        {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        },
      ]);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      setPoints((prev) => [
        ...prev,
        {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        },
      ]);
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      draw();
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
      resizeObserver.disconnect();
    };
  }, [points, isDrawing]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px]">
      <canvas ref={canvasRef} className="w-full h-full bg-gray-700" />
    </div>
  );
};
