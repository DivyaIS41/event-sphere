# EventSphere

Minimal full-stack event registration system using Docker, Nginx, Node/Express, and MongoDB.

## Functional Scope

User module:
- View event list
- View event details
- Register for event

Admin module:
- Create event
- Edit event
- View registrations

## Tech Stack

- Frontend: static SPA (served by Nginx)
- Backend: Node.js + Express + Mongoose
- Database: MongoDB
- Reverse proxy: Nginx
- Orchestration: Docker Compose

## Run (Production-style via Docker)

```bash
docker compose up -d --build
```

Access:
- App: `http://localhost`
- Health check: `http://localhost/api/health`

## Environment Variables

Create `.env` from `.env.example`:

- `PORT` (default `5000`)
- `MONGO_URI` (default `mongodb://mongo:27017/eventsphere`)

## Mandatory Requirement Mapping

- Backend in container: `backend` service
- Production frontend served: Nginx serves `frontend/build`
- Environment variables: `PORT`, `MONGO_URI` in compose
- Expose only required ports: only `80:80` published
- Restart-safe: `restart: unless-stopped`
- Reverse proxy on port 80: `nginx/nginx.conf`
- Correct API/frontend routing: `/api/*` proxy + SPA fallback
- Networking/security decisions documented: `DEPLOYMENT.md`

## Deliverables Included

- Working deployable system (`docker-compose.yml`)
- Port mapping documentation (`DEPLOYMENT.md`)
- Nginx routing explanation (`DEPLOYMENT.md`)
- Docker configuration explanation (`DEPLOYMENT.md`)
- Architecture diagram (`DEPLOYMENT.md`)
- Serverful vs Serverless comparison (`DEPLOYMENT.md`)