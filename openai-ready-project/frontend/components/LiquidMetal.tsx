"use client";

/* ============================================================================
   LiquidMetal — fills its parent with the same flowing liquid-metal shader as
   the logo (collidingScopes/liquid-logo), but unmasked: a fully-opaque texture
   + logoScale 1 means the metal covers the whole rectangle. Used as the fill
   for the primary buttons so they share the logo's material and indigo.
   Honours reduced-motion and pauses when off-screen.
   ========================================================================== */

import { useEffect, useRef } from "react";
import { FRAG, VERT, UNIFORMS, compile } from "./LiquidLogo";

export default function LiquidMetal() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: true });
    if (!gl) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uTime = u("u_time");
    const uRes = u("u_resolution");

    // static uniforms — same as the logo, but unmasked (logoScale 1) and a hair
    // brighter so the button reads as a lit metal surface
    gl.uniform1f(u("u_speed"), UNIFORMS.u_speed);
    gl.uniform1f(u("u_iterations"), UNIFORMS.u_iterations);
    gl.uniform1f(u("u_scale"), 2.4);
    gl.uniform1f(u("u_dotFactor"), UNIFORMS.u_dotFactor);
    gl.uniform1f(u("u_dotMultiplier"), UNIFORMS.u_dotMultiplier);
    gl.uniform1f(u("u_vOffset"), UNIFORMS.u_vOffset);
    gl.uniform1f(u("u_intensityFactor"), 0.12);
    gl.uniform1f(u("u_expFactor"), UNIFORMS.u_expFactor);
    gl.uniform1f(u("u_noiseIntensity"), UNIFORMS.u_noiseIntensity);
    gl.uniform3fv(u("u_colorFactors"), UNIFORMS.u_colorFactors);
    gl.uniform1f(u("u_colorShift"), UNIFORMS.u_colorShift);
    gl.uniform1f(u("u_logoScale"), 1.0); // fill the whole rect
    gl.uniform1f(u("u_logoInteractStrength"), 0.0);

    // 1×1 fully-opaque white texture → insideLogo is true everywhere
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(u("u_logoTexture"), 0);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.offsetWidth * dpr));
      const h = Math.max(1, Math.round(canvas.offsetHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(canvas);

    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      gl.uniform1f(uTime, reduced ? 3.0 : (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (reduced) cancelAnimationFrame(raf);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", zIndex: 0 }}
    />
  );
}
