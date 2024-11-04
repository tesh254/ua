import React, { useEffect, useRef, useState } from 'react';

interface Circle {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  color: string;
}

interface Spark {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  color: string;
}

export const CollisionDemo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const circlesRef = useRef<Circle[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const animationFrameRef = useRef<number>();
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const createSparks = (x: number, y: number, color1: string, color2: string, speed: number) => {
    const numSparks = Math.floor(10 + Math.random() * 10); // Random number of sparks
    const newSparks: Spark[] = [];

    for (let i = 0; i < numSparks; i++) {
      const angle = (Math.PI * 2 * i) / numSparks + Math.random() * 0.5;
      const velocity = (2 + Math.random() * 3) * speed;
      newSparks.push({
        x,
        y,
        dx: Math.cos(angle) * velocity,
        dy: Math.sin(angle) * velocity,
        life: 1, // Life from 1 to 0
        color: Math.random() < 0.5 ? color1 : color2,
      });
    }

    sparksRef.current = [...sparksRef.current, ...newSparks];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = ['#60a5fa', '#34d399', '#f87171', '#fcd34d'];
    const initializeCircles = () => {
      const numberOfCircles = 15;
      const radius = 15;
      circlesRef.current = Array.from({ length: numberOfCircles }, () => ({
        x: Math.random() * (canvas.width - 2 * radius) + radius,
        y: Math.random() * (canvas.height - 2 * radius) + radius,
        radius,
        dx: (Math.random() - 0.5) * 12,
        dy: (Math.random() - 0.5) * 12,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
    };

    const checkCollision = (c1: Circle, c2: Circle) => {
      const dx = c2.x - c1.x;
      const dy = c2.y - c1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < c1.radius + c2.radius;
    };

    const resolveCollision = (c1: Circle, c2: Circle) => {
      const dx = c2.x - c1.x;
      const dy = c2.y - c1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance === 0) return;

      // Move circles apart
      const overlap = (c1.radius + c2.radius - distance) / 2;
      const moveX = (dx / distance) * overlap;
      const moveY = (dy / distance) * overlap;
      
      c1.x -= moveX;
      c1.y -= moveY;
      c2.x += moveX;
      c2.y += moveY;

      // Calculate collision response
      const nx = dx / distance;
      const ny = dy / distance;
      const kx = c1.dx - c2.dx;
      const ky = c1.dy - c2.dy;
      const p = 2.2 * (nx * kx + ny * ky) / 2;

      const oldDx1 = c1.dx;
      const oldDy1 = c1.dy;
      
      c1.dx = (c1.dx - p * nx) * 1.001;
      c1.dy = (c1.dy - p * ny) * 1.001;
      c2.dx = (c2.dx + p * nx) * 1.001;
      c2.dy = (c2.dy + p * ny) * 1.001;

      // Calculate collision speed for spark effect intensity
      const collisionSpeed = Math.sqrt(
        Math.pow(oldDx1 - c2.dx, 2) + Math.pow(oldDy1 - c2.dy, 2)
      );

      // Create sparks at collision point
      const collisionX = c1.x + (c2.x - c1.x) / 2;
      const collisionY = c1.y + (c2.y - c1.y) / 2;
      createSparks(collisionX, collisionY, c1.color, c2.color, collisionSpeed * 0.2);
    };

    const updateSparks = () => {
      sparksRef.current = sparksRef.current.filter(spark => {
        // Update position
        spark.x += spark.dx;
        spark.y += spark.dy;
        
        // Add gravity
        spark.dy += 0.2;
        
        // Reduce life
        spark.life -= 0.03;
        
        return spark.life > 0;
      });
    };

    const update = () => {
      const circles = circlesRef.current;
      
      circles.forEach(circle => {
        circle.x += circle.dx * speedMultiplier;
        circle.y += circle.dy * speedMultiplier;

        if (circle.x - circle.radius <= 0 || circle.x + circle.radius >= canvas.width) {
          circle.dx *= -1.001;
          circle.x = Math.max(circle.radius, Math.min(canvas.width - circle.radius, circle.x));
          createSparks(
            circle.x,
            circle.y,
            circle.color,
            '#ffffff',
            Math.abs(circle.dx) * 0.2
          );
        }
        if (circle.y - circle.radius <= 0 || circle.y + circle.radius >= canvas.height) {
          circle.dy *= -1.001;
          circle.y = Math.max(circle.radius, Math.min(canvas.height - circle.radius, circle.y));
          createSparks(
            circle.x,
            circle.y,
            circle.color,
            '#ffffff',
            Math.abs(circle.dy) * 0.2
          );
        }

        if (Math.random() < 0.01) {
          circle.dx += (Math.random() - 0.5) * 0.5;
          circle.dy += (Math.random() - 0.5) * 0.5;
        }

        const maxSpeed = 20 * speedMultiplier;
        const speed = Math.sqrt(circle.dx * circle.dx + circle.dy * circle.dy);
        if (speed > maxSpeed) {
          circle.dx = (circle.dx / speed) * maxSpeed;
          circle.dy = (circle.dy / speed) * maxSpeed;
        }
      });

      for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
          if (checkCollision(circles[i], circles[j])) {
            resolveCollision(circles[i], circles[j]);
          }
        }
      }

      updateSparks();
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(17, 24, 39, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw sparks
      sparksRef.current.forEach(spark => {
        const gradient = ctx.createRadialGradient(
          spark.x, spark.y, 0,
          spark.x, spark.y, 3
        );
        gradient.addColorStop(0, spark.color + 'ff');
        gradient.addColorStop(1, spark.color + '00');
        
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = spark.life;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw circles with glow effect
      circlesRef.current.forEach(circle => {
        const gradient = ctx.createRadialGradient(
          circle.x, circle.y, 0,
          circle.x, circle.y, circle.radius * 2
        );
        gradient.addColorStop(0, circle.color + '40');
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = circle.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff20';
        ctx.stroke();
      });

      update();
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initializeCircles();
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
  }, [speedMultiplier]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-300">Speed Multiplier:</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={speedMultiplier}
          onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
          className="w-32"
        />
        <span className="text-sm text-gray-400">×{speedMultiplier.toFixed(1)}</span>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-[400px] rounded-lg bg-gray-900"
      />
    </div>
  );
};
