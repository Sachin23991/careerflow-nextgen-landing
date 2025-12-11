import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Float,
  Text,
  Environment,
  MeshTransmissionMaterial,
  Sparkles,
  AdaptiveDpr,
  AdaptiveEvents,
} from '@react-three/drei';
import * as THREE from 'three';

// Responsive gradient background
function ResponsiveGradientBg() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  const vertexShader = `
    varying vec2 vUv;
    uniform float uTime;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      float wave = sin(pos.x * 0.25 + uTime * 0.3) * cos(pos.y * 0.2 + uTime * 0.25) * 1.2;
      pos.z += wave;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform float uTime;
    
    void main() {
      vec3 c1 = vec3(0.4, 0.3, 0.65);
      vec3 c2 = vec3(0.6, 0.4, 0.8);
      vec3 c3 = vec3(0.95, 0.6, 0.98);
      vec3 c4 = vec3(0.35, 0.7, 0.95);
      
      float m1 = sin(vUv.x * 1.5 + uTime * 0.08) * 0.5 + 0.5;
      float m2 = cos(vUv.y * 1.2 - uTime * 0.06) * 0.5 + 0.5;
      
      vec3 color = mix(c1, c2, m1);
      color = mix(color, c3, m2 * 0.5);
      color = mix(color, c4, vUv.x * 0.3);
      
      gl_FragColor = vec4(color, 0.3);
    }
  `;

  useFrame((state) => {
    if (meshRef.current && meshRef.current.material) {
      (meshRef.current.material as any).uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -10]}>
      <planeGeometry args={[viewport.width * 2, viewport.height * 2, 30, 30]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        transparent
      />
    </mesh>
  );
}

// Optimized shape component
function CareerShape({
  position,
  shapeType,
  color,
  label,
  delay,
  isMobile,
}: {
  position: [number, number, number];
  shapeType: string;
  color: string;
  label: string;
  delay: number;
  isMobile: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const geometry = useMemo(() => {
    const subdivisions = isMobile ? 1 : 2;
    switch(shapeType) {
      case 'crystal': return <octahedronGeometry args={[1, 0]} />;
      case 'ring': return <torusGeometry args={[0.9, 0.35, 12, 24]} />;
      case 'knot': return <torusKnotGeometry args={[0.7, 0.22, 60, 12]} />;
      case 'capsule': return <capsuleGeometry args={[0.45, 1.3, 4, 16]} />;
      case 'diamond': return <dodecahedronGeometry args={[0.9, 0]} />;
      case 'star': return <icosahedronGeometry args={[0.9, subdivisions]} />;
      default: return <sphereGeometry args={[0.9, 16, 16]} />;
    }
  }, [shapeType, isMobile]);

  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      const time = state.clock.elapsedTime;
      
      meshRef.current.rotation.y = time * 0.25 + delay;
      meshRef.current.rotation.x = Math.sin(time * 0.3 + delay) * 0.2;
      
      const scale = hovered ? 1.15 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      
      groupRef.current.position.y = position[1] + Math.sin(time * 0.7 + delay) * 0.25;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1.8}>
      <group ref={groupRef} position={[position[0], 0, position[2]] as [number, number, number]}>
        <mesh
          ref={meshRef}
          onPointerOver={() => !isMobile && setHovered(true)}
          onPointerOut={() => !isMobile && setHovered(false)}
        >
          {geometry}
          <MeshTransmissionMaterial
            backside
            samples={isMobile ? 4 : 6}
            resolution={isMobile ? 128 : 256}
            transmission={0.94}
            roughness={0.12}
            thickness={1}
            ior={1.6}
            chromaticAberration={0.35}
            color={color}
          />
        </mesh>

        <mesh scale={0.4}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 1.2 : 0.7}
            metalness={0.8}
            roughness={0.15}
          />
        </mesh>

        {hovered && !isMobile && (
          <Sparkles count={25} scale={3.5} size={1.2} speed={0.4} color={color} />
        )}

        <Text
          position={[0, -1.8, 0]}
          fontSize={isMobile ? 0.25 : 0.3}
          color="#1e293b"
          anchorX="center"
          fontWeight={600}
          maxWidth={2.5}
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}

// Distributed particles across entire viewport
function DistributedParticles({ isMobile }: any) {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  const { positions, colors } = useMemo(() => {
    const count = isMobile ? 40 : 80;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    
    // Distribute across entire viewport
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * viewport.width * 2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
      
      const color = new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.65, 0.6);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    
    return { positions: pos, colors: col };
  }, [viewport, isMobile]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.04;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={isMobile ? 0.12 : 0.18} 
        vertexColors 
        sizeAttenuation 
        transparent 
        opacity={0.65}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Floating orbs distributed across edges
function EdgeOrbs({ isMobile }: any) {
  const { viewport } = useThree();
  
  const orbs = useMemo(() => {
    const w = viewport.width / 2;
    const h = viewport.height / 2;
    
    return [
      { pos: [-w * 0.8, h * 0.7, -4] as [number, number, number], color: '#a78bfa', size: 0.35 },
      { pos: [w * 0.8, -h * 0.7, -5] as [number, number, number], color: '#60a5fa', size: 0.4 },
      { pos: [-w * 0.85, -h * 0.6, -3] as [number, number, number], color: '#f472b6', size: 0.3 },
      { pos: [w * 0.85, h * 0.65, -6] as [number, number, number], color: '#fbbf24', size: 0.38 },
      { pos: [-w * 0.75, 0, -5] as [number, number, number], color: '#34d399', size: 0.32 },
      { pos: [w * 0.75, 0, -4] as [number, number, number], color: '#fb923c', size: 0.36 },
      { pos: [0, h * 0.8, -5] as [number, number, number], color: '#c084fc', size: 0.34 },
      { pos: [0, -h * 0.8, -4] as [number, number, number], color: '#22d3ee', size: 0.37 },
    ];
  }, [viewport]);

  if (isMobile) return null;

  return (
    <>
      {orbs.map((orb, idx) => (
        <Float key={idx} speed={1.8 + idx * 0.2} floatIntensity={2.5}>
          <mesh position={orb.pos as [number, number, number]}>
            <sphereGeometry args={[orb.size, 12, 12]} />
            <meshStandardMaterial
              color={orb.color}
              emissive={orb.color}
              emissiveIntensity={0.7}
              transparent
              opacity={0.5}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// Responsive camera
function ResponsiveCamera({ isMobile }: any) {
  const { camera, mouse } = useThree();
  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    if (isMobile) {
      camera.position.lerp(new THREE.Vector3(0, 0, 12), 0.02);
    } else {
      target.current.set(mouse.x * 1.2, mouse.y * 1.2, 12);
      camera.position.lerp(target.current, 0.02);
    }
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Main scene with full viewport distribution
const FullViewportCareerScene = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (isMobile) {
    return (
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50" />
      </div>
    );
  }

  // Responsive positioning - spreads across viewport
  const getPositions = () => {
    const spread = isTablet ? 0.6 : 1;
    return [
      [-5 * spread, 3, -1] as [number, number, number],    // Top left
      [5 * spread, 3, -2] as [number, number, number],      // Top right
      [-5 * spread, -2.5, 0] as [number, number, number],   // Bottom left
      [5 * spread, -2.5, -1] as [number, number, number],   // Bottom right
      [-2.5 * spread, 0.5, 1] as [number, number, number],  // Center left
      [2.5 * spread, -0.5, 0] as [number, number, number],  // Center right
    ];
  };

  const positions = getPositions();
  const shapes = ['crystal', 'ring', 'knot', 'capsule', 'diamond', 'star'];
  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#ffa751', '#34d399'];
  const labels = ['AI & ML', 'Leadership', 'Creative', 'Engineering', 'Strategy', 'Analytics'];

  return (
    <div className="fixed inset-0 -z-10 bg-white">
      <Canvas
        dpr={[1, isTablet ? 1.5 : 2]}
        performance={{ min: 0.5 }}
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{ 
          antialias: !isMobile,
          powerPreference: "high-performance",
          alpha: true,
        }}
      >
        <color attach="background" args={['#ffffff']} />
        
        {/* Adaptive performance */}
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[8, 8, 5]} intensity={0.6} />
        <pointLight position={[-8, 8, 5]} intensity={0.35} color="#a78bfa" />
        <pointLight position={[8, -8, -5]} intensity={0.35} color="#60a5fa" />
        
        <Environment resolution={64} preset="city" />

        {/* Full viewport background */}
        <ResponsiveGradientBg />

        {/* Distributed particles */}
        <DistributedParticles isMobile={isMobile} />

        {/* Edge orbs */}
        <EdgeOrbs isMobile={isMobile} />

        {/* 6 Different shapes spread across entire viewport */}
        {positions.map((pos, idx) => (
          <CareerShape
            key={idx}
            position={pos}
            shapeType={shapes[idx]}
            color={colors[idx]}
            label={labels[idx]}
            delay={idx * 1.2}
            isMobile={isMobile}
          />
        ))}

        {/* Responsive camera */}
        <ResponsiveCamera isMobile={isMobile} />
      </Canvas>
    </div>
  );
};

export default FullViewportCareerScene;
