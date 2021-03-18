---
layout: project.njk
tags: project
title: Tough Mudder Bootcamp
client: Tough Mudder
client_desc: Tough Mudder is a lifestyle, events, and media company that participants attempt to obstacle courses.
industry: Sports
company_size: 100
image_small: tough-small.png
image_large: tough-large.png
website: https://tmbootcamp.com/
requirements: [
    "Responsive web design",
    "Flexible UI components",
    "Online class registrations",
    "Large retina images",
]
project_duration: 3 months
description: New website for show casing the fitness workouts classes and locations where users can schedule a free classes.
date: 2018-09-01
type: wordpress
---

## Project Overview
Client needed a content driven website for show casing their fitness classes using very large images. They also needed to connect their classes scheduling service to the website to show the available classes and to allow the users to register to a class.
\
&nbsp;
\
&nbsp;
## The Challenge
Very large images are one of the reasons good performance score is not acheived, so we needed to figure out a way that the performance was not affected by this. 

Another challenge was to connect to the classes scheduling API as the documentation was not so good.
\
&nbsp;
\
&nbsp;
## The Approach & Solution
Webp images were implemented.

Different image sourcesets were implemented so that the correct image size was downloaded for the respective view port.

A middleware was implemented to handle the 3rd party API connection.