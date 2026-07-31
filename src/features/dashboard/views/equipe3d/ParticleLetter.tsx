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

// vento: em vez de empurrar pra longe do cursor, sopra as partículas na
// direção em que o cursor está se movendo — some sozinho quando ele para
const WIND_RADIUS = 1.15;
const WIND_FACTOR = 0.11;
const MAX_WIND_SPEED = 16;
const WIND_DECAY_LAMBDA = 3;
const POSITION_LAMBDA = 4.5;
const MATERIAL_LAMBDA = 6;

const HIGHLIGHT_STRIDE = 6;

const COLOR_IDLE = new THREE.Color("#ff2d30");
const COLOR_HOVER = new THREE.Color("#ff585b");
const COLOR_ACTIVE = new THREE.Color("#ffb3b0");
const COLOR_DIMMED = new THREE.Color("#b5282b");

export function ParticleLetter({ id, letter, basePosition, active, dimmed, onSelect, reducedMotion }: Props) {
  const outer = useRef<THREE.Group>(null!);
  const materialRef = useRef<THREE.PointsMaterial>(null!);
  const highlightMaterialRef = useRef<THREE.PointsMaterial>(null!);
  const [hovered, setHovered] = useState(false);
  const pointer = useRef({ x: 0, y: 0, over: false });
  const lastPointer = useRef({ x: 0, y: 0, t: 0 });
  const wind = useRef({ x: 0, y: 0, mag: 0 });
  const colorScratch = useRef(new THREE.Color());

  const dotTexture = useMemo(() => createDotTexture(), []);

  const { geometry, highlightGeometry, homes, phases } = useMemo(() => {
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

    const highlightCount = Math.floor(PARTICLE_COUNT / HIGHLIGHT_STRIDE);
    const highlightInitial = new Float32Array(highlightCount * 3);
    const hGeo = new THREE.BufferGeometry();
    hGeo.setAttribute("position", new THREE.BufferAttribute(highlightInitial, 3));

    return { geometry: geo, highlightGeometry: hGeo, homes: homePositions, phases: phaseValues };
  }, [letter]);

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (reducedMotion) return;
    const local = e.point.clone();
    outer.current.worldToLocal(local);

    const now = performance.now();
    const dt = Math.max((now - lastPointer.current.t) / 1000, 1 / 120);
    if (lastPointer.current.t > 0) {
      const vx = (local.x - lastPointer.current.x) / dt;
      const vy = (local.y - lastPointer.current.y) / dt;
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > 0.001) {
        wind.current.x = vx / speed;
        wind.current.y = vy / speed;
      }
      wind.current.mag = Math.min(speed, MAX_WIND_SPEED);
    }
    lastPointer.current.x = local.x;
    lastPointer.current.y = local.y;
    lastPointer.current.t = now;

    pointer.current.x = local.x;
    pointer.current.y = local.y;
  }

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const posDamping = 1 - Math.exp(-POSITION_LAMBDA * delta);

    // o vento esfria sozinho — sem movimento novo do cursor, a força some
    // e as partículas voltam ao lugar mesmo com o ponteiro ainda em cima
    wind.current.mag = THREE.MathUtils.damp(wind.current.mag, 0, WIND_DECAY_LAMBDA, delta);

    const pointerActive = !reducedMotion && pointer.current.over && wind.current.mag > 0.05;
    const px = pointer.current.x;
    const py = pointer.current.y;
    const windPush = wind.current.mag * WIND_FACTOR;
    const wnx = wind.current.x;
    const wny = wind.current.y;

    const highlightAttr = highlightGeometry.getAttribute("position") as THREE.BufferAttribute;
    const highlightArr = highlightAttr.array as Float32Array;
    let hIdx = 0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const hx = homes[i * 3];
      const hy = homes[i * 3 + 1];
      const hz = homes[i * 3 + 2];

      let tx = hx;
      let ty = hy;
      let tz = hz;

      if (pointerActive) {
        const dx = hx - px;
        const dy = hy - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < WIND_RADIUS) {
          const falloff = 1 - dist / WIND_RADIUS;
          const push = falloff * falloff * windPush;
          // turbulência leve por partícula, pra não parecer um bloco rígido deslizando
          const turb = Math.sin(phases[i] * 9.1 + t * 2) * 0.35;
          tx = hx + wnx * push;
          ty = hy + wny * push + turb * push * 0.5;
          tz = hz + Math.cos(phases[i] * 5.7) * push * 0.7;
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
      arr[idx + 2] += (tz - arr[idx + 2]) * posDamping;

      if (i % HIGHLIGHT_STRIDE === 0 && hIdx < highlightArr.length / 3) {
        highlightArr[hIdx * 3] = arr[idx];
        highlightArr[hIdx * 3 + 1] = arr[idx + 1];
        highlightArr[hIdx * 3 + 2] = arr[idx + 2];
        hIdx++;
      }
    }
    posAttr.needsUpdate = true;
    highlightAttr.needsUpdate = true;

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

    // leve rotação contínua — com o volume em profundidade das partículas,
    // isso cria paralaxe real e vende a sensação de objeto 3D genuíno
    const idleRotY = reducedMotion || active ? 0 : Math.sin(t * 0.25 + basePosition[0]) * 0.16;
    const idleRotX = reducedMotion || active ? 0 : Math.cos(t * 0.2 + basePosition[0]) * 0.05;
    outer.current.rotation.y = THREE.MathUtils.damp(outer.current.rotation.y, idleRotY, 3, delta);
    outer.current.rotation.x = THREE.MathUtils.damp(outer.current.rotation.x, idleRotX, 3, delta);

    if (materialRef.current) {
      const matDamping = 1 - Math.exp(-MATERIAL_LAMBDA * delta);
      const targetColor = active ? COLOR_ACTIVE : dimmed ? COLOR_DIMMED : hovered ? COLOR_HOVER : COLOR_IDLE;
      colorScratch.current.copy(materialRef.current.color).lerp(targetColor, matDamping);
      materialRef.current.color.copy(colorScratch.current);

      const targetOpacity = active ? 1 : dimmed ? 0.6 : 1;
      materialRef.current.opacity = THREE.MathUtils.damp(materialRef.current.opacity, targetOpacity, 6, delta);

      const targetSize = active ? 0.095 : dimmed ? 0.055 : hovered ? 0.082 : 0.07;
      materialRef.current.size = THREE.MathUtils.damp(materialRef.current.size, targetSize, 6, delta);
    }

    if (highlightMaterialRef.current) {
      const twinkle = 0.55 + Math.sin(t * 2.1 + basePosition[0]) * 0.25;
      const targetOpacity = (active ? 1 : dimmed ? 0.35 : 0.85) * twinkle;
      highlightMaterialRef.current.opacity = THREE.MathUtils.damp(
        highlightMaterialRef.current.opacity,
        targetOpacity,
        5,
        delta,
      );
      const targetSize = active ? 0.16 : dimmed ? 0.08 : 0.13;
      highlightMaterialRef.current.size = THREE.MathUtils.damp(highlightMaterialRef.current.size, targetSize, 6, delta);
    }
  });

  return (
    <group ref={outer} position={basePosition}>
      <points geometry={geometry}>
        <pointsMaterial
          ref={materialRef}
          map={dotTexture}
          size={0.07}
          sizeAttenuation
          transparent
          opacity={1}
          color="#ff2d30"
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* camada de destaque — pontos maiores/brancos por cima, dão o "brilho"/glint que vende profundidade */}
      <points geometry={highlightGeometry}>
        <pointsMaterial
          ref={highlightMaterialRef}
          map={dotTexture}
          size={0.13}
          sizeAttenuation
          transparent
          opacity={0.75}
          color="#fff2f0"
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
          lastPointer.current.t = 0;
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
