import { FastifyInstance, FastifyRequest } from 'fastify';
import { query } from '../db';

interface SimulateRequest extends FastifyRequest {
  body: {
    siteId?: string;
    url?: string;
    agentName?: string;
  };
}

export default async function simulateRoutes(fastify: FastifyInstance) {
  fastify.post('/v1/simulate', async (request: SimulateRequest, reply) => {
    try {
      const { siteId, url, agentName } = request.body || {};
      
      // Validate required parameters
      if (!siteId || !url || !agentName) {
        return reply.status(400).send({ error: 'Missing required parameters: siteId, url, agentName' });
      }

      // Insert job row
      const ins = await query(
        `INSERT INTO simulations (site_id, url, agent_name, status, created_at) 
         VALUES ($1, $2, $3, 'queued', now()) RETURNING id`,
        [siteId, url, agentName]
      );
      
      const jobId = ins.rows[0].id;

      // Enqueue to Redis/Bull queue (pseudo-code - would need actual queue implementation)
      // await fastify.bullQueue.add('simulate', { jobId });

      return reply.status(202).send({ jobId, message: 'Simulation job queued successfully' });
    } catch (error) {
      console.error('Error queuing simulation:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}