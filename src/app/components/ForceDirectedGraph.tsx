import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface Edge {
  source: string;
  target: string;
}

export const ForceDirectedGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const animationFrameRef = useRef<number>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [linkStrength, setLinkStrength] = useState(0.05);
  const [repulsion, setRepulsion] = useState(1000);

  // Generate sample graph data
  const generateGraph = () => {
    const colors = ['#60a5fa', '#34d399', '#f87171', '#fcd34d'];
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Create nodes
    for (let i = 0; i < 15; i++) {
      nodes.push({
        id: `node${i}`,
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: 0,
        vy: 0,
        radius: 8,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Create edges (ensure each node has at least one connection)
    nodes.forEach((node, i) => {
      // Connect to a random previous node (if not first)
      if (i > 0) {
        const target = Math.floor(Math.random() * i);
        edges.push({
          source: node.id,
          target: nodes[target].id
        });
      }
      
      // Add some random additional connections
      if (Math.random() < 0.3) {
        const target = Math.floor(Math.random() * nodes.length);
        if (target !== i) {
          edges.push({
            source: node.id,
            target: nodes[target].id
          });
        }
      }
    });

    nodesRef.current = nodes;
    edgesRef.current = edges;
  };

  // Calculate forces and update positions
  const updatePositions = () => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // Reset forces
    nodes.forEach(node => {
      node.vx = 0;
      node.vy = 0;
    });

    // Apply repulsion forces between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0) continue;

        const force = repulsion / (distance * distance);
        const forceX = (dx / distance) * force;
        const forceY = (dy / distance) * force;

        node1.vx -= forceX;
        node1.vy -= forceY;
        node2.vx += forceX;
        node2.vy += forceY;
      }
    }

    // Apply attraction forces along edges
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source)!;
      const target = nodes.find(n => n.id === edge.target)!;
      
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance === 0) return;

      const force = distance * linkStrength;
      const forceX = (dx / distance) * force;
      const forceY = (dy / distance) * force;

      source.vx += forceX;
      source.vy += forceY;
      target.vx -= forceX;
      target.vy -= forceY;
    });

    // Update positions with velocity damping
    const damping = 0.9;
    nodes.forEach(node => {
      node.vx *= damping;
      node.vy *= damping;
      
      node.x += node.vx;
      node.y += node.vy;

      // Keep nodes within bounds
      node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
      node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
    });
  };

  // Draw the graph
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ffffff20';
    edgesRef.current.forEach(edge => {
      const source = nodesRef.current.find(n => n.id === edge.source)!;
      const target = nodesRef.current.find(n => n.id === edge.target)!;
      
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    });

    // Draw nodes
    nodesRef.current.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff20';
      ctx.stroke();
    });

    if (isPlaying) {
      updatePositions();
      animationFrameRef.current = requestAnimationFrame(draw);
    }
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

    window.addEventListener('resize', handleResize);
    handleResize();
    generateGraph();
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      draw();
    }
  }, [isPlaying]);

  const reset = () => {
    generateGraph();
    if (!isPlaying) {
      draw();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
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
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Link Strength:</label>
          <input
            type="range"
            min="0.01"
            max="0.1"
            step="0.01"
            value={linkStrength}
            onChange={(e) => setLinkStrength(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-gray-400">{linkStrength.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Repulsion:</label>
          <input
            type="range"
            min="500"
            max="2000"
            step="100"
            value={repulsion}
            onChange={(e) => setRepulsion(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-gray-400">{repulsion}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-[400px] rounded-lg bg-gray-900"
      />
    </div>
  );
};
