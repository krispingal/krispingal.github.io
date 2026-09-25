# Minimal

A minimal Hugo theme for a personal blog. Nav, social links, section, fonts and comments are all driven from the site config.

Requires Hugo 0.158.0 or later (see `module.hugoVersion` in `hugo.toml`).

## Installation

Put the theme in `themes/minimal` and set `theme = 'minimal'` in your site config.

## Configuration

Example site `hugo.toml`:

```toml
baseURL = 'https://example.org/'
locale = 'en-us'
title = 'My site'
theme = 'minimal'

[params]
  description = "Site description (meta tag and fallback)."
  mainSection = "articles"      # section listed on the home page; all pages if unset
  startYear = 2016              # footer "© 2016 – <current year>"; omit to show only the current year
  googleFontsURL = "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600&display=swap"  # optional; UI labels only
  math = false                  # true (or per page) loads the math partial

  # JSON-LD author/publisher
  author = "Your Name"
  authorUrl = "about"
  authorImage = "about/images/portrait.webp"
  logo = "/favicon-32x32.png"

  [[params.social]]             # footer icons, in order
    name = "github"             # github | linkedin | email | rss
    label = "GitHub"            # aria-label, defaults to the title-cased name
    url = "https://github.com/you"

  [params.giscus]               # optional; comments are off without repo
    repo = "you/repo"
    repoID = "..."
    category = "Announcements"
    categoryID = "..."

[[menus.main]]                  # header navigation
  name = "About"
  pageRef = "/about"
  weight = 10
```

Optional per-page front matter: `description`, `categories` (first one is shown as the category label), `tags`, `disable_comments` and `math`.

## Layouts

- `single.html`: article layout (category, title, related posts, comments)
- `home.html`: index of `mainSection`: latest post featured, next six as title, description, category and date, then a link to the section
- `list.html`: plain dated list; `articles/list.html`: `articles` section as a year-grouped dated list
- `taxonomy.html`: categories and tags overviews (each term with its latest three posts)
- `term.html`: a category or tag page, using the same dated list
- `_default/card-related.html`: card view for related posts (`.Render "card-related"`)

## Shortcodes

`fancy-img`, `sidenote`, `video`.

## Assets

CSS lives in `assets/css` (`base`, `layout`, `components/*`) and is concatenated in the order listed in `layouts/_partials/head/css.html`. Colours are custom properties in `:root` (`base.css`).
