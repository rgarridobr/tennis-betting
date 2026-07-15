import fs from 'fs'

const files = ['lib/actions/admin.ts', 'lib/admin.ts', 'lib/actions/atp-sync.ts']

// All user-facing strings found + English translations
const dictionary = {
  // shared
  'Todos os campos são obrigatórios': {
    key: 'adminAllFieldsRequired',
    en: 'All fields are required',
  },
  'Todos os campos obrigatórios estão faltando': {
    key: 'adminRequiredMissing',
    en: 'Required fields are missing',
  },
  'Campos obrigatórios estão faltando': {
    key: 'adminRequiredMissingShort',
    en: 'Required fields are missing',
  },
  'A senha deve ter pelo menos 6 caracteres': {
    key: 'passwordMin6',
    en: 'Password must be at least 6 characters',
    reuse: true, // already in errors
  },
  'Este email já está cadastrado': {
    key: 'emailTaken',
    en: 'This email is already registered',
    reuse: true,
  },
  'Erro ao criar conta. Tente novamente.': {
    key: 'registerFailed',
    en: 'Could not create account. Please try again.',
    reuse: true,
  },
  'Nome obrigatório': {
    key: 'adminNameRequired',
    en: 'Name is required',
  },
  'Nenhum jogador encontrado': {
    key: 'adminNoPlayersFound',
    en: 'No players found',
  },
  'Erro ao preparar torneio': {
    key: 'adminPrepareFailed',
    en: 'Could not prepare tournament',
  },
  'Erro ao resetar torneio': {
    key: 'adminResetFailed',
    en: 'Could not reset tournament',
  },
  'Erro ao publicar torneio': {
    key: 'adminPublishFailed',
    en: 'Could not publish tournament',
  },
  'Erro ao cancelar pontuação': {
    key: 'adminCancelPointsFailed',
    en: 'Could not cancel scoring',
  },
  'Erro ao atualizar o prêmio do torneio': {
    key: 'adminPrizeUpdateFailed',
    en: 'Could not update tournament prize',
  },
  'Erro ao atualizar a data do torneio': {
    key: 'adminDateUpdateFailed',
    en: 'Could not update tournament date',
  },
  'Erro ao atualizar usuário': {
    key: 'adminUserUpdateFailed',
    en: 'Could not update user',
  },
  'Nome do clube é obrigatório': {
    key: 'adminClubNameRequired',
    en: 'Club name is required',
  },
  'Erro ao cadastrar clube': {
    key: 'adminClubCreateFailed',
    en: 'Could not create club',
  },
  'ID e nome do clube são obrigatórios': {
    key: 'adminClubIdNameRequired',
    en: 'Club ID and name are required',
  },
  'Clube não encontrado': {
    key: 'adminClubNotFound',
    en: 'Club not found',
  },
  'Erro ao atualizar clube': {
    key: 'adminClubUpdateFailed',
    en: 'Could not update club',
  },
  'ID do clube é obrigatório': {
    key: 'adminClubIdRequired',
    en: 'Club ID is required',
  },
  'Erro ao excluir clube': {
    key: 'adminClubDeleteFailed',
    en: 'Could not delete club',
  },
  'Torneio não encontrado': {
    key: 'adminTournamentNotFound',
    en: 'Tournament not found',
  },
  'ID da API ATP não configurado para este torneio': {
    key: 'adminAtpApiIdMissing',
    en: 'ATP API ID is not configured for this tournament',
  },
  'Chaveamento ainda não foi gerado no sistema': {
    key: 'adminBracketNotGenerated',
    en: 'Bracket has not been generated yet',
  },
  'Erro ao excluir. O item pode estar em uso.': {
    key: 'adminDeleteInUse',
    en: 'Could not delete. The item may be in use.',
  },
  'Erro ao sincronizar com ATP. Tente novamente mais tarde.': {
    key: 'adminAtpSyncFailed',
    en: 'Could not sync with ATP. Try again later.',
  },
  // lib/admin.ts
  'Final não encontrada para este torneio.': {
    key: 'adminFinalNotFound',
    en: 'Final match not found for this tournament.',
  },
  'Cadastre o resultado da final antes de finalizar o torneio.': {
    key: 'adminFinalResultRequired',
    en: 'Enter the final result before finishing the tournament.',
  },
  'Não foi possível identificar o vice-campeão.': {
    key: 'adminRunnerUpUnknown',
    en: 'Could not identify the runner-up.',
  },
  'Erro ao finalizar torneio': {
    key: 'adminFinishFailed',
    en: 'Could not finish tournament',
  },
  'Apenas torneios em rascunho ou em breve podem ser excluídos.': {
    key: 'adminDeleteStatusBlocked',
    en: 'Only draft or upcoming tournaments can be deleted.',
  },
  'Erro ao excluir torneio. Verifique se existem dependências.': {
    key: 'adminDeleteTournamentFailed',
    en: 'Could not delete tournament. Check for dependencies.',
  },
  'Torneio já está preparado ou em outro status': {
    key: 'adminAlreadyPrepared',
    en: 'Tournament is already prepared or in another status',
  },
  'Chaveamento não gerado': {
    key: 'adminBracketMissing',
    en: 'Bracket not generated',
  },
  'Nenhum jogador cadastrado': {
    key: 'adminNoPlayersRegistered',
    en: 'No players registered',
  },
  'Chaveamento já foi gerado para este torneio': {
    key: 'adminBracketAlreadyGenerated',
    en: 'Bracket already generated for this tournament',
  },
  'Não é possível excluir o jogador, pois ele já possui partidas ou palpites vinculados.': {
    key: 'adminPlayerDeleteBlocked',
    en: 'Cannot delete player: they already have matches or predictions linked.',
  },
  'Erro ao atualizar jogador. Verifique se o nome já existe.': {
    key: 'adminPlayerUpdateFailed',
    en: 'Could not update player. The name may already exist.',
  },
  'Games não podem ser negativos': {
    key: 'adminGamesNegative',
    en: 'Games cannot be negative',
  },
  'Sets extras após o vencedor ser definido': {
    key: 'adminExtraSets',
    en: 'Extra sets after the winner was decided',
  },
  'Partida não encontrada': {
    key: 'adminMatchNotFound',
    en: 'Match not found',
  },
  'O torneio já foi finalizado e os resultados não podem ser alterados.': {
    key: 'adminTournamentFinishedLocked',
    en: 'Tournament is finished; results cannot be changed.',
  },
  'O torneio ainda não foi publicado. Publique-o antes de lançar resultados.': {
    key: 'adminPublishBeforeResults',
    en: 'Tournament is not published yet. Publish it before entering results.',
  },
  'O vencedor selecionado não faz parte deste confronto.': {
    key: 'adminWinnerNotInMatch',
    en: 'Selected winner is not part of this match.',
  },
  'Erro ao salvar resultado': {
    key: 'adminSaveResultFailed',
    en: 'Could not save result',
  },
  'Erro ao limpar resultado': {
    key: 'adminClearResultFailed',
    en: 'Could not clear result',
  },
  // template-ish — handled specially
}

// Template patterns (function-based)
const templates = [
  {
    // Sincronização permitida apenas uma vez a cada 24 horas. Tente novamente em ${hours}h ${minutes}min.
    match: /Sincronização permitida apenas uma vez a cada 24 horas\. Tente novamente em \$\{hours\}h \$\{minutes\}min\./,
    replace: (tVar = 't') =>
      `${tVar}('adminSyncRateLimit', { hours, minutes })`,
    key: 'adminSyncRateLimit',
    pt: 'Sincronização permitida apenas uma vez a cada 24 horas. Tente novamente em {hours}h {minutes}min.',
    en: 'Sync is allowed only once every 24 hours. Try again in {hours}h {minutes}min.',
  },
  {
    match: /Um torneio com este nome para o ano de \$\{year\} já existe \(slug: \$\{slug\}\)\./,
    replace: (tVar = 't') =>
      `${tVar}('adminTournamentNameExists', { year, slug })`,
    key: 'adminTournamentNameExists',
    pt: 'Um torneio com este nome para o ano de {year} já existe (slug: {slug}).',
    en: 'A tournament with this name for year {year} already exists (slug: {slug}).',
  },
  {
    match: /Placar de set inválido: \$\{set\}/,
    replace: (tVar = 't') => `${tVar}('adminInvalidSetScore', { set })`,
    key: 'adminInvalidSetScore',
    pt: 'Placar de set inválido: {set}',
    en: 'Invalid set score: {set}',
  },
  {
    match: /Set incompleto ou inválido: \$\{set\}/,
    replace: (tVar = 't') => `${tVar}('adminIncompleteSet', { set })`,
    key: 'adminIncompleteSet',
    pt: 'Set incompleto ou inválido: {set}',
    en: 'Incomplete or invalid set: {set}',
  },
  {
    match: /Placar impossível: \$\{set\}/,
    replace: (tVar = 't') => `${tVar}('adminImpossibleScore', { set })`,
    key: 'adminImpossibleScore',
    pt: 'Placar impossível: {set}',
    en: 'Impossible score: {set}',
  },
  {
    match: /Placar inválido: \$\{set\}/,
    replace: (tVar = 't') => `${tVar}('adminInvalidScore', { set })`,
    key: 'adminInvalidScore',
    pt: 'Placar inválido: {set}',
    en: 'Invalid score: {set}',
  },
  {
    match: /Partida incompleta\. São necessários \$\{setsToWin\} sets para vencer\./,
    replace: (tVar = 't') => `${tVar}('adminMatchIncomplete', { setsToWin })`,
    key: 'adminMatchIncomplete',
    pt: 'Partida incompleta. São necessários {setsToWin} sets para vencer.',
    en: 'Incomplete match. {setsToWin} sets are required to win.',
  },
]

// Also catch remaining create tournament error with message bubble
const extra = {
  'Erro ao criar torneio': {
    key: 'adminCreateTournamentFailed',
    en: 'Could not create tournament',
  },
}

Object.assign(dictionary, Object.fromEntries(
  Object.entries(extra).map(([pt, v]) => [pt, v]),
))

// Update message files
for (const file of ['messages/pt.json', 'messages/en.json']) {
  const isPt = file.includes('pt')
  const j = JSON.parse(fs.readFileSync(file, 'utf8'))
  j.errors = j.errors || {}
  for (const [pt, meta] of Object.entries(dictionary)) {
    if (meta.reuse) continue
    j.errors[meta.key] = isPt ? pt : meta.en
  }
  for (const tmpl of templates) {
    j.errors[tmpl.key] = isPt ? tmpl.pt : tmpl.en
  }
  // ensure passwordMin6 etc exist
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + '\n')
  console.log('messages updated', file)
}

// Helper: inject getTranslations at start of exported async functions / key functions
function ensureImport(src) {
  if (src.includes("from 'next-intl/server'")) return src
  // after first import block line
  return src.replace(
    /^((?:import .+\n)+)/m,
    `$1import { getTranslations } from 'next-intl/server';\n`,
  )
}

function injectTInFunctions(src, functionNames) {
  for (const name of functionNames) {
    // export async function name(
    const re = new RegExp(
      `(export async function ${name}\\([^)]*\\)\\s*\\{)\\n`,
      'g',
    )
    src = src.replace(re, (m, open) => {
      if (src.includes(`async function ${name}`) && open) {
        // avoid double inject - check if next lines have getTranslations near this function
      }
      return `${open}\n  const t = await getTranslations('errors');\n`
    })
  }
  return src
}

// Patch lib/actions/admin.ts
let adminActions = fs.readFileSync('lib/actions/admin.ts', 'utf8')
adminActions = ensureImport(adminActions)

// Get all export async function names
const actionFns = [...adminActions.matchAll(/export async function (\w+)/g)].map((m) => m[1])
for (const name of actionFns) {
  const marker = `export async function ${name}`
  const idx = adminActions.indexOf(marker)
  if (idx === -1) continue
  const brace = adminActions.indexOf('{', idx)
  const after = adminActions.slice(brace + 1, brace + 80)
  if (after.includes("getTranslations('errors')")) continue
  adminActions =
    adminActions.slice(0, brace + 1) +
    `\n  const t = await getTranslations('errors');` +
    adminActions.slice(brace + 1)
}

// Replace plain strings
for (const [pt, meta] of Object.entries(dictionary)) {
  const key = meta.key
  // return { success: false, error: '...' }
  adminActions = adminActions.split(`error: '${pt}'`).join(`error: t('${key}')`)
  adminActions = adminActions.split(`throw new Error('${pt}')`).join(`throw new Error(t('${key}'))`)
}

// Template ATP rate limit
adminActions = adminActions.replace(
  /error:\s*`Sincronização permitida apenas uma vez a cada 24 horas\. Tente novamente em \$\{hours\}h \$\{minutes\}min\.`/,
  `error: t('adminSyncRateLimit', { hours, minutes })`,
)

// error.message passthrough stays
// Catch create tournament: error: error.message || '...'
adminActions = adminActions.replace(
  /error\.message \|\| 'Erro ao criar torneio[^']*'/,
  `error.message || t('adminCreateTournamentFailed')`,
)
adminActions = adminActions.replace(
  /error\.message \|\| "Erro ao criar torneio[^"]*"/,
  `error.message || t('adminCreateTournamentFailed')`,
)

fs.writeFileSync('lib/actions/admin.ts', adminActions)
console.log('patched lib/actions/admin.ts')

// Patch atp-sync
let atp = fs.readFileSync('lib/actions/atp-sync.ts', 'utf8')
atp = ensureImport(atp)
if (!atp.includes("getTranslations('errors')")) {
  atp = atp.replace(
    'export async function syncAtpCalendarAction() {\n  await requireAdmin()',
    "export async function syncAtpCalendarAction() {\n  const t = await getTranslations('errors');\n  await requireAdmin()",
  )
}
atp = atp.replace(
  /error:\s*`Sincronização permitida apenas uma vez a cada 24 horas\. Tente novamente em \$\{hours\}h \$\{minutes\}min\.`/,
  `error: t('adminSyncRateLimit', { hours, minutes })`,
)
atp = atp.replace(
  `error: 'Erro ao sincronizar com ATP. Tente novamente mais tarde.'`,
  `error: t('adminAtpSyncFailed')`,
)
fs.writeFileSync('lib/actions/atp-sync.ts', atp)
console.log('patched lib/actions/atp-sync.ts')

// Patch lib/admin.ts - many functions need t
let adminLib = fs.readFileSync('lib/admin.ts', 'utf8')
adminLib = ensureImport(adminLib)

// Inject t into async functions that return errors
const libFns = [
  'createTournament',
  'finishTournament',
  'deleteTournament',
  'prepareTournament',
  'resetTournamentToStandby',
  'randomizeFirstRound',
  'generateBracket',
  'deletePlayer',
  'updatePlayer',
  'setMatchResult',
  'clearMatchResult',
  'publishTournament',
  // validateScore is sync - special
]
for (const name of libFns) {
  const re = new RegExp(`(export async function ${name}\\([^)]*\\)(?::[^{]+)?\\{)\\n`)
  if (re.test(adminLib)) {
    adminLib = adminLib.replace(re, (m, open) => {
      if (m.includes("getTranslations('errors')")) return m
      return `${open}\n  const t = await getTranslations('errors');\n`
    })
  }
}

// validateScore functions may be non-async - make them accept t or use getTranslations async
// Check if validateScore is async
if (adminLib.includes('function validateScore') || adminLib.includes('function validateBestOf')) {
  // For sync validators returning PT, convert to async or inject getTranslations - can't await in sync
  // Leave validators: convert to take optional translator OR make async
}

// Replace dictionary strings
for (const [pt, meta] of Object.entries(dictionary)) {
  const key = meta.key
  adminLib = adminLib.split(`error: '${pt}'`).join(`error: t('${key}')`)
  adminLib = adminLib.split(`throw new Error('${pt}')`).join(`throw new Error(t('${key}'))`)
}

// Templates in admin lib
adminLib = adminLib.replace(
  /throw new Error\(`Um torneio com este nome para o ano de \$\{year\} já existe \(slug: \$\{slug\}\)\.`\)/,
  `throw new Error(t('adminTournamentNameExists', { year, slug }))`,
)
adminLib = adminLib.replace(
  /error: `Placar de set inválido: \$\{set\}`/g,
  `error: t('adminInvalidSetScore', { set })`,
)
adminLib = adminLib.replace(
  /error: `Set incompleto ou inválido: \$\{set\}`/g,
  `error: t('adminIncompleteSet', { set })`,
)
adminLib = adminLib.replace(
  /error: `Placar impossível: \$\{set\}`/g,
  `error: t('adminImpossibleScore', { set })`,
)
adminLib = adminLib.replace(
  /error: `Placar inválido: \$\{set\}`/g,
  `error: t('adminInvalidScore', { set })`,
)
adminLib = adminLib.replace(
  /error: `Partida incompleta\. São necessários \$\{setsToWin\} sets para vencer\.`/g,
  `error: t('adminMatchIncomplete', { setsToWin })`,
)
adminLib = adminLib.split(`error: 'Games não podem ser negativos'`).join(`error: t('adminGamesNegative')`)
adminLib = adminLib.split(`error: 'Sets extras após o vencedor ser definido'`).join(`error: t('adminExtraSets')`)

// Sync validate functions need t - read how they're defined
// If they use t() without defining, we need to fix validators
const hasValidateWithT = /function validate\w*[^{]*\{[^}]*t\('/.test(adminLib) || adminLib.includes("t('adminInvalidSetScore'")

fs.writeFileSync('lib/admin.ts', adminLib)
console.log('patched lib/admin.ts')

// Report remaining PT
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8')
  const r = /(?:error|message):\s*'([^']*[àáâãéêíóôõúçÀÁÂÃÉÊÍÓÔÕÚÇ][^']*)'|throw new Error\('([^']*[àáâãéêíóôõúçÀÁÂÃÉÊÍÓÔÕÚÇ][^']*)'\)|error:\s*`([^`]*[àááâãéêíóôõúç][^`]*)`/gi
  let m
  const left = []
  while ((m = r.exec(t))) left.push(m[1] || m[2] || m[3])
  console.log(f, 'remaining accented:', left.length, left.slice(0, 10))
}
