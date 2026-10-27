import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { AvatarConfig } from '../../types';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useWebGLSupport } from '../../hooks/useWebGLSupport';
import { CatModel } from './CatModel';
import { AvatarErrorBoundary } from './AvatarErrorBoundary';
import { AvatarFallback } from './AvatarFallback';

interface AvatarCanvasProps {
  config: AvatarConfig;
  petName: string;
}

function GroundDisc() {
  return (
    <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[2.4, 48]} />
      <meshStandardMaterial color="#f3e2cd" roughness={0.95} />
    </mesh>
  );
}

export function AvatarCanvas({ config, petName }: AvatarCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const reducedMotion = useReducedMotion();
  const webgl = useWebGLSupport();

  if (webgl === 'unsupported') {
    return <AvatarFallback config={config} name={petName} />;
  }

  return (
    <div className="relative h-full min-h-72 w-full sm:min-h-96">
      <AvatarErrorBoundary fallback={<AvatarFallback config={config} name={petName} />}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 2.2, 5.4], fov: 40 }}
          aria-label={`Interactive 3D avatar of ${petName}. Drag to rotate.`}
        >
          {/* Warm studio lights — no HDR downloads, works fully offline. */}
          <ambientLight intensity={0.55} />
          <hemisphereLight args={['#fff4e0', '#e6cbb0', 0.5]} />
          <directionalLight
            position={[4, 7, 5]}
            intensity={1.1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight position={[-5, 4, -4]} intensity={0.4} />
          <Suspense fallback={null}>
            <CatModel config={config} animate={!reducedMotion} />
            <GroundDisc />
          </Suspense>
          <ContactShadows
            position={[0, 0.005, 0]}
            opacity={0.4}
            scale={5.5}
            blur={2.5}
            far={2.5}
            resolution={256}
            color="#7a5b40"
            frames={reducedMotion ? 1 : Infinity}
          />
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            minPolarAngle={0.9}
            maxPolarAngle={1.6}
            minDistance={3.6}
            maxDistance={8}
            target={[0, 1.5, 0]}
          />
        </Canvas>
      </AvatarErrorBoundary>

      <button
        type="button"
        onClick={() => controlsRef.current?.reset()}
        className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-cocoa-700 shadow-md ring-1 ring-cocoa-700/10 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-500"
      >
        ⟲ Reset view
      </button>
      <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-cocoa-500">
        Drag to spin {petName} around · 360°
      </p>
    </div>
  );
}
