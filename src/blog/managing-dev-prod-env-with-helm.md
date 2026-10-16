---
layout: blog.njk
post_id: 27
tags: post
title: "From Duplicate YAMLs to a Unified Stack: Managing Dev and Prod Environments with Helm"
image:
date: 2026-10-11
mins: 10
excerpt: Use one Helm chart for dev and prod, and keep the differences in values files.
post_tags: ["Arquitecture", "Docker", "Kubernetes", "Helm", "DevOps"]
---

As a backend engineer working more with Kubernetes, you soon find that each new environment means another copy of the same YAML.

When you start out with Kubernetes, the pattern is usually innocent: you write a `deployment.yaml`, a `service.yaml`, and perhaps an `hpa.yaml` for your local application testing. But the moment you need to push that application to a production cluster, reality hits.

Production runs five copies of the application instead of one. Each copy gets a whole CPU instead of a small fraction of one. The cluster always pulls a fresh image, and that image is a fixed release tag, not a tag that still changes on your machine.

The naive approach? Copy the entire directory, name it `/infra-prod`, modify the settings manually, and run `kubectl apply`.

This is a major anti-pattern. You now have **duplicated infrastructure states**. If you add a health check probe or modify a container port tomorrow, you have to remember to edit it in two entirely separate files. One typo, and your production cluster crashes while your development environment passes smoothly.

Enter **Helm**, the package manager for Kubernetes. Here is how we transform static, risky duplicate manifests into a singular, parameterized infrastructure package.

---

## The Core Concept: Infrastructure Parameterization

Helm handles infrastructure the exact same way backend developers handle code: by decoupling the **logic** from the **configuration variables**.

Instead of duplicating your structural manifests, your layout folder stays completely static inside a template directory. You replace hardcoded values with dynamic placeholders (`{% raw %}{{ .Values.variableName }}{% endraw %}`). Then, you feed those placeholders using environmental override profiles: **`values-dev.yaml`** and **`values-prod.yaml`**.

```text
               ┌──► values-dev.yaml  ───► (Minimal footprint, 1 pod)
               │
[ Helm Engine ]├──► values-prod.yaml ───► (High-availability, 5 pods)
               │
               └──► Reads /templates/ ──► (Dynamic, single source of truth)
```

---

## 🛠️ Step-by-Step Implementation

Let's look at how this is structured in a production-ready repository. We will parameterize a deployment file to handle a lightweight dev profile and a high-resource production profile seamlessly.

### 1. The Global Structural Template

Inside your Helm chart directory (e.g., `services/ai-inference/chart/templates/deployment.yaml`), your architecture layout uses placeholder injection tags:

{% raw %}

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-deployment
spec:
  replicas: {{ .Values.replicaCount }} # Dynamic scaling
  selector:
    matchLabels:
      app: {{ .Release.Name }}-app
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}-app
    spec:
      containers:
      - name: node-app
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        resources:
          requests:
            cpu: "{{ .Values.resources.requests.cpu }}"
          limits:
            cpu: "{{ .Values.resources.limits.cpu }}"
```

{% endraw %}

### 2. The Development Profile (`values-dev.yaml`)

For local developer testing inside a sandbox like Minikube, we want a tiny, cost-effective resource footprint:

```yaml
replicaCount: 1 # Only 1 pod needed for local manual validation

image:
  repository: fcog/ai-inference
  tag: local
  pullPolicy: Never # Look only inside the local daemon cache

resources:
  requests:
    cpu: "50m" # Fractional core allocation to save machine memory
  limits:
    cpu: "100m"
```

### 3. The Production Profile (`values-prod.yaml`)

For production, we scale up for safety, enforce network policies, lock the container down to an immutable release tag, and allocate dedicated cores:

```yaml
replicaCount: 5 # Distributed across nodes for High Availability

image:
  repository: fcog/ai-inference
  tag: "v1.2.4" # Immutable, hardlocked release tracking
  pullPolicy: IfNotPresent

resources:
  requests:
    cpu: "1000m" # Reserves full dedicated CPU computation cores
  limits:
    cpu: "2000m"
```

---

## 🚀 The Operational Deployment Execution

Now, instead of navigating folders and running broad `kubectl` commands, your deployment pipeline becomes clean, readable, and environment-explicit. You simply point the Helm CLI to your single target chart folder and feed it the environment parameter profile flag (`-f`):

#### Deploying to Development:

```bash
helm upgrade --install my-ai-dev ./services/ai-inference/chart -f ./services/ai-inference/chart/values-dev.yaml
```

#### Deploying to Production:

```bash
helm upgrade --install my-ai-prod ./services/ai-inference/chart -f ./services/ai-inference/chart/values-prod.yaml
```

---

## 🧠 Why This Strategy Elevates Your Engineering

By switching to Helm multi-environment configurations, you gain three production-critical capabilities:

1. **Atomic Configurations:** If a value fails verification or a template formatting error occurs during a release update, Helm automatically drops the execution completely. You never run into a scenario where half your application resources update while the other half crashes.

2. **True GitOps Readiness:** This folder layout enables smooth GitOps automation. Continuous deployment engines like Argo CD can watch your repository branch and apply the `values-prod.yaml` profile automatically the millisecond a new change is merged into `main`.

3. **Flawless Rollbacks:** Helm numbers every upgrade of a release. The bad revision can be a configuration error, such as a wrong CPU limit, or a code error shipped as a new image tag. Rollback returns the release to the previous revision: the previous tag, replica count, and CPU. The older image is already in the registry.

```bash
helm rollback my-ai-prod 1
```

### Conclusion

Decoupling structure from configuration variables is the dividing line between basic software orchestration and mature, production-ready platform engineering. By standardizing your deployments using dynamic Helm profiles, your infrastructure setup remains clean, cost-optimized, and immune to human copy-paste errors.
