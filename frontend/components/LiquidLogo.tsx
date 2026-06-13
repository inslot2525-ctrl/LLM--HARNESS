"use client";

/* ============================================================================
   LiquidLogo — the bracketed-neuron mark rendered as flowing liquid metal.

   A direct WebGL port of collidingScopes/liquid-logo: the mark is rasterised
   to a texture, then a simplex-noise fragment shader confines an animated
   metallic flow to the logo's alpha. Uniforms are tuned to a cool indigo to
   match the harness palette. Honours prefers-reduced-motion and pauses when
   scrolled off-screen.
   ========================================================================== */

import { useEffect, useRef } from "react";

/* ── ported fragment shader (collidingScopes/liquid-logo) ─────────────────── */
export const FRAG = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed, u_iterations, u_scale, u_dotFactor, u_vOffset, u_intensityFactor, u_expFactor;
uniform vec3 u_colorFactors;
uniform float u_colorShift, u_dotMultiplier, u_noiseIntensity;
uniform sampler2D u_logoTexture;
uniform float u_logoScale, u_logoInteractStrength;

float random(vec2 st){ return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123); }
vec3 mod289(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 mod289(vec4 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_*ns.x + ns.yyyy;
  vec4 y = y_*ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m*m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
float detectEdges(vec2 uv, float threshold){
  float dx = 1.0/u_resolution.x, dy = 1.0/u_resolution.y;
  vec4 c = texture2D(u_logoTexture, uv);
  vec4 le = texture2D(u_logoTexture, uv - vec2(dx,0.0));
  vec4 ri = texture2D(u_logoTexture, uv + vec2(dx,0.0));
  vec4 tp = texture2D(u_logoTexture, uv - vec2(0.0,dy));
  vec4 bt = texture2D(u_logoTexture, uv + vec2(0.0,dy));
  float diff = length(c-le)+length(c-ri)+length(c-tp)+length(c-bt);
  return smoothstep(0.0, threshold, diff);
}
vec4 liquidMetalEffect(vec4 color, float edge, float time){
  float highlight = pow(0.5 + 0.5*sin(edge*6.0), 8.0)*edge;
  vec4 metallic = vec4(color.r + highlight*0.4, color.g + highlight*0.3, color.b + highlight*0.5, color.a);
  return clamp(metallic, 0.0, 1.0);
}
void main(){
  vec2 r = u_resolution;
  vec2 FC = gl_FragCoord.xy;
  float time = u_time * u_speed;
  vec2 uv = FC.xy / r;
  vec2 logoUV = (uv - 0.5)/u_logoScale + 0.5;
  logoUV.y = 1.0 - logoUV.y;
  vec4 logoColor = texture2D(u_logoTexture, logoUV);
  float logoAlpha = logoColor.a;
  bool insideLogo = logoAlpha > 0.1;
  if(!insideLogo && logoUV.x>=0.0 && logoUV.x<=1.0 && logoUV.y>=0.0 && logoUV.y<=1.0){ discard; }
  float edge = detectEdges(logoUV, 0.2) * u_logoInteractStrength;
  vec2 p = (FC.xy*2.0 - r)/r.y;
  vec2 lv = vec2(0.0);
  float dotP = dot(p,p);
  lv.x += abs(u_dotFactor - dotP) * u_dotMultiplier;
  float edgeInfluence = edge*20.0;
  vec2 v = p*(1.0 - lv.x)/u_scale;
  v += vec2(sin(edge*10.0), cos(edge*8.0))*edgeInfluence;
  float noiseIntensity = insideLogo ? u_noiseIntensity : 0.1;
  float flowNoise = snoise(vec3(p*2.0, time*0.15))*noiseIntensity;
  v += vec2(flowNoise, flowNoise*0.7);
  vec4 o = vec4(0.0);
  for(float i=0.0;i<16.0;i++){
    if(i >= u_iterations) break;
    float idx = i + 1.0;
    vec2 offset = cos(v.yx*idx + vec2(0.0,idx) + time)/idx + u_vOffset;
    if(logoAlpha>0.1 && edge>0.1){ offset *= 1.0 + edge*4.0; }
    v += offset;
    o += (sin(vec4(v.x,v.y,v.y,v.x))+1.0)*abs(v.x-v.y)*u_intensityFactor;
  }
  if(u_colorShift>0.0){ o = o.wxyz*u_colorShift + o*(1.0 - u_colorShift); }
  vec4 expPy = exp(p.y*vec4(u_colorFactors.x, u_colorFactors.y, u_colorFactors.z, 0.0));
  float expLx = exp(-u_expFactor*lv.x);
  vec4 ratio = expPy*expLx/o;
  vec4 exp2x = exp(2.0*ratio);
  o = (exp2x - 1.0)/(exp2x + 1.0);
  vec2 noiseCoord = FC/1.5;
  float noise = random(noiseCoord + time*0.0004)*0.12 - 0.075;
  o = o + vec4(noise);
  o = liquidMetalEffect(o, edge, time);
  o = clamp(o, 0.0, 1.0);
  if(logoUV.x>=0.0 && logoUV.x<=1.0 && logoUV.y>=0.0 && logoUV.y<=1.0){
    if(insideLogo){
      vec4 finalColor = mix(o, vec4(o.rgb*0.8 + 0.2, logoAlpha), 0.3);
      float highlight = pow(edge*1.2, 4.0);
      finalColor.rgb += highlight*vec3(0.6,0.7,0.8);
      finalColor.a = min(finalColor.a + 0.4, 1.0);
      gl_FragColor = finalColor;
    } else { discard; }
  } else { discard; }
}`;

export const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;

/* ── the mark, rasterised to a bold white silhouette for the metal to fill ── */
function markSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 40 40">
    <g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 6 H7.5 V34 H13" stroke-width="3.4"/>
      <path d="M27 6 H32.5 V34 H27" stroke-width="3.4"/>
      <line x1="15.5" y1="15" x2="24.5" y2="15" stroke-width="2.6"/>
      <line x1="15.5" y1="15" x2="15.5" y2="25" stroke-width="2.6"/>
      <line x1="24.5" y1="15" x2="24.5" y2="25" stroke-width="2.6"/>
      <line x1="15.5" y1="25" x2="24.5" y2="25" stroke-width="2.6"/>
      <line x1="15.5" y1="15" x2="24.5" y2="25" stroke-width="3.6"/>
    </g>
    <g fill="#fff">
      <circle cx="15.5" cy="15" r="3.4"/>
      <circle cx="24.5" cy="25" r="3.4"/>
      <circle cx="24.5" cy="15" r="3.1"/>
      <circle cx="15.5" cy="25" r="3.1"/>
    </g>
  </svg>`;
}

export const UNIFORMS = {
  u_speed: 0.4,
  u_iterations: 14,
  u_scale: 3.0,
  u_dotFactor: 0.66,
  u_dotMultiplier: 0.36,
  u_vOffset: 6.0,
  u_intensityFactor: 0.1,
  u_expFactor: 1.8,
  u_noiseIntensity: 0.5,
  u_colorFactors: [0.28, 0.08, -0.32] as [number, number, number], // warm amber/gold sheen
  u_colorShift: 0.5,
  u_logoScale: 0.7,
  u_logoInteractStrength: 0.66,
};

export function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("LiquidLogo shader error:", gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

export default function LiquidLogo({ size = 300, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: true });
    if (!gl) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("LiquidLogo link error:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uTime = u("u_time");
    const uRes = u("u_resolution");

    // static uniforms
    gl.uniform1f(u("u_speed"), UNIFORMS.u_speed);
    gl.uniform1f(u("u_iterations"), UNIFORMS.u_iterations);
    gl.uniform1f(u("u_scale"), UNIFORMS.u_scale);
    gl.uniform1f(u("u_dotFactor"), UNIFORMS.u_dotFactor);
    gl.uniform1f(u("u_dotMultiplier"), UNIFORMS.u_dotMultiplier);
    gl.uniform1f(u("u_vOffset"), UNIFORMS.u_vOffset);
    gl.uniform1f(u("u_intensityFactor"), UNIFORMS.u_intensityFactor);
    gl.uniform1f(u("u_expFactor"), UNIFORMS.u_expFactor);
    gl.uniform1f(u("u_noiseIntensity"), UNIFORMS.u_noiseIntensity);
    gl.uniform3fv(u("u_colorFactors"), UNIFORMS.u_colorFactors);
    gl.uniform1f(u("u_colorShift"), UNIFORMS.u_colorShift);
    gl.uniform1f(u("u_logoScale"), UNIFORMS.u_logoScale);
    gl.uniform1f(u("u_logoInteractStrength"), UNIFORMS.u_logoInteractStrength);

    // texture
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // 1px placeholder until the SVG loads
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(u("u_logoTexture"), 0);

    const img = new Image();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    };
    img.src = "data:image/svg+xml;utf8," + encodeURIComponent(markSVG());

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const px = Math.round(size * dpr);
      canvas.width = px;
      canvas.height = px;
      gl.viewport(0, 0, px, px);
      gl.uniform2f(uRes, px, px);
    };
    resize();

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(canvas);

    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      gl.uniform1f(uTime, reduced ? 2.0 : (now - start) / 1000);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (reduced) cancelAnimationFrame(raf); // one frame only
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
    };
  }, [size]);

  return (
    <canvas
      ref={ref}
      className={className}
      aria-label="LLMHarness"
      style={{ width: size, height: size, display: "block", ...style }}
    />
  );
}
