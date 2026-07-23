import { useAuth } from "@/features/auth/AuthProvider";
import { useStore } from "@/lib/store/StoreProvider";
import { Panel, PanelTitle } from "../components/Panel";

export function ConfigView() {
  const { signOut, user } = useAuth();
  const { ready } = useStore();
  return (
    <Panel>
      <PanelTitle title="Dados do painel" sub="backup e limpeza" />
      <p className="text-sm leading-[1.7] text-dmg-text-2">
        Os dados ficam salvos no Firestore, compartilhados em tempo real com o time. Backup e reset
        agora são feitos pelo Console do Firebase.
      </p>
      <p className="mt-3 font-mono text-[11px] text-dmg-text-3">
        {ready ? "//" : "// aguardando conexão"} conectado como <b className="text-dmg-text">{user?.email}</b>
      </p>
      <div className="mt-6">
        <button
          onClick={() => signOut()}
          className="rounded border border-dmg-red-dark bg-dmg-red-dark/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-dmg-red hover:bg-dmg-red-dark/40"
        >
          ⎋ sair da conta
        </button>
      </div>
    </Panel>
  );
}
