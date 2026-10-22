---
layout: blog.njk
post_id: 15
tags: post
title: Helm Cheat Sheet
image:
date: 2026-10-11
mins: 8
excerpt: Handy reference for everyday Helm commands — install, upgrade, rollback, repos, values, and debugging.
post_tags: ["Helm"]
---

Quick reference for everyday Helm commands.

## Basics

```bash
helm version                         # Client (and server if connected)
helm env                             # Show Helm environment variables
helm help
helm help install
```

## Repositories

```bash
helm repo add <name> <url>
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo list
helm repo update
helm repo remove <name>
helm search repo <keyword>
helm search repo bitnami/nginx --versions
```

## Charts

```bash
helm create <chart-name>             # Scaffold a new chart
helm show chart <chart>              # Chart metadata
helm show values <chart>             # Default values.yaml
helm show readme <chart>
helm show all <chart>
helm pull <chart>                    # Download chart archive
helm pull <chart> --untar
helm package ./my-chart              # Package chart into .tgz
helm lint ./my-chart                 # Validate chart
helm dependency update ./my-chart
helm dependency build ./my-chart
helm dependency list ./my-chart
```

## Install

```bash
helm install <release> <chart>
helm install my-nginx bitnami/nginx
helm install my-app ./my-chart
helm install my-app ./my-chart -n <namespace> --create-namespace
helm install my-app ./my-chart -f values.yaml
helm install my-app ./my-chart --set image.tag=1.2.3
helm install my-app ./my-chart --set-string env=prod
helm install my-app ./my-chart --dry-run --debug
helm install my-app ./my-chart --wait --timeout 5m
helm install my-app ./my-chart --atomic   # Rollback on failure
```

## Upgrade & Rollback

```bash
helm upgrade <release> <chart>
helm upgrade my-app ./my-chart -f values.yaml
helm upgrade my-app ./my-chart --install          # Install if missing
helm upgrade my-app ./my-chart --reuse-values
helm upgrade my-app ./my-chart --reset-values
helm upgrade my-app ./my-chart --force
helm upgrade my-app ./my-chart --atomic --wait

helm rollback <release>
helm rollback my-app
helm rollback my-app 2                            # To revision 2
helm history my-app
```

## List & Status

```bash
helm list
helm list -A                                      # All namespaces
helm list -n <namespace>
helm list --pending
helm list --failed
helm status <release>
helm status my-app -n <namespace>
helm get all my-app
helm get values my-app
helm get values my-app --all                       # Including defaults
helm get manifest my-app
helm get notes my-app
helm get hooks my-app
```

## Uninstall

```bash
helm uninstall <release>
helm uninstall my-app -n <namespace>
helm uninstall my-app --keep-history
helm uninstall my-app --no-hooks
```

## Values Overrides

| Flag                    | Use                                |
| ----------------------- | ---------------------------------- |
| `-f values.yaml`        | Load values from file (can repeat) |
| `--set key=value`       | Override a single value            |
| `--set key=a\,b`        | List values                        |
| `--set-string key=001`  | Force string type                  |
| `--set-file key=./file` | Set value from file contents       |
| `--reuse-values`        | Keep previous release values       |
| `--reset-values`        | Reset to chart defaults            |

```bash
# Multiple files: later files win
helm upgrade my-app ./my-chart -f values.yaml -f values-prod.yaml

# Nested keys
helm upgrade my-app ./my-chart --set image.repository=myrepo/app --set image.tag=v2
```

## Template & Debug

```bash
helm template my-app ./my-chart
helm template my-app ./my-chart -f values.yaml
helm template my-app ./my-chart --debug
helm install my-app ./my-chart --dry-run --debug
helm upgrade my-app ./my-chart --dry-run --debug
helm get manifest my-app | kubectl apply --dry-run=client -f -
```

## Diff (plugin)

Requires the [helm-diff](https://github.com/databus23/helm-diff) plugin:

```bash
helm plugin install https://github.com/databus23/helm-diff
helm diff upgrade my-app ./my-chart -f values.yaml
helm diff revision my-app 2 3
```

## Releases & Revisions

```bash
helm history my-app
helm history my-app --max 10
helm get values my-app --revision 2
helm get manifest my-app --revision 2
helm rollback my-app 2
```

## OCI Registries

```bash
helm registry login <registry>
helm registry logout <registry>
helm push my-chart-0.1.0.tgz oci://<registry>/<path>
helm pull oci://<registry>/<path>/my-chart --version 0.1.0
helm install my-app oci://<registry>/<path>/my-chart --version 0.1.0
```

## Useful Chart Structure

```text
my-chart/
  Chart.yaml          # Chart metadata
  values.yaml         # Default values
  charts/             # Chart dependencies
  templates/          # Kubernetes manifests
  templates/_helpers.tpl
  .helmignore
```

```bash
# Common template helpers
{{ .Release.Name }}
{{ .Release.Namespace }}
{{ .Chart.Name }}
{{ .Chart.Version }}
{{ .Values.image.tag }}
{{ include "my-chart.fullname" . }}
{{ toYaml .Values.resources | nindent 2 }}
```

## Common Debugging Flow

```bash
# 1. What releases exist?
helm list -A
helm status my-app

# 2. What would change?
helm diff upgrade my-app ./my-chart -f values.yaml
helm upgrade my-app ./my-chart --dry-run --debug

# 3. Why did it fail?
helm history my-app
kubectl get pods -n <namespace>
kubectl describe pod <pod> -n <namespace>
kubectl logs <pod> -n <namespace>

# 4. Recover
helm rollback my-app
# or
helm upgrade my-app ./my-chart --atomic --wait
```

## Useful Links

- [Helm Documentation](https://helm.sh/docs/)
- [Helm Commands](https://helm.sh/docs/helm/)
- [Chart Best Practices](https://helm.sh/docs/chart_best_practices/)
- [Chart Template Guide](https://helm.sh/docs/chart_template_guide/)
- [Values Files](https://helm.sh/docs/chart_template_guide/values_files/)
- [Hooks](https://helm.sh/docs/topics/charts_hooks/)
- [Helm Diff Plugin](https://github.com/databus23/helm-diff)
- [Artifact Hub](https://artifacthub.io/)
- [Official Helm Charts / Bitnami](https://github.com/bitnami/charts)
- [OCI Support](https://helm.sh/docs/topics/registries/)
