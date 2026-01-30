# Test Git Flow

Example project demonstrating the git-flow workflow automation.

## How It Works

1. **Push to any branch** → Workflow triggers
2. **Release PR created** with version metadata
3. **Phase 2 (Build & Pack)** runs when PR is merged
4. **Phase 3 (Publish)** publishes to registries

## Version Resolution

Versions use `0.0.0-DEFAULT` placeholder, resolved from `.github/versions.yml`:

```yaml
"0.0.0-DEFAULT": "1.0.0"
```

### Branch Types

**Mainline** (no `/`): `main` → `1.0.0`
**Development** (with `/`): `feature/foo` → `1.0.0-feature.foo`

## Packages

- **package-a**: Base package
- **package-b**: Depends on package-a (demonstrates workspace dependencies)

## Workflow Configuration

See [.github/workflows/release.yml](.github/workflows/release.yml):

```yaml
on:
  push:
    branches-ignore:
      - 'release/**'  # Runs on all branches except release branches

jobs:
  create-release:
    uses: cpdevtools/git-flow/.github/workflows/create-release-pr.yml@main
    with:
      branch: ${{ github.ref_name }}
      versions-file: .github/versions.yml
```

## Testing Locally

1. Create a branch: `git checkout -b feature/my-feature`
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

