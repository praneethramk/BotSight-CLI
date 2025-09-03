import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '../src/db';

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // Read the DDL file
    const ddlPath = join(__dirname, '../db/ddl/01_create_tables.sql');
    const ddl = readFileSync(ddlPath, 'utf8');
    
    // Split by semicolon to get individual statements
    const statements = ddl
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.startsWith('--') || statement.trim().length === 0) {
        // Skip comments and empty statements
        continue;
      }
      
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await query(statement);
    }
    
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();