"use client";

import { useEffect, useRef } from "react";

export default function BiometricScanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const points = [
      { x: 150, y: 70 },
      { x: 110, y: 110 },
      { x: 190, y: 110 },
      { x: 125, y: 140 },
      { x: 175, y: 140 },
      { x: 150, y: 175 },
      { x: 100, y: 190 },
      { x: 200, y: 190 },
      { x: 130, y: 220 },
      { x: 170, y: 220 },
      { x: 150, y: 255 },
    ];

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Neon Purple Mesh Lines
      ctx.strokeStyle = "rgba(168, 85, 247, 0.3)";
      ctx.lineWidth = 1;

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dist = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      // Neon Green Nodes
      points.forEach((p, idx) => {
        const pulse = Math.sin(angle * 2 + idx) * 1.5 + 2.5;
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      // Sweeping Laser
      const scanY = 50 + ((Math.sin(angle) + 1) / 2) * 210;

      const gradient = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 2);
      gradient.addColorStop(0, "rgba(34, 197, 94, 0)");
      gradient.addColorStop(1, "rgba(34, 197, 94, 0.6)");

      ctx.fillStyle = gradient;
      ctx.fillRect(40, scanY - 15, 220, 15);

      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(40, scanY);
      ctx.lineTo(260, scanY);
      ctx.stroke();

      angle += 0.025;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="relative w-80 h-80 rounded-2xl glass-panel-purple flex items-center justify-center p-2">
      <canvas ref={canvasRef} width={300} height={300} className="w-full h-full" />
      <div className="absolute top-3 left-3 text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        Live Mesh Scan
      </div>
    </div>
  );
}