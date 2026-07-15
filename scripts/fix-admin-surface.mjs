import fs from 'fs'

const files = [
  'app/[locale]/admin/page.tsx',
  'app/[locale]/admin/torneios/page.tsx',
  'app/[locale]/admin/torneios/[id]/page.tsx',
]

for (const f of files) {
  let s = fs.readFileSync(f, 'utf8')
  if (!s.includes('normalizeSurfaceKey')) {
    if (s.includes("from '@/lib/utils'")) {
      s = s.replace(
        "from '@/lib/utils'",
        "from '@/lib/utils'\nimport { normalizeSurfaceKey } from '@/lib/tournament'",
      )
    } else {
      s = "import { normalizeSurfaceKey } from '@/lib/tournament';\n" + s
    }
  }
  s = s.replace(
    /const surfaceKey = tournament\.surface as 'Hard' \| 'Clay' \| 'Grass';/g,
    'const surfaceKey = normalizeSurfaceKey(tournament.surface);',
  )
  fs.writeFileSync(f, s)
  console.log('ok', f)
}
