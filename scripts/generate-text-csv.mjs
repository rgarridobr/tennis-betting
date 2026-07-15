import fs from 'fs'

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
const en = Object.fromEntries(flatten(JSON.parse(fs.readFileSync('messages/en.json', 'utf8'))))
const rows = [['area', 'key', 'portugues_pt', 'english_en']]
for (const [k, v] of flatten(pt)) {
  rows.push([k.split('.')[0], k, v, en[k] ?? ''])
}
const csv = rows
  .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
  .join('\n')
fs.mkdirSync('docs', { recursive: true })
fs.writeFileSync('docs/inventario-textos-i18n.csv', csv, 'utf8')
console.log('CSV rows', rows.length - 1)
