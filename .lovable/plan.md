
# Refatoração DMG — React + Tailwind

## Escopo analisado

Projeto atual (upload): HTML/CSS/JS puro + Firebase (Auth + Firestore).

- `index.html` → landing (nav, hero, marca DMG, membros D/M/G, serviços, CTA, footer).
- `dashboard.html` + `css/dashboard.css` → painel "novo" (visual do Daniel/Guilherme).
- `dashboard-classic.html` + `css/dashboard-classic.css` → painel "clássico" (visual do Miguel — hero-cmd, métricas, mini-bars 12 meses, uso de infra, equipe).
- `js/app.js` (1151 linhas) → toda lógica compartilhada: navegação por hash entre views, modal genérico, dashboard, projetos + detalhes, clientes, equipe, financeiro, calendário mensal com CRUD de eventos, atividades, analytics mock, config, gráfico SVG (curva Catmull-Rom com tooltip), mini-bars.
- `js/auth.js` → login email/senha, redirect por UID para o painel certo (Miguel → clássico, demais → novo), avatar do usuário.
- `js/store.js` → wrapper do Firestore com cache em memória + `onSnapshot` em tempo real (mesma API `Store.get/add/update/remove/log`).
- `js/firebase-init.js` → config Firebase.
- `js/main.js` → interação dos cards D/M/G da landing.

Toda a **lógica de negócio** vive em `app.js`/`store.js`/`auth.js`. Os dois dashboards **compartilham 100% do JS**; só divergem no HTML/CSS.

## Estratégia geral

Manter Firebase (Auth + Firestore) — não migrar para Lovable Cloud. É o backend real do time, com regras `firestore.rules` já existentes e um sub-serviço `sync-picpay`. Trocar backend introduziria risco desnecessário e violaria "nenhuma funcionalidade pode ser removida".

Portar todo o comportamento para React sobre a stack atual (TanStack Start + Tailwind v4). O motor de views por hash vira roteamento por rotas TanStack. O `Store` global vira um contexto React alimentado por `onSnapshot`. O modal vira `<Dialog>` (shadcn). O gráfico SVG é reescrito como componente React puro, preservando a curva Catmull-Rom e o tooltip.

## Arquitetura de pastas

```text
src/
  routes/
    __root.tsx                 (shell + <QueryClientProvider>)
    index.tsx                  (landing pública)
    _auth.tsx                  (layout gate — exige login, escolhe layout por UID)
    _auth.dashboard.tsx        (visão geral)
    _auth.projetos.tsx
    _auth.projetos.$id.tsx     (detalhes de projeto)
    _auth.clientes.tsx
    _auth.equipe.tsx
    _auth.financeiro.tsx
    _auth.calendario.tsx
    _auth.atividades.tsx
    _auth.infraestrutura.tsx
    _auth.seguranca.tsx
    _auth.analytics.tsx
    _auth.config.tsx
  features/
    landing/
      Navbar.tsx, Hero.tsx, Strip.tsx, BrandGrid.tsx,
      MembersShowcase.tsx, Services.tsx, CtaBanner.tsx, Footer.tsx
    dashboard/
      layouts/
        ModernLayout.tsx       (visual "novo" — sidebar compacta, topbar simples)
        ClassicLayout.tsx      (visual "clássico" — sidebar cheia, hero-cmd, busca)
        useDashboardLayout.ts  (decide qual layout renderizar via UID)
      views/
        DashboardOverviewModern.tsx
        DashboardOverviewClassic.tsx
        ProjetosView.tsx, ProjetoDetalheView.tsx, ClientesView.tsx,
        EquipeView.tsx, FinanceiroView.tsx, CalendarioView.tsx,
        AtividadesView.tsx, AnalyticsView.tsx, ConfigView.tsx,
        InfraView.tsx, SegurancaView.tsx
      components/
        Panel.tsx, Kpi.tsx, StatusBadge.tsx, ProgressBar.tsx,
        RevenueChart.tsx, MiniBars.tsx, UsageBar.tsx,
        ActivityItem.tsx, ProjectRow.tsx, EventItem.tsx,
        CalendarGrid.tsx, ChartTooltip.tsx
      modals/
        NovoProjetoModal.tsx, NovoClienteModal.tsx,
        NovoLancamentoModal.tsx, NovoEventoModal.tsx,
        EditProjetoModal.tsx, ...  (todos via <Dialog> compartilhado)
    auth/
      LoginScreen.tsx, AuthProvider.tsx, useAuth.ts
  lib/
    firebase.ts                (initializeApp / getAuth / getFirestore)
    store/
      StoreProvider.tsx        (contexto React que substitui Store global)
      useCollection.ts         (hook: useCollection("projetos"))
      relations.ts             (clienteDoProjeto, projetosDoCliente, lancamentosDoProjeto)
      types.ts                 (Projeto, Cliente, Receita, Evento, Atividade)
      constants.ts             (STATUS, EV_TIPOS)
    format.ts                  (BRL, tempoRelativo, isoDay, mesKey, fmtDia, fmtK)
    userProfile.ts             (nomeDoUsuario, iniciaisDoUsuario, PAINEL_POR_UID)
  components/ui/               (shadcn: dialog, button, input, badge, etc.)
  styles.css                   (tokens do design system em CSS vars + Tailwind v4)
```

## Como o Firebase entra na stack

- `src/lib/firebase.ts` faz `initializeApp` com a mesma config atual.
- `AuthProvider` usa `onAuthStateChanged` e expõe `user`, `signIn`, `signOut`.
- Rota `/_auth` é um layout: se `user == null` renderiza `<LoginScreen>`; se tem user, renderiza `<Outlet />` dentro do layout escolhido (`ModernLayout` ou `ClassicLayout`) conforme `PAINEL_POR_UID`.
- `StoreProvider` monta 5 listeners `onSnapshot` (projetos, clientes, receitas, eventos, atividades) e joga em `useState` — todo componente lê via `useCollection("projetos")`. `add/update/remove/log` viram funções assíncronas expostas pelo mesmo contexto.
- SSR: as rotas `_auth.*` marcam `ssr: false` (o Firebase Web SDK só roda no cliente); a landing `/` fica SSR normal.

## Preservação dos dois layouts

- **Ambos** consomem as MESMAS views (componentes de página) via composition. O que muda é o shell (sidebar, topbar, hero, tipografia, cor de acento, tokens).
- Cada layout define seus próprios tokens CSS (`--dmg-bg`, `--dmg-red`, radius, tipografia — Archivo no novo, Geist/Geist Mono no clássico) num escopo de classe (`.layout-modern` / `.layout-classic`) para não vazar entre si.
- A view "Visão Geral" tem markup bem diferente entre os dois (o clássico tem hero-cmd + mini-bars 12 meses + uso de infra + equipe status), então existem duas versões: `DashboardOverviewModern` e `DashboardOverviewClassic`. Ambas usam os mesmos hooks/dados.
- Todas as outras views (Projetos, Clientes, Financeiro, Calendário, etc.) têm markup essencialmente igual entre os dois — usam UMA única implementação, mas com estilos escopados pelo layout parente.

## Landing — melhorias de UI/UX

Manter estrutura (nav, hero, marca, membros, serviços, CTA, footer) e a identidade visual (preto/vermelho, Archivo, cursor piscante). Adicionar, com moderação:

- Nav com blur reativo ao scroll e underline animado nos links.
- Hero: efeito parallax sutil no "DMG" gigante em outline; typewriter na palavra "tecnológica"; entrada em stagger.
- Marca D/M/G: cards com gradiente animado na borda no hover (conic-gradient), micro-tilt.
- Membros D/M/G: preservar interação clique-para-expandir; adicionar transições `layout` (Framer Motion) e leve glassmorphism no painel de info.
- Serviços: grid bento assimétrica em desktop (2 cards grandes + 4 pequenos), hover com mask reveal.
- Faixa "strip": animação de marquee em loop lento (a atual é estática).
- Scroll reveal com `IntersectionObserver` em todas as seções.
- CTA: banner com border animada (gradiente conic girando lentamente).
- Cada seção com um "recurso técnico" diferente para servir de catálogo (gradient, conic-border, bento, marquee, tilt, parallax, glass).

Sem exagero: durações curtas, `prefers-reduced-motion` respeitado, sem lib pesada além de `framer-motion`.

## Design tokens (Tailwind v4)

Tokens em `src/styles.css` sob `@theme inline` mapeando para CSS vars:
`--color-bg`, `--color-surface`, `--color-surface-2`, `--color-border`, `--color-border-strong`, `--color-text`, `--color-text-2`, `--color-text-3`, `--color-red`, `--color-red-solid`, `--color-red-hover`, `--color-red-dark`, `--color-ok`, `--color-warn`.

Fontes carregadas via `<link>` em `__root.tsx` (Archivo para landing/layout novo; Geist + Geist Mono para o clássico).

## Dependências a instalar

`firebase`, `framer-motion`. Componentes shadcn: `dialog`, `button`, `input`, `select`, `label`, `badge`, `tabs`, `dropdown-menu`, `avatar`, `separator`, `scroll-area`.

## Entregas por fase

1. **Fundação:** deps, styles.css com tokens, `firebase.ts`, `AuthProvider`, `StoreProvider`, `useCollection`, tipos, helpers de formatação, `LoginScreen`.
2. **Landing:** reescrita completa em componentes com melhorias de UI listadas.
3. **Shell dos painéis:** `_auth` gate, `ModernLayout`, `ClassicLayout`, `useDashboardLayout` (roteamento por UID), rotas TanStack.
4. **Views compartilhadas:** Projetos + detalhes, Clientes, Financeiro, Calendário, Atividades, Equipe, Config, Infra/Segurança (placeholders), Analytics (mock igual ao atual).
5. **Overviews específicas:** `DashboardOverviewModern` + `DashboardOverviewClassic`, `RevenueChart` (curva Catmull-Rom + tooltip preservados).
6. **Modais:** todos os fluxos de CRUD via `<Dialog>` compartilhado.
7. **Ajustes finais:** SEO em cada rota, responsividade (breakpoints atuais do CSS servem de referência), verificação visual.

## Notas técnicas

- Rotas `_auth.*` desativam SSR (Firebase é client-only). A landing `/` fica SSR normal para SEO.
- A config do Firebase é pública (é o padrão do Web SDK) — vai direto no bundle como está hoje.
- Regras `firestore.rules` não mudam; a API do Firestore chamada é a mesma.
- Nada de "unificar" os dois dashboards: cada layout é um componente independente com sua própria linguagem visual.
- Comportamento de redirect por UID (hoje via `localStorage["dmg-painel"] + location.replace`) vira uma escolha de layout dentro do `_auth` — mesmo efeito, sem reload.

Ao final, o app parece uma aplicação React moderna feita do zero, com todos os fluxos e comportamentos preservados.
