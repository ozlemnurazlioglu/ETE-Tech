const { Client } = require('pg');

const projectRef = 'ofbjpqxdgbrfkzbatmsq';
const pw = 'FHg52QftW3NOjOZp';
const host = `db.${projectRef}.supabase.co`;

async function test() {
  console.log(`Connecting directly to ${host}:5432...`);
  const client = new Client({
    host: host,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: pw,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log(`🎉 SUCCESS connecting directly to ${host}!`);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
  }
}

test();
