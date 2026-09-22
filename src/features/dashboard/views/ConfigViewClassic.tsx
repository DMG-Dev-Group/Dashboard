import { useRef, useState } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { useConfig } from "./useConfig";
import { nomeDoUsuario, iniciaisDoUsuario } from "@/lib/userProfile";
import { fmtDataHoraCompleta } from "@/lib/format";
import { Camera, KeyRound, ShieldCheck, ShieldOff, Smartphone } from "lucide-react";
import { ClassicButtonSm, ClassicPanel } from "../components/classic/ClassicUI";

const INPUT_CLS =
  "w-full rounded-lg border border-white/10 bg-black/28 px-3 py-2.5 text-[13px] text-[#eaeaea] outline-none placeholder:text-white/26 focus:border-dmg-red-solid/55";

export function ConfigViewClassic() {
  const { ready } = useStore();
  const cfg = useConfig();
  const nome = cfg.user ? nomeDoUsuario(cfg.user) : "";

  return (
    <div className="flex flex-col gap-5">
      <ClassicPanel title="Perfil" sub="como você aparece no painel">
        <div className="flex flex-wrap items-start gap-6">
          <AvatarUpload
            fotoUrl={cfg.perfil.fotoUrl}
            iniciais={iniciaisDoUsuario(nome)}
            onUpload={cfg.salvarFoto}
          />
          <div className="flex-1 min-w-[240px] space-y-4">
            <CampoSalvavel label="Nome" initial={nome} onSave={cfg.salvarNome} busy={cfg.busy} />
            <div>
              <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-dmg-text-3">
                Email
              </span>
              <p className="text-sm text-dmg-text-2">{cfg.user?.email}</p>
              <p className="mt-0.5 text-[11px] text-dmg-text-3">altere em Segurança abaixo</p>
            </div>
            <CampoSalvavel
              label="Telefone"
              initial={cfg.perfil.telefone ?? ""}
              placeholder="(11) 91234-5678"
              onSave={cfg.salvarTelefone}
              busy={cfg.busy}
            />
          </div>
        </div>
      </ClassicPanel>

      <ClassicPanel title="Segurança" sub="email, senha e verificação em duas etapas">
        <div className="space-y-6">
          <TrocarEmail onSubmit={cfg.alterarEmail} busy={cfg.busy} />
          <hr className="border-white/8" />
          <TrocarSenha onSubmit={cfg.alterarSenha} busy={cfg.busy} />
          <hr className="border-white/8" />
          <Secao2FA cfg={cfg} />
          <hr className="border-white/8" />
          <UltimosLogins logins={cfg.logins} />
        </div>
      </ClassicPanel>

      <ClassicPanel title="Dados do painel" sub="backup e limpeza">
        <p className="text-sm leading-[1.7] text-dmg-text-2">
          Os dados ficam salvos no Firestore, compartilhados em tempo real com o time. Backup e
          reset agora são feitos pelo Console do Firebase.
        </p>
        <p className="mt-3 text-[11px] text-dmg-text-3">
          {ready ? "//" : "// aguardando conexão"} conectado como{" "}
          <b className="font-semibold text-dmg-text">{cfg.user?.email}</b>
        </p>
        <div className="mt-6">
          <ClassicButtonSm danger onClick={() => cfg.signOut()}>
            ⎋ sair da conta
          </ClassicButtonSm>
        </div>
      </ClassicPanel>
    </div>
  );
}

function AvatarUpload({
  fotoUrl,
  iniciais,
  onUpload,
}: {
  fotoUrl?: string;
  iniciais: string;
  onUpload: (file: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative">
      <button
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-dmg-red-dark/45 bg-dmg-red-solid/[.12] text-lg font-bold text-dmg-red"
      >
        {fotoUrl ? (
          <img src={fotoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>{iniciais}</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="h-5 w-5 text-white" />
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function CampoSalvavel({
  label,
  initial,
  placeholder,
  onSave,
  busy,
}: {
  label: string;
  initial: string;
  placeholder?: string;
  onSave: (v: string) => Promise<void>;
  busy: boolean;
}) {
  const [value, setValue] = useState(initial);
  const dirty = value !== initial;
  return (
    <div>
      <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-dmg-text-3">
        {label}
      </span>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={INPUT_CLS}
        />
        {dirty && (
          <ClassicButtonSm onClick={() => onSave(value)} disabled={busy}>
            salvar
          </ClassicButtonSm>
        )}
      </div>
    </div>
  );
}

function TrocarEmail({
  onSubmit,
  busy,
}: {
  onSubmit: (email: string, senha: string) => Promise<void>;
  busy: boolean;
}) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await onSubmit(email, senha);
          setEmail("");
          setSenha("");
        } catch {
          /* toast já mostrou o erro */
        }
      }}
      className="space-y-2"
    >
      <p className="text-[11px] uppercase tracking-[0.14em] text-dmg-text-2">Alterar email</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input
          type="email"
          required
          placeholder="novo email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT_CLS}
        />
        <input
          type="password"
          required
          placeholder="senha atual"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className={INPUT_CLS}
        />
        <ClassicButtonSm type="submit" disabled={busy}>
          salvar
        </ClassicButtonSm>
      </div>
    </form>
  );
}

function TrocarSenha({
  onSubmit,
  busy,
}: {
  onSubmit: (nova: string, senhaAtual: string) => Promise<void>;
  busy: boolean;
}) {
  const [nova, setNova] = useState("");
  const [confirma, setConfirma] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [erro, setErro] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setErro("");
        if (nova.length < 6) {
          setErro("A nova senha precisa ter pelo menos 6 caracteres.");
          return;
        }
        if (nova !== confirma) {
          setErro("As senhas não coincidem.");
          return;
        }
        try {
          await onSubmit(nova, senhaAtual);
          setNova("");
          setConfirma("");
          setSenhaAtual("");
        } catch {
          /* toast já mostrou o erro */
        }
      }}
      className="space-y-2"
    >
      <p className="text-[11px] uppercase tracking-[0.14em] text-dmg-text-2">Alterar senha</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input
          type="password"
          required
          placeholder="nova senha"
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          className={INPUT_CLS}
        />
        <input
          type="password"
          required
          placeholder="confirmar nova senha"
          value={confirma}
          onChange={(e) => setConfirma(e.target.value)}
          className={INPUT_CLS}
        />
        <input
          type="password"
          required
          placeholder="senha atual"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          className={INPUT_CLS}
        />
      </div>
      {erro && <p className="text-xs text-dmg-red">{erro}</p>}
      <ClassicButtonSm type="submit" disabled={busy}>
        salvar nova senha
      </ClassicButtonSm>
    </form>
  );
}

function Secao2FA({ cfg }: { cfg: ReturnType<typeof useConfig> }) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senhaDesativar, setSenhaDesativar] = useState("");
  const [mostrarDesativar, setMostrarDesativar] = useState(false);

  if (cfg.totpSecret) {
    return (
      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-dmg-text-2">
          Configurar app autenticador
        </p>
        <p className="text-sm text-dmg-text-2">
          Abra seu app autenticador (Google Authenticator, Authy, 1Password...) e adicione uma conta
          manualmente com esta chave:
        </p>
        <p className="select-all break-all rounded-lg border border-white/10 bg-black/28 px-3 py-2 font-mono text-sm text-dmg-text">
          {cfg.totpSecret.secretKey}
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await cfg.confirmar2FA(codigo);
              setCodigo("");
            } catch {
              /* toast já mostrou o erro */
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            inputMode="numeric"
            placeholder="código de 6 dígitos"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            maxLength={6}
            className={INPUT_CLS}
          />
          <ClassicButtonSm type="submit" disabled={cfg.busy}>
            confirmar
          </ClassicButtonSm>
          <ClassicButtonSm type="button" outline onClick={cfg.cancelar2FA}>
            cancelar
          </ClassicButtonSm>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-dmg-text-2">
        Verificação em duas etapas (2FA)
      </p>
      {cfg.tem2FA ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-dmg-text">2FA ativado</p>
            <p className="text-[11px] text-dmg-text-3">
              {cfg.fatores[0]?.displayName || "App autenticador"}
            </p>
          </div>
          {!mostrarDesativar && (
            <ClassicButtonSm outline onClick={() => setMostrarDesativar(true)}>
              <ShieldOff className="h-3.5 w-3.5" /> desativar
            </ClassicButtonSm>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[.035] px-4 py-3">
          <Smartphone className="h-5 w-5 shrink-0 text-dmg-text-3" />
          <p className="flex-1 text-sm text-dmg-text-2">2FA desativado — recomendado ativar.</p>
        </div>
      )}

      {mostrarDesativar && cfg.tem2FA ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await cfg.desativar2FA(cfg.fatores[0], senhaDesativar);
              setSenhaDesativar("");
              setMostrarDesativar(false);
            } catch {
              /* toast já mostrou o erro */
            }
          }}
          className="flex gap-2"
        >
          <input
            type="password"
            required
            placeholder="senha atual"
            value={senhaDesativar}
            onChange={(e) => setSenhaDesativar(e.target.value)}
            className={INPUT_CLS}
          />
          <ClassicButtonSm danger type="submit" disabled={cfg.busy}>
            confirmar desativação
          </ClassicButtonSm>
        </form>
      ) : !cfg.tem2FA ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await cfg.iniciar2FA(senhaAtual);
              setSenhaAtual("");
            } catch {
              /* toast já mostrou o erro */
            }
          }}
          className="flex gap-2"
        >
          <input
            type="password"
            required
            placeholder="senha atual"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            className={INPUT_CLS}
          />
          <ClassicButtonSm type="submit" disabled={cfg.busy}>
            <KeyRound className="h-3.5 w-3.5" /> ativar 2FA
          </ClassicButtonSm>
        </form>
      ) : null}
    </div>
  );
}

function UltimosLogins({ logins }: { logins: ReturnType<typeof useConfig>["logins"] }) {
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-dmg-text-2">Últimos logins</p>
      <p className="mb-3 text-xs text-dmg-text-3">
        Sessões simultâneas não podem ser listadas sem um backend dedicado — abaixo estão os últimos
        logins registrados nesta conta.
      </p>
      {logins.length === 0 ? (
        <p className="text-sm text-dmg-text-3">Nenhum login registrado ainda.</p>
      ) : (
        <ul className="space-y-1.5">
          {logins.map((l) => (
            <li
              key={l.id}
              className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[.03] px-3 py-2 text-xs"
            >
              <span className="text-dmg-text-2">{fmtDataHoraCompleta(l.ts)}</span>
              <span className="max-w-[50%] truncate font-mono text-[10px] text-dmg-text-3">
                {l.userAgent}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
