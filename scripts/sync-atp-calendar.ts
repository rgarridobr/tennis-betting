import { sql } from '../lib/db';

interface AtpTournament {
  Id: string;
  Name: string;
  Location: string;
  FormattedDate: string;
  Type: string;
  Surface: string;
  SglDrawSize: number;
}

interface AtpDateGroup {
  DisplayDate: string;
  Tournaments: AtpTournament[];
}

interface AtpApiResponse {
  TournamentDates: AtpDateGroup[];
}

function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w]/g, '');
}

function parseAtpDateRange(dateRange: string, displayYear: string): { start: Date; end: Date } {
  // Examples:
  // "2 - 11 January, 2026"
  // "28 December - 4 January, 2026"
  // "25 - 31 May, 2026"

  const yearMatch = dateRange.match(/\d{4}$/);
  const year = yearMatch ? yearMatch[0] : displayYear;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const parts = dateRange.split(',')[0].trim(); // "2 - 11 January" or "28 December - 4 January"

  let startDate: Date;
  let endDate: Date;

  if (parts.includes(' - ')) {
    const rangeParts = parts.split(' - ');
    const endPart = rangeParts[1].trim(); // "11 January" or "4 January"
    const endMonthName = endPart.split(' ').pop()!;
    const endDay = parseInt(endPart.split(' ')[0]);
    const endMonth = months.indexOf(endMonthName);

    endDate = new Date(parseInt(year), endMonth, endDay);

    const startPart = rangeParts[0].trim(); // "2" or "28 December"
    const startMonthPart = startPart.split(' ').pop()!;

    if (months.includes(startMonthPart)) {
      const startDay = parseInt(startPart.split(' ')[0]);
      const startMonth = months.indexOf(startMonthPart);
      // If start month is December and end month is January, start year might be year - 1
      let startYear = parseInt(year);
      if (startMonth === 11 && endMonth === 0) {
        startYear -= 1;
      }
      startDate = new Date(startYear, startMonth, startDay);
    } else {
      // It's just a day number "2"
      const startDay = parseInt(startPart);
      startDate = new Date(parseInt(year), endMonth, startDay);
    }
  } else {
    // Single date (unlikely for tournament but handle just in case)
    const day = parseInt(parts.split(' ')[0]);
    const monthName = parts.split(' ').pop()!;
    const month = months.indexOf(monthName);
    startDate = new Date(parseInt(year), month, day);
    endDate = new Date(parseInt(year), month, day);
  }

  return { start: startDate, end: endDate };
}

function mapAtpTypeToCategory(atpType: string, name: string): string {
  const type = atpType.toUpperCase();
  if (type === 'GS') return 'GRAND_SLAM';
  if (type === '1000') return 'MASTERS_1000';
  if (type === '500') return 'ATP_500';
  if (type === '250') return 'ATP_250';

  // Fallback checks on name
  if (name.includes('Grand Slam')) return 'GRAND_SLAM';
  if (name.includes('Masters 1000')) return 'MASTERS_1000';

  return 'ATP_250'; // Default
}

async function sync() {
  console.log('Starting ATP Calendar Sync...');

  try {
    const response = await fetch('https://www.atptour.com/en/-/tournaments/calendar/tour');
    if (!response.ok) throw new Error(`Failed to fetch ATP calendar: ${response.statusText}`);

    const data = await response.json() as AtpApiResponse;
    const concepts = await sql`SELECT * FROM tournament_concepts`;

    let createdCount = 0;
    let updatedCount = 0;

    for (const group of data.TournamentDates) {
      const displayYear = group.DisplayDate.split(' ').pop()!;

      for (const atp of group.Tournaments) {
        // Skip some exhibition or non-standard events if needed
        if (atp.Type === 'UC' || atp.Type === 'LC') continue; // United Cup, Laver Cup might need special handling

        const category = mapAtpTypeToCategory(atp.Type, atp.Name);
        const { start, end } = parseAtpDateRange(atp.FormattedDate, displayYear);
        const year = start.getFullYear();

        // Location parsing
        const locationParts = atp.Location.split(',').map(s => s.trim());
        const country = locationParts.length > 1 ? locationParts[locationParts.length - 1] : null;
        const city = locationParts.length > 0 ? locationParts[0] : null;

        // Matching Logic
        let matchedConceptId: number | null = null;
        let bestMatch = concepts.find(c =>
          normalizeString(c.name) === normalizeString(atp.Name) ||
          atp.Name.toUpperCase().includes(c.code.replace(/_/g, ' '))
        );

        if (!bestMatch) {
          // Try category + country matching
          bestMatch = concepts.find(c =>
            c.category === category &&
            c.default_country && country &&
            normalizeString(c.default_country) === normalizeString(country)
          );
        }

        if (bestMatch) {
          matchedConceptId = bestMatch.id;
        }

        const code = bestMatch ? bestMatch.code : normalizeString(atp.Name);
        const slug = `${code}-${year}`;

        const needsReview = !matchedConceptId;

        // Upsert Tournament Edition
        const existing = await sql`SELECT id FROM tournaments WHERE slug = ${slug}`;

        if (existing.length > 0) {
          // Update only if source is ATP_API or MANUAL (to avoid overwriting legacy or protected data if rules changed)
          await sql`
            UPDATE tournaments SET
              tournament_concept_id = ${matchedConceptId},
              name = ${atp.Name},
              surface = ${atp.Surface},
              location = ${atp.Location},
              start_date = ${start.toISOString()},
              end_date = ${end.toISOString()},
              category = ${category},
              size = ${atp.SglDrawSize || (bestMatch?.draw_size) || 32},
              source = 'ATP_API',
              api_id = ${atp.Id},
              location_text = ${atp.Location},
              needs_review = ${needsReview},
              year = ${year},
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ${existing[0].id}
          `;
          updatedCount++;
        } else {
          await sql`
            INSERT INTO tournaments (
              tournament_concept_id, name, slug, surface, location,
              start_date, end_date, category, size, status,
              source, api_id, location_text, needs_review, year,
              sets_format
            ) VALUES (
              ${matchedConceptId}, ${atp.Name}, ${slug}, ${atp.Surface}, ${atp.Location},
              ${start.toISOString()}, ${end.toISOString()}, ${category},
              ${atp.SglDrawSize || (bestMatch?.draw_size) || 32}, 'upcoming',
              'ATP_API', ${atp.Id}, ${atp.Location}, ${needsReview}, ${year},
              ${bestMatch?.sets_format || 3}
            )
          `;
          createdCount++;
        }
      }
    }

    console.log(`Sync completed. Created: ${createdCount}, Updated: ${updatedCount}`);

  } catch (error) {
    console.error('Sync failed:', error);
  }
}

sync();
