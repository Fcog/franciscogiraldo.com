---
layout: blog.njk
post_id: 26
tags: post
title: Argo CD
image:
date: 2026-10-11
mins: 6
excerpt: What Argo CD is, what developers use it for, and the GitOps features that keep a cluster matched to Git.
post_tags: ["Argo CD", "Kubernetes", "DevOps"]
---

Argo CD makes a Kubernetes cluster match what Git says, and puts it back when someone edits the cluster by hand. In the [backend architecture for high-traffic web apps](/blog/high-traffic-backend-architecture/), a release is a commit. Argo CD rolls the Deployment from that commit.

## What it is

Argo CD is a controller and a UI, installed in the cluster. An Application is a custom resource. It points at a Git repository, a path, and a target revision, and at a destination cluster and namespace. Argo CD renders the manifests, compares them with the live objects, and reports whether they match.

The source can be a [Helm](/blog/helm/) chart, a Kustomize directory, plain YAML, or Jsonnet. For a Helm chart, the Application names the values files. Argo CD renders. You do not have to run `helm upgrade` from a laptop for that environment.

A sync is the step that applies the rendered manifests. Automated sync does that whenever Git changes. Self-heal re-applies Git when the live objects drift. Prune deletes objects that disappeared from Git.

## What it is used for

kubectl from a laptop does not record who changed production, and it does not scale to a fleet of services. Argo CD watches the deploy repository. [GitHub Actions](/blog/github-actions/) builds the image and commits the new tag into the values file. Argo CD sees the commit and rolls the [Kubernetes](/blog/kubernetes/) Deployment. To undo it, revert the commit. Argo CD syncs the previous tag.

The same control plane can deploy many applications, to many namespaces, and to more than one cluster. A project draws the boundary: which repositories are allowed, and which clusters and namespaces they may target.

Drift is the failure mode. If Git says 8 replicas and the cluster has 3, the next restart follows whichever one you forgot. Self-heal makes Git the one that wins.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/acme/deploy.git
    path: charts/my-app
    targetRevision: main
    helm:
      valueFiles:
        - values-production.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

The values file names the image tag and the Vault paths. Secret values stay in [Vault](/blog/hashicorp-vault/). Argo CD syncs the configuration that points at them.

## Main features

- **Application.** One resource ties a Git source to a destination. Health and sync status are visible on that object, in the UI, and in the CLI.
- **Helm, Kustomize, YAML, and Jsonnet.** The source tool is part of the Application. Helm values files and Kustomize overlays select the environment.
- **Automated sync.** The cluster follows Git. A new commit rolls out after Argo CD refreshes the repo.
- **Self-heal.** A manual edit in the cluster is reverted to the rendered Git state.
- **Prune.** Objects removed from the chart are removed from the cluster on the next sync.
- **Diff and refresh.** The UI and `argocd app diff` show what would change. A refresh re-reads Git. A hard refresh bypasses the cached manifest.
- **Rollback.** Sync an older application revision, or revert the Git commit and let automated sync do it.
- **Projects.** A project limits source repositories and destination clusters, and is where RBAC is attached.
- **SSO and RBAC.** Users log in with your identity provider. Policies decide who can sync which application.
- **ApplicationSets.** A generator stamps out many Applications from one template, for every cluster or every service in a directory.
- **Multi-cluster.** The destination server can be the cluster Argo CD runs on, or another cluster registered with `argocd cluster add`.
- **Sync waves and hooks.** Resource annotations order a migration Job ahead of the Deployment that needs it.

A finished training Job is a workload that should exit. Automated sync with prune is for the applications you intend to keep. Leave one-shot Jobs out of an Application that would recreate them forever.

## Useful links

- [Argo CD Cheat Sheet](/blog/argocd-cheat-sheet/)
- [Backend architecture for high-traffic web apps](/blog/high-traffic-backend-architecture/)
- [Argo CD documentation](https://argo-cd.readthedocs.io/)
- [Application specification](https://argo-cd.readthedocs.io/en/stable/user-guide/application-specification/)
