This repository is my blog souurce. I am using [Hugo][hugo] to generate my static site. 

Here are some commands that I use, when writing articles

## Admin area

### Hugo related

**To create new article**: `hugo new content content/articles/[article-name.md]` 
**To start the server**: `hugo server --noHTTPCache`

## Shortcodes for templating

- **sidenotes**: {{< sidenote id="1" label="sidenote text" content="sidenote content." >}}
- **figure**: {{< figure src="[image-name.format]" alt="[Alt text]" title="[Title] loading="lazy" >}} - there are other options here, it is best practice to provide height and width as well.