---
layout: page
title: Categories
---

<div class="posts">
  <ul>
    {% for category in site.categories %}
    <a name="{{ category[0] }}" ><h3>{{ category[0] }}</h3></a>
      <ul>
        {% for post in category[1] %}
        <li><a href="{{ post.url }}">{{ post.title }}</a></li>
        {% endfor %}
      </ul>
    {% endfor %}
  </ul>
</div>
