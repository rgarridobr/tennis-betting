export interface AtpMatchPlayer {
  name: string;
  href: string | null;
  seed: string | null;
  country: string | null;
  type: "PLAYER" | "SEED" | "QUALIFIER" | "WILD_CARD" | "LUCKY_LOSER" | "BYE";
}

export interface AtpMatch {
  matchIndex: number;
  players: AtpMatchPlayer[];
}

export async function fetchAtpDraw(
  atpId: string,
  year: number,
  slug: string,
): Promise<AtpMatch[]> {
  let browser;

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    const playwrightCore = require("playwright-core");
    const setupChromium = require("@sparticuz/chromium-min");
    
    // We download the chromium pack dynamically in serverless environments to bypass size limits.
    const executablePath = await setupChromium.default.executablePath("https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar");

    browser = await playwrightCore.chromium.launch({
      args: setupChromium.default.args,
      executablePath: executablePath,
      headless: setupChromium.default.headless,
    });
  } else {
    // In local development, we can just use the standard playwright package
    const { chromium } = require("playwright");
    browser = await chromium.launch({ headless: true });
  }

  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  try {
    const archiveUrl = `https://www.atptour.com/en/scores/archive/${slug}/${atpId}/${year}/draws`;

    console.log(`Attempting to fetch ATP draw from: ${archiveUrl}`);
    await page.goto(archiveUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    const drawData = await page.evaluate(() => {
      const matches: any[] = [];
      const items = document.querySelectorAll(
        ".draw-round-wrapper:first-child .draw-item, .draw-items-wrapper:first-child .draw-item, div.draw-item",
      );

      items.forEach((item, index) => {
        const players: any[] = [];
        const playerInfos = item.querySelectorAll(
          ".player-info, .draw-player-content",
        );

        playerInfos.forEach((pInfo) => {
          const link = pInfo.querySelector('a[href*="/en/players/"]');
          const name = link?.textContent?.trim();
          const href = link?.getAttribute("href");

          const rawSeedText =
            pInfo.querySelector(".seed")?.textContent ||
            pInfo.querySelector(".name span")?.textContent;

          const seed = rawSeedText?.trim().replace(/[()]/g, "");
          const country = pInfo
            .querySelector(".draw-country-flag img")
            ?.getAttribute("alt")
            ?.trim();

          const isBye = pInfo.textContent?.toLowerCase().includes("bye");

          let type = "PLAYER";
          if (isBye) type = "BYE";
          else if (seed === "Q") type = "QUALIFIER";
          else if (seed === "WC") type = "WILDCARD";
          else if (seed === "LL") type = "LUCKY_LOSER";
          else if (seed && !isNaN(parseInt(seed))) type = "SEED";

          let playerName = isBye ? "BYE" : name || pInfo.textContent?.trim();

          players.push({
            name: playerName,
            href: isBye ? null : href,
            seed: isBye ? null : seed || null,
            country: isBye ? null : country || null,
            type,
          });
        });

        if (players.length > 0) {
          matches.push({
            matchIndex: index,
            players,
          });
        }
      });
      return matches;
    });

    return drawData as AtpMatch[];
  } catch (err) {
    console.error("Failed to fetch ATP draw:", err);
    throw err;
  } finally {
    await browser.close();
  }
}
