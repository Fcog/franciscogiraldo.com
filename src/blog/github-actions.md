---
layout: blog.njk
post_id: 20
tags: post
title: GitHub Actions
image:
date: 2026-10-11
mins: 5
excerpt: What GitHub Actions is, what developers use it for, and the features that matter on a CI runner.
post_tags: ["GitHub Actions", "DevOps"]
---

GitHub Actions runs your build inside GitHub. A workflow file in the repository starts on a pull request or a merge, and a runner executes the steps. In the [backend architecture for high-traffic web apps](/blog/high-traffic-backend-architecture/), Actions is the CI runner: test, build the image, publish the tag.

## What it is

A workflow is YAML under `.github/workflows`. GitHub starts it when an event happens: a pull request, a push, a schedule, or a button in the Actions tab. The work runs on a runner, a machine that checks out the repository and executes the jobs you listed.

A job is a set of steps on one runner. Steps are shell commands or actions, which are reusable units such as `actions/checkout`. Jobs in one workflow can run in parallel. A job can also wait for another with `needs`, so the image build starts after the tests pass.

Runners are GitHub-hosted or self-hosted. A GitHub-hosted runner is a clean virtual machine GitHub provides for that job. A self-hosted runner is a machine you register with the repository or the organization and keep online yourself.

## What it is used for

On a pull request, the workflow installs dependencies and runs the tests. On a merge to the main branch, it builds the Docker image, pushes that image to the registry, and commits the new tag into the deploy repository. That commit is the release. [Argo CD](/blog/argo-cd/) rolls the cluster from it.

A failed test ends the workflow. The tag in Git stays on the last build that passed.

A normal application build fits a GitHub-hosted runner. A job that needs your private network, a large warm cache, or a GPU belongs on a self-hosted runner. A machine-learning training image is the usual reason to add one.

Give the job a short-lived credential for the registry. OpenID Connect can assume a cloud role for the length of the run. Passwords that the running application needs stay in [Vault](/blog/hashicorp-vault/). The workflow only needs permission to push an image and to write the tag commit.

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: npm test
  build:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: docker build -t ghcr.io/acme/my-app:${{ github.sha }} .
```

The real build job also logs in to the registry, pushes the tag, and commits that tag to the deploy repo. The shape is the same: tests first, publish only on the main branch.

## Main features

- **Workflows as code.** The pipeline is in the repo and shows up in the same pull request as the change.
- **Event triggers.** `pull_request`, `push`, `schedule`, `workflow_dispatch`, and `workflow_call` cover CI, nightly jobs, manual runs, and shared workflows.
- **Jobs, steps, and `needs`.** Parallel jobs shorten the wait. `needs` keeps the publish step behind a green test job.
- **GitHub-hosted and self-hosted runners.** Hosted runners fit ordinary builds. Self-hosted runners cover a private network, a warm cache, or a GPU.
- **Reusable actions.** Checkout, registry login, and image push can be actions from the Marketplace or from your own repositories.
- **Matrix.** One job definition runs across several language versions or operating systems.
- **Cache and artifacts.** A cache keeps dependency downloads between runs. Artifacts pass files from one job to the next.
- **Secrets and OpenID Connect.** Repository and environment secrets inject credentials. OIDC exchanges a GitHub token for a short-lived cloud role.
- **Environments.** Protection rules and required reviewers sit in front of a job that is allowed to touch production.
- **Reusable workflows.** Several repositories call one workflow file, so every service builds the same way.

## Useful links

- [Backend architecture for high-traffic web apps](/blog/high-traffic-backend-architecture/)
- [GitHub Actions documentation](https://docs.github.com/actions)
- [Workflow syntax](https://docs.github.com/actions/reference/workflows-and-actions/workflow-syntax)
