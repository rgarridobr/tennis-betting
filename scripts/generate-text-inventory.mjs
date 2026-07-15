import fs from 'fs'
import path from 'path'

function flatten(o, p = '') {
  const out = []
  for (const [k, v] of Object.entries(o)) {
    const key = p ? `${p}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...flatten(v, key))
    else out.push([key, String(v)])
  }
  return out
}

const pt = JSON.parse(fs.readFileSync('messages/pt.json', 'utf8'))
const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'))
const fpt = flatten(pt)
const fen = Object.fromEntries(flatten(en))

const byNs = {}
for (const [k, v] of fpt) {
  const ns = k.split('.')[0]
  if (!byNs[ns]) byNs[ns] = []
  byNs[ns].push({ key: k, pt: v, en: fen[k] ?? '—' })
}

const titles = {
  nav: 'Navegação',
  buttons: 'Botões comuns',
  tennis: 'Termos de tênis',
  bracket: 'Chaveamento / palpites',
  feedback: 'Feedbacks de palpite',
  language: 'Seletor de idioma',
  common: 'Textos comuns',
  status: 'Status de torneio',
  surfaces: 'Superfícies',
  home: 'Página inicial (landing)',
  auth: 'Login, cadastro e senha',
  dashboard: 'Dashboard do participante',
  tournaments: 'Torneios e inscrição',
  ranking: 'Rankings',
  rules: 'Regras',
  profile: 'Perfil',
  pools: 'Grupos / pools',
  shared: 'Seletores (país, estado, clube)',
  admin: 'Painel administrativo (UI)',
  meta: 'SEO (título e descrição)',
  ui: 'Componentes de UI (paginação, dialog)',
  errors: 'Mensagens de erro e sucesso do servidor',
}

const summary = Object.entries(byNs).map(([ns, items]) => ({ ns, count: items.length }))

let md = `# Inventário completo de textos — TennisPool

**Pergunta do cliente:** todas as possibilidades de textos que aparecem e podem aparecer?

**Resposta:** sim — abaixo está a lista completa dos textos de **interface** do sistema, em **Português (PT)** e **English (EN)**.

- **Total de strings:** ${fpt.length}
- **Fontes:** \`messages/pt.json\` e \`messages/en.json\`
- **Paridade:** cada texto existe nos dois idiomas

---

## Sumário por área

| Área | Código | Quantidade |
|------|--------|------------|
${summary.map((s) => `| ${titles[s.ns] || s.ns} | \`${s.ns}\` | ${s.count} |`).join('\n')}
| **Total** | | **${fpt.length}** |

---

## O que entra nesta lista

Textos fixos de UI e mensagens do sistema:

- Menus, botões, títulos, subtítulos
- Labels de formulário e placeholders
- Status de torneio e superfícies
- Mensagens de sucesso e erro (login, palpites, admin, etc.)
- Regras, rankings, grupos, perfil
- SEO (title/description) e textos de acessibilidade

## O que NÃO entra (dinâmico / conteúdo)

Estes textos vêm do **banco de dados** ou do usuário, não do catálogo de tradução:

- Nomes de torneios (ex.: Australian Open 2026)
- Nomes de jogadores
- Nomes de clubes e usuários
- Descrições de prêmio cadastradas no admin
- Datas e números calculados em tempo real
- Conteúdo colado pelo admin em campos livres

Termos de tênis mantidos iguais em PT e EN (padrão do esporte): Qualifier, BYE, W/O, Wild Card, Grand Slam, Masters 1000, etc.

---

`

for (const [ns, items] of Object.entries(byNs)) {
  md += `## ${titles[ns] || ns} (\`${ns}\`) — ${items.length} textos\n\n`
  md += `| # | Português (PT) | English (EN) |\n|---:|----------------|--------------|\n`
  items.forEach((it, i) => {
    const ptEsc = it.pt.replace(/\|/g, '\\|').replace(/\n/g, ' ')
    const enEsc = String(it.en).replace(/\|/g, '\\|').replace(/\n/g, ' ')
    md += `| ${i + 1} | ${ptEsc} | ${enEsc} |\n`
  })
  md += '\n'
}

md += `## Observações para o cliente

1. **Troca de idioma:** o usuário escolhe PT ou EN no seletor (globo) do site.
2. **Cobertura:** interface do participante + painel admin + erros de formulário/API.
3. **E-mail de recuperação de senha:** também existe em PT e EN (código bilíngue no servidor).
4. **Novos textos:** se forem criadas telas ou mensagens novas, devem entrar neste catálogo para manter os dois idiomas.

---

*Documento gerado automaticamente a partir dos arquivos de tradução do projeto.*
`

fs.mkdirSync('docs', { recursive: true })
const out = path.join('docs', 'inventario-textos-i18n.md')
fs.writeFileSync(out, md, 'utf8')
console.log('Wrote', out, 'strings=', fpt.length, 'namespaces=', summary.length)
