"use client";

import { Environment } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Particles, SceneLights, Sculpture } from "@/components/three/Sculpture";

const SceneCanvas = dynamic(
  () =>
    import("@/components/three/SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false },
);

function StaticFallback({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none overflow-hidden ${className ?? "absolute inset-0"}`}
    >
      <div className="absolute top-1/2 right-[8%] h-[42vmin] w-[42vmin] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(196,163,90,0.22),transparent_62%)] blur-2xl" />
      <div className="absolute top-[38%] right-[18%] h-[18vmin] w-[18vmin] rotate-12 rounded-[30%] border border-accent/25 bg-accent/5" />
      <div className="absolute top-[52%] right-[28%] h-[10vmin] w-[10vmin] -rotate-6 border border-line bg-surface/40" />
    </div>
  );
}

function useWebGL() {
  const [ok, setOk] = useState(true);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setOk(!!gl);
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

export function HeroCanvas() {
  const reduce = useReducedMotion();
  const webgl = useWebGL();
  const mobile = useIsMobile();

  if (reduce || !webgl) {
    return <StaticFallback />;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <SceneCanvas
        className="h-full w-full opacity-90"
        cameraPosition={[0, 0.2, mobile ? 7.5 : 6.2]}
        fov={40}
        transparent
      >
        <SceneLights intensity={1} />
        <Environment preset="city" environmentIntensity={0.55} />
        <group position={[mobile ? 0.4 : 1.6, 0.1, 0]}>
          <Sculpture variant="hero" simplified={mobile} />
          {!mobile ? <Particles count={70} /> : <Particles count={36} />}
        </group>
      </SceneCanvas>
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-transparent sm:via-bg/40" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}

export function AboutCanvas() {
  const reduce = useReducedMotion();
  const webgl = useWebGL();
  const mobile = useIsMobile();

  if (reduce || !webgl) {
    return (
      <StaticFallback className="relative h-[280px] w-full sm:h-[360px]" />
    );
  }

  return (
    <div className="relative h-[280px] w-full sm:h-[360px] lg:h-[420px]">
      <SceneCanvas
        className="h-full w-full"
        cameraPosition={[0, 0, 5.5]}
        fov={42}
      >
        <SceneLights intensity={0.95} />
        <Environment preset="warehouse" environmentIntensity={0.4} />
        <Sculpture variant="about" simplified={mobile} />
        <Particles count={mobile ? 28 : 48} />
      </SceneCanvas>
    </div>
  );
}

export function ContactCanvas() {
  const reduce = useReducedMotion();
  const webgl = useWebGL();
  const mobile = useIsMobile();

  if (reduce || !webgl) {
    return <StaticFallback />;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-0 opacity-70">
      <SceneCanvas
        className="h-full w-full"
        cameraPosition={[0, 0, 7]}
        fov={38}
        transparent
      >
        <SceneLights intensity={0.75} />
        <Environment preset="night" environmentIntensity={0.35} />
        <group position={[mobile ? 0 : 1.8, -0.2, 0]}>
          <Sculpture variant="contact" simplified />
          <Particles count={mobile ? 20 : 40} />
        </group>
      </SceneCanvas>
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-bg/80" />
    </div>
  );
}
