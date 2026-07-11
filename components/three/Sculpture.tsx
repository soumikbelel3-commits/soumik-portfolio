"use client";

import { MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";
import * as THREE from "three";

type SculptureProps = {
  variant?: "hero" | "about" | "contact";
  simplified?: boolean;
};

export function Sculpture({
  variant = "hero",
  simplified = false,
}: SculptureProps) {
  const group = useRef<Group>(null);
  const metal = useRef<Mesh>(null);
  const glass = useRef<Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const px = THREE.MathUtils.lerp(pointer.current.x, state.pointer.x, 0.05);
    const py = THREE.MathUtils.lerp(pointer.current.y, state.pointer.y, 0.05);
    pointer.current = { x: px, y: py };

    if (group.current) {
      const speed = variant === "hero" ? 0.12 : variant === "about" ? 0.18 : 0.08;
      group.current.rotation.y = t * speed + px * 0.35;
      group.current.rotation.x = Math.sin(t * 0.2) * 0.12 + py * 0.2;
      group.current.position.y = Math.sin(t * 0.4) * 0.08;
    }

    if (metal.current) {
      metal.current.rotation.z = t * 0.15;
    }
    if (glass.current) {
      glass.current.rotation.x = t * -0.1;
    }
  });

  const scale = variant === "hero" ? 1 : variant === "about" ? 0.85 : 0.7;
  const segments = simplified ? 32 : 64;

  return (
    <group ref={group} scale={scale}>
      <mesh ref={glass} position={[0.15, 0.1, 0]}>
        <torusKnotGeometry args={[0.85, 0.28, segments * 2, segments / 2, 2, 3]} />
        <MeshTransmissionMaterial
          backside
          samples={simplified ? 4 : 8}
          resolution={simplified ? 256 : 512}
          transmission={0.95}
          roughness={0.12}
          thickness={1.2}
          ior={1.45}
          chromaticAberration={0.04}
          anisotropy={0.2}
          color="#c4a35a"
          attenuationColor="#8a7040"
          attenuationDistance={2.5}
        />
      </mesh>

      <mesh ref={metal} position={[-0.55, -0.25, -0.4]} scale={0.55}>
        <icosahedronGeometry args={[1, simplified ? 0 : 1]} />
        <meshStandardMaterial
          color="#9aa3b2"
          metalness={0.92}
          roughness={0.22}
          envMapIntensity={1.2}
        />
      </mesh>

      {variant !== "contact" ? (
        <mesh position={[0.7, -0.55, 0.35]} scale={0.28}>
          <torusGeometry args={[1, 0.28, 16, simplified ? 32 : 48]} />
          <meshStandardMaterial
            color="#c4a35a"
            metalness={0.85}
            roughness={0.3}
          />
        </mesh>
      ) : null}
    </group>
  );
}

export function Particles({ count = 80 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#c4a35a"
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function SceneLights({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.35 * intensity} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.1 * intensity}
        color="#f0e6d0"
      />
      <pointLight
        position={[-3, -2, 2]}
        intensity={0.6 * intensity}
        color="#6a7a9a"
      />
      <pointLight
        position={[2, 1, -3]}
        intensity={0.4 * intensity}
        color="#c4a35a"
      />
    </>
  );
}
