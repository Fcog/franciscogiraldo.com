---
layout: blog.njk
post_id: 22
tags: post
title: Kubernetes
image:
date: 2026-10-11
mins: 6
excerpt: What Kubernetes is, what developers use it for, and the workload features that keep a service up under load.
post_tags: ["Kubernetes", "DevOps"]
---

Kubernetes runs containers across a group of machines and keeps them at the state you declared. In the [backend architecture for high-traffic web apps](/blog/high-traffic-backend-architecture/), it is the runtime: many copies of a [Docker](/blog/docker/) image, and cluster traffic sent only to the healthy ones.

## What it is

You describe what should be running. A controller keeps the cluster there. A Deployment that asks for 8 pods of `my-app:1.4.2` still asks for 8 after a node dies. The scheduler places a replacement on a node that has room.

A pod is the smallest thing Kubernetes runs. It is one or more containers that share a network namespace and can share volumes. A node is a machine, virtual or physical, that runs pods. The control plane is the set of processes that store the desired state, schedule pods, and reconcile.

A Service is a stable address in front of the pods that are ready right now. Other applications call the Service by DNS. They do not store a pod IP. Pod IPs change. The Service name does not. How to find and check those names is covered in [Kubernetes internal networking](/blog/kubernetes-internal-networking/).

## What it is used for

Developers use Kubernetes when one process on one server is no longer enough, and when a deploy has to survive a dead machine. Typical uses:

- Run several copies of a stateless application and add copies as traffic grows.
- Roll out a new image tag while the previous pods keep serving.
- Give each microservice a DNS name inside the cluster.
- Run a training task or a migration to completion with a Job, then stop.
- Keep configuration that differs per environment in the cluster, next to the workload.

The database is a different kind of workload. Application pods scale out. A database keeps its own disks and its own failover. A training run is a Job with an end, so a finished run does not stay up as if it were a website.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 8
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: my-app
          image: ghcr.io/acme/my-app:1.4.2
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
```

A Service named `my-app` selects pods with `app: my-app`. Callers in the same namespace use `http://my-app:80`. The Service port and the container port can differ. The Service forwards.

## Main features

- **Deployments and ReplicaSets.** You set the replica count and the pod template. The ReplicaSet keeps that many pods running.
- **Services and cluster DNS.** ClusterIP, NodePort, and LoadBalancer are the Service types. CoreDNS answers `<service>.<namespace>.svc.cluster.local`.
- **Readiness and liveness probes.** A pod receives traffic when the readiness probe passes. A failed liveness probe replaces a stuck process.
- **Resource requests and limits.** The scheduler places a pod on a node that can spare the request. The limit is the ceiling for that container.
- **Rolling updates.** `maxSurge` and `maxUnavailable` add new pods before old ones leave, so capacity stays up during a release.
- **Horizontal Pod Autoscaling.** CPU or a custom metric changes the replica count. The count can come back down when the spike ends.
- **Jobs and CronJobs.** A Job runs until it succeeds or hits its backoff limit. A CronJob starts that work on a schedule.
- **Namespaces.** Namespaces divide one cluster into scopes for teams, environments, and resource quotas.
- **ConfigMaps.** A ConfigMap holds non-secret configuration the pod reads as files or environment variables.
- **Ingress.** An Ingress object describes a public host and path. A controller such as [NGINX Ingress Controller](/blog/nginx-ingress-controller/) implements it. Traffic between services stays on the Service DNS name.
- **Declarative reconciliation.** `kubectl apply` sets the desired object. Controllers notice drift and act. Day to day, [Argo CD](/blog/argo-cd/) is what applies the manifests from Git.

Secret values in this platform live in [Vault](/blog/hashicorp-vault/). Git stores the binding that says which path a pod may read.

## Useful links

- [kubectl Cheat Sheet](/blog/kubectl-cheat-sheet/)
- [Kubernetes internal networking](/blog/kubernetes-internal-networking/)
- [Backend architecture for high-traffic web apps](/blog/high-traffic-backend-architecture/)
- [Kubernetes documentation](https://kubernetes.io/docs/home/)
