#!/usr/bin/env node
/**
 * Pack script for package-b
 * Creates artifact.yml descriptor for NPM package
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, '..');

const projectName = process.env.PROJECT_NAME || '@cpdevtools/test-package-b';
const version = process.env.PROJECT_VERSION || '1.0.0';
const outputDir = process.env.ARTIFACT_OUTPUT_DIR || '.artifacts';
const artifactFilename = process.env.ARTIFACT_FILENAME || 'cpdevtools-test-package-b';

// Simulate creating a package tarball
const tarballName = `cpdevtools-test-package-b-${version}.tgz`;
const tarballPath = join(outputDir, tarballName);

// Create output directory
mkdirSync(outputDir, { recursive: true });

// Simulate tarball creation
writeFileSync(tarballPath, 'fake tarball content');
console.log(`✓ Created tarball: ${tarballPath}`);

// Create artifact.yml
const artifactYml = `project: ${projectName}
artifacts:
  - type: npm
    name: ${projectName}
    path: ${tarballName}
    registries: [npm]
`;

const artifactPath = join(outputDir, `${artifactFilename}.artifact.yml`);
writeFileSync(artifactPath, artifactYml);
console.log(`✓ Created artifact descriptor: ${artifactPath}`);
