import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { MemberCard3D, type Member3DData } from "./MemberCard3D";

interface Props {
  members: Member3DData[];
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function EquipeScene({ members }: Props) {
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setWebgl(supportsWebGL());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    setReady(true);
  }, []);

  if (!ready) return <div className="h-[640px]" />;

  if (!webgl) return <FallbackGrid members={members} />;

  return (
    <div className="relative h-[640px] w-full overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(192,24,26,.14),transparent_60%),#050505]">
      <SceneErrorBoundary fallback={<FallbackGrid members={members} />}>
        <Canvas
          dpr={[1, 1.8]}
          camera={{ position: [0, 0.4, 7.2], fov: 32 }}
          gl={{ antialias: true, alpha: true }}
        >
          <SceneContent members={members} reducedMotion={reducedMotion} />
        </Canvas>
      </SceneErrorBoundary>
      <div className="pointer-events-none absolute inset-x-0 top-5 text-center">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.32em] text-dmg-red-solid">
          // quem somos
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-white md:text-3xl">Os fundadores da DMG</h2>
      </div>
      <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
        clique num card para revelar a stack
      </p>
    </div>
  );
}

function SceneContent({ members, reducedMotion }: { members: Member3DData[]; reducedMotion: boolean }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const rig = useRef<THREE.Group>(null!);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function onMove(e: PointerEvent) {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    if (!rig.current || reducedMotion) return;
    const targetRotY = pointer.current.x * 0.08;
    const targetRotX = -pointer.current.y * 0.04;
    rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, targetRotY, 4, delta);
    rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, targetRotX, 4, delta);
  });

  const positions = useMemo<[number, number, number][]>(() => {
    const gap = 2.55;
    const startX = -((members.length - 1) * gap) / 2;
    return members.map((_, i) => [startX + i * gap, 0, 0] as [number, number, number]);
  }, [members]);

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} color="#ffffff" />
      <pointLight position={[-4, -2, 2]} color="#c0181a" intensity={2.2} distance={9} />

      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} color="#ffffff" position={[0, 3, 2]} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={3} color="#ff4d4f" position={[-4, 0, -2]} scale={[2, 4, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#8899ff" position={[4, -1, -2]} scale={[2, 4, 1]} />
      </Environment>

      <group ref={rig} onPointerMissed={() => setActiveId(null)}>
        {members.map((m, i) => (
          <MemberCard3D
            key={m.id}
            member={m}
            basePosition={positions[i]}
            active={activeId === m.id}
            dimmed={activeId !== null && activeId !== m.id}
            onSelect={setActiveId}
            reducedMotion={reducedMotion}
          />
        ))}

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, 0]}>
          <planeGeometry args={[24, 12]} />
          <MeshReflectorMaterial
            blur={[200, 50]}
            resolution={256}
            mixBlur={1}
            mixStrength={30}
            roughness={1}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.2}
            color="#050505"
            metalness={0.4}
            mirror={0}
          />
        </mesh>
      </group>
    </>
  );
}

/** Se a cena 3D falhar em qualquer dispositivo/driver, cai pro grid estático em vez de quebrar a página. */
class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function FallbackGrid({ members }: { members: Member3DData[] }) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-[28px] border border-white/10 bg-[#050505] p-8 md:flex-row md:justify-center">
      {members.map((m) => (
        <div
          key={m.id}
          className="w-full max-w-[220px] rounded-2xl border border-dmg-border bg-dmg-surface p-4 text-center"
        >
          <img src={m.photo} alt={m.name} className="mx-auto h-32 w-32 rounded-lg object-cover" />
          <p className="mt-3 text-lg font-extrabold text-white">{m.name}</p>
          <p className="font-mono text-xs text-white/40">{m.age}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {m.stack.map((s) => (
              <span
                key={s}
                className="rounded border border-dmg-border-strong bg-dmg-surface-2 px-2 py-0.5 font-mono text-[10px] text-dmg-text-2"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
