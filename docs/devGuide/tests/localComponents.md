{% set title = "Local Components" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Developer Guide - {{ title }}"
  layout: devGuide.md
  pageNav: 2
</frontmatter>

# {{ title }}

## Local Components

This page is for testing local toggles and local tabgroups.

### Local Toggle

Open the widget to toggle this local toggle:

### Local Tab Groups

<cv-tabgroup group-id="localTabGroup">
<cv-tab tab-id="a">
  Alpha
</cv-tab>
<cv-tab tab-id="b">
  Beta
</cv-tab>
<cv-tab tab-id="c">
  Charlie
</cv-tab>
</cv-tabgroup>

### Further Testing

Enable the functionality for dynamic content loads, such as with MarkBind's include panels.
