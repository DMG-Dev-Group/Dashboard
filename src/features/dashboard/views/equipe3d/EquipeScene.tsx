import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LETTER_HIT_W, ParticleLetter, type Member3DData } from "./ParticleLetter";

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
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setWebgl(supportsWebGL());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    setReady(true);
  }, []);

  if (!ready) return <div className="h-[640px]" />;

  if (!webgl) return <FallbackGrid members={members} />;

  const activeMember = members.find((m) => m.id === activeId) ?? null;

  return (
    <div className="relative h-[640px] w-full overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(192,24,26,.14),transparent_60%),#050505]">
      <SceneErrorBoundary fallback={<FallbackGrid members={members} />}>
        <Canvas
          dpr={[1, 1.8]}
          camera={{ position: [0, 0.3, 7.4], fov: 32 }}
          gl={{ antialias: true, alpha: true }}
        >
          <SceneContent members={members} reducedMotion={reducedMotion} activeId={activeId} onSelect={setActiveId} />
        </Canvas>
      </SceneErrorBoundary>

      <div className="pointer-events-none absolute inset-x-0 top-5 text-center">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.32em] text-dmg-red-solid">
          // quem somos
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-white md:text-3xl">Os fundadores da DMG</h2>
      </div>

      {/* rótulos sempre visíveis, um sob cada letra */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[76px] flex justify-around px-10 md:px-24">
        {members.map((m) => (
          <span
            key={m.id}
            className={`font-mono text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 ${
              activeId === m.id ? "text-dmg-red-solid" : "text-white/35"
            }`}
          >
            {m.name}
          </span>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-6">
        {activeMember ? (
          <div className="pointer-events-auto flex w-full max-w-md items-center gap-4 rounded-2xl border border-dmg-border-strong bg-dmg-surface/90 p-3 backdrop-blur-sm">
            <img
              src={activeMember.photo}
              alt={activeMember.name}
              className="h-14 w-14 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-extrabold text-white">
                {activeMember.name}{" "}
                <span className="font-mono text-xs font-normal text-white/40">{activeMember.age}</span>
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {activeMember.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded border border-dmg-border-strong bg-dmg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-dmg-text-2"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
            clique numa letra pra revelar quem é
          </p>
        )}
      </div>
    </div>
  );
}

function SceneContent({
  members,
  reducedMotion,
  activeId,
  onSelect,
}: {
  members: Member3DData[];
  reducedMotion: boolean;
  activeId: string | null;
  onSelect: (id: string | null) => void;
}) {
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
    const targetRotY = pointer.current.x * 0.06;
    const targetRotX = -pointer.current.y * 0.03;
    rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, targetRotY, 4, delta);
    rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, targetRotX, 4, delta);
  });

  // espaçamento responsivo — mesma lógica usada antes pros cards, evitando
  // que as letras das pontas estourem as bordas arredondadas do container
  const { viewport } = useThree();
  const positions = useMemo<[number, number, number][]>(() => {
    const maxSpan = viewport.width * 0.8;
    const gap =
      members.length > 1
        ? THREE.MathUtils.clamp((maxSpan - LETTER_HIT_W) / (members.length - 1), 1.7, 2.3)
        : 0;
    const startX = -((members.length - 1) * gap) / 2;
    return members.map((_, i) => [startX + i * gap, 0, 0] as [number, number, number]);
  }, [members, viewport.width]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 1, 4]} color="#ff4d4f" intensity={1.4} distance={10} />

      <group ref={rig} onPointerMissed={() => onSelect(null)}>
        {members.map((m, i) => (
          <ParticleLetter
            key={m.id}
            id={m.id}
            letter={m.letter}
            basePosition={positions[i]}
            active={activeId === m.id}
            dimmed={activeId !== null && activeId !== m.id}
            onSelect={onSelect}
            reducedMotion={reducedMotion}
          />
        ))}
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
