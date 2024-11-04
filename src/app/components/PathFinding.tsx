"use client";

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Play, RotateCcw } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Cell {
  isWall: boolean;
  isVisited: boolean;
  isExploring: boolean;
  distance: number;
}

export const PathFindingDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [start, setStart] = useState<Point | null>(null);
  const [end, setEnd] = useState<Point | null>(null);
  const [mode, setMode] = useState<'start' | 'end' | 'wall'>('start');
  const [isPathfinding, setIsPathfinding] = useState(false);
  const animationFrameRef = useRef<number>();
  const [visitedCells, setVisitedCells] = useState<Point[]>([]);
  const [path, setPath] = useState<Point[]>([]);

  // Initialize grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    
    const cellSize = 20;
    const cols = Math.floor(canvas.width / (cellSize * window.devicePixelRatio));
    const rows = Math.floor(canvas.height / (cellSize * window.devicePixelRatio));

    const initialGrid = Array(rows).fill(0).map(() => 
      Array(cols).fill(0).map(() => ({
        isWall: false,
        isVisited: false,
        isExploring: false,
        distance: Infinity
      }))
    );
    setGrid(initialGrid);
  }, []);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const findPath = async () => {
    if (!start || !end || isPathfinding) return;
    setIsPathfinding(true);
    setVisitedCells([]);
    setPath([]);

    const queue: Point[] = [start];
    const visited = new Set<string>();
    const cameFrom = new Map<string, Point>();

    // Reset grid state
    const newGrid = grid.map(row => row.map(cell => ({
      ...cell,
      isVisited: false,
      isExploring: false,
      distance: Infinity
    })));
    setGrid(newGrid);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentKey = `${current.x},${current.y}`;

      if (visited.has(currentKey)) continue;

      // Mark as visited
      visited.add(currentKey);
      setVisitedCells(prev => [...prev, current]);
      
      // Check if reached end
      if (current.x === end.x && current.y === end.y) {
        // Reconstruct path
        const path: Point[] = [];
        let currentPoint: Point = end;
        while (cameFrom.has(`${currentPoint.x},${currentPoint.y}`)) {
          path.unshift(currentPoint);
          currentPoint = cameFrom.get(`${currentPoint.x},${currentPoint.y}`)!;
        }
        path.unshift(start);
        setPath(path);
        setIsPathfinding(false);
        return;
      }

      // Add neighbors to queue
      const neighbors = [
        { x: current.x - 1, y: current.y }, // left
        { x: current.x + 1, y: current.y }, // right
        { x: current.x, y: current.y - 1 }, // up
        { x: current.x, y: current.y + 1 }, // down
      ];

      for (const neighbor of neighbors) {
        const { x, y } = neighbor;
        if (
          x >= 0 && x < grid[0].length &&
          y >= 0 && y < grid.length &&
          !visited.has(`${x},${y}`) &&
          !grid[y][x].isWall
        ) {
          queue.push(neighbor);
          cameFrom.set(`${x},${y}`, current);
        }
      }

      await sleep(50); // Delay for visualization
    }

    setIsPathfinding(false);
  };

  const resetDemo = () => {
    const newGrid = grid.map(row => row.map(() => ({
      isWall: false,
      isVisited: false,
      isExploring: false,
      distance: Infinity
    })));
    setGrid(newGrid);
    setStart(null);
    setEnd(null);
    setMode('start');
    setVisitedCells([]);
    setPath([]);
    setIsPathfinding(false);
  };

  // Drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = 20;
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
          const screenX = x * cellSize;
          const screenY = y * cellSize;

          // Draw cell
          if (grid[y][x].isWall) {
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(screenX, screenY, cellSize, cellSize);
          }

          // Draw grid lines
          ctx.strokeStyle = '#60a5fa20';
          ctx.strokeRect(screenX, screenY, cellSize, cellSize);
        }
      }

      // Draw visited cells
      ctx.fillStyle = '#3b82f620';
      visitedCells.forEach(point => {
        ctx.fillRect(
          point.x * cellSize,
          point.y * cellSize,
          cellSize,
          cellSize
        );
      });

      // Draw path
      if (path.length > 1) {
        ctx.beginPath();
        ctx.moveTo(
          path[0].x * cellSize + cellSize / 2,
          path[0].y * cellSize + cellSize / 2
        );
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(
            path[i].x * cellSize + cellSize / 2,
            path[i].y * cellSize + cellSize / 2
          );
        }
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw start and end
      if (start) {
        ctx.fillStyle = '#34d399';
        ctx.fillRect(
          start.x * cellSize,
          start.y * cellSize,
          cellSize,
          cellSize
        );
      }
      if (end) {
        ctx.fillStyle = '#f87171';
        ctx.fillRect(
          end.x * cellSize,
          end.y * cellSize,
          cellSize,
          cellSize
        );
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [grid, start, end, visitedCells, path]);

  // Handle mouse interactions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid.length) return;

    const cellSize = 20;

    const handleMouseDown = (e: MouseEvent) => {
      setIsDrawing(true);
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / cellSize);
      const y = Math.floor((e.clientY - rect.top) / cellSize);

      if (x >= 0 && x < grid[0].length && y >= 0 && y < grid.length) {
        if (mode === 'start') {
          setStart({ x, y });
          setMode('end');
        } else if (mode === 'end') {
          setEnd({ x, y });
          setMode('wall');
        } else {
          const newGrid = [...grid];
          newGrid[y][x] = {
            ...newGrid[y][x],
            isWall: true
          };
          setGrid(newGrid);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing || mode !== 'wall') return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / cellSize);
      const y = Math.floor((e.clientY - rect.top) / cellSize);

      if (x >= 0 && x < grid[0].length && y >= 0 && y < grid.length) {
        const newGrid = [...grid];
        newGrid[y][x] = {
          ...newGrid[y][x],
          isWall: true
        };
        setGrid(newGrid);
      }
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [grid, mode, isDrawing]);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-blue-500" />
        <p className="text-sm text-blue-200">
          {mode === 'start' && "Click to place the starting point (green)"}
          {mode === 'end' && "Click to place the ending point (red)"}
          {mode === 'wall' && "Click and drag to draw walls"}
        </p>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={resetDemo}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-2"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        
        <button
          onClick={findPath}
          disabled={!start || !end || isPathfinding}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          title="Find Path"
        >
          <Play className="w-4 h-4" />
          Find Path
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-[400px] rounded-lg bg-gray-900"
      />
    </div>
  );
};
