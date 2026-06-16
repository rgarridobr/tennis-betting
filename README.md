# Tennis Betting Platform

Plataforma web para palpites em torneios de tênis, rankings de participantes, grupos/pools e administração completa de torneios.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/victoorres-projects/tennis-betting-platform)
[![Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Database](https://img.shields.io/badge/Database-Neon%20(PostgreSQL)-informational?style=for-the-badge&logo=postgresql)](https://neon.tech)

## Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Principais recursos](#principais-recursos)
- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Configuração local](#configuração-local)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [Estrutura](#estrutura)
- [Fluxo dos torneios](#fluxo-dos-torneios)
- [Banco de dados](#banco-de-dados)
- [Deploy](#deploy)
- [Solução de problemas](#solução-de-problemas)

## Sobre o projeto

O Tennis Betting Platform permite que usuários se cadastrem, entrem em torneios, preencham palpites por chaveamento e acompanhem rankings. O projeto também inclui um painel administrativo para controlar torneios, chaveamentos, usuários, clubes, grupos e resultados.

O produto tem duas experiências principais:

- Área do participante: dashboard, torneios, palpites, grupos/pools, ranking geral e ranking por torneio.
- Área administrativa: criação e manutenção de torneios, sincronização com a ATP, publicação de chaveamentos, lançamento de resultados e controle de usuários, clubes e grupos.

## Principais recursos

- Cadastro, login e sessão própria via cookie `session_token`.
- Recuperação de senha por código enviado via SMTP.
- Torneios com status administrativo e chaveamento por rodadas.
- Inscrição de usuários em torneios.
- Palpites por partida e pontuação automática com base nos resultados.
- Rankings globais, por torneio e por estado.
- Grupos/pools gerais, privados e estaduais.
- Painel administrativo para torneios, usuários, clubes e grupos.
- Sincronização de calendário e chaveamento da ATP.
- Auditoria de inscritos no admin, incluindo quem já palpitou e quem ainda não palpitou.
- Interface responsiva com Next.js, React, Radix UI e Tailwind CSS.

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

## Pré-requisitos

- Node.js 18 ou superior
- npm
- Git
- Banco PostgreSQL no Neon
- Servidor SMTP para envio de e-mails de recuperação de senha

Verifique as versões instaladas:

```bash
node --version
npm --version
git --version
```

## Configuração local

Clone o repositório:

```bash
git clone https://github.com/iamvictormt/tennis-betting.git
cd tennis-betting
```

Instale as dependências:

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

## Variáveis de ambiente

Estas são as variáveis usadas pelo projeto:

| Variável | Obrigatória | Uso |
| --- | --- | --- |
| `NEON_CONNECTION_STRING` | Sim | Conexão com o banco Neon PostgreSQL. |
| `SMTP_HOST` | Sim | Host SMTP para envio de e-mails. |
| `SMTP_PORT` | Sim | Porta SMTP. Use `587` para STARTTLS ou `465` para SSL. |
| `SMTP_SECURE` | Sim | `true` para a porta `465`; `false` para a porta `587`. |
| `SMTP_USER` | Sim | Usuário/e-mail autenticado no SMTP. |
| `SMTP_PASS` | Sim | Senha SMTP ou app password. |

Exemplo com Gmail:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-app-password
```

Observação: para Gmail, use uma app password. A senha comum da conta normalmente não funciona para SMTP.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Gera o build de produção. |
| `npm run start` | Inicia a aplicação após o build. |
| `npm run lint` | Executa o ESLint no projeto. |
| `npm run sync-atp` | Sincroniza o calendário da ATP manualmente. |

## Estrutura

```text
tennis-betting/
|-- app/
|   |-- admin/              # Painel administrativo
|   |-- api/                # Rotas de API
|   |-- cadastro/           # Cadastro de usuário
|   |-- dashboard/          # Área logada do participante
|   |-- grupos/             # Grupos e pools
|   |-- login/              # Login
|   |-- perfil/             # Perfil do usuário
|   |-- ranking/            # Rankings
|   `-- torneios/           # Torneios e palpites
|-- components/
|   |-- admin/              # Componentes do admin
|   |-- auth/               # Formulários de autenticação
|   |-- dashboard/          # Componentes do dashboard
|   |-- pools/              # Componentes de grupos/pools
|   |-- profile/            # Componentes do perfil
|   |-- shared/             # Componentes compartilhados
|   |-- tournament/         # Chaveamento, ranking e inscrição
|   `-- ui/                 # Componentes base
|-- lib/
|   |-- actions/            # Server actions
|   |-- services/           # Integrações externas
|   |-- admin.ts            # Regras administrativas
|   |-- auth.ts             # Autenticação e sessões
|   |-- data.ts             # Consultas e regras de dados
|   |-- db.ts               # Cliente Neon
|   `-- email.ts            # Envio de e-mails
|-- public/                 # Assets estáticos
|-- scripts/                # SQLs, migrações e sincronizações
|-- styles/                 # Estilos globais auxiliares
`-- README.md
```

## Fluxo dos torneios

O torneio passa por estados que controlam visibilidade, palpites e resultados:

| Status | Significado |
| --- | --- |
| `STANDBY` | Torneio interno no admin, ainda sem exibição para participantes. |
| `UPCOMING` | Torneio preparado/visível, aguardando abertura. |
| `OPEN` | Aberto para inscrições e palpites. |
| `LOCKED` / `IN_PROGRESS` | Palpites encerrados ou torneio em andamento. |
| `FINISHED` | Torneio finalizado, com campeão e vice definidos. |

No admin, a tela de torneio permite:

- Preparar e publicar o chaveamento.
- Sincronizar o chaveamento da ATP quando aplicável.
- Definir jogadores e placeholders.
- Lançar, limpar ou cancelar resultados.
- Finalizar o torneio.
- Auditar inscritos e identificar quem enviou ou não enviou palpites.

## Banco de dados

O projeto usa Neon PostgreSQL via `@neondatabase/serverless`.

Tabelas e conceitos centrais:

- `users`: usuários, perfil, clube, estado/cidade e permissão de admin.
- `sessions`: sessões de login por token.
- `tournaments`: torneios, datas, status, categoria e configurações.
- `bracket_matches`: partidas do chaveamento.
- `predictions`: palpites por usuário e partida.
- `user_tournaments`: inscrições de usuários em torneios.
- `pools` e `pool_members`: grupos e participantes.
- `players`: jogadores do chaveamento.
- `tennis_clubs`: clubes cadastrados.

Os scripts SQL e utilitários ficam em `scripts/`. Antes de rodar qualquer script em produção, confira o arquivo específico que pretende executar e use a connection string correta.

## Deploy

O deploy recomendado é pela Vercel:

1. Envie o código para o GitHub.
2. Crie um projeto na Vercel apontando para este repositório.
3. Configure as variáveis de ambiente:
   - `NEON_CONNECTION_STRING`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
4. Rode o deploy.

## Solução de problemas

### `NEON_CONNECTION_STRING environment variable is not set`

Crie o arquivo `.env.local` e preencha `NEON_CONNECTION_STRING`.

### Erro de conexão com o Neon

Verifique se:

- A connection string está correta.
- O banco está ativo.
- A string contém `sslmode=require`, quando exigido pelo Neon.

### E-mail de recuperação não chega

Verifique se:

- As variáveis SMTP estão preenchidas.
- `SMTP_SECURE` corresponde à porta usada.
- O provedor permite envio por aplicações externas.
- No Gmail, uma app password foi usada.

### Porta 3000 em uso

Rode em outra porta:

```bash
npm run dev -- --port 3001
```

### `eslint` não encontrado

Rode `npm install` novamente. Se o pacote ainda não estiver disponível no projeto, instale/configure o ESLint antes de usar `npm run lint`.

---

Última atualização: Junho de 2026
