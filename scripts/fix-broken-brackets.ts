
import { sql } from '../lib/db'
import { resetTournamentToStandby } from '../lib/admin'

async function main() {
  console.log('Finding tournaments with non-power-of-2 sizes or mismatched bracket structures...')

  // 1. Identify tournaments where size is not a power of 2
  // or where the number of matches in round 1 doesn't match size/2
  const tournaments = await sql`
    SELECT id, name, size
    FROM tournaments
    WHERE status NOT IN ('finished', 'completed')
  `

  let fixCount = 0
  for (const t of tournaments) {
    const size = Number(t.size)
    const isPowerOfTwo = size > 0 && (size & (size - 1)) === 0

    const firstRoundMatches = await sql`
      SELECT COUNT(*) as count FROM bracket_matches
      WHERE tournament_id = ${t.id} AND round = 1
    `
    const matchCount = Number(firstRoundMatches[0].count)
    const expectedMatchCount = isPowerOfTwo ? size / 2 : 0

    if (!isPowerOfTwo || (matchCount > 0 && matchCount !== expectedMatchCount)) {
      console.log(`Fixing tournament: ${t.name} (ID: ${t.id})`)
      console.log(`- Current size: ${size}`)
      console.log(`- Current R1 matches: ${matchCount}`)

      // Calculate correct power-of-2 size
      const correctedSize = Math.pow(2, Math.ceil(Math.log2(size)))
      console.log(`- Corrected size: ${correctedSize}`)

      // Reset tournament (clears matches and predictions)
      await resetTournamentToStandby(t.id)

      // Update size to power of 2
      await sql`UPDATE tournaments SET size = ${correctedSize} WHERE id = ${t.id}`

      fixCount++
    }
  }

  console.log(`Cleanup completed. Fixed ${fixCount} tournaments.`)
  process.exit(0)
}

main().catch(err => {
  console.error('Cleanup failed:', err)
  process.exit(1)
})
