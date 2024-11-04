import React, { useEffect, useRef, useState } from 'react';
import { LayoutGrid } from 'lucide-react';

interface EventDot {
  x: number;
  y: number;
  timestamp: number;
  type: 'raw' | 'debounced' | 'throttled';
}

export const EventHandlingDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<EventDot[]>([]);
  const lastThrottledRef = useRef<number>(0);
  const lastDebounceTimerRef = useRef<NodeJS.Timeout>();
  const animationFrameRef = useRef<number>();
  const [debounceDelay, setDebounceDelay] = useState(500);
  const [throttleDelay, setThrottleDelay] = useState(100);
  const [showTrails, setShowTrails] = useState(true);

  // Add event dot
  const addDot = (x: number, y: number, type: EventDot['type']) => {
    const dot: EventDot = {
      x,
      y,
      timestamp: Date.now(),
      type
    };
    dotsRef.current.push(dot);

    // Keep only last 5 seconds of dots
    const cutoff = Date.now() - 5000;
    dotsRef.current = dotsRef.current.filter(d => d.timestamp > cutoff);
  };

  // Handle throttle
  const handleThrottle = (x: number, y: number) => {
    const now = Date.now();
    if (now - lastThrottledRef.current >= throttleDelay) {
      addDot(x, y, 'throttled');
      lastThrottledRef.current = now;
    }
  };

  // Handle debounce
  const handleDebounce = (x: number, y: number) => {
    if (lastDebounceTimerRef.current) {
      clearTimeout(lastDebounceTimerRef.current);
    }
    lastDebounceTimerRef.current = setTimeout(() => {
      addDot(x, y, 'debounced');
    }, debounceDelay);
  };

  const drawDot = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    timestamp: number,
    type: EventDot['type']
  ) => {
    const age = Date.now() - timestamp;
    const alpha = Math.max(0, 1 - age / 5000);
    let color: string;
    let size: number;

    switch (type) {
      case 'raw':
        color = `rgba(96, 165, 250, ${alpha})`; // Blue
        size = 4;
        break;
      case 'throttled':
        color = `rgba(52, 211, 153, ${alpha})`; // Green
        size = 8;
        break;
      case 'debounced':
        color = `rgba(248, 113, 113, ${alpha})`; // Red
        size = 12;
        break;
    }

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with fade effect for trails
    if (showTrails) {
      ctx.fillStyle = 'rgba(17, 24, 39, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Draw grid lines
    ctx.strokeStyle = '#ffffff10';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw dots
    dotsRef.current.forEach(dot => {
      drawDot(ctx, dot.x, dot.y, dot.timestamp, dot.type);
    });

    // Draw legend
    const legend = [
      { type: 'raw' as const, label: 'Raw Events' },
      { type: 'throttled' as const, label: 'Throttled Events' },
      { type: 'debounced' as const, label: 'Debounced Events' }
    ];

    ctx.font = '14px Arial';
    legend.forEach((item, i) => {
      const x = 20;
      const y = 30 + i * 30;
      
      // Draw sample dot
      drawDot(ctx, x + 6, y - 4, Date.now(), item.type);
      
      // Draw label
      ctx.fillStyle = '#fff';
      ctx.fillText(item.label, x + 20, y);
    });

    animationFrameRef.current = requestAnimationFrame(draw);
  };

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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Add raw event dot
      addDot(x, y, 'raw');

      // Handle throttled and debounced events
      handleThrottle(x, y);
      handleDebounce(x, y);
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    
    handleResize();
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (lastDebounceTimerRef.current) {
        clearTimeout(lastDebounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Debounce Delay:</label>
          <input
            type="range"
            min="100"
            max="1000"
            step="100"
            value={debounceDelay}
            onChange={(e) => setDebounceDelay(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-gray-400">{debounceDelay}ms</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Throttle Delay:</label>
          <input
            type="range"
            min="50"
            max="500"
            step="50"
            value={throttleDelay}
            onChange={(e) => setThrottleDelay(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-gray-400">{throttleDelay}ms</span>
        </div>

        <button
          onClick={() => setShowTrails(!showTrails)}
          className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <LayoutGrid className="w-4 h-4" />
          {showTrails ? 'Hide' : 'Show'} Trails
        </button>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[400px] rounded-lg bg-gray-900"
        />
        <div className="absolute top-4 left-4 text-sm text-gray-400">
          Move your mouse over the canvas
        </div>
      </div>
    </div>
  );
};
