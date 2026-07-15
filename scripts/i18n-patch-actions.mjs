import fs from 'fs'

// --- profile ---
let profile = fs.readFileSync('lib/actions/profile.ts', 'utf8')
if (!profile.includes('getTranslations')) {
  profile = profile.replace(
    "import bcrypt from 'bcryptjs';",
    "import bcrypt from 'bcryptjs';\nimport { getTranslations } from 'next-intl/server';",
  )
}
if (!profile.includes("const t = await getTranslations('errors')")) {
  profile = profile.replace(
    'export async function updateProfile(formData: FormData) {\n  try {\n    const user = await getSession();',
    "export async function updateProfile(formData: FormData) {\n  const t = await getTranslations('errors');\n  try {\n    const user = await getSession();",
  )
  profile = profile.replace(
    'export async function updatePassword(formData: FormData) {\n  try {\n    const user = await getSession();',
    "export async function updatePassword(formData: FormData) {\n  const t = await getTranslations('errors');\n  try {\n    const user = await getSession();",
  )
}
const profileMap = [
  ["return { success: false, error: 'Não autorizado' };", "return { success: false, error: t('unauthorized') };"],
  ["return { success: false, error: 'Nome é obrigatório' };", "return { success: false, error: t('nameRequired') };"],
  ["return { success: false, error: 'Clube em que joga tênis é obrigatório' };", "return { success: false, error: t('clubRequired') };"],
  ["return { success: false, error: 'Estado e cidade são obrigatórios para Brasil' };", "return { success: false, error: t('stateCityBrazil') };"],
  ["return { success: false, error: 'Nome deve ter pelo menos 2 caracteres' };", "return { success: false, error: t('nameMin2') };"],
  ["return { success: false, error: 'Erro ao atualizar perfil' };", "return { success: false, error: t('profileUpdateFailed') };"],
  ["return { success: false, error: 'Você precisa estar logado para alterar a senha' };", "return { success: false, error: t('loginRequiredPassword') };"],
  ["return { success: false, error: 'Digite sua senha atual' };", "return { success: false, error: t('currentPasswordRequired') };"],
  ["return { success: false, error: 'Digite a nova senha' };", "return { success: false, error: t('newPasswordRequired') };"],
  ["return { success: false, error: 'A nova senha deve ter pelo menos 6 caracteres' };", "return { success: false, error: t('passwordMin6') };"],
  ["return { success: false, error: 'A nova senha deve ser diferente da atual' };", "return { success: false, error: t('passwordDifferent') };"],
  ["return { success: false, error: 'Usuário não encontrado' };", "return { success: false, error: t('userNotFound') };"],
  ["return { success: false, error: 'Senha atual incorreta' };", "return { success: false, error: t('currentPasswordWrong') };"],
  ["return { success: true, message: 'Senha alterada com sucesso!' };", "return { success: true, message: t('passwordChanged') };"],
  ["return { success: false, error: 'Erro interno ao atualizar senha. Tente novamente.' };", "return { success: false, error: t('passwordUpdateFailed') };"],
]
for (const [a, b] of profileMap) profile = profile.split(a).join(b)
fs.writeFileSync('lib/actions/profile.ts', profile)
console.log('profile ok')

// --- pools ---
let pools = fs.readFileSync('lib/actions/pools.ts', 'utf8')
if (!pools.includes('getTranslations')) {
  pools = pools.replace(
    "import { revalidatePath } from 'next/cache';",
    "import { revalidatePath } from 'next/cache';\nimport { getTranslations } from 'next-intl/server';",
  )
}
pools = pools.replace(
  /export async function createPoolAction\(formData: FormData\) \{\n  const user/,
  "export async function createPoolAction(formData: FormData) {\n  const t = await getTranslations('errors');\n  const user",
)
pools = pools.replace(
  /export async function joinPoolAction\(poolId: number, password\?: string\) \{\n  const user/,
  "export async function joinPoolAction(poolId: number, password?: string) {\n  const t = await getTranslations('errors');\n  const user",
)
pools = pools.replace(
  /export async function leavePoolAction\(poolId: number\) \{\n  const user/,
  "export async function leavePoolAction(poolId: number) {\n  const t = await getTranslations('errors');\n  const user",
)
pools = pools.replace(
  /export async function updatePoolAction\(poolId: number, formData: FormData\) \{\n  const user/,
  "export async function updatePoolAction(poolId: number, formData: FormData) {\n  const t = await getTranslations('errors');\n  const user",
)
pools = pools.replace(
  /export async function deletePoolAction\(poolId: number\) \{\n  const user/,
  "export async function deletePoolAction(poolId: number) {\n  const t = await getTranslations('errors');\n  const user",
)
pools = pools.replace(
  /export async function getPoolMembersAction\(poolId: number\) \{\n  const user/,
  "export async function getPoolMembersAction(poolId: number) {\n  const t = await getTranslations('errors');\n  const user",
)

const poolMap = [
  ["throw new Error('Não autorizado')", "throw new Error(t('unauthorized'))"],
  ["return { error: 'O nome do grupo é obrigatório' }", "return { error: t('poolNameRequired') }"],
  ["return { error: 'Ocorreu um erro ao criar o grupo' }", "return { error: t('poolCreateFailed') }"],
  ["return { error: 'Grupo não encontrado' }", "return { error: t('poolNotFound') }"],
  ["return { error: 'Este grupo requer senha', needsPassword: true }", "return { error: t('poolPasswordRequired'), needsPassword: true }"],
  ["return { error: 'Senha incorreta' }", "return { error: t('poolWrongPassword') }"],
  ["return { error: 'Ocorreu um erro ao entrar no grupo' }", "return { error: t('poolJoinFailed') }"],
  ["return { error: 'Ocorreu um erro ao sair do grupo' }", "return { error: t('poolLeaveFailed') }"],
  ["return { error: 'Não autorizado' }", "return { error: t('unauthorized') }"],
  ["return { error: 'Ocorreu um erro ao atualizar o grupo' }", "return { error: t('poolUpdateFailed') }"],
  ["return { error: 'Ocorreu um erro ao excluir o grupo' }", "return { error: t('poolDeleteFailed') }"],
  ["return { error: 'Ocorreu um erro ao buscar membros' }", "return { error: t('genericError') }"],
]
for (const [a, b] of poolMap) pools = pools.split(a).join(b)
fs.writeFileSync('lib/actions/pools.ts', pools)
console.log('pools ok')

// --- predictions ---
let pred = fs.readFileSync('lib/actions/predictions.ts', 'utf8')
if (!pred.includes('getTranslations')) {
  pred = pred.replace(
    "import { revalidatePath } from 'next/cache';",
    "import { revalidatePath } from 'next/cache';\nimport { getTranslations } from 'next-intl/server';",
  )
}
if (!pred.includes("const t = await getTranslations('errors')")) {
  pred = pred.replace(
    'async function validateFullBracketPredictions(\n  tournamentId: number,\n  predictions: BracketPredictionInput[],\n): Promise<BracketPredictionInput[]> {',
    "async function validateFullBracketPredictions(\n  tournamentId: number,\n  predictions: BracketPredictionInput[],\n): Promise<BracketPredictionInput[]> {\n  const t = await getTranslations('errors');",
  )
  pred = pred.replace(
    'export async function makePredictionAction(\n  userId: number,\n  bracketMatchId: number,\n  predictedWinnerId: number,\n  tournamentId: number,\n) {',
    "export async function makePredictionAction(\n  userId: number,\n  bracketMatchId: number,\n  predictedWinnerId: number,\n  tournamentId: number,\n) {\n  const t = await getTranslations('errors');",
  )
  pred = pred.replace(
    'export async function saveFullBracketAction(\n  userId: number,\n  tournamentId: number,\n  predictions: BracketPredictionInput[],\n) {',
    "export async function saveFullBracketAction(\n  userId: number,\n  tournamentId: number,\n  predictions: BracketPredictionInput[],\n) {\n  const t = await getTranslations('errors');",
  )
}
const predMap = [
  ["throw new Error('Chaveamento ainda nao disponivel.');", "throw new Error(t('bracketUnavailable'));"],
  ["throw new Error('Palpite invalido.');", "throw new Error(t('invalidPrediction'));"],
  ["throw new Error('Palpite invalido para este torneio.');", "throw new Error(t('invalidPredictionTournament'));"],
  ["throw new Error('Preencha todos os confrontos antes de finalizar.');", "throw new Error(t('fillAllMatches'));"],
  ["throw new Error('Aguarde todos os jogadores da chave serem definidos antes de finalizar.');", "throw new Error(t('waitPlayers'));"],
  ["throw new Error('Revise a chave: ha palpite em confronto sem jogador definido.');", "throw new Error(t('invalidChain'));"],
  ["throw new Error('Você precisa estar inscrito no torneio para fazer palpites');", "throw new Error(t('mustEnroll'));"],
  ["throw new Error('O torneio já começou e não é mais possível fazer palpites');", "throw new Error(t('tournamentStarted'));"],
]
for (const [a, b] of predMap) pred = pred.split(a).join(b)
pred = pred.replace(
  /throw new Error\(\s*'O torneio já começou e não é mais possível alterar os palpites\. Por favor, aperte a tecla F5 para atualizar a página\.',\s*\);/,
  "throw new Error(t('tournamentStartedEdit'));",
)
fs.writeFileSync('lib/actions/predictions.ts', pred)
console.log('predictions ok')

// --- enroll ---
fs.writeFileSync(
  'app/api/tournament/enroll/route.ts',
  `import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isUserEnrolled, enrollUser } from '@/lib/data';
import { getTranslations } from 'next-intl/server';

export async function POST(request: Request) {
  const t = await getTranslations('errors');
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: t('unauthorized') }, { status: 401 });
    }

    const { tournamentId } = await request.json();

    if (!tournamentId) {
      return NextResponse.json({ error: t('invalidData') }, { status: 400 });
    }

    const enrolled = await isUserEnrolled(user.id, tournamentId);
    if (enrolled) {
      return NextResponse.json({ error: t('alreadyEnrolled') }, { status: 400 });
    }

    await enrollUser(user.id, tournamentId);

    return NextResponse.json({ success: true, message: t('enrollSuccess') });
  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ error: t('enrollFailed') }, { status: 500 });
  }
}
`,
)
console.log('enroll ok')
