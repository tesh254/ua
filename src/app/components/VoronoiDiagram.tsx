"use client";

import React, { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
}

interface Cell {
  points: [number, number][];
  site: Point;
}

export const VoronoiDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize points with random positions and velocities
    const colors = ['#60a5fa', '#34d399', '#f87171', '#fcd34d'];
    const initializePoints = () => {
      pointsRef.current = Array.from({ length: 15 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
    };

    // Calculate Voronoi cells using Fortune's algorithm (simplified version)
    const calculateVoronoi = (points: Point[], width: number, height: number): Cell[] => {
      const cells: Cell[] = [];
      
      // For each point, create a cell
      points.forEach(site => {
        const cellPoints: [number, number][] = [];
        
        // Sample points in a grid around the site
        for (let x = 0; x < width; x += 5) {
          for (let y = 0; y < height; y += 5) {
            // Find closest site to this point
            let minDist = Infinity;
            let closestSite = site;
            
            points.forEach(otherSite => {
              const dist = Math.pow(x - otherSite.x, 2) + Math.pow(y - otherSite.y, 2);
              if (dist < minDist) {
                minDist = dist;
                closestSite = otherSite;
              }
            });
            
            // If this site is the closest, add the point to its cell
            if (closestSite === site) {
              cellPoints.push([x, y]);
            }
          }
        }
        
        cells.push({ points: cellPoints, site });
      });
      
      return cells;
    };

    // Update point positions
    const updatePoints = () => {
      pointsRef.current.forEach(point => {
        point.x += point.dx;
        point.y += point.dy;

        // Bounce off walls
        if (point.x <= 0 || point.x >= canvas.width) point.dx *= -1;
        if (point.y <= 0 || point.y >= canvas.height) point.dy *= -1;

        point.x = Math.max(0, Math.min(canvas.width, point.x));
        point.y = Math.max(0, Math.min(canvas.height, point.y));
      });
    };

    // Draw function
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate and draw Voronoi cells
      const cells = calculateVoronoi(pointsRef.current, canvas.width, canvas.height);
      
      cells.forEach(cell => {
        if (cell.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(cell.points[0][0], cell.points[0][1]);
          
          cell.points.forEach(([x, y]) => {
            ctx.lineTo(x, y);
          });
          
          ctx.fillStyle = `${cell.site.color}30`;
          ctx.fill();
          ctx.strokeStyle = cell.site.color;
          ctx.stroke();
        }
      });

      // Draw sites (points)
      pointsRef.current.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.fill();
      });

      updatePoints();
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Handle window resize
    const handleResize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initializePoints();
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[400px] rounded-lg bg-gray-900"
    />
  );
};
