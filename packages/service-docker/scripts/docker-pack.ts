/**
 * docker-pack.ts
 *
 * Pack script for test-service-docker. Called via `github.actions.pack`.
 *
 * 1. Logs in to GHCR
 * 2. Tags and pushes the local image with a temp tag
 * 3. Captures the image digest
 * 4. Writes the artifact descriptor via writeArtifact()
 *
 * Required env vars (set by the build-pack orchestrator):
 *   PROJECT_NAME         — safe package name (used by writeArtifact)
 *   PROJECT_VERSION      — semver version string
 *   ARTIFACT_OUTPUT_DIR  — where to write the .artifact.yml
 *   GITHUB_TOKEN         — token for GHCR auth
 *   GITHUB_ACTOR         — username for GHCR auth
 *   GITHUB_SHA           — full commit SHA (first 7 chars used as temp tag suffix)
 */

import { execSync } from 'node:child_process';
import { writeArtifact } from '@cpdevtools/ts-dev-utilities';

const imageName = 'ghcr.io/cpdevtools/test-service';
const localTag = 'test-service:latest';

const version = process.env.PROJECT_VERSION;
const sha = process.env.GITHUB_SHA;
const token = process.env.GITHUB_TOKEN;
const actor = process.env.GITHUB_ACTOR;

if (!version) throw new Error('PROJECT_VERSION is required');
if (!sha) throw new Error('GITHUB_SHA is required');
if (!token) throw new Error('GITHUB_TOKEN is required');
if (!actor) throw new Error('GITHUB_ACTOR is required');

const tempTag = `temp-${sha.slice(0, 7)}`;
const fullTempImage = `${imageName}:${tempTag}`;

// Authenticate
execSync(`echo ${token} | docker login ghcr.io -u ${actor} --password-stdin`, { stdio: 'inherit' });

// Tag and push
execSync(`docker tag ${localTag} ${fullTempImage}`, { stdio: 'inherit' });
execSync(`docker push ${fullTempImage}`, { stdio: 'inherit' });

// Get digest
const repoDigest = execSync(
  `docker inspect --format='{{index .RepoDigests 0}}' ${fullTempImage}`,
).toString().trim().replace(/^'|'$/g, '');
const digest = repoDigest.includes('@') ? repoDigest.split('@')[1] : repoDigest;

console.log(`  ✓ Pushed ${fullTempImage}`);
console.log(`  ✓ Digest: ${digest}`);

await writeArtifact({
  project: process.env.PROJECT_NAME!,
  artifacts: [
    {
      type: 'docker',
      name: imageName,
      tempTag,
      finalTag: version,
      digest,
      registry: 'ghcr.io',
      pushedAt: new Date().toISOString(),
      registries: ['ghcr'],
    },
  ],
});
