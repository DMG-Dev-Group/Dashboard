import { useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { createChipTexture, createLabelTexture, createLetterTexture } from "./textures";

export interface Member3DData {
  id: string;
  letter: string;
  name: string;
  age: string;
  photo: string;
  stack: string[];
}

interface Props {
  member: Member3DData;
  basePosition: [number, number, number];
  active: boolean;
  dimmed: boolean;
  onSelect: (id: string | null) => void;
  reducedMotion: boolean;
}

const CARD_W = 2.15;
const CARD_H = 2.9;

export function MemberCard3D({ member, basePosition, active, dimmed, onSelect, reducedMotion }: Props) {
  const outer = useRef<THREE.Group>(null!);
  const tiltGroup = useRef<THREE.Group>(null!);
  const rimLight = useRef<THREE.PointLight>(null!);
  const letterMesh = useRef<THREE.Mesh>(null!);

  const [hovered, setHovered] = useState(false);
  const tilt = useRef({ x: 0, y: 0 });
  const mountedAt = useRef(performance.now());

  const photoTex = useTexture(member.photo);
  const letterTex = useMemo(() => createLetterTexture(member.letter), [member.letter]);
  const labelTex = useMemo(() => createLabelTexture(member.name, member.age), [member.name, member.age]);
  const chipTextures = useMemo(() => member.stack.map((s) => createChipTexture(s)), [member.stack]);

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (reducedMotion) return;
    const local = e.point.clone();
    tiltGroup.current.worldToLocal(local);
    tilt.current.x = THREE.MathUtils.clamp(-local.y / (CARD_H / 2), -1, 1);
    tilt.current.y = THREE.MathUtils.clamp(local.x / (CARD_W / 2), -1, 1);
  }

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const introProgress = reducedMotion
      ? 1
      : THREE.MathUtils.clamp((performance.now() - mountedAt.current - 120) / 700, 0, 1);
    const introEase = 1 - Math.pow(1 - introProgress, 3);

    // idle bob por card (fases diferentes evitam sincronismo robótico)
    const bob = reducedMotion ? 0 : Math.sin(t * 0.9 + basePosition[0] * 2) * 0.05;

    const focusZ = active ? 0.85 : dimmed ? -0.55 : 0;
    const focusX = active ? 0 : dimmed ? basePosition[0] * 1.6 : basePosition[0];
    const focusY = active ? 0.55 : basePosition[1] + bob;
    const targetScale = active ? 1.14 : dimmed ? 0.82 : 1;

    const targetX = THREE.MathUtils.damp(outer.current.position.x, focusX, 4, delta);
    const targetY = THREE.MathUtils.damp(outer.current.position.y, focusY, 4, delta);
    const targetZ = THREE.MathUtils.damp(outer.current.position.z, basePosition[2] + focusZ, 4, delta);
    outer.current.position.set(targetX, targetY, targetZ);

    const s = THREE.MathUtils.damp(outer.current.scale.x, targetScale * (0.9 + introEase * 0.1), 5, delta);
    outer.current.scale.setScalar(s);

    const targetRotY = active ? 0 : dimmed ? -basePosition[0] * 0.35 : 0;
    outer.current.rotation.y = THREE.MathUtils.damp(outer.current.rotation.y, targetRotY, 4, delta);

    // tilt local (hover) + leve autorrotação quando inativo
    const idleRotY = reducedMotion || active ? 0 : Math.sin(t * 0.4 + basePosition[0]) * 0.06;
    const desiredTiltX = hovered ? tilt.current.x * 0.32 : 0;
    const desiredTiltY = hovered ? tilt.current.y * 0.32 + idleRotY : idleRotY;
    tiltGroup.current.rotation.x = THREE.MathUtils.damp(tiltGroup.current.rotation.x, desiredTiltX, 6, delta);
    tiltGroup.current.rotation.y = THREE.MathUtils.damp(tiltGroup.current.rotation.y, desiredTiltY, 6, delta);

    if (letterMesh.current) {
      letterMesh.current.rotation.z = active ? 0 : t * 0.05 + basePosition[0];
    }

    if (rimLight.current) {
      const targetIntensity = hovered || active ? 3.2 : 1.1;
      rimLight.current.intensity = THREE.MathUtils.damp(rimLight.current.intensity, targetIntensity, 5, delta);
    }
  });

  return (
    <group ref={outer} position={basePosition}>
      <group
        ref={tiltGroup}
        onPointerMove={handlePointerMove}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(active ? null : member.id);
        }}
      >
        {/* moldura de vidro — transmissão nativa do Three (1 passe global,
            bem mais leve que materiais de vidro com passe próprio por objeto) */}
        <RoundedBox args={[CARD_W, CARD_H, 0.22]} radius={0.1} smoothness={4} position={[0, 0, -0.05]}>
          <meshPhysicalMaterial
            transmission={1}
            thickness={0.6}
            roughness={0.18}
            ior={1.15}
            reflectivity={0.35}
            clearcoat={0.6}
            clearcoatRoughness={0.25}
            color={active || hovered ? "#3a0a0a" : "#120404"}
            attenuationColor={active || hovered ? "#ff4d4f" : "#7f1416"}
            attenuationDistance={1.4}
          />
        </RoundedBox>

        {/* letra gigante — logo à frente do vidro, atrás da foto: sensação real de
            profundidade em camadas (a foto ocluindo o centro da letra) */}
        <mesh ref={letterMesh} position={[0, 0.05, 0.075]}>
          <planeGeometry args={[3.1, 3.1]} />
          <meshBasicMaterial map={letterTex} transparent depthWrite={false} />
        </mesh>

        {/* nome/idade — gravados no vidro, logo abaixo da foto */}
        <mesh position={[0, -CARD_H / 2 + 0.42, 0.095]}>
          <planeGeometry args={[1.72, 0.5]} />
          <meshBasicMaterial map={labelTex} transparent depthWrite={false} />
        </mesh>

        {/* foto — plano mais à frente, à frente do vidro */}
        <mesh position={[0, 0.22, 0.14]}>
          <planeGeometry args={[CARD_W - 0.42, CARD_H - 1.15]} />
          <meshStandardMaterial map={photoTex} roughness={0.55} metalness={0.05} />
        </mesh>

        {/* borda fina vermelha no topo do card */}
        <mesh position={[0, CARD_H / 2 - 0.02, 0.08]}>
          <boxGeometry args={[CARD_W - 0.1, 0.02, 0.02]} />
          <meshStandardMaterial color="#ff4d4f" emissive="#c0181a" emissiveIntensity={1.4} />
        </mesh>

        <pointLight ref={rimLight} position={[0, 0, 1.4]} color="#ff4d4f" intensity={1.1} distance={4} />
      </group>

      {/* stack — chips flutuantes, só "materializam" quando o card está ativo */}
      <group position={[0, -CARD_H / 2 - 0.05, 0.6]}>
        {member.stack.map((s, i) => (
          <StackChip
            key={s}
            label={s}
            texture={chipTextures[i]}
            index={i}
            total={member.stack.length}
            active={active}
          />
        ))}
      </group>
    </group>
  );
}

function StackChip({
  label,
  texture,
  index,
  total,
  active,
}: {
  label: string;
  texture: THREE.CanvasTexture;
  index: number;
  total: number;
  active: boolean;
}) {
  const ref = useRef<THREE.Group>(null!);
  const spread = 0.62;
  const col = index - (total - 1) / 2;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const delay = index * 0.06;
    const targetScale = active ? 1 : 0;
    const targetY = active ? Math.sin(t * 1.6 + index) * 0.045 : -0.3;
    const targetOpacity = active ? 1 : 0;

    const s = THREE.MathUtils.damp(ref.current.scale.x, targetScale, active ? 6 - delay * 4 : 10, delta);
    ref.current.scale.setScalar(Math.max(s, 0));
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, targetY, 5, delta);

    const mat = (ref.current.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial;
    mat.opacity = THREE.MathUtils.damp(mat.opacity, targetOpacity, 6, delta);
  });

  return (
    <group ref={ref} position={[col * spread, -0.3, 0]} scale={0}>
      <mesh>
        <planeGeometry args={[0.56, 0.175]} />
        <meshBasicMaterial map={texture} transparent opacity={0} />
      </mesh>
    </group>
  );
}
