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

This are the main concepts behind DDD:

## Entities

An Entity is used to represent or model a part of the system which ***have an identifier***. For example, a person is different than another person because it has a unique Residence ID.

An object entity can have ***different properties*** throught its lifetime but it still the same object using the same identifier.

## Value Objects

A Value Object is used to represent or model parts of our system which ***don't have an identifier***. For example, a 50 cents ccoin is equal to another 50 cents coin.

Value objects are ***identified by their properties***. 

If any property (or a value of its attributes) changes then it's not the same object anymore.

It can be used to represent many parts of the system like identifiers, dates, prices, speeds, directions, roles, etc. They become model types, similar to the language native types.

Some characteristiques of Value objects is immutability, pure (no side effects), their state is always valid, encapsulates business rules.

Their goal is to represent a VALUE.

## Aggregates 

An aggregate is an ***encapsulation of entities and value objects*** (domain objects) which conceptually belong together. It also contains a set of operations which those domain objects can be operated on.

As a concrete example, an aggregate might be a Car, where the encapsulated domain objects might be Engine, Wheels, BodyColour and Lights; similarly in the context of manufacturing a car, operations might be: PaintBody, InstallWheel, InstallEngine and InstallLight and Ship. Your business rules might be:

- A ready to ship car must have exactly 4 wheels
- No yellow cars are manufactured
- Lights must be installed after car body is painted
- A ready to ship car must have exactly 16 lights
- A ready to ship car must have an engine and a painted body

Aggregates are the basic element of transfer of data storage — you request to load or save whole aggregates. Transactions should not cross aggregate boundaries.

— Martin Fowler

In this example, when you retrieve a Car object from your persistence layer, you must retrieve its Engine, Lights, Wheels and BodyColour. Similarly, when you save, you must also save those properties.

Aggregates are fundamentally about defining consistency boundaries and enforcing invariants.

Consistency boundary is the boundary which the aggregate defines. In a bigger context of vehicle manufacturing, Car keeps the rules of manufacturing of cars consistent. Invariants is just a fancy word for rules. It enforces those rules by keeping the Car object consistent. 

In general, a set of well defined aggregates cover the entirety of your persistence layer. This means that there is a single source of truth for what the business rules are.