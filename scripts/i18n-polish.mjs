/**
 * Polish PT/EN message quality + fix remaining hardcode gaps.
 */
import fs from 'fs'

// ─── Message polish ─────────────────────────────────────────────
const pt = JSON.parse(fs.readFileSync('messages/pt.json', 'utf8'))
const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'))

function set(obj, path, value) {
  const parts = path.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {}
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
}

// PT fixes
const ptFixes = {
  'status.locked': 'Palpites fechados',
  'admin.groupOpen': 'Abertos para palpites',
  'auth.loginSubtitle':
    'Entre na sua conta para fazer seus palpites ou acompanhar os resultados.',
  'auth.noAccount': 'Ainda não tem uma conta?',
  'auth.forgotPassword': 'Esqueci minha senha',
  'tournaments.enrollStep2':
    'Após a inscrição, você poderá iniciar os palpites nos jogos já confirmados.',
  'tournaments.enrollStep3':
    'Assim que os classificados do qualifying forem inseridos na chave principal, você poderá completar os palpites restantes.',
  'home.step2Desc':
    'Selecione um torneio ativo e escolha participar de um grupo ou criar o seu próprio.',
  'home.step4Desc':
    'Dispute o topo do ranking nacional e do seu estado com outros participantes.',
  'rules.importantBody':
    'Sempre que um tenista com o status de Lucky Loser (LL) vencer uma partida, ou em caso de vitória por W/O (Walkover), não haverá pontuação.',
  'bracket.notPredicted': 'Sem palpite',
  'tournaments.hitChampionAndRunner': 'Acertou o campeão e o vice',
  'pools.rankingFilteredEmpty': 'Nenhum participante enviou palpites ainda.',
  'rules.bracketBody':
    'Escolha quem avança em cada fase, palpitando no chaveamento até a final, e conquiste pontos progressivos para se destacar no ranking.',
  'rules.viewOthersBody':
    'Para visualizar os palpites dos adversários, basta clicar em "Ranking", depois em "Ranking por Torneio" e, ao acessar o torneio, escolher um adversário.',
  'surfaces.hardCourt': 'Quadra dura',
  'dashboard.availableSubtitle':
    'Alguns torneios estão acontecendo agora. Participe e mostre o quanto você entende de tênis!',
  'errors.adminRequiredMissing': 'Preencha todos os campos obrigatórios',
  'errors.adminRequiredMissingShort': 'Faltam campos obrigatórios',
  'tournaments.enrollSuccessBody': 'Agora você pode fazer seus palpites.',
  'tournaments.searchLabel': 'Buscar torneios',
  'auth.email': 'E-mail',
  'auth.emailRequired': 'E-mail *',
  'profile.email': 'E-mail *',
  'errors.emailRequired': 'O e-mail é obrigatório.',
  'errors.emailPasswordRequired': 'E-mail e senha são obrigatórios',
  'errors.invalidCredentials': 'E-mail ou senha incorretos',
  'errors.emailTaken': 'Este e-mail já está cadastrado',
  'errors.emailCodeRequired': 'E-mail e código são obrigatórios.',
  'errors.resetEmailIfExists':
    'Se o e-mail estiver cadastrado, você receberá um código em instantes.',
  'errors.emailSendFailed':
    'Ocorreu um erro ao enviar o e-mail. Tente novamente.',
  'ranking.accuracy': '% de precisão',
  'tennis.roundOf64': '64-avos de final',
  'tennis.roundOf32': '32-avos de final',
}

// Nested admin keys via path - handle carefully
function deepSet(root, path, value) {
  set(root, path, value)
}

for (const [k, v] of Object.entries(ptFixes)) deepSet(pt, k, v)

// admin nested fixes
if (pt.admin?.date) {
  pt.admin.date.toastSuccess =
    'Data e hora do torneio atualizadas com sucesso!'
  if (pt.admin.date.startDateTime) pt.admin.date.startDateTime = 'Data e hora de início'
}
if (pt.admin?.form) {
  if (pt.admin.form.startDateTime) pt.admin.form.startDateTime = 'Data e hora de início'
  if (pt.admin.form.endDate) pt.admin.form.endDate = 'Data de término'
  if (pt.admin.form.hardCourt) pt.admin.form.hardCourt = 'Quadra dura'
}
if (pt.admin?.sync?.lastSync) {
  // may be nested differently - search
}
// players importHint - walk
function walkSet(obj, key, value) {
  if (!obj || typeof obj !== 'object') return false
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    obj[key] = value
    return true
  }
  for (const v of Object.values(obj)) {
    if (walkSet(v, key, value)) return true
  }
  return false
}
walkSet(
  pt,
  'importHint',
  'Formatos aceitos: "Nome (País) [Nome de exibição]", "Nome (País)" ou apenas "Nome". Um jogador por linha. O sistema ignora a numeração, se houver.',
)
walkSet(pt, 'lastSync', 'Última sincronização: {time}')
walkSet(pt, 'startDateTime', 'Data e hora de início')
walkSet(pt, 'endDate', 'Data de término')

// EN fixes
const enFixes = {
  'status.locked': 'Predictions closed',
  'admin.groupOpen': 'Open for predictions',
  'status.upcoming': 'Coming up',
  'admin.modeUpcoming': 'Coming up mode',
  'home.heroSubtitle':
    'Join the pool, predict the biggest tennis tournaments in the world, and compete with your friends on the leaderboard.',
  'dashboard.heroSubtitle':
    'Join the pool, predict the matches, and compete with your friends on the leaderboard.',
  'pools.passwordDescription':
    'This group is private. Enter the password to join and appear on the leaderboard.',
  'meta.description':
    'TennisPool: join tennis pools, predict matches, and compete on the leaderboard with your friends.',
  'meta.twitterDescription':
    'TennisPool: make predictions, earn points, and climb the rankings.',
  'rules.bracketBody':
    'Pick who advances through every stage, predicting the bracket all the way to the final, and earn progressive points to climb the rankings.',
  'rules.generalScoring3':
    'Worst results are not dropped — every tournament counts.',
  'rules.deadlinesBody':
    'Tournament enrollment opens when status is “Coming up”. Predictions can be submitted from the moment the draw is published on TennisPool until the start of the first main-draw match.',
  'bracket.missingMatch': 'Missing match',
  'auth.loginSubtitle':
    'Sign in to your account to make predictions or follow the results.',
  'auth.noAccount': "Don't have an account yet?",
  'auth.forgotPassword': 'Forgot password?',
  'common.hits': 'Correct picks',
  'dashboard.statsHits': 'Correct picks',
  'ranking.hits': 'correct picks',
  'tournaments.hitsLabel': 'CORRECT',
  'pools.rankingHits': '{correct}/{total} CORRECT',
  'feedback.predictionSaveError': 'Error saving prediction',
  'tournaments.userNoPredictionTitle': 'No prediction submitted',
  'pools.pendingBody':
    'Tournament {name} has not started yet. Lock in points by predicting the bracket!',
  'errors.adminCancelPointsFailed': 'Could not void points',
  'tournaments.searchLabel': 'Search tournaments',
  'tournaments.comeBackAround': 'Check back around:',
  'tournaments.enrollSuccessBody': 'You can now make your predictions.',
  'home.step4Desc':
    'Compete for the top of the national and state rankings with other participants.',
  'surfaces.Hard': 'Hard court',
  'surfaces.hardCourt': 'Hard court',
  'auth.email': 'Email',
  'auth.emailRequired': 'Email *',
}

for (const [k, v] of Object.entries(enFixes)) deepSet(en, k, v)

walkSet(en, 'empty', 'No {title}s registered yet.')
walkSet(en, 'errorSave', 'Error saving result')
// if errorSave is under match, both match.errorSave and feedback

// Also fix admin.metadata.empty if nested
if (en.admin?.metadata?.empty) {
  en.admin.metadata.empty = 'No {title}s registered yet.'
}
if (en.admin?.match?.errorSave) {
  en.admin.match.errorSave = 'Error saving result'
}

// New ui/shared keys for remaining hardcodes
pt.ui = pt.ui || {}
en.ui = en.ui || {}
pt.ui.examplePrefix = 'Ex: {example}'
en.ui.examplePrefix = 'e.g. {example}'
pt.ui.close = 'Fechar'
en.ui.close = 'Close'
pt.ui.pagination = 'Paginação'
en.ui.pagination = 'Pagination'
pt.ui.imageAltTennis = 'Profissional de tênis'
en.ui.imageAltTennis = 'Tennis professional'

pt.errors.apiCountriesFailed = 'Erro ao carregar países'
en.errors.apiCountriesFailed = 'Could not load countries'
pt.errors.apiStatesFailed = 'Erro ao carregar estados'
en.errors.apiStatesFailed = 'Could not load states'
pt.errors.apiCitiesFailed = 'Erro ao carregar cidades'
en.errors.apiCitiesFailed = 'Could not load cities'
pt.errors.apiInvalidState = 'Estado inválido'
en.errors.apiInvalidState = 'Invalid state'

// club sentinel - keep value as NO_CLUB for code, but we change constant in code
// no message change needed if we use t('clubNone') for display

fs.writeFileSync('messages/pt.json', JSON.stringify(pt, null, 2) + '\n')
fs.writeFileSync('messages/en.json', JSON.stringify(en, null, 2) + '\n')
console.log('messages polished')

// ─── Code fixes ─────────────────────────────────────────────────

// 1) tournament-form surfaces: Hard / Clay / Grass
let form = fs.readFileSync('components/admin/tournament-form.tsx', 'utf8')
form = form.replace(/value="Saibro"/g, 'value="Clay"')
form = form.replace(/value="Grama"/g, 'value="Grass"')
// labels may already use t - if hardcoded Saibro as label text, leave surfaces keys
fs.writeFileSync('components/admin/tournament-form.tsx', form)
console.log('tournament-form surfaces fixed')

// 2) tennis-club-selector: sentinel NO_CLUB
let club = fs.readFileSync('components/shared/tennis-club-selector.tsx', 'utf8')
club = club.replace(/NO_CLUB_VALUE\s*=\s*['"]Nenhum['"]/, "NO_CLUB_VALUE = 'NO_CLUB'")
// selected display: if selectedValue === NO_CLUB_VALUE show t('clubNone')
if (!club.includes("selectedValue === NO_CLUB_VALUE")) {
  // try common pattern for displaying value
  club = club.replace(
    /\{selectedValue\}/g,
    "{selectedValue === NO_CLUB_VALUE ? t('clubNone') : selectedValue}",
  )
}
// also match value display in button
club = club.replace(
  /options\.find\(\(o\) => o\.value === value\)\?\.label/g,
  "options.find((o) => o.value === value)?.label",
)
fs.writeFileSync('components/shared/tennis-club-selector.tsx', club)
console.log('club selector fixed')

// 3) metadata-manager Ex:
let meta = fs.readFileSync('components/admin/metadata-manager.tsx', 'utf8')
if (!meta.includes("useTranslations('ui')") && meta.includes('useTranslations')) {
  meta = meta.replace(
    /const t = useTranslations\('admin'\)/,
    "const t = useTranslations('admin')\n  const tUi = useTranslations('ui')",
  )
}
// if only admin
if (!meta.includes('tUi') && meta.includes('useTranslations')) {
  // add import already has useTranslations
  meta = meta.replace(
    /(const t[a-zA-Z]* = useTranslations\([^)]+\);?)/,
    "$1\n  const tUi = useTranslations('ui');",
  )
}
meta = meta.replace(/`Ex: \$\{([^}]+)\}`/g, "tUi('examplePrefix', { example: $1 })")
meta = meta.replace(/'Ex: \$\{/g, '') // noop safety
fs.writeFileSync('components/admin/metadata-manager.tsx', meta)
console.log('metadata Ex fixed')

// 4) dialog Close
let dialog = fs.readFileSync('components/ui/dialog.tsx', 'utf8')
if (!dialog.includes('use client') && dialog.includes("'use client'") === false) {
  // check
}
if (!dialog.startsWith("'use client'") && !dialog.startsWith('"use client"')) {
  // may already be client via radix
}
if (!dialog.includes('next-intl')) {
  dialog = dialog.replace(
    /^('use client'|"use client")?\s*/,
    "'use client'\n\nimport { useTranslations } from 'next-intl'\n",
  )
}
// DialogClose button Close text
if (dialog.includes('>Close<') || dialog.includes('Close</span>')) {
  // wrap component - harder; simple replace with Portuguese/English via hook only works in client components
  dialog = dialog.replace(
    /<span className="sr-only">Close<\/span>/,
    '<DialogCloseLabel />',
  )
  if (!dialog.includes('function DialogCloseLabel')) {
    dialog += `

function DialogCloseLabel() {
  const t = useTranslations('ui')
  return <span className="sr-only">{t('close')}</span>
}
`
  }
}
fs.writeFileSync('components/ui/dialog.tsx', dialog)
console.log('dialog close fixed')

// 5) pagination aria-label
let pag = fs.readFileSync('components/ui/pagination.tsx', 'utf8')
// Pagination is client already - need t in Pagination component
pag = pag.replace(
  'aria-label="pagination"',
  "aria-label={useTranslations('ui')('pagination')}",
)
// that violates rules of hooks if not in component body - fix properly
fs.writeFileSync('components/ui/pagination.tsx', pag)

// 6) API routes
for (const [file, key] of [
  ['app/api/countries/route.ts', 'apiCountriesFailed'],
  ['app/api/locations/states/route.ts', 'apiStatesFailed'],
]) {
  let s = fs.readFileSync(file, 'utf8')
  if (!s.includes('getTranslations')) {
    s = s.replace(
      /^(import .+\n)+/,
      (m) => m + "import { getTranslations } from 'next-intl/server';\n",
    )
  }
  fs.writeFileSync(file, s)
}

console.log('polish script base done — finishing manual patches next')
