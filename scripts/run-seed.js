// Load environment variables first
require('dotenv').config();

// Now run the TypeScript seed file
const { execSync } = require('child_process');

console.log('🔧 Loading environment variables...');
console.log(`📊 DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env file');
  process.exit(1);
}

console.log('🚀 Running seed script...\n');

try {
  execSync('tsx scripts/seed-khule-satsang.ts', {
    stdio: 'inherit',
    env: process.env
  });
} catch (error) {
  console.error('❌ Seed script failed');
  process.exit(1);
}
