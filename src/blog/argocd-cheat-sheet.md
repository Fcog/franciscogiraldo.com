---
layout: blog.njk
post_id: 16
tags: post
title: Argo CD Cheat Sheet
image:
date: 2026-10-11
mins: 8
excerpt: Handy reference for everyday Argo CD commands — login, apps, sync, rollback, repos, and clusters.
post_tags: ["Argo CD"]
---

Quick reference for everyday Argo CD commands.

## Login & Context

```bash
argocd version --client              # CLI version
argocd login <server>
argocd login <server> --sso
argocd login <server> --username admin --grpc-web
argocd login localhost:8080 --username admin --password <password> --insecure
argocd login --core                  # Skip the API server
argocd relogin                       # Refresh an expired token
argocd account get-user-info
argocd context                       # List Argo CD contexts
argocd context <name>                # Switch context
argocd logout <server>
```

Initial admin password after a fresh install:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
kubectl -n argocd port-forward svc/argocd-server 8080:443
```

## Applications

```bash
argocd app list
argocd app list -o wide
argocd app list -o name
argocd app list --project <project>
argocd app list -l env=prod
argocd app get <app>
argocd app get <app> -o yaml
argocd app get <app> --refresh           # Refresh app data
argocd app get <app> --hard-refresh      # Also refresh the manifest cache
argocd app get <app> --show-operation
argocd app resources <app>
argocd app manifests <app>
argocd app logs <app>
argocd app logs <app> -f
argocd app logs <app> --tail 100
argocd app wait <app>                    # Wait until synced and healthy
argocd app wait <app> --timeout 300
```

## Sync

```bash
argocd app sync <app>
argocd app sync <app> --prune            # Delete resources removed from Git
argocd app sync <app> --dry-run
argocd app sync <app> --preview-changes
argocd app sync <app> --force
argocd app sync <app> --async
argocd app sync <app> --revision <git-sha-or-branch>
argocd app sync <app> --apply-out-of-sync-only
argocd app sync <app> --local ./manifests
argocd app sync <app> --timeout 180
argocd app terminate-op <app>            # Stop a running sync
```

Sync one resource. Format is `GROUP:KIND:NAME`. Leave group empty for core resources.

```bash
argocd app sync <app> --resource :Service:<name>
argocd app sync <app> --resource apps:Deployment:<name>
argocd app sync -l app.kubernetes.io/instance=<parent-app>
```

| Flag             | Use                                          |
| ---------------- | -------------------------------------------- |
| `--prune`        | Remove resources no longer in Git            |
| `--dry-run`      | Preview the apply                            |
| `--force`        | Force apply, replace fields normally ignored |
| `--replace`      | `kubectl replace` instead of apply           |
| `--server-side`  | Server-side apply                            |
| `--local ./path` | Sync from a local directory, skip Git        |
| `--revision`     | Sync a specific commit, tag, or branch       |

## Diff, History & Rollback

```bash
argocd app diff <app>
argocd app diff <app> --local ./manifests
argocd app history <app>
argocd app rollback <app>               # Previous successful deploy
argocd app rollback <app> <history-id>
```

## Create & Update

```bash
argocd app create <app> \
  --repo https://github.com/org/repo.git \
  --path manifests \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace <namespace> \
  --revision main

argocd app create <app> \
  --repo https://github.com/org/repo.git \
  --helm-chart my-chart \
  --revision 1.2.3 \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace <namespace>

argocd app set <app> --revision main
argocd app set <app> --path manifests
argocd app set <app> --sync-policy automated --auto-prune --self-heal
argocd app set <app> --sync-policy manual
argocd app set <app> --sync-option CreateNamespace=true
argocd app set <app> -p image.tag=1.4.0
argocd app edit <app>                   # Edit the Application manifest
```

## Delete

```bash
argocd app delete <app>
argocd app delete <app> --cascade --yes # Also delete managed resources
```

## Repositories

```bash
argocd repo list
argocd repo add https://github.com/org/repo.git
argocd repo add https://github.com/org/private.git --username <user> --password <token>
argocd repo add git@github.com:org/repo.git --ssh-private-key-path ~/.ssh/id_rsa
argocd repo add https://charts.example.com --type helm --name my-charts
argocd repo get https://github.com/org/repo.git
argocd repo rm https://github.com/org/repo.git
```

## Clusters

```bash
argocd cluster list
argocd cluster add <kube-context>
argocd cluster add <kube-context> --name prod --yes
argocd cluster get <server-or-name>
argocd cluster rm <server-or-name>
```

In-cluster destination used by most apps:

```text
https://kubernetes.default.svc
```

## Projects

```bash
argocd proj list
argocd proj get <project>
argocd proj create <project>
argocd proj add-source <project> https://github.com/org/repo.git
argocd proj add-destination <project> https://kubernetes.default.svc <namespace>
argocd proj add-destination <project> https://kubernetes.default.svc '*'
```

## ApplicationSets

```bash
argocd appset list
argocd appset get <name>
argocd appset create applicationset.yaml
argocd appset delete <name>
```

## Application Manifest

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/repo.git
    targetRevision: main
    path: manifests
  destination:
    server: https://kubernetes.default.svc
    namespace: my-app
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

| Sync option               | Effect                                         |
| ------------------------- | ---------------------------------------------- |
| `CreateNamespace=true`    | Create the destination namespace               |
| `PruneLast=true`          | Prune only after the rest of the sync succeeds |
| `ApplyOutOfSyncOnly=true` | Skip resources that are already synced         |
| `ServerSideApply=true`    | Use server-side apply                          |
| `Replace=true`            | Replace resources instead of applying a patch  |

## kubectl Shortcuts

```bash
kubectl get applications -n argocd
kubectl get applicationsets -n argocd
kubectl get appprojects -n argocd
kubectl get applications -n argocd -o wide
kubectl describe application <app> -n argocd
kubectl delete application <app> -n argocd
kubectl logs -n argocd deploy/argocd-server
kubectl logs -n argocd deploy/argocd-repo-server
kubectl logs -n argocd statefulset/argocd-application-controller
```

## Common Debugging Flow

```bash
# 1. Is it out of sync or unhealthy?
argocd app list
argocd app get <app> --refresh

# 2. What would change?
argocd app diff <app>

# 3. Deploy, and remove drift
argocd app sync <app> --prune
argocd app wait <app>

# 4. Why is a resource failing?
argocd app resources <app>
argocd app logs <app> --tail 100
kubectl describe application <app> -n argocd

# 5. Recover
argocd app history <app>
argocd app rollback <app>
argocd app terminate-op <app>
```

## Useful Links

- [Argo CD Documentation](https://argo-cd.readthedocs.io/)
- [Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/)
- [CLI Commands](https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd/)
- [Declarative Setup](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/)
- [Sync Options](https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/)
- [Automated Sync Policy](https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/)
- [ApplicationSet](https://argo-cd.readthedocs.io/en/stable/user-guide/application-set/)
- [Projects](https://argo-cd.readthedocs.io/en/stable/user-guide/projects/)
- [Disaster Recovery](https://argo-cd.readthedocs.io/en/stable/operator-manual/disaster_recovery/)
- [Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/)
