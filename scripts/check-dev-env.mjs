import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const modeArg = process.argv.find((arg) => arg.startsWith('--mode='));
const mode = modeArg?.split('=')[1] ?? 'all';

const webPort = 3001;

const REQUIRED_FILES = {
  all: ['.env', 'packages/database/.env', 'apps/api/.env.local', 'apps/web/.env.local'],
  api: ['apps/api/.env.local', 'packages/database/.env'],
  web: ['apps/web/.env.local'],
};

const CREATE_HINTS = {
  '.env': 'cp .env.example .env',
  'packages/database/.env': 'cp packages/database/.env.example packages/database/.env',
  'apps/api/.env.local': 'cp apps/api/.env.example apps/api/.env.local',
  'apps/web/.env.local': 'cp apps/web/.env.example apps/web/.env.local',
};

function readEnvFile(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return {};
  }

  return fs
    .readFileSync(absolutePath, 'utf8')
    .split('\n')
    .reduce((acc, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        return acc;
      }

      const separatorIndex = trimmed.indexOf('=');

      if (separatorIndex === -1) {
        return acc;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      acc[key] = value;
      return acc;
    }, {});
}

function fail(message, detailLines = []) {
  console.error(`\n[dev-check] ${message}`);
  for (const line of detailLines) {
    console.error(`[dev-check] ${line}`);
  }
  process.exit(1);
}

function warn(message) {
  console.warn(`[dev-check] Warning: ${message}`);
}

const requiredFiles = REQUIRED_FILES[mode] ?? REQUIRED_FILES.all;
const missingFiles = requiredFiles.filter(
  (relativePath) => !fs.existsSync(path.join(repoRoot, relativePath)),
);

if (missingFiles.length > 0) {
  fail('Missing required local env files.', [
    ...missingFiles.map((relativePath) => `${relativePath} -> ${CREATE_HINTS[relativePath]}`),
  ]);
}

const apiEnv = readEnvFile('apps/api/.env.local');
const webEnv = readEnvFile('apps/web/.env.local');
const databaseEnv = readEnvFile('packages/database/.env');

const apiPort = Number(apiEnv.PORT ?? 3000);
const apiBaseUrl = `http://localhost:${apiPort}/api/v1`;
const webUrl = `http://localhost:${webPort}`;
const configuredApiBaseUrl = webEnv.BUDGETFLOW_API_URL;
const configuredCorsOrigins = (apiEnv.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if ((mode === 'all' || mode === 'web') && !configuredApiBaseUrl) {
  fail('apps/web/.env.local must define BUDGETFLOW_API_URL.', [
    'Example: BUDGETFLOW_API_URL="http://localhost:3000/api/v1"',
  ]);
}

if (
  (mode === 'all' || mode === 'web') &&
  configuredApiBaseUrl &&
  configuredApiBaseUrl !== apiBaseUrl
) {
  warn(
    `apps/web/.env.local points to ${configuredApiBaseUrl}, while apps/api/.env.local PORT implies ${apiBaseUrl}.`,
  );
}

if (
  (mode === 'all' || mode === 'api') &&
  configuredCorsOrigins.length > 0 &&
  !configuredCorsOrigins.includes(webUrl)
) {
  warn(
    `apps/api/.env.local CORS_ORIGINS does not include ${webUrl}. Current value: ${configuredCorsOrigins.join(', ')}`,
  );
}

if ((mode === 'all' || mode === 'api') && !databaseEnv.DATABASE_URL) {
  fail('packages/database/.env must define DATABASE_URL.');
}

if ((mode === 'all' || mode === 'api') && !apiEnv.DATABASE_URL) {
  fail('apps/api/.env.local must define DATABASE_URL.');
}

console.log('\n[dev-check] Local development configuration looks valid.');
if (mode === 'all') {
  console.log(`[dev-check] Web: ${webUrl}`);
  console.log(`[dev-check] API: http://localhost:${apiPort}`);
  console.log(`[dev-check] Swagger: http://localhost:${apiPort}/docs`);
}
