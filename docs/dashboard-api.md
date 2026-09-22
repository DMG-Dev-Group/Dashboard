# Dashboard API — v1

Esta API é a fronteira de servidor do Dashboard para integrações como Kevin. Ela não expõe acesso direto ao Firestore e só aceita chamadas autenticadas de serviço para serviço.

## Configuração

Configure os segredos do ambiente de execução a partir de `.env.example`:

- `DASHBOARD_API_KEY`: segredo compartilhado com Kevin. Nunca use prefixo `VITE_` e nunca envie esse valor ao navegador.
- `FIREBASE_SERVICE_ACCOUNT_JSON`: conta de serviço do Firebase em uma única variável; alternativamente, defina os três campos `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY`.
- `DASHBOARD_API_ALLOWED_ORIGIN`: opcional. Só é necessário se um cliente web autorizado chamar a API de outro domínio.

A conta de serviço precisa de permissão de leitura e gravação no Firestore do projeto do Dashboard. Os segredos devem ser configurados no ambiente de hospedagem, não commitados.

## Autenticação

Todas as rotas, exceto a de saúde, exigem:

```http
Authorization: Bearer <DASHBOARD_API_KEY>
```

Erros seguem este formato:

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Credencial de serviço inválida ou ausente.",
    "requestId": "..."
  }
}
```

## Rotas

| Método | Rota                                     | Finalidade                                                                      |
| ------ | ---------------------------------------- | ------------------------------------------------------------------------------- |
| `GET`  | `/api/v1/health`                         | Verifica se a API recebeu as variáveis obrigatórias.                            |
| `GET`  | `/api/v1/projects?q=`                    | Lista projetos; `q` filtra por nome, apelido ou frente.                         |
| `GET`  | `/api/v1/projects/resolve?q=`            | Resolve uma referência de conversa para projetos canônicos.                     |
| `GET`  | `/api/v1/projects/:id`                   | Obtém os detalhes de um projeto, incluindo descrição, notas, tarefas e frentes. |
| `GET`  | `/api/v1/projects/:id/records`           | Lista registros criados para o projeto.                                         |
| `POST` | `/api/v1/projects/:id/records`           | Cria um registro rastreável de Kevin.                                           |
| `GET`  | `/api/v1/calendar/today?date=YYYY-MM-DD` | Lista reuniões e entregas do dia informado.                                     |

## Registro de informação do Kevin

Kevin deve persistir conhecimento de projeto por meio de `POST /api/v1/projects/:id/records`. A API cria o registro em `registrosProjeto` e também uma atividade de auditoria em `atividades`.

```json
{
  "type": "requirement",
  "content": "Adicionar uma seção de avaliações do produto.",
  "workstream": "Catálogo",
  "attachments": [
    {
      "url": "https://storage.exemplo.com/amira/logo.png",
      "name": "logo-amira.png",
      "mimeType": "image/png"
    }
  ],
  "source": {
    "mode": "explicit_request",
    "requestedBy": "whatsapp:5511999999999",
    "requestId": "whatsapp:ABC123"
  }
}
```

Valores aceitos para `type`: `summary`, `decision`, `task`, `requirement`, `question`, `note` e `attachment`.

Use o ID imutável da mensagem ou da proposta de Kevin em `source.requestId`, inclusive em pedidos explícitos. Repetir a mesma requisição retorna o registro original; reutilizar o ID para outro conteúdo retorna `409`. Para uma proposta que Kevin detectou sozinho e foi aprovada no WhatsApp, use `source.mode: "approved_proposal"`.

## Convenções de dados

- O documento `projetos` continua sendo a fonte canônica de cada projeto.
- Os campos opcionais `aliases` e `frentes` podem ser listas de texto no projeto. Eles permitem que referências como “Amira” e “Sistema Interno Amira” resolvam para o mesmo projeto.
- Registros de Kevin guardam `source.system: "kevin"`, modo de origem, solicitante, data e anexos. Essa marca é a base para a sinalização visual posterior no Dashboard.
- A API recebe somente URLs HTTPS de anexos. O armazenamento e a leitura de arquivos brutos ficam fora do contrato desta primeira versão.
