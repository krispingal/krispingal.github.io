---
layout: page
title: Archives
---

<div class="posts">
  {% for post in site.posts %}
  <h3 style="font-size:20px;">
    <a href="{{ post.url }}">{{ post.title }}</a>
    <span class="archive-date">{{ post.date | date_to_string }}</span>
  </h3>
  {% endfor %}
</div>
