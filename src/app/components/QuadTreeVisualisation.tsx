"use client";

import React, { useEffect, useRef, useState } from 'react';
import { QuadTree } from '../utils/algorithms';

interface Point {
  x: number;
  y: number;
}

export const QuadTreeVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const quadTreeRef = useRef<QuadTree | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      // Recreate QuadTree with new dimensions
      quadTreeRef.current = new QuadTree({
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: canvas.width / 2,
        height: canvas.height / 2
      }, 4);
      
      // Reinsert all points
      points.forEach(point => quadTreeRef.current?.insert(point));
    };

    const drawQuadTree = (qt: QuadTree) => {
      ctx.strokeStyle = '#60a5fa50';
      ctx.strokeRect(
        qt.boundary.x - qt.boundary.width,
        qt.boundary.y - qt.boundary.height,
        qt.boundary.width * 2,
        qt.boundary.height * 2
      );

      if (qt.divided) {
        drawQuadTree(qt.northeast!);
        drawQuadTree(qt.northwest!);
        drawQuadTree(qt.southeast!);
        drawQuadTree(qt.southwest!);
      }

      qt.points.forEach(point => {
        ctx.beginPath();
        ctx.fillStyle = '#34d399';
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (quadTreeRef.current) {
        drawQuadTree(quadTreeRef.current);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const point = { x, y };
      setPoints(prev => [...prev, point]);
      quadTreeRef.current?.insert(point);
      draw();
    };

    canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);
    
    handleResize();
    draw();

    return () => {
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [points]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[400px] rounded-lg bg-gray-900 cursor-pointer"
    />
  );
};

export default QuadTreeVisualization;
