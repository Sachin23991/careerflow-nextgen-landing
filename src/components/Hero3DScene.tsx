import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Sphere, Box, Torus, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Floating geometric shape representing career elements
function FloatingShape({ position, color, shape = 'sphere' }: { position: [number, number, number], color: string, shape?: 'sphere' | 'box' | 'torus' }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      {shape === 'sphere' && (
        <Sphere ref={meshRef} args={[1, 32, 32]} position={position}>
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={0.3}
            speed={1.5}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      )}
      {shape === 'box' && (
        <Box ref={meshRef} args={[1.5, 1.5, 1.5]} position={position}>
          <meshStandardMaterial
            color={color}
            roughness={0.2}
            metalness={0.8}
          />
        </Box>
      )}
      {shape === 'torus' && (
        <Torus ref={meshRef} args={[1, 0.3, 16, 32]} position={position}>
          <meshStandardMaterial
            color={color}
            roughness={0.2}
            metalness={0.8}
          />
        </Torus>
      )}
    </Float>
  );
}

// Ambient particles in the background
function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 100;
  
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#60a5fa" transparent opacity={0.4} />
    </points>
  );
}

const Hero3DScene = () => {
  return (
    <div className="absolute inset-0 opacity-40">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.3} color="#a78bfa" />
        
        {/* Floating career elements */}
        <FloatingShape position={[-3, 2, 0]} color="#1e3a8a" shape="sphere" />
        <FloatingShape position={[3, -1, -2]} color="#0891b2" shape="box" />
        <FloatingShape position={[0, -2, 1]} color="#7c3aed" shape="torus" />
        <FloatingShape position={[-2, -1, -1]} color="#3b82f6" shape="sphere" />
        <FloatingShape position={[2, 2, -3]} color="#06b6d4" shape="box" />
        
        {/* Background particles */}
        <Particles />
        
        {/* Subtle orbit controls for user interaction */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default Hero3DScene;
