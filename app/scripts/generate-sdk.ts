/* eslint-disable @typescript-eslint/no-require-imports */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../src/sdk');
const SPEC_FILE = path.join(__dirname, '../../', 'swagger-spec.json');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

try {
  execSync(`npx @openapitools/openapi-generator-cli generate \
    -i ${SPEC_FILE} \
    -g typescript-fetch \
    -o ${OUTPUT_DIR} \
    --minimal-update \
    --additional-properties=supportES6=true,withInterfaces=true`, 
    { stdio: 'inherit' }
  );
  console.log('SDK generated successfully');
} catch (error) {
  console.error("There was an error generating the SDK: ", error);
  process.exit(1);
}
