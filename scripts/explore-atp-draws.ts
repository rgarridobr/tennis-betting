import { chromium } from 'playwright'

async function explore() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  try {
    console.log('Visiting Paris 2024 draws page...')
    await page.goto('https://www.atptour.com/en/scores/current/paris/352/draws', {
        waitUntil: 'networkidle',
    })

    const drawData = await page.evaluate(() => {
        const matches: any[] = [];
        const items = document.querySelectorAll('a[href*="/en/players/"]');
        items.forEach(item => {
            matches.push({
                name: item.textContent?.trim(),
                href: item.getAttribute('href'),
                className: item.className,
                parentTag: item.parentElement?.tagName,
                parentClass: item.parentElement?.className
            });
        });
        return {
            count: items.length,
            matches: matches.slice(0, 50)
        };
    });

    console.log('Found names:', drawData.count);
    console.log('Sample names:', JSON.stringify(drawData.matches, null, 2));

  } catch (err) {
    console.error('Error:', err)
  } finally {
    await browser.close()
  }
}

explore()
