#!/usr/bin/env node
import { discoverProjects } from '@cpdevtools/ts-dev-utilities/project';

const projects = await discoverProjects({ cwd: '.' });
console.log('Discovered projects:');
projects.forEach(p => {
  console.log(`  - name: "${p.name}"`);
  console.log(`    path: ${p.directory}`);
});
