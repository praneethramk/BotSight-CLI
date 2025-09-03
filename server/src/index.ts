import fastify from 'fastify';
import telemetryRoutes from './routes/telemetry';
import configRoutes from './routes/config';
import simulateRoutes from './routes/simulate';
import { scheduleAgentSync } from './jobs/agentSyncJob';

const app = fastify({ logger: true });

// Register routes
app.register(telemetryRoutes);
app.register(configRoutes);
app.register(simulateRoutes);

// Schedule agent sync job
scheduleAgentSync();

const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || 'localhost';

app.listen({ port, host }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});