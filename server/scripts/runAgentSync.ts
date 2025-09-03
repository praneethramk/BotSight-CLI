import { syncAgents } from '../src/jobs/agentSyncJob';

async function runAgentSync() {
  console.log('Running agent sync job...');
  await syncAgents();
  console.log('Agent sync job completed');
}

runAgentSync();