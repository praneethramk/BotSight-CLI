import { query } from '../src/db';

async function seedDatabase() {
  try {
    // Insert initial agents
    await query(`
      INSERT INTO agents (name, pattern, example_ua, source, last_seen)
      VALUES
        ('GPTBot', 'GPTBot', 'GPTBot/1.0', 'builtin', now()),
        ('PerplexityBot', 'Perplexity', 'PerplexityBot/1.0', 'builtin', now()),
        ('ClaudeBot', 'Claude', 'Claude-Web/1.0', 'builtin', now()),
        ('GeminiBot', 'Gemini', 'Gemini/1.0', 'builtin', now())
      ON CONFLICT DO NOTHING;
    `);

    // Insert a test site
    await query(`
      INSERT INTO sites (site_id, canonical_url, owner_email)
      VALUES ('demo-site', 'https://demo.example', 'ops@demo.example')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();