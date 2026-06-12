# 🎾 Tennis Betting Platform

Uma plataforma moderna para apostas e gerenciamento de torneios de tênis com painel administrativo integrado.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/victoorres-projects/tennis-betting-platform)
[![Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Database](<https://img.shields.io/badge/Database-Neon%20(PostgreSQL)-informational?style=for-the-badge&logo=postgresql>)](https://neon.tech)

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Como Executar](#como-executar)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Deployment](#deployment)
- [Suporte](#suporte)

## 🎯 Visão Geral

Tennis Betting Platform é uma aplicação web completa para:

- **Gerenciar torneios de tênis** com suporte a chaves automáticas
- **Fazer apostas** em partidas e resultados
- **Sincronização automática** com calendário ATP
- **Painel administrativo** para gerenciar usuários, torneios e configurações
- **Ranking de apostadores** com histórico de resultados
- **Sistema de autenticação** seguro com suporte a múltiplos usuários

## ✨ Funcionalidades Principais

- 🏆 Gerenciamento completo de torneios
- 💰 Sistema de apostas e pools
- 👥 Autenticação de usuários com registro e login
- 📊 Dashboard com estatísticas
- 🔐 Painel administrativo protegido
- 🌐 Suporte a categorias estaduais
- 📱 Interface responsiva (mobile-friendly)
- 🔄 Sincronização com calendário ATP
- 🌙 Tema claro/escuro

## 📋 Pré-requisitos

Antes de começar, verifique se você tem instalado:

- **Node.js** v18 ou superior ([Baixar aqui](https://nodejs.org/))
- **npm** ou **yarn** (geralmente vem com Node.js)
- **Git** ([Baixar aqui](https://git-scm.com/))
- Uma conta no **Neon** para o banco de dados ([Criar conta](https://console.neon.tech/))

Para verificar as versões instaladas, execute:

```bash
node --version
npm --version
git --version
```

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/iamvictormt/tennis-betting.git
cd tennis-betting
```

### 2. Instale as dependências

```bash
npm install
```

Ou com yarn:

```bash
yarn install
```

## ⚙️ Configuração do Ambiente

### 1. Crie o arquivo `.env.local`

Na raiz do projeto, crie um arquivo chamado `.env.local` com as seguintes variáveis:

```env
# Banco de dados Neon
DATABASE_URL=postgresql://user:password@host/database

# Autenticação
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua-chave-secreta-aqui

# Email (para redefinição de senha)
SMTP_HOST=smtp.seu-servidor.com
SMTP_PORT=587
SMTP_USER=seu-email@exemplo.com
SMTP_PASSWORD=sua-senha-smtp

# Ambiente
NODE_ENV=development
```

### 2. Obtenha a string de conexão Neon

1. Acesse [console.neon.tech](https://console.neon.tech/)
2. Crie um novo projeto ou use um existente
3. Copie a **Connection String** no formato PostgreSQL
4. Cole em `DATABASE_URL` no arquivo `.env.local`

### 3. Configure seu SMTP (para emails)

Se você deseja usar o sistema de recuperação de senha:

1. Configure um servidor SMTP (Mailtrap, SendGrid, Gmail, etc.)
2. Adicione as credenciais no arquivo `.env.local`

## 🏃 Como Executar

### Modo Desenvolvimento (com hot-reload)

```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:3000**

### Modo Produção

```bash
npm run build
npm run start
```

## 📝 Scripts Disponíveis

| Comando            | Descrição                               |
| ------------------ | --------------------------------------- |
| `npm run dev`      | Inicia o servidor de desenvolvimento    |
| `npm run build`    | Compila a aplicação para produção       |
| `npm start`        | Inicia a aplicação compilada            |
| `npm run lint`     | Verifica erros de código com ESLint     |
| `npm run sync-atp` | Sincroniza o calendário ATP manualmente |

## 📁 Estrutura do Projeto

```
tennis-betting/
├── app/                      # Páginas e rotas da aplicação
│   ├── admin/               # Painel administrativo
│   ├── dashboard/           # Dashboard do usuário
│   ├── login/               # Página de login
│   ├── torneios/            # Gerenciamento de torneios
│   ├── grupos/              # Gerenciamento de grupos/pools
│   ├── ranking/             # Ranking de apostadores
│   └── api/                 # Rotas de API
├── components/              # Componentes React reutilizáveis
│   ├── admin/              # Componentes do painel admin
│   ├── auth/               # Componentes de autenticação
│   ├── ui/                 # Componentes UI genéricos (Radix UI)
│   └── ...
├── lib/                     # Funções e utilitários
│   ├── db.ts               # Conexão com banco de dados
│   ├── auth.ts             # Lógica de autenticação
│   ├── utils.ts            # Funções utilitárias
│   └── actions/            # Server actions
├── public/                  # Arquivos estáticos
├── scripts/                 # Scripts de migração e sincronização
└── styles/                  # CSS global

```

## 🔑 Variáveis de Ambiente Detalhadas

| Variável          | Descrição                    | Exemplo                                              |
| ----------------- | ---------------------------- | ---------------------------------------------------- |
| `DATABASE_URL`    | String de conexão PostgreSQL | `postgresql://user:pass@host/db`                     |
| `NEXTAUTH_URL`    | URL da aplicação             | `http://localhost:3000` ou `https://seu-dominio.com` |
| `NEXTAUTH_SECRET` | Chave secreta para JWT       | Qualquer string aleatória segura                     |
| `SMTP_HOST`       | Host do servidor SMTP        | `smtp.mailtrap.io`                                   |
| `SMTP_PORT`       | Porta SMTP                   | `587` ou `465`                                       |
| `SMTP_USER`       | Usuário SMTP                 | `seu-email@exemplo.com`                              |
| `SMTP_PASSWORD`   | Senha SMTP                   | Sua senha SMTP                                       |
| `NODE_ENV`        | Ambiente                     | `development` ou `production`                        |

## 🌐 Deployment

### Deploy no Vercel (Recomendado)

1. Faça push do código para GitHub
2. Acesse [vercel.com](https://vercel.com/)
3. Clique em "New Project" e selecione o repositório
4. Configure as variáveis de ambiente
5. Clique em "Deploy"

As variáveis de ambiente devem ser adicionadas nas configurações do projeto no Vercel.

## 🐛 Solução de Problemas

### Erro de Conexão com Banco de Dados

```
Error: connect ECONNREFUSED
```

**Solução:** Verifique se:

- A string `DATABASE_URL` está correta
- O banco de dados está online
- Sua conexão de internet está ativa

### Porta 3000 já em uso

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solução:** Execute em outra porta:

```bash
npm run dev -- -p 3001
```

### Erro de autenticação

Verifique se as variáveis `NEXTAUTH_URL` e `NEXTAUTH_SECRET` estão configuradas corretamente.

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique se todos os pré-requisitos estão instalados
2. Consulte este README novamente
3. Verifique os logs de erro no console
4. Entre em contato com o suporte

---

**Última atualização:** Junho 2026
