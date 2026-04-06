
import { fetchAtpDraw } from '../lib/services/atp-draw';

async function test() {
  const atpId = '404'; // Indian Wells
  const year = 2024;
  const slug = 'indian-wells';
  
  console.log(`Testing draw sync for ${slug} (${year}, ${atpId})...`);
  try {
    const matches = await fetchAtpDraw(atpId, year, slug);
    console.log(`Found ${matches.length} matches in R1.`);
    matches.slice(0, 5).forEach((m, i) => {
      console.log(`Match ${i+1}:`);
      m.players.forEach(p => {
        console.log(` - ${p.name} [${p.type}] Seed: ${p.seed} Country: ${p.country}`);
      });
    });
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
