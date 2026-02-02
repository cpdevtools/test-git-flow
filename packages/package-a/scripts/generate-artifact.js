const { writeArtifact } = require('@cpdevtools/ts-dev-utilities/artifacts');
const { readFileSync, mkdirSync, copyFileSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

async function generateArtifact() {
  const packageJsonPath = join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  
  const tarballName = `${packageJson.name.replace('@', '').replace('/', '-')}-${packageJson.version}.tgz`;
  
  console.log(`Generating artifact for ${packageJson.name}@${packageJson.version}`);
  console.log(`Artifact output directory: ${process.env.ARTIFACT_OUTPUT_DIR || '.artifacts'}`);
  console.log(`Tarball name: ${tarballName}`);
  
  const packageDir = join(__dirname, '..');
  const artifactOutputDir = process.env.ARTIFACT_OUTPUT_DIR || join(packageDir, '../..', '.artifacts');
  
  // Set environment variables for writeArtifact
  const artifactFilename = packageJson.name.replace(/@/g, '').replace(/\//g, '-');
  process.env.ARTIFACT_OUTPUT_DIR = artifactOutputDir;
  process.env.PROJECT_NAME = artifactFilename;
  
  // Run pnpm pack
  execSync(`pnpm pack`, { cwd: packageDir, stdio: 'inherit' });
  
  // Copy the tarball to .artifacts directory
  const tarballSource = join(packageDir, tarballName);
  const tarballDest = join(artifactOutputDir, tarballName);
  mkdirSync(artifactOutputDir, { recursive: true });
  copyFileSync(tarballSource, tarballDest);
  console.log(`✓ Copied tarball to ${tarballDest}`);
  
  await writeArtifact({
    project: packageJson.name,
    artifacts: [
      {
        type: 'npm',
        name: packageJson.name,
        path: `.artifacts/${tarballName}`,
        registries: ['github-npm']
      }
    ]
  });
  
  console.log('✅ Artifact descriptor generated');
}

generateArtifact().catch(console.error);
