"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { perlin } from '../utils/algorithms';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface ColorScheme {
  name: string;
  getColor: (value: number) => string;
}

export const PerlinNoiseAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [scale, setScale] = useState(0.02);
  const [speed, setSpeed] = useState(0.001);
  const [selectedScheme, setSelectedScheme] = useState(0);
  const [fps, setFps] = useState(0);
  const lastFrameTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());

  const colorSchemes: ColorScheme[] = [
    {
      name: "Blue Ocean",
      getColor: (value: number) => {
        const color = Math.floor(value * 128);
        return `rgb(${color}, ${Math.min(165, color + 37)}, ${Math.min(250, color + 122)})`;
      }
    },
    {
      name: "Forest",
      getColor: (value: number) => {
        const color = Math.floor(value * 128);
        return `rgb(${Math.min(100, color + 20)}, ${Math.min(200, color + 100)}, ${Math.min(100, color + 20)})`;
      }
    },
    {
      name: "Lava",
      getColor: (value: number) => {
        const color = Math.floor(value * 128);
        return `rgb(${Math.min(255, color + 127)}, ${Math.min(100, color)}, ${Math.min(50, color/2)})`;
      }
    },
    {
      name: "Grayscale",
      getColor: (value: number) => {
        const color = Math.floor(value * 255);
        return `rgb(${color}, ${color}, ${color})`;
      }
    },
    {
      name: "Neon",
      getColor: (value: number) => {
        const hue = (value * 360) % 360;
        return `hsl(${hue}, 100%, 60%)`;
      }
    },
    {
      name: "Rainbow",
      getColor: (value: number) => {
        const hue = ((value * 360 + timeRef.current) % 360);
        return `hsl(${hue}, 80%, 60%)`;
      }
    }
  ];

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate FPS
    const currentTime = performance.now();
    frameCountRef.current++;
    
    if (currentTime - lastFpsUpdateRef.current >= 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / (currentTime - lastFpsUpdateRef.current)));
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = currentTime;
    }

    // Clear with fade effect
    ctx.fillStyle = 'rgba(17, 24, 39, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw noise pattern
    for (let x = 0; x < canvas.width; x += 4) {
      for (let y = 0; y < canvas.height; y += 4) {
        const noise = perlin.noise(
          x * scale,
          y * scale,
          timeRef.current * speed
        );
        const normalizedValue = (noise + 1) / 2;
        ctx.fillStyle = colorSchemes[selectedScheme].getColor(normalizedValue);
        ctx.fillRect(x, y, 4, 4);
      }
    }

    timeRef.current += 1;
    lastFrameTimeRef.current = currentTime;
  }, [scale, speed, selectedScheme]);

  const animate = useCallback(() => {
    if (!isPlaying) return;
    
    drawFrame();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isPlaying, drawFrame]);

  useEffect(() => {
    perlin.init();
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleAnimation = () => {
    setIsPlaying(prev => !prev);
  };

  const resetAnimation = () => {
    timeRef.current = 0;
    perlin.init();
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    if (!isPlaying) {
      drawFrame();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={toggleAnimation}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors flex items-center gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play
              </>
            )}
          </button>
          
          <button
            onClick={resetAnimation}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Scale:</label>
          <input
            type="range"
            min="0.005"
            max="0.05"
            step="0.005"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-gray-400">{scale.toFixed(3)}</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Speed:</label>
          <input
            type="range"
            min="0.0001"
            max="0.002"
            step="0.0001"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-gray-400">{speed.toFixed(4)}</span>
        </div>

        <select
          value={selectedScheme}
          onChange={(e) => setSelectedScheme(parseInt(e.target.value))}
          className="px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
        >
          {colorSchemes.map((scheme, index) => (
            <option key={scheme.name} value={index}>
              {scheme.name}
            </option>
          ))}
        </select>

        <div className="text-sm text-gray-400">
          FPS: {fps}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-[400px] rounded-lg bg-gray-900"
      />
    </div>
  );
};
