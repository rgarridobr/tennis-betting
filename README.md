# Tennis Betting Platform

Plataforma web para palpites em torneios de tenis, rankings de participantes, grupos/pools e administracao completa de torneios.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/victoorres-projects/tennis-betting-platform)
[![Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Database](https://img.shields.io/badge/Database-Neon%20(PostgreSQL)-informational?style=for-the-badge&logo=postgresql)](https://neon.tech)

## Indice

- [Sobre o projeto](#sobre-o-projeto)
- [Principais recursos](#principais-recursos)
- [Stack](#stack)
- [Pre-requisitos](#pre-requisitos)
- [Configuracao local](#configuracao-local)
- [Variaveis de ambiente](#variaveis-de-ambiente)
- [Scripts](#scripts)
- [Estrutura](#estrutura)
- [Fluxo de torneios](#fluxo-de-torneios)
- [Banco de dados](#banco-de-dados)
- [Deploy](#deploy)
- [Troubleshooting](#troubleshooting)

## Sobre o projeto

O Tennis Betting Platform permite que usuarios se cadastrem, entrem em torneios, preencham palpites por chaveamento e acompanhem rankings. O projeto tambem inclui um painel administrativo para controlar torneios, chaveamentos, usuarios, clubes, grupos e resultados.

O produto tem duas experiencias principais:

- Area do participante: dashboard, torneios, palpites, grupos/pools, ranking geral e ranking por torneio.
- Area administrativa: criacao e manutencao de torneios, sincronizacao ATP, publicacao de chaveamento, lancamento de resultados, controle de usuarios, clubes e grupos.

## Principais recursos

- Cadastro, login e sessao propria via cookie `session_token`.
- Recuperacao de senha por codigo enviado via SMTP.
- Torneios com status administrativo e chaveamento por rodadas.
- Inscricao de usuarios em torneios.
- Palpites por partida e pontuacao automatica por resultado.
- Rankings globais, por torneio e por estado.
- Grupos/pools gerais, privados e estaduais.
- Painel admin para torneios, usuarios, clubes e grupos.
- Sincronizacao de calendario/chaveamento ATP.
- Auditoria de inscritos no admin, incluindo quem palpitou e quem ainda nao palpitou.
- UI responsiva com Next.js, React, Radix UI e Tailwind CSS.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS
- Radix UI
- Neon PostgreSQL
- `@neondatabase/serverless`
- Nodemailer
- bcryptjs
- date-fns
- lucide-react

## Pre-requisitos

- Node.js 18 ou superior
- npm
- Git
- Banco PostgreSQL no Neon
- Servidor SMTP para envio de emails de recuperacao de senha

Verifique as versoes:

```bash
node --version
npm --version
git --version
```

## Configuracao local

Clone o repositorio:

```bash
git clone https://github.com/iamvictormt/tennis-betting.git
cd tennis-betting
```

Instale as dependencias:

```bash
npm install
```

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEON_CONNECTION_STRING=postgresql://user:password@host/database?sslmode=require

SMTP_HOST=smtp.seu-provedor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@exemplo.com
SMTP_PASS=sua-senha-ou-app-password
```

Inicie o servidor local:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Variaveis de ambiente

Estas sao as variaveis usadas pelo projeto:

| Variavel | Obrigatoria | Uso |
| --- | --- | --- |
| `NEON_CONNECTION_STRING` | Sim | Conexao com o banco Neon PostgreSQL. |
| `SMTP_HOST` | Sim | Host SMTP para envio de emails. |
| `SMTP_PORT` | Sim | Porta SMTP. Use `587` para STARTTLS ou `465` para SSL. |
| `SMTP_SECURE` | Sim | `true` para porta `465`; `false` para `587`. |
| `SMTP_USER` | Sim | Usuario/email autenticado no SMTP. |
| `SMTP_PASS` | Sim | Senha SMTP ou app password. |

Exemplo com Gmail:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-app-password
```

Observacao: para Gmail, use uma app password. A senha comum da conta normalmente nao funciona para SMTP.

## Scripts

| Comando | Descricao |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Gera o build de producao. |
| `npm run start` | Inicia a aplicacao apos o build. |
| `npm run lint` | Executa ESLint no projeto. |
| `npm run sync-atp` | Sincroniza o calendario ATP manualmente. |

## Estrutura

```text
tennis-betting/
|-- app/
|   |-- admin/              # Painel administrativo
|   |-- api/                # Rotas de API
|   |-- cadastro/           # Cadastro de usuario
|   |-- dashboard/          # Area logada do participante
|   |-- grupos/             # Grupos e pools
|   |-- login/              # Login
|   |-- perfil/             # Perfil do usuario
|   |-- ranking/            # Rankings
|   `-- torneios/           # Torneios e palpites
|-- components/
|   |-- admin/              # Componentes do admin
|   |-- auth/               # Formularios de autenticacao
|   |-- dashboard/          # Componentes do dashboard
|   |-- pools/              # Componentes de grupos/pools
|   |-- profile/            # Componentes do perfil
|   |-- shared/             # Componentes compartilhados
|   |-- tournament/         # Chaveamento, ranking e inscricao
|   `-- ui/                 # Componentes base
|-- lib/
|   |-- actions/            # Server actions
|   |-- services/           # Integracoes externas
|   |-- admin.ts            # Regras administrativas
|   |-- auth.ts             # Autenticacao e sessoes
|   |-- data.ts             # Consultas e regras de dados
|   |-- db.ts               # Cliente Neon
|   `-- email.ts            # Envio de emails
|-- public/                 # Assets estaticos
|-- scripts/                # SQLs, migracoes e sincronizacoes
|-- styles/                 # Estilos globais auxiliares
`-- README.md
```

## Fluxo de torneios

O torneio passa por estados que controlam visibilidade, palpites e resultados:

| Status | Significado |
| --- | --- |
| `STANDBY` | Torneio interno no admin, ainda sem exibicao para participantes. |
| `UPCOMING` | Torneio preparado/visivel, aguardando abertura. |
| `OPEN` | Aberto para inscricoes e palpites. |
| `LOCKED` / `IN_PROGRESS` | Palpites encerrados ou torneio em andamento. |
| `FINISHED` | Torneio finalizado, com campeao e vice definidos. |

No admin, a tela de torneio permite:

- Preparar e publicar chaveamento.
- Sincronizar chaveamento ATP quando aplicavel.
- Definir jogadores e placeholders.
- Lancar, limpar ou cancelar resultados.
- Finalizar torneio.
- Auditar inscritos e identificar quem enviou ou nao enviou palpites.

## Banco de dados

O projeto usa Neon PostgreSQL via `@neondatabase/serverless`.

Tabelas/conceitos centrais:

- `users`: usuarios, perfil, clube, estado/cidade e permissao admin.
- `sessions`: sessoes de login por token.
- `tournaments`: torneios, datas, status, categoria e configuracoes.
- `bracket_matches`: partidas do chaveamento.
- `predictions`: palpites por usuario e partida.
- `user_tournaments`: inscricoes de usuarios em torneios.
- `pools` e `pool_members`: grupos e participantes.
- `players`: jogadores do chaveamento.
- `tennis_clubs`: clubes cadastrados.

Os scripts SQL e utilitarios ficam em `scripts/`. Antes de rodar em producao, confira o script especifico que pretende executar e use a connection string correta.

## Deploy

O deploy recomendado e pela Vercel:

1. Envie o codigo para o GitHub.
2. Crie um projeto na Vercel apontando para este repositorio.
3. Configure as variaveis de ambiente:
   - `NEON_CONNECTION_STRING`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
4. Rode o deploy.

## Troubleshooting

### `NEON_CONNECTION_STRING environment variable is not set`

Crie `.env.local` e preencha `NEON_CONNECTION_STRING`.

### Erro de conexao com o Neon

Verifique se:

- A connection string esta correta.
- O banco esta ativo.
- A string contem `sslmode=require`, quando exigido pelo Neon.

### Email de recuperacao nao chega

Verifique se:

- As variaveis SMTP estao preenchidas.
- `SMTP_SECURE` corresponde a porta usada.
- O provedor permite envio por aplicacoes externas.
- No Gmail, uma app password foi usada.

### Porta 3000 em uso

Rode em outra porta:

```bash
npm run dev -- --port 3001
```

### `eslint` nao encontrado

Rode `npm install` novamente. Se o pacote ainda nao estiver disponivel no projeto, instale/configure o ESLint antes de usar `npm run lint`.

---

Ultima atualizacao: Junho de 2026
