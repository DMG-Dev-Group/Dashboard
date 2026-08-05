import { useRef, useState } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { EV_TIPOS } from "@/lib/store/constants";
import { isoDay } from "@/lib/format";
import { useModal } from "../modals/ModalProvider";
import { EventoModal } from "../modals/EventoModal";
import { EventoDetalheModal } from "../modals/EventoDetalheModal";
import { MonthYearPicker } from "../components/MonthYearPicker";
import { dmgToast } from "@/lib/toast";
import type { Evento } from "@/lib/store/types";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  ClassicActivityItem,
  ClassicButtonSm,
  ClassicEmpty,
  ClassicIconMini,
  ClassicPanel,
} from "../components/classic/ClassicUI";

export function CalendarioViewClassic() {
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
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2.2fr_1fr]">
      <ClassicPanel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ClassicIconMini
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
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </ClassicIconMini>
            <MonthYearPicker
              ano={ano}
              mes={mes}
              onSelect={(a, m) => {
                setAno(a);
                setMes(m);
              }}
            >
              <button className="min-w-[170px] rounded px-2 py-1 text-center text-[15px] font-semibold capitalize text-dmg-text hover:bg-white/[.04]">
                {primeiro.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </button>
            </MonthYearPicker>
            <ClassicIconMini
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
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </ClassicIconMini>
            <ClassicButtonSm outline onClick={irParaHoje}>
              hoje
            </ClassicButtonSm>
          </div>
          <ClassicButtonSm
            onClick={() => open("Novo evento", (close) => <EventoModal onClose={close} />)}
          >
            <Plus className="h-3.5 w-3.5" /> novo evento
          </ClassicButtonSm>
        </div>

        <div className="mb-1.5 grid grid-cols-7 gap-1.5">
          {["dom", "seg", "ter", "qua", "qui", "sex", "sáb"].map((d) => (
            <div
              key={d}
              className="py-1 text-center font-mono text-[10px] uppercase tracking-[.18em] text-dmg-text-3"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
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
              className={`flex min-h-[88px] cursor-pointer flex-col items-start gap-0.5 overflow-hidden rounded-xl border p-2 text-left transition-colors ${
                day.today
                  ? "border-dmg-red-solid/60 bg-dmg-red-solid/10 shadow-[0_0_38px_rgba(192,24,26,.18)]"
                  : "border-white/8 bg-white/[.02] hover:border-dmg-red-solid/50 hover:bg-dmg-red-solid/[.06]"
              } ${day.outro ? "opacity-32" : ""}`}
            >
              <span
                className={`font-mono text-[11px] ${day.today ? "font-bold text-dmg-red" : "text-white/55"}`}
              >
                {day.num}
              </span>
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
                  className="w-full cursor-grab truncate rounded-[7px] border-l-2 border-dmg-red-solid bg-dmg-red-solid/[.16] px-1.5 py-0.5 text-[10px] text-[#f3caca] hover:bg-dmg-red-solid/[.28]"
                  title={ev.titulo}
                >
                  {ev.hora ? ev.hora + " · " : ""}
                  {ev.titulo}
                </span>
              ))}
              {day.evs.length > 2 && (
                <span className="text-[10px] text-white/38">+{day.evs.length - 2}</span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3.5 font-mono text-[10px] uppercase tracking-[.18em] text-white/35">
          // clique num dia vazio para criar, num evento para ver detalhes — arraste um evento para
          mudar de dia
        </p>
      </ClassicPanel>

      <ClassicPanel title="Próximos eventos" sub="agenda da equipe">
        {proximos.length === 0 ? (
          <ClassicEmpty>Nenhum evento futuro.</ClassicEmpty>
        ) : (
          <div className="space-y-3.5">
            {proximos.map((ev) => (
              <ProximoEventoItemClassic key={ev.id} ev={ev} />
            ))}
          </div>
        )}
      </ClassicPanel>
    </div>
  );
}

function ProximoEventoItemClassic({ ev }: { ev: Evento }) {
  const { open } = useModal();
  return (
    <button
      onClick={() => open(ev.titulo, (close) => <EventoDetalheModal evento={ev} onClose={close} />)}
      className="w-full text-left"
    >
      <ClassicActivityItem
        icon={<CalendarDays className="h-3.5 w-3.5" />}
        time={`${EV_TIPOS[ev.tipo || "outro"] || "Evento"} · ${new Date(
          ev.data + "T12:00",
        ).toLocaleDateString("pt-BR", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })}${ev.hora ? ` · ${ev.hora}` : ""}`}
      >
        <p className="text-[13.5px] font-semibold text-dmg-text">{ev.titulo}</p>
      </ClassicActivityItem>
    </button>
  );
}
