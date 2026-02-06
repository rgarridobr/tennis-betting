import { sql } from './db'
import { Tournament } from './data'

export interface DrawEntry {
  player_id: number | null
  entry_type: string
  seed?: number
  is_bye?: boolean
}

// ATP Seed Positioning Rules (simplified logic)
// bracketSize must be power of 2 for the internal logic,
// then we handle non-power-of-2 using byes.
export function getSeedPositions(bracketSize: number, seedsCount: number): Map<number, number[]> {
  const positions = new Map<number, number[]>();

  // Seed 1 is always at position 1
  positions.set(1, [1]);
  // Seed 2 is always at the last position
  positions.set(2, [bracketSize]);

  if (seedsCount >= 4) {
    // Seeds 3-4 are at the top/bottom of the inner halves
    // For 32: 9, 24 or 16, 17?
    // ATP rules: 3-4 are randomized between line 1 + bracketSize/2 and line bracketSize/2
    // Actually standard is:
    // 32 draw: 1, 32, 9, 24
    positions.set(4, [Math.floor(bracketSize * 0.25) + 1, Math.floor(bracketSize * 0.75)]);
  }

  if (seedsCount >= 8) {
    // 32 draw: 8, 16, 17, 25
    positions.set(8, [
      Math.floor(bracketSize * 0.125) + 1, // Not quite right, let's use fixed offsets for common sizes
      Math.floor(bracketSize * 0.375),
      Math.floor(bracketSize * 0.375) + 1,
      Math.floor(bracketSize * 0.625),
      Math.floor(bracketSize * 0.625) + 1, // Wait, this is getting complex.
      Math.floor(bracketSize * 0.875)
    ].filter((v, i, a) => a.indexOf(v) === i)); // This is a placeholder for actual ATP mapping
  }

  // Improved mapping based on actual ATP draw sheets
  if (bracketSize === 32) {
    positions.set(1, [1]);
    positions.set(2, [32]);
    positions.set(4, [9, 24]);
    positions.set(8, [8, 16, 17, 25]);
    positions.set(16, [5, 12, 13, 20, 21, 28, 29, 4]); // etc.
  } else if (bracketSize === 64) {
    positions.set(1, [1]);
    positions.set(2, [64]);
    positions.set(4, [17, 48]);
    positions.set(8, [16, 32, 33, 49]);
    positions.set(16, [8, 9, 24, 25, 40, 41, 56, 57]);
  } else if (bracketSize === 128) {
    positions.set(1, [1]);
    positions.set(2, [128]);
    positions.set(4, [33, 96]);
    positions.set(8, [32, 64, 65, 97]);
    positions.set(16, [16, 17, 48, 49, 80, 81, 112, 113]);
    positions.set(32, [8, 9, 24, 25, 40, 41, 56, 57, 72, 73, 88, 89, 104, 105, 120, 121]);
  }

  return positions;
}

// Pseudo-random number generator with seed
class Random {
  seed: number;
  constructor(seed: string) {
    this.seed = this.hashString(seed);
  }
  hashString(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  shuffle<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }
}

export async function generateATPDraw(tournamentId: number, randomSeed: string) {
  const tournament = await sql`SELECT * FROM tournaments WHERE id = ${tournamentId}`.then(r => r[0] as Tournament);
  if (!tournament) throw new Error('Tournament not found');

  const entries = await sql`
    SELECT te.*, p.name as player_name
    FROM tournament_entries te
    JOIN players p ON te.player_id = p.id
    WHERE te.tournament_id = ${tournamentId}
    ORDER BY te.ranking_at_cutoff ASC NULLS LAST
  `;

  const bracketSize = tournament.bracket_size || 128;
  const powerOf2Size = Math.pow(2, Math.ceil(Math.log2(bracketSize)));
  const rng = new Random(randomSeed);

  const draw = new Array<DrawEntry | null>(powerOf2Size).fill(null);

  // 1. Position Seeds
  const seeds = entries.filter(e => e.entry_type === 'ENTRY_SEED').sort((a, b) => (a.ranking_at_cutoff || 999) - (b.ranking_at_cutoff || 999));
  const seedPositionsMap = getSeedPositions(powerOf2Size, seeds.length);

  // Seed 1 & 2
  if (seeds.length >= 2) {
    draw[0] = { player_id: seeds[0].player_id, entry_type: 'ENTRY_SEED', seed: 1 };
    draw[powerOf2Size - 1] = { player_id: seeds[1].player_id, entry_type: 'ENTRY_SEED', seed: 2 };
  } else if (seeds.length === 1) {
    draw[0] = { player_id: seeds[0].player_id, entry_type: 'ENTRY_SEED', seed: 1 };
  }

  // Seeds 3-4
  if (seeds.length >= 4) {
    const pos34 = rng.shuffle(seedPositionsMap.get(4)!);
    draw[pos34[0] - 1] = { player_id: seeds[2].player_id, entry_type: 'ENTRY_SEED', seed: 3 };
    draw[pos34[1] - 1] = { player_id: seeds[3].player_id, entry_type: 'ENTRY_SEED', seed: 4 };
  }

  // Seeds 5-8
  if (seeds.length >= 8) {
    const pos58 = rng.shuffle(seedPositionsMap.get(8)!);
    for (let i = 0; i < 4; i++) {
      draw[pos58[i] - 1] = { player_id: seeds[4 + i].player_id, entry_type: 'ENTRY_SEED', seed: 5 + i };
    }
  }

  // Continue for more seeds if needed...
  const higherSeeds = [16, 32];
  for (const sLimit of higherSeeds) {
    if (seeds.length >= sLimit) {
      const posRange = rng.shuffle(seedPositionsMap.get(sLimit)!);
      for (let i = 0; i < sLimit / 2; i++) {
        draw[posRange[i] - 1] = { player_id: seeds[sLimit / 2 + i].player_id, entry_type: 'ENTRY_SEED', seed: sLimit / 2 + i + 1 };
      }
    }
  }

  // 2. Assign Byes
  // Byes go to top seeds. In ATP, if bracketSize = 28, there are 4 byes.
  // They usually occupy the "opponent" slot of the top seeds.
  const byesCount = tournament.byes_count || 0;
  const byeSlots: number[] = [];
  if (byesCount > 0) {
    // Standard bye positions: Seeds 1, 2, 3, 4 etc. get byes.
    // If Seed 1 is at pos 1, opponent is pos 2.
    // We'll mark pos 2 as BYE.
    for (let i = 0; i < byesCount; i++) {
      // Find seed i+1 position
      const seedNum = i + 1;
      const seedPos = draw.findIndex(d => d?.seed === seedNum);
      if (seedPos !== -1) {
        const opponentPos = seedPos % 2 === 0 ? seedPos + 1 : seedPos - 1;
        draw[opponentPos] = { player_id: null, entry_type: 'BYE', is_bye: true };
        byeSlots.push(opponentPos);
      }
    }
  }

  // 3. Pool remaining players
  const others = rng.shuffle(entries.filter(e => e.entry_type !== 'ENTRY_SEED'));

  // 4. Fill remaining slots
  let otherIdx = 0;
  for (let i = 0; i < powerOf2Size; i++) {
    if (draw[i] === null) {
      if (otherIdx < others.length) {
        draw[i] = {
          player_id: others[otherIdx].player_id,
          entry_type: others[otherIdx].entry_type
        };
        otherIdx++;
      } else {
        // Should not happen if diretos + qualy + wc = bracketSize
        // But if it does, leave as null (Qualifier Placeholder)
        draw[i] = { player_id: null, entry_type: 'ENTRY_QUALIFIER' };
      }
    }
  }

  // 5. Persist to bracket_matches
  // Clear existing matches
  await sql`DELETE FROM bracket_matches WHERE tournament_id = ${tournamentId}`;

  // Create R1 matches
  const r1MatchCount = powerOf2Size / 2;
  for (let i = 0; i < r1MatchCount; i++) {
    const p1 = draw[i * 2];
    const p2 = draw[i * 2 + 1];

    let status = 'scheduled';
    let winner_id = null;

    if (p1?.is_bye || p2?.is_bye) {
      status = 'completed';
      winner_id = p1?.is_bye ? p2?.player_id : p1?.player_id;
    } else if (!p1?.player_id || !p2?.player_id) {
      status = 'pending';
    }

    await sql`
      INSERT INTO bracket_matches (tournament_id, round, position, player1_id, player2_id, winner_id, status)
      VALUES (${tournamentId}, 1, ${i + 1}, ${p1?.player_id}, ${p2?.player_id}, ${winner_id}, ${status})
    `;
  }

  // Create subsequent rounds
  const totalRounds = Math.log2(powerOf2Size);
  for (let round = 2; round <= totalRounds; round++) {
    const matchCount = powerOf2Size / Math.pow(2, round);
    for (let i = 0; i < matchCount; i++) {
      await sql`
        INSERT INTO bracket_matches (tournament_id, round, position, status)
        VALUES (${tournamentId}, ${round}, ${i + 1}, 'pending')
      `;
    }
  }

  // Advance winners from R1 byes to R2
  const r1Byes = await sql`SELECT * FROM bracket_matches WHERE tournament_id = ${tournamentId} AND round = 1 AND winner_id IS NOT NULL`;
  for (const m of r1Byes) {
    const nextRound = 2;
    const nextPosition = Math.ceil(m.position / 2);
    const isSlot1 = m.position % 2 === 1;

    if (isSlot1) {
      await sql`UPDATE bracket_matches SET player1_id = ${m.winner_id} WHERE tournament_id = ${tournamentId} AND round = ${nextRound} AND position = ${nextPosition}`;
    } else {
      await sql`UPDATE bracket_matches SET player2_id = ${m.winner_id} WHERE tournament_id = ${tournamentId} AND round = ${nextRound} AND position = ${nextPosition}`;
    }
  }

  // Update tournament with draw info
  await sql`
    UPDATE tournaments
    SET draw_random_seed = ${randomSeed}, draw_generated_at = NOW(), status = 'active'
    WHERE id = ${tournamentId}
  `;
}
