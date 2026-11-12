---
layout: page
title: Archived Projects
---

These research projects have ended. Their pages stay online for reference.

{% assign archived = site.pages | where: "status", "archived" | sort: "ended" | reverse %}
{% for project in archived %}
## [{{ project.title }}]({{ project.url | relative_url }})
{% if project.ended %}*Ended {{ project.ended | date: "%B %Y" }}*{% endif %}

{{ project.description | default: project.content | markdownify | strip_html | truncatewords: 50 }}
{% endfor %}
