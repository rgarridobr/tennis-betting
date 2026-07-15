import fs from 'fs'

let src = fs.readFileSync('lib/admin.ts', 'utf8')

const needsT = [
  'finishTournament',
  'deleteTournament',
  'deletePlayer',
  'updatePlayer',
  'setMatchResult',
  'clearMatchResult',
]

for (const name of needsT) {
  const re = new RegExp(`(export async function ${name}\\([^)]*\\)(?::[^{]*)?\\{)`)
  const m = src.match(re)
  if (!m) {
    console.log('not found', name)
    continue
  }
  const start = src.indexOf(m[0]) + m[0].length
  const slice = src.slice(start, start + 120)
  if (slice.includes("getTranslations('errors')")) {
    console.log('already has t', name)
    continue
  }
  src = src.slice(0, start) + `\n  const t = await getTranslations('errors');` + src.slice(start)
  console.log('injected t into', name)
}

// Fix validateTennisScore (sync) — English technical fallbacks (only used if uncommented)
const vStart = src.indexOf('export function validateTennisScore')
const vEnd = src.indexOf('export async function setMatchResult')
if (vStart !== -1 && vEnd !== -1) {
  let body = src.slice(vStart, vEnd)
  body = body
    .replace(/t\('adminInvalidSetScore', \{ set \}\)/g, "'Invalid set score: ' + set")
    .replace(/t\('adminGamesNegative'\)/g, "'Games cannot be negative'")
    .replace(/t\('adminIncompleteSet', \{ set \}\)/g, "'Incomplete or invalid set: ' + set")
    .replace(/t\('adminImpossibleScore', \{ set \}\)/g, "'Impossible score: ' + set")
    .replace(/t\('adminInvalidScore', \{ set \}\)/g, "'Invalid score: ' + set")
    .replace(/t\('adminExtraSets'\)/g, "'Extra sets after winner decided'")
    .replace(
      /t\('adminMatchIncomplete', \{ setsToWin \}\)/g,
      "'Incomplete match. Need ' + setsToWin + ' sets to win'",
    )
  src = src.slice(0, vStart) + body + src.slice(vEnd)
  console.log('fixed validateTennisScore')
}

src = src.replace(
  "//       return { success: false, error: 'O vencedor selecionado não coincide com o placar dos sets' }",
  "//       return { success: false, error: t('adminWinnerScoreMismatch') }",
)

fs.writeFileSync('lib/admin.ts', src)
console.log('lib/admin.ts saved')

// messages
const pt = JSON.parse(fs.readFileSync('messages/pt.json', 'utf8'))
const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'))
pt.errors.adminNoAtpMatches = 'Nenhuma partida encontrada no chaveamento da ATP.'
en.errors.adminNoAtpMatches = 'No matches found in the ATP draw.'
pt.errors.adminBracketSyncFailed = 'Erro ao sincronizar chaveamento: {message}'
en.errors.adminBracketSyncFailed = 'Could not sync bracket: {message}'
pt.errors.adminWinnerScoreMismatch =
  'O vencedor selecionado não coincide com o placar dos sets'
en.errors.adminWinnerScoreMismatch = 'Selected winner does not match the set score'
// create tournament catch
if (!pt.errors.adminCreateTournamentFailed) {
  pt.errors.adminCreateTournamentFailed = 'Erro ao criar torneio'
  en.errors.adminCreateTournamentFailed = 'Could not create tournament'
}
fs.writeFileSync('messages/pt.json', JSON.stringify(pt, null, 2) + '\n')
fs.writeFileSync('messages/en.json', JSON.stringify(en, null, 2) + '\n')

let actions = fs.readFileSync('lib/actions/admin.ts', 'utf8')
actions = actions.replace(
  "error: 'Nenhuma partida encontrada no chaveamento da ATP.'",
  "error: t('adminNoAtpMatches')",
)
actions = actions.replace(
  "error: 'Erro ao sincronizar chaveamento: ' + error.message",
  "error: t('adminBracketSyncFailed', { message: error.message })",
)
// any remaining error.message || 'Erro...
actions = actions.replace(
  /error\.message \|\| t\('adminCreateTournamentFailed'\)/g,
  "error.message || t('adminCreateTournamentFailed')",
)
fs.writeFileSync('lib/actions/admin.ts', actions)
console.log('actions fixed')

// Scan remaining
for (const f of ['lib/actions/admin.ts', 'lib/admin.ts', 'lib/actions/atp-sync.ts']) {
  const t = fs.readFileSync(f, 'utf8')
  const hits = []
  const r =
    /(?:error|message):\s*'([^']+)'|throw new Error\(\s*'([^']+)'\s*\)|error:\s*`([^`]+)`/g
  let m
  while ((m = r.exec(t))) {
    const s = m[1] || m[2] || m[3]
    if (/[àáâãéêíóôõúçÀÁÂÃÉÊÍÓÔÕÚÇ]|Não |Erro |obrigat|Sincron|Torneio|Jogador|Clube|Chave|partida|Final /i.test(s)) {
      // skip if it's only English
      if (!/^[A-Za-z0-9 .,:;!?'\-{}]+$/.test(s) || /[àáâãéêíóôõúç]/i.test(s)) {
        hits.push(s)
      }
    }
  }
  // also catch PT without accents
  const r2 =
    /(?:error|message):\s*'(Nenhuma |Erro |Todos |Nome |Apenas |Cadastre |Não |Clube |ID |Torneio |Chaveamento |Limite |Um torneio)[^']*'/g
  while ((m = r2.exec(t))) hits.push(m[0])
  console.log(f, 'remaining:', [...new Set(hits)])
}
