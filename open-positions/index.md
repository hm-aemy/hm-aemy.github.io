---
layout: page
title: Open Positions
---

{% assign postdoc = site.categories.open-positions | where_exp: "post", "post.tags contains 'postdoc'" %}
{% assign phd = site.categories.open-positions | where_exp: "post", "post.tags contains 'phd'" %}
{% assign theses_ma = site.categories.open-positions | where_exp: "post", "post.tags contains 'master'" %}
{% assign theses_ba = site.categories.open-positions | where_exp: "post", "post.tags contains 'bachelor'" %}

{% if postdoc.size != 0 or phd.size != 0 %}
## Jobs
{% endif %}

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

{% if theses_ba.size != 0 or theses_ma.size != 0 %}
## Theses
{% endif %}

{% if theses_ma.size != 0 %}
### Master's Theses
{% for post in theses_ma %}
- [{{ post.title }}]({{ post.url }}){% endfor %}
{% endif %}

{% if theses_ba.size != 0 %}
### Bachelor's Theses
{% for post in theses_ba %}
- [{{ post.title }}]({{ post.url }}){% endfor %}
{% endif %}