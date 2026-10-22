---
layout: blog.njk
post_id: 23
tags: post
title: NGINX Ingress Controller
image:
date: 2026-10-11
mins: 6
excerpt: What the NGINX Ingress Controller is, what developers use it for, and the routing features on the public edge of a cluster.
post_tags: ["NGINX", "Kubernetes"]
---

The NGINX Ingress Controller is the process that turns Kubernetes Ingress objects into a running NGINX configuration. Clients use one hostname. NGINX terminates TLS and proxies to a Service. In the [backend architecture for high-traffic web apps](/blog/high-traffic-backend-architecture/), it is the public door: host, path, and TLS.

## What it is

The Kubernetes Ingress API describes a route. A host and a path go to a Service and a port. An Ingress object does nothing by itself. A controller has to be running in the cluster, watching those objects and programming a proxy.

Ingress NGINX (`kubernetes/ingress-nginx`) is the community controller that uses NGINX for that proxy. It runs as a Deployment. A Service, usually of type LoadBalancer, puts a stable address in front of the controller pods. When an Ingress changes, the controller reloads NGINX.

NGINX maintains a separate controller, `nginxinc/kubernetes-ingress`. It is a different project and uses `nginx.org` annotations. The annotations below are the community ones, `nginx.ingress.kubernetes.io`.

Service-to-service calls stay on cluster DNS. An application calling another Service uses `http://my-processor-service`. That hop does not go out through NGINX. [Kubernetes internal networking](/blog/kubernetes-internal-networking/) covers those addresses.

## What it is used for

Developers publish an HTTP service without giving every pod a public address. One Ingress can route `app.example.com` to the application Service. A second host, or a second Ingress, can publish only the inference Service that external clients are allowed to call.

TLS ends at the controller. The certificate is a Kubernetes Secret. In this platform that Secret is issued from [Vault](/blog/hashicorp-vault/) or from the certificate workflow. The private key is not committed next to the [Helm](/blog/helm/) chart.

Timeouts, body size, and rate limits are annotations on the route, set per environment in Helm values. The controller Deployment itself is scaled when TLS and connection count need more CPU.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "8m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "30"
spec:
  ingressClassName: nginx
  tls:
    - hosts: [app.example.com]
      secretName: app-tls
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-app
                port:
                  number: 80
```

`ingressClassName: nginx` selects this controller when the cluster runs more than one.

## Main features

- **Host and path routing.** Rules match a hostname and a path and name the Service that should receive the request.
- **TLS termination.** A `tls` block names the hosts and the Secret that holds the certificate and key.
- **IngressClass.** Several controllers can run in one cluster. The class on the Ingress picks which one programs the route.
- **Annotations for proxy behavior.** `proxy-body-size`, `proxy-read-timeout`, `proxy-send-timeout`, and `limit-rps` set the limit for that route.
- **Load balancing to pods.** NGINX forwards to the Service endpoints that are ready. New pods join after they pass the readiness probe.
- **WebSocket and gRPC.** Upgrades and HTTP/2 backends are configuration on the Ingress, so those protocols can be published on the same edge.
- **A controller you can scale.** The controller is a Deployment with resource requests. More public traffic means more controller replicas and enough CPU to terminate TLS.
- **Metrics.** The controller exposes request metrics. Rate, errors, and latency at this edge are the first signal the [architecture overview](/blog/high-traffic-backend-architecture/) points at for observability.

## Project status

In March 2026 the Kubernetes project retired Ingress NGINX. After that date the project publishes no releases, bug fixes, or security patches. Installations that are already running keep their current behavior, and the manifests above still describe that controller.

The Ingress API remains part of Kubernetes and is feature-frozen. For new clusters, Kubernetes recommends [Gateway API](https://gateway-api.sigs.k8s.io/) or another maintained Ingress controller. This page documents the controller the architecture article uses, including that retirement.

## Useful links

- [Backend architecture for high-traffic web apps](/blog/high-traffic-backend-architecture/)
- [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [Ingress NGINX annotations](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/)
- [Ingress NGINX retirement](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/)
