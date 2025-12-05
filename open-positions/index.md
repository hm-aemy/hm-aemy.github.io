---
layout: page
title: Open Positions
---

{% assign staff = site.categories.open-positions | where_exp: "post", "post.tags contains 'staff'" %}
{% assign theses_ma = site.categories.open-positions | where_exp: "post", "post.tags contains 'master'" %}
{% assign theses_ba = site.categories.open-positions | where_exp: "post", "post.tags contains 'bachelor'" %}
{% assign student_assistant = site.categories.open-positions | where_exp: "post", "post.tags contains 'student-assistant'" %}

{% if staff.size != 0 %}
## Research Staff Positions
{% for post in staff %}
- [{{ post.title }}]({{ post.url }})
{% endfor %}
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

{% if student_assistant.size != 0 %}
## Student Assistant Jobs
{% for post in student_assistant %}
- [{{ post.title }}]({{ post.url }}){% endfor %}
{% endif %}