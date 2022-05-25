---
layout: blog.njk
post_id: 13
tags: post
title: SOLID principles
image: 
date: 2022-05-16
mins: 10
excerpt: List of principles to code better
post_tags: ['OOP']
---

Summary based on the [SOLID course](https://symfonycasts.com/screencast/solid) from SymfonyCasts.

# SOLID Principles

This principles are a guideline to create better structured code which is easier to add or modify features. But is only that: a guideline. Do your best to write simple code and don't over think it.

- Single-Responsability Principle

Write classes so that your code fits in your head.

- Open-closed Principle

Design your classes so that you can change their behaviour without changing their code.

- Liskov Substitution Principle

If a class extends a base class or implements an interface make your class behave like it's supposed to.

-  Interface Segregation Principle

If a class has a large interface (a lot of methods) and you often inject the class and only use some of this methods, consider splitting your class into smaller pieces.

- Dependency-inversion Principle

Prefer type-hinting interfaces and allow each interface to be designed for the high level class that will use it.

## Single-Responsability Principle

### Definition

A module should have only one reason to change.

### Explanation

A function or class should be responsible for only 1 task (or responsibility)

Gather together the things that change for the same reason. And separate things that change for different reasons.

Think of all the different reasons that this class might change. What is the probability that something changes?

When there's a new feature in the system, only 1 class will have to be changed.

The objective is to create classes reusable so they can be used in different contexts. 

Cohesion: Keep things together that are related.

Keep only related things together.

"Write simple code using the heuristic that it "Fits In My Head"" *Dan North*

If the code is confusing you should move it to a new class, method or function. But don't create to many small classes because that won't also "Fit in your head".

## Open-Closed Principle

### Definition

A module should be open for extension, but closed for modification.

### Explanation

You should be able to change what a class does, without changing its code.

Imagine the future changes you will most likely need to make... then design the class to allow these changes without needing to modify the class itself.

Use Design Patterns to acheive this:

- Strategy pattern
- Template Method Pattern

### Takeaways

A system can't be 100% OCP compliant. An unexpected change will eventually make you change the code.

## Liskov Substitution Principle

### Definition

Subtypes must be substituable for their base types.

### Explanation

A subtype is a class that extends a base class or implements an interface.

You should be able to subsitute a class for a sub-class without breaking your app.

Rules:

1. You cannot change the type of an overriden property (protected).

2. You cannot narrow the type of an argument by setting something more specific. But you can widen it by passing a new type (an extended class ie) that supports the initial type (Less specific).

3. You cannot widen the return type of a method. But you can make it more specific.

4. Follow your parent type's rules on when & why to throw exceptions.

The first 3 are impossible to violate with PHP as they will throw a syntax error.

With the 4th one you can prevent this by adding a PHPDOC with the exception on the interfaces or parent method.

Tip:

You can use this principle to add a new feature to an already existing class without modifying it. Just extend the class and override a method, call the parent method and then add the new code.
With Symfony you can tell the Container to use the extended class instead of the base one.

##  Interface Segregation Principle

### Definition

Clients should not be forced to depend on interfaces they do not use.

### Explanation

In the definition, interfaces are not refering to a literal interface but to the abstract concept of an interface, which generally means the public methods of a class.

A class shouldn't be required to have a method that don't need just because it is set in an Interface. You should segragate the interface into smaller interfaces to be able to use them when appropiate.

### Benefits

1. Having smaller interfaces helps on having smaller classes with a more specific task that fits its purpose.

2. If you notice that a class only calls 1 or 2 methods from another class and not the other methods, then it's a sign that the other class has many responsibilities.

3. It keeps the dependecies lighter. So when you're using a class the app won't need to instantiate to many things that will not use.

## Dependency Inversion Principle

### Definition

High level modules should not depend on low level modules. Both should depend on abstractions.

Abstractions should not depend on details. Details should depend on abstractions.

### Explanation

Classes should depend on interfaces instead of concrete classes.

An interface should be designed by the class that will use it (the high level class), not by the classes that will implement it (the low level class).

There is an inversion of control, the high level class is now in charge and tell the low level class, or dependeny, what methods needs to implement.

### Benefits

It decouples the dependencies.

Helpful in open source code or shared code.

### Drawbacks

Not all dependencies need to be inverted. It only is worth when there might be multiple ways of implementing the low level class.

There is no need to create an interface that is only implement by one class. You won't need this flexibility and it's more difficuly to follow or understand.
