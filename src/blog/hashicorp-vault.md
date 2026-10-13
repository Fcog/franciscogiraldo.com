---
layout: blog.njk
post_id: 25
tags: post
title: HashiCorp Vault
image:
date: 2026-10-11
mins: 6
excerpt: What HashiCorp Vault is, what developers use it for, and the features that keep secrets out of Git and images.
post_tags: ["Vault", "Kubernetes", "DevOps"]
---

HashiCorp Vault stores secrets and decides which workload may read them. In the [backend architecture for high-traffic web apps](/blog/high-traffic-backend-architecture/), Git holds the name of a secret. Vault holds the secret.

## What it is

Vault is a service. Clients authenticate, Vault evaluates a policy, and the client receives only the paths that policy allows. Data is encrypted at rest. An audit device can record each read and write.

A secret can be static or dynamic. A static secret is a value you wrote, such as a third-party token in the key-value store. A dynamic secret is one Vault creates when the client asks, such as a database user that exists until its lease ends. When the lease ends, Vault revokes it.

A policy is a list of paths and capabilities (`read`, `create`, `update`, `delete`). Authentication is separate from that policy. The Kubernetes auth method checks a pod's service account token with the cluster API, then maps that service account onto a Vault role. The role names the policies.

## What it is used for

A high-traffic system collects more secrets than a database password: registry credentials, object-storage keys, tokens for third-party services, and the credentials an inference pod uses to pull a model. Those values do not belong in a Docker image, in a Helm values file, or in GitHub.

The deploy repo can say which path an application reads. [Argo CD](/blog/argo-cd/) will sync that configuration. The secret material was never in Git, so a sync cannot leak it.

On Kubernetes, the pod authenticates with its service account. Two common deliveries:

- The **Vault Agent injector** mutates the pod and writes rendered secrets to a shared volume before the application starts.
- The **Secrets Store CSI driver** mounts secrets as files through a CSI volume.

The application reads a file or an environment variable. It does not embed a Vault token in the image.

```yaml
metadata:
  annotations:
    vault.hashicorp.com/agent-inject: "true"
    vault.hashicorp.com/role: "my-app"
    vault.hashicorp.com/agent-inject-secret-db: "database/creds/my-app"
```

The role `my-app` is bound to this deployment's service account and namespace. The database engine issues a username and password for the lease. A leaked password expires with the lease.

## Main features

- **Secret engines.** Key-value stores static secrets. The database engine issues database users. PKI issues certificates. Transit encrypts and decrypts without the application holding the key. Cloud engines issue short-lived cloud credentials.
- **Auth methods.** Kubernetes, token, AppRole, JWT/OIDC, and cloud IAM are ways to log in. The method identifies the caller. Policies decide what that caller can do.
- **Policies.** A path and a capability list are the unit of access. One role for the application, another for CI, with different paths.
- **Dynamic secrets and leases.** Vault creates the credential on read and revokes it when the lease ends or is revoked early. Clients can renew a lease until its max TTL.
- **Agent injector.** Annotations on the pod template select a role and the secret paths. The injector adds an init container that authenticates and writes the files.
- **CSI provider.** A volume mounts the same secrets as files for pods that should not run an extra agent container.
- **Audit devices.** A file, socket, or syslog device records requests and responses, with secrets hashed, so you can see who read a path.
- **Encryption at rest.** Stored secrets are encrypted. The transit engine also lets an application encrypt customer data while Vault keeps the key.

[GitHub Actions](/blog/github-actions/) still needs a short-lived token to push an image. That credential is for the pipeline. The credentials the running pods use come from Vault.

## Useful links

- [Backend architecture for high-traffic web apps](/blog/high-traffic-backend-architecture/)
- [Vault documentation](https://developer.hashicorp.com/vault/docs)
- [Kubernetes auth method](https://developer.hashicorp.com/vault/docs/auth/kubernetes)
- [Agent injector annotations](https://developer.hashicorp.com/vault/docs/deploy/kubernetes/injector/annotations)
