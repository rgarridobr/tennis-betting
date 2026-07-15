import fs from 'fs'

const pt = JSON.parse(fs.readFileSync('messages/pt.json', 'utf8'))
const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'))
pt.errors.adminRandomizeFailed = 'Erro ao gerar chaves aleatórias'
en.errors.adminRandomizeFailed = 'Could not generate random draw'
pt.errors.adminTruncatedPlayerName =
  'Nome truncado no PDF não pôde ser associado com segurança: {name} ({country})'
en.errors.adminTruncatedPlayerName =
  'Truncated PDF name could not be safely matched: {name} ({country})'
pt.errors.adminNoCountry = 'sem país'
en.errors.adminNoCountry = 'no country'
fs.writeFileSync('messages/pt.json', JSON.stringify(pt, null, 2) + '\n')
fs.writeFileSync('messages/en.json', JSON.stringify(en, null, 2) + '\n')

let a = fs.readFileSync('lib/actions/admin.ts', 'utf8')
a = a.replace(
  "error: error.message || 'Erro ao gerar chaves aleatórias'",
  "error: error.message || t('adminRandomizeFailed')",
)

// multiline throw
a = a.replace(
  /throw new Error\(\s*`Nome truncado no PDF não pôde ser associado com segurança: \$\{atpPlayer\.name\} \(\$\{atpPlayer\.country \|\| 'sem país'\}\)`\s*,?\s*\);/,
  "throw new Error(t('adminTruncatedPlayerName', { name: atpPlayer.name, country: atpPlayer.country || t('adminNoCountry') }));",
)

fs.writeFileSync('lib/actions/admin.ts', a)
console.log(
  'done',
  !a.includes('Erro ao gerar'),
  !a.includes('Nome truncado'),
)

// final scan
const leftover = [...a.matchAll(/(?:error|message):\s*'([^']+)'|throw new Error\(\s*'([^']+)'/g)]
  .map((m) => m[1] || m[2])
  .filter((s) => /[àáâãéêíóôõúç]|Erro |Não |obrigat|Torneio|Jogador|Clube|Chave|Sincron|partida/i.test(s))
console.log('leftover PT literals', leftover)
