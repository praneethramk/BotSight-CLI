import { runSimulation } from '../src/workers/simulateWorker';

async function startWorker() {
  console.log('Starting simulation worker...');
  
  // In a real implementation, this would listen to a queue
  // For now, we'll just show how to call the function
  console.log('Worker is ready to process simulation jobs');
  console.log('To process a job, call: runSimulation({ jobId: 1 })');
}

startWorker();