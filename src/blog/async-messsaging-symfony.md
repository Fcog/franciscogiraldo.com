---
layout: blog.njk
post_id: 3
tags: post
title: Messaging in Symfony
image: messenger-symfony.png
date: 2022-04-19
mins: 10
excerpt: Run asynchronous code using messages with Symfony
---

This is a summary of the [Messenger course](https://symfonycasts.com/screencast/messenger) by SymfonyCasts.

Code repo: [https://github.com/Fcog/symfony-messenger-component](https://github.com/Fcog/symfony-messenger-component)

## Overview

Symfony's Messenger component gives you a system for designing your code around "message" objects and decoupled "handlers" that do the work.
It also gives you the power to execute code asynchronously via queues and workers!

Messenger is what's known as a "Message Bus"... which is kind of a generic tool that can be used to do a couple of different, but similar design patterns. For example... Messenger can be used as a "Command bus", a "Query bus" or an "Event bus".

### Command Bus Pattern
With a command bus, you separate what you want to happen - called a "command" - from the code that does that work.

![Command Bus Pattern](/assets/images/blog/3/command-bus-pattern.jpg)

### Transport Types
A transport is usually a "queue". A queue is an external system that "holds" onto information in a big list. In our case, it will hold onto serialized message objects. When we send it another message, it adds it to the list. Later, you can read those messages from the queue one-by-one, handle them and, when you're done, the queue will remove it from the list.

![Queue](/assets/images/blog/3/queue.jpg)
![Transport](/assets/images/blog/3/transport.jpg)

There are a bunch of queueing systems available, like RabbitMQ, Amazon SQS, Kafka, and queueing at the supermarket. Out-of-the box, Messenger supports three: amqp - which basically means RabbitMQ, but technically means any system that implements the "AMQP" spec - doctrine and redis. AMQP is the most powerful... but unless you're already a queueing pro and want to do something crazy, these all work exactly the same.

### Worker
A command that "handles" messages from a queue is called a "worker". And the job of a worker is to watch and wait for new messages to be added to the queue and handle them the instant one is added.

``php bin/console messenger:consume -vv``

### Envelope & stamps
When you pass your message to the bus, internally, it gets wrapped inside something called an Envelope.
If you have an Envelope, you can attach extra config to it via stamps.

![Envelope stamps](/assets/images/blog/3/envelope-stamps.jpg)

## The bus & middleware

The bus is nothing more than a collection of "middleware". And each middleware is just a function that receives the message and can do something with it.

![Message bus middleware](/assets/images/blog/3/message-bus-middleware.jpg)

## Event Bus Pattern 

The second type of message is an "event". An event is dispatched after something happens and can have zero to many handlers. 
If you have a command handler like SaveRegisteredUser, it's supposed to only perform its principle task: it should save the registered user to the database. If you follow this practice, it should not do "secondary" tasks, like emailing the user or setting them up in a CRM system. Instead, it should perform the main task and then dispatch an event, like UserWasRegistered. Then, we would have two handlers for that event: one that sends the email and one that sets up the user in the CRM. The command handler performs the main "action" and the event helps other parts of the system "react" to that action.

![Event bus pattern](/assets/images/blog/3/event.jpg)

## Query Bus Pattern

A query bus is the opposite. Instead of commanding the bus to do work, the point of a query is to get information back from the handler. 
If you're using the query bus pattern, instead of getting that info directly, you'll dispatch a query.

## AMQP with RabbitMQ
But the industry standard "queueing system" or "message broker" is not a database table, it's something called AMQP, or "Advanced Message Queuing Protocol". AMQP is... not itself a technology... it's a "standard" for how a, so-called, "message broker system" should work. 

The easiest way to spin up a RabbitMQ instance is via cloudamqp.com: an awesome service for cloud-based RabbitMQ.

``sudo apt-get install php-amqp``

### RabbitMQ Exchanges

The key difference between the Doctrine transport type and AMQP is that with AMQP you do not send a message directly to a queue.

In RabbitMQ, you send messages to an exchange. Then, that exchange will have some config that routes that message to a specific queue... or possibly multiple queues. The "Bindings" represents that config.

We send a message to an exchange and it forwards it to one or more queues based on some internal rules.

![RabbitMQ exchange](/assets/images/blog/3/rabbitmq-exchange.jpg)

### Messenger commands

php bin/console messenger:consume -vv

php bin/console messenger

php bin/console debug:messenger

php bin/console messenger:consume

php bin/console config:dump framework messenger

php bin/console debug:config framework messenger

php bin/console debug:container --show-arguments debug.traced.messenger.bus.default.inner