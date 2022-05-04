---
layout: project.njk
tags: project
title: Clasificados El País
client: El País
client_desc: El País is the biggest regional newspaper company in Colombia.
industry: Classifieds
company_size: 400
image_small: clasificados-elpais-small.jpg
image_large: clasificados-elpais-large.jpg
website: https://clasificados.elpais.com.co/
project_duration: 1 year
description: High traffic classified ads web application about real State, vehicules, jobs and miscellaneous products.
date: 2015-01-01
type: symfony
---

## Project Overview
When working at El Pais S.A., I was in the team assigned to modernize the Classifieds web application written with the Symfony PHP framework. This web app is one of the most important and used online ads portal in the southwestern region of Colombia.

## Main Objective

Improve the User Experience and User Interface of all the user facing pages. Including the homepage, the search page, the ads uploading form, and the ads detail page.


## Challenge

The project had high code complexity. The app was initially created as a generic ads system so the Backend and the Frontend codebase was huge with many modules. 

The system was created by an external company so none of the internal Developers could support or guide us. 

And Extra care was needed so no new bugs were introduced.

### Main epics: 

#### Change the User Interface of the Ads detail page.

New modern elements were added: 
- New images slider with thumbnails
- Collapsible sections
- Modern icons

![Product detail page](/assets/images/project/el-pais-product-detail.jpg)

Visit: [https://clasificados.elpais.com.co/](https://clasificados.elpais.com.co/)

#### Improve the User Experience of the Ads Search Page.

The Search Page UX was improved with many modern elements like: 

- intuituve filtering widgets 
- Image slides to each of the individual search results
- List and Grid views on the results section
- An ads comparaison new feature

![Filters](/assets/images/project/el-pais-search-page.jpg)

Visit: [https://fincaraiz.elpais.com.co/avisos/venta/casas](https://fincaraiz.elpais.com.co/avisos/venta/casas)

#### Improve the User Experience when a user uploads an Ad.

The old multi-step form to upload an Ad was replaced with a single intuitive and easy to use form with collapsible sections with an accordion effect. 


![Ad uploading](/assets/images/project/el-pais-upload.jpg)

Visit: [https://fincaraiz.elpais.com.co/publicarAviso/avisoWeb](https://fincaraiz.elpais.com.co/publicarAviso/avisoWeb)


## The Approach & Solution

The design HTML and CSS was handed to us by the design team and we decomposed it into reusable UI components. 

Integration tests were written before starting to change any code.

Each of the epics functionalities was thoroughly tested manually by the product owner on the Staging site.