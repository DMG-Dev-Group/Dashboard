import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store/StoreProvider";
import { useModal } from "../modals/ModalProvider";
import { useConfirm } from "../components/ConfirmProvider";
import { ClienteModal } from "../modals/ClienteModal";
import { projetosDoCliente } from "@/lib/store/relations";
import { dmgToast } from "@/lib/toast";
import { Plus, Trash2 } from "lucide-react";
import { ClassicButtonSm, ClassicEmpty, ClassicIconMini, ClassicPanel } from "../components/classic/ClassicUI";

export function ClientesViewClassic() {
  const { clientes, projetos, remove, log } = useStore();
  const { open } = useModal();
  const confirm = useConfirm();

  return (
    <ClassicPanel
      title="Base de clientes"
      sub="carteira ativa da DMG"
      action={
        <ClassicButtonSm onClick={() => open("Novo cliente", (close) => <ClienteModal onClose={close} />)}>
          <Plus className="h-3.5 w-3.5" /> novo cliente
        </ClassicButtonSm>
      }
    >
      {clientes.length === 0 ? (
        <ClassicEmpty>Nenhum cliente cadastrado.</ClassicEmpty>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {clientes.map((c) => {
            const projs = projetosDoCliente(c, projetos);
            return (
              <div
                key={c.id}
                className="group relative flex gap-3.5 rounded-2xl border border-white/8 bg-white/[.035] p-4 transition-all hover:-translate-y-0.5 hover:border-dmg-red-solid/40"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border border-dmg-red-dark/35 bg-dmg-red-solid/[.12] text-base font-bold text-dmg-red">
                  {c.nome[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14.5px] font-semibold text-dmg-text">{c.nome}</div>
                  <div className="truncate text-xs text-dmg-text-2">{c.contato || "sem contato"}</div>
                  <div className="mt-1 text-[11px] text-white/32">cliente desde {c.desde || "—"}</div>
                  {projs.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {projs.map((p) => (
                        <Link
                          key={p.id}
                          to="/projetos/$id"
                          params={{ id: p.id }}
                          className="rounded-lg border border-white/10 bg-white/[.04] px-2 py-0.5 font-mono text-[10px] text-dmg-text-2 hover:border-dmg-red-dark hover:text-dmg-red"
                        >
                          {p.nome} →
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <ClassicIconMini
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100"
                  onClick={async () => {
                    if (await confirm({ title: `Remover o cliente "${c.nome}"?`, danger: true })) {
                      await remove("clientes", c.id);
                      await log(`<b>Cliente</b> — ${c.nome} removido`, "cliente");
                      dmgToast.success("Cliente removido");
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </ClassicIconMini>
              </div>
            );
          })}
        </div>
      )}
    </ClassicPanel>
  );
}
