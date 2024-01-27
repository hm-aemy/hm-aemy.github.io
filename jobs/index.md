---
layout: page
title: Jobs
---

{% assign postdoc = site.categories.jobs | where_exp: "post", "post.tags contains 'postdoc'" %}
{% assign phd = site.categories.jobs | where_exp: "post", "post.tags contains 'phd'" %}

{% if postdoc.size != 0 %}
### Postdoc Positions
{% for post in postdoc %}
- [{{ post.title }}]({{ post.url }}){% endfor %}
{% endif %}

{% if phd.size != 0 %}
### PhD Positions
{% for post in phd %}
- [{{ post.title }}]({{ post.url }}){% endfor %}
{% endif %}