# PicPay Workflow Setup Guide

Este documento descreve como configurar o workflow PicPay, variáveis de ambiente Firebase e secrets do GitHub.

## 📋 Overview

O workflow automático (`picpay-sync.yml`) faz 3 coisas:
1. **Build**: Compila e testa a aplicação
2. **PicPay Sync**: Sincroniza dados PicPay com Firebase
3. **Deploy**: Envia para produção

## 🔧 Setup Local

### 1. Crie `.env.local` na raiz do projeto

```bash
cp .env.example .env.local
```

### 2. Configure as variáveis Firebase locais

Abra `.env.local` e preencha com seus dados:

```env
# Firebase Configuration
# Pegue esses valores em: https://console.firebase.google.com
# 1. Acesse seu projeto Firebase
# 2. Clique em "Configurações do projeto" (⚙️)
# 3. Abra a aba "Seus apps"
# 4. Clique no app web para ver a config

VITE_FIREBASE_API_KEY=AIzaSyCYPZBy_sVo6ZI-RdMZ4wXZ6P7WZx98RNQ
VITE_FIREBASE_AUTH_DOMAIN=dmgdev-group.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dmgdev-group
VITE_FIREBASE_STORAGE_BUCKET=dmgdev-group.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=705819967455
VITE_FIREBASE_APP_ID=1:705819967455:web:f3a40d0053ae7ac5b3ce6a

# Pluggy ID (já configurado?)
VITE_PLUGGY_ID=seu_pluggy_client_id
```

### 3. Teste localmente

```bash
# Instale dependências
bun install

# Rode o dev server
bun dev

# Em outro terminal, compile
bun build
```

**Nota:** Variáveis prefixadas com `VITE_` são públicas no bundle (isso é normal — Firebase Web SDK sempre expõe a config).

---

## 🔐 Setup GitHub Secrets

O workflow precisa de secrets configurados no GitHub. Essas variáveis **não** vão para o `.env` local (usam prefixo diferente).

### Passo a passo:

1. **Acesse o repositório no GitHub**
2. **Vá em Settings → Secrets and variables → Actions**
3. **Clique em "New repository secret"** e adicione cada um:

| Secret Name | Onde pegar | Tipo |
|---|---|---|
| `FIREBASE_API_KEY` | Console Firebase | Público (VITE_) |
| `FIREBASE_AUTH_DOMAIN` | Console Firebase | Público |
| `FIREBASE_PROJECT_ID` | Console Firebase | Público |
| `FIREBASE_STORAGE_BUCKET` | Console Firebase | Público |
| `FIREBASE_MESSAGING_SENDER_ID` | Console Firebase | Público |
| `FIREBASE_APP_ID` | Console Firebase | Público |
| `FIREBASE_PRIVATE_KEY` | Service Account JSON | **PRIVADO** ⚠️ |
| `FIREBASE_CLIENT_EMAIL` | Service Account JSON | **PRIVADO** ⚠️ |
| `PLUGGY_ID` | Dashboard Pluggy | Público |
| `PLUGGY_SECRET` | Dashboard Pluggy | **PRIVADO** ⚠️ |
| `PICPAY_API_KEY` | Dashboard PicPay | **PRIVADO** ⚠️ |

### ⚠️ Diferença: Local vs GitHub

| Variável | Local | GitHub |
|---|---|---|
| Firebase (público) | `VITE_FIREBASE_*` em `.env.local` | `FIREBASE_*` em Secrets |
| Firebase (privado) | Não usamos localmente | `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` em Secrets |
| Pluggy/PicPay | `VITE_*` em `.env.local` | `*` em Secrets (sem prefixo) |

**Por quê?** No GitHub Actions, toda variável em `env:` é um segredo em potencial, então não usamos `VITE_` lá.

---

## 📝 Como preencher cada secret

### Firebase (público)

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Abra seu projeto `dmgdev-group`
3. Clique em ⚙️ > "Configurações do projeto"
4. Aba "Seus apps" → clique no app web
5. Copie cada campo:
   - `apiKey` → `FIREBASE_API_KEY`
   - `authDomain` → `FIREBASE_AUTH_DOMAIN`
   - `projectId` → `FIREBASE_PROJECT_ID`
   - `storageBucket` → `FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `FIREBASE_APP_ID`

### Firebase (privado - para sync-picpay backend)

1. Em Firebase Console, vá em "Contas de serviço"
2. Clique em "Gerar nova chave privada"
3. Será baixado um JSON. Abra e copie:
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

**IMPORTANTE:** Esse arquivo é super sensível. Não commite para GitHub, não compartilhe.

### Pluggy

1. Acesse [Pluggy Dashboard](https://dashboard.pluggy.ai)
2. Em "Aplicações", copie:
   - Client ID → `PLUGGY_ID`
   - Client Secret → `PLUGGY_SECRET`

### PicPay

1. Acesse seu painel PicPay (fornecido pelo seu gerente)
2. Em "Integração" ou "API", copie:
   - API Key → `PICPAY_API_KEY`

---

## 🚀 Teste o Workflow

1. **Faça um commit e push** para `main`
2. **GitHub Actions** inicia automaticamente
3. Vá em **Actions** no repositório para ver o progresso
4. Cada job (build, sync, deploy) aparece com status ✅ ou ❌

Se falhar:
- Clique no job para ver logs
- Procure por mensagens de erro (ex: "secret not found")
- Confirme que os secrets estão configurados corretamente

---

## 📜 Variáveis no Workflow

O arquivo `picpay-sync.yml` mapeia secrets → env vars assim:

```yaml
env:
  VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
  # ... rest of firebase
  PICPAY_API_KEY: ${{ secrets.PICPAY_API_KEY }}
```

Isso torna os secrets disponíveis como `process.env.VITE_FIREBASE_API_KEY` no build, sem exposição de dados.

---

## 🔄 Fluxo de Execução

```
[PUSH para main/develop]
    ↓
[Build & Test]
    ├─ Checkout
    ├─ Setup Node + Bun
    ├─ bun install
    ├─ bun lint
    └─ bun build (com Firebase/Pluggy secrets)
    ↓
[PicPay Sync] (só em main)
    ├─ Trigger sincronização de dados
    └─ Confirma configuração
    ↓
[Deploy] (só em main)
    └─ Deploy para produção
```

---

## 🐛 Troubleshooting

### "VITE_ variables not found in build"
- Confirme que `secrets.FIREBASE_API_KEY` está em Secrets (GitHub)
- Confirme que está mapeado em `env:` no workflow

### "Firebase private key is invalid"
- Copie o JSON inteiro da Service Account, não apenas o campo
- Cuidado com quebras de linha — GitHub pode converter `\n` literalmente

### "PicPay API Key rejected"
- Confirme que é a chave correta (pode ter múltiplas)
- Teste em um cliente REST (ex: Postman) antes de adicionar ao GitHub

---

## ✅ Checklist Final

- [ ] `.env.local` criado com variáveis Firebase
- [ ] `.env.example` atualizado e commitado
- [ ] GitHub Secrets configurados (9 secrets)
- [ ] Workflow `picpay-sync.yml` no `.github/workflows/`
- [ ] Teste localmente com `bun dev` + `bun build`
- [ ] Teste o GitHub workflow com um push para `main`
- [ ] Logs do Actions confirmam build e sync

---

## 📚 Referências

- [Firebase Console](https://console.firebase.google.com)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Pluggy API Docs](https://pluggy.ai/docs)
