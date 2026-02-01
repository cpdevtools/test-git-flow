const { writeArtifact } = require('@cpdevtools/ts-dev-utilities/artifacts');
const { readFileSync, mkdirSync, copyFileSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

async function generateArtifact() {
  const packageJsonPath = join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  
  const tarballName = `${packageJson.name.replace('@', '').replace('/', '-')}-${packageJson.version}.tgz`;
  
  console.log(`Generating artifact for ${packageJson.name}@${packageJson.version}`);
  console.log(`Artifact output directory: ${process.env.ARTIFACT_OUTPUT_DIR || '.artifacts'}`);
  console.log(`Tarball name: ${tarballName}`);
  
  // Set environment variables
  const artifactFilename = packageJson.name.replace(/@/g, '').replace(/\//g, '-');
  process.env.PROJECT_NAME = artifactFilename;
  
  const artifactOutputDir = process.env.ARTIFACT_OUTPUT_DIR || join(process.cwd(), '../..', '.artifacts');
  
  // Run pnpm pack
  execSync(`pnpm pack`, { cwd: process.cwd(), stdio: 'inherit' });
  
  // Copy the tarball to .artifacts directory
  const tarballSource = join(process.cwd(), tarballName);
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
        registries: ['github-packages']
      }
    ]
  });
  
  console.log('✅ Artifact descriptor generated');
}

generateArtifact().catch(console.error);
