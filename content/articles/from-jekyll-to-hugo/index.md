+++
date = '2024-11-10T13:22:53-06:00'
draft = false
title = 'From Jekyll to Hugo'
description = 'What makes a developer leave behind a well-loved tool for something new? Dive into the motivations, discoveries, and lessons learned in the shift from Jekyll to Hugo — and uncover the secrets to crafting a custom theme.'
keywords = ['static site generator', 'hugo static site generator']
images = ['hugo-logo-wide.svg']
tags = ['golang', 'web development']
categories = ['ppl']
math = true
+++
{{< figure src="hugo-logo-wide.svg" alt="Hugo logo" height="250px" width="300px" loading="lazy" >}}

I recently moved my blog from [Jekyll][jekyll], a Ruby-based static site generator, to [Hugo][hugo], a popular alternative built in Golang. In this article, I’ll walk through the rationale behind this migration, share the steps I took, and include a few custom code snippets I created along the way. This is not intended as a tutorial on setting up a blog with Hugo — there are plenty of excellent videos and documentation on [Hugo’s site][Hugo docs URL] for that. Instead, I’ll focus on my experience, insights, and the lessons learned that may be helpful for anyone considering a similar transition. 

You could find an older version of my site at [archive][archive].

<!--more-->

## Why I Chose to Migrate from Jekyll to Hugo
To provide a bit of background, I’d previously used Pelican and Jekyll as static site generators. With Pelican, I created my own theme, which gave me a lot of flexibility in structuring my site. However, poor design choices on my part made the site look a bit janky — both visually and in terms of the HTML/CSS structure. Eventually, I decided to move to Jekyll, where I found a theme I liked and was much happier with the blog’s overall look. The migration to Jekyll was very smooth, thanks to its excellent documentation. For users working with a theme, setup is straightforward.

After some time, though, I encountered a few limitations. Jekyll offers a variety of plugins, but on GitHub Pages, I could only use a limited set due to deployment restrictions[^1], though there are ways to get around this[^2]. Hugo, on the other hand, provides many features out of the box, such as content organization, YouTube embedding, and figure rendering. It also includes a robust asset pipeline, with a built-in set of processing functions.

Another deciding factor was Jekyll’s reliance on Ruby, which I only used for this project and found challenging to maintain and upgrade. Hugo, built on Golang — a language I use regularly for other projects — would streamline my workflow by eliminating the need for a separate language dependency just for my blog. Additionally, it seemed that Hugo’s active development and frequent updates would make it a more future-proof option.

---

## The Migration Process
The migration process from Jekyll to Hugo is fairly straightforward. Although [migration scripts][jekyll_migration] are available, I only had a few posts, so I moved them manually. During this process, I added some additional elements to the front matter, including dates (which Jekyll inferred from filenames), keywords, tags, images, and descriptions for OpenGraph — all helping improve SEO and social media visibility.

For the theme, I decided to create a custom design, as I couldn’t find an existing theme that aligned with my vision. I prefer a simple, distraction-free theme that keeps the reader’s focus on the content without unnecessary features that would bloat the site. Additionally, I wanted a few unique features, such as alternative comment solutions, which aren’t offered out of the box in most themes. Building my own theme also allows me to take advantage of Hugo’s latest features as they are released, ensuring that my site remains flexible and future-proof.

### Building My Own Theme
For inspiration, I referenced the layout of my previous Pelican site. Hugo’s documentation, while extensive, can be challenging in some areas. Since I needed to understand many components to create a custom theme, I watched a few YouTube tutorials ([Luke Smith's tutorial][luke_smith] and [giraffe academy video tutorial playlist][giraffe_academy]), which helped clarify the structure, making the documentation much easier to navigate.

In designing the HTML layout, I used [Who Can Use][whocanuse] to plan an accessible color scheme, and for CSS styling, I relied on [CSS-Tricks][css_tricks] and some code from [Sam van der Heijden][samvdh] specifically for styling [links][samvdh_codepen]. My goal was to create flexible layouts for different needs. For instance, my About page uses a two-column layout (column-left and column-right), while other pages use a single container for the content. I also wanted the option to expand layouts for potential future pages, like a "Projects" page. Hugo’s streamlined approach, with single and list templates, makes it easy to define different layouts, which I found more efficient than Jekyll’s approach to list-type pages.

---

## New Features and Improvements in Hugo
After moving the content, Hugo rendered my existing posts without any issues. I tested my theme with a sample post that included all the key features I wanted. Once the CSS and styling met my standards, the migration was essentially complete. However, a migration shouldn’t just be about replicating the previous platform on a new one — it’s a chance to utilize the unique strengths of the new platform. So, what Hugo features stood out to me? Right away, I appreciated Hugo’s shortcodes and render hooks.

### Render Hooks
Render hooks allow Hugo’s Markdown parser (Goldmark) to process and render content in a customized way. For example, if you want to style all images across your site by wrapping them in a div element with specific classes, render hooks make this possible. Render hooks use Hugo’s templating language to stylize content without having to write repetitive HTML code each time.

In my case, I used render hooks to automatically generate permalinks for anchor links:
```html
<h{{ .Level }} id="{{ .Anchor | safeURL }}">
  {{ .Text }}
  <a class="anchor" href="#{{ .Anchor | safeURL }}" aria-label="Link to section - {{ .Text }}">#</a>
</h{{ .Level }}>
```

### Shortcodes
Shortcodes offer similar templating flexibility but differ in their use and control. While render hooks are automatically invoked by the parser when it encounters certain Markdown elements (like inline code wrapped in backticks), shortcodes allow the content writer to decide when and how to render specific elements. As the writer, you can pass arguments to shortcodes, determining exactly how they should be rendered to HTML. This is particularly useful for custom elements like embedded media or complex layouts, as it reduces code duplication and allows for greater flexibility in content styling.

In Jekyll, I used Liquid templates to render figures. Hugo, in its newer versions, includes several useful shortcodes out of the box for embedding YouTube videos, Instagram images, and figures. I also created custom shortcodes to display my profile picture on the About page and for adding sidenotes.

My {{< sidenote id="1" label="sidenotes" content="Speaking of sidenotes in web pages Gwern has an <a href=\"https://gwern.net/sidenote\">article</a>:  that has an in-depth discussion and compares multiple implementations." >}} were based off of [Koos Looijesteijn's implementation][kooslooijesteijn]. For me, sidenotes are a step up from traditional footnotes, allowing room for tangential details — something I enjoy including! Here’s the shortcode I used for sidenotes, which requires CSS available in Koos Looijesteijn's [github repository][sidenotes_repo].

```html
<span class="sidenote">
  <input
    aria-label="Show sidenote"
    type="checkbox"
    id="sidenote__checkbox--{{ $id }}"
    class="sidenote__checkbox">
  <label
    tabindex="0"
    title="Sidenote content"
    aria-describedby="sidenote-{{ $id }}"
    for="sidenote__checkbox--{{ $id }}"
    class="sidenote__button sidenote__button--number-{{ $id }}
  "> {{- with $.Get "label" }}
        {{ . }}
      {{- else }}
        {{- errorf "The %q shortcode requires a 'label' argument. See %s" .Name .Position }}
      {{- end }}
</label>
  <small
    id="sidenote-{{ $id }}"
    class="sidenote__content sidenote__content--number-{{ $id }}">
    <span class="sidenote__content-parenthesis
    "> (sidenote: </span>
    {{- with $.Get "content" }}
      {{ . | safeHTML }}
    {{- else }}
      {{- errorf "The %q shortcode requires a 'content' argument. See %s" .Name .Position }}
    {{- end }}
    <span class="sidenote__content-parenthesis">)</span>
  </small>
</span>
```

### Katex
I also switched from using MathJax to \\( \KaTeX \\) for typesetting math equations on my site. [KaTeX][katex], developed by Khan Academy, is a fast, lightweight alternative for rendering math on the web. Newer versions of MathJax have grown in size, with even the smallest minified version around 800KB, which can slow down page loading times. While neither KaTeX nor MathJax come bundled with Jekyll or Hugo, adding KaTeX was straightforward and made a noticeable difference in page performance.

---

## Features I Left Behind
This section will be brief, as I only dropped two features when moving my blog from Jekyll to Hugo: Google Analytics and Disqus. While Hugo supports both of these natively — just a matter of adding a line to include the template and configuring settings in hugo.toml — I chose not to include them. I wasn’t actively using Google Analytics, and I often see Disqus blocked by my own browser extension. Rather than subject readers to tools I had privacy concerns about, I opted to leave them out.

On the topic of comments, I’m considering [Cusdis][cusdis] as a privacy-friendly alternative to Disqus. It seems to align better with my use case and may be something I add to the site down the road.

---

## Final Thoughts and Recommendations
Overall, I’m satisfied with the new look of my blog. Through this migration, I had the chance to learn — and relearn — a fair amount about HTML5 and CSS. While parts of the journey were frustrating, I’m happy with where I ended up. There are still a few more features I’d like to add over time, but the heavy lifting is done.

For anyone considering Jekyll or Hugo, here are my thoughts: if you’re happy with Jekyll or just starting out, Jekyll is still one of the easiest ways to create a static blog. Both Jekyll and Hugo are powerful static site generators that can bring your ideas to life. You can build your site locally with any plugins you need and then push the rendered static site to GitHub or another hosting service — and that’s it. However, if you’d prefer not to work with Ruby, or if you’re already familiar with Go, or if you have specific ideas for rendering components, Hugo could be a great fit. Hugo is ideal if you like to get your hands dirty with custom configurations.

In the end, whether you go with Jekyll, Hugo, or another tool, remember that the true value of your blog is in the content itself, not in the tools you use to build it.

[^1]: https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll#plugins
[^2]: You can build locally and push the generated assets onto github page to circumvent this though. See more about this [here.](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll#building-your-site-locally)

[jekyll]: https://jekyllrb.com/
[hugo]: https://gohugo.io/
[archive]: https://web.archive.org/web/20200917235453/https://krispingal.github.io/
[Hugo docs URL]: https://gohugo.io/documentation/
[jekyll_migration]: https://gohugo.io/tools/migrations/#jekyll
[whocanuse]: https://www.whocanuse.com
[css_tricks]: https://css-tricks.com
[samvdh]: https://samvdh.nl/
[kooslooijesteijn]: https://www.kooslooijesteijn.net/blog/sidenotes-without-js
[sidenotes_repo]: https://github.com/kslstn/sidenotes
[cusdis]: https://cusdis.com/
[giraffe_academy]: https://www.youtube.com/playlist?list=PLLAZ4kZ9dFpOnyRlyS-liKL5ReHDcj4G3
[luke_smith]: https://www.youtube.com/watch?v=ZFL09qhKi5I
[katex]: https://katex.org
[samvdh_codepen]: https://codepen.io/samvdh/pen/MmZzyR
