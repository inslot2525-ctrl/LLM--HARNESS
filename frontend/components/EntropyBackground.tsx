"use client";

/* ============================================================================
   EntropyBackground — fullscreen adaptation of xubohuah/entropy.
   Left half: ordered grid particles that return to origin, perturbed by chaos.
   Right half: chaotic Brownian-motion particles that drift and bounce.
   A faint centre divider marks the order/entropy boundary.

   Fixed at z-index -1 behind all page content. Canvas 2D, no WebGL.
   ============================================================================ */

import { useEffect, useRef } from "react";

const SPACING = 56;          // px between grid points — fewer particles = better perf
const NEIGHBOR_R = 110;      // px radius for chaos→order influence
const CONNECT_R = 55;        // px radius for drawing connection lines
const COLOR = "#ffffff";
const MAX_PARTICLES = 700;   // safety cap so ultra-wide monitors don't lag

export default function EntropyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let particles: Particle[] = [];
    let animId = 0;
    let frameCount = 0;

    class Particle {
      x: number; y: number;
      ox: number; oy: number;
      isOrder: boolean;
      vx: number; vy: number;
      influence: number;
      neighbors: Particle[];

      constructor(x: number, y: number, isOrder: boolean) {
        this.x = this.ox = x;
        this.y = this.oy = y;
        this.isOrder = isOrder;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.influence = 0;
        this.neighbors = [];
      }

      update() {
        if (this.isOrder) {
          const dx = this.ox - this.x;
          const dy = this.oy - this.y;
          let cx = 0, cy = 0;
          for (const n of this.neighbors) {
            if (!n.isOrder) {
              const d = Math.hypot(this.x - n.x, this.y - n.y);
              const s = Math.max(0, 1 - d / NEIGHBOR_R);
              cx += n.vx * s;
              cy += n.vy * s;
              if (s > this.influence) this.influence = s;
            }
          }
          const inv = 1 - this.influence;
          this.x += dx * 0.05 * inv + cx * this.influence;
          this.y += dy * 0.05 * inv + cy * this.influence;
          this.influence *= 0.99;
        } else {
          this.vx += (Math.random() - 0.5) * 0.5;
          this.vy += (Math.random() - 0.5) * 0.5;
          this.vx *= 0.95;
          this.vy *= 0.95;
          this.x += this.vx;
          this.y += this.vy;
          const half = W / 2;
          if (this.x < half || this.x > W) { this.vx *= -1; this.x = Math.max(half, Math.min(W, this.x)); }
          if (this.y < 0 || this.y > H)   { this.vy *= -1; this.y = Math.max(0, Math.min(H, this.y)); }
        }
      }

      draw() {
        const a = this.isOrder ? Math.max(0.25, 0.7 - this.influence * 0.45) : 0.6;
        const hex = Math.round(a * 255).toString(16).padStart(2, "0");
        ctx!.fillStyle = `${COLOR}${hex}`;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, 1.4, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    const buildParticles = () => {
      particles = [];
      const cols = Math.ceil(W / SPACING) + 1;
      const rows = Math.ceil(H / SPACING) + 1;
      const half = W / 2;
      // cap total to avoid perf cliff on huge screens
      const total = Math.min(cols * rows, MAX_PARTICLES);
      let n = 0;
      outer:
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          if (n++ >= total) break outer;
          const x = i * SPACING + SPACING / 2;
          const y = j * SPACING + SPACING / 2;
          particles.push(new Particle(x, y, x < half));
        }
      }
    };

    const updateNeighbors = () => {
      for (const p of particles) {
        p.neighbors = particles.filter(o => o !== p && Math.hypot(p.x - o.x, p.y - o.y) < NEIGHBOR_R);
      }
    };

    const draw = () => {
      // Fill black each frame — the scrim on the hero fades into this
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      if (frameCount % 45 === 0) updateNeighbors();

      ctx.lineWidth = 0.35;
      for (const p of particles) {
        p.update();
        p.draw();
        for (const n of p.neighbors) {
          const d = Math.hypot(p.x - n.x, p.y - n.y);
          if (d < CONNECT_R) {
            const a = 0.14 * (1 - d / CONNECT_R);
            ctx.strokeStyle = `${COLOR}${Math.round(a * 255).toString(16).padStart(2, "0")}`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          }
        }
      }

      // Faint vertical divider — order / entropy boundary
      ctx.strokeStyle = `${COLOR}22`;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      frameCount++;
      animId = requestAnimationFrame(draw);
    };

    const resize = () => {
      cancelAnimationFrame(animId);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
      updateNeighbors();
      animId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        background: "#000000",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, display: "block" }}
      />
    </div>
  );
}
