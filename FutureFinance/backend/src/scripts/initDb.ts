import fs from 'fs';
import path from 'path';
import { pool, testConnection } from '../config/db.js';

async function run() {
  console.log('[Script] Running PostgreSQL Database Initialization...');
  const connected = await testConnection();
  if (!connected) {
    console.error('[Error] Could not connect to local PostgreSQL. Ensure your local PostgreSQL service is running.');
    process.exit(1);
  }

  const files = [
    '../../database/postgres/schema.sql',
    '../../database/postgres/views.sql',
    '../../database/postgres/procedures.sql',
    '../../database/postgres/triggers.sql',
    '../../database/postgres/seed.sql'
  ];

  for (const relPath of files) {
    const fullPath = path.resolve(process.cwd(), relPath);
    if (fs.existsSync(fullPath)) {
      console.log(`[Script] Executing ${path.basename(fullPath)}...`);
      const sql = fs.readFileSync(fullPath, 'utf8');
      await pool.query(sql);
      console.log(`[Script] ✓ ${path.basename(fullPath)} completed.`);
    }
  }

  console.log('[Script] All database scripts executed successfully.');
  await pool.end();
}

run().catch((err) => {
  console.error('[Error]:', err);
  process.exit(1);
});
