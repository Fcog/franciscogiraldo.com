---
layout: blog.njk
post_id: 21
tags: post
title: Docker
image:
date: 2026-10-11
mins: 5
excerpt: What Docker is, what developers use it for, and the image, container, and Compose features you use every week.
post_tags: ["Docker"]
---

Docker packages a process with the runtime and libraries it needs, then runs that package the same way on a laptop and in a cluster. In the [backend architecture for high-traffic web apps](/blog/high-traffic-backend-architecture/), the Docker image is the artifact every replica runs.

## What it is

An image is a stack of read-only layers plus the command that starts the process. You build it from a Dockerfile. A container is a running instance of an image, with a thin writable layer on top. When the container stops, that writable layer can be thrown away. The image stays.

A tag such as `my-app:1.4.2` is a name you choose for a build. A digest (`sha256:…`) is the hash of the exact image. Production should record the tag you released. The registry also gives you the digest if you need to pin the bytes.

Images are built to be stateless. Sessions, uploads, and database rows live in a database, a volume, or object storage. A new container can take the next request because nothing important existed only inside the previous one.

## What it is used for

Developers use Docker so "works on my machine" and "works in production" mean the same build. [GitHub Actions](/blog/github-actions/) builds the image and pushes it to a registry. [Kubernetes](/blog/kubernetes/) runs copies of that image. Rolling the tag forward is a release. Rolling it back is the undo.

Locally, Compose starts the application next to Postgres or Redis with one command. The image Compose builds is the image the cluster will run, once the same Dockerfile is used in CI.

Model weights that change without a code change stay in object storage. The inference image stays a stable runtime. The model version is configuration, loaded when the process starts.

```dockerfile
FROM node:22 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/server.js"]
```

The first stage compiles. The final stage ships the runtime and the build output. Build tools and source stay out of the image that production pulls.

## Main features

- **Images and tags.** One tag names one build. Every replica that pulls `my-app:1.4.2` runs that build.
- **Dockerfile.** `FROM`, `COPY`, `RUN`, `ENV`, `USER`, and `CMD` are the instructions that produce the image.
- **Layers and cache.** Each instruction is a layer. Unchanged layers are reused, so a dependency install is skipped when only application code changed.
- **Multi-stage builds.** A build stage can contain compilers and package managers. The final stage copies the artifact into a smaller base image.
- **Registries.** Docker Hub, GitHub Container Registry, and cloud registries store images. CI pushes. The cluster pulls.
- **Containers.** `docker run` starts a container from an image, with ports, environment, and a restart policy.
- **Volumes.** A volume holds files that must outlive the container: a database directory, or a cache you want to keep.
- **Networks.** Containers on a user-defined network reach each other by name.
- **Compose.** A `compose.yaml` describes the application and its local dependencies, and brings them up together.
- **Healthchecks.** A healthcheck tells Docker whether the process is actually serving, which Compose and orchestrators use before sending traffic.
- **Resource limits.** CPU and memory limits keep one container from consuming the machine.

## Useful links

- [Docker Cheat Sheet](/blog/docker-cheat-sheet/)
- [Backend architecture for high-traffic web apps](/blog/high-traffic-backend-architecture/)
- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
