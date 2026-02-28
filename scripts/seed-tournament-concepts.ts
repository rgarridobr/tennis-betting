import { sql } from '../lib/db';

const CONCEPTS = [
  // Grand Slams
  {
    code: 'AUSTRALIAN_OPEN',
    name: 'Australian Open',
    category: 'GRAND_SLAM',
    surface: 'Hard',
    default_country: 'Australia',
    default_city: 'Melbourne',
    sets_format: 5,
    draw_size: 128
  },
  {
    code: 'ROLAND_GARROS',
    name: 'Roland Garros',
    category: 'GRAND_SLAM',
    surface: 'Clay',
    default_country: 'France',
    default_city: 'Paris',
    sets_format: 5,
    draw_size: 128
  },
  {
    code: 'WIMBLEDON',
    name: 'Wimbledon',
    category: 'GRAND_SLAM',
    surface: 'Grass',
    default_country: 'United Kingdom',
    default_city: 'London',
    sets_format: 5,
    draw_size: 128
  },
  {
    code: 'US_OPEN',
    name: 'US Open',
    category: 'GRAND_SLAM',
    surface: 'Hard',
    default_country: 'USA',
    default_city: 'New York',
    sets_format: 5,
    draw_size: 128
  },

  // Masters 1000
  {
    code: 'INDIAN_WELLS',
    name: 'Indian Wells',
    category: 'MASTERS_1000',
    surface: 'Hard',
    default_country: 'USA',
    default_city: 'Indian Wells',
    sets_format: 3,
    draw_size: 96
  },
  {
    code: 'MIAMI_OPEN',
    name: 'Miami Open',
    category: 'MASTERS_1000',
    surface: 'Hard',
    default_country: 'USA',
    default_city: 'Miami',
    sets_format: 3,
    draw_size: 96
  },
  {
    code: 'MONTE_CARLO',
    name: 'Monte Carlo Masters',
    category: 'MASTERS_1000',
    surface: 'Clay',
    default_country: 'Monaco',
    default_city: 'Monte Carlo',
    sets_format: 3,
    draw_size: 56
  },
  {
    code: 'MADRID_OPEN',
    name: 'Madrid Open',
    category: 'MASTERS_1000',
    surface: 'Clay',
    default_country: 'Spain',
    default_city: 'Madrid',
    sets_format: 3,
    draw_size: 96
  },
  {
    code: 'ROME_MASTERS',
    name: 'Rome Masters',
    category: 'MASTERS_1000',
    surface: 'Clay',
    default_country: 'Italy',
    default_city: 'Rome',
    sets_format: 3,
    draw_size: 96
  },
  {
    code: 'CANADA_MASTERS',
    name: 'Canada Masters',
    category: 'MASTERS_1000',
    surface: 'Hard',
    default_country: 'Canada',
    default_city: 'Montreal/Toronto',
    sets_format: 3,
    draw_size: 56
  },
  {
    code: 'CINCINNATI_MASTERS',
    name: 'Cincinnati Masters',
    category: 'MASTERS_1000',
    surface: 'Hard',
    default_country: 'USA',
    default_city: 'Cincinnati',
    sets_format: 3,
    draw_size: 56
  },
  {
    code: 'SHANGHAI_MASTERS',
    name: 'Shanghai Masters',
    category: 'MASTERS_1000',
    surface: 'Hard',
    default_country: 'China',
    default_city: 'Shanghai',
    sets_format: 3,
    draw_size: 96
  },
  {
    code: 'PARIS_MASTERS',
    name: 'Paris Masters',
    category: 'MASTERS_1000',
    surface: 'Hard',
    default_country: 'France',
    default_city: 'Paris',
    sets_format: 3,
    draw_size: 56
  },

  // ATP 500 (principais)
  {
    code: 'RIO_OPEN',
    name: 'Rio Open',
    category: 'ATP_500',
    surface: 'Clay',
    default_country: 'Brazil',
    default_city: 'Rio de Janeiro',
    sets_format: 3,
    draw_size: 32
  },
  {
    code: 'ACAPULCO',
    name: 'Acapulco',
    category: 'ATP_500',
    surface: 'Hard',
    default_country: 'Mexico',
    default_city: 'Acapulco',
    sets_format: 3,
    draw_size: 32
  },
  {
    code: 'DUBAI',
    name: 'Dubai',
    category: 'ATP_500',
    surface: 'Hard',
    default_country: 'UAE',
    default_city: 'Dubai',
    sets_format: 3,
    draw_size: 32
  },
  {
    code: 'BARCELONA',
    name: 'Barcelona',
    category: 'ATP_500',
    surface: 'Clay',
    default_country: 'Spain',
    default_city: 'Barcelona',
    sets_format: 3,
    draw_size: 48
  },
  {
    code: 'HAMBURG',
    name: 'Hamburg',
    category: 'ATP_500',
    surface: 'Clay',
    default_country: 'Germany',
    default_city: 'Hamburg',
    sets_format: 3,
    draw_size: 32
  },
  {
    code: 'WASHINGTON',
    name: 'Washington',
    category: 'ATP_500',
    surface: 'Hard',
    default_country: 'USA',
    default_city: 'Washington',
    sets_format: 3,
    draw_size: 48
  },
  {
    code: 'VIENNA',
    name: 'Vienna',
    category: 'ATP_500',
    surface: 'Hard',
    default_country: 'Austria',
    default_city: 'Vienna',
    sets_format: 3,
    draw_size: 32
  },
  {
    code: 'BEIJING',
    name: 'Beijing',
    category: 'ATP_500',
    surface: 'Hard',
    default_country: 'China',
    default_city: 'Beijing',
    sets_format: 3,
    draw_size: 32
  },
  {
    code: 'TOKYO',
    name: 'Tokyo',
    category: 'ATP_500',
    surface: 'Hard',
    default_country: 'Japan',
    default_city: 'Tokyo',
    sets_format: 3,
    draw_size: 32
  },
  {
    code: 'BASEL',
    name: 'Basel',
    category: 'ATP_500',
    surface: 'Hard',
    default_country: 'Switzerland',
    default_city: 'Basel',
    sets_format: 3,
    draw_size: 32
  }
];

async function seed() {
  try {
    console.log('Seeding tournament concepts...');
    for (const concept of CONCEPTS) {
      await sql`
        INSERT INTO tournament_concepts (
          code, name, category, surface, default_country, default_city, sets_format, draw_size
        ) VALUES (
          ${concept.code}, ${concept.name}, ${concept.category}, ${concept.surface},
          ${concept.default_country}, ${concept.default_city}, ${concept.sets_format}, ${concept.draw_size}
        )
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          surface = EXCLUDED.surface,
          default_country = EXCLUDED.default_country,
          default_city = EXCLUDED.default_city,
          sets_format = EXCLUDED.sets_format,
          draw_size = EXCLUDED.draw_size;
      `;
      console.log(`- Seeded: ${concept.name}`);
    }
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

seed();
