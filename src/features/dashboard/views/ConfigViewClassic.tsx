import { useAuth } from "@/features/auth/AuthProvider";
import { useStore } from "@/lib/store/StoreProvider";
import { ClassicButtonSm, ClassicPanel } from "../components/classic/ClassicUI";

export function ConfigViewClassic() {
  const { signOut, user } = useAuth();
  const { ready } = useStore();
  return (
    <ClassicPanel title="Dados do painel" sub="backup e limpeza">
      <p className="text-sm leading-[1.7] text-dmg-text-2">
        Os dados ficam salvos no Firestore, compartilhados em tempo real com o time. Backup e reset
        agora são feitos pelo Console do Firebase.
      </p>
      <p className="mt-3 text-[11px] text-dmg-text-3">
        {ready ? "//" : "// aguardando conexão"} conectado como{" "}
        <b className="font-semibold text-dmg-text">{user?.email}</b>
      </p>
      <div className="mt-6">
        <ClassicButtonSm danger onClick={() => signOut()}>
          ⎋ sair da conta
        </ClassicButtonSm>
      </div>
    </ClassicPanel>
  );
}
