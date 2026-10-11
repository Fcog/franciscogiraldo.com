---
layout: blog.njk
post_id: 19
tags: post
title: "Kubernetes Internal Networking: How to Find and Verify Microservice Cluster Addresses"
image: 
date: 2026-10-11
mins: 6
excerpt: How to find a microservice ClusterIP and FQDN, then verify DNS and endpoints from inside the cluster.
post_tags: ['Kubernetes', 'DevOps']
---

When you move from a monolithic backend to Kubernetes microservices, one of the first shifts is internal cluster communication.

If Service A needs to fetch metrics from Service B, do not send that traffic back out to the public internet or through the public Ingress. That adds latency, data transfer cost, and an extra security surface.

Use Kubernetes' internal network instead. Every Service registers a DNS name inside the cluster. The commands below show how to find that address and how to check that the handshake works.

## Inspect the Service registry and ClusterIPs

`kubectl get svc` lists the Services in the current namespace and the addresses in front of them:

```bash
kubectl get svc
```

```text
NAME                     TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
my-ai-app-service        ClusterIP   10.96.4.138     <none>        80/TCP     15m
my-processor-service     ClusterIP   10.96.12.42     <none>        80/TCP     12m
```

What the columns mean:

- **NAME** is the DNS hostname. A pod in the same namespace can call `http://my-processor-service`.
- **CLUSTER-IP** is a stable virtual IP for that Service. Pods behind it can crash, scale, or come back with new IPs. Callers keep using this address. kube-proxy load-balances across the ready pods.
- **PORT(S)** is the port clients use. It can differ from the container port. In the endpoints example further down, the Service listens on 80 and the pods listen on 4000.

`EXTERNAL-IP` is `<none>` because these are `ClusterIP` Services. They are reachable only from inside the cluster.

## Build the fully qualified domain name

The short name works when the caller and the Service are in the same namespace. Across namespaces, or when you do not want the app to assume a namespace, use the fully qualified name:

```text
http://<service-name>.<namespace>.svc.cluster.local:<port>
```

List name and namespace together:

```bash
kubectl get svc -o custom-columns=NAME:.metadata.name,NAMESPACE:.metadata.namespace
```

For `my-processor-service` in `default`, on the port from `kubectl get svc`, that URL is:

```text
http://my-processor-service.default.svc.cluster.local:80
```

The shorter form `my-processor-service.default` also resolves. `.svc.cluster.local` is the cluster's DNS suffix. `cluster.local` is the default; a custom cluster domain changes the suffix.

## Check DNS from inside a pod

CoreDNS answers those names. If an HTTP client times out, check resolution from a pod before changing application code.

```bash
kubectl get pods
kubectl exec -it <pod-name> -- nslookup my-processor-service
```

A healthy answer looks like this:

```text
Server:         10.96.0.10
Address:        10.96.0.10#53

Name:   my-processor-service.default.svc.cluster.local
Address: 10.96.12.42
```

`10.96.0.10` is the cluster DNS Service in this example. The address returned for the name matches the Service ClusterIP from `kubectl get svc`. The pod can resolve the Service.

Many app images do not include `nslookup`. Run the check from a short-lived pod on the cluster network instead:

```bash
kubectl run dns-check --rm -it --image=busybox:1.36 --restart=Never -- nslookup my-processor-service
```

## Missing endpoints

`nslookup` can succeed and the call can still fail with connection refused. The Service exists, and DNS points at its ClusterIP, but no pod is selected to receive the traffic.

That is usually a label selector mismatch. The Service selector does not match the labels on the pods.

```bash
kubectl get endpoints my-processor-service
```

- **Healthy:** `ENDPOINTS` lists pod IPs and the container port, for example `10.244.0.15:4000,10.244.0.16:4000`. Traffic has somewhere to go.
- **Broken:** `ENDPOINTS` is `<none>`. Compare the Service selector with the pod labels:

```bash
kubectl describe svc my-processor-service
kubectl get pods --show-labels
```

The selector keys and values have to match labels on the pods, and those pods have to be Ready. An empty endpoints list means the Service is a front door with nothing behind it.

These four checks — Service list, FQDN, DNS from a pod, and endpoints — are enough to tell whether a microservice can be reached inside the cluster before you touch Ingress, network policy, or the application.

Command reference: [kubectl Cheat Sheet](/blog/kubectl-cheat-sheet/). How this sits in a larger backend: [Backend Architecture for High-Traffic Web Apps](/blog/high-traffic-backend-architecture/).
