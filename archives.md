---
layout: page
title: Archives
---

<div class="posts">
  <ul>
    {% for post in site.posts %}
      <li>
        <h3 style="font-size:20px;">
			<a href="{{ post.url }}">{{ post.title }}</a>
			<span class="pull-right">{{ post.date | date_to_string }}</span>
		</h3>
      </li>
    {% endfor %}
  </ul>
</div>
