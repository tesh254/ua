"use client";

import React, { useEffect, useRef } from "react";
import { lerp } from "../utils/algorithms";

interface Ball {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

export const LerpAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const ballRef = useRef<Ball>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      // Update ball position with LERP
      const ball = ballRef.current;
      ball.x = lerp(ball.x, ball.targetX, 0.1);
      ball.y = lerp(ball.y, ball.targetY, 0.1);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connection line
      ctx.beginPath();
      ctx.strokeStyle = "#60a5fa30";
      ctx.lineWidth = 2;
      ctx.moveTo(ball.x, ball.y);
      ctx.lineTo(ball.targetX, ball.targetY);
      ctx.stroke();

      // Draw target point
      ctx.beginPath();
      ctx.fillStyle = "#34d399";
      ctx.arc(ball.targetX, ball.targetY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw ball
      ctx.beginPath();
      ctx.fillStyle = "#60a5fa";
      ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2);
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      ballRef.current.targetX = e.clientX - rect.left;
      ballRef.current.targetY = e.clientY - rect.top;
    };

    const handleResize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Reset ball position on resize
      const centerX = canvas.width / (2 * window.devicePixelRatio);
      const centerY = canvas.height / (2 * window.devicePixelRatio);
      ballRef.current = {
        x: centerX,
        y: centerY,
        targetX: centerX,
        targetY: centerY,
      };
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    handleResize();
    animate();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []); // Empty dependency array since we're using refs

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[calc(100vh-20rem)] rounded-lg bg-gray-700"
    />
  );
};
