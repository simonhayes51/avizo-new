import { pool } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

async function migrate() {
  try {
    const schema = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf-8'
    );

    await pool.query(schema);
    console.log('✅ Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
