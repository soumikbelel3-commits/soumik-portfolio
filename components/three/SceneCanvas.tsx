"use client";

import { AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState, type ReactNode } from "react";

type SceneCanvasProps = {
  children: ReactNode;
  className?: string;
  cameraPosition?: [number, number, number];
  fov?: number;
  transparent?: boolean;
};

export function SceneCanvas({
  children,
  className,
  cameraPosition = [0, 0, 6],
  fov = 42,
  transparent = false,
}: SceneCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05, rootMargin: "80px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className} aria-hidden>
      {visible ? (
        <Canvas
          dpr={isMobile ? [1, 1.25] : [1, 1.5]}
          camera={{ position: cameraPosition, fov }}
          gl={{
            antialias: !isMobile,
            alpha: true,
            powerPreference: "high-performance",
          }}
          style={{ width: "100%", height: "100%" }}
        >
          {!transparent ? (
            <color attach="background" args={["#0b0d10"]} />
          ) : null}
          <fog attach="fog" args={["#0b0d10", 8, 18]} />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          {children}
        </Canvas>
      ) : null}
    </div>
  );
}
