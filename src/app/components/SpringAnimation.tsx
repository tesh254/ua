"use client";

import React, { useEffect, useRef } from "react";
import { criticallyDampedSpring } from "../utils/algorithms";

export const SpringAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let position = canvas.height / 2;
    let velocity = 0;
    let target = canvas.height / 2;
    const history: number[] = [];

    const animate = () => {
      // Update spring physics
      const result = criticallyDampedSpring(
        position,
        target,
        velocity,
        0.3, // stiffness
        0.7, // damping
        1 / 60 // dt (assuming 60fps)
      );

      position = result.position;
      velocity = result.velocity;

      // Store position history
      history.push(position);
      if (history.length > 100) history.shift();

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw trail
      ctx.beginPath();
      ctx.strokeStyle = "#60a5fa50";
      ctx.lineWidth = 2;
      history.forEach((pos, index) => {
        const x = (index / 100) * canvas.width;
        if (index === 0) ctx.moveTo(x, pos);
        else ctx.lineTo(x, pos);
      });
      ctx.stroke();

      // Draw current position
      ctx.beginPath();
      ctx.fillStyle = "#60a5fa";
      ctx.arc(canvas.width - 10, position, 8, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      target = e.clientY - rect.top;
    };

    const handleResize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    handleResize();
    animate();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="w-full h-[400px] rounded-lg bg-gray-700" />
  );
};
