# Test Git Flow

Example project demonstrating the complete git-flow workflow automation system.

## Complete Workflow

### Phase 1: Version Resolution & Release PR Creation
1. **Push to any branch** (except `release/**`) → Triggers [create-release-pr.yml](.github/workflows/create-release-pr.yml)
2. **Release PR created** automatically with:
   - Version metadata resolved from `.github/versions.yml`
   - PR description with YAML configuration
   - Target: `release/{branch-name}` branch

### Phase 2: Build & Pack
When the release PR is merged:
1. **Builds** all packages in dependency order
2. **Packs** artifacts (npm tarballs)
3. **Uploads** to GitHub draft releases
4. **Rewrites workspace dependencies** (workspace:* → actual versions)

### Phase 3: Publish & Release
After successful build & pack:
1. **Publishes** artifacts to registries (GitHub Packages NPM)
2. **Verifies** publication
3. **Finalizes** GitHub releases (draft → published)
4. **Creates git tags** (package-a/v1.0.0, package-b/v1.0.0)

## Version Resolution

Versions use `0.0.0-DEFAULT` placeholder, resolved from `.github/versions.yml`:

```yaml
"0.0.0-DEFAULT": "1.0.0"
"0.0.0-BETA": "1.0.0-beta.0"
```

### Branch Types

**Mainline** (no `/`): `main` → `1.0.0`
**Development** (with `/`): `feature/foo` → `1.0.0-feature.foo.{run-number}`

## Packages

The packages are arranged to exercise every script-combination the test runner supports:

| Package | `github.actions.build` | `github.actions.test` | Depends on |
|---------|:---:|:---:|:---|
| `package-a` | ✅ | — | — |
| `package-b` | ✅ | ✅ | `package-a` |
| `package-c` | — | ✅ | — |

**Mode coverage matrix:**

| Package | `build` mode | `test` mode | `test-optional` mode |
|---------|:---:|:---:|:---:|
| package-a | runs build | skipped (no test) | runs build |
| package-b | runs build | runs test | runs build + test |
| package-c | skipped (no build) | runs test | runs test |

### Testing failure / dependency-skip behaviour

To verify that dependents are skipped when a dependency fails:
1. Temporarily break `package-a`'s build: `echo "exit 1" >> packages/package-a/package.json` *(just example)*
2. Push the branch — `package-b` should be recorded as **skipped** (dependency failed)
3. Revert the change

## Phase 4: Test Runner

Every push triggers [test.yml](.github/workflows/test.yml), which runs the test runner in `test-optional` mode:
- Projects with only `github.actions.build` → build script runs
- Projects with only `github.actions.test` → test script runs  
- Projects with both → both scripts run sequentially
- Change detection skips projects whose files haven't changed since the last pass tag
- Branch deletion cleans up all `test-pass/{branch}/**` tags automatically

To manually trigger a specific mode, use **Actions → Test → Run workflow** and choose `build`, `test`, or `test-optional`.

## Registry Configuration

See [.github/registries.yml](.github/registries.yml):

```yaml
registries:
  github-npm:
    type: npm
    url: https://npm.pkg.github.com
    auth: GITHUB_TOKEN
    scope: "@cpdevtools"
```

## Workflows

### [Test](.github/workflows/test.yml)
```yaml
on:
  push:
    branches-ignore: ['release/**']
  workflow_dispatch:
    inputs:
      mode: { type: choice, options: [test-optional, build, test] }
      rerun-all: { type: boolean }
```

### [Cleanup Test Tags](.github/workflows/test-cleanup.yml)
Deletes all `test-pass/{branch}/**` tags when a branch is deleted.

### [Create Release PR](.github/workflows/create-release-pr.yml)
```yaml
on:
  push:
    branches-ignore:
      - 'release/**'

jobs:
  create-release:
    uses: cpdevtools/git-flow/.github/workflows/create-release-pr.yml@main
    with:
      branch: ${{ github.ref_name }}
      versions-file: .github/versions.yml
```

### [Build, Pack & Publish](.github/workflows/release.yml)
```yaml
on:
  pull_request:
    types: [closed]
    branches:
      - 'release/**'

jobs:
  build-pack-publish:
    if: github.event.pull_request.merged == true
    uses: cpdevtools/git-flow/.github/workflows/build-pack-publish.yml@main
    with:
      pr-number: ${{ github.event.pull_request.number }}
```

## Testing the Flow

1. Create a feature branch: `git checkout -b feature/my-test`
2. Make changes and commit
3. Push: `git push origin feature/my-test`
4. Workflow creates release PR automatically
5. Review and merge the release PR
6. Build, pack, and publish workflow runs automatically
2. Make changes and commit
3. Push: `git push -u origin feature/my-feature`
4. Check GitHub Actions to see the workflow run
5. View the created PR for version metadata

## CLI Tools

This test project uses the `cpdt-gitflow` CLI for build and pack operations:

```json
{
  "scripts": {
    "github.actions.build": "npm run build",
    "github.actions.pack": "cpdt-gitflow pack"
  }
}
```

The CLI automatically:
- Detects project type (NPM/NuGet)
- Creates distribution artifacts
- Generates artifact descriptors
- Supports configuration hooks via `cpdevtools.config.ts`

See [git-flow CLI documentation](https://github.com/cpdevtools/git-flow/blob/main/packages/git-flow/CLI-TOOLS.md) for details.

## Related Repositories

- [cpdevtools/git-flow](https://github.com/cpdevtools/git-flow) - Main workflow and actions
- [cpdevtools/ts-dev-utilities](https://github.com/cpdevtools/ts-dev-utilities) - Utilities library

# RC 81 test
# RC 82 test
# RC 84 test
# RC 86 test
# Test GitHub Packages auth fix
# Test
# Final
