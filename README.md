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

- **package-a**: Base package (published to GitHub Packages)
- **package-b**: Depends on package-a (demonstrates workspace dependency rewriting)

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
