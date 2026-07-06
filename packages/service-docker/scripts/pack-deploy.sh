#!/bin/bash
# pack-deploy.sh — writes deploy bundle to $DEPLOY_OUTPUT_DIR then calls gitflow pack-deploy
#
# Called via: pnpm run github.actions.pack-deploy
# Env vars supplied by the git-flow orchestrator:
#   DEPLOY_OUTPUT_DIR    — staging directory for deploy files
#   PROJECT_NAME         — package name
#   PROJECT_VERSION      — semver version string
#   ARTIFACT_OUTPUT_DIR  — where the final deploy.zip lands
#   GITHUB_RELEASE_ID    — numeric GitHub release ID
#   GITHUB_REPOSITORY    — owner/repo

set -euo pipefail

echo "📦 Preparing deploy bundle for ${PROJECT_NAME}@${PROJECT_VERSION}..."

# Stage deploy files
mkdir -p "$DEPLOY_OUTPUT_DIR"
cp docker-compose.yml "$DEPLOY_OUTPUT_DIR/"

# Write the deploy script that the REST deploy service will execute
cat > "$DEPLOY_OUTPUT_DIR/deploy.sh" << 'DEPLOY_SCRIPT'
#!/bin/bash
set -euo pipefail
echo "Deploying test-service version ${SERVICE_VERSION}..."
export SERVICE_VERSION="${SERVICE_VERSION}"
docker compose pull
docker compose up -d
echo "Deploy complete."
DEPLOY_SCRIPT
chmod +x "$DEPLOY_OUTPUT_DIR/deploy.sh"

# Write the deploy.yml stub — gitflow pack-deploy will inject name/version/repo/releaseId
cat > "$DEPLOY_OUTPUT_DIR/deploy.yml" << DEPLOY_YML
deployCommand: ./deploy.sh
DEPLOY_YML

echo "✓ Deploy bundle staged in $DEPLOY_OUTPUT_DIR"

# Validate, inject metadata, and zip → ARTIFACT_OUTPUT_DIR/<name>-deploy.zip
gitflow pack-deploy
