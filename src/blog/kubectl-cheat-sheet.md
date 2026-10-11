---
layout: blog.njk
post_id: 14
tags: post
title: kubectl Cheat Sheet
image: 
date: 2026-10-11
mins: 8
excerpt: Handy reference for everyday kubectl commands — pods, deployments, services, logs, and debugging.
post_tags: ['Kubernetes', 'DevOps']
---

Quick reference for everyday `kubectl` commands.

## Context & Cluster Info

```bash
kubectl config get-contexts          # List contexts
kubectl config current-context       # Show active context
kubectl config use-context <name>    # Switch context
kubectl cluster-info                 # Cluster endpoints
kubectl get nodes                    # List nodes
kubectl get namespaces               # List namespaces
```

## Namespaces

```bash
kubectl get all -n <namespace>       # All resources in a namespace
kubectl get all -A                   # All resources, all namespaces
kubectl create namespace <name>
kubectl delete namespace <name>
```

Tip: set a default namespace for your context:

```bash
kubectl config set-context --current --namespace=<namespace>
```

## Pods

```bash
kubectl get pods
kubectl get pods -o wide             # Include node + IP
kubectl get pods -A                  # All namespaces
kubectl get pod <name> -o yaml
kubectl describe pod <name>
kubectl delete pod <name>
kubectl delete pod <name> --force --grace-period=0
```

### Create / run

```bash
kubectl run nginx --image=nginx
kubectl run debug --image=busybox -it --rm --restart=Never -- sh
```

### Exec & copy

```bash
kubectl exec -it <pod> -- /bin/sh
kubectl exec -it <pod> -c <container> -- /bin/bash
kubectl cp <pod>:/path/file ./local-file
kubectl cp ./local-file <pod>:/path/file
```

## Deployments

```bash
kubectl get deployments
kubectl describe deployment <name>
kubectl create deployment <name> --image=<image>
kubectl scale deployment <name> --replicas=3
kubectl set image deployment/<name> <container>=<image>:<tag>
kubectl rollout status deployment/<name>
kubectl rollout history deployment/<name>
kubectl rollout undo deployment/<name>
kubectl rollout undo deployment/<name> --to-revision=2
kubectl delete deployment <name>
```

## Services

```bash
kubectl get svc
kubectl describe svc <name>
kubectl expose deployment <name> --port=80 --target-port=8080 --type=ClusterIP
kubectl expose deployment <name> --type=LoadBalancer --port=80
kubectl port-forward svc/<name> 8080:80
kubectl delete svc <name>
```

| Type | Use case |
|------|----------|
| `ClusterIP` | Internal only (default) |
| `NodePort` | Expose on each node |
| `LoadBalancer` | Cloud load balancer |
| `ExternalName` | DNS alias to external host |

## Logs & Debugging

```bash
kubectl logs <pod>
kubectl logs <pod> -c <container>
kubectl logs <pod> --previous         # Previous crashed container
kubectl logs <pod> -f                 # Follow (tail -f)
kubectl logs <pod> --tail=100
kubectl logs -l app=<label>           # By label
kubectl top pods                      # Resource usage (needs metrics-server)
kubectl top nodes
kubectl get events --sort-by=.lastTimestamp
```

## Apply / Diff / Delete Manifests

```bash
kubectl apply -f manifest.yaml
kubectl apply -f ./folder/
kubectl apply -k ./overlays/prod/     # Kustomize
kubectl diff -f manifest.yaml
kubectl delete -f manifest.yaml
kubectl get -f manifest.yaml
```

Dry-run before creating:

```bash
kubectl apply -f manifest.yaml --dry-run=client -o yaml
kubectl create deployment nginx --image=nginx --dry-run=client -o yaml > deploy.yaml
```

## Labels & Selectors

```bash
kubectl get pods -l app=api
kubectl get pods -l 'env in (prod,staging)'
kubectl label pod <name> env=prod
kubectl label pod <name> env-           # Remove label
```

## ConfigMaps & Secrets

```bash
kubectl get configmaps
kubectl get secrets
kubectl create configmap <name> --from-literal=KEY=value
kubectl create configmap <name> --from-file=./config.env
kubectl create secret generic <name> --from-literal=password=s3cret
kubectl create secret docker-registry regcred \
  --docker-server=<registry> \
  --docker-username=<user> \
  --docker-password=<pass>
kubectl get secret <name> -o jsonpath='{.data.password}' | base64 -d
```

## Jobs & CronJobs

```bash
kubectl get jobs
kubectl get cronjobs
kubectl create job <name> --image=<image> -- <command>
kubectl create job --from=cronjob/<cronjob-name> <job-name>
kubectl delete job <name>
```

## Nodes & Cordoning

```bash
kubectl get nodes
kubectl describe node <name>
kubectl cordon <node>                 # Mark unschedulable
kubectl drain <node> --ignore-daemonsets --delete-emptydir-data
kubectl uncordon <node>
```

## Useful Output Formats

```bash
kubectl get pods -o wide
kubectl get pods -o yaml
kubectl get pods -o json
kubectl get pods -o jsonpath='{.items[*].metadata.name}'
kubectl get pods -o custom-columns=NAME:.metadata.name,STATUS:.status.phase
kubectl get pods --show-labels
```

## Shorthand Resource Names

| Short | Full |
|-------|------|
| `po` | pods |
| `deploy` | deployments |
| `svc` | services |
| `ns` | namespaces |
| `cm` | configmaps |
| `ing` | ingresses |
| `rs` | replicasets |
| `sts` | statefulsets |
| `ds` | daemonsets |
| `pv` / `pvc` | persistentvolumes / claims |

```bash
kubectl get po,svc,deploy -n default
```

## Common Debugging Flow

```bash
# 1. What's failing?
kubectl get pods
kubectl describe pod <name>
kubectl get events --sort-by=.lastTimestamp

# 2. Check logs
kubectl logs <pod> --previous
kubectl logs <pod> -c <container>

# 3. Shell in
kubectl exec -it <pod> -- /bin/sh

# 4. Network / service
kubectl get endpoints <svc>
kubectl port-forward pod/<name> 8080:80
```

## Useful Links

- [kubectl Cheat Sheet (official)](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [kubectl Reference](https://kubernetes.io/docs/reference/kubectl/)
- [kubectl Commands](https://kubernetes.io/docs/reference/kubectl/generated/kubectl/)
- [Kubernetes Concepts](https://kubernetes.io/docs/concepts/)
- [Configure Access to Multiple Clusters](https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/)
- [Debug Running Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/)
- [Declare Network Policy](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
- [Kustomize](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/)
- [JSONPath Support](https://kubernetes.io/docs/reference/kubectl/jsonpath/)
- [API Overview](https://kubernetes.io/docs/reference/using-api/)
