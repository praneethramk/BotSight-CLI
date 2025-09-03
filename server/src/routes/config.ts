import { FastifyInstance, FastifyRequest } from 'fastify';
import { query } from '../db';

interface ConfigRequest extends FastifyRequest {
  params: {
    siteId: string;
  };
}

export default async function configRoutes(fastify: FastifyInstance) {
  fastify.get('/v1/config/:siteId', async (request: ConfigRequest, reply) => {
    try {
      const { siteId } = request.params;
      
      const res = await query(
        'SELECT config_json, snippet_version FROM sites WHERE site_id=$1', 
        [siteId]
      );
      
      if (!res.rowCount) {
        return reply.status(404).send({ error: 'Site not found' });
      }
      
      return reply.send(res.rows[0]);
    } catch (error) {
      console.error('Error fetching config:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}