import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Core() {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    const g = group.current;
    if (!g) return;
    const { x, y } = state.pointer;
    g.rotation.y += (x * 0.6 - g.rotation.y) * (1 - Math.exp(-3 * dt));
    g.rotation.x += (-y * 0.4 - g.rotation.x) * (1 - Math.exp(-3 * dt));
    if (ring.current) ring.current.rotation.z += dt * 0.25;
  });
  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh>
          <icosahedronGeometry args={[1.35, 24]} />
          <MeshDistortMaterial color="#c9a96e" metalness={1} roughness={0.18} distort={0.32} speed={1.6} />
        </mesh>
        <mesh ref={ring} rotation={[1.25, 0.2, 0]}>
          <torusGeometry args={[2.25, 0.018, 16, 200]} />
          <meshStandardMaterial color="#e8d3a6" metalness={1} roughness={0.25} />
        </mesh>
        <mesh rotation={[1.6, -0.5, 0.4]}>
          <torusGeometry args={[2.7, 0.006, 8, 200]} />
          <meshStandardMaterial color="#c9a96e" metalness={1} roughness={0.4} transparent opacity={0.6} />
        </mesh>
      </Float>
      <Sparkles count={70} scale={8} size={2.2} speed={0.3} color="#e8d3a6" opacity={0.7} />
    </group>
  );
}

export default function Orb() {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 6.2], fov: 40 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 5, 3]} intensity={2.4} color="#fff1d6" />
      <pointLight position={[-4, -2, 2]} intensity={30} color="#c9a96e" />
      <Core />
      <Environment resolution={256}>
        <Lightformer intensity={3} position={[0, 4, 2]} scale={[8, 2, 1]} color="#fff4dc" />
        <Lightformer intensity={1.5} position={[-5, 0, -1]} rotation-y={Math.PI / 2} scale={[12, 1, 1]} color="#c9a96e" />
        <Lightformer intensity={1} position={[5, -1, 0]} rotation-y={-Math.PI / 2} scale={[12, 0.6, 1]} color="#ffffff" />
      </Environment>
    </Canvas>
  );
}
