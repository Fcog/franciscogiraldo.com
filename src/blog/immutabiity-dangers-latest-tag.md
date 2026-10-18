---
layout: blog.njk
post_id: 28
tags: post
title: "Immutability & The Dangers of the :latest Tag"
image:
date: 2026-10-16
mins: 10
excerpt: Tag images with a Git commit SHA so production never pulls a moving :latest tag.
post_tags: ["Arquitecture", "Docker", "Kubernetes", "Helm", "DevOps"]
---

# Why the Mutable `:latest` Docker Tag is Dangerous in Production (And What to Use Instead)

When you first containerize an application, the default habit is simple: build the image, tag it `:latest`, and push. It feels convenient during local development. Why bother generating a unique version string when `:latest` always points to whatever you just built?

In a local single-node environment like Minikube, using `:latest` or `pullPolicy: Never` causes no harm. The moment you deploy to a multi-node Kubernetes cluster or production environment, however, `:latest` becomes a silent architectural liability.

Here is why mutable container tags break production systems, and how to implement **content-addressable Git Commit SHAs** inside a GitHub Actions pipeline for true immutability.

---

## The Three Failures of `:latest` in Production

### 1. The Cache Inconsistency & Race Condition

When Kubernetes sees `image: fcog/ai-inference:latest` with `imagePullPolicy: Always`, worker nodes independently reach out to Docker Hub to check for updates. If you deploy a rolling update across 5 pods, pod 1 might fetch the new build while pod 3 fetches a split second later or hits a cached layer. You end up with a **split-brain runtime environment** running two slightly different versions of your TypeScript code simultaneously.

### 2. Broken Rollbacks and Audit Trails

If production throws a critical exception, your first instinct is to roll back. With a mutable tag, running `helm rollback` or `kubectl rollout undo` tells Kubernetes to re-apply the previous deployment manifest—which _still_ points to `fcog/ai-inference:latest`. Kubernetes pulls whatever `:latest` happens to be pointing to at that exact second, which might already be the broken code or an unrelated newer patch. You have zero historical traceability.

### 3. Supply Chain and Security Opacity

An immutable tag acts as a cryptographic snapshot of your software supply chain. If an incident occurs three weeks from now, you want to inspect `fcog/ai-inference:a1b2c3d` and know with 100% certainty which exact lines of TypeScript were compiled into that image. `:latest` tells you nothing.

---

## The Solution: The Git Commit SHA Strategy

In a production MLOps pipeline, the container image tag must match the **exact Git Commit SHA (`${{ github.sha }}`)** that produced the artifact.

```text
[ Git Commit: a1b2c3d ]
          │
          ▼
┌──────────────────────┐
│ GitHub Actions Build │
└─────────┬────────────┘
          │  Builds & Pushes
          ▼
┌──────────────────────┐
│  Docker Hub Registry │ ◄── [ GitOps Update ]
│(fcog/ai-inference:   │      Automatically overwrites
│       a1b2c3d)       │      tag inside values-prod.yaml
└─────────┬────────────┘
          │  Pulls exact
          ▼  immutable layer
┌──────────────────────┐
│   Kubernetes Pods    │
└──────────────────────┘
```

### 1. The GitHub Actions Build Step

In your `.github/workflows/deploy.yaml` file, tag the image explicitly with the short or full SHA alongside your branch or release identifiers:

```yaml
- name: Build and Push Docker Image
  uses: docker/build-push-action@v5
  with:
    context: ./services/ai-inference/app
    file: ./services/ai-inference/app/Dockerfile
    push: true
    tags: |
      fcog/ai-inference:${{ github.sha }}
      fcog/ai-inference:main-latest
```

### 2. The GitOps Configuration Update

Instead of letting Kubernetes guess or pull dynamically, your CI pipeline programmatically writes that exact SHA into your Helm values file:

```yaml
# services/ai-inference/chart/values-prod.yaml
image:
  repository: fcog/ai-inference
  tag: "a1b2c3d4e5f6..." # Hardlocked to the exact git commit
  pullPolicy: IfNotPresent # Safe because the tag never mutates
```

`IfNotPresent` tells the node to download the image only when that tag is not already on disk. A later pod on the same node reuses the stored copy. A commit tag is published once and then left alone, so that copy stays the same build as the one in the registry.

---

## 🚀 How This Changes Day-to-Day Operations

1. **Deterministic Deployments:** Every cluster node across every replica downloads the exact same byte-for-byte image layer.
2. **Instant, Reliable Rollbacks:** If revision 12 used `tag: a1b2c3d` and revision 13 used `tag: 9f8e7d` (which crashed), running `helm rollback my-ai-prod 12` forces Kubernetes to pull `a1b2c3d` reliably from the registry cache.
3. **One-to-One Traceability:** When an alert fires in Grafana, you read the pod label, grab the SHA (`a1b2c3d`), and run `git show a1b2c3d` in your terminal to see the exact PR that introduced the bug.

### Conclusion

Treating container images as **immutable artifacts** tied to version control is a mandatory step when moving from backend scripting to enterprise platform engineering. Drop the `:latest` crutch, embrace the commit SHA, and make your deployments predictable.
