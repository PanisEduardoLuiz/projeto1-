/**
 * Executa migrações SQL versionadas em migrations/V*.sql
 * Uso: node scripts/migrate.js [--status] [--env-file .env.homolog]
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const args = process.argv.slice(2);
const statusOnly = args.includes('--status');
const envFileIdx = args.indexOf('--env-file');
const envFile =
  envFileIdx >= 0 ? args[envFileIdx + 1] : process.env.ENV_FILE || '.env';

require('dotenv').config({ path: path.resolve(process.cwd(), envFile) });

const migrationsDir = path.join(__dirname, '..', 'migrations');

const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'financas',
  password: process.env.DB_PASSWORD || '123',
  port: parseInt(process.env.DB_PORT || '15432', 10),
});

function listMigrationFiles() {
  return fs
    .readdirSync(migrationsDir)
    .filter((f) => /^V\d+__.+\.sql$/i.test(f))
    .sort();
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(100) PRIMARY KEY,
      description VARCHAR(255),
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function getAppliedVersions(client) {
  const { rows } = await client.query(
    'SELECT version FROM schema_migrations ORDER BY version'
  );
  return new Set(rows.map((r) => r.version));
}

function parseVersion(filename) {
  const match = filename.match(/^V(\d+)__(.+)\.sql$/i);
  if (!match) return { version: filename, description: filename };
  return {
    version: `V${match[1]}`,
    description: match[2].replace(/_/g, ' '),
  };
}

async function run() {
  const files = listMigrationFiles();
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedVersions(client);

    const dbName = process.env.DB_NAME || 'financas';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '15432';
    console.log(`Banco: ${dbName} @ ${dbHost}:${dbPort}`);
    console.log(`Arquivo env: ${envFile}`);
    console.log('--- Migrações ---');

    for (const file of files) {
      const { version, description } = parseVersion(file);
      const mark = applied.has(version) ? '[OK]' : '[PENDENTE]';
      console.log(`${mark} ${file} — ${description}`);
    }

    if (statusOnly) return;

    let executed = 0;
    for (const file of files) {
      const { version, description } = parseVersion(file);
      if (applied.has(version)) continue;

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`\nAplicando ${file}...`);

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version, description) VALUES ($1, $2)',
          [version, description]
        );
        await client.query('COMMIT');
        executed++;
        console.log(`  -> ${version} aplicada.`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    if (executed === 0) {
      console.log('\nNenhuma migração pendente.');
    } else {
      console.log(`\n${executed} migração(ões) aplicada(s) com sucesso.`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Erro nas migrações:', err.message);
  process.exit(1);
});
