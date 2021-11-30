---
layout: blog.njk
post_id: 1
tags: post
title: Wagtail VS WordPress
image: django-wordpress.jpg
image_desc: "Image Credit: http://coderoo.com.au/"
date: 2021-03-15
mins: 5
excerpt: Let's compare some examples of the same features created with both of this Content Management Systems.
status: draft
---

# Adding a custom column to the admin model page.

In this example we are adding a custom field called "Resource category" to the Articles model.

## Django

Add the following code in a file called "wagtail_hooks.py"

```python
class ArticlesAdmin(ModelAdmin):
    model = ArticlePage
    menu_label = 'Articles'
    menu_icon = 'pilcrow'
    menu_order = 100
    add_to_settings_menu = False
    exclude_from_explorer = False
    list_display = ('title', 'resource_category')
    search_fields = ('title',)
```

## WordPress
