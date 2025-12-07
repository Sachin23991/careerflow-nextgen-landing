import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  Text, 
  Environment, 
  MeshDistortMaterial, 
  ContactShadows,
  PerspectiveCamera,
  Line
} from '@react-three/drei';
import * as THREE from 'three';

// --- Configuration ---
type ThemeMode = 'light' | 'dark';

const CAREER_NODES = [
  { id: 1, label: "Innovation", position: [0, 0.5, 0], color: "#3b82f6", shape: "sphere" },
  { id: 2, label: "Leadership", position: [-3, 2, -2], color: "#8b5cf6", shape: "box" },
  { id: 3, label: "Strategy", position: [3, -1.5, -1], color: "#14b8a6", shape: "torus" },
  { id: 4, label: "Development", position: [-2.5, -2, 1], color: "#f43f5e", shape: "icosahedron" },
  { id: 5, label: "Design", position: [2.5, 2.5, -2], color: "#eab308", shape: "cone" },
];

// --- NEW: Orbital Energy Particles Sub-component ---
// These particles orbit *around* a specific node
function NodeParticles({ theme, isHovered, color }: { theme: ThemeMode, isHovered: boolean, color: string }) {
    const count = 40; // Number of particles per node
    const meshRef = useRef<THREE.Points>(null);

    // 1. Generate spherical positions around the center
    const positions = useMemo(() => {
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        // Spherical distribution math
        const theta = Math.random() * Math.PI * 2; // Azimuthal angle
        const phi = Math.acos((Math.random() * 2) - 1); // Polar angle
        const r = 1.4 + Math.random() * 0.6; // Radius: just outside the main shape (1.4 to 2.0)

        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);     // x
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); // y
        pos[i * 3 + 2] = r * Math.cos(phi);                   // z
      }
      return pos;
    }, []);

    useFrame((state, delta) => {
      if (!meshRef.current) return;
      // 2. Animation: Rotate entire particle sphere. Speed up significantly on hover.
      meshRef.current.rotation.y += delta * (isHovered ? 2.5 : 0.3);
      meshRef.current.rotation.z += delta * (isHovered ? 1.5 : 0.1);
      
      // 3. Breathing/Expansion effect on hover
      const targetScale = isHovered ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    });

    return (
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        </bufferGeometry>
        {/* 4. Material: Glows in dark mode, subtle in light mode */}
        <pointsMaterial
          size={0.06}
          // In dark mode, use the node's color. In light mode, a subtle slate gray.
          color={theme === 'dark' ? color : "#94a3b8"}
          transparent
          opacity={isHovered ? 0.9 : (theme === 'dark' ? 0.6 : 0.3)}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending} // Makes colours add up for a "glow" effect
          depthWrite={false} // Prevents weird occlusion issues with the main shape
        />
      </points>
    );
}


interface NodeProps {
  data: typeof CAREER_NODES[0];
  theme: ThemeMode;
  hoveredNode: number | null;
  setHoveredNode: (id: number | null) => void;
}

// --- Individual Skill Node ---
function SkillNode({ data, theme, hoveredNode, setHoveredNode }: NodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Group>(null); // <- was Mesh, needs to be Group
  const isHovered = hoveredNode === data.id;
  const isDimmed = hoveredNode !== null && !isHovered;

  useFrame((state) => {
    if (!meshRef.current) return;

    // Rotation & Magnetic Pull Logic
    meshRef.current.rotation.x += isHovered ? 0.02 : 0.005;
    meshRef.current.rotation.y += isHovered ? 0.02 : 0.006;

    if (isHovered) {
      const { x, y } = state.mouse;
      meshRef.current.position.lerp(new THREE.Vector3(x * 3, y * 3, 2), 0.1);
    } else {
      // Destructure to ensure three numeric args for Vector3
      const [px, py, pz] = data.position;
      meshRef.current.position.lerp(new THREE.Vector3(px, py, pz), 0.05);
    }

    // Only call lookAt when textRef.current exists
    if (textRef.current) {
      textRef.current.lookAt(state.camera.position);
    }
  });

  const geometry = useMemo(() => {
    switch(data.shape) {
      case 'box': return <boxGeometry args={[1.2, 1.2, 1.2]} />;
      case 'torus': return <torusGeometry args={[0.8, 0.25, 16, 32]} />;
      case 'icosahedron': return <icosahedronGeometry args={[1, 0]} />;
      case 'cone': return <coneGeometry args={[1, 2, 32]} />;
      default: return <sphereGeometry args={[1, 32, 32]} />;
    }
  }, [data.shape]);

  // Destructure once for JSX props and avoid union type problems
  const [px, py, pz] = data.position;

  return (
    <group>
      <Float speed={isHovered ? 0 : 2} rotationIntensity={isHovered ? 0 : 1} floatIntensity={isHovered ? 0 : 1}>
        <group 
             onPointerOver={(e) => { e.stopPropagation(); setHoveredNode(data.id); }}
             onPointerOut={() => setHoveredNode(null)}
        >
            {/* The Main Shape */}
            <mesh
            ref={meshRef}
            scale={isHovered ? 1.2 : 1}
            position={[px, py, pz]} // ensure mesh starts at correct coords
            >
            {geometry}
            <MeshDistortMaterial
                color={isHovered ? "#ffffff" : data.color}
                speed={isHovered ? 5 : 2}
                distort={isHovered ? 0.6 : 0.3}
                roughness={theme === 'light' ? 0.2 : 0.1}
                metalness={theme === 'light' ? 0.1 : 0.8}
                emissive={theme === 'dark' ? data.color : '#000000'}
                emissiveIntensity={theme === 'dark' ? (isHovered ? 1 : 0.4) : 0}
                transparent
                opacity={isDimmed ? 0.1 : 1}
            />
            
            {!isDimmed && (
                <NodeParticles theme={theme} isHovered={isHovered} color={data.color} />
            )}
            </mesh>

            {/* 3D Label Text */}
            <group ref={textRef} position={[px, py, pz]}>
            <Text
                position={[0, -1.8, 0]}
                fontSize={0.4}
                color={theme === 'light' ? "#1f2937" : "#f3f4f6"}
                anchorX="center"
                anchorY="middle"
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                fillOpacity={isDimmed ? 0 : (isHovered ? 1 : 0.7)}
            >
                {data.label}
            </Text>
            </group>
        </group>
      </Float>
    </group>
  );
}

// --- Connections Lines (Unchanged) ---
function NetworkLines({ theme, nodes }: { theme: ThemeMode, nodes: typeof CAREER_NODES }) {
  const points = useMemo(() => nodes.map(n => {
    const [x, y, z] = n.position; // destructure to guarantee 3 numbers
    return new THREE.Vector3(x, y, z);
  }), [nodes]);
  return (
    <group>
        <Line
            points={points}
            color={theme === 'light' ? "#cbd5e1" : "#4b5563"} 
            lineWidth={1}
            transparent
            opacity={0.3}
            dashed={true}
        />
    </group>
  );
}

// --- Mouse Interaction Rig (Unchanged) ---
function CameraRig() {
  const { camera, mouse } = useThree();
  const vec = new THREE.Vector3();
  useFrame(() => {
    camera.position.lerp(vec.set(mouse.x * 2, mouse.y * 2, 10), 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// --- Background Particles (Slightly tweaked for balance) ---
function BackgroundParticles({ theme }: { theme: ThemeMode }) {
  const count = 200; // Increased count slightly
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
        // Slower background rotation to contrast with fast orbital particles
        pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.12} 
        color={theme === 'light' ? "#cbd5e1" : "#6b7280"} 
        transparent 
        opacity={theme === 'light' ? 0.5 : 0.3} 
        sizeAttenuation 
      />
    </points>
  );
}

// --- Main Scene ---
interface Career3DSceneProps {
    theme?: 'light' | 'dark';
}

const Career3DScene: React.FC<Career3DSceneProps> = ({ theme = 'light' }) => {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // On mobile, skip the heavy canvas and render a lightweight decorative background.
  if (isMobile) {
    return (
      <div
        className={`fixed inset-0 -z-10 pointer-events-none ${theme === 'light' ? 'bg-[radial-gradient(ellipse_at_center,_#f8fafc,_#e6eef8)]' : 'bg-[radial-gradient(ellipse_at_center,_#0b1020,_#000000)]'}`}
        aria-hidden
      />
    );
  }

  return (
    // Make the 3D scene fixed to the viewport so it runs behind the entire landing page while scrolling.
    // Use a negative z-index so texts and UI are rendered above the scene.
    <div className={`fixed inset-0 -z-10 pointer-events-none ${theme === 'light' ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-50 to-gray-200' : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 to-black'}`}>
      <Canvas dpr={[1, 2]} className="w-screen h-screen" style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
        
        <ambientLight intensity={theme === 'light' ? 0.7 : 0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={theme === 'dark' ? 2 : 0.5} color="#4f46e5" />

        <Environment preset={theme === 'light' ? "warehouse" : "city"} />

        <group>
            <NetworkLines theme={theme} nodes={CAREER_NODES} />
            {CAREER_NODES.map((node) => (
                <SkillNode 
                    key={node.id} 
                    data={node} 
                    theme={theme} 
                    hoveredNode={hoveredNode} 
                    setHoveredNode={setHoveredNode}
                />
            ))}
        </group>

        <CameraRig />
        {/* Renamed to BackgroundParticles to avoid confusion */}
        <BackgroundParticles theme={theme} />
        
        <ContactShadows 
            position={[0, -4.5, 0]} 
            opacity={0.4} 
            scale={30} 
            blur={3} 
            far={4}
            color={theme === 'light' ? "#000000" : "#ffffff"}
        />
      </Canvas>
    </div>
  );
};
 
export default Career3DScene;