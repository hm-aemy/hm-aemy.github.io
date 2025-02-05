---
layout: page
title: Open Positions
---

{% assign postdoc = site.categories.open-positions | where_exp: "post", "post.tags contains 'postdoc'" %}
{% assign phd = site.categories.open-positions | where_exp: "post", "post.tags contains 'phd'" %}

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
