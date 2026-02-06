import { sql } from './db'
import { Tournament } from './data'

export interface DrawEntry {
  player_id: number | null
  entry_type: string
  seed?: number
  is_bye?: boolean
  player_country?: string | null
}

// ATP Seed Positioning Rules
// These are the lines in the draw sheet where seeds can be placed.
export function getSeedPositions(bracketSize: number, seedsCount: number): Map<number, number[]> {
  const positions = new Map<number, number[]>();

  if (bracketSize === 32) {
    positions.set(2, [1, 32]);
    positions.set(4, [9, 24]);
    positions.set(8, [8, 16, 17, 25]);
    positions.set(16, [4, 5, 12, 13, 20, 21, 28, 29]);
  } else if (bracketSize === 64) {
    positions.set(2, [1, 64]);
    positions.set(4, [17, 48]);
    positions.set(8, [16, 32, 33, 49]);
    positions.set(16, [8, 9, 24, 25, 40, 41, 56, 57]);
  } else if (bracketSize === 128) {
    positions.set(2, [1, 128]);
    positions.set(4, [33, 96]);
    positions.set(8, [32, 64, 65, 97]);
    positions.set(16, [16, 17, 48, 49, 80, 81, 112, 113]);
    positions.set(32, [8, 9, 24, 25, 40, 41, 56, 57, 72, 73, 88, 89, 104, 105, 120, 121]);
  } else {
    // Fallback/Generic power of 2 logic
    positions.set(2, [1, bracketSize]);
    positions.set(4, [Math.floor(bracketSize * 0.25) + 1, Math.floor(bracketSize * 0.75)]);
    // This is less accurate for higher counts but works as fallback
  }

  return positions;
}

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
  if (!tournament) throw new Error('Torneio não encontrado');

  const entries = await sql`
    SELECT te.*, p.name as player_name, p.country as player_country
    FROM tournament_entries te
    JOIN players p ON te.player_id = p.id
    WHERE te.tournament_id = ${tournamentId}
  `;

  const bracketSize = tournament.bracket_size || 128;
  const powerOf2Size = Math.pow(2, Math.ceil(Math.log2(bracketSize)));
  const rng = new Random(randomSeed);

  // Validation: registered players must match the tournament configuration
  const totalPlayers = entries.length;
  const configPlayers = (tournament.direct_entries_count || 0) +
                       (tournament.qualifiers_count || 0) +
                       (tournament.wildcards_count || 0);

  if (totalPlayers !== configPlayers) {
    throw new Error(`Número de inscritos (${totalPlayers}) não coincide com a configuração do torneio (${configPlayers} vagas).`);
  }

  const draw = new Array<DrawEntry | null>(powerOf2Size).fill(null);

  // 1. Position Seeds
  // Sort entries to find seeds by ranking at cutoff
  const seeds = entries
    .filter(e => e.entry_type === 'ENTRY_SEED')
    .sort((a, b) => (a.ranking_at_cutoff || 9999) - (b.ranking_at_cutoff || 9999));

  const seedPositionsMap = getSeedPositions(powerOf2Size, seeds.length);

  // Seed 1 & 2
  if (seeds.length >= 1) {
    draw[0] = { player_id: seeds[0].player_id, entry_type: 'ENTRY_SEED', seed: 1, player_country: seeds[0].player_country };
  }
  if (seeds.length >= 2) {
    draw[powerOf2Size - 1] = { player_id: seeds[1].player_id, entry_type: 'ENTRY_SEED', seed: 2, player_country: seeds[1].player_country };
  }

  // Helper to place seeds in segments
  const placeSeedSegment = (limit: number, startIdx: number) => {
    const count = limit / 2;
    const possiblePositions = seedPositionsMap.get(limit);
    if (!possiblePositions || seeds.length < limit) return;

    // We only take the positions that haven't been filled yet
    const availablePos = possiblePositions.filter(p => draw[p - 1] === null);
    const shuffledPos = rng.shuffle(availablePos);

    for (let i = 0; i < count; i++) {
      const seedIdx = startIdx + i;
      if (seeds[seedIdx]) {
        draw[shuffledPos[i] - 1] = {
          player_id: seeds[seedIdx].player_id,
          entry_type: 'ENTRY_SEED',
          seed: seedIdx + 1,
          player_country: seeds[seedIdx].player_country
        };
      }
    }
  };

  if (seeds.length >= 4) placeSeedSegment(4, 2);
  if (seeds.length >= 8) placeSeedSegment(8, 4);
  if (seeds.length >= 16) placeSeedSegment(16, 8);
  if (seeds.length >= 32) placeSeedSegment(32, 16);

  // 2. Assign Byes
  const byesCount = tournament.byes_count || 0;
  if (byesCount > 0) {
    // Byes go to top seeds
    for (let i = 0; i < byesCount; i++) {
      const seedNum = i + 1;
      const seedPos = draw.findIndex(d => d?.seed === seedNum);
      if (seedPos !== -1) {
        const opponentPos = seedPos % 2 === 0 ? seedPos + 1 : seedPos - 1;
        draw[opponentPos] = { player_id: null, entry_type: 'BYE', is_bye: true };
      }
    }
  }

  // 3. Pool remaining players
  const pools = {
    qualifiers: rng.shuffle(entries.filter(e => e.entry_type === 'ENTRY_QUALIFIER')),
    wildcards: rng.shuffle(entries.filter(e => e.entry_type === 'ENTRY_WILDCARD')),
    directs: rng.shuffle(entries.filter(e => e.entry_type === 'ENTRY_DIRECT')),
    others: rng.shuffle(entries.filter(e => !['ENTRY_SEED', 'ENTRY_QUALIFIER', 'ENTRY_WILDCARD', 'ENTRY_DIRECT'].includes(e.entry_type)))
  };

  const allRemaining = [...pools.qualifiers, ...pools.wildcards, ...pools.directs, ...pools.others];

  // 4. Restricted Placement
  const emptySlots = [];
  for (let i = 0; i < powerOf2Size; i++) {
    if (draw[i] === null) emptySlots.push(i);
  }

  // Any slots remaining that exceed our expected players + explicitly set byes
  // are treated as extra byes to reach the powerOf2Size.
  const slotsNeededForPlayers = allRemaining.length;
  if (emptySlots.length > slotsNeededForPlayers) {
    const extraByesCount = emptySlots.length - slotsNeededForPlayers;
    const slotsForExtraByes = rng.shuffle([...emptySlots]).slice(0, extraByesCount);
    for (const slot of slotsForExtraByes) {
      draw[slot] = { player_id: null, entry_type: 'BYE', is_bye: true };
      const idx = emptySlots.indexOf(slot);
      if (idx !== -1) emptySlots.splice(idx, 1);
    }
  }

  // To avoid Qualifiers facing each other, we first identify "free matches" (both slots empty)
  // and "semi-filled matches" (one slot empty, one taken by seed/bye/other).

  const getMatchOpponent = (idx: number) => idx % 2 === 0 ? draw[idx + 1] : draw[idx - 1];

  let remainingQualifiers = [...pools.qualifiers];
  let remainingOthers = [...pools.wildcards, ...pools.directs, ...pools.others];

  // Logic:
  // 1. Place Qualifiers in slots where the opponent is NOT a Qualifier.
  // 2. Try to avoid country clashes.

  for (const player of allRemaining) {
    const isQualifier = player.entry_type === 'ENTRY_QUALIFIER';

    // Find valid slots
    let bestSlot = -1;
    let candidateSlots = emptySlots.filter(s => draw[s] === null);

    // Shuffle candidates for randomness
    candidateSlots = rng.shuffle(candidateSlots);

    // Filter slots to avoid Qualifiers facing each other
    if (isQualifier) {
      const filtered = candidateSlots.filter(s => {
        const opponent = getMatchOpponent(s);
        return opponent?.entry_type !== 'ENTRY_QUALIFIER';
      });
      if (filtered.length > 0) candidateSlots = filtered;
    }

    // Best effort: avoid same country in R1
    const countryFiltered = candidateSlots.filter(s => {
      const opponent = getMatchOpponent(s);
      return !opponent || !opponent.player_country || opponent.player_country !== player.player_country;
    });

    if (countryFiltered.length > 0) {
      bestSlot = countryFiltered[0];
    } else {
      bestSlot = candidateSlots[0];
    }

    if (bestSlot !== -1) {
      draw[bestSlot] = {
        player_id: player.player_id,
        entry_type: player.entry_type,
        player_country: player.player_country
      };
      // Remove from emptySlots
      const idxInEmpty = emptySlots.indexOf(bestSlot);
      if (idxInEmpty !== -1) emptySlots.splice(idxInEmpty, 1);
    }
  }

  // 5. Persist to bracket_matches
  await sql`DELETE FROM bracket_matches WHERE tournament_id = ${tournamentId}`;

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
      // Could be waiting for a qualifier winner if we had a qualy bracket,
      // but here we assume main draw is populated with "ENTRY_QUALIFIER" placeholder if not yet known.
      status = 'pending';
    }

    await sql`
      INSERT INTO bracket_matches (tournament_id, round, position, player1_id, player2_id, winner_id, status)
      VALUES (${tournamentId}, 1, ${i + 1}, ${p1?.player_id}, ${p2?.player_id}, ${winner_id}, ${status})
    `;
  }

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

  // Advance R1 bye winners
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

  await sql`
    UPDATE tournaments
    SET draw_random_seed = ${randomSeed}, draw_generated_at = NOW(), status = 'active'
    WHERE id = ${tournamentId}
  `;
}
