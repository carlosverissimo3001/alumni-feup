import path from 'path';
import chokidar from 'chokidar';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the swagger spec file - it's in the root directory
const swaggerPath = path.resolve(__dirname, '../../swagger-spec.json');

console.log(`Watching for changes in ${swaggerPath}...`);

chokidar.watch(swaggerPath, {
  ignoreInitial: true,
}).on('all', (event: string) => {
  if (event === 'add' || event === 'change') {
    console.log('Swagger spec changed, generating SDK...');
    try {
      execSync(`npx ts-node ${__dirname}/generate-sdk.ts`, { stdio: 'inherit' });
      console.log('SDK generated successfully');
    } catch (error) {
      console.log('Error generating SDK:', error);
    }
  }
});

