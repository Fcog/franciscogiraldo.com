---
layout: blog.njk
post_id: 24
tags: post
title: Helm
image:
date: 2026-10-11
mins: 6
excerpt: What Helm is, what developers use it for, and how a chart both packages your app and installs other technologies.
post_tags: ["Helm"]
---

Helm packages Kubernetes manifests and installs them as a named release. You use it for your own application, and you use the same command to install other technologies that publish a chart. In the [backend architecture for high-traffic web apps](/blog/high-traffic-backend-architecture/), staging and production of your application differ by a values file. The chart stays shared.

## What it is

A chart is a directory: `Chart.yaml` for the name and version, a `templates/` folder of Kubernetes manifests, and a `values.yaml` of defaults. The templates are Go templates. At install time Helm fills them with values and sends the rendered YAML to the cluster.

A release is one installation of a chart, with a name, a namespace, and a revision number. Changing values or the chart and upgrading creates the next revision. `helm history` lists them. `helm rollback` returns to an earlier one.

A public chart is an installer for someone else's software. Your own chart is the package for your application. Both become a release when you install them. Your Deployment, Service, Ingress, and autoscaler live in your chart. The image tag, replica count, hostname, and CPU live in values.

## What it is used for

Helm installs other technologies onto the cluster. Vault, Argo CD, cert-manager, and an ingress controller are published as charts by their authors. You add the publisher's repository, then install a release. The chart already contains the Deployment, Service, RBAC, and default configuration. A values file changes the replica count, the storage size, or the service type. `helm upgrade` moves that release to a newer chart version.

```bash
helm repo add hashicorp https://helm.releases.hashicorp.com
helm install vault hashicorp/vault \
  --namespace vault \
  --create-namespace
```

That release is Vault, running from HashiCorp's chart. The same two commands install any other published chart: swap the repository and the chart name. In this architecture, [Vault](/blog/hashicorp-vault/) and [Argo CD](/blog/argo-cd/) arrive on the cluster this way.

The other use is your own application. Copying a pile of YAML per environment is how staging and production drift. A chart keeps one shape. Staging might run 2 replicas on a small host. Production might run 8, with a higher memory limit and a public hostname. Same templates.

Values name secrets. They do not contain them. A values file can say the password comes from the path `db-password`. The password itself stays in [Vault](/blog/hashicorp-vault/).

In this platform, developers rarely run `helm upgrade` against production by hand. [Argo CD](/blog/argo-cd/) renders the chart from Git and syncs the cluster. Helm is still the package being rendered. `helm template` locally shows the YAML Argo CD will apply.

```yaml
# values-production.yaml
replicaCount: 8
image:
  repository: ghcr.io/acme/my-app
  tag: "1.4.2"
ingress:
  host: app.example.com
resources:
  requests:
    cpu: "500m"
    memory: 512Mi
```

A matching `values-staging.yaml` sets `replicaCount: 2` and a staging host. The Deployment template reads `.Values.replicaCount` and `.Values.image.tag`.

## Main features

- **Charts.** One versioned package holds the manifests, the default values, and optional notes and tests.
- **Installer for other technologies.** `helm repo add` registers a publisher. `helm install` creates a release of their chart. `helm upgrade` moves that release to a newer version.
- **Templates.** Go templates and Sprig functions generate YAML from values. Conditionals include a resource only when a value says so.
- **Values layers.** `values.yaml` holds defaults. Extra files with `-f` and single keys with `--set` override them. Later layers win.
- **Releases and revisions.** Each upgrade is a numbered revision of a named release, stored so you can see what changed.
- **Rollback.** `helm rollback <release> <revision>` reapplies an earlier revision when a values change was wrong.
- **Dependencies.** A chart can declare other charts. `helm dependency update` fetches them into `charts/` before render.
- **Repositories and OCI.** Charts are published to a Helm repository or to an OCI registry, and installed by name and version.
- **Local render.** `helm template` and `helm lint` check the chart on your machine before a release exists.
- **Hooks.** A hook runs a Job at a point in the release, such as before an upgrade, for a migration that has to finish first.

## Useful links

- [Helm Cheat Sheet](/blog/helm-cheat-sheet/)
- [Backend architecture for high-traffic web apps](/blog/high-traffic-backend-architecture/)
- [Helm documentation](https://helm.sh/docs/)
- [Chart template guide](https://helm.sh/docs/chart_template_guide/)
