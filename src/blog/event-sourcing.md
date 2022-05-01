---
layout: blog.njk
post_id: 11
tags: post
title: Event sourcing
image: 
date: 2022-05-01
mins: 2
excerpt: What is event sourcing
post_tags: ['Arquitecture']
---

Notes taken from the [Event Sourcery Youtaube channel](https://www.youtube.com/watch?v=FIQyJrxkS3M).

## What is event sourcing?

![Event sourcing](/assets/images/blog/11/event-sourcing.jpg)

Event sourcing is the practice of building application state from only domain events.

![Object life cycle](/assets/images/blog/11/object-life-cycle.jpg)

Every interaction with an object triggers an event. Each event contain individual information from the object state.

## Flow

1. Check business rules (called Invariants)
2. Event is raised
3. Event is applied
4. Update object state accordingly

## Persistance (Event Store)

The events information is persisted. Not the object representation per se. All the events state form the whole object state.

![persistance](/assets/images/blog/11/event-persistance.jpg)

## Benefits

- All the object instance history is persisted. No data is overwritten (Immutable). (No update SQL statements).
- Data can be queried on a give time range. (Like having a timemachine)
- The system flow is similar to the real business flow. It reflects the ideas of the business.
- The real world is event driven, so it's easier to create a system using events.

## When to use

![persistance](/assets/images/blog/11/when-to-use.jpg)