import { pool } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

async function migrate() {
  console.log('🔄 Starting database migration...');

  try {
    // Try to read schema file from multiple possible locations
    let schema: string;
    const possiblePaths = [
      path.join(__dirname, 'schema.sql'),
      path.join(__dirname, '..', 'db', 'schema.sql'),
      path.join(process.cwd(), 'src', 'db', 'schema.sql'),
    ];

    let schemaPath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        schemaPath = p;
        break;
      }
    }

    if (!schemaPath) {
      console.error('❌ Schema file not found. Checked:');
      possiblePaths.forEach(p => console.error(`   - ${p}`));
      process.exit(0); // Exit gracefully to allow manual migration
    }

    schema = fs.readFileSync(schemaPath, 'utf-8');
    console.log(`📄 Found schema at: ${schemaPath}`);

    await pool.query(schema);
    console.log('✅ Database migration completed successfully');
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);

    // If tables already exist, that's okay
    if (error.code === '42P07' || error.message?.includes('already exists')) {
      console.log('ℹ️  Tables already exist, skipping migration');
      await pool.end();
      process.exit(0);
    }

    await pool.end();
    process.exit(0); // Exit gracefully even on error to allow server to start
  }
}

migrate();
