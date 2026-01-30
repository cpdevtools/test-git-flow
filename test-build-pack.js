#!/usr/bin/env node
/**
 * Test script for Build & Pack workflow
 * Simulates a PR with release metadata
 */

import { runBuildPack } from '@cpdevtools/git-flow/build-pack';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = __dirname; // Current directory is the workspace root

// Mock PR body with release metadata
const mockPRBody = `
# Release PR

This is a test release PR.

\`\`\`yaml
runNumber: 1
sha: test-abc1234
timestamp: ${new Date().toISOString()}
sourceBranch: develop
projects:
  - name: @cpdevtools/test-package-b
    version: 1.0.0
    prerelease: false
    cwd: packages/package-b
\`\`\`

## Changes
- Initial release of package-b
`;

async function test() {
  const artifactOutputDir = join(workspaceRoot, '.artifacts');
  console.log('🧪 Testing Build & Pack Workflow\n');
  console.log('Workspace:', workspaceRoot);
  console.log('Artifact output:', artifactOutputDir, '\n');

  try {
    const result = await runBuildPack(
      {
        workspaceRoot,
        artifactOutputDir,
        githubToken: process.env.GITHUB_TOKEN || 'mock-token',
        prNumber: 1,
        sha: 'test-abc1234',
        runNumber: 1,
        skipUpload: process.env.SKIP_UPLOAD === 'true',
      },
      mockPRBody
    );

    console.log('\n' + '='.repeat(80));
    console.log('📊 Test Results:');
    console.log('='.repeat(80));
    console.log(`Built:    ${result.built.join(', ')}`);
    console.log(`Packed:   ${result.packed.join(', ')}`);
    console.log(`Uploaded: ${result.uploaded.join(', ')}`);
    console.log(`Skipped:  ${result.skipped.join(', ')}`);
    console.log(`Failed:   ${result.failed.length > 0 ? result.failed.map(f => f.project).join(', ') : 'none'}`);
    console.log('='.repeat(80));

    if (result.failed.length > 0) {
      console.error('\n❌ Test FAILED\n');
      for (const failure of result.failed) {
        console.error(`  ${failure.project}: ${failure.error}`);
      }
      process.exit(1);
    }

    console.log('\n✅ Test PASSED\n');
  } catch (error) {
    console.error('\n❌ Test FAILED with error:\n');
    console.error(error);
    process.exit(1);
  }
}

test();
