import { sql } from '../lib/db'
import { chromium } from 'playwright'

/* =========================
   TYPES
========================= */

interface AtpTournament {
  Id: string
  Name: string
  Location: string
  FormattedDate: string
  Type: string
  Surface: string
  SglDrawSize: number
}

interface AtpDateGroup {
  DisplayDate: string
  Tournaments: AtpTournament[]
}

interface AtpApiResponse {
  TournamentDates: AtpDateGroup[]
}

/* =========================
   CONSTANTS
========================= */

const VALID_ATP_TYPES = new Set(['GS', '1000', '500', '250'])

const VALID_CATEGORIES = new Set([
  'GRAND_SLAM',
  'MASTERS_1000',
  'ATP_500',
  'ATP_250',
])

/* =========================
   HELPERS
========================= */

function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '_')
}

function parseAtpDateRange(
  dateRange: string,
  displayYear: string,
): { start: Date; end: Date } {
  const yearMatch = dateRange.match(/\d{4}$/)
  const year = yearMatch ? yearMatch[0] : displayYear

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const parts = dateRange.split(',')[0].trim()
  let startDate: Date
  let endDate: Date

  if (parts.includes(' - ')) {
    const [startRaw, endRaw] = parts.split(' - ')
    const [endDayStr, endMonthName] = endRaw.trim().split(' ')
    const endMonth = months.indexOf(endMonthName)

    endDate = new Date(Number(year), endMonth, parseInt(endDayStr, 10))

    const startParts = startRaw.trim().split(' ')
    if (startParts.length === 2) {
      let startYear = Number(year)
      const startMonth = months.indexOf(startParts[1])
      if (startMonth === 11 && endMonth === 0) startYear -= 1
      startDate = new Date(startYear, startMonth, parseInt(startParts[0], 10))
    } else {
      startDate = new Date(
        Number(year),
        endMonth,
        parseInt(startParts[0], 10),
      )
    }
  } else {
    const [dayStr, monthName] = parts.split(' ')
    const month = months.indexOf(monthName)
    startDate = new Date(Number(year), month, parseInt(dayStr, 10))
    endDate = startDate
  }

  return { start: startDate, end: endDate }
}

function mapAtpTypeToCategory(atpType: string): string | null {
  switch (atpType.toUpperCase()) {
    case 'GS':
      return 'GRAND_SLAM'
    case '1000':
      return 'MASTERS_1000'
    case '500':
      return 'ATP_500'
    case '250':
      return 'ATP_250'
    default:
      return null
  }
}

/* =========================
   SYNC
========================= */

async function sync() {
  console.log('Starting ATP Calendar Sync...')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({
    locale: 'en-US',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  try {
    await page.goto('https://www.atptour.com/en/tournaments', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    })

    const data = (await page.evaluate(async () => {
      const res = await fetch('/en/-/tournaments/calendar/tour')
      if (!res.ok) throw new Error('ATP calendar fetch blocked')
      return res.json()
    })) as AtpApiResponse

    const concepts = await sql`SELECT * FROM tournament_concepts`

    const now = new Date()

    let createdCount = 0
    let updatedCount = 0
    let skippedCount = 0

    for (const group of data.TournamentDates) {
      const displayYear = group.DisplayDate.split(' ').pop()!

      for (const atp of group.Tournaments) {
        // 🚫 somente ATP oficiais
        if (!VALID_ATP_TYPES.has(atp.Type)) {
          skippedCount++
          continue
        }

        const category = mapAtpTypeToCategory(atp.Type)
        if (!category || !VALID_CATEGORIES.has(category)) {
          skippedCount++
          continue
        }

        const { start, end } = parseAtpDateRange(
          atp.FormattedDate,
          displayYear,
        )

        // 🚫 TORNEIO JÁ COMEÇOU → IGNORA
        if (start < now) {
          skippedCount++
          continue
        }

        const year = start.getFullYear()

        const locationParts = atp.Location.split(',').map((s) => s.trim())
        const country =
          locationParts.length > 1
            ? locationParts[locationParts.length - 1]
            : null

        let matchedConceptId: number | null = null

        let bestMatch = concepts.find(
          (c) =>
            normalizeString(c.name) === normalizeString(atp.Name) ||
            atp.Name.toUpperCase().includes(c.code.replace(/_/g, ' ')),
        )

        if (!bestMatch && country) {
          bestMatch = concepts.find(
            (c) =>
              c.category === category &&
              c.default_country &&
              normalizeString(c.default_country) === normalizeString(country),
          )
        }

        if (bestMatch) matchedConceptId = bestMatch.id

        const code = bestMatch ? bestMatch.code : normalizeString(atp.Name)
        const slug = `${code}-${year}`
        const needsReview = !matchedConceptId

        const existing = await sql`
          SELECT id FROM tournaments WHERE slug = ${slug}
        `

        if (existing.length > 0) {
          await sql`
            UPDATE tournaments SET
              tournament_concept_id = ${matchedConceptId},
              name = ${atp.Name},
              surface = ${atp.Surface},
              location = ${atp.Location},
              start_date = ${start.toISOString()},
              end_date = ${end.toISOString()},
              category = ${category},
              size = ${atp.SglDrawSize || bestMatch?.draw_size || 32},
              source = 'ATP_API',
              api_id = ${atp.Id},
              location_text = ${atp.Location},
              needs_review = ${needsReview},
              year = ${year},
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ${existing[0].id}
          `
          updatedCount++
        } else {
          await sql`
            INSERT INTO tournaments (
              tournament_concept_id,
              name,
              slug,
              surface,
              location,
              start_date,
              end_date,
              category,
              size,
              status,
              source,
              api_id,
              location_text,
              needs_review,
              year,
              sets_format
            ) VALUES (
              ${matchedConceptId},
              ${atp.Name},
              ${slug},
              ${atp.Surface},
              ${atp.Location},
              ${start.toISOString()},
              ${end.toISOString()},
              ${category},
              ${atp.SglDrawSize || bestMatch?.draw_size || 32},
              'upcoming',
              'ATP_API',
              ${atp.Id},
              ${atp.Location},
              ${needsReview},
              ${year},
              ${bestMatch?.sets_format || 3}
            )
          `
          createdCount++
        }
      }
    }

    console.log(
      `Sync completed. Created: ${createdCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`,
    )
  } catch (err) {
    console.error('Sync failed:', err)
  } finally {
    await browser.close()
  }
}

sync()