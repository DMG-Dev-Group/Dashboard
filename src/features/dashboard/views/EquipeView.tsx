import danImg from "@/assets/dan.png";
import migoImg from "@/assets/migo.png";
import guiguiImg from "@/assets/guigui.png";
import { EquipeScene } from "./equipe3d/EquipeScene";
import type { Member3DData } from "./equipe3d/MemberCard3D";

const members: Member3DData[] = [
  {
    id: "d",
    letter: "D",
    name: "Daniel",
    age: "22 anos",
    photo: danImg,
    stack: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
  },
  {
    id: "m",
    letter: "M",
    name: "Miguel",
    age: "21 anos",
    photo: migoImg,
    stack: ["Python", "Flutter", "Firebase", "Go", "AWS"],
  },
  {
    id: "g",
    letter: "G",
    name: "Guilherme",
    age: "23 anos",
    photo: guiguiImg,
    stack: ["Rust", "Next.js", "Redis", "Kubernetes", "GraphQL"],
  },
];

export function EquipeView() {
  return <EquipeScene members={members} />;
}
