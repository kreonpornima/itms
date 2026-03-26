import fs from 'fs';
import path from 'path';

const db = process.argv[2];
const validDbs = ['mssql', 'postgresql', 'mysql'];

if (!db || !validDbs.includes(db)) {
  console.error('');
  console.error('  Usage: npm run db:use -- mssql|postgresql|mysql');
  console.error('');
  console.error('  Examples:');
  console.error('    npm run db:use -- postgresql');
  console.error('    npm run db:use -- mssql');
  console.error('    npm run db:use -- mysql');
  console.error('');
  process.exit(1);
}

const prismaDir = path.join(process.cwd(), 'prisma');
const basePath = path.join(prismaDir, 'schema.base.prisma');
const headerPath = path.join(prismaDir, `schema.${db}.prisma`);
const outputPath = path.join(prismaDir, 'schema.prisma');

if (!fs.existsSync(basePath)) {
  console.error('❌ prisma/schema.base.prisma not found');
  process.exit(1);
}
if (!fs.existsSync(headerPath)) {
  console.error(`❌ prisma/schema.${db}.prisma not found`);
  process.exit(1);
}

const header = fs.readFileSync(headerPath, 'utf-8');
const base = fs.readFileSync(basePath, 'utf-8');

fs.writeFileSync(outputPath, `// AUTO-GENERATED — Do not edit directly\n// Database: ${db}\n// Generated: ${new Date().toISOString()}\n\n${header}\n${base}`);

console.log('');
console.log(`  ✅ Switched to ${db.toUpperCase()}`);
console.log(`  📄 prisma/schema.prisma updated`);
console.log('');
console.log('  Next steps:');
console.log('    1. Update DATABASE_URL in .env');
console.log('    2. Run: npm run db:generate');
console.log('    3. Run: npm run db:setup');
console.log('');
