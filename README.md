# Test Git Flow

This repository demonstrates and validates the git-flow workflow automation from [cpdevtools/git-flow](https://github.com/cpdevtools/git-flow).

## Overview

The git-flow system automatically creates release PRs with version metadata when you push to any branch (except `release/**` branches).

## How It Works

1. **Push to any branch** (main, v1, feature/*, bugfix/*, etc.)
2. **Workflow triggers** automatically via GitHub Actions
3. **Release branch created** at `release/{branch-name}`
4. **Draft PR opened** merging `{branch-name}` → `release/{branch-name}`
5. **PR body contains metadata**:
   - Resolved version numbers
   - Build metadata (run number, SHA, timestamp)
   - Project information

## Version Resolution

Versions are resolved from placeholders defined in [.github/versions.yml](.github/versions.yml):

```yaml
"0.0.0-DEFAULT": "1.0.0"
```

### Version Behavior by Branch Type

**Mainline Branches** (`main`, `v*`):
- Version: `1.0.0` (no pre-release suffix)
- Example: `main` → `1.0.0`
- Example: `v1` → `1.0.0`

**Development Branches** (`feature/*`, `bugfix/*`, etc.):
- Version: `1.0.0-{sanitized-branch-name}` (pre-release)
- Example: `feature/test-feature` → `1.0.0-feature.test-feature`
- Example: `bugfix/test-fix` → `1.0.0-bugfix.test-fix`

Branch names with `/` are sanitized by replacing slashes with dots.

## Example PRs

This repository has example PRs demonstrating different branch types:

- **PR #1**: `main` → `release/main` (mainline, version `1.0.0`)
- **PR #2**: `feature/test-feature` → `release/feature/test-feature` (pre-release)
- **PR #3**: `v1` → `release/v1` (mainline, version `1.0.0`)
- **PR #4**: `bugfix/test-fix` → `release/bugfix/test-fix` (pre-release)

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

## Related Repositories

- [cpdevtools/git-flow](https://github.com/cpdevtools/git-flow) - Main workflow and actions
- [cpdevtools/ts-dev-utilities](https://github.com/cpdevtools/ts-dev-utilities) - Utilities library

