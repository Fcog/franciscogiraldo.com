---
layout: blog.njk
post_id: 33
tags: post
title: "Why Argo CD Changes the Way We Deploy Web Applications"
image:
date: 2026-10-20
mins: 10
excerpt: Compare modern pull-based GitOps logic to see how Argo CD continuously monitors Git configurations and self-heals cluster state automatically.

post_tags: ["Argo CD"]
---

# Decoupled Continuous Delivery: Why Argo CD Changes the Way We Deploy Web Applications

Traditional Continuous Delivery (CD) pipelines follow a familiar pattern: your CI runner tests your code, builds a container, and then connects directly to your production cluster using tools like `kubectl` or `helm` to push the update out.

While this works for simple apps, it introduces a major architectural problem: **The Push-Based Security Footprint**.

To let an external runner like GitHub Actions push configurations into your cluster, you have to export highly sensitive cluster administrative credentials (your `kubeconfig` file or cloud access tokens) and save them inside an external service. If your GitHub repository is ever compromised, malicious actors gain full access to your cloud network infrastructure.

Furthermore, push-based pipelines are completely blind to "configuration drift." If a developer manually alters a service configuration using the command line (`kubectl edit`), the traditional pipeline won't notice until the next scheduled code push.

Here is how **Argo CD** flips this model entirely on its head, implementing a secure, pull-based **GitOps** framework running inside your cluster.

---

## The Pull-Based GitOps Cycle

Argo CD does not expect external triggers to deploy code. Instead, it runs natively _inside_ your Kubernetes cluster, continually pulling down configurations from your Git repository and forcing the cluster state to match the code repository.

```text
  [ GitHub Repository ] (Main Branch)
           ▲
           │
           │ 1. Continually Polls for Tag Updates
           ▼
┌──────────────────────┐
│       Argo CD        │ (Runs inside the cluster)
└──────────┬───────────┘
           │
           │ 2. Detects OutOfSync State
           │ 3. Executes Rolling Update
           ▼
┌──────────────────────┐
│  Kubernetes Pods     │ (Forced to match Git)
└──────────────────────┘
```

---

## 🛠️ Step-by-Step Implementation

We will deploy Argo CD inside our local environment and construct the core Application manifest pointing to our microservice Helm directory.

### 1. Bootstrapping Argo CD Inside the Cluster

Run the following commands to install the core server components:

```bash
# Create an isolated system namespace
kubectl create namespace argocd

# Apply the official upstream Argo CD installation manifest stack
kubectl apply -n argocd -f https://githubusercontent.com

# Verify components are running cleanly
kubectl get pods -n argocd
```

### 2. Creating the Argo CD Application Bridge (`argo-app.yaml`)

Place this custom resource manifest inside your shared `infrastructure/argocd/` directory. It instructs the cluster engine to track your custom Helm charts:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ai-inference-service-prod
  namespace: argocd
spec:
  project: default

  # 🌐 THE SOURCE: Where your code infrastructure lives
  source:
    repoURL: "https://github.com"
    targetRevision: main
    path: services/ai-inference/chart # Path to your Helm subfolder
    helm:
      valueFiles:
        - values-prod.yaml # Enforces production value parameters

  # 🛰️ THE DESTINATION: Where to deploy the manifests
  destination:
    server: "https://default.svc" # Internal alias for local cluster
    namespace: default

  # 🤖 THE AUTOMATION LAYER (GitOps Sync Policy)
  syncPolicy:
    automated:
      prune: true # Automatically deletes dead assets removed from Git
      selfHeal: true # Automatically overwrites manual cluster overrides!
```

---

## 🧠 Why This Strategy Elevates Cluster Security

1. **Zero Egress Credentials:** Your cluster credentials never leave the infrastructure network layer. GitHub Actions only needs access to push images to Docker Hub and tags to Git. Argo CD safely reads from Git using inbound pull parameters.
2. **Automated Self-Healing:** Because the configuration has `selfHeal: true` activated, your infrastructure is immune to human intervention. If an engineer deletes a deployment or scales a replica count manually using their command line, Argo CD immediately registers the cluster status as `OutOfSync`, rejects the manual drift, and instantly forces the system back to match exactly what is written in your GitHub code repository.

### Conclusion

Shifting from push-based script automation to pull-based declarative synchronization is the defining step of advanced MLOps platform operations. By deploying Argo CD, you establish an immutable, automated delivery gate that keeps your systems secured, auditable, and self-healing.
