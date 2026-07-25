import { useStore } from "@/lib/store/StoreProvider";
import { tempoRelativo } from "@/lib/format";
import { Activity } from "lucide-react";
import { ClassicActivityItem, ClassicEmpty, ClassicPanel } from "../components/classic/ClassicUI";

export function AtividadesViewClassic() {
  const { atividades } = useStore();
  return (
    <ClassicPanel title="Registro de atividades" sub="tudo que aconteceu no painel">
      {atividades.length === 0 ? (
        <ClassicEmpty>Nenhuma atividade registrada.</ClassicEmpty>
      ) : (
        <div className="space-y-3.5">
          {atividades.map((a) => (
            <ClassicActivityItem key={a.id} icon={<Activity className="h-3.5 w-3.5" />} time={tempoRelativo(a.ts)}>
              <div dangerouslySetInnerHTML={{ __html: a.texto }} />
            </ClassicActivityItem>
          ))}
        </div>
      )}
    </ClassicPanel>
  );
}
