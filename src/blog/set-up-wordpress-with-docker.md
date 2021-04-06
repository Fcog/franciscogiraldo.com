---
layout: blog.njk
post_id: 2
tags: post
title: Set Up WordPress with Docker
image: docker-compose-wordpress.png
date: 2021-04-01
mins: 1
excerpt: Standardize your WordPress environment setup using Docker Compose.
---

## Overview of Docker Compose
[Compose](https://docs.docker.com/compose) is a tool for defining and running multi-container [Docker](https://docs.docker.com/compose) applications. With Compose, you use a YAML file to configure your application’s services. Then, with a single command, you create and start all the services from your configuration.
\
&nbsp;
\
&nbsp;
## 1. Install Docker
[Download Docker](https://www.docker.com/products/docker-desktop) 
\
&nbsp;
\
&nbsp;
## 2. Download the configuration files
Download the configuration files: [https://github.com/Fcog/docker-compose-wp-composer](https://github.com/Fcog/docker-compose-wp-composer)
\
&nbsp;
\
&nbsp;
## 3. Installation
run ``docker compose up`` or ``docker-compose up``

Go to [http://0.0.0.0:8000/](http://0.0.0.0:8000/)
\
&nbsp;
\
&nbsp;
## 4. Open a beer and enjoy!