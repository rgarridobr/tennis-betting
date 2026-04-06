import { chromium } from 'playwright'

export interface AtpMatchPlayer {
  name: string
  href: string | null
  seed: string | null
  country: string | null
  type: 'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'LUCKY_LOSER' | 'BYE'
}

export interface AtpMatch {
  matchIndex: number
  players: AtpMatchPlayer[]
}

export async function fetchAtpDraw(atpId: string, year: number, slug: string): Promise<AtpMatch[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  try {
    // Attempt current year draws first
    const currentUrl = `https://www.atptour.com/en/scores/current/${slug}/${atpId}/draws`
    const archiveUrl = `https://www.atptour.com/en/scores/archive/${slug}/${atpId}/${year}/draws`

    console.log(`Attempting to fetch ATP draw from: ${currentUrl}`)
    let response;
    try {
      response = await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
    } catch (e) {
      console.log(`Current draw timeout or error, trying archive...`)
    }

    // If not found or redirected to a non-draw page, try archive
    if (!response || response.status() >= 400 || !page.url().includes('/draws')) {
      console.log(`Current draw not found or error, attempting archive: ${archiveUrl}`)
      await page.goto(archiveUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
    }

    const drawData = await page.evaluate(() => {
        const matches: any[] = []
        const items = document.querySelectorAll('.draw-round-wrapper:first-child .draw-item, .draw-items-wrapper:first-child .draw-item, div.draw-item')
        items.forEach((item, index) => {
            const players: any[] = []
            const playerInfos = item.querySelectorAll('.player-info, .draw-player-content')

            playerInfos.forEach(pInfo => {
                const link = pInfo.querySelector('a[href*="/en/players/"]')
                const name = link?.textContent?.trim()
                const href = link?.getAttribute('href')
                const seedElement = pInfo.querySelector('.seed, .draw-seed');
                const seed = seedElement?.textContent?.trim().replace(/[()]/g, '');
                const country = pInfo.querySelector('.draw-country-flag img')?.getAttribute('alt')?.trim()

                const isBye = pInfo.textContent?.toLowerCase().includes('bye')

                let type = 'PLAYER'
                if (isBye) type = 'BYE'
                else if (seed === 'Q') type = 'QUALIFIER'
                else if (seed === 'WC') type = 'WILDCARD'
                else if (seed === 'LL') type = 'LUCKY_LOSER'
                else if (seed && !isNaN(parseInt(seed))) type = 'SEED'

                players.push({
                    name: isBye ? 'BYE' : (name || pInfo.textContent?.trim()),
                    href: isBye ? null : href,
                    seed: isBye ? null : (seed || null),
                    country: isBye ? null : (country || null),
                    type
                })
            })

            if (players.length > 0) {
                matches.push({
                    matchIndex: index,
                    players
                })
            }
        })
        return matches
    })

    return drawData as AtpMatch[]
  } catch (err) {
    console.error('Failed to fetch ATP draw:', err)
    throw err
  } finally {
    await browser.close()
  }
}
