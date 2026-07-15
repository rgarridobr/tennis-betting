# TennisPool

Plataforma web de **bolão de tênis**: palpites em chaveamentos, rankings, grupos/pools e painel administrativo completo.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/victoorres-projects/tennis-betting-platform)
[![Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-informational?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![i18n](https://img.shields.io/badge/i18n-PT%20%2F%20EN-blue?style=for-the-badge)](#internacionalização-pt--en)

## Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Principais recursos](#principais-recursos)
- [Stack](#stack)
- [Internacionalização (PT / EN)](#internacionalização-pt--en)
- [Pré-requisitos](#pré-requisitos)
- [Configuração local](#configuração-local)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [Estrutura](#estrutura)
- [Fluxo dos torneios](#fluxo-dos-torneios)
- [Banco de dados](#banco-de-dados)
- [Deploy (Vercel)](#deploy-vercel)
- [Git e segurança](#git-e-segurança)
- [Solução de problemas](#solução-de-problemas)

## Sobre o projeto

O **TennisPool** permite que participantes se cadastrem, entrem em torneios, façam palpites no chaveamento e acompanhem rankings. Administradores controlam torneios, chaves, resultados, usuários, clubes e grupos.

### Experiências

| Área | O que faz |
| --- | --- |
| **Participante** | Dashboard, torneios, palpites, grupos/pools, ranking geral e por torneio, perfil |
| **Administrador** | Torneios, chaveamento, sync ATP, resultados, usuários, clubes, grupos |

## Principais recursos

- Cadastro, login e sessão via cookie `session_token`
- Recuperação de senha por código (SMTP), e-mail em **PT ou EN** conforme o idioma do usuário
- Torneios com status administrativo e chaveamento por rodadas
- Inscrição e palpites com pontuação automática
- Rankings global, por torneio e por estado
- Grupos/pools (gerais, privados, com senha)
- Painel admin (torneios, usuários, clubes, grupos, sync ATP)
- Interface responsiva (Next.js, React, Radix UI, Tailwind)
- **Interface bilingue:** Português e English (~938 textos de UI)

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript, Tailwind CSS, Radix UI |
| i18n | `next-intl` (locales `pt`, `en`) |
| Banco | PostgreSQL — Neon em produção; Docker local em dev |
| DB client | `@neondatabase/serverless` (remoto) + `pg` (localhost) |
| Auth / e-mail | bcryptjs, Nodemailer |
| Utilitários | date-fns, lucide-react, zod |

## Internacionalização (PT / EN)

- **Locale padrão:** Português (`pt`) — URLs limpas (`/torneios`, `/login`)
- **Inglês:** prefixo `/en` (`/en/torneios`, `/en/login`)
- **Troca de idioma:** seletor (globo) no header da home, login, cadastro, dashboard e admin
- **Arquivos:** `messages/pt.json` e `messages/en.json`
- **Inventário de textos** (para cliente/documentação):
  - `docs/inventario-textos-i18n.md`
  - `docs/inventario-textos-i18n.csv`

Regenerar o inventário:

```bash
node scripts/generate-text-inventory.mjs
node scripts/generate-text-csv.mjs
```

## Pré-requisitos

- Node.js **18+** (recomendado 20+)
- npm
- Git
- PostgreSQL:
  - **Produção:** Neon (ou outro Postgres com connection string)
  - **Local (opcional):** Docker Desktop
- SMTP (opcional em dev; necessário em produção para “esqueci a senha”)

```bash
node --version
npm --version
git --version
```

## Configuração local

### 1. Clone e dependências

```bash
git clone https://github.com/iamvictormt/tennis-betting.git
cd tennis-betting
npm install
```

### 2. Variáveis de ambiente

Copie o exemplo e preencha:

```bash
cp .env.example .env.local
```

### 3. Banco de dados

#### Opção A — Neon (mesmo tipo da produção)

1. Crie um projeto em [neon.tech](https://neon.tech)
2. Copie a connection string
3. Cole em `.env.local` como `NEON_CONNECTION_STRING`
4. Aplique o schema (scripts em `scripts/` ou SQL do Neon console)

#### Opção B — Postgres local com Docker (recomendado para dev)

Com Docker Desktop rodando:

```powershell
# Windows — sobe container, grava .env.local e aplica schema
.\scripts\post-reboot-docker-db.ps1
```

Ou manualmente:

```bash
docker run -d --name tennispool-db \
  -e POSTGRES_USER=tennis \
  -e POSTGRES_PASSWORD=tennis \
  -e POSTGRES_DB=tennispool \
  -p 5435:5432 \
  --restart unless-stopped \
  postgres:16-alpine
```

```env
NEON_CONNECTION_STRING=postgresql://tennis:tennis@localhost:5435/tennispool
```

Schema local completo:

```bash
# PowerShell
Get-Content scripts\init-local-schema.sql -Raw | docker exec -i tennispool-db psql -U tennis -d tennispool
```

> A porta **5435** evita conflito com outros Postgres na máquina (5432/5433/5434).

### 4. Rodar o app

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000)  
Inglês: [http://localhost:3000/en](http://localhost:3000/en)

## Variáveis de ambiente

| Variável | Obrigatória | Uso |
| --- | --- | --- |
| `NEON_CONNECTION_STRING` | **Sim** | Connection string PostgreSQL (Neon ou local). O nome da variável é histórico; funciona com qualquer Postgres. |
| `SMTP_HOST` | Produção* | Host SMTP |
| `SMTP_PORT` | Produção* | `587` (STARTTLS) ou `465` (SSL) |
| `SMTP_SECURE` | Produção* | `true` na porta 465; `false` na 587 |
| `SMTP_USER` | Produção* | Usuário SMTP |
| `SMTP_PASS` | Produção* | Senha ou app password |

\*Obrigatório se for usar recuperação de senha.

### Exemplos

**Neon (produção / staging):**

```env
NEON_CONNECTION_STRING=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

**Docker local:**

```env
NEON_CONNECTION_STRING=postgresql://tennis:tennis@localhost:5435/tennispool
```

**Gmail (app password):**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-app-password
```

> Nunca commite `.env.local`. O repositório ignora `.env*` e permite apenas `.env.example`.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint |
| `npm run sync-atp` | Sincroniza calendário ATP (admin/ops) |

Scripts úteis em `scripts/`:

| Arquivo | Uso |
| --- | --- |
| `post-reboot-docker-db.ps1` | Sobe Postgres Docker + `.env.local` + schema |
| `init-local-schema.sql` | Schema completo para dev local |
| `setup-database.sql` / migrações | Evolução de schema |
| `generate-text-inventory.mjs` | Gera inventário de textos i18n (MD) |
| `generate-text-csv.mjs` | Gera inventário i18n (CSV) |

## Estrutura

```text
tennis-betting-main/
├── app/
│   ├── [locale]/           # Rotas por idioma (pt / en)
│   │   ├── admin/          # Painel administrativo
│   │   ├── cadastro/
│   │   ├── dashboard/
│   │   ├── grupos/
│   │   ├── login/
│   │   ├── perfil/
│   │   ├── ranking/
│   │   ├── regras/
│   │   ├── torneios/
│   │   └── page.tsx        # Landing
│   └── api/                # APIs (países, estados, inscrição…)
├── components/
│   ├── admin/
│   ├── auth/
│   ├── dashboard/
│   ├── pools/
│   ├── profile/
│   ├── shared/             # Language switcher, seletores, etc.
│   ├── tournament/
│   └── ui/
├── docs/                   # Inventário de textos i18n
├── i18n/                   # Routing e navigation next-intl
├── lib/
│   ├── actions/            # Server actions
│   ├── services/
│   ├── admin.ts
│   ├── auth.ts
│   ├── data.ts
│   ├── db.ts               # Neon (remoto) ou pg (localhost)
│   └── email.ts            # SMTP bilíngue
├── messages/
│   ├── pt.json             # Textos em português
│   └── en.json             # Textos em inglês
├── public/
├── scripts/                # SQL, Docker, inventário i18n
├── .env.example
├── .gitignore
├── middleware.ts           # next-intl middleware
└── package.json
```

## Fluxo dos torneios

| Status | Significado (UI) |
| --- | --- |
| `STANDBY` | Só no admin; ainda não exibido aos participantes |
| `UPCOMING` | Visível / “O que vem por aí” — preparando chave |
| `OPEN` | Aberto para inscrições e palpites |
| `LOCKED` | Palpites fechados |
| `IN_PROGRESS` | Em andamento |
| `FINISHED` | Finalizado (campeão / vice) |

No admin é possível: preparar/publicar chave, sync ATP, definir jogadores, lançar resultados, finalizar e auditar quem palpitou.

## Banco de dados

### Produção

Neon PostgreSQL (ou outro host) via `NEON_CONNECTION_STRING`, usando o driver serverless.

### Desenvolvimento local

Postgres em Docker; o cliente em `lib/db.ts` detecta `localhost` e usa o pacote `pg`.

### Tabelas centrais

| Tabela | Função |
| --- | --- |
| `users` | Contas, perfil, clube, localização, admin |
| `sessions` | Sessões por token |
| `tournaments` | Torneios e status |
| `bracket_matches` | Partidas do chaveamento |
| `predictions` | Palpites |
| `user_tournaments` | Inscrições |
| `pools` / `pool_members` | Grupos |
| `players` | Jogadores da chave |
| `tennis_clubs` | Clubes |

Scripts SQL e migrações: pasta `scripts/`. Em produção, revise o script antes de executar.

## Deploy (Vercel)

1. Repositório no GitHub (clone **só** deste projeto, com `.git` na pasta do app).
2. Projeto na Vercel apontando para o repo.
3. Environment Variables (Production / Preview):

   - `NEON_CONNECTION_STRING` — **obrigatória** (banco do cliente)
   - `SMTP_*` — se usar recuperação de senha

4. Deploy.

### Sem acesso ao banco do cliente

O site na Vercel **não funciona de ponta a ponta** sem Postgres configurado. Peça ao cliente:

1. Convite no projeto Vercel **ou** a connection string do banco  
2. Preferencialmente convite no **Neon** (ou host usado)  
3. Ou autorização para **criar um Neon na conta dele** e colar a string no Vercel  

Desenvolvimento local (Docker) **não substitui** o banco de produção.

## Git e segurança

- Use o `.gitignore` da raiz: ignora `node_modules`, `.next`, `.env*`, `.vercel`, logs, coverage, etc.
- **Permite** commitar `.env.example` (sem segredos).
- **Não** commite `.env.local` nem connection strings reais.
- Inicialize o Git **dentro** desta pasta do projeto (não na raiz do disco/usuário):

```bash
cd tennis-betting-main
git init
git add .
git status   # não deve listar .env.local, node_modules, .next
```

## Solução de problemas

### `NEON_CONNECTION_STRING environment variable is not set`

Crie `.env.local` a partir de `.env.example` e preencha a connection string.

### `Error connecting to database` / `ENOTFOUND host`

A string ainda é placeholder (`user:password@host/...`). Use a string real do Neon ou o Docker local.

### Build error em `lib/actions/admin.ts` ou `lib/admin.ts`

Garanta que `import { getTranslations }` e `const t = await getTranslations(...)` estão em linhas válidas (não no meio de tipos ou de outro `import`).

### Porta 3000 em uso

```bash
npm run dev -- --port 3001
```

### E-mail de recuperação não chega

- Variáveis `SMTP_*` preenchidas  
- `SMTP_SECURE` coerente com a porta  
- Gmail: use **app password**, não a senha normal da conta  
- O e-mail é enviado no idioma da sessão (`pt` / `en`)

### Textos não mudam de idioma

- Confirme o seletor (globo) e a URL (`/en/...`)  
- Hard refresh se o dev server estiver com cache antigo  
- Mensagens: `messages/pt.json` e `messages/en.json`

### Docker: porta 5432 ocupada

O script local usa **5435**. Não use 5432 se já houver outro Postgres no host.

### ESLint não encontrado

```bash
npm install
```

---

**Última atualização:** julho de 2026
