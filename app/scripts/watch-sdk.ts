/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const chokidar = require('chokidar');
const childProcess = require('child_process');
const { EVENTS } = require('chokidar/handler.js');

const { execSync } = childProcess;

const swaggerPath = path.resolve(__dirname, '../swagger-spec.json');

console.log('Watching for Swagger spec changes...');

chokidar.watch(swaggerPath, {
  ignoreInitial: true,
}).on('all', (event: string) => {
  if (event === EVENTS.ADD || event === EVENTS.CHANGE) {
    console.log('Swagger spec changed, generating SDK...');
    try {
      execSync(`node ${__dirname}/generate-sdk.js`, { stdio: 'inherit' });
      console.log('SDK generated successfully');
    } catch (error) {
      console.log('Error generating SDK:', error);
    }
  }
});

