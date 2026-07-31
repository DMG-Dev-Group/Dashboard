import { useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { createDotTexture, sampleLetterPoints } from "./particlePoints";

export interface Member3DData {
  id: string;
  letter: string;
  name: string;
  age: string;
  photo: string;
  stack: string[];
}

interface Props {
  id: string;
  letter: string;
  basePosition: [number, number, number];
  active: boolean;
  dimmed: boolean;
  onSelect: (id: string | null) => void;
  reducedMotion: boolean;
}

const PARTICLE_COUNT = 850;
const LETTER_HEIGHT = 2.6;
export const LETTER_HIT_W = 2.4;
const REPEL_RADIUS = 0.85;
const REPEL_STRENGTH = 0.55;
const POSITION_LAMBDA = 4.5;
const MATERIAL_LAMBDA = 6;

const COLOR_IDLE = new THREE.Color("#c0181a");
const COLOR_HOVER = new THREE.Color("#ff4d4f");
const COLOR_ACTIVE = new THREE.Color("#ff6a6c");
const COLOR_DIMMED = new THREE.Color("#8a1416");

export function ParticleLetter({ id, letter, basePosition, active, dimmed, onSelect, reducedMotion }: Props) {
  const outer = useRef<THREE.Group>(null!);
  const materialRef = useRef<THREE.PointsMaterial>(null!);
  const [hovered, setHovered] = useState(false);
  const pointer = useRef({ x: 0, y: 0, over: false });
  const colorScratch = useRef(new THREE.Color());

  const dotTexture = useMemo(() => createDotTexture(), []);

  const { geometry, homes, phases } = useMemo(() => {
    const homePositions = sampleLetterPoints(letter, PARTICLE_COUNT, LETTER_HEIGHT);
    const phaseValues = new Float32Array(PARTICLE_COUNT);
    const initial = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      phaseValues[i] = Math.random() * Math.PI * 2;
      // partículas nascem espalhadas e convergem pra letra sozinhas, pelo
      // mesmo damp que depois cuida do "voltar ao lugar" após interação
      const ang = Math.random() * Math.PI * 2;
      const r = 1.3 + Math.random() * 1.3;
      initial[i * 3] = homePositions[i * 3] + Math.cos(ang) * r;
      initial[i * 3 + 1] = homePositions[i * 3 + 1] + Math.sin(ang) * r;
      initial[i * 3 + 2] = homePositions[i * 3 + 2] + (Math.random() - 0.5) * 1.4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(initial, 3));
    return { geometry: geo, homes: homePositions, phases: phaseValues };
  }, [letter]);

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (reducedMotion) return;
    const local = e.point.clone();
    outer.current.worldToLocal(local);
    pointer.current.x = local.x;
    pointer.current.y = local.y;
  }

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const posDamping = 1 - Math.exp(-POSITION_LAMBDA * delta);

    const pointerActive = !reducedMotion && pointer.current.over;
    const px = pointer.current.x;
    const py = pointer.current.y;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const hx = homes[i * 3];
      const hy = homes[i * 3 + 1];
      const hz = homes[i * 3 + 2];

      let tx = hx;
      let ty = hy;

      if (pointerActive) {
        const dx = hx - px;
        const dy = hy - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS) {
          const falloff = 1 - dist / REPEL_RADIUS;
          const push = falloff * falloff * REPEL_STRENGTH;
          const nx = dist > 0.0001 ? dx / dist : 1;
          const ny = dist > 0.0001 ? dy / dist : 0;
          tx = hx + nx * push;
          ty = hy + ny * push;
        }
      }

      if (!reducedMotion) {
        const phase = phases[i];
        tx += Math.sin(t * 0.8 + phase) * 0.02;
        ty += Math.cos(t * 0.7 + phase) * 0.02;
      }

      const idx = i * 3;
      arr[idx] += (tx - arr[idx]) * posDamping;
      arr[idx + 1] += (ty - arr[idx + 1]) * posDamping;
      arr[idx + 2] += (hz - arr[idx + 2]) * posDamping;
    }
    posAttr.needsUpdate = true;

    // grupo — foco/recuo, mesma coreografia de antes (só troca o que é focado)
    const focusZ = active ? 0.9 : dimmed ? -0.5 : 0;
    const focusX = active ? 0 : dimmed ? basePosition[0] * 1.1 : basePosition[0];
    const focusY = active ? 0.3 : basePosition[1];
    const targetScale = active ? 1.3 : dimmed ? 0.78 : 1;

    outer.current.position.x = THREE.MathUtils.damp(outer.current.position.x, focusX, 4, delta);
    outer.current.position.y = THREE.MathUtils.damp(outer.current.position.y, focusY, 4, delta);
    outer.current.position.z = THREE.MathUtils.damp(outer.current.position.z, basePosition[2] + focusZ, 4, delta);
    const s = THREE.MathUtils.damp(outer.current.scale.x, targetScale, 5, delta);
    outer.current.scale.setScalar(s);

    if (materialRef.current) {
      const matDamping = 1 - Math.exp(-MATERIAL_LAMBDA * delta);
      const targetColor = active ? COLOR_ACTIVE : dimmed ? COLOR_DIMMED : hovered ? COLOR_HOVER : COLOR_IDLE;
      colorScratch.current.copy(materialRef.current.color).lerp(targetColor, matDamping);
      materialRef.current.color.copy(colorScratch.current);

      const targetOpacity = active ? 1 : dimmed ? 0.55 : hovered ? 1 : 0.9;
      materialRef.current.opacity = THREE.MathUtils.damp(materialRef.current.opacity, targetOpacity, 6, delta);

      const targetSize = active ? 0.065 : dimmed ? 0.044 : hovered ? 0.058 : 0.05;
      materialRef.current.size = THREE.MathUtils.damp(materialRef.current.size, targetSize, 6, delta);
    }
  });

  return (
    <group ref={outer} position={basePosition}>
      <points geometry={geometry}>
        <pointsMaterial
          ref={materialRef}
          map={dotTexture}
          size={0.05}
          sizeAttenuation
          transparent
          opacity={0.9}
          color="#c0181a"
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* alvo de clique/hover maior e invisível — mais confiável que raycast direto em pontos */}
      <mesh
        onPointerMove={handlePointerMove}
        onPointerOver={() => {
          setHovered(true);
          pointer.current.over = true;
        }}
        onPointerOut={() => {
          setHovered(false);
          pointer.current.over = false;
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(active ? null : id);
        }}
      >
        <planeGeometry args={[LETTER_HIT_W, 3]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
