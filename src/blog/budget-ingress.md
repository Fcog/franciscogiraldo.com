---
layout: blog.njk
post_id: 29
tags: post
title: "Leveraging Ingress to Prevent Load Balancer Fee Spikes"
image:
date: 2026-10-19
mins: 10
excerpt: Configure a single shared NGINX Ingress Controller to route traffic for free via an internal ClusterIP mesh.
post_tags: ["Kubernetes", "Ingress"]
---

Moving your microservices from a local Minikube cluster onto a cloud platform like Google Cloud (GKE) or Azure (AKS) is an exciting milestone. However, if you are not careful with how you configure your networking, you will receive an unexpected cloud bill at the end of the month—even if you are working entirely within a "free tier" bracket.

The culprit? The standard Kubernetes `type: LoadBalancer` configuration.

When you declare a service as a `LoadBalancer` in the cloud, the cloud provider automatically provisions a dedicated external hardware router and leases a public IPv4 network address for it. If your architecture is composed of an API, a background worker, and an admin service, you end up leasing three separate public routers. These network resources quickly trigger over-budget charges.

Here is how to use a single **NGINX Ingress Controller** to host an entire multi-service stack behind a single shared entry point, keeping your public infrastructure costs at exactly \$0.

---

---

## The Architecture Strategy: ClusterIP + Ingress

Instead of exposing every service to the internet individually, we hide them completely inside the internal cluster network using **`type: ClusterIP`**. Then, we deploy a single NGINX Ingress Controller as the cluster's "front door."

```text
       [ Public User Traffic ]
                  │
                  ▼
      ┌──────────────────────┐
      │Single Public Router  │ (Only 1 Free Cloud LoadBalancer)
      │NGINX Ingress Gateway │
      └───────────┬──────────┘
                  │
      ┌───────────┴───────────┐ Parses subpaths internally
      ▼                       ▼
┌──────────────┐        ┌──────────────┐
│ ai-inference │        │data-processor│ (Private ClusterIP nodes)
│ (Port 3000)  │        │ (Port 4000)  │
└──────────────┘        └──────────────┘
```

---

## 🛠️ Step-by-Step Implementation

### 1. Hide the Application Workloads

Open your microservice deployment files (e.g., `services/ai-inference/chart/templates/deployment.yaml`) and ensure the exposed service layer strips away external visibility:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-ai-app-service
spec:
  type: ClusterIP # 🔒 Private within the cluster network layer
  selector:
    app: my-ai-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```

### 2. Configure the Global Entry Point

Create a centralized manifest file inside your shared space (`infrastructure/global-ingress.yaml`). This file dictates how a single public IP routes traffic to completely separate containers based on the URL path:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: global-microservices-ingress
  namespace: default
  annotations:
    kubernetes.io/ingress.class: "nginx"
    # 🧠 Crucial: Strips out subpaths before forwarding internally
    nginx.ingress.kubernetes.io/rewrite-target: /\$1
spec:
  rules:
    - host: my-portfolio-domain.com
      http:
        paths:
          - path: /api/?(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: my-ai-app-service
                port:
                  number: 80
          - path: /processor/?(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: my-processor-service
                port:
                  number: 80
```

---

## 🧠 Why This Saves Your Budget (and Your Portfolio)

1. **One Public Asset:** You lease exactly **one** cloud LoadBalancer (for the Ingress Controller). It doesn't matter if you scale up to 10 microservices tomorrow; they will all share that same single public gateway for free.
2. **Centralized Security:** SSL/TLS decryption (HTTPS handling) is handled entirely at the front door by the Ingress proxy. Your backend Node.js applications remain lightweight, dealing with standard HTTP internally.

### Conclusion

Building scalable systems isn't just about orchestration; it's about cost discipline. By leveraging path-based Ingress gateways, you design a cluster that mimics enterprise production networks while keeping your deployment bill completely capped.
