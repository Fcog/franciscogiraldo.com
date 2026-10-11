---
layout: blog.njk
post_id: 17
tags: post
title: Docker Cheat Sheet
image: 
date: 2026-10-11
mins: 8
excerpt: Handy reference for everyday Docker commands — images, containers, networks, volumes, and Compose.
post_tags: ['Docker', 'DevOps']
---

Quick reference for everyday Docker commands.

## Basics

```bash
docker version
docker info
docker help
docker help run
```

## Images

```bash
docker images                        # List local images
docker image ls
docker pull nginx
docker pull nginx:1.27
docker build -t my-app:1.0 .
docker build -t my-app:1.0 -f Dockerfile.prod .
docker build -t my-app:1.0 --no-cache .
docker build -t my-app:1.0 --target prod .
docker build -t my-app:1.0 --build-arg VERSION=1.0 .
docker tag my-app:1.0 registry.example.com/my-app:1.0
docker push registry.example.com/my-app:1.0
docker history my-app:1.0
docker inspect my-app:1.0
docker rmi my-app:1.0
docker image prune                   # Remove dangling images
docker image prune -a                # Remove unused images
```

## Registry Login

```bash
docker login
docker login registry.example.com
docker login registry.example.com -u <user>
docker logout
docker logout registry.example.com
```

## Containers

```bash
docker ps                            # Running containers
docker ps -a                         # Include stopped
docker ps -q                         # IDs only
docker run nginx
docker run -d --name web -p 8080:80 nginx
docker run -it --rm alpine sh
docker run -d --name app \
  -e KEY=value \
  --env-file .env \
  -v "$PWD":/app \
  -w /app \
  --restart unless-stopped \
  my-app:1.0
docker start <container>
docker stop <container>
docker restart <container>
docker kill <container>
docker rm <container>
docker rm -f <container>             # Stop and remove
docker rename <container> <new-name>
```

| Flag | Use |
|------|-----|
| `-d` | Run in the background |
| `--name` | Set the container name |
| `-p 8080:80` | Publish host port to container port |
| `-e KEY=value` | Set an environment variable |
| `--env-file` | Load env vars from a file |
| `-v src:dest` | Mount a volume or host path |
| `-w` | Working directory inside the container |
| `--rm` | Remove the container when it exits |
| `-it` | Interactive terminal |
| `--network` | Attach to a network |
| `--restart unless-stopped` | Restart policy |

## Logs, Exec & Copy

```bash
docker logs <container>
docker logs -f <container>           # Follow
docker logs --tail 100 <container>
docker logs --since 10m <container>
docker exec -it <container> sh
docker exec -it <container> bash
docker exec -u root -it <container> sh
docker cp <container>:/path/file ./local-file
docker cp ./local-file <container>:/path/file
docker top <container>
docker stats
docker port <container>
docker inspect <container>
```

## Networks

```bash
docker network ls
docker network create <name>
docker network inspect <name>
docker network connect <name> <container>
docker network disconnect <name> <container>
docker network rm <name>
docker network prune
```

```bash
docker run -d --name web --network <name> nginx
```

## Volumes

```bash
docker volume ls
docker volume create <name>
docker volume inspect <name>
docker volume rm <name>
docker volume prune                  # Remove unused volumes
```

```bash
docker run -d --name db -v db-data:/var/lib/postgresql/data postgres:16
docker run -d --name app -v "$PWD":/app my-app:1.0
```

## Compose

Use `docker compose` (Compose V2). Commands run from the directory that contains `compose.yaml`.

```bash
docker compose version
docker compose config                # Render the resolved file
docker compose up
docker compose up -d
docker compose up -d --build
docker compose up -d web             # One service
docker compose ps
docker compose logs
docker compose logs -f
docker compose logs -f --tail 100 web
docker compose exec web sh
docker compose run --rm web <command>
docker compose build
docker compose pull
docker compose stop
docker compose start
docker compose restart
docker compose down                  # Stop and remove containers + networks
docker compose down -v               # Also remove declared volumes
docker compose down --rmi local
```

```yaml
services:
  web:
    build: .
    ports:
      - "8080:80"
    environment:
      APP_ENV: prod
    depends_on:
      - db
  db:
    image: postgres:16
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: secret

volumes:
  db-data:
```

## Dockerfile

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

| Instruction | Use |
|-------------|-----|
| `FROM` | Base image. Repeat it for a multi-stage build |
| `WORKDIR` | Set the working directory |
| `COPY` / `ADD` | Copy files into the image |
| `RUN` | Run a command at build time |
| `ENV` | Set an environment variable |
| `EXPOSE` | Document the port the process listens on |
| `USER` | User to run later instructions as |
| `CMD` | Default command when the container starts |
| `ENTRYPOINT` | Executable that always runs |

## Cleanup

```bash
docker system df                     # Disk usage
docker container prune               # Stopped containers
docker image prune                   # Dangling images
docker volume prune
docker network prune
docker builder prune
docker system prune                  # Stopped containers, dangling images, unused networks
docker system prune -a               # Also unused images
docker system prune -a --volumes     # Also unused volumes
```

## Common Debugging Flow

```bash
# 1. Is it running?
docker ps -a
docker compose ps

# 2. Why did it stop?
docker logs --tail 100 <container>
docker inspect <container>

# 3. Shell in
docker exec -it <container> sh

# 4. Ports and resources
docker port <container>
docker stats

# 5. Rebuild and recreate
docker compose up -d --build
docker compose down && docker compose up -d
```

## Useful Links

- [Docker CLI](https://docs.docker.com/reference/cli/docker/)
- [docker run](https://docs.docker.com/reference/cli/docker/container/run/)
- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
- [Docker Compose CLI](https://docs.docker.com/reference/cli/docker/compose/)
- [Compose file reference](https://docs.docker.com/reference/compose-file/)
- [Volumes](https://docs.docker.com/engine/storage/volumes/)
- [Networking](https://docs.docker.com/engine/network/)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [docker system prune](https://docs.docker.com/reference/cli/docker/system/prune/)
- [Build overview](https://docs.docker.com/build/)
