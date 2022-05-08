---
layout: blog.njk
post_id: 12
tags: post
title: API Token Authentication in Symfony 6
image: 
date: 2022-05-06
mins: 2
excerpt: Steps to create a Token authentication system in a Symfony API.
post_tags: ['Symfony']
---

This article lists the steps to create a Token authentication system for an API.

### Install the Security and Maker bundles

``composer require symfony/security-bundle``

``composer require maker --dev``

### Create a User entity and security configuration

``php bin/console make:user``

### Create an API Token entity

``php bin/console make:entity``

Class Name: ApiToken

Class properties: 

    - token (string) 

    - user (relation ManyToOne with User)

### Create migration files and DB tables

``php bin/console make:migration``

``php bin/console doctrine:migrations:migrate``

### Create the Authenticator class

``php bin/console make:auth``

Select:

    - Empty authenticator
    - Class name: ApiTokenAuthenticator

### Configure the Authenticator class

[View code example](https://github.com/GaryClarke/api-platform-crash-course/blob/main/src/Security/ApiTokenAuthenticator.php)