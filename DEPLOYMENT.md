# EventSphere Deployment Notes

## 1) Architecture Diagram

```text
Internet User
    |
    v
Host Port 80
    |
    v
Nginx Container (reverse proxy + static frontend)
    |                     |
    | /api/*              | /*
    v                     v
Backend Container      Frontend static files
(Node + Express)       (/usr/share/nginx/html)
    |
    v
MongoDB Container (internal only)
```

## 2) Port Mapping Documentation

- Exposed to users:
  - `80/tcp` -> `nginx:80` (required entry point)
- Internal-only (not published to host):
  - `backend:5000` (only reachable from Docker network)
  - `mongo:27017` (only reachable from Docker network)

Why:
- Only Nginx needs to be publicly reachable.
- Backend and database stay private to reduce attack surface.

## 3) Nginx Routing Explanation

Nginx server block in `nginx/nginx.conf` routes:

- `location /api/` -> proxied to `http://backend:5000`
- `location /` -> serves SPA files with fallback to `index.html`
- static assets (`.js`, `.css`, images) -> direct file serving with cache headers

HTTP flow:
1. Browser requests `http://<host>/...`
2. Nginx receives all traffic on port 80.
3. If path starts with `/api/`, request is forwarded to backend service.
4. Otherwise frontend static content is returned.

## 4) Docker Configuration Explanation

- `docker-compose.yml` defines 3 services: `nginx`, `backend`, `mongo`.
- Backend uses environment variables (`PORT`, `MONGO_URI`).
- `restart: unless-stopped` is enabled for restart safety.
- Mongo persists data using volume `mongo-data`.
- Frontend build files are mounted into Nginx web root.

Backend image:
- `backend/Dockerfile` uses `node:18-alpine`.
- Installs production dependencies with `npm ci --omit=dev`.
- Runs with `npm start`.

## 5) Firewall Rules (Networking & Security)

Keep host firewall minimal:

- Allow: `80/tcp`
- Deny: `5000/tcp`, `27017/tcp` from public networks

Example (UFW):

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 80/tcp
sudo ufw deny 5000/tcp
sudo ufw deny 27017/tcp
sudo ufw enable
```

## 6) Container Execution Proof (How to capture)

Run:

```bash
docker compose up -d --build
docker compose ps
docker compose logs --tail=50 nginx backend mongo
curl http://localhost/api/health
```

Include these outputs/screenshots in your submission as execution proof.

## 7) Serverful vs Serverless (Conceptual)

Serverful (this project):
- You manage containers, runtime, routing, and networking.
- Better control over reverse proxy, process model, and internal networking.
- Requires operational setup (compose, firewall, host maintenance).

Serverless:
- Platform manages runtime scaling and infrastructure.
- Lower ops overhead for small APIs.
- Less control over networking topology and custom proxy behavior.
- Cold starts and platform limits can affect behavior.

For this lab, serverful deployment is appropriate because Docker + Nginx + explicit network controls are mandatory requirements.
