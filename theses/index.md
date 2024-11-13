---
layout: page
title: Theses
---

{% assign ma = site.categories.jobs | where_exp: "post", "post.tags contains 'ma'" %}
{% assign ba = site.categories.jobs | where_exp: "post", "post.tags contains 'ba'" %}

{% if ma.size != 0 %}
### Master Theses
{% for post in ma %}
- [{{ post.title }}]({{ post.url }}){% endfor %}
{% endif %}

{% if ba.size != 0 %}
### Bachelor Theses
{% for post in ba %}
- [{{ post.title }}]({{ post.url }}){% endfor %}
{% endif %}
