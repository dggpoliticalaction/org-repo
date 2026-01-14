import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const wasRunning = (containerName) => {
  try {
    const output = execSync(`docker ps -f name=${containerName} --format \"{{.Names}}\""`).toString().trim();
    return output.includes(containerName);
  } catch (error) {
    return false;
  }
};

const pragmaticPapersWasRunning = wasRunning('pragmatic-papers-postgres-dev');
const dggPoliticalActionWasRunning = wasRunning('dgg-political-action-postgres-dev');

console.log('This script is for development use only.');
console.log('It will permanently delete the data in the development databases.');

rl.question('Are you sure you want to reset the development databases? This action is irreversible. (y/n) ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    try {
      console.log('Ensuring database containers are running...');
      execSync('docker compose --file ./docker-compose.dev.yml up -d --wait', { stdio: 'inherit' });

      console.log('Resetting pragmatic-papers database...');
      const dropPragmaticPapersCmd = 'docker exec pragmatic-papers-postgres-dev psql -U postgres -c \'DROP DATABASE IF EXISTS "pragmatic-papers" WITH (FORCE);\'';
      execSync(dropPragmaticPapersCmd, { stdio: 'inherit' });
      const createPragmaticPapersCmd = 'docker exec pragmatic-papers-postgres-dev psql -U postgres -c \'CREATE DATABASE "pragmatic-papers";\'';
      execSync(createPragmaticPapersCmd, { stdio: 'inherit' });


      console.log('Resetting dgg-political-action database...');
      const dropDggPoliticalActionCmd = 'docker exec dgg-political-action-postgres-dev psql -U postgres -c \'DROP DATABASE IF EXISTS "dgg-political-action" WITH (FORCE);\'';
      execSync(dropDggPoliticalActionCmd, { stdio: 'inherit' });
      const createDggPoliticalActionCmd = 'docker exec dgg-political-action-postgres-dev psql -U postgres -c \'CREATE DATABASE "dgg-political-action";\'';
      execSync(createDggPoliticalActionCmd, { stdio: 'inherit' });


      console.log('Databases have been reset.');

      if (!pragmaticPapersWasRunning && !dggPoliticalActionWasRunning) {
        console.log('Stopping database containers as they were not running before.');
        execSync('docker compose --file ./docker-compose.dev.yml down', { stdio: 'inherit' });
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  } else {
    console.log('Database reset cancelled.');
  }
  rl.close();
});