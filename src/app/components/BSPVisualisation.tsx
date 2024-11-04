import React, { useEffect, useRef, useState } from 'react';

interface Node {
  x: number;
  y: number;
  width: number;
  height: number;
  splitDirection?: 'vertical' | 'horizontal';
  splitRatio?: number;
  left?: Node;
  right?: Node;
  color?: string;
}

export const BSPDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [root, setRoot] = useState<Node | null>(null);
  const [splits, setSplits] = useState(3);
  const colors = ['#60a5fa40', '#34d39940', '#f8717140', '#fcd34d40'];

  const createBSPTree = (node: Node, depth: number): Node => {
    if (depth === 0) {
      return { ...node, color: colors[Math.floor(Math.random() * colors.length)] };
    }

    const splitDirection = Math.random() > 0.5 ? 'vertical' : 'horizontal';
    const splitRatio = 0.3 + Math.random() * 0.4; // Split between 30-70%

    if (splitDirection === 'vertical') {
      const splitX = node.width * splitRatio;
      node.left = createBSPTree(
        {
          x: node.x,
          y: node.y,
          width: splitX,
          height: node.height
        },
        depth - 1
      );
      node.right = createBSPTree(
        {
          x: node.x + splitX,
          y: node.y,
          width: node.width - splitX,
          height: node.height
        },
        depth - 1
      );
    } else {
      const splitY = node.height * splitRatio;
      node.left = createBSPTree(
        {
          x: node.x,
          y: node.y,
          width: node.width,
          height: splitY
        },
        depth - 1
      );
      node.right = createBSPTree(
        {
          x: node.x,
          y: node.y + splitY,
          width: node.width,
          height: node.height - splitY
        },
        depth - 1
      );
    }

    node.splitDirection = splitDirection;
    node.splitRatio = splitRatio;
    return node;
  };

  const drawNode = (ctx: CanvasRenderingContext2D, node: Node) => {
    if (!node.left && !node.right) {
      // Leaf node
      ctx.fillStyle = node.color || '#60a5fa40';
      ctx.fillRect(node.x, node.y, node.width, node.height);
      ctx.strokeStyle = '#60a5fa';
      ctx.strokeRect(node.x, node.y, node.width, node.height);
      return;
    }

    if (node.left) drawNode(ctx, node.left);
    if (node.right) drawNode(ctx, node.right);

    // Draw split line
    ctx.beginPath();
    ctx.strokeStyle = '#60a5fa80';
    ctx.lineWidth = 2;
    if (node.splitDirection === 'vertical') {
      const splitX = node.x + node.width * node.splitRatio!;
      ctx.moveTo(splitX, node.y);
      ctx.lineTo(splitX, node.y + node.height);
    } else {
      const splitY = node.y + node.height * node.splitRatio!;
      ctx.moveTo(node.x, splitY);
      ctx.lineTo(node.x + node.width, splitY);
    }
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const newRoot: Node = {
        x: 0,
        y: 0,
        width: canvas.width / window.devicePixelRatio,
        height: canvas.height / window.devicePixelRatio
      };

      const bspTree = createBSPTree(newRoot, splits);
      setRoot(bspTree);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [splits]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !root) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNode(ctx, root);
  }, [root]);

  const regenerateTree = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    const newRoot: Node = {
      x: 0,
      y: 0,
      width: canvas.width / window.devicePixelRatio,
      height: canvas.height / window.devicePixelRatio
    };

    const bspTree = createBSPTree(newRoot, splits);
    setRoot(bspTree);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button
          onClick={regenerateTree}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Regenerate
        </button>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Splits:</label>
          <input
            type="range"
            min="1"
            max="5"
            value={splits}
            onChange={(e) => setSplits(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-gray-300">{splits}</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-[400px] rounded-lg bg-gray-900"
      />
    </div>
  );
};
