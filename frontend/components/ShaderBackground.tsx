"use client";

/* ============================================================================
   ShaderBackground — fixed, full-page animated mesh gradient via
   @shadergradient/react (Three.js / R3F). Dark indigo waterPlane tuned to sit
   behind content, with a readability vignette on top.

   NOTE: must be imported with next/dynamic({ ssr:false }) — R3F's Canvas can't
   render during SSR. The app runs React 19 + R3F v9, shadergradient's native
   pairing.
   ========================================================================== */

import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export default function ShaderBackground() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", background: "var(--paper)" }}
    >
      <ShaderGradientCanvas style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} fov={40} pixelDensity={1}>
        <ShaderGradient
          control="props"
          type="waterPlane"
          animate="on"
          uSpeed={0.09}
          uStrength={2.4}
          uDensity={1.6}
          uFrequency={5.5}
          uAmplitude={0}
          color1="#0D0602"
          color2="#7c2d12"
          color3="#1a0800"
          grain="on"
          cDistance={3.2}
          cPolarAngle={135}
          cAzimuthAngle={180}
          cameraZoom={1}
          brightness={1.25}
          reflection={0.22}
          positionX={0}
          positionY={0}
          positionZ={0}
          rotationX={50}
          rotationY={0}
          rotationZ={-60}
          lightType="3d"
          envPreset="city"
          enableTransition={false}
        />
      </ShaderGradientCanvas>

      {/* readability overlay — lighter now so the gradient stays present, just
          enough scrim at the lower band where text lives */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(125% 95% at 50% 0%, transparent 0%, rgba(6,7,14,0.20) 58%, rgba(6,7,14,0.55) 100%)",
        }}
      />
    </div>
  );
}
