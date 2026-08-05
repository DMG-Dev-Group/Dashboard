import { useRef, useState } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { Panel, PanelTitle } from "../components/Panel";
import { EV_TIPOS } from "@/lib/store/constants";
import { isoDay } from "@/lib/format";
import { useModal } from "../modals/ModalProvider";
import { EventoModal } from "../modals/EventoModal";
import { EventoDetalheModal } from "../modals/EventoDetalheModal";
import { MonthYearPicker } from "../components/MonthYearPicker";
import { dmgToast } from "@/lib/toast";
import type { Evento } from "@/lib/store/types";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export function CalendarioView() {
  const { eventos, update } = useStore();
  const { open } = useModal();
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth());
  const draggingId = useRef<string | null>(null);

  const primeiro = new Date(ano, mes, 1);
  const hojeISO = isoDay(new Date());
  const inicio = new Date(primeiro);
  inicio.setDate(1 - primeiro.getDay());

  const dias: { iso: string; num: number; outro: boolean; today: boolean; evs: typeof eventos }[] =
    [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + i);
    const iso = isoDay(d);
    dias.push({
      iso,
      num: d.getDate(),
      outro: d.getMonth() !== mes,
      today: iso === hojeISO,
      evs: eventos
        .filter((ev) => ev.data === iso)
        .sort((a, b) => (a.hora || "").localeCompare(b.hora || "")),
    });
  }

  const proximos = eventos
    .filter((ev) => ev.data >= hojeISO)
    .sort((a, b) => (a.data + (a.hora || "")).localeCompare(b.data + (b.hora || "")))
    .slice(0, 8);

  function irParaHoje() {
    const hoje = new Date();
    setAno(hoje.getFullYear());
    setMes(hoje.getMonth());
  }

  async function moverEvento(id: string, novaData: string) {
    const ev = eventos.find((e) => e.id === id);
    if (!ev || ev.data === novaData) return;
    await update("eventos", id, { data: novaData });
    dmgToast.success("Evento movido");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
      <Panel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                let m = mes - 1;
                let a = ano;
                if (m < 0) {
                  m = 11;
                  a--;
                }
                setMes(m);
                setAno(a);
              }}
              className="rounded p-1.5 hover:bg-dmg-surface-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <MonthYearPicker
              ano={ano}
              mes={mes}
              onSelect={(a, m) => {
                setAno(a);
                setMes(m);
              }}
            >
              <button className="rounded px-2 py-1 text-lg font-bold capitalize hover:bg-dmg-surface-2">
                {primeiro.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </button>
            </MonthYearPicker>
            <button
              onClick={() => {
                let m = mes + 1;
                let a = ano;
                if (m > 11) {
                  m = 0;
                  a++;
                }
                setMes(m);
                setAno(a);
              }}
              className="rounded p-1.5 hover:bg-dmg-surface-2"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={irParaHoje}
              className="ml-1 rounded border border-dmg-border-strong px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-dmg-text-2 hover:border-dmg-red-dark hover:text-dmg-text"
            >
              hoje
            </button>
          </div>
          <button
            onClick={() => open("Novo evento", (close) => <EventoModal onClose={close} />)}
            className="inline-flex items-center gap-1.5 rounded border border-dmg-border-strong bg-dmg-surface-2 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] hover:border-dmg-red-dark"
          >
            <Plus className="h-3.5 w-3.5" /> novo evento
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded border border-dmg-border bg-dmg-border text-sm">
          {["dom", "seg", "ter", "qua", "qui", "sex", "sáb"].map((d) => (
            <div
              key={d}
              className="bg-dmg-surface-2 px-2 py-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-dmg-text-3"
            >
              {d}
            </div>
          ))}
          {dias.map((day) => (
            <div
              key={day.iso}
              onClick={() =>
                open("Novo evento", (close) => (
                  <EventoModal dataInicial={day.iso} onClose={close} />
                ))
              }
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggingId.current) void moverEvento(draggingId.current, day.iso);
              }}
              className={`flex min-h-[76px] flex-col items-start gap-1 bg-dmg-surface p-1.5 text-left text-xs transition-colors hover:bg-dmg-surface-2 cursor-pointer ${
                day.outro ? "opacity-40" : ""
              } ${day.today ? "ring-1 ring-inset ring-dmg-red" : ""}`}
            >
              <span className="font-mono text-[11px] text-dmg-text-2">{day.num}</span>
              {day.evs.slice(0, 2).map((ev) => (
                <span
                  key={ev.id}
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    draggingId.current = ev.id;
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    open(ev.titulo, (close) => <EventoDetalheModal evento={ev} onClose={close} />);
                  }}
                  className="w-full cursor-grab truncate rounded bg-dmg-red-solid/20 px-1 py-0.5 text-[10px] text-dmg-red hover:bg-dmg-red-solid/30"
                  title={ev.titulo}
                >
                  {ev.hora ? ev.hora + " · " : ""}
                  {ev.titulo}
                </span>
              ))}
              {day.evs.length > 2 && (
                <span className="font-mono text-[9px] text-dmg-text-3">+{day.evs.length - 2}</span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-3">
          // clique num dia vazio para criar, num evento para ver detalhes — arraste um evento para
          mudar de dia
        </p>
      </Panel>

      <Panel>
        <PanelTitle title="Próximos eventos" sub="agenda da equipe" />
        {proximos.length === 0 ? (
          <p className="font-mono text-sm text-dmg-text-3">Nenhum evento futuro.</p>
        ) : (
          <div className="space-y-3">
            {proximos.map((ev) => (
              <ProximoEventoItem key={ev.id} ev={ev} />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function ProximoEventoItem({ ev }: { ev: Evento }) {
  const { open } = useModal();
  return (
    <button
      onClick={() => open(ev.titulo, (close) => <EventoDetalheModal evento={ev} onClose={close} />)}
      className="flex w-full items-start gap-3 rounded border border-dmg-border bg-dmg-surface-2/50 px-4 py-3 text-left hover:border-dmg-red-dark/60"
    >
      <span className="mt-1">📅</span>
      <div className="flex-1">
        <div className="text-sm font-semibold">{ev.titulo}</div>
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-3">
          {EV_TIPOS[ev.tipo || "outro"] || "Evento"} ·{" "}
          {new Date(ev.data + "T12:00").toLocaleDateString("pt-BR", {
            weekday: "short",
            day: "2-digit",
            month: "short",
          })}
          {ev.hora ? ` · ${ev.hora}` : ""}
        </div>
      </div>
    </button>
  );
}
