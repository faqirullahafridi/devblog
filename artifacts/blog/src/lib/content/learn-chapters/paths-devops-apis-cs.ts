import type { ContentLevel } from "../types";
import { buildPathChapters, introChapter, capstoneChapter } from "./path-factory";

type ChapterOutline = Parameters<typeof buildPathChapters>[1][number];

function topic(
  slug: string,
  title: string,
  description: string,
  level: ContentLevel,
  minutes: number,
  content: string,
): ChapterOutline {
  return { slug, title, description, level, minutes, content };
}

const dockerContainersChapters = buildPathChapters("docker-containers", [
  introChapter(
    "docker-containers",
    "Docker & Containers",
    "**Docker** packages applications with their dependencies into **images** that run as isolated **containers** on any machine with the Docker engine installed.",
    [
      "Build images with Dockerfiles and layer caching",
      "Run multi-service stacks with Docker Compose",
      "Persist data with volumes and bind mounts",
      "Containerize a Node or Python API for production",
    ],
    "Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine on Linux. Verify with `docker run hello-world`. Create a project folder with a simple HTTP app and an empty `Dockerfile`.",
  ),
  topic(
    "images-and-layers",
    "Images & Layers",
    "How Docker images are built, cached, and tagged for reproducible deployments.",
    "beginner",
    14,
    `## Images as immutable templates

A **Docker image** is a read-only stack of **layers**. Each instruction in a Dockerfile creates a layer. When you change one line, only layers after that point rebuild—this makes iterative development fast once you understand caching.

\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["node", "server.js"]
\`\`\`

**FROM** picks a base image (often Alpine for smaller size). **COPY** and **RUN** order matters: copy dependency manifests before source so \`npm ci\` stays cached when only application code changes.

## Tags and registries

Images are referenced by \`name:tag\`. \`myapp:1.2.0\` and \`myapp:latest\` can point to different digests. Production should pin by **digest** (\`myapp@sha256:abc...\`) for true immutability.

Push to **Docker Hub**, **GitHub Container Registry**, or **ECR**:

\`\`\`bash
docker build -t myorg/myapp:v1 .
docker push myorg/myapp:v1
\`\`\`

## Inspecting images

\`\`\`bash
docker images
docker history myorg/myapp:v1
docker inspect myorg/myapp:v1
\`\`\`

History shows which Dockerfile steps created each layer and their sizes—useful when images bloat unexpectedly.

## Multi-stage builds

Compile in a builder stage; copy only artifacts to the final image:

\`\`\`dockerfile
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev
CMD ["node", "dist/server.js"]
\`\`\`

Production images exclude devDependencies and source maps you do not need at runtime.

## .dockerignore

Exclude \`node_modules\`, \`.git\`, and \`.env\` from the build context—smaller uploads and fewer cache invalidations:

\`\`\`
node_modules
.git
.env
dist
\`\`\`

Images are the contract between CI and production. Treat them like release artifacts: versioned, scanned for vulnerabilities, and never rebuilt manually on servers without recording the Dockerfile commit.`,
  ),
  topic(
    "dockerfile-best-practices",
    "Dockerfile Best Practices",
    "Security, size, and reliability patterns for production-ready containers.",
    "intermediate",
    15,
    `## Run as non-root

Default images often run as root inside the container. If an app is compromised, root inside the container eases escape attempts. Create a dedicated user:

\`\`\`dockerfile
RUN addgroup -S app && adduser -S app -G app
USER app
\`\`\`

Combine with read-only root filesystem where your platform supports it.

## One process per container

Containers should ideally run **one main process**. Use Compose to orchestrate app + database + Redis rather than stuffing supervisord into one image. This matches Kubernetes and simplifies health checks.

## Health checks

\`\`\`dockerfile
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD wget -qO- http://localhost:3000/health || exit 1
\`\`\`

Orchestrators use health status to replace unhealthy instances. Align the check with what "ready" means—database connected, migrations applied.

## Environment-specific config

Do not bake secrets into images. Pass **environment variables** at runtime or mount secrets from your platform. Use \`ARG\` only for build-time values (e.g. \`NODE_ENV=production\` during \`npm run build\`), not for API keys.

## Pin base image versions

\`node:20-alpine\` is better than \`node:latest\`. Major tags still move with security patches—rebuild regularly. Scan with \`docker scout\` or Trivy in CI.

## Minimize layer count sensibly

Combine related RUN commands to reduce layers, but not at the expense of cache clarity:

\`\`\`dockerfile
RUN apk add --no-cache curl \\
  && rm -rf /var/cache/apk/*
\`\`\`

## Signal handling

Node and other runtimes may ignore SIGTERM unless PID 1 handles it. Use \`exec\` form of CMD and consider \`dumb-init\` or \`tini\` as entrypoint so graceful shutdown works during deploys.

## Local vs prod parity

Develop with the same base image family you deploy. "Works in Docker on my Mac" failures often trace to different libc (Alpine musl vs Debian glibc) or missing native modules.

Good Dockerfiles are boring: small, non-root, no secrets, explicit versions, and health checks that tell the truth about readiness.`,
  ),
  topic(
    "compose-networking",
    "Docker Compose & Networking",
    "Define multi-container stacks, networks, and service discovery on your laptop.",
    "intermediate",
    14,
    `## Why Compose exists

Real apps need databases, caches, and workers alongside the API. **Docker Compose** describes the full stack in \`compose.yaml\` and starts it with one command—ideal for local development and integration tests.

\`\`\`yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/app
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
\`\`\`

## Service discovery

Containers on the same **network** resolve each other by **service name**. The API connects to host \`db\`, not \`localhost\`—inside the API container, \`localhost\` is only the API itself.

## Networks

Compose creates a default network per project. Explicit networks isolate stacks:

\`\`\`yaml
networks:
  frontend:
  backend:

services:
  api:
    networks: [frontend, backend]
  db:
    networks: [backend]
\`\`\`

Only the API exposes ports to the host; the database stays internal.

## depends_on vs health

\`depends_on\` alone does not wait for Postgres to accept connections. Use **healthcheck** + \`condition: service_healthy\` or retry logic in app startup.

## Profiles and overrides

\`\`\`bash
docker compose --profile debug up
\`\`\`

Use \`compose.override.yaml\` for developer-specific mounts without committing them. Production often uses raw \`docker compose\` on a VM or converts to Kubernetes manifests with Kompose (with caution).

## Environment files

\`\`\`yaml
env_file: .env
\`\`\`

Keep \`.env\` gitignored; commit \`.env.example\`. Compose interpolates \`\${VAR}\` from the shell or \`.env\`.

## Scaling locally

\`\`\`bash
docker compose up --scale worker=3
\`\`\`

Not all services scale cleanly without a load balancer—useful for testing queue consumers.

Compose bridges "it runs on my machine" to "it runs the same stack in CI." Nail networking and health checks here before jumping to Kubernetes.`,
  ),
  topic(
    "volumes-and-data",
    "Volumes & Persistent Data",
    "Persist database files, uploads, and state across container restarts.",
    "intermediate",
    13,
    `## Ephemeral containers

Container filesystems are **ephemeral** by default—delete the container and un persisted data is gone. Databases and user uploads need **volumes** or external object storage.

## Named volumes

\`\`\`yaml
services:
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
\`\`\`

Docker manages \`pgdata\` on the host. \`docker volume ls\` and \`docker volume inspect\` show location. Backups still your responsibility—\`pg_dump\` on schedule.

## Bind mounts

Mount a host path for live code reload during development:

\`\`\`yaml
services:
  api:
    volumes:
      - ./src:/app/src
\`\`\`

Never bind-mount production database directories across OS boundaries without understanding permissions (UID mapping on Linux vs Docker Desktop).

## tmpfs for secrets

Sensitive temp data can use \`tmpfs\` mounts that never hit disk:

\`\`\`yaml
tmpfs:
  - /run/secrets
\`\`\`

## Uploads pattern

Small apps store uploads in a volume; production apps use **S3** or compatible storage. Containers stay stateless; the volume or bucket holds blobs.

## Migrations and init

Run migrations as a one-off container or entrypoint script:

\`\`\`bash
docker compose run --rm api npm run db:migrate
\`\`\`

Separate job from long-running server so failed migrations do not leave a half-started API.

## Backup and restore

Document restore drills: snapshot volume, restore to new volume, verify app connects. RTO/RPO expectations should match business needs.

## Read-only root

Some platforms mount the container root read-only and allow only specific volume paths for writes—design apps to write logs to stdout and files to designated volumes.

Data outlives containers. Choose volume strategy before production traffic—migrating Postgres out of a container volume under load is painful.`,
  ),
  capstoneChapter("docker-containers", "Containerized Full-Stack App", [
    "Containerize a Node or Python API with multi-stage Dockerfile, non-root user, and `/health` endpoint.",
    "Add `compose.yaml` with API, Postgres, and Redis; wire `DATABASE_URL` and verify healthchecks before API starts.",
    "Persist Postgres with a named volume; run migrations as a one-off Compose command.",
    "Push images to a registry; document `docker compose up` and env vars in README.",
    "Optional: add Trivy scan step in a shell script and fix any critical CVEs in base image.",
  ]),
]);

const kubernetesIntroChapters = buildPathChapters("kubernetes-intro", [
  introChapter(
    "kubernetes-intro",
    "Kubernetes",
    "**Kubernetes (K8s)** orchestrates containers across a cluster: scheduling, scaling, self-healing, and service discovery for production workloads.",
    [
      "Understand pods, deployments, and replica sets",
      "Expose apps with Services and Ingress",
      "Configure apps with ConfigMaps and Secrets",
      "Deploy and scale a stateless web application",
    ],
    "Install `kubectl` and use **minikube**, **kind**, or Docker Desktop Kubernetes. Run `kubectl cluster-info` and `kubectl get nodes` to confirm connectivity.",
  ),
  topic(
    "pods-and-deployments",
    "Pods & Deployments",
    "The smallest schedulable units and how Deployments manage replicated stateless apps.",
    "beginner",
    15,
    `## Pods

A **Pod** is one or more containers sharing network and storage. Most apps run **one container per pod**. Pods are ephemeral—Kubernetes replaces them when nodes fail or images update.

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: hello
spec:
  containers:
    - name: app
      image: nginx:1.25-alpine
      ports:
        - containerPort: 80
\`\`\`

You rarely create bare Pods in production; **Deployments** manage them.

## Deployments

A **Deployment** declares desired state: image, replicas, rollout strategy.

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: myorg/api:1.0.0
          ports:
            - containerPort: 3000
\`\`\`

\`\`\`bash
kubectl apply -f deployment.yaml
kubectl get pods -l app=api
kubectl rollout status deployment/api
\`\`\`

## Rolling updates

Change the image tag and apply—Kubernetes gradually replaces pods. \`kubectl rollout undo deployment/api\` reverts a bad deploy.

## Resource requests and limits

\`\`\`yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "500m"
\`\`\`

**Requests** help scheduling; **limits** cap usage. OOM-killed pods often mean memory limits too low.

## Probes

\`\`\`yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
\`\`\`

**Liveness** restarts stuck containers; **readiness** removes pods from Service endpoints until ready.

Deployments turn container images into a managed fleet. Master apply, rollout, and logs (\`kubectl logs -f deployment/api\`) before touching Ingress.`,
  ),
  topic(
    "services-and-networking",
    "Services & Cluster Networking",
    "Stable endpoints, DNS, and how traffic reaches pods inside the cluster.",
    "intermediate",
    14,
    `## The problem Services solve

Pod IPs change on restart. A **Service** is a stable virtual IP and DNS name that load-balances to matching pods via **labels**.

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
\`\`\`

Other pods reach \`http://api.default.svc.cluster.local\` (or short name \`http://api\` in same namespace).

## Service types

- **ClusterIP** — Internal only (default)
- **NodePort** — Opens a port on each node (dev/demo)
- **LoadBalancer** — Cloud LB provisions external IP (managed K8s)
- **ExternalName** — CNAME to external DNS

Production HTTP usually uses **ClusterIP** + **Ingress**, not NodePort.

## Endpoints

\`\`\`bash
kubectl get endpoints api
\`\`\`

Shows pod IPs behind the Service. Empty endpoints mean label mismatch or no ready pods.

## Network policies

By default all pods can talk to all pods. **NetworkPolicy** restricts traffic (e.g. only frontend namespace → api). Requires a CNI that supports policies (Calico, Cilium).

## DNS and namespaces

Resources live in **namespaces** (\`default\`, \`staging\`, \`prod\`). Service DNS: \`<service>.<namespace>.svc.cluster.local\`.

## Debugging connectivity

\`\`\`bash
kubectl run tmp --rm -it --image=busybox -- wget -qO- http://api/health
\`\`\`

Temporary debug pods test cluster DNS and Service routing without SSH to nodes.

Services are the phone book of Kubernetes. Labels must match between Deployment template and Service selector—typo debugging consumes hours if you skip verifying both.`,
  ),
  topic(
    "configmaps-secrets",
    "ConfigMaps & Secrets",
    "Inject configuration and sensitive values without baking them into images.",
    "intermediate",
    13,
    `## ConfigMaps for non-secret config

\`\`\`yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
data:
  LOG_LEVEL: info
  APP_ENV: staging
\`\`\`

Mount as environment variables:

\`\`\`yaml
envFrom:
  - configMapRef:
      name: api-config
\`\`\`

Or mount as files:

\`\`\`yaml
volumeMounts:
  - name: config
    mountPath: /config
volumes:
  - name: config
    configMap:
      name: api-config
\`\`\`

## Secrets

\`\`\`yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
stringData:
  DATABASE_URL: postgres://user:pass@db:5432/app
\`\`\`

Reference in Deployment:

\`\`\`yaml
env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: db-credentials
        key: DATABASE_URL
\`\`\`

**Note:** etcd stores Secrets base64-encoded, not encrypted by default—enable encryption at rest and use external secret managers (AWS Secrets Manager, Vault) for serious production.

## Immutable ConfigMaps

Mark ConfigMaps immutable to prevent accidental updates that desync running pods.

## Reload on change

Pods do not auto-reload when ConfigMaps change unless you use a reloader sidecar or restart:

\`\`\`bash
kubectl rollout restart deployment/api
\`\`\`

## Sealed Secrets / External Secrets

GitOps teams commit encrypted SealedSecret manifests or sync from cloud providers—never plain Secrets in git.

Separate config from images. The same container image should run in staging and prod with different ConfigMaps and Secrets injected at deploy time.`,
  ),
  topic(
    "ingress-scaling",
    "Ingress & Scaling",
    "HTTP routing from outside the cluster and horizontal pod autoscaling.",
    "intermediate",
    15,
    `## Ingress controllers

An **Ingress** routes HTTP(S) by host and path to Services. You need an **Ingress controller** (nginx-ingress, Traefik, cloud LB) installed in the cluster.

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 80
\`\`\`

TLS references a Secret with cert and key, or use **cert-manager** for Let's Encrypt automation.

## Horizontal Pod Autoscaler

\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
\`\`\`

HPA needs **metrics-server** and properly set CPU requests. Scale on custom metrics (queue depth) for worker workloads.

## Cluster Autoscaler

When pods cannot schedule, cluster autoscaler adds nodes (cloud managed K8s). Pod requests must fit new node sizes.

## Limits of stateful scaling

Databases and queues do not HPA like stateless APIs—use managed RDS, Cloud SQL, or StatefulSets with careful planning.

## Zero-downtime deploys

Combine rolling updates, readiness probes, and PodDisruptionBudgets so node drains do not take all replicas offline.

Ingress plus HPA is how public APIs survive traffic spikes. Test TLS renewal and scale-up lag before Black Friday, not during it.`,
  ),
  capstoneChapter("kubernetes-intro", "Kubernetes Deployment", [
    "Build and push a container image for a small API with `/health` and `/ready` endpoints.",
    "Write Deployment (3 replicas), ClusterIP Service, and ConfigMap for non-secret env.",
    "Add Ingress with a local hostname (e.g. `api.localtest.me`) via minikube tunnel or kind.",
    "Configure liveness/readiness probes and verify rolling update by changing an env var.",
    "Optional: add HPA with min 2 max 5 replicas and load-test with `hey` or k6.",
  ]),
]);

const nginxDeploymentChapters = buildPathChapters("nginx-deployment", [
  introChapter(
    "nginx-deployment",
    "Nginx & Reverse Proxy",
    "**Nginx** serves static files, terminates TLS, load-balances upstreams, and proxies API traffic—common edge layer for self-hosted and VPS deployments.",
    [
      "Serve SPAs and static assets with correct caching",
      "Reverse-proxy API backends with headers and timeouts",
      "Configure SSL/TLS with Let's Encrypt",
      "Balance traffic across multiple upstream servers",
    ],
    "Install nginx locally or use Docker: `docker run -p 8080:80 nginx:alpine`. Create `/etc/nginx/conf.d/` style config in a project folder for version control.",
  ),
  topic(
    "static-files-spa",
    "Static Files & SPAs",
    "Serve built frontend assets and handle client-side routing fallbacks.",
    "beginner",
    13,
    `## Basic static site

\`\`\`nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
\`\`\`

**try_files** tries the exact path, then directory, then falls back to \`index.html\`—required for React/Vue routers using browser history mode.

## Caching static assets

Fingerprinted files (\`main.a1b2c3.js\`) cache aggressively:

\`\`\`nginx
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
\`\`\`

Never long-cache \`index.html\`—it references hashed bundles that change each deploy:

\`\`\`nginx
location = /index.html {
    add_header Cache-Control "no-cache";
}
\`\`\`

## Gzip compression

\`\`\`nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 256;
\`\`\`

Smaller payloads improve LCP on slow networks.

## Security headers (static)

\`\`\`nginx
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options SAMEORIGIN;
\`\`\`

Full CSP often set at app or CDN layer—nginx can add baseline headers.

## Deploy workflow

CI builds \`dist/\`, rsync or scp to server, reload nginx:

\`\`\`bash
nginx -t && systemctl reload nginx
\`\`\`

Always test config before reload—syntax errors can drop the site.

## Docker pattern

\`\`\`dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
\`\`\`

Single container serves SPA; API proxied separately or on subdomain.

Static hosting looks simple until cache invalidation breaks deployments. Separate cache policy for entry HTML vs hashed assets every time.`,
  ),
  topic(
    "reverse-proxy-api",
    "Reverse Proxy for APIs",
    "Forward requests to backend services with proper headers and timeouts.",
    "intermediate",
    14,
    `## Proxy pass basics

\`\`\`nginx
upstream api_backend {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

Backends need **X-Forwarded-*** headers to know original client IP and HTTPS status for redirects and rate limiting.

## Timeouts and body size

\`\`\`nginx
client_max_body_size 10M;
proxy_connect_timeout 5s;
proxy_read_timeout 60s;
\`\`\`

Upload endpoints need higher limits; long-polling or SSE need longer read timeouts.

## WebSocket upgrade

\`\`\`nginx
location /ws {
    proxy_pass http://api_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
\`\`\`

Without Upgrade headers, WebSockets fail silently through the proxy.

## Path-based routing

\`\`\`nginx
location /api/ {
    proxy_pass http://api_backend/;
}
location / {
    root /var/www/frontend;
    try_files $uri /index.html;
}
\`\`\`

One domain for SPA + API simplifies CORS; subdomains (\`api.\`) are cleaner for cookie scoping.

## Rate limiting

\`\`\`nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://api_backend;
}
\`\`\`

Edge rate limits protect backends from abuse—complement app-level limits.

Nginx terminates TLS and shields Node/Python from slow clients. Tune buffers and timeouts before blaming application latency.`,
  ),
  topic(
    "ssl-tls",
    "SSL/TLS Termination",
    "HTTPS with certificates, redirects, and modern cipher configuration.",
    "intermediate",
    14,
    `## Why terminate at nginx

**TLS termination** at nginx offloads crypto from app servers. Clients connect HTTPS to nginx; nginx may speak HTTP to localhost upstreams on a trusted network.

## Certbot with Let's Encrypt

\`\`\`bash
certbot --nginx -d example.com -d www.example.com
\`\`\`

Auto-renew via cron or systemd timer. Staging certs first when testing to avoid rate limits.

## Manual cert paths

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
}
\`\`\`

## HTTP → HTTPS redirect

\`\`\`nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
\`\`\`

HSTS after HTTPS works:

\`\`\`nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
\`\`\`

Only enable HSTS when HTTPS is stable—mistakes are hard to undo during max-age.

## OCSP stapling

Reduces client cert validation latency—certbot configs often enable this.

## Mixed content

Ensure SPA calls \`https://\` APIs. nginx cannot fix hardcoded \`http://\` in JS bundles—fix at build time.

Renewal failures cause midnight outages. Monitor cert expiry (30-day alerts) and test \`certbot renew --dry-run\` quarterly.`,
  ),
  topic(
    "load-balancing",
    "Load Balancing Upstreams",
    "Distribute traffic across multiple app instances with health-aware upstreams.",
    "intermediate",
    13,
    `## Upstream blocks

\`\`\`nginx
upstream api {
    least_conn;
    server 10.0.0.1:3000 max_fails=3 fail_timeout=30s;
    server 10.0.0.2:3000 max_fails=3 fail_timeout=30s;
    server 10.0.0.3:3000 backup;
}
\`\`\`

**least_conn** sends to the instance with fewest active connections—good for long-lived requests. Default **round-robin** works for homogeneous short requests.

## Health checks

Open-source nginx marks servers down after \`max_fails\`. **nginx-plus** and alternatives (HAProxy, cloud ALB) offer active HTTP health checks. Without them, rely on app instances failing fast and manual removal.

## Sticky sessions

\`\`\`nginx
upstream api {
    ip_hash;
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
}
\`\`\`

**ip_hash** pins clients to one server—needed for legacy in-memory sessions. Prefer stateless JWT or Redis sessions instead.

## Keepalive to upstream

\`\`\`nginx
upstream api {
    server 127.0.0.1:3000;
    keepalive 16;
}
\`\`\`

Reuse connections to Node—reduces latency under load.

## Blue-green at nginx

Switch upstream server list and \`reload\`—two configs or symlink swap between \`upstream-blue\` and \`upstream-green\`.

## Logging for LB debug

\`\`\`nginx
log_format upstreamlog '$remote_addr - $upstream_addr - $status';
access_log /var/log/nginx/upstream.log upstreamlog;
\`\`\`

See which backend served each request when one instance misbehaves.

Load balancing without session affinity or shared state requires apps that are truly interchangeable—design for that before adding a second server.`,
  ),
  capstoneChapter("nginx-deployment", "Production Nginx Stack", [
    "Configure nginx to serve a Vite/React `dist/` with SPA fallback and asset caching headers.",
    "Proxy `/api/` to a local Node process on port 3000 with forwarded headers and WebSocket support.",
    "Obtain Let's Encrypt certs (or self-signed for lab) and enforce HTTPS redirect.",
    "Define upstream with two backend ports (run two instances) and verify round-robin with access logs.",
    "Document `nginx -t`, reload procedure, and rollback steps in a DEPLOY.md file.",
  ]),
]);

const linuxServerBasicsChapters = buildPathChapters("linux-server-basics", [
  introChapter(
    "linux-server-basics",
    "Linux Server Administration",
    "Production servers run **Linux**. SSH access, users, permissions, **systemd**, and logs are daily skills for backend and DevOps engineers.",
    [
      "Connect securely with SSH keys and harden sshd",
      "Manage users, groups, and file permissions",
      "Run services with systemd and journalctl",
      "Apply baseline server hardening and updates",
    ],
    "Provision a cheap VPS (DigitalOcean, Hetzner, AWS EC2) or use a local VM. Connect with `ssh root@your-ip` and create a non-root sudo user immediately.",
  ),
  topic(
    "ssh-users-permissions",
    "SSH, Users & Permissions",
    "Secure remote access and the Unix permission model for files and directories.",
    "beginner",
    14,
    `## SSH key authentication

Password-only SSH invites brute force. Generate a key pair:

\`\`\`bash
ssh-keygen -t ed25519 -C "you@example.com"
ssh-copy-id deploy@server.example.com
\`\`\`

Disable password auth in \`/etc/ssh/sshd_config\` after confirming keys work:

\`\`\`
PasswordAuthentication no
PermitRootLogin no
\`\`\`

Reload: \`sudo systemctl reload sshd\`.

## Sudo and users

\`\`\`bash
sudo adduser deploy
sudo usermod -aG sudo deploy
\`\`\`

Run admin commands with \`sudo\`, not permanent root login. Use separate users for deploy vs human login when teams share servers.

## File permissions

\`\`\`bash
ls -la /var/www/app
chmod 640 config.env
chown deploy:www-data /var/www/app
\`\`\`

**rwx** for owner, group, others. Directories need **x** to enter. Secrets: owner-read only (\`600\`).

## umask and defaults

Default \`umask 022\` creates files \`644\` and dirs \`755\`. Adjust for stricter group policies.

## SFTP vs SCP

\`scp file deploy@host:/path\` and \`rsync -avz\` deploy artifacts. \`rsync\` resumes interrupted transfers—prefer for large builds.

## SSH config locally

\`\`\`
Host prod
  HostName 203.0.113.10
  User deploy
  IdentityFile ~/.ssh/id_ed25519
\`\`\`

Then \`ssh prod\`—fewer mistakes than retyping IPs.

## fail2ban

Ban IPs after repeated failed SSH attempts:

\`\`\`bash
sudo apt install fail2ban
\`\`\`

Complements key-only auth for bots hammering port 22.

Permissions are security. World-readable \`.env\` on a server is equivalent to committing secrets to git.`,
  ),
  topic(
    "systemd-services",
    "systemd Services",
    "Run application processes as managed services that start on boot and restart on failure.",
    "intermediate",
    14,
    `## Unit files

\`/etc/systemd/system/myapp.service\`:

\`\`\`ini
[Unit]
Description=My API
After=network.target

[Service]
User=deploy
WorkingDirectory=/var/www/myapp
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
\`\`\`

Enable and start:

\`\`\`bash
sudo systemctl daemon-reload
sudo systemctl enable --now myapp
sudo systemctl status myapp
\`\`\`

## Logs with journalctl

\`\`\`bash
journalctl -u myapp -f
journalctl -u myapp --since "1 hour ago"
\`\`\`

Apps should also log to stdout/stderr—journald captures it.

## Environment files

\`\`\`ini
EnvironmentFile=/etc/myapp/env
\`\`\`

Restrict permissions on \`/etc/myapp/env\` to \`600\`.

## Resource limits

\`\`\`ini
LimitNOFILE=65535
MemoryMax=512M
\`\`\`

Prevent runaway memory from taking down the whole VM.

## Timers (cron replacement)

\`\`\`ini
# /etc/systemd/system/backup.timer
[Timer]
OnCalendar=daily
Persistent=true
\`\`\`

**systemd timers** integrate with service units and logging—prefer over opaque crontab for new work.

## Deploy reload

After new code:

\`\`\`bash
sudo systemctl restart myapp
\`\`\`

Use health checks before announcing success. **reload** if app supports graceful config reload (nginx)—Node APIs usually need restart.

systemd is how Linux keeps your API alive across reboots and crashes. Test \`Restart=\` behavior by killing the process intentionally.`,
  ),
  topic(
    "logs-monitoring",
    "Logs & Basic Monitoring",
    "Find failures with log files, disk space checks, and simple uptime monitoring.",
    "intermediate",
    13,
    `## Log locations

- **journalctl** — systemd services
- **/var/log/nginx/** — access and error logs
- **/var/log/auth.log** — SSH and sudo (Debian/Ubuntu)

Structured JSON logs from apps simplify search. Include timestamp, level, request ID, and error stack.

## tail and grep

\`\`\`bash
sudo tail -f /var/log/nginx/error.log
journalctl -u myapp | grep ERROR
\`\`\`

**logrotate** prevents disks filling—check \`/etc/logrotate.d/\`.

## Disk and memory

\`\`\`bash
df -h
du -sh /var/*
free -h
top   # or htop
\`\`\`

Full disks cause silent write failures and database corruption. Alert before 90% usage.

## Process and ports

\`\`\`bash
ss -tlnp
ps aux | grep node
\`\`\`

Confirm your app listens on \`127.0.0.1:3000\` behind nginx, not \`0.0.0.0\` unless intentional.

## External uptime checks

UptimeRobot, Better Stack, or Pingdom hit \`/health\` every minute. Page on 5xx, not single blips.

## Simple metrics

Install **node_exporter** for Prometheus or use cloud provider metrics (CPU, network). Minimum: CPU, memory, disk, HTTP error rate.

## Centralized logging

Production fleets ship logs to Loki, CloudWatch, or Datadog. Start with journald + nginx logs on one VPS; plan aggregation before server #3.

You cannot fix what you cannot see. Log rotation and disk alerts prevent the most embarrassing 3 a.m. outages.`,
  ),
  topic(
    "server-hardening",
    "Server Hardening",
    "Firewall rules, automatic updates, and baseline security for internet-facing VPS.",
    "intermediate",
    15,
    `## Firewall (ufw)

\`\`\`bash
sudo ufw default deny incoming
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
\`\`\`

Only expose 22 (or custom SSH port), 80, and 443. Database ports stay on private network or localhost.

## Unattended upgrades

\`\`\`bash
sudo apt install unattended-upgrades
\`\`\`

Security patches apply automatically; schedule reboots for kernel updates during maintenance windows.

## Minimal packages

Remove unused services. Each open port is attack surface. \`ss -tlnp\` audit monthly.

## SSH hardening extras

- \`AllowUsers deploy\`
- Change default port (minor obscurity, not security alone)
- **bastion host** or VPN for admin access in larger setups

## App isolation

Run app as non-root **deploy** user. nginx master as root, workers as \`www-data\`. Separate DB on managed service when possible.

## Backups

Automate DB dumps to object storage with encryption. Test restore quarterly—untested backups are wishful thinking.

## Intrusion detection

\`aide\` or \`rkhunter\` for integrity checks on critical servers. Cloud providers offer threat detection add-ons.

## Document runbook

IP, provider login, DNS, systemd unit names, backup location, on-call—one markdown file saves panic during incidents.

Hardening is incremental. Key-only SSH, ufw, non-root services, and updates cover 80% of VPS risk for small projects.`,
  ),
  capstoneChapter("linux-server-basics", "Production VPS Setup", [
    "Create deploy user, SSH keys only, disable root login; connect via `ssh deploy@host`.",
    "Install nginx and Node/Python API; systemd unit with EnvironmentFile and Restart=on-failure.",
    "Configure ufw (22, 80, 443); nginx reverse proxy to localhost app with TLS.",
    "Set up logrotate awareness and a cron/systemd timer for `pg_dump` or sqlite backup to off-server storage.",
    "Write SERVER.md runbook: access, deploy steps, restart, rollback, and emergency contacts.",
  ]),
]);

const ciCdGithubActionsChapters = buildPathChapters("ci-cd-github-actions", [
  introChapter(
    "ci-cd-github-actions",
    "CI/CD with GitHub Actions",
    "**GitHub Actions** runs workflows on git events—test every PR, build artifacts, and deploy when merges land on `main`.",
    [
      "Write workflow YAML with jobs and steps",
      "Run lint, typecheck, and tests on pull requests",
      "Cache dependencies and build deployable artifacts",
      "Automate staging or production deploy with secrets",
    ],
    "Push a repo to GitHub. Add `.github/workflows/ci.yaml`. Enable Actions in repo settings. Start with `on: [push, pull_request]` and a single `ubuntu-latest` job.",
  ),
  topic(
    "workflow-syntax",
    "Workflow Syntax",
    "Triggers, jobs, steps, and expressions that define automation pipelines.",
    "beginner",
    14,
    `## Minimal workflow

\`\`\`yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
\`\`\`

**on** defines triggers. **jobs** run in parallel unless \`needs:\` declares dependencies. **steps** run sequentially within a job.

## Actions marketplace

\`actions/checkout\` clones the repo. \`actions/setup-node\` installs Node with optional cache. Pin major versions (\`@v4\`) for stability.

## Environment variables

\`\`\`yaml
env:
  NODE_ENV: test
steps:
  - run: echo "$GITHUB_SHA"
\`\`\`

**GITHUB_SHA**, **GITHUB_REF**, and **github.event** context power conditional logic.

## Matrix builds

\`\`\`yaml
strategy:
  matrix:
    node: [18, 20, 22]
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: \${{ matrix.node }}
\`\`\`

Test across versions without duplicating files.

## Permissions

\`\`\`yaml
permissions:
  contents: read
\`\`\`

Principle of least privilege—especially for workflows triggered by fork PRs.

## Reusable workflows

Extract common test job; call from multiple repos with \`workflow_call\`.

## Local testing

**act** runs workflows locally (approximation). Still validate in GitHub for accurate runner behavior.

YAML indentation errors fail silently until push. Keep workflows small; one job for test, one for deploy with \`needs: test\`.`,
  ),
  topic(
    "test-on-pr",
    "Testing on Pull Requests",
    "Block merges until lint, typecheck, unit tests, and optional e2e pass.",
    "intermediate",
    14,
    `## Required checks

Branch protection on \`main\`:

- Require status checks (CI job names)
- Require PR review
- Disallow force push

CI becomes the gatekeeper—green before merge.

## Typical PR pipeline

\`\`\`yaml
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test --coverage
\`\`\`

Fail fast: lint before slow e2e. Parallel jobs for frontend and backend in monorepos.

## Services for integration tests

\`\`\`yaml
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_PASSWORD: postgres
    ports:
      - 5432:5432
\`\`\`

Integration tests hit real Postgres on \`localhost:5432\`—closer to production than mocks alone.

## Fork PR security

Secrets are not exposed to workflows from forks by default. Use \`pull_request_target\` only with extreme care—it runs in base repo context.

## Coverage and artifacts

Upload coverage to Codecov optionally. Store test reports as artifacts for debugging failed runs.

## Concurrency

\`\`\`yaml
concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true
\`\`\`

Cancel outdated runs on rapid pushes—saves minutes and money.

## Caching

\`cache: npm\` or \`actions/cache\` with lockfile hash keys speeds installs from minutes to seconds.

PR CI is team communication: "this commit meets our bar." Keep it under 10 minutes or developers skip waiting.`,
  ),
  topic(
    "build-artifacts",
    "Build Artifacts",
    "Produce Docker images, static bundles, and release assets in CI.",
    "intermediate",
    14,
    `## Build job

\`\`\`yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
\`\`\`

Downstream deploy job downloads artifact:

\`\`\`yaml
      - uses: actions/download-artifact@v4
        with:
          name: dist
\`\`\`

## Docker build and push

\`\`\`yaml
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: ghcr.io/org/app:\${{ github.sha }}
\`\`\`

Tag images with git SHA for traceability.

## Monorepo filters

\`\`\`yaml
      - run: pnpm --filter @app/web run build
\`\`\`

Or path filters:

\`\`\`yaml
on:
  push:
    paths:
      - 'apps/web/**'
\`\`\`

Skip unrelated builds.

## Release assets

On tag push, attach binaries to GitHub Release with \`softprops/action-gh-release\`.

## Immutable artifacts

Same commit SHA → same image digest. Never rebuild on server without recording source version.

## Size limits

Artifact retention defaults 90 days—tune for cost. Large artifacts slow deploy jobs.

Build once, deploy many. The artifact from CI is what production runs—not a manual laptop build.`,
  ),
  topic(
    "deploy-automation",
    "Deploy Automation",
    "Ship passing builds to staging or production with secrets and approvals.",
    "intermediate",
    15,
    `## Deploy job pattern

\`\`\`yaml
jobs:
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
      - run: ./scripts/deploy.sh
        env:
          DEPLOY_KEY: \${{ secrets.DEPLOY_KEY }}
\`\`\`

**environment: production** enables required reviewers in GitHub.

## SSH deploy to VPS

\`\`\`yaml
      - uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.HOST }}
          username: deploy
          key: \${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/app
            git pull
            npm ci --omit=dev
            systemctl restart myapp
\`\`\`

Prefer pull container image or rsync artifact over git pull on server for immutability.

## Platform deploys

Vercel, Netlify, Fly.io, and Railway offer official Actions—often one step after build.

## Database migrations

Run migrations before traffic switch:

\`\`\`yaml
      - run: npm run db:migrate
        env:
          DATABASE_URL: \${{ secrets.DATABASE_URL }}
\`\`\`

Expand/contract migrations for zero downtime on large tables.

## Rollback

Keep previous artifact tag. Redeploy last SHA on failure. Document in runbook.

## Secrets rotation

Rotate **DEPLOY_KEY** and API tokens periodically. GitHub org secrets share across repos—avoid duplication leaks.

Deploy automation removes heroics but adds responsibility: protect \`main\`, review prod environment access, and monitor after every auto-deploy.`,
  ),
  capstoneChapter("ci-cd-github-actions", "Full CI/CD Pipeline", [
    "Create `.github/workflows/ci.yaml`: checkout, install, lint, typecheck, test on PR and push to main.",
    "Add Postgres service for one integration test proving DB connectivity.",
    "Build `dist/` or Docker image; push image to GHCR tagged with `${{ github.sha }}`.",
    "Add deploy job (dry-run script or SSH to VPS) gated on `main` with `environment: staging`.",
    "Enable branch protection requiring the CI job; document secrets needed in CONTRIBUTING.md.",
  ]),
]);

const awsCloudEssentialsChapters = buildPathChapters("aws-cloud-essentials", [
  introChapter(
    "aws-cloud-essentials",
    "AWS Cloud Essentials",
    "**Amazon Web Services** provides compute, storage, databases, and serverless building blocks. Learn the core services before reaching for every product in the catalog.",
    [
      "Launch and secure EC2 instances",
      "Store assets in S3 with proper permissions",
      "Run managed PostgreSQL on RDS",
      "Trigger Lambda functions and outline a full-stack deploy",
    ],
    "Create a free-tier AWS account. Install AWS CLI and run `aws configure`. Use **IAM** user with MFA—not root—for daily work. Set billing alerts immediately.",
  ),
  topic(
    "ec2-compute",
    "EC2 Compute",
    "Virtual servers, security groups, keys, and deploying apps on EC2.",
    "beginner",
    15,
    `## EC2 basics

**EC2** is a virtual machine. Pick AMI (Amazon Linux, Ubuntu), instance type (\`t3.micro\` free tier), key pair, and **security group** firewall rules.

\`\`\`bash
aws ec2 run-instances \\
  --image-id ami-0c55b159cbfafe1f0 \\
  --instance-type t3.micro \\
  --key-name my-key \\
  --security-group-ids sg-abc123
\`\`\`

Console workflow is fine while learning.

## Security groups

Stateful firewall attached to instances:

- Inbound: 22 from your IP, 80/443 from 0.0.0.0/0
- Outbound: allow all (default) or restrict for compliance

Never expose Postgres (5432) to the world.

## SSH access

\`\`\`bash
ssh -i my-key.pem ec2-user@ec2-xx-xx-xx.compute.amazonaws.com
\`\`\`

Amazon Linux uses \`ec2-user\`; Ubuntu uses \`ubuntu\`. Install nginx, Node, systemd unit—same as generic VPS.

## Elastic IP

Static public IP attaches to instance—DNS A record points here. Release unused EIPs (AWS charges idle addresses).

## User data bootstrap

Pass cloud-init script at launch to install Docker or pull image on first boot—reproducible instances.

## AMIs and snapshots

Golden AMI after hardening, or immutable infrastructure: new instance per deploy from fresh AMI + user data.

## Cost control

Stop dev instances nights/weekends. **t3** burstable credits exhaust under sustained CPU—watch CloudWatch.

EC2 is "your server in AWS." Pair with ALB, Auto Scaling, and IAM roles instead of long-lived access keys on disk.`,
  ),
  topic(
    "s3-storage",
    "S3 Object Storage",
    "Buckets, ACLs, IAM policies, and serving static assets from S3.",
    "beginner",
    14,
    `## Buckets and objects

**S3** stores objects in **buckets** with global unique names. Keys are paths: \`uploads/user-42/avatar.png\`.

\`\`\`bash
aws s3 mb s3://my-app-uploads-dev
aws s3 cp photo.jpg s3://my-app-uploads-dev/photo.jpg
aws s3 sync dist/ s3://my-app-static-prod/
\`\`\`

## Block public access

Default: block all public access. Enable public read only for intentional static hosting buckets with bucket policy review.

## IAM policies

Grant app minimal S3 access:

\`\`\`json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject"],
  "Resource": "arn:aws:s3:::my-app-uploads/*"
}
\`\`\`

Attach to **IAM role** for EC2/Lambda—not embedded keys.

## Presigned URLs

Temporary upload/download links without public buckets:

\`\`\`javascript
const url = await getSignedUrl(s3Client, new PutObjectCommand({...}), { expiresIn: 3600 });
\`\`\`

## Static site hosting

S3 + CloudFront CDN for SPA. CloudFront handles HTTPS and caching; S3 origin stays private via OAI.

## Versioning and lifecycle

Enable versioning for accidental delete recovery. Lifecycle rules transition old logs to Glacier or expire temp uploads after 30 days.

## CORS for browser uploads

Bucket CORS allows browser PUT to presigned URLs from your frontend origin.

S3 is cheap until egress spikes. CloudFront reduces latency and can reduce data transfer costs for global users.`,
  ),
  topic(
    "rds-database",
    "RDS Managed Databases",
    "PostgreSQL on RDS: subnets, backups, and connecting from apps.",
    "intermediate",
    14,
    `## Why RDS

Self-managed Postgres on EC2 means you patch, backup, and failover manually.**RDS** automates backups, patches, and Multi-AZ failover (paid tier).

## Launch PostgreSQL

- Engine: PostgreSQL 16
- Instance: db.t3.micro (dev)
- VPC security group: allow 5432 **only** from app security group
- Master username/password stored in Secrets Manager

## Connection string

\`\`\`
postgres://admin:PASSWORD@mydb.xxxxx.us-east-1.rds.amazonaws.com:5432/app
\`\`\`

Apps in same VPC use private endpoint—no public RDS for production.

## Subnets and VPC

RDS lives in **private subnets** across two AZs for Multi-AZ. EC2 app tier in public or private subnet with NAT for outbound.

## Backups

Automated daily snapshots; point-in-time recovery within retention window. Test restore to staging before you need it in crisis.

## Parameter groups

Tune \`max_connections\`, \`shared_buffers\` via DB parameter group—avoid editing config files on disk.

## Migrations

Run migrations from CI or deploy job with **DATABASE_URL** secret—same as any Postgres host.

## Read replicas

Scale read traffic with replicas; app routes writes to primary, reads to replica with replication lag awareness.

Managed DB trades control for reliability. Security group wiring causes most "cannot connect" tickets—verify SG source is app SG, not 0.0.0.0/0.`,
  ),
  topic(
    "lambda-serverless",
    "Lambda & Serverless Overview",
    "Event-driven functions, API Gateway, and when serverless fits.",
    "intermediate",
    14,
    `## Lambda model

**AWS Lambda** runs code on demand—no server to patch. Pay per invocation and duration. Cold starts matter for latency-sensitive APIs.

\`\`\`javascript
export const handler = async (event) => {
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
\`\`\`

Deploy with SAM, Serverless Framework, or CDK.

## Triggers

- **API Gateway** — HTTP APIs
- **S3 events** — image processing on upload
- **SQS** — queue consumers
- **EventBridge** — scheduled cron jobs

## Limits

15-minute max timeout, package size limits, /tmp storage cap. Long jobs belong on ECS/Fargate or EC2.

## API Gateway + Lambda

REST or HTTP API routes to Lambda. Authorizers for JWT. CORS configured at gateway layer.

## IAM roles

Lambda execution role grants S3, DynamoDB, etc.—never hardcode AWS keys in environment.

## Observability

CloudWatch Logs automatic. X-Ray for tracing. Alert on error rate and duration p99.

## When not Lambda

WebSockets at scale, long DB transactions, heavy CPU—use containers on ECS/Fargate or EC2.

Serverless excels for spiky traffic and glue code. Steady high-throughput APIs often cost less on reserved EC2 or Fargate.`,
  ),
  capstoneChapter("aws-cloud-essentials", "Full-Stack on AWS", [
    "Launch EC2 (or use Elastic Beanstalk) running containerized API; security group allows 443 only via ALB.",
    "Create private RDS PostgreSQL; app connects via VPC; store credentials in Secrets Manager.",
    "S3 bucket for user uploads with IAM role on EC2/Lambda; presigned URL upload from frontend.",
    "Optional: Lambda + API Gateway for one stateless endpoint (e.g. image resize webhook).",
    "Document architecture diagram, monthly cost estimate, and teardown steps to avoid bill shock.",
  ]),
]);

const graphqlApisChapters = buildPathChapters("graphql-apis", [
  introChapter(
    "graphql-apis",
    "GraphQL APIs",
    "**GraphQL** lets clients request exactly the fields they need in one round trip. A **schema** defines types; **resolvers** fetch data from databases and services.",
    [
      "Define schemas with types, queries, and mutations",
      "Write resolvers that connect to data sources",
      "Avoid N+1 queries with batching and dataloaders",
      "Build a small GraphQL API with Apollo Server",
    ],
    "Create a Node project with `@apollo/server` and `graphql`. Run a hello-world schema at `http://localhost:4000` before adding a database.",
  ),
  topic(
    "schema-types",
    "Schema & Types",
    "SDL syntax, scalar types, objects, lists, and non-null constraints.",
    "beginner",
    14,
    `## Schema-first design

GraphQL schemas use **SDL** (Schema Definition Language):

\`\`\`graphql
type Query {
  post(id: ID!): Post
  posts(limit: Int = 10): [Post!]!
}

type Post {
  id: ID!
  title: String!
  body: String!
  author: User!
  createdAt: String!
}

type User {
  id: ID!
  name: String!
}
\`\`\`

**!\` means non-null. \`[Post!]!\` is a non-null list of non-null posts.

## Queries vs REST shapes

One GraphQL query fetches nested data:

\`\`\`graphql
query {
  posts(limit: 5) {
    title
    author { name }
  }
}
\`\`\`

REST might need \`/posts\` plus N calls to \`/users/:id\`.

## Input types and enums

\`\`\`graphql
enum PostStatus { DRAFT PUBLISHED }

input CreatePostInput {
  title: String!
  body: String!
  status: PostStatus = DRAFT
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
}
\`\`\`

## Interfaces and unions

**Interface** \`Node { id: ID! }\` with \`Post implements Node\` enables polymorphic queries. **Union** \`SearchResult = Post | User\` for mixed result types.

## Documentation

Descriptions in schema appear in GraphiQL—document fields teams will use:

\`\`\`graphql
"""Published blog post visible to readers."""
type Post { ... }
\`\`\`

## Evolution

Add fields without breaking clients; deprecate old fields:

\`\`\`graphql
title: String! @deprecated(reason: "Use headline")
\`\`\`

Schema is the contract. Review changes like public API versioning—clients depend on stable field names and nullability.`,
  ),
  topic(
    "queries-mutations",
    "Queries & Mutations",
    "Read and write operations, variables, and error handling patterns.",
    "intermediate",
    14,
    `## Queries read; mutations write

**Query** — side-effect free (in theory). **Mutation** — creates, updates, deletes.

\`\`\`graphql
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
  }
}
\`\`\`

Variables (\`$input\`) keep operations reusable and safe from string interpolation.

## Operation names

\`\`\`graphql
query GetPost($id: ID!) { ... }
\`\`\`

Named operations improve logs and Apollo Studio traces.

## Partial errors

GraphQL can return **200 OK** with \`errors\` array alongside partial \`data\`:

\`\`\`json
{
  "data": { "post": null },
  "errors": [{ "message": "Not found", "path": ["post"] }]
}
\`\`\`

Clients must check both \`errors\` and null fields.

## Mutation design

Group related writes in one mutation when atomicity matters. Avoid god mutations that do unrelated side effects—harder to retry and audit.

## Pagination

Relay-style **connections** (\`edges { node cursor }\`, \`pageInfo\`) or simple \`offset/limit\`. Cursor pagination scales better on large tables.

## Subscriptions (preview)

Real-time updates via WebSocket—covered in WebSockets path; GraphQL subscriptions use similar schema \`type Subscription\`.

## Introspection

Tools query \`__schema\` for auto-docs. Disable introspection in production if policy requires—trade-off vs developer experience.

Design mutations idempotently where possible (client mutation IDs) so retries do not double-charge or duplicate records.`,
  ),
  topic(
    "resolvers-context",
    "Resolvers & Context",
    "Functions that resolve each field and share auth, database, and loaders.",
    "intermediate",
    15,
    `## Resolver signature

\`\`\`javascript
const resolvers = {
  Query: {
    post: (_, { id }, context) => context.db.post.findUnique({ where: { id } }),
  },
  Post: {
    author: (post, _, context) => context.db.user.findUnique({ where: { id: post.authorId } }),
  },
};
\`\`\`

Parent value flows down the tree—\`Post.author\` receives the post object.

## Context object

Built per request:

\`\`\`javascript
context: ({ req }) => ({
  db,
  user: verifyJwt(req.headers.authorization),
})
\`\`\`

Pass authenticated user, dataloaders, and rate limiters—not global singletons that leak between requests.

## N+1 problem

Fetching 100 posts then 100 author queries kills performance.**DataLoader** batches:

\`\`\`javascript
const userLoader = new DataLoader(ids => batchLoadUsers(ids));
// in resolver: userLoader.load(post.authorId)
\`\`\`

## Authorization in resolvers

Check \`context.user\` before returning sensitive fields. Field-level auth:

\`\`\`javascript
email: (user, _, ctx) => ctx.user?.id === user.id ? user.email : null,
\`\`\`

Do not rely on "hidden" fields—clients can request any schema field.

## Error types

Throw \`GraphQLError\` with extensions (\`code: 'UNAUTHENTICATED'\`) for client handling.

## Testing resolvers

Unit test with mocked context. Integration test full operation against test database.

Resolvers are thin glue—heavy business logic belongs in service modules GraphQL and REST both call.`,
  ),
  topic(
    "apollo-server",
    "Apollo Server Basics",
    "Stand up a production GraphQL server with middleware and GraphiQL.",
    "intermediate",
    14,
    `## Minimal Apollo Server 4

\`\`\`javascript
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = \`...\`;
const resolvers = { ... };

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => ({ token: req.headers.authorization }),
});
console.log(\`GraphQL ready at \${url}\`);
\`\`\`

GraphiQL IDE at same URL for exploration.

## Express integration

\`\`\`javascript
import { expressMiddleware } from '@apollo/server/express4';
app.use('/graphql', expressMiddleware(server, { context }));
\`\`\`

Mount alongside REST routes during migration.

## Plugins

**ApolloServerPluginDrainHttpServer** for graceful shutdown. Custom plugins log operations, metrics, or block introspection.

## Validation

GraphQL validates queries against schema before resolvers run—unknown fields fail fast. Still validate mutation inputs with Zod or similar inside resolvers.

## Persisted queries

Allowlist hashed queries in production—reduces attack surface of arbitrary deep queries.

## Depth and complexity limits

Prevent malicious queries:

\`\`\`javascript
validationRules: [depthLimit(10), costAnalysis({ maximumCost: 1000 })],
\`\`\`

## Federation (awareness)

Large orgs split graphs across services with **Apollo Federation**—subgraphs compose a supergraph. Monoliths start single-schema.

Apollo Server gets you productive quickly. Add depth limits and auth context before exposing public internet traffic.`,
  ),
  capstoneChapter("graphql-apis", "Blog GraphQL API", [
    "Define schema: Query (posts, post), Mutation (createPost, publishPost), types Post/User/Comment.",
    "Implement resolvers with in-memory or SQLite/Postgres data; add DataLoader for Post.author and Post.comments.",
    "Add JWT context: only author can publish; public reads for published posts only.",
    "Write three client queries in GraphiQL including nested author and variable-based single post fetch.",
    "Document N+1 fix and add one integration test calling createPost + query round-trip.",
  ]),
]);

const authSessionsJwtChapters = buildPathChapters("auth-sessions-jwt", [
  introChapter(
    "auth-sessions-jwt",
    "Auth: Sessions & JWT",
    "Web authentication uses **cookies and server sessions** or **stateless JWT tokens** (often both: short access JWT + refresh token).",
    [
      "Implement secure cookie-based sessions",
      "Issue and verify JWT access and refresh tokens",
      "Hash passwords with bcrypt or Argon2",
      "Design login, logout, and token refresh flows",
    ],
    "Use an Express or FastAPI app with one User model. Install bcrypt and jsonwebtoken (or PyJWT). Never store plaintext passwords.",
  ),
  topic(
    "cookies-sessions",
    "Cookies & Server Sessions",
    "Stateful auth with server-side session stores and secure cookie flags.",
    "beginner",
    14,
    `## Session flow

1. User POSTs credentials
2. Server validates, creates **session** record (id → userId)
3. Server sets **Set-Cookie: sessionId=...** on response
4. Browser sends cookie on subsequent requests
5. Server looks up session, attaches user to request

\`\`\`javascript
req.session.userId = user.id;
// later
const user = await db.user.findUnique({ where: { id: req.session.userId } });
\`\`\`

## Session stores

In-memory sessions die on server restart—use **Redis** or database in production. express-session + connect-redis is a common Node stack.

## Cookie security flags

\`\`\`
Set-Cookie: sid=abc; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
\`\`\`

- **HttpOnly** — JavaScript cannot read (mitigates XSS token theft)
- **Secure** — HTTPS only
- **SameSite** — CSRF mitigation (\`Lax\` or \`Strict\`; \`None\` needs Secure)

## Logout

Destroy server session **and** clear cookie:

\`\`\`javascript
req.session.destroy(() => res.clearCookie('sid').sendStatus(204));
\`\`\`

## Session fixation

Regenerate session ID after login so attacker-provided IDs become useless.

## When sessions shine

Traditional web apps, server-rendered pages, immediate revocation (delete session row). Admin panels often prefer sessions over long-lived JWTs.

Sessions trade horizontal scaling complexity (shared store) for simpler revocation and smaller client-side attack surface.`,
  ),
  topic(
    "jwt-access-refresh",
    "JWT Access & Refresh Tokens",
    "Stateless access tokens, rotating refresh tokens, and storage trade-offs.",
    "intermediate",
    15,
    `## JWT structure

**Header.Payload.Signature** — base64url encoded. Payload claims:

\`\`\`json
{
  "sub": "user-42",
  "iat": 1710000000,
  "exp": 1710003600,
  "scope": "read:posts"
}
\`\`\`

Server verifies **signature** with secret (HS256) or public key (RS256)—no DB hit if only validating signature.

## Access token (short)

5–15 minute expiry. Sent in \`Authorization: Bearer\` header. Stolen token window is small.

## Refresh token (long)

Days or weeks. Stored **HttpOnly cookie** or secure storage—not localStorage for XSS reasons. Exchange for new access token at \`/auth/refresh\`.

\`\`\`javascript
const access = jwt.sign({ sub: user.id }, SECRET, { expiresIn: '15m' });
const refresh = jwt.sign({ sub: user.id, jti }, REFRESH_SECRET, { expiresIn: '7d' });
// store jti in DB for rotation/revocation
\`\`\`

## Rotation

On refresh, invalidate old refresh token jti, issue new pair—detects reuse (possible theft).

## RS256 for microservices

Auth service signs with private key; APIs verify with public key—no shared symmetric secret across services.

## What not to put in JWT

Passwords, PII you do not need, large objects. JWTs are readable (payload is not encrypted unless JWE).

JWTs enable mobile and SPA APIs. Pair short access tokens with refresh rotation and server-side refresh denylist for logout.`,
  ),
  topic(
    "password-hashing",
    "Password Hashing",
    "Store credentials safely with slow hashes and constant-time comparison.",
    "intermediate",
    13,
    `## Never store plaintext

Database leaks happen. **Hash** passwords so attackers work offline with brute force—slow hashes make that expensive.

## bcrypt

\`\`\`javascript
const hash = await bcrypt.hash(password, 12);
const ok = await bcrypt.compare(password, hash);
\`\`\`

Cost factor 12+ adjusts with hardware—rehash on login when upgrading cost.

## Argon2id

Winner of Password Hashing Competition—preferred for new systems. Libraries: \`argon2\` npm package.

## Salt

Hashes include random **salt** per password—rainbow tables useless. bcrypt embeds salt in output string.

## Timing attacks

Use library \`compare\` functions—constant time. Do not \`===\` hash strings yourself.

## Password policy

Minimum length 12+, check breached passwords (Have I Been Pwned API), optional complexity rules. UX: allow passphrases.

## Forgot password

Time-limited random token emailed once—single use, hashed in DB like passwords. Do not reveal whether email exists.

## MFA

TOTP (authenticator app) or WebAuthn passkeys dramatically reduce account takeover after password leak.

Hashing is necessary not sufficient—HTTPS, rate limiting login, and MFA complete the story.`,
  ),
  topic(
    "secure-auth-flows",
    "Secure Auth Flows",
    "Login, registration, CSRF, CORS, and production checklist.",
    "intermediate",
    14,
    `## Registration

Validate email format, unique constraint, hash password. Optionally verify email before full access. Rate limit signup endpoint.

## Login

\`\`\`javascript
const user = await db.user.findUnique({ where: { email } });
if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
\`\`\`

Same error message for wrong email vs password—prevent enumeration.

## CSRF with cookies

If auth uses cookies, **CSRF tokens** required on state-changing requests (\`SameSite=Lax\` helps but is not enough for all flows). Double-submit cookie or synchronizer token pattern.

## CORS + credentials

\`\`\`javascript
cors({ origin: 'https://app.example.com', credentials: true })
\`\`\`

Browser sends cookies only to allowed origins. Wildcard \`*\` incompatible with credentials.

## HTTPS everywhere

Secure cookies, HSTS, no auth over HTTP.

## Audit and lockout

Log failed attempts; temporary lockout or CAPTCHA after N failures from one IP.

## Authorization vs authentication

AuthN proves identity; **authZ** checks permissions (\`user.role === 'admin'\`). Middleware: authenticate first, authorize per route.

Ship auth with threat model: XSS steals tokens from localStorage, CSRF hits cookie sessions, leaked JWTs until expiry—mitigate each explicitly.`,
  ),
  capstoneChapter("auth-sessions-jwt", "Auth System", [
    "User model with email + passwordHash; register and login routes with bcrypt and validation.",
    "Issue access JWT (15m) + refresh token (7d) in HttpOnly cookie; `/auth/refresh` rotates pair.",
    "Protected route middleware verifying JWT; return 401/403 appropriately.",
    "Logout invalidates refresh token server-side; clear cookies.",
    "Write SECURITY.md listing cookie flags, token lifetimes, and CSRF approach for your SPA.",
  ]),
]);

const oauthSocialLoginChapters = buildPathChapters("oauth-social-login", [
  introChapter(
    "oauth-social-login",
    "OAuth & Social Login",
    "**OAuth 2.0** delegates authorization to providers like Google and GitHub. Users sign in without you storing their provider password.",
    [
      "Understand authorization code flow for web apps",
      "Register OAuth apps and configure redirect URIs",
      "Implement Google and GitHub login buttons",
      "Secure callbacks and link provider accounts to local users",
    ],
    "Create OAuth apps in Google Cloud Console and GitHub Developer Settings. Set redirect URI to `http://localhost:3000/auth/callback/google` (and GitHub variant).",
  ),
  topic(
    "oauth2-flows",
    "OAuth 2.0 Flows",
    "Authorization code, PKCE, and which flow fits SPAs vs server apps.",
    "beginner",
    14,
    `## Roles

- **Resource owner** — the user
- **Client** — your app
- **Authorization server** — Google, GitHub
- **Resource server** — API holding user data (often same org as auth server)

## Authorization code flow (server)

1. Redirect user to provider login URL with \`client_id\`, \`redirect_uri\`, \`scope\`, \`state\`
2. User approves; provider redirects back with **code**
3. Server exchanges code for **access token** (and optional refresh) using **client_secret**
4. Fetch user profile with access token
5. Create or link local session/JWT

\`\`\`
GET https://github.com/login/oauth/authorize?
  client_id=...&redirect_uri=...&scope=user:email&state=random
\`\`\`

## state parameter

Random \`state\` stored in session—verify on callback to prevent CSRF.

## PKCE for SPAs/mobile

Public clients cannot hide **client_secret**. Use **PKCE**: \`code_challenge\` on authorize, \`code_verifier\` on token exchange.

## Implicit flow (legacy)

Token in URL fragment—avoid for new apps. Use authorization code + PKCE instead.

## Scopes

Request minimum scopes (\`openid email profile\` for Google OIDC). Explain to users why you need each scope.

## OpenID Connect

OAuth + **id_token** JWT with standardized claims (\`sub\`, \`email\`). Simplifies "who is this user?" vs raw GitHub API profile fetch.

Pick one flow per client type and document it—security reviews start by reading your OAuth sequence diagram.`,
  ),
  topic(
    "google-github-login",
    "Google & GitHub Login",
    "Provider-specific setup and normalizing profile data into your User model.",
    "intermediate",
    14,
    `## Google OAuth setup

Google Cloud → APIs & Services → Credentials → OAuth 2.0 Client ID (Web application). Authorized redirect URIs must match exactly—including trailing slashes.

Scopes: \`openid\`, \`email\`, \`profile\`. Token endpoint returns id_token—verify signature with Google JWKS.

## GitHub OAuth

GitHub → Settings → Developer settings → OAuth App. Callback URL registered. Scopes: \`user:email\` if email private.

Exchange code at \`https://github.com/login/oauth/access_token\`. Fetch \`https://api.github.com/user\` and \`/user/emails\`.

## Normalize profiles

\`\`\`javascript
function normalizeProviderUser(provider, data) {
  return {
    provider,
    providerId: String(data.sub || data.id),
    email: data.email,
    name: data.name || data.login,
    avatarUrl: data.picture || data.avatar_url,
  };
}
\`\`\`

## Account linking

Table \`oauth_accounts(userId, provider, providerId)\`. If email matches existing user, prompt link or reject duplicate.

## Login button UX

\`\`\`html
<a href="/auth/google">Continue with Google</a>
\`\`\`

Server generates authorize URL—never embed client_secret in frontend.

## Local dev redirects

\`http://localhost:5173/auth/callback\` must be registered. Use separate OAuth clients for dev/staging/prod.

Provider APIs change slowly but redirect URI typos fail 100% of logins—copy-paste from app settings, do not guess.`,
  ),
  topic(
    "callback-security",
    "Callback Security",
    "Validate state, prevent open redirects, and handle errors safely.",
    "intermediate",
    13,
    `## Verify state

\`\`\`javascript
if (req.query.state !== req.session.oauthState) {
  return res.status(400).send('Invalid state');
}
delete req.session.oauthState;
\`\`\`

Attacker cannot forge callback without session cookie and matching state.

## HTTPS callbacks only in prod

Providers reject or warn on \`http://\` except localhost.

## Open redirect prevention

After login, redirect to allowlisted paths only:

\`\`\`javascript
const next = allowlist.includes(req.query.next) ? req.query.next : '/dashboard';
\`\`\`

Never \`redirect(req.query.returnUrl)\` unchecked.

## Error query params

Providers return \`?error=access_denied\`. Show friendly message; log for support.

## Token exchange server-side

Never expose **client_secret** in browser. SPA uses PKCE without secret; confidential server apps exchange code on backend.

## Short-lived codes

Authorization codes expire quickly—exchange immediately. Handle race if user double-clicks.

## Email verification edge cases

GitHub may hide email—handle missing email by requesting additional scope or manual entry with verification.

OAuth callbacks are public endpoints attackers probe. Rate limit, validate everything, and fail closed.`,
  ),
  topic(
    "token-storage",
    "Token Storage & Session Linking",
    "Where to store provider tokens and when to keep them on your server.",
    "intermediate",
    13,
    `## After OAuth success

Usually you **do not** expose provider access token to browser unless calling provider APIs client-side (e.g. Google Calendar integration).

Pattern:

1. Exchange code server-side
2. Upsert user + oauth_account row
3. Issue **your** session cookie or JWT
4. Optionally store provider refresh token encrypted for later API calls

## Encrypting stored tokens

\`\`\`javascript
// store encrypted refresh token if syncing GitHub repos later
oauthAccount.providerRefreshToken = encrypt(token, KEY);
\`\`\`

Rotate encryption keys with version prefix in ciphertext.

## When to keep provider tokens

- Import contacts once — discard after use
- Ongoing Google Drive sync — store refresh token with user consent and revocation UI

## Revocation

Settings page "Disconnect GitHub" deletes oauth row and calls provider revoke endpoint if available.

## JWT from your API

Same as password login after OAuth—user identity is local \`userId\`; provider linkage is implementation detail.

## Multi-provider same email

Policy decision: auto-merge, require password confirmation, or block duplicate emails.

Treat provider tokens like passwords—encrypt at rest, minimal scope, clear retention policy in privacy docs.`,
  ),
  capstoneChapter("oauth-social-login", "Social Login Integration", [
    "Register Google and GitHub OAuth apps; env vars for client id/secret per provider.",
    "Routes: `/auth/:provider` redirects with state; `/auth/callback/:provider` validates and exchanges code.",
    "Upsert User + OAuthAccount; issue session JWT or cookie on success.",
    "Add \"Connect GitHub\" on settings for existing password users; handle email collision.",
    "Test deny flow, invalid state, and document redirect URIs for each deployment environment.",
  ]),
]);

const websocketsRealtimeChapters = buildPathChapters("websockets-realtime", [
  introChapter(
    "websockets-realtime",
    "WebSockets & Realtime",
    "**WebSockets** maintain a persistent bidirectional channel—ideal for chat, live notifications, and collaborative editing.",
    [
      "Understand WebSocket handshake and framing vs HTTP polling",
      "Build events with Socket.io rooms and namespaces",
      "Design chat and presence patterns",
      "Plan scaling with Redis adapter and sticky sessions",
    ],
    "Create Node app with `socket.io` and a static HTML client. Confirm connection in browser DevTools → Network → WS tab.",
  ),
  topic(
    "websocket-protocol",
    "WebSocket Protocol",
    "Upgrade handshake, message types, and when WebSockets beat HTTP polling.",
    "beginner",
    13,
    `## Upgrade from HTTP

Client request:

\`\`\`http
GET /chat HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
\`\`\`

Server \`101 Switching Protocols\`—connection stays open for **frames** (text or binary).

## vs Long polling

Polling repeats HTTP requests—overhead and latency. **SSE** (Server-Sent Events) is one-way server→client over HTTP. WebSockets are full duplex on one connection.

## Native browser API

\`\`\`javascript
const ws = new WebSocket('wss://api.example.com/chat');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.send(JSON.stringify({ type: 'ping' }));
\`\`\`

Use \`wss://\` in production (TLS).

## Heartbeats

Detect dead connections with ping/pong frames or application-level heartbeat every 30s—proxies may kill idle sockets.

## Message format

JSON envelopes: \`{ type, payload, id }\`. Version protocol for backward compatibility.

## Backpressure

Slow clients buffer messages—set limits and drop or disconnect abusive peers.

## Fallback

Socket.io falls back to long polling if WebSocket blocked by corporate firewall—trade-off worth knowing.

WebSockets are stateful—design differs from REST. Connection lifecycle (open, auth, subscribe, disconnect) is your API surface.`,
  ),
  topic(
    "socket-io-basics",
    "Socket.io Basics",
    "Rooms, events, acknowledgments, and middleware on connections.",
    "intermediate",
    14,
    `## Server setup

\`\`\`javascript
import { Server } from 'socket.io';
const io = new Server(httpServer, { cors: { origin: 'https://app.example.com' } });

io.on('connection', (socket) => {
  console.log(socket.id);
  socket.on('chat:message', (msg, ack) => {
    io.to(msg.roomId).emit('chat:message', msg);
    ack?.({ ok: true });
  });
});
\`\`\`

## Rooms

\`\`\`javascript
socket.join(\`room:\${roomId}\`);
io.to(\`room:\${roomId}\`).emit('event', data);
\`\`\`

Broadcast excludes sender with \`socket.broadcast.to(room)\`.

## Auth middleware

\`\`\`javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!verify(token)) return next(new Error('Unauthorized'));
  socket.data.user = decode(token);
  next();
});
\`\`\`

Authenticate before \`connection\` handler runs.

## Acknowledgments

Client emits with callback—confirms server processed or returns errors.

## Namespaces

\`/admin\` vs \`/chat\` separate concerns and auth rules:

\`\`\`javascript
const adminNs = io.of('/admin');
\`\`\`

## Client

\`\`\`javascript
import { io } from 'socket.io-client';
const socket = io('https://api.example.com', { auth: { token } });
\`\`\`

Socket.io adds convenience—not required for raw WebSockets but speeds development with rooms and reconnection.`,
  ),
  topic(
    "chat-patterns",
    "Chat & Presence Patterns",
    "Message history, typing indicators, online status, and ordering.",
    "intermediate",
    14,
    `## Message persistence

Do not rely on socket memory alone—save to database on receive:

\`\`\`javascript
const saved = await db.message.create({ roomId, userId, body });
io.to(roomId).emit('chat:message', saved);
\`\`\`

Clients load history via REST on room open, then subscribe to live events.

## Ordering and IDs

Monotonic IDs or timestamps sort messages. Clock skew makes \`createdAt\` alone unreliable—use server-assigned sequence.

## Typing indicators

\`\`\`javascript
socket.on('chat:typing', ({ roomId }) => {
  socket.to(roomId).emit('chat:typing', { userId: socket.data.user.id });
});
\`\`\`

Debounce client emits (300ms). Auto-expire typing state after 3s without refresh.

## Presence

Track \`userId → socketIds\` in memory or Redis. On connect/disconnect update room roster. **Last seen** timestamp for async chat.

## Delivery semantics

At-most-once is default. For critical messages, client ack + retry with idempotency key. Exactly-once is hard—design for at-least-once with dedup.

## Moderation

Rate limit messages per user. Block list check before broadcast. Report flow for abuse.

Chat looks simple in demos; production needs persistence, authz (who can join room?), and pagination for history scrollback.`,
  ),
  topic(
    "scaling-realtime",
    "Scaling Realtime Apps",
    "Redis adapter, sticky sessions, and horizontal socket servers.",
    "advanced",
    15,
    `## Single server limit

In-memory rooms break with multiple Node processes—user A on server 1, user B on server 2, no shared emit.

## Redis adapter

\`\`\`javascript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
const pub = createClient({ url: REDIS_URL });
const sub = pub.duplicate();
io.adapter(createAdapter(pub, sub));
\`\`\`

Messages publish to Redis; all nodes receive and emit locally.

## Sticky sessions

Load balancer **session affinity** routes same client to same node—helps before Redis adapter or for connection state. Configure ALB/nginx \`ip_hash\` or cookie-based stickiness.

## Stateless HTTP + stateful WS

API remains stateless on K8s; WebSocket pods scale with Redis backplane. Separate health checks: HTTP \`/health\` vs WS connect test.

## Backplane alternatives

Kafka, NATS, or managed Ably/Pusher for global scale—Socket.io Redis suffices for many apps.

## Connection limits

Each socket consumes memory and file descriptors. Tune \`ulimit\`, pod memory, and max connections per instance.

## Graceful deploy

Drain connections: stop accepting new WS on old pods, wait timeout, deploy new version. SIGTERM handlers close io server cleanly.

Scale realtime by sharing events across nodes—Redis adapter is the default next step after single-server Socket.io.`,
  ),
  capstoneChapter("websockets-realtime", "Realtime Chat App", [
    "REST: create room, list messages; WS: join room, send message, receive broadcasts.",
    "Authenticate socket with JWT in handshake; authorize room membership before join.",
    "Persist messages in Postgres; paginate history on room load.",
    "Add typing indicator and online count for room.",
    "Docker Compose with API + Redis; verify two browser tabs receive messages with two API replicas (optional scale test).",
  ]),
]);

const testingJavascriptChapters = buildPathChapters("testing-javascript", [
  introChapter(
    "testing-javascript",
    "Testing JavaScript",
    "Automated tests catch regressions before users do. **Vitest** and **Jest** run unit tests; **Testing Library** helps test React components like users interact.",
    [
      "Configure Vitest or Jest in a TypeScript project",
      "Write unit tests with mocks and spies",
      "Test React components with Testing Library",
      "Structure integration tests for API handlers",
    ],
    "Add Vitest to a Vite React project: `pnpm add -D vitest @testing-library/react jsdom`. Add `\"test\": \"vitest\"` script and one passing smoke test.",
  ),
  topic(
    "vitest-jest-basics",
    "Vitest & Jest Basics",
    "Test structure, matchers, setup files, and running tests in watch mode.",
    "beginner",
    13,
    `## First test

\`\`\`javascript
import { describe, it, expect } from 'vitest';
import { sum } from './math';

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });
});
\`\`\`

**describe** groups tests; **it** (or **test**) is one case; **expect** asserts.

## Common matchers

\`\`\`javascript
expect(arr).toContain('a');
expect(obj).toEqual({ id: 1 });
expect(promise).resolves.toBe(true);
expect(fn).toThrow('invalid');
\`\`\`

## Vitest vs Jest

Vitest integrates with Vite—fast HMR for tests. Jest is ecosystem default for many CRA/Next setups. API is nearly identical; migration is mostly config.

## Config

\`\`\`javascript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: { provider: 'v8' },
  },
});
\`\`\`

## Watch mode

\`\`\`bash
pnpm vitest
pnpm vitest run   # CI single pass
\`\`\`

## Setup file

\`\`\`javascript
import '@testing-library/jest-dom/vitest';
\`\`\`

Extends matchers like \`toBeInTheDocument()\`.

## File naming

\`*.test.ts\` or \`*.spec.ts\` colocated with source or in \`__tests__/\`.

Tests are documentation that executes. Start with pure functions—easy wins before async and DOM.`,
  ),
  topic(
    "unit-tests-mocks",
    "Unit Tests & Mocks",
    "Isolate code with mocks, spies, and fake timers.",
    "intermediate",
    14,
    `## Why mock

Unit tests target one module. Dependencies (HTTP, database, Date.now) get **mocked** for speed and determinism.

## vi.fn and spies

\`\`\`javascript
const fetchUser = vi.fn().mockResolvedValue({ id: 1, name: 'Ada' });
await loadProfile(fetchUser);
expect(fetchUser).toHaveBeenCalledWith(1);
\`\`\`

## Module mocks

\`\`\`javascript
vi.mock('./api', () => ({
  fetchPosts: vi.fn(() => Promise.resolve([])),
}));
\`\`\`

Import mocked module after \`vi.mock\` hoisting rules—Vitest docs show patterns.

## Partial mocks

\`\`\`javascript
vi.spyOn(console, 'error').mockImplementation(() => {});
\`\`\`

Restore after test: \`mockRestore()\` or \`afterEach(() => vi.restoreAllMocks())\`.

## Fake timers

\`\`\`javascript
vi.useFakeTimers();
setTimeout(callback, 1000);
vi.advanceTimersByTime(1000);
expect(callback).toHaveBeenCalled();
vi.useRealTimers();
\`\`\`

Test debounce, polling, and expiry without waiting.

## Avoid over-mocking

Mock boundaries (HTTP client), not every internal function—tests should survive refactors.

## AAA pattern

**Arrange** data, **Act** on unit, **Assert** outcome. One logical assertion focus per test when possible.

Good mocks make tests fast and flaky-free. Bad mocks test implementation details—assert observable behavior instead.`,
  ),
  topic(
    "testing-react",
    "Testing React Components",
    "Render components, query by role, simulate clicks, and async updates.",
    "intermediate",
    15,
    `## Testing Library philosophy

Test how users see the app—roles, labels, text—not implementation (\`wrapper.state()\`).

\`\`\`javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

it('increments count', async () => {
  const user = userEvent.setup();
  render(<Counter />);
  await user.click(screen.getByRole('button', { name: /increment/i }));
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
\`\`\`

## Queries priority

Prefer **getByRole**, **getByLabelText**, **getByText**. \`getByTestId\` last resort.

## Async UI

\`\`\`javascript
render(<UserList />);
expect(await screen.findByText('Ada')).toBeInTheDocument();
\`\`\`

\`findBy*\` waits for appearance; \`waitFor\` for custom conditions.

## Providers wrapper

\`\`\`javascript
function renderWithProviders(ui) {
  return render(
    <QueryClientProvider client={testQueryClient}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>
  );
}
\`\`\`

Router, React Query, and context need test wrappers.

## MSW for fetch

**Mock Service Worker** intercepts network in tests—components call real \`fetch\`, MSW returns fixtures.

## Snapshot caution

Snapshot entire trees—noisy and brittle. Snapshot small stable outputs (serializers) sparingly.

## Accessibility bonus

Role-based queries encourage accessible markup—tests push you toward correct \`aria-label\` and button elements.

Component tests sit between unit and e2e—fast feedback that forms and buttons wire correctly.`,
  ),
  topic(
    "integration-e2e",
    "Integration & E2E Overview",
    "Test API routes, Playwright flows, and CI test pyramids.",
    "intermediate",
    14,
    `## Integration tests

Hit real HTTP handler with supertest or fetch against test server:

\`\`\`javascript
const res = await request(app).post('/api/posts').send({ title: 'Hi' });
expect(res.status).toBe(201);
\`\`\`

Use test database (Docker Postgres) or transactions rolled back after each test.

## E2E with Playwright

\`\`\`javascript
test('login flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/dashboard');
});
\`\`\`

Runs real browser—slow but high confidence for critical paths.

## Test pyramid

Many unit tests, fewer integration, handful of e2e smoke tests. E2e flakiness costs CI trust—stabilize selectors and use \`data-testid\` sparingly.

## CI configuration

\`\`\`yaml
- run: pnpm test --coverage
- run: pnpm exec playwright test
\`\`\`

Playwright needs browser install step \`npx playwright install --with-deps\`.

## Parallelization and sharding

Split e2e across CI jobs by file glob when suite grows.

## What to e2e test

Signup, login, checkout, publish post—revenue and auth paths. Skip every edge case—unit tests cover those.

Balance speed and confidence. Most teams under-invest in integration tests around API boundaries.`,
  ),
  capstoneChapter("testing-javascript", "Test Suite for a Feature", [
    "Unit tests for pure utils (slugify, formatDate) with edge cases.",
    "Component test: form validation shows errors; successful submit calls mock API.",
    "MSW or mock fetch for list component loading and error states.",
    "One supertest integration test for POST `/api/posts` with test DB.",
    "Optional Playwright smoke: homepage loads and nav works; document `pnpm test` in README.",
  ]),
]);

const testingPythonChapters = buildPathChapters("testing-python", [
  introChapter(
    "testing-python",
    "Testing Python",
    "**pytest** is the standard Python test runner—simple asserts, powerful fixtures, and plugins for coverage and async.",
    [
      "Structure tests and run pytest with coverage",
      "Use fixtures for database and client setup",
      "Mock external services with unittest.mock",
      "Test FastAPI and Flask endpoints with TestClient",
    ],
    "Create `tests/` folder, `pip install pytest pytest-cov httpx`, and add `test_health.py` asserting True. Run `pytest -v`.",
  ),
  topic(
    "pytest-basics",
    "pytest Basics",
    "Test discovery, asserts, parametrize, and markers.",
    "beginner",
    13,
    `## Simple test

\`\`\`python
def test_add():
    assert add(2, 3) == 5
\`\`\`

No boilerplate classes required—pytest discovers \`test_*.py\` and \`test_*\` functions.

## Running

\`\`\`bash
pytest
pytest tests/test_auth.py -v
pytest -k "login" --maxfail=1
pytest --cov=app --cov-report=term-missing
\`\`\`

## Parametrize

\`\`\`python
@pytest.mark.parametrize("email,valid", [
    ("a@b.co", True),
    ("not-email", False),
])
def test_validate_email(email, valid):
    assert validate_email(email) is valid
\`\`\`

One test function, many cases—clear failure output per input.

## Exceptions

\`\`\`python
with pytest.raises(ValueError, match="empty"):
    parse("")
\`\`\`

## Markers

\`\`\`python
@pytest.mark.slow
def test_heavy(): ...
\`\`\`

Run \`pytest -m "not slow"\` in dev CI.

## conftest.py

Shared fixtures live in \`conftest.py\`—auto-imported per directory tree.

## Assert introspection

pytest rewrites asserts to show left/right on failure—better than \`self.assertEqual\`.

Start pytest early in Python projects—retrofitting tests onto untested Flask apps is slower than testing new code from day one.`,
  ),
  topic(
    "fixtures-parametrize",
    "Fixtures & Test Data",
    "Setup/teardown, scope, factories, and database fixtures.",
    "intermediate",
    14,
    `## Fixture basics

\`\`\`python
@pytest.fixture
def db_session():
    session = create_test_session()
    yield session
    session.rollback()
    session.close()

def test_create_user(db_session):
    user = User(email="a@b.co")
    db_session.add(user)
    db_session.commit()
    assert user.id is not None
\`\`\`

**yield** fixtures run teardown after test.

## Scope

\`\`\`python
@pytest.fixture(scope="session")
def app(): ...
\`\`\`

- **function** — default, per test
- **module** — once per file
- **session** — once per pytest run

Expensive app startup often \`session\`; DB often \`function\` with rollback.

## factory_boy / faker

Generate test data without copy-paste:

\`\`\`python
user = UserFactory(email="unique@example.com")
\`\`\`

## Autouse fixtures

\`\`\`python
@pytest.fixture(autouse=True)
def reset_cache(): ...
\`\`\`

Runs for every test in scope—use sparingly for global resets.

## pytest-asyncio

\`\`\`python
@pytest.mark.asyncio
async def test_fetch():
    result = await fetch_data()
    assert result.status == 200
\`\`\`

## tmp_path

Built-in fixture for filesystem tests:

\`\`\`python
def test_write_file(tmp_path):
    p = tmp_path / "out.txt"
    p.write_text("hello")
\`\`\`

Fixtures encode test environment assumptions—document heavy fixtures so new contributors know setup cost.`,
  ),
  topic(
    "mocking-requests",
    "Mocking & External Services",
    "unittest.mock, pytest-mock, and faking HTTP with respx.",
    "intermediate",
    13,
    `## patch

\`\`\`python
from unittest.mock import patch

@patch("app.services.requests.get")
def test_fetch(mock_get):
    mock_get.return_value.json.return_value = {"rate": 1.2}
    assert get_exchange_rate("EUR") == 1.2
    mock_get.assert_called_once()
\`\`\`

Patch where **used**, not where defined.

## pytest-mock mocker

\`\`\`python
def test_send(mocker):
    mocker.patch("app.mail.send", return_value=True)
    assert notify_user() is True
\`\`\`

## httpx/respx for async HTTP

\`\`\`python
import respx
import httpx

@respx.mock
async def test_api():
    respx.get("https://api.example.com/data").respond(json={"ok": True})
    async with httpx.AsyncClient() as client:
        r = await client.get("https://api.example.com/data")
    assert r.json()["ok"]
\`\`\`

## Do not mock what you own

Test database logic against real test Postgres when feasible—mock only external payment/email APIs.

## Time freezing

\`\`\`python
from freezegun import freeze_time

@freeze_time("2024-06-01")
def test_token_expiry(): ...
\`\`\`

Mocks at system boundaries keep tests fast while integration tests prove wiring.`,
  ),
  topic(
    "testing-fastapi-flask",
    "Testing FastAPI & Flask",
    "TestClient, dependency overrides, and auth headers.",
    "intermediate",
    14,
    `## FastAPI TestClient

\`\`\`python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"ok": True}
\`\`\`

## Override dependencies

\`\`\`python
app.dependency_overrides[get_db] = lambda: test_db_session
\`\`\`

Inject test database without touching production connection.

## Auth in tests

\`\`\`python
headers = {"Authorization": f"Bearer {create_test_token(user_id=1)}"}
r = client.post("/posts", json={"title": "Hi"}, headers=headers)
\`\`\`

## Flask test client

\`\`\`python
def test_login(client):
    r = client.post("/login", json={"email": "a@b.co", "password": "secret"})
    assert r.status_code == 200
\`\`\`

Use app factory pattern \`create_app('testing')\` with in-memory SQLite.

## Transaction rollbacks

Wrap each test in DB transaction; rollback in fixture teardown—fast isolation without recreating schema.

## Async routes

FastAPI TestClient runs async internally; for async tests prefer **httpx.AsyncClient** with **ASGITransport**.

API tests verify status codes, JSON shape, and auth gates—the contract your frontend depends on.`,
  ),
  capstoneChapter("testing-python", "API Test Suite", [
    "pytest structure with conftest.py: app fixture, db_session with rollback, test client fixture.",
    "Unit tests for validators and service functions with parametrize edge cases.",
    "Integration tests: create user, login, authorized POST creates resource, 401 without token.",
    "Mock email sender with patch; assert called on signup.",
    "CI snippet running `pytest --cov=app --cov-fail-under=80` (adjust threshold reasonably).",
  ]),
]);

const algorithmsBasicsChapters = buildPathChapters("algorithms-basics", [
  introChapter(
    "algorithms-basics",
    "Algorithms Basics",
    "Algorithms are step-by-step procedures to solve problems. **Big O** describes growth rate; sorting, searching, and recursion appear in every interview and production optimization.",
    [
      "Analyze time and space with Big O notation",
      "Implement classic sorting and searching algorithms",
      "Solve problems with recursion and divide-and-conquer",
      "Apply two-pointer, sliding window, and hash map patterns",
    ],
    "Use Python or JavaScript locally. Create `algo/` folder with one file per topic. Optional: [LeetCode](https://leetcode.com) or similar for extra drills.",
  ),
  topic(
    "big-o-complexity",
    "Big O Complexity",
    "Asymptotic analysis, common complexities, and trade-offs.",
    "beginner",
    14,
    `## Why Big O

Hardware varies; **Big O** describes how runtime or memory grows with input size **n**—compare algorithms fairly.

## Common classes

| Notation | Name | Example |
|----------|------|---------|
| O(1) | Constant | Hash map lookup |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Single loop |
| O(n log n) | Linearithmic | Merge sort |
| O(n²) | Quadratic | Nested loops |

Drop constants and lower terms: O(2n + 5) → O(n).

## Space complexity

Extra memory besides input—auxiliary space. In-place algorithms O(1) extra; merge sort O(n) for temp array.

## Best, average, worst

Quicksort average O(n log n), worst O(n²) without good pivot—document which case Big O states (usually worst or amortized).

## Analyze loops

\`\`\`javascript
for (let i = 0; i < n; i++)
  for (let j = i; j < n; j++)
    // O(n²)
\`\`\`

## Hidden costs

\`arr.sort()\` is O(n log n). \`arr.includes(x)\` is O(n)—prefer Set for repeated lookups.

## Practical note

n = 1000, O(n²) may be fine; n = 1e6, it breaks. Profile before micro-optimizing O(1) vs O(log n) on tiny lists.

Big O is language for engineering discussions—"this endpoint is O(n²) in number of tags" triggers redesign before launch.`,
  ),
  topic(
    "sorting-searching",
    "Sorting & Searching",
    "Binary search, merge sort intuition, and built-in sort usage.",
    "intermediate",
    14,
    `## Linear search

Check each element—O(n). Fine for unsorted small arrays.

## Binary search

Sorted array only—halve search space each step O(log n):

\`\`\`javascript
function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
\`\`\`

Beware integer overflow in other languages—use \`lo + (hi - lo) / 2\`.

## Merge sort idea

Divide array in half, sort halves, merge—O(n log n) guaranteed. Teaches recursion and stable sort.

## Quicksort idea

Pick pivot, partition smaller/larger—average O(n log n). In-place, cache-friendly—why many stdlib sorts use variants.

## Use library sort

Production: \`arr.sort((a,b) => a - b)\` with comparator. Custom sorts for objects by key.

## Searching variants

First/last occurrence in sorted array with binary search variants. Search rotated sorted array—interview favorite.

## Sorting + two-pointer

Sorted array enables O(n) two-sum vs O(n²) brute force.

Know implementations for interviews; ship with battle-tested library sorts unless you have special constraints (external sort, partial order).`,
  ),
  topic(
    "recursion",
    "Recursion & Divide-and-Conquer",
    "Base cases, call stacks, and breaking problems into subproblems.",
    "intermediate",
    13,
    `## Structure

Every recursive function needs:

1. **Base case** — stop condition
2. **Recursive case** — smaller subproblem

\`\`\`javascript
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
\`\`\`

## Call stack depth

Deep recursion overflows stack—JavaScript ~10k frames. Tail recursion not optimized in JS engines—use loops for deep iteration.

## Divide and conquer

Merge sort, quicksort, binary search—split problem, solve subparts, combine.

## Memoization

Fibonacci naive O(2^n); memo O(n):

\`\`\`javascript
const memo = new Map();
function fib(n) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  const v = fib(n - 1) + fib(n - 2);
  memo.set(n, v);
  return v;
}
\`\`\`

## Tree recursion

DFS on trees naturally recursive—base case null node. Convert to explicit stack for very deep trees.

## When recursion fits

Problem defined recursively: directories, JSON trees, graph DFS, backtracking (permutations, sudoku).

Practice identifying base case first—most recursion bugs are missing or wrong base.`,
  ),
  topic(
    "common-patterns",
    "Common Interview Patterns",
    "Two pointers, sliding window, hash maps, and BFS/DFS overview.",
    "intermediate",
    15,
    `## Hash map counting

Frequency count in O(n):

\`\`\`javascript
const freq = new Map();
for (const c of s) freq.set(c, (freq.get(c) || 0) + 1);
\`\`\`

Anagrams, duplicates, first unique char.

## Two pointers

Sorted array pair sum, palindrome check, merge sorted arrays—left/right pointers move based on comparison.

## Sliding window

Subarray with sum ≤ k, longest substring without repeat—expand right, shrink left while invalid.

\`\`\`javascript
for (let r = 0; r < n; r++) {
  add(arr[r]);
  while (invalid()) remove(arr[l++]);
  updateAnswer();
}
\`\`\`

## Stack monotonic

Next greater element, valid parentheses—stack tracks candidates.

## BFS / DFS graphs

Adjacency list; BFS shortest unweighted path; DFS connectivity and cycles. **Visited** set prevents infinite loops.

## Greedy (caution)

Local optimal choices—works for some problems (activity selection), fails others—prove or test.

## Practice strategy

Pattern recognition beats memorizing 500 solutions—classify problem, apply template, handle edge cases (empty input, single element).

These patterns cover most easy/medium coding interviews and real problems like deduping, windowed metrics, and graph traversal.`,
  ),
  capstoneChapter("algorithms-basics", "Interview Problem Set", [
    "Implement binary search and verify with empty, single, and missing target cases.",
    "Two-sum with hash map O(n); document brute force O(n²) for comparison.",
    "Sliding window: longest substring without repeating characters.",
    "BFS shortest path in unweighted grid or graph from adjacency list.",
    "Write README summarizing Big O of each solution and one production scenario where pattern applies.",
  ]),
]);

const dataStructuresChapters = buildPathChapters("data-structures", [
  introChapter(
    "data-structures",
    "Data Structures",
    "Data structures organize memory for efficient operations. Choosing the right one separates O(1) lookups from O(n) scans.",
    [
      "Compare arrays and linked lists trade-offs",
      "Use stacks and queues for LIFO/FIFO workflows",
      "Traverse trees and understand BST operations",
      "Leverage hash maps and sets in application code",
    ],
    "Implement structures in TypeScript or Python in `structures/` folder. Use diagrams on paper before coding pointers.",
  ),
  topic(
    "arrays-linked-lists",
    "Arrays & Linked Lists",
    "Contiguous memory vs nodes, dynamic arrays, and big-O of operations.",
    "beginner",
    14,
    `## Arrays

Contiguous memory—**index access O(1)**. Insert/delete middle O(n) due to shifting. Dynamic arrays (ArrayList, JS Array) amortized O(1) push at end.

\`\`\`javascript
const arr = [10, 20, 30];
arr.push(40);      // O(1) amortized
arr.unshift(5);    // O(n)
\`\`\`

## Linked lists

Nodes with \`value\` + \`next\` pointer—insert/delete at known node O(1), search O(n), no random access.

\`\`\`javascript
class Node {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
  }
}
\`\`\`

## Doubly linked lists

\`prev\` and \`next\`—O(1) delete at iterator; used in LRU caches.

## When to use which

Arrays: iteration, indexing, cache locality. Linked lists: frequent middle inserts (rare in high-level apps—arrays often win due to hardware).

## JS arrays are versatile

Dynamic array + hash table hybrid for object keys in some engines—know language semantics.

Interview linked list tricks: fast/slow pointers (cycle detection, middle find), reverse in-place.`,
  ),
  topic(
    "stacks-queues",
    "Stacks & Queues",
    "LIFO and FIFO structures for parsing, undo, and BFS.",
    "beginner",
    13,
    `## Stack (LIFO)

Push/pop from same end—O(1).

\`\`\`javascript
const stack = [];
stack.push(1);
stack.pop();
\`\`\`

Uses: parentheses validation, DFS iterative, undo history, call stack model.

## Queue (FIFO)

Enqueue back, dequeue front—O(1) with linked list or circular buffer.

\`\`\`javascript
const queue = [];
queue.push(1);
queue.shift(); // O(n) in JS—use head index or dedicated deque
\`\`\`

Uses: BFS, task schedulers, rate limiting windows.

## Deque

Double-ended queue—push/pop both ends O(1) with proper implementation.

## Priority queue / heap

Extract min/max in O(log n)—scheduling, Dijkstra, top-K elements. JS: use library heap or sort small batches.

## Monotonic stack/queue

Maintains increasing/decreasing order—next greater element in O(n).

## Real apps

Browser back stack, breath-first crawl frontier, message queues (Redis, SQS) are distributed queues—same concept, different scale.

Pick stack vs queue based on processing order requirement, not familiarity alone.`,
  ),
  topic(
    "trees-bst",
    "Trees & Binary Search Trees",
    "Hierarchy, traversals, BST property, and balanced tree awareness.",
    "intermediate",
    15,
    `## Tree terminology

**Root**, **children**, **leaf**, **height**, **depth**. Binary tree: max two children per node.

## Traversals

- **Inorder** (left, node, right) — BST gives sorted order
- **Preorder** (node, left, right) — copy tree
- **Postorder** (left, right, node) — delete tree
- **Level order** — BFS with queue

\`\`\`javascript
function inorder(node, out = []) {
  if (!node) return out;
  inorder(node.left, out);
  out.push(node.val);
  inorder(node.right, out);
  return out;
}
\`\`\`

## Binary Search Tree

Left subtree < node < right subtree.**Search O(h)** where h is height.

## Unbalanced worst case

Skewed tree h = n → O(n) operations—why **AVL** and **Red-Black** trees rebalance to O(log n).

## Tries

Character-by-character paths—autocomplete, IP routing prefixes.

## DOM and JSON

Trees everywhere—DOM nodes, JSON objects (not binary but hierarchical). DFS/BFS applies to file systems and org charts.

## No native BST in JS

Use \`Map\` (hash) for average O(1) lookups; \`TreeMap\` in Java/C# when ordered keys needed.

Understand trees for interviews and for any hierarchical data—ORM category trees, comment threads, permission inheritance.`,
  ),
  topic(
    "hash-maps",
    "Hash Maps & Sets",
    "Hashing, collisions, and using Map/Set/dict in daily code.",
    "intermediate",
    13,
    `## Hash map idea

Key → hash function → bucket → value. Average O(1) get/set/delete.

\`\`\`javascript
const map = new Map();
map.set('user:42', { name: 'Ada' });
map.get('user:42');
\`\`\`

\`\`\`python
counts = {}
counts[key] = counts.get(key, 0) + 1
\`\`\`

## Set

Unique keys only—membership O(1) average:

\`\`\`javascript
const seen = new Set([1, 2, 3]);
seen.has(2);
\`\`\`

Dedup, graph visited nodes, tag uniqueness.

## Collisions

Multiple keys same bucket—chaining (linked list) or open addressing. Load factor triggers resize.

## Object vs Map in JS

\`Map\` allows any key type, maintains insertion order, better for frequent add/delete. \`Object\` fine for static string keys.

## Immutable maps

Persistent data structures in functional libs—React state updates without mutating prior map.

## Database index analogy

B-tree index is not hash—range queries use index; equality sometimes hash index (Postgres hash index niche).

Reach for hash map when you need "have I seen this?" or O(1) lookup by id—default tool for frequency and caching in memory.`,
  ),
  capstoneChapter("data-structures", "Implement Core Structures", [
    "Singly linked list with insert, delete, reverse; unit test each operation.",
    "Stack-based valid parentheses checker; queue-based BFS on grid.",
    "BST insert and search; inorder traversal output sorted values.",
    "LRU cache sketch using Map + doubly linked list (or describe approach if time-boxed).",
    "Document time/space complexity table for each structure in README.",
  ]),
]);

const supabaseFullstackChapters = buildPathChapters("supabase-fullstack", [
  introChapter(
    "supabase-fullstack",
    "Supabase Full Stack",
    "**Supabase** is Postgres + Auth + Storage + Realtime + Edge Functions—Firebase-like DX with open-source SQL underneath.",
    [
      "Create projects and connect from JavaScript client",
      "Implement email/password and OAuth auth",
      "Write Row Level Security policies",
      "Use storage buckets and realtime subscriptions",
    ],
    "Sign up at supabase.com, create a project, copy URL and anon key. `pnpm add @supabase/supabase-js`. Store keys in `.env` (not committed).",
  ),
  topic(
    "auth-rls",
    "Auth & Row Level Security",
    "Supabase Auth users and Postgres RLS policies enforcing tenant isolation.",
    "intermediate",
    15,
    `## Supabase Auth

\`\`\`javascript
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { data, error } = await supabase.auth.signUp({
  email, password,
});
\`\`\`

JWT issued; \`auth.uid()\` available in SQL policies.

## Row Level Security

Enable RLS on table:

\`\`\`sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
\`\`\`

Without policy, RLS blocks all access—define explicit allow rules.

## anon vs service role

**anon** key respects RLS in client browsers.**service_role** bypasses RLS—server only, never expose to frontend.

## OAuth providers

Enable Google/GitHub in Supabase dashboard; redirect URLs configured. Client \`signInWithOAuth\`.

## Profiles pattern

\`auth.users\` is managed—public \`profiles\` table keyed by \`id uuid references auth.users\`.

## Testing policies

Use SQL as authenticated user:

\`\`\`sql
SET request.jwt.claim.sub = 'user-uuid';
SELECT * FROM posts;
\`\`\`

RLS is your authorization layer—misconfigured policies leak or block data silently. Test SELECT/INSERT/UPDATE/DELETE per role.`,
  ),
  topic(
    "postgres-storage",
    "Postgres & Storage",
    "Tables, migrations, SQL editor, and file buckets.",
    "intermediate",
    14,
    `## Schema design

Use Supabase SQL editor or migrations. Prefer UUID primary keys \`gen_random_uuid()\` for public IDs.

\`\`\`sql
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);
\`\`\`

## Client queries

\`\`\`javascript
const { data } = await supabase
  .from('posts')
  .select('*, profiles(name)')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
\`\`\`

PostgREST translates to SQL—foreign key joins in select string.

## Storage buckets

\`\`\`javascript
await supabase.storage.from('avatars').upload(\`\${userId}/avatar.png\`, file);
const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
\`\`\`

Bucket policies mirror RLS—public vs authenticated upload paths.

## Migrations workflow

Local Supabase CLI \`supabase db diff\` / \`migration up\` for team parity with remote.

## Indexes

Add indexes on \`user_id\`, \`created_at\` columns you filter—check slow queries in dashboard.

## Edge Functions (preview)

Deno functions for webhooks and privileged logic—keep secrets off client.

Postgres is the source of truth; Supabase client is thin HTTP. Know SQL for anything beyond CRUD convenience.`,
  ),
  topic(
    "realtime-subscriptions",
    "Realtime Subscriptions",
    "Listen to postgres changes and broadcast presence.",
    "intermediate",
    13,
    `## Subscribe to changes

\`\`\`javascript
const channel = supabase
  .channel('posts-changes')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'posts' },
    (payload) => console.log(payload.new)
  )
  .subscribe();
\`\`\`

Enable replication on table in dashboard for \`postgres_changes\`.

## Filter by column

\`\`\`javascript
filter: 'user_id=eq.' + userId
\`\`\`

Reduce noise to relevant rows.

## Broadcast and presence

\`\`\`javascript
channel.on('broadcast', { event: 'cursor' }, handler);
channel.track({ user: 'online' });
\`\`\`

Collaborative cursors, typing indicators without polling.

## Cleanup

\`\`\`javascript
supabase.removeChannel(channel);
\`\`\`

Prevent duplicate subscriptions on React strict mode remount—useEffect cleanup.

## Authorization

Realtime respects RLS—clients only receive rows they can SELECT.

## vs Socket.io

Supabase Realtime ties to DB events—less custom server; complex game state may still need dedicated WS server.

Realtime fits live dashboards, chat, and notification feeds wired directly to Postgres writes.`,
  ),
  topic(
    "edge-functions",
    "Edge Functions & Server Logic",
    "Deno edge functions for secrets, webhooks, and privileged operations.",
    "intermediate",
    14,
    `## When to use Edge Functions

- Stripe webhook verification with secret key
- Send email with API key server-side
- Aggregate data bypassing client RLS with service role (carefully)

Browser uses anon key; edge holds service role from env.

## Basic function

\`\`\`typescript
import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  // privileged work
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
\`\`\`

## Deploy

\`\`\`bash
supabase functions deploy my-function
\`\`\`

Invoke from client:

\`\`\`javascript
await supabase.functions.invoke('my-function', { body: { id: 1 } });
\`\`\`

## Auth in functions

Verify JWT from \`Authorization\` header; reject unsigned calls for user-specific actions.

## CORS

Configure allowed origins on functions serving browser calls.

## Cold starts

Edge functions spin up on demand—latency for first hit; keep handlers lean.

Not everything belongs in edge—long jobs go to background workers. Use edge for short secret-bearing HTTP handlers.`,
  ),
  capstoneChapter("supabase-fullstack", "Full Stack Supabase App", [
    "Schema: profiles, posts with RLS (users CRUD own posts, public read published).",
    "Auth: sign up, login, protected create-post page using session from supabase-js.",
    "Storage: avatar upload with bucket policy limiting path to `{userId}/*`.",
    "Realtime: new post INSERT subscription updates feed without refresh.",
    "Optional edge function for admin stats using service role; document env vars and policy SQL in repo.",
  ]),
]);

const cybersecurityWebChapters = buildPathChapters("cybersecurity-web", [
  introChapter(
    "cybersecurity-web",
    "Web Security",
    "Web apps face predictable attack classes. **OWASP Top 10** catalogs risks; defense combines framework defaults, headers, validation, and secure coding habits.",
    [
      "Map OWASP Top 10 to concrete mitigations",
      "Prevent XSS, CSRF, and SQL injection",
      "Configure security headers and HTTPS",
      "Run a basic security review checklist",
    ],
    "Run [OWASP ZAP](https://www.zaproxy.org/) or browser DevTools against a local app. Review response headers with curl -I.",
  ),
  topic(
    "owasp-top-10",
    "OWASP Top 10 Overview",
    "Broken access control, crypto failures, injection, and insecure design.",
    "beginner",
    14,
    `## What OWASP Top 10 is

Community-ranked **most critical web application risks**—updated periodically. Not exhaustive but prioritization for reviews and training.

## Broken Access Control

Users access others' data by changing IDs in URLs (\`/api/orders/999\`). **Fix**: authorize every request—\`order.userId === req.user.id\`. Never trust client-side hiding alone.

## Cryptographic Failures

Passwords plaintext, weak TLS, secrets in repos. **Fix**: bcrypt/Argon2, HTTPS everywhere, secret managers.

## Injection

SQL, command, LDAP injection when user input concatenated into queries. **Fix**: parameterized queries, ORMs, avoid \`shell.exec(userInput)\`.

## Insecure Design

Missing threat modeling—password reset without rate limit, no MFA option. **Fix**: security user stories in sprint planning.

## Security Misconfiguration

Default admin passwords, debug mode in prod, directory listing. **Fix**: hardening checklists, automated config audit.

## Vulnerable Components

Outdated \`npm\` packages with CVEs. **Fix**: Dependabot, \`npm audit\`, pin and update.

## Identification & Auth Failures

Weak session management, credential stuffing. **Fix**: MFA, rate limits, secure cookies.

## Software & Data Integrity

Unsigned CI artifacts, compromised CDN scripts. **Fix**: lockfiles, SRI hashes on third-party scripts.

## Logging & Monitoring Failures

Breaches undetected for months. **Fix**: audit logs, alerting on auth anomalies.

## SSRF

Server fetches attacker-controlled URLs, hits internal metadata. **Fix**: allowlist outbound URLs, block RFC1918 in fetch helpers.

Use Top 10 as review lens—walk each category against your app architecture annually.`,
  ),
  topic(
    "xss-csrf",
    "XSS & CSRF",
    "Cross-site scripting and cross-site request forgery attacks and defenses.",
    "intermediate",
    15,
    `## XSS (Cross-Site Scripting)

Attacker injects script executed in victim's browser—steals cookies, performs actions as user.

### Reflected

\`?search=<script>alert(1)</script>\` echoed in HTML.

### Stored

Comment field saves script; every viewer executes.

### DOM-based

Client JS writes \`location.hash\` to innerHTML unsafely.

## XSS prevention

- Escape output contextually (HTML, JS, URL, CSS)
- **Content-Security-Policy** restricts script sources
- React escapes text by default—danger with \`dangerouslySetInnerHTML\`
- Sanitize rich HTML with DOMPurify if needed
- **HttpOnly** cookies so stolen via XSS harder (not impossible with CSRF combos)

\`\`\`http
Content-Security-Policy: default-src 'self'; script-src 'self'
\`\`\`

## CSRF (Cross-Site Request Forgery)

Victim logged into bank; evil site submits form POST to bank transfer—browser sends cookies automatically.

## CSRF prevention

- **SameSite** cookies (\`Lax\`/\`Strict\`)
- CSRF token in forms/API (double-submit or synchronizer)
- \`Origin\` / \`Referer\` header validation for state-changing requests
- JWT in Authorization header (not cookie) immune to classic CSRF—but XSS becomes token theft target

## Defense in depth

Framework CSRF middleware + SameSite + re-auth for sensitive actions (change password).

XSS and CSRF often paired in attack chains—fix both, prioritize XSS because it undermines all browser trust.`,
  ),
  topic(
    "sql-injection",
    "SQL Injection & Input Validation",
    "Parameterized queries, ORM safety, and validation at boundaries.",
    "intermediate",
    14,
    `## Classic SQL injection

\`\`\`javascript
// NEVER
db.query(\`SELECT * FROM users WHERE email = '\${email}'\`);
\`\`\`

Input \`' OR '1'='1\` returns all rows. \`; DROP TABLE users;--\` if permissions allow.

## Parameterized queries

\`\`\`javascript
db.query('SELECT * FROM users WHERE email = $1', [email]);
\`\`\`

Database separates code from data—user input never interpreted as SQL syntax.

## ORMs

Prisma, Drizzle, SQLAlchemy use parameters by default—unsafe only with raw string concatenation \`sql\` tagged templates abused.

## Second-order injection

Stored payload executes later in admin report—parameterize everywhere, even "trusted" internal queries.

## Input validation

Validate type, length, format at API boundary:

\`\`\`javascript
const schema = z.object({ email: z.string().email(), age: z.number().int().min(0) });
\`\`\`

Validation complements parameterization—not replacement.

## Least privilege DB user

App DB role: SELECT/INSERT/UPDATE on app tables only—no DROP, no superuser. Limits injection blast radius.

## Error messages

Do not return raw SQL errors to clients—log internally, generic message externally.

## Command injection parallel

Same logic for \`exec(\`user input\`)\`—use allowlists, spawn with argument arrays, never shell string concat.

Treat all external input as hostile—params, headers, cookies, webhooks, file names.`,
  ),
  topic(
    "security-headers",
    "Security Headers & HTTPS",
    "HSTS, CSP, frame options, and TLS configuration.",
    "intermediate",
    13,
    `## Essential response headers

\`\`\`http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=()
Content-Security-Policy: default-src 'self'; frame-ancestors 'none'
\`\`\`

## HSTS

Forces HTTPS after first visit—submit domain to HSTS preload list only when fully ready.

## CSP

Start report-only mode:

\`\`\`http
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
\`\`\`

Tune until no false positives, then enforce.

## X-Frame-Options / frame-ancestors

Prevent clickjacking—embed your site in invisible iframe tricking clicks.

## Cookies recap

\`Secure; HttpOnly; SameSite=Lax\` minimum for session cookies.

## TLS configuration

Modern ciphers, TLS 1.2+, valid cert chain. Test with SSL Labs. Auto-renew Let's Encrypt.

## CORS not a substitute for auth

\`Access-Control-Allow-Origin\` controls browser reads—attackers curl API directly. Still require auth tokens.

## Subresource Integrity

\`\`\`html
<script src="https://cdn.example.com/lib.js"
  integrity="sha384-..." crossorigin="anonymous"></script>
\`\`\`

CDN compromise does not execute unchecked script.

Headers are cheap defense layers—configure at nginx/CDN/framework once, benefit every response.`,
  ),
  capstoneChapter("cybersecurity-web", "Security Audit", [
    "Run OWASP ZAP baseline scan against local app; triage top 3 findings.",
    "Fix any reflected XSS in search or error pages; add CSP header.",
    "Verify all SQL/database access uses parameterized queries; grep for string concat.",
    "Add helmet or manual security headers; confirm HSTS on production domain.",
    "Write SECURITY-CHECKLIST.md: auth, RLS/authz, secrets, dependencies, headers, logging—mark your app pass/fail each item.",
  ]),
]);

export const devopsApisCsPathChapters = [
  ...dockerContainersChapters,
  ...kubernetesIntroChapters,
  ...nginxDeploymentChapters,
  ...linuxServerBasicsChapters,
  ...ciCdGithubActionsChapters,
  ...awsCloudEssentialsChapters,
  ...graphqlApisChapters,
  ...authSessionsJwtChapters,
  ...oauthSocialLoginChapters,
  ...websocketsRealtimeChapters,
  ...testingJavascriptChapters,
  ...testingPythonChapters,
  ...algorithmsBasicsChapters,
  ...dataStructuresChapters,
  ...supabaseFullstackChapters,
  ...cybersecurityWebChapters,
];
