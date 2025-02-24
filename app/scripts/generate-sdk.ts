/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../src/sdk');
const SPEC_FILE = path.join(__dirname, '../../', 'swagger-spec.json');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

try {
  execSync(`npx @openapitools/openapi-generator-cli generate \
    -i ${SPEC_FILE} \
    -g typescript-axios \
    -o ${OUTPUT_DIR} \
    --additional-properties=supportES6=true,withInterfaces=true`, 
    { stdio: 'inherit' }
  );
  console.log('SDK generated successfully');
} catch (error) {
  console.error("There was an error generating the SDK: ", error);
  process.exit(1);
}
