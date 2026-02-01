import { writeArtifact } from '@cpdevtools/ts-dev-utilities/artifacts';
import { readFileSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateArtifact() {
  const packageJsonPath = join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  
  const tarballName = `${packageJson.name.replace('@', '').replace('/', '-')}-${packageJson.version}.tgz`;
  
  console.log(`Generating artifact for ${packageJson.name}@${packageJson.version}`);
  console.log(`Artifact output directory: ${process.env.ARTIFACT_OUTPUT_DIR || '.artifacts'}`);
  console.log(`Tarball name: ${tarballName}`);
  
  // Set environment variables
  const artifactFilename = packageJson.name.replace(/@/g, '').replace(/\//g, '-');
  process.env.PROJECT_NAME = artifactFilename;
  
  const packageDir = join(__dirname, '..');
  const artifactOutputDir = process.env.ARTIFACT_OUTPUT_DIR || join(packageDir, '../..', '.artifacts');
  
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
