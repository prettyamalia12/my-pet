import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AvatarConfig } from '../../types';

const INNER_EAR_COLOR = '#f3b3ac';
const NOSE_COLOR = '#e58a8a';
const CREAM_COLOR = '#fdf0dd';
const BLUSH_COLOR = '#f6a89e';
const WHISKER_COLOR = '#8a6f5c';
const PUPIL_COLOR = '#2b2118';
const OUTLINE_COLOR = '#4a3428';
const COLLAR_COLOR = '#e26d5c';
const BELL_COLOR = '#f0c04a';
const BOW_COLOR = '#f27d98';

type Vec3 = [number, number, number];

let toonGradient: THREE.DataTexture | null = null;

/** Shared 4-band gradient map that gives every toon material its cel shading. */
function getToonGradient(): THREE.DataTexture {
  if (!toonGradient) {
    toonGradient = new THREE.DataTexture(new Uint8Array([110, 170, 225, 255]), 4, 1, THREE.RedFormat);
    toonGradient.minFilter = THREE.NearestFilter;
    toonGradient.magFilter = THREE.NearestFilter;
    toonGradient.needsUpdate = true;
  }
  return toonGradient;
}

/**
 * Tail built as a chain of overlapping spheres along an S-curve — sweeps out
 * from the lower back and curls upward. Reads clearly from front, side, and rear.
 * [x, y, z, radius] per segment.
 */
const TAIL_SEGMENTS: [number, number, number, number][] = [
  [0.05, 0.6, -0.75, 0.19],
  [-0.15, 0.52, -0.86, 0.19],
  [-0.36, 0.47, -0.94, 0.185],
  [-0.56, 0.48, -0.985, 0.18],
  [-0.74, 0.58, -0.99, 0.175],
  [-0.87, 0.73, -0.95, 0.17],
  [-0.95, 0.9, -0.88, 0.165],
  [-0.995, 1.08, -0.79, 0.155],
  [-1.0, 1.26, -0.68, 0.145],
  [-0.97, 1.43, -0.56, 0.135],
  [-0.9, 1.57, -0.45, 0.125],
  [-0.8, 1.68, -0.36, 0.11],
];

interface ToonPartProps {
  color: string;
  geometry: ReactNode;
  position?: Vec3;
  rotation?: Vec3;
  scale?: Vec3 | number;
  outline?: boolean;
}

/** Toon-shaded mesh with a warm dark inverted-hull outline. */
function ToonPart({ color, geometry, position, rotation, scale, outline = true }: ToonPartProps) {
  const outlineScale: Vec3 | number = Array.isArray(scale)
    ? [scale[0] * 1.05, scale[1] * 1.05, scale[2] * 1.05]
    : (scale ?? 1) * 1.05;
  return (
    <group position={position} rotation={rotation}>
      <mesh scale={scale} castShadow>
        {geometry}
        <meshToonMaterial color={color} gradientMap={getToonGradient()} />
      </mesh>
      {outline && (
        <mesh scale={outlineScale}>
          {geometry}
          <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
        </mesh>
      )}
    </group>
  );
}

interface CatModelProps {
  config: AvatarConfig;
  /** When false, all idle animation is frozen (prefers-reduced-motion). */
  animate: boolean;
}

/**
 * Fully procedural, original stylized cat built only from three.js primitives
 * (spheres, cones, cylinders, torus). No external assets or licensed models.
 * Chibi proportions + toon shading + outlines for a finished, sticker-like look.
 */
export function CatModel({ config, animate }: CatModelProps) {
  const bodyRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (!animate) return;
    const t = clock.getElapsedTime();

    // Gentle breathing.
    if (bodyRef.current) {
      const breath = 1 + Math.sin(t * 1.6) * 0.015;
      bodyRef.current.scale.set(1, breath, 1);
    }

    // Slow tail sway.
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 0.9) * 0.12;
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
      {/* Body (breathing scales the whole group so the outline follows) */}
      <group ref={bodyRef} position={[0, 0.9, 0]}>
        <ToonPart
          color={config.bodyColor}
          scale={[1, 1.02, 0.92]}
          geometry={<sphereGeometry args={[0.9, 48, 48]} />}
        />
        {/* Cream belly patch */}
        <ToonPart
          color={CREAM_COLOR}
          position={[0, -0.22, 0.58]}
          scale={[0.95, 1.1, 0.5]}
          outline={false}
          geometry={<sphereGeometry args={[0.52, 32, 32]} />}
        />
      </group>

      {/* Front paws */}
      {([-0.33, 0.33] as const).map((x) => (
        <ToonPart
          key={x}
          color={config.bodyColor}
          position={[x, 0.16, 0.62]}
          scale={[1, 0.75, 1.4]}
          geometry={<sphereGeometry args={[0.2, 32, 32]} />}
        />
      ))}

      {/* Tail — tapered sphere chain curling up behind the body, sways gently */}
      <group ref={tailRef}>
        {TAIL_SEGMENTS.map(([x, y, z, r], i) => (
          <ToonPart
            key={i}
            color={config.bodyColor}
            position={[x, y, z]}
            geometry={<sphereGeometry args={[r, 24, 24]} />}
          />
        ))}
      </group>

      {/* Head — oversized for the chibi look */}
      <group position={[0, 1.95, 0.08]}>
        <ToonPart color={config.bodyColor} geometry={<sphereGeometry args={[0.78, 48, 48]} />} />

        {/* Ears (outer + pink inner) */}
        {([-1, 1] as const).map((side) => (
          <group key={side} position={[side * 0.44, 0.6, -0.02]} rotation={[0, 0, side * -0.28]}>
            <ToonPart color={config.bodyColor} geometry={<coneGeometry args={[0.34, 0.72, 24]} />} />
            <ToonPart
              color={INNER_EAR_COLOR}
              position={[0, -0.08, 0.14]}
              scale={[0.55, 0.6, 0.35]}
              outline={false}
              geometry={<coneGeometry args={[0.34, 0.72, 24]} />}
            />
          </group>
        ))}

        {/* Cream muzzle */}
        <ToonPart
          color={CREAM_COLOR}
          position={[0, -0.24, 0.52]}
          scale={[1.35, 0.85, 0.75]}
          outline={false}
          geometry={<sphereGeometry args={[0.3, 32, 32]} />}
        />

        {/* Big glossy eyes — iris color is customizable, with pupil + highlights */}
        {([-1, 1] as const).map((side) => (
          <group
            key={side}
            ref={side === -1 ? leftEyeRef : rightEyeRef}
            position={[side * 0.3, 0.06, 0.64]}
          >
            <mesh>
              <sphereGeometry args={[0.17, 32, 32]} />
              <meshStandardMaterial color={config.eyeColor} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0.01, 0.095]}>
              <sphereGeometry args={[0.095, 24, 24]} />
              <meshStandardMaterial color={PUPIL_COLOR} roughness={0.3} />
            </mesh>
            <mesh position={[0.06, 0.07, 0.115]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.05, -0.04, 0.12]}>
              <sphereGeometry args={[0.02, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}

        {/* Nose + little smile */}
        <mesh position={[0, -0.12, 0.74]} scale={[1.25, 0.8, 0.7]}>
          <sphereGeometry args={[0.065, 24, 24]} />
          <meshStandardMaterial color={NOSE_COLOR} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.28, 0.72]} rotation={[0.2, 0, Math.PI]}>
          <torusGeometry args={[0.055, 0.014, 8, 16, Math.PI]} />
          <meshBasicMaterial color={OUTLINE_COLOR} />
        </mesh>

        {/* Blush cheeks */}
        {([-1, 1] as const).map((side) => (
          <mesh key={side} position={[side * 0.5, -0.12, 0.6]} scale={[1, 0.65, 0.4]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshToonMaterial color={BLUSH_COLOR} gradientMap={getToonGradient()} />
          </mesh>
        ))}

        {/* Whiskers — three thin cylinders per side */}
        {([-1, 1] as const).map((side) =>
          [-0.08, 0, 0.08].map((yOff, i) => (
            <mesh
              key={`${side}-${i}`}
              position={[side * 0.72, -0.14 + yOff, 0.45]}
              rotation={[0, side * -0.35, Math.PI / 2 + side * (0.06 - i * 0.06)]}
            >
              <cylinderGeometry args={[0.01, 0.01, 0.55, 6]} />
              <meshBasicMaterial color={WHISKER_COLOR} />
            </mesh>
          )),
        )}
      </group>

      {/* Collar with a little bell */}
      {config.collar && (
        <group>
          <mesh position={[0, 1.42, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.66, 0.06, 14, 40]} />
            <meshStandardMaterial color={COLLAR_COLOR} roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.36, 0.64]} castShadow>
            <sphereGeometry args={[0.09, 24, 24]} />
            <meshStandardMaterial color={BELL_COLOR} metalness={0.6} roughness={0.35} />
          </mesh>
        </group>
      )}

      {/* Bow at the side of the neck */}
      {config.bow && (
        <group position={[0.52, 1.58, 0.42]} rotation={[0.1, 0.5, -0.25]}>
          {([-1, 1] as const).map((side) => (
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
