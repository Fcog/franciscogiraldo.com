---
layout: blog.njk
post_id: 18
tags: post
title: Backend Architecture for High-Traffic Web Apps
image: 
date: 2026-10-11
mins: 7
excerpt: How Docker, Kubernetes, Helm, and Argo CD split the work of running a backend that can take real traffic.
post_tags: ['Arquitecture', 'Docker', 'Kubernetes', 'Helm', 'Argo CD', 'DevOps']
---

A high-traffic web backend fails when the app, the servers, and the deploy process are tangled together. One image, one cluster, one package, and one Git repository keep those jobs apart. Docker, Kubernetes, Helm, and Argo CD are that split.

Each tool has one job:

| Tool | Job |
|------|-----|
| Docker | Build the artifact that every replica runs |
| Kubernetes | Run many copies and send traffic to the healthy ones |
| Helm | Package the Kubernetes config so each environment is a values change |
| Argo CD | Make the cluster match what Git says, and keep it there |

The application code stays yours. These tools do not replace the API, the database, or the queue. They are how that API is packaged, scaled, configured, and released.

## Docker: one artifact for every replica

Docker builds an image: your process, its runtime, and its libraries, frozen at a version. Production runs that image. It does not clone the repo onto a server and hope the host already has the right Node, PHP, or Python.

That matters once you run more than one copy. Ten pods serving the same API must be the same build. A tag such as `my-api:1.4.2` is that build. Roll the tag forward to release. Roll it back to undo.

Images stay stateless. Sessions, files, and database rows live in a database, a cache, or object storage. A pod can die and another can take the next request because nothing important lived only inside the container.

Local development can use Compose to run the API next to Postgres or Redis. The image you build there is the same image the cluster will run.

## Kubernetes: the runtime that absorbs traffic

Kubernetes runs those images as pods and keeps the number you asked for. A Deployment says "run 8 copies of `my-api:1.4.2`". When a node dies, the scheduler starts a replacement. When you change the image tag, it rolls pods out and leaves the old ones serving until the new ones pass their checks.

Traffic does not go to a pod IP. A Service is a stable address in front of the current set of ready pods. An Ingress or gateway is the HTTP front door: host, path, and TLS, then the Service.

A few Kubernetes features are what make this hold up under load:

- **Replicas.** More concurrent requests means more pods, not a bigger single process.
- **Readiness probes.** A pod receives traffic only when it can actually serve. A slow startup does not become a stream of 502s.
- **Liveness probes.** A stuck process gets replaced.
- **Resource requests and limits.** The scheduler knows what a pod needs, and a noisy pod cannot eat the node.
- **A rolling update.** `maxSurge` and `maxUnavailable` let you add new pods before you remove old ones, so capacity stays up during a release.
- **Horizontal Pod Autoscaling.** CPU or request rate grows, the replica count grows. It can shrink again when the spike ends.

The database is not a Deployment you scale the same way. App pods scale out. Stateful systems stay behind their own service, with their own disks and failover.

## Helm: the same app, different environments

A Deployment, Service, Ingress, and autoscaler are a pile of YAML. Copying that pile per environment is how staging and production drift apart.

Helm packages that pile as a chart. The templates are the shape of the app. A values file is the environment: image tag, replica count, host name, CPU, secrets references. Staging might run 2 replicas on a small host. Production might run 8, with a higher memory limit and a public hostname. Same chart.

An upgrade is a new revision of that release. `helm history` and `helm rollback` exist because a bad values change should be reversible. In the layout below, people rarely run those commands by hand. Argo CD renders the chart. Helm is still the package it renders.

## Argo CD: Git is the cluster

kubectl from a laptop does not scale to a fleet, and it leaves no record of who changed production. Argo CD watches a Git repository that holds the Helm chart and the values for each environment. When that repo changes, Argo CD renders the chart and syncs the cluster to the result.

A release becomes a commit. CI builds the image, pushes it to a registry, and commits the new tag into the values file. Argo CD sees the commit and rolls the Deployment. To undo it, revert the commit. Argo CD syncs the previous tag back.

Two sync settings matter in production:

- **Automated sync** so the cluster follows Git without a button click.
- **Self-heal and prune** so a manual edit in the cluster is put back, and objects removed from Git are removed from the cluster.

Drift is the enemy of a system you expect to survive a bad night. If Git says 8 replicas and the cluster has 3, you no longer know what will happen on the next restart.

## How a request is served

```text
Client
  → Ingress
    → Service
      → ready pods (the Docker image)
        → database / cache / queue
```

The Ingress terminates TLS and picks a Service. The Service picks a pod that is Ready. The pod runs one build of the API. Anything that must survive a restart is outside the pod.

Add pods when the autoscaler asks for them. The Service picks them up as soon as they are Ready. Clients keep using the same host.

## How a change is released

```text
App repo
  → CI builds a Docker image
  → registry
  → image tag committed to the deploy repo
  → Argo CD renders the Helm chart
  → Kubernetes rolls out new pods
```

The app repository and the deploy repository can be the same repo or two. The important part is that the tag in Git is the release. The cluster does not build the image. CI does. The cluster only runs what Git points at.

A failed rollout stops on the readiness probe. Old pods keep the traffic. You revert the tag commit, or roll the Argo CD application back to the previous revision.

## What this looks like day to day

| You want to… | Where it happens |
|--------------|------------------|
| Change application code | App repo, then a new image |
| Ship that build | Image tag in Git |
| Add capacity | Replica count or an autoscaler, in Helm values |
| Open a hostname | Ingress host, in Helm values |
| See what production is supposed to be | The deploy repo |
| See what production is actually running | Argo CD, then `kubectl` |
| Undo a bad release | Revert the Git commit |

`kubectl` is how you inspect pods, logs, and events. It is a poor place to edit production. Helm is how the manifests are structured. Argo CD is how they get applied. Docker is what they apply.

Cheat sheets for the commands:

- [Docker Cheat Sheet](/blog/docker-cheat-sheet/)
- [kubectl Cheat Sheet](/blog/kubectl-cheat-sheet/)
- [Helm Cheat Sheet](/blog/helm-cheat-sheet/)
- [Argo CD Cheat Sheet](/blog/argocd-cheat-sheet/)
