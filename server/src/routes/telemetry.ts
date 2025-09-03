import { FastifyInstance, FastifyRequest } from 'fastify';
import { query } from '../db';

// Helper function to flatten nested objects
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  let flattened: Record<string, any> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }
  
  return flattened;
}

// Helper function to normalize URL (strip query string and fragment)
function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.origin + urlObj.pathname;
  } catch (e) {
    // If URL is invalid, return as is
    return url;
  }
}

export default async function telemetryRoutes(fastify: FastifyInstance) {
  fastify.post('/v1/telemetry', async (request: FastifyRequest, reply) => {
    try {
      const body: any = request.body || {};
      
      // Extract required fields
      const siteId = (body.siteId || '').toString();
      if (!siteId) {
        return reply.status(400).send({ error: 'siteId required' });
      }

      // Normalize URL: strip query/fragment
      const url = normalizeUrl(body.url || request.headers.referer || '');
      if (!url) {
        return reply.status(400).send({ error: 'url required' });
      }

      // Get user agent
      const ua = (body.ua || request.headers['user-agent'] || '').toString();

      // Find agent match
      let agentId = null;
      if (ua) {
        const agentRes = await query('SELECT id FROM agents WHERE $1 ~* pattern LIMIT 1', [ua]);
        agentId = agentRes.rows[0]?.id || null;
      }

      // Store visit
      const insertRes = await query(
        `INSERT INTO visits(site_id, url, ua, agent_id, extracted_summary, llms_txt, raw_meta)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [
          siteId, 
          url, 
          ua, 
          agentId, 
          body.extractedSummary || null, 
          body.llmsTxt || null, 
          body.rawMeta || null
        ]
      );

      const visitId = insertRes.rows[0].id;
      
      // Break out fields (flatten extractedSummary)
      const summary = body.extractedSummary || {};
      const flat = flattenObject(summary);
      
      for (const [k, v] of Object.entries(flat)) {
        if (v !== null && v !== undefined) {
          await query(
            'INSERT INTO extracted_fields(visit_id, field_name, field_value) VALUES ($1,$2,$3)', 
            [visitId, k, String(v)]
          );
        }
      }

      // If no agent, upsert unknown candidate
      if (!agentId && ua) {
        await query(`
          INSERT INTO unknown_agent_candidates (ua, sample_site, count, first_seen, last_seen)
          VALUES ($1,$2,1,now(),now())
          ON CONFLICT (ua) DO UPDATE SET count = unknown_agent_candidates.count + 1, last_seen = now()
        `, [ua, siteId]);
      }
      
      return reply.send({ ok: true, visitId });
    } catch (error) {
      console.error('Error processing telemetry:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}