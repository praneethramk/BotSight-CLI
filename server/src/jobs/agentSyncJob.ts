import axios from 'axios';
import { query } from '../db';

export async function syncAgents(): Promise<void> {
  try {
    const agentsUrl = process.env.AGENTS_REMOTE_URL;
    
    if (!agentsUrl) {
      console.warn('AGENTS_REMOTE_URL not set, skipping agent sync');
      return;
    }

    // Fetch agents from remote URL
    const response = await axios.get(agentsUrl);
    const agents = response.data;

    if (!Array.isArray(agents)) {
      throw new Error('Expected agents data to be an array');
    }

    // Process each agent
    for (const agent of agents) {
      const { name, pattern, example_ua } = agent;
      
      if (!name || !pattern) {
        console.warn('Skipping agent with missing name or pattern:', agent);
        continue;
      }

      // Upsert agent
      await query(
        `INSERT INTO agents (name, pattern, example_ua, source, last_seen)
         VALUES ($1, $2, $3, $4, now())
         ON CONFLICT (name) 
         DO UPDATE SET 
           pattern = EXCLUDED.pattern,
           example_ua = EXCLUDED.example_ua,
           updated_at = now()`,
        [name, pattern, example_ua, 'remote']
      );
    }

    console.log(`Successfully synced ${agents.length} agents`);
  } catch (error) {
    console.error('Error syncing agents:', error);
  }
}

// Schedule the job to run every 6 hours
export function scheduleAgentSync(): void {
  // Run immediately
  syncAgents();
  
  // Schedule to run every 6 hours (21600000 ms)
  setInterval(syncAgents, 6 * 60 * 60 * 1000);
}