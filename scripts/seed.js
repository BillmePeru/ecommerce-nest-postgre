const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Check which dist folder exists
  let seedPath;
  if (fs.existsSync(path.join(__dirname, '..', 'dist', 'src', 'seeds', 'seed.js'))) {
    seedPath = 'dist/src/seeds/seed.js';
  } else if (fs.existsSync(path.join(__dirname, '..', 'src', 'dist', 'seeds', 'seed.js'))) {
    seedPath = 'src/dist/seeds/seed.js';
  } else {
    throw new Error('Could not find compiled seed.js file in dist or src/dist');
  }
  
  console.log(`Running seeds from: ${seedPath}`);
  execSync(`node ${seedPath}`, { stdio: 'inherit' });
  
  console.log('Seeding completed successfully!');
} catch (error) {
  console.error('Error during seeding:', error.message);
  process.exit(1);
}