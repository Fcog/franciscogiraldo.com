---
layout: blog.njk
post_id: 18
tags: post
title: Backend Architecture for High-Traffic Web Apps
image:
date: 2026-10-11
mins: 10
excerpt: How GitHub Actions, Docker, Kubernetes, NGINX Ingress, Helm, Vault, and Argo CD run a high-traffic backend, including the MLOps path.
post_tags: ["Arquitecture", "Docker", "Kubernetes", "Helm", "Argo CD", "DevOps"]
---

A high-traffic web backend fails when the app, the servers, and the deploy process are tangled together. Split the work. GitHub Actions builds. Docker is the artifact. Kubernetes runs the copies. NGINX Ingress is the public door. Helm packages the config. Vault holds the secrets. Argo CD makes the cluster match Git.

Each tool has one job:

| Tool                                                        | Job                                                                                      |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [GitHub Actions](/blog/github-actions/)                     | CI runner: test, build the image, publish the tag                                        |
| [Docker](/blog/docker/)                                     | Build the artifact that every replica runs                                               |
| [Kubernetes](/blog/kubernetes/)                             | Run many copies and send cluster traffic to the healthy ones                             |
| [NGINX Ingress Controller](/blog/nginx-ingress-controller/) | Public HTTP entry: host, path, and TLS                                                   |
| [Helm](/blog/helm/)                                         | One package of Kubernetes manifests; staging and production differ only by a values file |
| [HashiCorp Vault](/blog/hashicorp-vault/)                   | Hold secrets and hand them to pods                                                       |
| [Argo CD](/blog/argo-cd/)                                   | Make the cluster match what Git says, and keep it there                                  |

The application code stays yours. These tools do not replace the application, the database, or the queue. They are how that application is packaged, configured, released, and reached. The same platform is the runtime for an MLOps engineering stack: training jobs, a versioned model, and an inference service that has to stay up under load.

## GitHub Actions: the CI runner

GitHub Actions is the continuous integration runner. A workflow starts on a pull request and again on merge to the main branch. On a runner it installs dependencies, runs the tests, builds the Docker image, and pushes that image to the registry.

The runner is either GitHub-hosted or self-hosted. A normal application build fits a GitHub-hosted runner. A job that needs the private network, a large cache, or a GPU belongs on a self-hosted runner you operate. The ML training image is the usual reason to add one.

Actions does not apply manifests to the cluster. When the image is pushed, the workflow commits the new tag into the deploy repository. That commit is the release. Argo CD takes it from there. A failed test stops the workflow, so a broken build never becomes a tag in Git.

Give the workflow a short-lived token for the registry. A long-lived cloud password stored in the repo is a secret waiting to leak. The durable secrets stay in Vault. The workflow only needs enough access to push an image and to write the tag commit.

## Docker: one artifact for every replica

Docker builds an image: your process, its runtime, and its libraries, frozen at a version. Production runs that image. It does not clone the repo onto a server and hope the host already has the right Node, PHP, or Python.

That matters once you run more than one copy. Ten pods serving the same application must be the same build. A tag such as `my-app:1.4.2` is that build. Roll the tag forward to release. Roll it back to undo.

Images stay stateless. Sessions, files, and database rows live in a database, a cache, or object storage. A pod can die and another can take the next request because nothing important lived only inside the container. Model weights that must change without a rebuild live in object storage too. The inference image stays a stable runtime; the model version is configuration.

Local development can use Compose to run the application next to Postgres or Redis. The image you build there is the same image the cluster will run.

## Kubernetes: the runtime that absorbs traffic

Kubernetes runs those images as pods and keeps the number you asked for. A Deployment says "run 8 copies of `my-app:1.4.2`". When a node dies, the scheduler starts a replacement. When you change the image tag, it rolls pods out and leaves the old ones serving until the new ones pass their checks.

Traffic inside the cluster does not go to a pod IP. A Service is a stable address in front of the current set of ready pods. Another microservice calls that Service by its DNS name, `http://my-processor-service` in the same namespace, and never leaves the cluster to do it. How to find and verify those addresses is covered in [Kubernetes internal networking](/blog/kubernetes-internal-networking/).

A few Kubernetes features are what make this hold up under load:

- **Replicas.** More concurrent requests means more pods, not a bigger single process.
- **Readiness probes.** A pod receives traffic only when it can actually serve. A slow startup does not become a stream of 502s.
- **Liveness probes.** A stuck process gets replaced.
- **Resource requests and limits.** The scheduler knows what a pod needs, and a noisy pod cannot eat the node.
- **A rolling update.** `maxSurge` and `maxUnavailable` let you add new pods before you remove old ones, so capacity stays up during a release.
- **Horizontal Pod Autoscaling.** CPU or request rate grows, the replica count grows. It can shrink again when the spike ends.

The database is not a Deployment you scale the same way. App pods scale out. Stateful systems stay behind their own service, with their own disks and failover. A training run is a Job with an end, not a Deployment that must stay at 8 replicas.

## NGINX Ingress Controller: the public door

The Ingress API describes a route: this host and path go to that Service. The NGINX Ingress Controller is the process that implements the route. It watches Ingress objects, loads them into NGINX, terminates TLS, and proxies to the Service. Clients keep using one hostname. Pods can be replaced behind it. The community Ingress NGINX project was retired in March 2026. The [NGINX Ingress Controller](/blog/nginx-ingress-controller/) page covers that status.

Public traffic comes in here. Service-to-service traffic does not. An inference pod calling a feature service uses the cluster DNS name. Sending that hop back out through NGINX adds latency and puts internal calls on the public edge.

The controller is itself a Deployment. Under load you scale it, and you give it the CPU it needs to terminate TLS. Timeouts, body size, and rate limits are annotations on the Ingress, set per route in the Helm values. The certificate is a Kubernetes Secret mounted by the controller. The private key is issued into that Secret from Vault or from your certificate workflow. It is not committed next to the chart.

## Helm: the same app, different environments

A Deployment, Service, Ingress, autoscaler, and Vault role binding are a pile of YAML. Copying that pile per environment is how staging and production drift apart.

Helm packages that pile as a chart. The templates are the shape of the app. A values file is the environment: image tag, replica count, host name, CPU, and the names of secrets. Staging might run 2 replicas on a small host. Production might run 8, with a higher memory limit and a public hostname. Same chart. The values name `db-password`. They do not contain the password.

An upgrade is a new revision of that release. `helm history` and `helm rollback` exist because a bad values change should be reversible. In the layout below, people rarely run those commands by hand. Argo CD renders the chart. Helm is still the package it renders.

## HashiCorp Vault: secrets outside Git

A high-traffic system has more secrets than a database password: registry credentials, object-storage keys, third-party API tokens, and the tokens an inference service uses to pull a model. Those do not belong in the image, in a Helm values file, or in GitHub.

Vault stores them. A pod authenticates with its Kubernetes service account. Vault checks that account against a role and returns only the secrets that role allows. The pod receives them at start, through the Vault Agent injector or the Secrets Store CSI driver. Git holds the role binding. Vault holds the secret.

Database credentials can be dynamic. Vault issues a short-lived user when the pod starts and revokes it when the lease ends. A leaked password expires. A static password in a Deployment lives until someone remembers to rotate it.

The deploy repo can say which secret path an app reads. It cannot say what the secret is. Argo CD will sync the configuration that points at Vault. It will not sync the secret material, because that material was never in Git.

## Argo CD: Git is the cluster

kubectl from a laptop does not scale to a fleet, and it leaves no record of who changed production. Argo CD watches a Git repository that holds the Helm chart and the values for each environment. When that repo changes, Argo CD renders the chart and syncs the cluster to the result.

A release becomes a commit. GitHub Actions builds the image, pushes it to a registry, and commits the new tag into the values file. Argo CD sees the commit and rolls the Deployment. To undo it, revert the commit. Argo CD syncs the previous tag back. NGINX is already running. The Ingress object changes only when the route changes, not on every image bump.

Two sync settings matter in production:

- **Automated sync** so the cluster follows Git without a button click.
- **Self-heal and prune** so a manual edit in the cluster is put back, and objects removed from Git are removed from the cluster.

Drift is the enemy of a system you expect to survive a bad night. If Git says 8 replicas and the cluster has 3, you no longer know what will happen on the next restart.

## How a request is served

```text
Client
  → NGINX Ingress Controller
    → Service
      → ready pods (the Docker image)
        → database / cache / queue / model store
```

NGINX terminates TLS and picks a Service from the Ingress rule. The Service picks a pod that is Ready. The pod runs one build of the application. It already loaded its secrets from Vault at startup. Anything that must survive a restart is outside the pod.

A second service called by the application stays on cluster DNS:

```text
App pod → http://my-processor-service → processor pods
```

Add pods when the autoscaler asks for them. The Service picks them up as soon as they are Ready. Clients keep using the same host.

## How a change is released

```text
App repo
  → GitHub Actions tests, builds, and pushes the image
  → registry
  → image tag committed to the deploy repo
  → Argo CD renders the Helm chart
  → Kubernetes rolls out new pods
```

The app repository and the deploy repository can be the same repo or two. The important part is that the tag in Git is the release. The cluster does not build the image. The Actions runner does. The cluster only runs what Git points at.

A failed rollout stops on the readiness probe. Old pods keep the traffic. You revert the tag commit, or roll the Argo CD application back to the previous revision.

## The MLOps engineering stack on this platform

An MLOps engineering stack is this architecture pointed at models. The pieces do not change. The workloads do.

Training code and the inference server live in Git. GitHub Actions tests them. A training run is a Kubernetes Job: it reads the dataset, writes a versioned artifact to object storage, and exits. A CronJob covers a schedule. Neither is a website. You do not put training behind NGINX, and you do not ask Argo CD to keep a finished Job alive.

Serving is the high-traffic path. The inference server is a Deployment of a Docker image, with a replica count, probes, and an autoscaler. Other services reach it by cluster DNS. If external clients call the model, an Ingress rule on the NGINX controller publishes that Service and nothing else. The model version the pods must load is a Helm value, so promoting a model is a commit. Argo CD rolls the Deployment. Vault supplies the storage credentials the pods use to fetch the artifact.

What sits beside the cluster, not inside these seven tools, is the experiment log and the model registry: which run produced which file, and which file production is allowed to serve. The cluster's job is to run the Job and to keep the serving pods healthy. The registry's job is to name the artifact those pods pull.

Online inference scales like any other stateless application. Batch scoring is another Job. Treat them as different workloads so a training spike cannot starve the pods that are answering requests.

## What this looks like day to day

| You want to…                            | Where it happens                               |
| --------------------------------------- | ---------------------------------------------- |
| Change application code                 | App repo, then GitHub Actions builds an image  |
| Ship that build                         | Image tag committed to Git                     |
| Add capacity                            | Replica count or an autoscaler, in Helm values |
| Open a public hostname                  | NGINX Ingress rule, in Helm values             |
| Call another service                    | Cluster DNS, not the Ingress                   |
| Store a password or a model-store key   | Vault                                          |
| Train or score a model offline          | A Kubernetes Job, started by Actions           |
| Serve a model                           | Inference Deployment, tag in Git               |
| See what production is supposed to be   | The deploy repo                                |
| See what production is actually running | Argo CD, then `kubectl`                        |
| Undo a bad release                      | Revert the Git commit                          |

`kubectl` is how you inspect pods, logs, and events. It is a poor place to edit production. Helm is how the manifests are structured. Argo CD is how they get applied. Docker is what they apply. Actions is what builds it. NGINX is who the public client talks to. Vault is where the secrets live.

## Observability is the next step

This architecture can ship a build and serve traffic. It cannot yet tell you, during a spike, which service saturated, which model version got slower, or whether DNS, Vault, or the database is what failed. `kubectl logs` on one pod is not that view, and it disappears with the pod.

The next step is observability. You want the request rate, error rate, and latency at NGINX and at each Service, logs collected from every replica, and a trace that follows one call from the Ingress through the application to the inference pods. Metrics, logs, and traces are three views of the same request. Add them after this platform is in place. They do not replace it. Without them, the next incident is a guess.

Cheat sheets for the commands:

- [Docker Cheat Sheet](/blog/docker-cheat-sheet/)
- [kubectl Cheat Sheet](/blog/kubectl-cheat-sheet/)
- [Helm Cheat Sheet](/blog/helm-cheat-sheet/)
- [Argo CD Cheat Sheet](/blog/argocd-cheat-sheet/)
- [Kubernetes internal networking](/blog/kubernetes-internal-networking/)
