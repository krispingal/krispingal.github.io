---
layout: page
title: Tags
---

<div class="posts">
  <ul>
    {% for tag in site.tags %}
    <a name="{{ tag[0] }}" ><h3 id="{{ tag[0] }}">{{ tag[0] }}</h3></a>
      <ul>
        {% for post in tag[1] %}
        <li><a href="{{ post.url }}">{{ post.title }}</a></li>
        {% endfor %}
      </ul>
    {% endfor %}
  </ul>
</div>
