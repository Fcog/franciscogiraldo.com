---
layout: blog.njk
post_id: 9
tags: post
title: Domain Driven Design
image: 
date: 2022-04-27
mins: 2
excerpt: What is Domain Driven Design.
post_tags: ['Arquitecture']
---

Domain Driven Design (DDD) is a method for optimizing a team’s understanding of a problem space, and how to work in that space. It’s about having a **ubiquitous language** that is used by business users and the development team. This unification of language can be extremely useful when translating the problem concept into functioning software.

At its worst business logic can be very complex. Rules and logic describe many different cases and slants of behavior, and it's this complexity that objects were designed to work with. A Domain Model creates a web of interconnected objects, where each object represents some meaningful individual, whether as large as a corporation or as small as a single line on an order form.

## Entities

An Entity is used to represent or model a part of the system which have an identifier. For example, a person is different than another person because it has a unique Residence ID.

An object entity can have different properties throught its lifetime but it still the same object using the same identifier.

## Value Objects

A Value Object is used to represent or model parts of our system which don't have an identifier. For example, a 50 cents ccoin is equal to another 50 cents coin.

Value objects are identified by their properties. 

If any property (or a value of its attributes) changes then it's not the same object anymore.

It can be used to represent many parts of the system like identifiers, dates, prices, speeds, directions, roles, etc. They become model types, similar to the language native types.

Some characteristiques of Value objects is immutability, pure (no side effects), their state is always valid, encapsulates business rules.

Their goal is to represent a VALUE.

## Entities

An Entity object is identified only by its identifier. An object entity can have different properties throught its lifetime but it still the same object using the same identifier.

