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
  const playwrightCore = require("playwright-core");
  let browser;

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    const setupChromium = require("@sparticuz/chromium-min");
    
    // We download the chromium pack dynamically in serverless environments to bypass size limits.
    const executablePath = await setupChromium.executablePath("https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar");

    browser = await playwrightCore.chromium.launch({
      args: setupChromium.args,
      executablePath: executablePath,
      headless: setupChromium.headless,
    });
  } else {
    // In local development, use playwright-core with the locally installed chromium from playwright
    // Run `npx playwright install chromium` locally once to set this up
    browser = await playwrightCore.chromium.launch({ headless: true });
  }

  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  try {
    const archiveUrl = `https://www.atptour.com/en/scores/archive/${slug}/${atpId}/${year}/draws`;

    console.log(`Attempting to fetch ATP draw from: ${archiveUrl}`);
    const response = await page.goto(archiveUrl, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });

    console.log(
      `ATP draw page loaded: status=${response?.status() ?? "unknown"} url=${page.url()}`,
    );

    await page
      .waitForLoadState("networkidle", { timeout: 15000 })
      .catch(() => console.log("ATP draw page did not reach networkidle before extraction."));

    await page
      .waitForSelector(".draw-item, .draw-round-wrapper, .draw-items-wrapper", {
        timeout: 25000,
      })
      .catch(() => console.log("ATP draw selectors were not found before extraction."));

    // The ATP page hydrates the draw client-side. Vercel's cold starts can
    // reach DOMContentLoaded before the draw nodes are attached.
    await page.waitForTimeout(1500);

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
          else if (seed === "Q" || (seed && /^Q\d+$/i.test(seed))) type = "QUALIFIER";
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

    if (drawData.length === 0) {
      const debugInfo = await page.evaluate(() => ({
        title: document.title,
        url: window.location.href,
        bodyText: document.body?.innerText?.slice(0, 500) ?? "",
        drawItems: document.querySelectorAll(".draw-item").length,
        drawWrappers: document.querySelectorAll(".draw-round-wrapper, .draw-items-wrapper").length,
      }));
      console.error("ATP draw extraction returned no matches:", debugInfo);
    }

    return drawData as AtpMatch[];
  } catch (err) {
    console.error("Failed to fetch ATP draw:", err);
    throw err;
  } finally {
    await browser.close();
  }
}
