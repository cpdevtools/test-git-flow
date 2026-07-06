FROM alpine:3.20
LABEL org.opencontainers.image.title="test-service"
LABEL org.opencontainers.image.description="Minimal test service for git-flow pack-deploy pipeline testing"
RUN echo "test-service image built"
ENTRYPOINT ["sh", "-c", "echo \"test-service running (version=${SERVICE_VERSION:-unknown})\" && sleep infinity"]
