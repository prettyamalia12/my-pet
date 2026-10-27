import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AvatarConfig } from '../../types';

const INNER_EAR_COLOR = '#f3b3ac';
const NOSE_COLOR = '#e58a8a';
const WHISKER_COLOR = '#fffdf7';
const PUPIL_COLOR = '#2b2118';
const COLLAR_COLOR = '#e26d5c';
const BELL_COLOR = '#f0c04a';
const BOW_COLOR = '#f27d98';

interface CatModelProps {
  config: AvatarConfig;
  /** When false, all idle animation is frozen (prefers-reduced-motion). */
  animate: boolean;
}

/**
 * Fully procedural, original stylized cat built only from three.js primitives
 * (spheres, cones, cylinders, torus). No external assets or licensed models.
 */
export function CatModel({ config, animate }: CatModelProps) {
  const bodyRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (!animate) return;
    const t = clock.getElapsedTime();

    // Gentle breathing.
    if (bodyRef.current) {
      const breath = 1 + Math.sin(t * 1.6) * 0.015;
      bodyRef.current.scale.set(1, 1.05 * breath, 0.92);
    }

    // Slow tail sway.
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 0.9) * 0.18;
    }

    // Occasional blink (~ every 4.2s the eyes squash for a moment).
    const blinkPhase = t % 4.2;
    const target = blinkPhase < 0.18 ? 0.08 : 1;
    const lerp = Math.min(1, delta * 22);
    for (const eye of [leftEyeRef.current, rightEyeRef.current]) {
      if (eye) eye.scale.y = THREE.MathUtils.lerp(eye.scale.y, target, lerp);
    }
  });

  return (
    <group>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0.95, 0]} scale={[1, 1.05, 0.92]} castShadow>
        <sphereGeometry args={[0.9, 48, 48]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.75} />
      </mesh>

      {/* Front paws */}
      {[-0.33, 0.33].map((x) => (
        <mesh key={x} position={[x, 0.16, 0.58]} scale={[1, 0.75, 1.4]} castShadow>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial color={config.bodyColor} roughness={0.75} />
        </mesh>
      ))}

      {/* Tail — curled torus arc rising behind the body, sways gently */}
      <group ref={tailRef} position={[0, 0.7, -0.75]}>
        <mesh position={[0.1, 0.35, -0.15]} rotation={[0.3, 0, -0.9]} castShadow>
          <torusGeometry args={[0.5, 0.1, 14, 32, Math.PI * 1.25]} />
          <meshStandardMaterial color={config.bodyColor} roughness={0.75} />
        </mesh>
      </group>

      {/* Head */}
      <group position={[0, 1.98, 0.08]}>
        <mesh castShadow>
          <sphereGeometry args={[0.7, 48, 48]} />
          <meshStandardMaterial color={config.bodyColor} roughness={0.75} />
        </mesh>

        {/* Ears (outer + pink inner) */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.42, 0.52, -0.02]} rotation={[0, 0, side * -0.26]}>
            <mesh castShadow>
              <coneGeometry args={[0.27, 0.55, 24]} />
              <meshStandardMaterial color={config.bodyColor} roughness={0.75} />
            </mesh>
            <mesh position={[0, -0.06, 0.12]} scale={[0.55, 0.6, 0.35]}>
              <coneGeometry args={[0.27, 0.55, 24]} />
              <meshStandardMaterial color={INNER_EAR_COLOR} roughness={0.85} />
            </mesh>
          </group>
        ))}

        {/* Eyes — iris color is customizable, with pupil + highlight */}
        {[-1, 1].map((side) => (
          <group
            key={side}
            ref={side === -1 ? leftEyeRef : rightEyeRef}
            position={[side * 0.27, 0.05, 0.58]}
          >
            <mesh>
              <sphereGeometry args={[0.14, 32, 32]} />
              <meshStandardMaterial color={config.eyeColor} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.01, 0.085]}>
              <sphereGeometry args={[0.075, 24, 24]} />
              <meshStandardMaterial color={PUPIL_COLOR} roughness={0.3} />
            </mesh>
            <mesh position={[0.05, 0.06, 0.1]}>
              <sphereGeometry args={[0.035, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}

        {/* Nose */}
        <mesh position={[0, -0.17, 0.68]} scale={[1.2, 0.8, 0.8]}>
          <sphereGeometry args={[0.06, 24, 24]} />
          <meshStandardMaterial color={NOSE_COLOR} roughness={0.6} />
        </mesh>

        {/* Whiskers — three thin cylinders per side */}
        {[-1, 1].map((side) =>
          [-0.08, 0, 0.08].map((yOff, i) => (
            <mesh
              key={`${side}-${i}`}
              position={[side * 0.62, -0.14 + yOff, 0.45]}
              rotation={[0, side * -0.35, Math.PI / 2 + side * (0.06 - i * 0.06)]}
            >
              <cylinderGeometry args={[0.008, 0.008, 0.5, 6]} />
              <meshStandardMaterial color={WHISKER_COLOR} roughness={0.5} />
            </mesh>
          )),
        )}
      </group>

      {/* Collar with a little bell */}
      {config.collar && (
        <group>
          <mesh position={[0, 1.5, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.68, 0.055, 14, 40]} />
            <meshStandardMaterial color={COLLAR_COLOR} roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.44, 0.66]} castShadow>
            <sphereGeometry args={[0.09, 24, 24]} />
            <meshStandardMaterial
              color={BELL_COLOR}
              metalness={0.6}
              roughness={0.35}
            />
          </mesh>
        </group>
      )}

      {/* Bow at the side of the neck */}
      {config.bow && (
        <group position={[0.5, 1.62, 0.45]} rotation={[0.1, 0.5, -0.25]}>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.15, 0, 0]}
              rotation={[0, 0, side * 0.6]}
              scale={[1, 0.55, 0.5]}
            >
              <sphereGeometry args={[0.16, 24, 24]} />
              <meshStandardMaterial color={BOW_COLOR} roughness={0.65} />
            </mesh>
          ))}
          <mesh>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial color={BOW_COLOR} roughness={0.65} />
          </mesh>
        </group>
      )}
    </group>
  );
}
