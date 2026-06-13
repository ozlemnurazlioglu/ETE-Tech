const { Client } = require('pg');

const regions = [
  'aws-0-eu-central-1', // Frankfurt
  'aws-0-eu-west-1',    // Ireland
  'aws-0-eu-west-2',    // London
  'aws-0-eu-west-3',    // Paris
  'aws-0-us-east-1',    // N. Virginia
  'aws-0-us-east-2',    // Ohio
  'aws-0-us-west-1',    // N. California
  'aws-0-us-west-2',    // Oregon
  'aws-0-ap-southeast-1', // Singapore
  'aws-0-ap-southeast-2', // Sydney
  'aws-0-ap-northeast-1', // Tokyo
  'aws-0-ap-south-1',    // Mumbai
  'aws-0-ca-central-1'   // Canada Central
];

async function test() {
  for (const reg of regions) {
    const host = `${reg}.pooler.supabase.com`;
    console.log(`Testing host: ${host}...`);
    const client = new Client({
      host: host,
      port: 5432,
      database: 'postgres',
      user: 'postgres.mfeuzagqvxriihtklqcp',
      password: '9%n&pLScG5spPHc',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    try {
      await client.connect();
      console.log(`✅ SUCCESS connecting to: ${host}`);
      await client.end();
      process.exit(0);
    } catch (err) {
      console.log(`❌ FAILED for ${host}: ${err.message}`);
    }
  }
  console.log('All regions tested.');
}

test();
